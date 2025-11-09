import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";
import { verifyToken, blockModerator } from "../middleware/roleMiddleware.js"; // ✅ NUEVO

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
   📦 GET /productos → listar productos
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
r.post("/", verifyToken, blockModerator, async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, ubicacion, categoriaId } = req.body;
    const vendedorId = req.user?.id;

    // Validaciones
    if (!nombre || !precio || !categoriaId) {
      return res.status(400).json({ 
        message: "Faltan campos requeridos: nombre, precio, categoriaId" 
      });
    }

    // Crear la publicación con estado PENDIENTE
    const [result] = await pool.query(
      `INSERT INTO PUBLICACIONES (nombre, descripcion, precio, ubicacion, categoriaId, vendedorId, estado, fechaPublicacion)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())`,
      [nombre, descripcion, precio, ubicacion, categoriaId, vendedorId]
    );

    const publicacionId = (result as any).insertId;

    console.log(`✅ Nueva publicación creada: ${publicacionId} por vendedor ${vendedorId}`);

    res.status(201).json({
      message: "Publicación creada exitosamente. Pendiente de aprobación",
      publicacionId
    });
  } catch (error) {
    console.error("Error al crear publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default r;
