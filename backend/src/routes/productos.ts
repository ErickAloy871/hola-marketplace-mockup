import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";

type ProductoRow = RowDataPacket & {
  id: string; nombre: string; descripcion: string; precio: number; ubicacion: string; categoria: string; urlFoto: string | null;
};
type CountRow = RowDataPacket & { total: number };

const r = Router();

r.get("/", async (req: Request, res: Response) => {
  const { q, categoria, minPrecio, maxPrecio, page = "1", pageSize = "12" } = req.query as Record<string, string>;
  const p = Number(page), ps = Number(pageSize);

  const where: string[] = [
    "(PUBLICACIONES.estado IS NULL OR PUBLICACIONES.estado='PUBLICADA')",
    "PUBLICACIONES.disponibilidad = 1"
  ];
  const args: any[] = [];

  if (q) { where.push("(PUBLICACIONES.nombre LIKE ? OR PUBLICACIONES.descripcion LIKE ?)"); args.push(`%${q}%`, `%${q}%`); }
  if (categoria) { where.push("CATEGORIAS.nombre = ?"); args.push(categoria); }
  if (minPrecio) { where.push("PUBLICACIONES.precio >= ?"); args.push(Number(minPrecio)); }
  if (maxPrecio) { where.push("PUBLICACIONES.precio <= ?"); args.push(Number(maxPrecio)); }

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

  res.json({ items, total: countRows[0]?.total ?? 0, page: p, pageSize: ps });
});

export default r;
