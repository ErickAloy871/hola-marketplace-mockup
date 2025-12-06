import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import type { RowDataPacket } from "mysql2";
import { verifyToken } from "../middleware/roleMiddleware.js";

const r = Router();

// ✅ CORREGIDO: Ahora usa req.user.roles directamente
const canUseIntereses = (roles: string[]): boolean => {
  if (!roles || roles.length === 0) return false;
  
  console.log("🔍 Roles recibidos:", roles);
  
  return roles.includes("COMPRADOR") || roles.includes("VENDEDOR");
};

// ✅ Marcar producto como "me interesa"
r.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { publicacionId } = req.body;
    const usuarioId = req.user?.id;
    const roles = req.user?.roles || [];

    console.log("👤 Usuario:", usuarioId);
    console.log("🎭 Roles:", roles);

    if (!canUseIntereses(roles)) {
      console.log("❌ Acceso denegado para roles:", roles);
      return res.status(403).json({ 
        message: "No tienes permisos para usar esta función" 
      });
    }

    if (!publicacionId) {
      return res.status(400).json({ message: "publicacionId es requerido" });
    }

    // Verificar que la publicación existe y está publicada
    const [publicaciones] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM PUBLICACIONES WHERE id = ? AND estado = 'PUBLICADA' AND disponibilidad = 1",
      [publicacionId]
    );

    if (publicaciones.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado o no disponible" });
    }

    // Insertar o ignorar si ya existe
    try {
      await pool.query(
        "INSERT INTO productos_interesados (usuarioId, publicacionId) VALUES (?, ?)",
        [usuarioId, publicacionId]
      );
      
      console.log(`✅ Usuario ${usuarioId} marcó como favorito publicación ${publicacionId}`);
      
      return res.status(201).json({ 
        message: "Producto agregado a tu lista de interés",
        success: true 
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(200).json({ 
          message: "Este producto ya está en tu lista de interés",
          success: true 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Error al agregar interés:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ✅ Quitar producto de "me interesa"
r.delete("/:publicacionId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { publicacionId } = req.params;
    const usuarioId = req.user?.id;
    const roles = req.user?.roles || [];

    if (!canUseIntereses(roles)) {
      return res.status(403).json({ 
        message: "No tienes permisos para usar esta función" 
      });
    }

    const [result] = await pool.query(
      "DELETE FROM productos_interesados WHERE usuarioId = ? AND publicacionId = ?",
      [usuarioId, publicacionId]
    );

    const affectedRows = (result as any).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ 
        message: "El producto no estaba en tu lista de interés" 
      });
    }

    console.log(`✅ Usuario ${usuarioId} eliminó de favoritos publicación ${publicacionId}`);

    return res.json({ 
      message: "Producto eliminado de tu lista de interés",
      success: true 
    });
  } catch (error) {
    console.error("❌ Error al eliminar interés:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ✅ Obtener todos los productos de interés del usuario
r.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.id;
    const roles = req.user?.roles || [];

    if (!canUseIntereses(roles)) {
      return res.status(403).json({ 
        message: "No tienes permisos para usar esta función" 
      });
    }

    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT 
        p.id, p.nombre, p.descripcion, p.precio, p.ubicacion, p.tipo,
        c.nombre AS categoria, f.urlFoto, pi.fechaInteres
      FROM productos_interesados pi
      JOIN PUBLICACIONES p ON p.id = pi.publicacionId
      JOIN CATEGORIAS c ON c.id = p.categoriaId
      LEFT JOIN fotos_publicacion f ON f.publicacionId = p.id AND f.orden = 1
      WHERE pi.usuarioId = ? 
        AND p.estado = 'PUBLICADA' 
        AND p.disponibilidad = 1
      ORDER BY pi.fechaInteres DESC`,
      [usuarioId]
    );

    console.log(`✅ Usuario ${usuarioId} consultó ${items.length} productos de interés`);

    return res.json({ 
      items,
      total: items.length 
    });
  } catch (error) {
    console.error("❌ Error al obtener productos de interés:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ✅ Verificar si un producto está marcado como "me interesa"
r.get("/check/:publicacionId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { publicacionId } = req.params;
    const usuarioId = req.user?.id;
    const roles = req.user?.roles || [];

    if (!canUseIntereses(roles)) {
      return res.json({ esFavorito: false });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM productos_interesados WHERE usuarioId = ? AND publicacionId = ? LIMIT 1",
      [usuarioId, publicacionId]
    );

    return res.json({ esFavorito: rows.length > 0 });
  } catch (error) {
    console.error("❌ Error al verificar interés:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default r;
