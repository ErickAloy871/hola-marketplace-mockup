import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/roleMiddleware.js";
import type { RowDataPacket } from "mysql2";

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
   📗 PUBLICACIONES PARA CONFIGURAR TIEMPO (CON EXPIRACIÓN)
=========================================================== */
router.get("/publicaciones-configuracion", async (req: Request, res: Response) => {
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

        -- Tiempo global (en segundos)
        (
          SELECT valor
          FROM config
          WHERE clave = 'TIEMPO_GLOBAL_PUBLICACION'
          LIMIT 1
        ) AS tiempoGlobal,

        -- Tiempo individual (en segundos)
        (
          SELECT valor
          FROM config
          WHERE clave = 'TIEMPO_MAX_PUBLICACION'
            AND publicacionId = p.id
          LIMIT 1
        ) AS tiempoPublicacion,

        -- Segundos transcurridos
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


/* ===========================================================
   🔧 ACTUALIZAR TIEMPO PARA UNA PUBLICACIÓN (EN SEGUNDOS)
=========================================================== */
router.post("/publicaciones/:id/tiempo-publicacion", async (req: Request, res: Response) => {
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



/* ===========================================================
   🟦 9. LISTAR COMPRADORES Y VENDEDORES
=========================================================== */
router.get("/usuarios-clientes", async (req: Request, res: Response) => {
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

/* ===========================================================
   🟥 10. SUSPENDER USUARIO (COMPRADOR O VENDEDOR)
=========================================================== */
router.post("/usuarios/:id/suspender", async (req: Request, res: Response) => {
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

/* ===========================================================
   🟩 11. REACTIVAR USUARIO (COMPRADOR O VENDEDOR)
=========================================================== */
router.post("/usuarios/:id/reactivar", async (req: Request, res: Response) => {
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

router.post("/dar-baja/:id", async (req: Request, res: Response) => {
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

router.get("/apelaciones", async (req, res) => {
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


router.post("/apelaciones/:id/aprobar", async (req, res) => {
  const adminId = req.user!.id;
  const { id } = req.params;

  try {
    // 1. Obtener apelación
    const [rows]: any = await pool.query(
      `SELECT * FROM apelaciones_publicacion WHERE id = ?`,
      [id]
    );

    const apelacion = rows[0];

    if (!apelacion) {
      return res.status(404).json({ message: "Apelación no encontrada" });
    }

    // 2. Restaurar publicación
    await pool.query(
      `UPDATE publicaciones 
       SET estado = 'PUBLICADA', razonRechazo = NULL
       WHERE id = ?`,
      [apelacion.publicacionId]
    );

    // 3. Actualizar estado de la apelación
    await pool.query(
      `UPDATE apelaciones_publicacion
       SET estado = 'APROBADA',
           revisadoPor = ?,
           fechaRevision = NOW()
       WHERE id = ?`,
      [adminId, id]
    );

    res.json({ message: "Apelación aprobada correctamente." });

  } catch (error) {
    console.error("Error aprobando apelación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

router.get("/publicaciones", async (req, res) => {
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

router.post("/apelaciones/:id/rechazar", async (req, res) => {
  const adminId = req.user!.id;
  const { id } = req.params;

  try {
    await pool.query(`
      UPDATE apelaciones_publicacion
      SET estado = 'RECHAZADA', revisadoPor = ?, fechaRevision = NOW()
      WHERE id = ?
    `, [adminId, id]);

    res.json({ message: "Apelación rechazada correctamente." });
  } catch (error) {
    console.error("Error rechazando apelación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});



export default router;

function convertirATiempoMs(valor: string): number {
  const cantidad = parseInt(valor);
  const unidad = valor.replace(String(cantidad), ""); // s, m, h, d

  const multipliers: any = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return cantidad * multipliers[unidad];
}


import cron from "node-cron";

// 🔥 CADA 1 MINUTO revisa expiraciones
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

      const tiempoMs = convertirATiempoMs(pub.tiempo); // ejemplo: 5h → 5 * 3600000

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






