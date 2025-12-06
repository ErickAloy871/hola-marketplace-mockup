import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";
import { verifyToken, blockModerator } from "../middleware/roleMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateProduct, getValidationMessage } from "../utils/productValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

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
  tipo: string;
  urlFoto: string | null;
};

type CountRow = RowDataPacket & { total: number };

const r = Router();

r.get("/categorias", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, nombre FROM CATEGORIAS WHERE estado = 'ACTIVA' ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorias:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.get("/", async (req: Request, res: Response) => {
  try {
    const { q, categoria, tipo, minPrecio, maxPrecio, ordenar, page = "1", pageSize = "12" } =
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
    if (tipo) {
      where.push("PUBLICACIONES.tipo = ?");
      args.push(tipo);
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

    // Determinar ordenamiento
    let orderBy = "PUBLICACIONES.fechaPublicacion DESC"; // Por defecto "New"
    
    if (ordenar === "precio_asc") {
      orderBy = "PUBLICACIONES.precio ASC";
    } else if (ordenar === "precio_desc") {
      orderBy = "PUBLICACIONES.precio DESC";
    } else if (ordenar === "rating") {
      orderBy = "PUBLICACIONES.puntuacionCalidad DESC, PUBLICACIONES.fechaPublicacion DESC";
    }

    const [items] = await pool.query<ProductoRow[]>(
      `SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,
              PUBLICACIONES.ubicacion, PUBLICACIONES.tipo, CATEGORIAS.nombre AS categoria, f.urlFoto
       FROM PUBLICACIONES
       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId
       LEFT JOIN fotos_publicacion f ON f.publicacionId = PUBLICACIONES.id AND f.orden = 1
       ${whereSql}
       ORDER BY ${orderBy}
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

r.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [productRows] = await pool.query<ProductoRow[]>(
      `SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,
              PUBLICACIONES.ubicacion, PUBLICACIONES.tipo, CATEGORIAS.nombre AS categoria, f.urlFoto
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

    const [imageRows] = await pool.query<RowDataPacket[]>(
      `SELECT urlFoto, orden FROM fotos_publicacion 
       WHERE publicacionId = ? 
       ORDER BY orden ASC`,
      [id]
    );

    const product = productRows[0];
    const imagenes = imageRows.map(row => row.urlFoto);

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

r.post("/", verifyToken, blockModerator, upload.array("images", 5), async (req: Request, res: Response) => {
  try {
    console.log('=== POST /productos DEBUG ===');
    console.log('Body:', req.body);
    console.log('Files:', (req as any).files);
    console.log('Usuario:', (req as any).user?.id);

    const { nombre, descripcion, precio, ubicacion, categoriaId, categoria, tipo = 'PRODUCTO' } = req.body as any;
    const usuarioId = (req as any).user?.id;

    if (!nombre || !precio) {
      return res.status(400).json({ message: "Faltan campos requeridos: nombre, precio" });
    }

    // Validar que tipo sea PRODUCTO o SERVICIO
    if (tipo !== 'PRODUCTO' && tipo !== 'SERVICIO') {
      return res.status(400).json({ message: "El tipo debe ser PRODUCTO o SERVICIO" });
    }

    let finalCategoriaId = categoriaId;
    if (!finalCategoriaId && categoria) {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM CATEGORIAS WHERE LOWER(nombre)=LOWER(?) LIMIT 1",
        [categoria]
      );
      if (rows.length > 0) {
        finalCategoriaId = (rows[0] as any).id;
      } else {
        const [insertCat] = await pool.query(
          "INSERT INTO CATEGORIAS (nombre, descripcion, estado, fecha_creacion) VALUES (?, '', 'ACTIVA', NOW())",
          [categoria]
        );
        finalCategoriaId = (insertCat as any).insertId;
        console.log(`📁 Nueva categoría creada: ${categoria} (ID: ${finalCategoriaId})`);
      }
    }

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

    const files = (req as any).files as any[] | undefined;
    const hasImages: boolean = files !== undefined && files.length > 0;

    const validationResult = validateProduct(
      nombre,
      descripcion || '',
      Number(precio),
      hasImages
    );

    console.log(getValidationMessage(validationResult));

    let estadoInicial = 'PENDIENTE';
    let razonRechazo = null;

    if (validationResult.autoReject) {
      estadoInicial = 'RECHAZADA';
      razonRechazo = validationResult.reasons.join('. ');
    } else if (validationResult.score >= 80) {
      estadoInicial = 'PUBLICADA';
    }

    const [result] = await pool.query(
      `INSERT INTO PUBLICACIONES (
        nombre, descripcion, precio, ubicacion, categoriaId, tipo, usuarioId, 
        estado, razonRechazo, puntuacionCalidad, validacionAutomatica, fechaPublicacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        nombre,
        descripcion,
        precio,
        finalUbicacion,
        finalCategoriaId,
        tipo,
        usuarioId,
        estadoInicial,
        razonRechazo,
        validationResult.score
      ]
    );

    const publicacionId = (result as any).insertId;
    console.log(`📦 Publicación insertada con ID: ${publicacionId} - Tipo: ${tipo} - Estado: ${estadoInicial} - Score: ${validationResult.score}/100`);

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

    let mensaje = "Publicación creada exitosamente";
    if (estadoInicial === 'RECHAZADA') {
      mensaje = "Publicación rechazada automáticamente";
    } else if (estadoInicial === 'PENDIENTE') {
      mensaje = "Publicación creada. Pendiente de aprobación manual";
    } else if (estadoInicial === 'PUBLICADA') {
      mensaje = "Publicación creada y aprobada automáticamente";
    }

    console.log(`✅ Nueva publicación creada: ${publicacionId} por vendedor ${usuarioId}`);

    return res.status(estadoInicial === 'RECHAZADA' ? 400 : 201).json({
      message: mensaje,
      publicacionId,
      imagenesGuardadas,
      estado: estadoInicial,
      tipo,
      score: validationResult.score,
      razones: validationResult.reasons.length > 0 ? validationResult.reasons : undefined
    });

  } catch (error: any) {
    console.error("❌ Error al crear publicación:", error);
    console.error("Stack trace:", error.stack);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default r;
