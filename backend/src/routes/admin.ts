import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { verifyToken, requireModeratorOrAdmin } from "../middleware/roleMiddleware.js";
import type { RowDataPacket } from "mysql2";

const router = Router();

// Todas las rutas aquí → requieren login y ser MODERADOR o ADMIN
router.use(verifyToken, requireModeratorOrAdmin);

/* ===========================================================
   🔴 RUTAS SOLO PARA ADMINISTRADORES
=========================================================== */

// 1. LISTAR MODERADORES (SOLO ADMIN)
router.get("/moderadores", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.direccion,
        u.estadoCuenta,
        u.fechaCreacion
      FROM usuarios u
      JOIN usuarios_roles ur ON ur.usuarioId = u.id
      JOIN roles r ON r.id = ur.rolId
      WHERE r.nombre = 'MODERADOR'
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al listar moderadores:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 2. REGISTRAR NUEVO MODERADOR (SOLO ADMIN)
router.post("/moderadores", requireAdmin, async (req: Request, res: Response) => {
  const { usuarioId } = req.body;

  try {
    await pool.query(
      `
      DELETE ur FROM usuarios_roles ur
      JOIN roles r ON r.id = ur.rolId
      WHERE ur.usuarioId = ?
        AND r.nombre IN ('COMPRADOR', 'VENDEDOR')
      `,
      [usuarioId]
    );

    await pool.query(
      `
      INSERT IGNORE INTO usuarios_roles (usuarioId, rolId)
      VALUES (
        ?,
        (SELECT id FROM roles WHERE nombre = 'MODERADOR' LIMIT 1)
      )
      `,
      [usuarioId]
    );

    res.json({ message: "Usuario convertido a moderador (sin rol de comprador/vendedor)" });
  } catch (error) {
    console.error("Error al registrar moderador:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 3. ELIMINAR ROL DE MODERADOR (SOLO ADMIN)
router.delete("/moderadores/:id", requireAdmin, async (req: Request, res: Response) => {
  const usuarioId = req.params.id;

  try {
    await pool.query(
      `
      DELETE ur FROM usuarios_roles ur
      JOIN roles r ON r.id = ur.rolId
      WHERE ur.usuarioId = ?
        AND r.nombre = 'MODERADOR'
      `,
      [usuarioId]
    );

    await pool.query(
      `
      INSERT IGNORE INTO usuarios_roles (usuarioId, rolId)
      SELECT ?, id
      FROM roles
      WHERE nombre IN ('COMPRADOR', 'VENDEDOR')
      `,
      [usuarioId]
    );

    res.json({ message: "Rol de moderador eliminado. Usuario vuelve a ser comprador y vendedor." });
  } catch (error) {
    console.error("Error al eliminar moderador:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 4. SUSPENDER MODERADOR (SOLO ADMIN)
router.post("/moderadores/:id/suspender", requireAdmin, async (req: Request, res: Response) => {
  const { motivo } = req.body;
  const usuarioId = req.params.id;

  try {
    await pool.query(
      `UPDATE usuarios SET estadoCuenta = 'SUSPENDIDO' WHERE id = ?`,
      [usuarioId]
    );

    await pool.query(
      `INSERT INTO suspensiones (usuarioId, motivo, activa)
       VALUES (?, ?, 1)`,
      [usuarioId, motivo || "SUSPENDIDO POR ADMIN"]
    );

    res.json({ message: "Cuenta de moderador suspendida" });
  } catch (error) {
    console.error("Error al suspender moderador:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 5. REACTIVAR MODERADOR (SOLO ADMIN)
router.post("/moderadores/:id/reactivar", requireAdmin, async (req: Request, res: Response) => {
  const usuarioId = req.params.id;

  try {
    await pool.query(
      `UPDATE usuarios SET estadoCuenta='ACTIVO' WHERE id = ?`,
      [usuarioId]
    );

    await pool.query(
      `UPDATE suspensiones SET activa = 0, fechaFin = NOW()
       WHERE usuarioId = ? AND activa = 1`,
      [usuarioId]
    );

    res.json({ message: "Moderador reactivado" });
  } catch (error) {
    console.error("Error al reactivar moderador:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 6. ASUMIR ROL DE MODERADOR (SOLO ADMIN)
router.post("/asumir-moderador", requireAdmin, async (req: Request, res: Response) => {
  const adminId = req.user!.id;

  try {
    await pool.query(
      `INSERT IGNORE INTO usuarios_roles (usuarioId, rolId)
       VALUES (?, (SELECT id FROM roles WHERE nombre='MODERADOR'))`,
      [adminId]
    );

    res.json({ message: "Ahora también tienes rol de moderador" });
  } catch (error) {
    console.error("Error al asumir rol:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 7. CONFIGURACIÓN GLOBAL (SOLO ADMIN)
router.post("/config/tiempo-publicacion", requireAdmin, async (req: Request, res: Response) => {
  const { dias } = req.body;

  if (!dias || dias < 1) {
    return res.status(400).json({ message: "Debe indicar días válidos" });
  }

  try {
    await pool.query(
      `UPDATE config SET valor = ? WHERE clave='TIEMPO_MAX_PUBLICACION_DIAS'`,
      [dias]
    );

    res.json({ message: "Configuración actualizada" });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 8. USUARIOS DISPONIBLES PARA MODERADOR (SOLO ADMIN)
router.get("/usuarios-disponibles", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.direccion,
        u.estadoCuenta,
        u.fechaCreacion
      FROM usuarios u
      WHERE u.id NOT IN (
        SELECT ur.usuarioId
        FROM usuarios_roles ur
        JOIN roles r ON r.id = ur.rolId
        WHERE r.nombre IN ('MODERADOR', 'ADMINISTRADOR')
      )
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios disponibles:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

/* ===========================================================
   🟢 RUTAS PARA MODERADORES Y ADMINISTRADORES
=========================================================== */

// 9. LISTAR COMPRADORES Y VENDEDORES (MODERADORES + ADMIN)
router.get("/usuarios-clientes", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.direccion,
        u.estadoCuenta,
        u.cuentaVerificada,
        u.fechaCreacion,
        GROUP_CONCAT(r.nombre) AS roles
      FROM usuarios u
      JOIN usuarios_roles ur ON ur.usuarioId = u.id
      JOIN roles r ON r.id = ur.rolId
      WHERE r.nombre IN ('COMPRADOR', 'VENDEDOR')
      GROUP BY u.id
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios clientes:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 10. SUSPENDER USUARIO (MODERADORES + ADMIN)
router.post("/usuarios/:id/suspender", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  const usuarioId = req.params.id;
  const { motivo } = req.body;

  try {
    await pool.query(
      `UPDATE usuarios SET estadoCuenta = 'SUSPENDIDO' WHERE id = ?`,
      [usuarioId]
    );

    await pool.query(
      `INSERT INTO suspensiones (usuarioId, motivo, activa)
       VALUES (?, ?, 1)`,
      [usuarioId, motivo || "Suspensión administrativa"]
    );

    res.json({ message: "Usuario suspendido correctamente" });
  } catch (error) {
    console.error("Error al suspender usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 11. REACTIVAR USUARIO (MODERADORES + ADMIN)
router.post("/usuarios/:id/reactivar", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  const usuarioId = req.params.id;

  try {
    await pool.query(
      `UPDATE usuarios SET estadoCuenta = 'ACTIVO' WHERE id = ?`,
      [usuarioId]
    );

    await pool.query(
      `UPDATE suspensiones SET activa = 0, fechaFin = NOW()
       WHERE usuarioId = ? AND activa = 1`,
      [usuarioId]
    );

    res.json({ message: "Usuario reactivado correctamente" });
  } catch (error) {
    console.error("Error al reactivar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 12. PUBLICACIONES PARA CONFIGURACIÓN (MODERADORES + ADMIN)
router.get("/publicaciones-configuracion", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.estado,
        p.fechaPublicacion,
        p.ubicacion,

        fp.urlFoto AS urlFoto,

        (
          SELECT valor
          FROM config
          WHERE clave = 'TIEMPO_GLOBAL_PUBLICACION'
          LIMIT 1
        ) AS tiempoGlobal,

        (
          SELECT valor
          FROM config
          WHERE clave = 'TIEMPO_MAX_PUBLICACION'
            AND publicacionId = p.id
          LIMIT 1
        ) AS tiempoPublicacion,

        TIMESTAMPDIFF(SECOND, p.fechaPublicacion, NOW()) AS segundosTranscurridos

      FROM publicaciones p
      LEFT JOIN (
        SELECT publicacionId, MIN(urlFoto) AS urlFoto
        FROM fotos_publicacion
        GROUP BY publicacionId
      ) fp ON fp.publicacionId = p.id
      ORDER BY p.id DESC
    `);

    const publicaciones = rows.map((p) => {
      const tiempo = p.tiempoPublicacion || p.tiempoGlobal || null;

      let expirado = false;
      let tiempoRestante = null;

      if (tiempo) {
        expirado = p.segundosTranscurridos >= tiempo;
        tiempoRestante = Math.max(0, tiempo - p.segundosTranscurridos);
      }

      return {
        ...p,
        tiempoEfectivo: tiempo,
        tiempoRestante,
        expirado,
      };
    });

    res.json(publicaciones);
  } catch (error) {
    console.error("Error cargando publicaciones:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 13. ACTUALIZAR TIEMPO DE PUBLICACIÓN (MODERADORES + ADMIN)
router.post("/publicaciones/:id/tiempo-publicacion", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { cantidad, unidad } = req.body;

  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ message: "Cantidad inválida" });
  }

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };

  if (!multipliers[unidad]) {
    return res.status(400).json({
      message: "Unidad inválida. Use: s, m, h, d"
    });
  }

  const segundos = cantidad * multipliers[unidad];

  try {
    await pool.query(
      `
      INSERT INTO config (clave, publicacionId, valor)
      VALUES ('TIEMPO_MAX_PUBLICACION', ?, ?)
      ON DUPLICATE KEY UPDATE valor = VALUES(valor)
      `,
      [id, segundos]
    );

    res.json({
      message: `Tiempo actualizado (${cantidad}${unidad} = ${segundos} s)`,
      segundos,
    });
  } catch (error) {
    console.error("Error actualizando tiempo:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 14. DAR DE BAJA PUBLICACIÓN (MODERADORES + ADMIN)
router.post("/dar-baja/:id", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    const pub = rows[0];

    if (!["PUBLICADA", "PENDIENTE"].includes(pub.estado)) {
      return res.status(400).json({
        message: `No se puede dar de baja una publicación en estado ${pub.estado}`
      });
    }

    await pool.query(
      "UPDATE publicaciones SET estado = 'DADO_DE_BAJA' WHERE id = ?",
      [id]
    );

    console.log(
      `Publicación ${id} dada de baja. Motivo: ${motivo || "No especificado"}`
    );

    res.json({
      message: "Publicación dada de baja exitosamente",
      publicacionId: id
    });
  } catch (error) {
    console.error("Error al dar de baja publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 15. LISTAR PUBLICACIONES (MODERADORES + ADMIN)
router.get("/publicaciones", requireModeratorOrAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.estado,
        p.fechaPublicacion,
        p.ubicacion,
        COALESCE(fp.urlFoto, NULL) AS urlFoto
      FROM publicaciones p
      LEFT JOIN (
        SELECT publicacionId, MIN(urlFoto) AS urlFoto
        FROM fotos_publicacion
        GROUP BY publicacionId
      ) fp ON fp.publicacionId = p.id
      ORDER BY p.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 16. REACTIVAR PUBLICACIÓN (MODERADORES + ADMIN)
router.post("/publicaciones/:id/reactivar", requireModeratorOrAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    await pool.query(
      "UPDATE publicaciones SET estado = 'PUBLICADA' WHERE id = ?",
      [id]
    );

    res.json({
      message: "Publicación reactivada exitosamente",
      publicacionId: id
    });
  } catch (error) {
    console.error("Error al reactivar publicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 17. LISTAR APELACIONES (MODERADORES + ADMIN)
router.get("/apelaciones", requireModeratorOrAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             u.nombre AS usuarioNombre,
             u.apellido AS usuarioApellido,
             p.nombre AS publicacionNombre,
             p.estado AS estadoPublicacion
      FROM apelaciones_publicacion a
      JOIN usuarios u ON u.id = a.usuarioId
      JOIN publicaciones p ON p.id = a.publicacionId
      ORDER BY a.fechaCreacion DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo apelaciones:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 18. APROBAR APELACIÓN (MODERADORES + ADMIN)
router.post("/apelaciones/:id/aprobar", requireModeratorOrAdmin, async (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM apelaciones_publicacion WHERE id = ?`,
      [id]
    );

    const apelacion = rows[0];

    if (!apelacion) {
      return res.status(404).json({ message: "Apelación no encontrada" });
    }

    await pool.query(
      `UPDATE publicaciones 
       SET estado = 'PUBLICADA', razonRechazo = NULL
       WHERE id = ?`,
      [apelacion.publicacionId]
    );

    await pool.query(
      `UPDATE apelaciones_publicacion
       SET estado = 'APROBADA',
           revisadoPor = ?,
           fechaRevision = NOW()
       WHERE id = ?`,
      [userId, id]
    );

    res.json({ message: "Apelación aprobada correctamente." });

  } catch (error) {
    console.error("Error aprobando apelación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// 19. RECHAZAR APELACIÓN (MODERADORES + ADMIN)
router.post("/apelaciones/:id/rechazar", requireModeratorOrAdmin, async (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    await pool.query(`
      UPDATE apelaciones_publicacion
      SET estado = 'RECHAZADA', revisadoPor = ?, fechaRevision = NOW()
      WHERE id = ?
    `, [userId, id]);

    res.json({ message: "Apelación rechazada correctamente." });
  } catch (error) {
    console.error("Error rechazando apelación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;

// Helper function
function convertirATiempoMs(valor: string): number {
  const cantidad = parseInt(valor);
  const unidad = valor.replace(String(cantidad), "");

  const multipliers: any = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return cantidad * multipliers[unidad];
}

// CRON Job
import cron from "node-cron";

cron.schedule("* * * * *", async () => {
  console.log("⏳ Revisando publicaciones expiradas...");

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        p.id,
        p.estado,
        p.fechaPublicacion,
        COALESCE(pc.valor, gc.valor) AS tiempo
      FROM publicaciones p
      LEFT JOIN config gc
        ON gc.clave = 'TIEMPO_GLOBAL_PUBLICACION'
      LEFT JOIN config pc
        ON pc.clave = 'TIEMPO_MAX_PUBLICACION' AND pc.publicacionId = p.id
      WHERE p.estado = 'PUBLICADA'
    `);

    for (const pub of rows) {
      if (!pub.tiempo) continue;

      const tiempoMs = convertirATiempoMs(pub.tiempo);

      const fechaPublicacion = new Date(pub.fechaPublicacion).getTime();
      const ahora = Date.now();

      if (ahora - fechaPublicacion >= tiempoMs) {
        console.log(`⚠ Publicación ${pub.id} EXPIRÓ → DADO_DE_BAJA`);

        await pool.query(
          "UPDATE publicaciones SET estado = 'DADO_DE_BAJA' WHERE id = ?",
          [pub.id]
        );
      }
    }
  } catch (error) {
    console.error("Error revisando expiraciones:", error);
  }
});
