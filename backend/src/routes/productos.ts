import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";
import { verifyToken, blockModerator } from "../middleware/roleMiddleware.js"; // ✅ NUEVO
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Guardar en backend/uploads (mismo directorio que usa express.static en index.ts)
const uploadDir = path.join(__dirname, "../../uploads");
// Asegurar que exista la carpeta de uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
  filename: (_req: any, file: any, cb: any) => {
    const safe = String(file.originalname).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });

type ProductoRow = RowDataPacket & {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  urlFoto: string | null;
};

type CountRow = RowDataPacket & { total: number };

const r = Router();

/* =============================
   � GET /categorias → listar categorías activas
   ============================= */
r.get("/categorias", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      // La tabla de categorías puede usar la columna 'estado' (valor 'ACTIVA').
      // Consultamos por esa columna para mayor compatibilidad con la base de datos actual.
      "SELECT id, nombre FROM CATEGORIAS WHERE estado = 'ACTIVA' ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/* =============================
   �📦 GET /productos → listar productos
   ============================= */
r.get("/", async (req: Request, res: Response) => {
  try {
    const { q, categoria, minPrecio, maxPrecio, page = "1", pageSize = "12" } =
      req.query as Record<string, string>;
    const p = Number(page);
    const ps = Number(pageSize);

    const where: string[] = [
      "(PUBLICACIONES.estado IS NULL OR PUBLICACIONES.estado='PUBLICADA')",
      "PUBLICACIONES.disponibilidad = 1",
    ];
    const args: any[] = [];

    if (q) {
      where.push("(PUBLICACIONES.nombre LIKE ? OR PUBLICACIONES.descripcion LIKE ?)");
      args.push(`%${q}%`, `%${q}%`);
    }
    if (categoria) {
      where.push("CATEGORIAS.nombre = ?");
      args.push(categoria);
    }
    if (minPrecio) {
      where.push("PUBLICACIONES.precio >= ?");
      args.push(Number(minPrecio));
    }
    if (maxPrecio) {
      where.push("PUBLICACIONES.precio <= ?");
      args.push(Number(maxPrecio));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [items] = await pool.query<ProductoRow[]>(
      `SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,
              PUBLICACIONES.ubicacion, CATEGORIAS.nombre AS categoria, f.urlFoto
       FROM PUBLICACIONES
       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId
       LEFT JOIN fotos_publicacion f ON f.publicacionId = PUBLICACIONES.id AND f.orden = 1
       ${whereSql}
       ORDER BY PUBLICACIONES.fechaPublicacion DESC
       LIMIT ? OFFSET ?`,
      [...args, ps, (p - 1) * ps]
    );

    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) as total
       FROM PUBLICACIONES
       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId
       ${whereSql}`,
      args
    );

    res.json({
      items,
      total: countRows[0]?.total ?? 0,
      page: p,
      pageSize: ps,
    });
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/* =============================
   🛒 GET /productos/:id → obtener un producto
   ============================= */
r.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Obtener información básica del producto
    const [productRows] = await pool.query<ProductoRow[]>(
      `SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,
              PUBLICACIONES.ubicacion, CATEGORIAS.nombre AS categoria, f.urlFoto
       FROM PUBLICACIONES
       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId
       LEFT JOIN fotos_publicacion f ON f.publicacionId = PUBLICACIONES.id AND f.orden = 1
       WHERE PUBLICACIONES.id = ? 
         AND (PUBLICACIONES.estado IS NULL OR PUBLICACIONES.estado = 'PUBLICADA')
       LIMIT 1`,
      [id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Obtener todas las imágenes del producto
    const [imageRows] = await pool.query<RowDataPacket[]>(
      `SELECT urlFoto, orden FROM fotos_publicacion 
       WHERE publicacionId = ? 
       ORDER BY orden ASC`,
      [id]
    );

    const product = productRows[0];
    const imagenes = imageRows.map(row => row.urlFoto);

    // Agregar las imágenes al producto
    const productWithImages = {
      ...product,
      imagenes: imagenes.length > 0 ? imagenes : (product.urlFoto ? [product.urlFoto] : [])
    };

    res.json(productWithImages);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/* =============================
   ✅ NUEVO: POST /productos → crear producto
   Solo VENDEDORES pueden crear productos (NO moderadores)
   ============================= */
r.post("/", verifyToken, blockModerator, upload.array("images", 5), async (req: Request, res: Response) => {
  try {
    // 🔍 DEBUG: Ver qué llegó al servidor
    console.log('=== POST /productos DEBUG ===');
    console.log('Body:', req.body);
    console.log('Files:', (req as any).files);
    console.log('Usuario:', (req as any).user?.id);

    // En multipart, los campos vienen en req.body y los archivos en req.files
    const { nombre, descripcion, precio, ubicacion, categoriaId, categoria } = req.body as any;
    const usuarioId = (req as any).user?.id;

    // Validaciones mínimas
    if (!nombre || !precio) {
      return res.status(400).json({ message: "Faltan campos requeridos: nombre, precio" });
    }

    // Resolver categoriaId a partir de nombre si es necesario
    let finalCategoriaId = categoriaId;
    if (!finalCategoriaId && categoria) {
      // Buscar categoría por nombre (case-insensitive)
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM CATEGORIAS WHERE LOWER(nombre)=LOWER(?) LIMIT 1",
        [categoria]
      );
      if (rows.length > 0) {
        finalCategoriaId = (rows[0] as any).id;
      } else {
        // Insertar nueva categoría
        const [insertCat] = await pool.query(
          "INSERT INTO CATEGORIAS (nombre, descripcion, estado, fecha_creacion) VALUES (?, '', 'ACTIVA', NOW())",
          [categoria]
        );
        finalCategoriaId = (insertCat as any).insertId;
        console.log(`📁 Nueva categoría creada: ${categoria} (ID: ${finalCategoriaId})`);
      }
    }

    // Si no se proporcionó ubicacion, usar la direccion del vendedor
    let finalUbicacion = ubicacion;
    if (!finalUbicacion) {
      const [uRows] = await pool.query<RowDataPacket[]>(
        "SELECT direccion FROM USUARIOS WHERE id = ? LIMIT 1",
        [usuarioId]
      );
      if (uRows.length > 0) {
        finalUbicacion = (uRows[0] as any).direccion || null;
      }
    }

    // Crear la publicación con estado PENDIENTE
    const [result] = await pool.query(
      `INSERT INTO PUBLICACIONES (nombre, descripcion, precio, ubicacion, categoriaId, usuarioId, estado, fechaPublicacion)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())`,
      [nombre, descripcion, precio, finalUbicacion, finalCategoriaId, usuarioId]
    );

    const publicacionId = (result as any).insertId;
    console.log(`📦 Publicación insertada con ID: ${publicacionId}`);

    // Si se subieron imágenes, guardarlas en la tabla fotos_publicacion
    const files = (req as any).files as any[] | undefined;
    let imagenesGuardadas = 0;
    
    if (files && files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      console.log(`📸 Procesando ${files.length} imagen(es)...`);
      
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const urlFoto = `${baseUrl}/uploads/${f.filename}`;
        try {
          await pool.query(
            "INSERT INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES (?, ?, ?)",
            [publicacionId, urlFoto, i + 1]
          );
          imagenesGuardadas++;
          console.log(`  ✅ Imagen ${i + 1} guardada: ${f.filename}`);
        } catch (e) {
          console.error(`  ❌ Error insertando imagen ${i + 1}:`, e);
        }
      }
      console.log(`✅ ${imagenesGuardadas}/${files.length} imágenes guardadas correctamente`);
    } else {
      console.log('ℹ️ No se subieron imágenes con esta publicación');
    }

    console.log(`✅ Nueva publicación creada: ${publicacionId} por vendedor ${usuarioId}`);

    res.status(201).json({
      message: "Publicación creada exitosamente. Pendiente de aprobación",
      publicacionId,
      imagenesGuardadas
    });
  } catch (error: any) {
    console.error("❌ Error al crear publicación:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default r;
