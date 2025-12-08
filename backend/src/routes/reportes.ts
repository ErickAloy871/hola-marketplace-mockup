import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";
import { verifyToken, requireModeratorOrAdmin } from "../middleware/roleMiddleware.js";
import { getIO } from "../lib/socketIO.js";

const r = Router();

// Crear un reporte
r.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { publicacionId, categoria, motivo } = req.body;
    const usuarioId = (req as any).user?.id;

    if (!publicacionId || !categoria) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Verificar que la publicación existe
    const [pubRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM PUBLICACIONES WHERE id = ?",
      [publicacionId]
    );

    if (pubRows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificar si ya reportó esta publicación
    const [existingReport] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM reportes_publicaciones WHERE publicacionId = ? AND usuarioId = ?",
      [publicacionId, usuarioId]
    );

    if (existingReport.length > 0) {
      return res.status(400).json({ message: "Ya has reportado esta publicación" });
    }

    // Crear el reporte
    const [result] = await pool.query(
      `INSERT INTO reportes_publicaciones (publicacionId, usuarioId, categoria, motivo) 
       VALUES (?, ?, ?, ?)`,
      [publicacionId, usuarioId, categoria, motivo || null]
    );

    const reporteId = (result as any).insertId;

    // ✅ Emitir evento Socket.IO a moderadores
    const [publicacion] = await pool.query<RowDataPacket[]>(
      "SELECT nombre FROM PUBLICACIONES WHERE id = ?",
      [publicacionId]
    );

    getIO().emit('nuevo-reporte', {
      reporteId,
      publicacionId,
      publicacionNombre: publicacion[0]?.nombre || 'Publicación',
      categoria
    });

    console.log(`Notificacion emitida: nuevo reporte #${reporteId}`);

    res.status(201).json({
      message: "Reporte enviado exitosamente",
      reporteId
    });
  } catch (error) {
    console.error("Error creando reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Obtener todos los reportes (solo moderadores y admins)
r.get("/", verifyToken, requireModeratorOrAdmin, async (_req: Request, res: Response) => {
  try {
    const [reportes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.publicacionId,
        r.categoria,
        r.motivo,
        r.estado,
        r.fechaReporte,
        p.nombre AS publicacionNombre,
        p.precio AS publicacionPrecio,
        u.nombre AS reportadoPor,
        u.correo AS reportadoPorCorreo,
        rev.nombre AS revisadoPorNombre
       FROM reportes_publicaciones r
       JOIN PUBLICACIONES p ON p.id = r.publicacionId
       JOIN USUARIOS u ON u.id = r.usuarioId
       LEFT JOIN USUARIOS rev ON rev.id = r.revisadoPor
       ORDER BY r.fechaReporte DESC`
    );

    res.json(reportes);
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Marcar reporte como revisado
r.post("/:id/revisar", verifyToken, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).user?.id;

    await pool.query(
      `UPDATE reportes_publicaciones 
       SET estado = 'REVISADO', revisadoPor = ?, fechaRevision = NOW()
       WHERE id = ?`,
      [usuarioId, id]
    );

    // ✅ Emitir evento para cerrar notificación en todos los moderadores
    getIO().emit('reporte-revisado', { reporteId: Number(id) });
    console.log(`Notificacion cerrada: reporte #${id} revisado`);

    res.json({ message: "Reporte marcado como revisado" });
  } catch (error) {
    console.error("Error actualizando reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Eliminar reporte
r.delete("/:id", verifyToken, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM reportes_publicaciones WHERE id = ?", [id]);

    res.json({ message: "Reporte eliminado" });
  } catch (error) {
    console.error("Error eliminando reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Eliminar publicación y marcar reporte como resuelto
r.post("/:id/eliminar-publicacion", verifyToken, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Obtener el reporte
    const [reportes] = await pool.query<RowDataPacket[]>(
      "SELECT publicacionId FROM reportes_publicaciones WHERE id = ?",
      [id]
    );

    if (reportes.length === 0) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    const publicacionId = reportes[0].publicacionId;

    // Eliminar la publicación (los reportes se eliminan en cascada)
    await pool.query("DELETE FROM PUBLICACIONES WHERE id = ?", [publicacionId]);

    res.json({ message: "Publicación eliminada exitosamente" });
  } catch (error) {
    console.error("Error eliminando publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default r;
