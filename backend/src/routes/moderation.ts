import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { verifyToken, requireModerator } from "../middleware/roleMiddleware.js";
import type { RowDataPacket } from "mysql2";

type PublicacionRow = RowDataPacket & {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  estado: string;
  fechaPublicacion: Date;
  vendedorNombre: string;
  vendedorCorreo: string;
  urlFoto: string | null;
};

const r = Router();

// Todas las rutas requieren autenticación y rol MODERADOR
r.use(verifyToken, requireModerator);

// Obtener todas las publicaciones PENDIENTES Y PUBLICADAS
r.get("/publicaciones-moderacion", async (req: Request, res: Response) => {
  try {
    const [publicaciones] = await pool.query<PublicacionRow[]>(
      `SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.precio, 
        p.ubicacion, 
        p.estado,
        p.fechaPublicacion,
        c.nombre AS categoria,
        CONCAT(u.nombre, ' ', u.apellido) AS vendedorNombre,
        u.correo AS vendedorCorreo,
        f.urlFoto
       FROM publicaciones p
       JOIN categorias c ON c.id = p.categoriaId
       JOIN usuarios u ON u.id = p.usuarioId
       LEFT JOIN fotos_publicacion f ON f.publicacionId = p.id AND f.orden = 1
       WHERE p.estado IN ('PENDIENTE', 'PUBLICADA')
       ORDER BY p.fechaPublicacion DESC`
    );

    res.json({
      publicaciones,
      total: publicaciones.length
    });
  } catch (error) {
    console.error("Error al obtener publicaciones para moderación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.post("/approve/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [publicaciones] = await pool.query<RowDataPacket[]>(
      "SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1",
      [id]
    );
  
    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
  
    const publicacion = publicaciones[0];
  
    if (publicacion.estado !== "PENDIENTE") {
      return res.status(400).json({ 
        message: `La publicación ya está ${publicacion.estado}` 
      });
    }
  
    await pool.query(
      "UPDATE publicaciones SET estado = 'PUBLICADA' WHERE id = ?",
      [id]
    );
  
    res.json({
      message: "Publicación aprobada exitosamente",
      publicacionId: id
    });
  } catch (error) {
    console.error("Error al aprobar publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.post("/reject/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;
  try {
    const [publicaciones] = await pool.query<RowDataPacket[]>(
      "SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1",
      [id]
    );
  
    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
  
    const publicacion = publicaciones[0];
  
    if (publicacion.estado !== "PENDIENTE") {
      return res.status(400).json({ 
        message: `La publicación ya está ${publicacion.estado}` 
      });
    }
  
    await pool.query(
      "UPDATE publicaciones SET estado = 'RECHAZADA' WHERE id = ?",
      [id]
    );
  
    console.log(`❌ Publicación ${id} rechazada. Motivo: ${motivo || 'No especificado'}`);
  
    res.json({
      message: "Publicación rechazada exitosamente",
      publicacionId: id
    });
  } catch (error) {
    console.error("Error al rechazar publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// NUEVO: Dar de baja un producto aprobado o pendiente
r.post('/dar-baja/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;
  try {
    const [publicaciones] = await pool.query<RowDataPacket[]>(
      "SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1",
      [id]
    );

    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    const publicacion = publicaciones[0];

    if (publicacion.estado !== "PUBLICADA" && publicacion.estado !== "PENDIENTE") {
      return res.status(400).json({
        message: `No se puede dar de baja una publicación en estado ${publicacion.estado}`
      });
    }

    await pool.query(
      "UPDATE publicaciones SET estado = 'DADO_DE_BAJA' WHERE id = ?",
      [id]
    );

    console.log(`Publicación ${id} dada de baja. Motivo: ${motivo || 'No especificado'}`);

    res.json({
      message: "Publicación dada de baja exitosamente",
      publicacionId: id
    });
  } catch (error) {
    console.error("Error al dar de baja publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.get("/stats", async (req: Request, res: Response) => {
  try {
    const [pendientes] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'PENDIENTE'"
    );
    const [aprobadas] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'PUBLICADA'"
    );
    const [rechazadas] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'RECHAZADA'"
    );
    const [dadasDeBaja] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'DADO_DE_BAJA'"
    );

    res.json({
      pendientes: pendientes[0].total,
      aprobadas: aprobadas[0].total,
      rechazadas: rechazadas[0].total,
      dadasDeBaja: dadasDeBaja[0].total,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default r;
