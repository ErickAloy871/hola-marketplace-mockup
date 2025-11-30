import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

// Todas las rutas aquí → requieren login y ser ADMIN
router.use(verifyToken, requireAdmin);

/* ===========================================================
   🟦 1. LISTAR MODERADORES
=========================================================== */
router.get("/moderadores", async (req: Request, res: Response) => {
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


/* ===========================================================
   🟩 2. REGISTRAR NUEVO MODERADOR
=========================================================== */

router.post("/moderadores", async (req: Request, res: Response) => {
  const { usuarioId } = req.body;

  try {
    // 1) Quitar roles de COMPRADOR y VENDEDOR
    await pool.query(
      `
      DELETE ur FROM usuarios_roles ur
      JOIN roles r ON r.id = ur.rolId
      WHERE ur.usuarioId = ?
        AND r.nombre IN ('COMPRADOR', 'VENDEDOR')
      `,
      [usuarioId]
    );

    // 2) Asignar rol de MODERADOR
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


/* ===========================================================
   🔴 3. ELIMINAR ROL DE MODERADOR
=========================================================== */

router.delete("/moderadores/:id", async (req: Request, res: Response) => {
  const usuarioId = req.params.id;

  try {
    // 1) Quitar solo el rol de MODERADOR
    await pool.query(
      `
      DELETE ur FROM usuarios_roles ur
      JOIN roles r ON r.id = ur.rolId
      WHERE ur.usuarioId = ?
        AND r.nombre = 'MODERADOR'
      `,
      [usuarioId]
    );

    // 2) Volver a asignar COMPRADOR y VENDEDOR
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


/* ===========================================================
   🟡 4. SUSPENDER CUENTA DE MODERADOR
=========================================================== */
router.post("/moderadores/:id/suspender", async (req: Request, res: Response) => {
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

/* ===========================================================
   🟢 5. REACTIVAR CUENTA DE MODERADOR
=========================================================== */
router.post("/moderadores/:id/reactivar", async (req: Request, res: Response) => {
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

/* ===========================================================
   🟦 6. ASUMIR FUNCIONES DE MODERADOR (PARA ADMIN)
=========================================================== */
router.post("/asumir-moderador", async (req: Request, res: Response) => {

  const adminId = req.user!.id; // ← YA NO ERROR

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


/* ===========================================================
   ⚙️ 7. CONFIGURAR TIEMPO MÁXIMO DE PUBLICACIÓN
=========================================================== */
router.post("/config/tiempo-publicacion", async (req: Request, res: Response) => {
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

/* ===========================================================
   🆕 8. 🔹 SOLO usuarios que NO son moderadores NI administradores
=========================================================== */

router.get("/usuarios-disponibles", async (req: Request, res: Response) => {
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
   📗 PUBLICACIONES PARA CONFIGURAR TIEMPO
=========================================================== */
router.get("/publicaciones-configuracion", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.ubicacion,
        p.estado,
        p.fechaPublicacion,
        p.esPeligrosa,

        -- UNA FOTO POR PUBLICACIÓN (primera)
        fp.urlFoto AS urlFoto,

        pc.valor AS tiempoPublicacion,
        gc.valor AS tiempoGlobal,
        COALESCE(pc.valor, gc.valor) AS tiempoEfectivo

      FROM publicaciones p

      LEFT JOIN (
        SELECT publicacionId, MIN(urlFoto) AS urlFoto
        FROM fotos_publicacion
        GROUP BY publicacionId
      ) fp ON fp.publicacionId = p.id

      LEFT JOIN config pc
        ON pc.clave = 'TIEMPO_MAX_PUBLICACION_DIAS'
       AND pc.publicacionId = p.id

      LEFT JOIN config gc
        ON gc.clave = 'TIEMPO_MAX_PUBLICACION_DIAS'
       AND gc.publicacionId IS NULL

      ORDER BY p.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error cargando publicaciones para configuración:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

/* ===========================================================
   🔧 ACTUALIZAR TIEMPO PARA UNA PUBLICACIÓN
=========================================================== */
router.post(
  "/publicaciones/:id/tiempo-publicacion",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dias } = req.body;

    const diasNum = Number(dias);
    if (!diasNum || diasNum < 1) {
      return res.status(400).json({ message: "Días inválidos" });
    }

    try {
      await pool.query(
        `
        INSERT INTO config (clave, publicacionId, valor)
        VALUES ('TIEMPO_MAX_PUBLICACION_DIAS', ?, ?)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
        `,
        [id, diasNum]
      );

      res.json({ message: "Tiempo de publicación actualizado para esta publicación" });
    } catch (error) {
      console.error("Error actualizando tiempo de publicación:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }
);

export default router;





