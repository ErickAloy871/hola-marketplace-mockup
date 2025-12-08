import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/roleMiddleware.js";
import { io } from "../index.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";


const router = Router();


// Todas las rutas requieren usuario autenticado
router.use(verifyToken);


interface ConversacionRow extends RowDataPacket {
  id: number;
  usuario1Id: number;
  usuario2Id: number;
  publicacionId: number | null;
  ultimoMensaje: string | null;
  fechaUltimoMensaje: Date;
  usuario1NoLeidos: number;
  usuario2NoLeidos: number;
  otroUsuarioId: number;
  otroUsuarioNombre: string;
  otroUsuarioApellido: string;
  otroUsuarioCorreo: string;
  publicacionNombre: string | null;
}


interface MensajeRow extends RowDataPacket {
  id: number;
  conversacionId: number;
  remitenteId: number;
  contenido: string;
  leido: number;
  fechaEnvio: Date;
  remitenteNombre: string;
  remitenteApellido: string;
}


interface UsuarioRow extends RowDataPacket {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}


// 🔹 Buscar usuarios por nombre/apellido/correo (SOLO compradores/vendedores)
router.get("/usuarios", async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    const usuarioActualId = parseInt(req.user!.id);


    if (!q) {
      return res.json([]);
    }


    // ✅ Buscar usuarios que NO sean ADMINISTRADOR ni MODERADOR
    const [usuarios] = await pool.query<UsuarioRow[]>(
      `SELECT DISTINCT u.id, u.nombre, u.apellido, u.correo
       FROM usuarios u
       WHERE (u.nombre LIKE ? OR u.apellido LIKE ? OR u.correo LIKE ?)
         AND u.id != ?
         AND NOT EXISTS (
           SELECT 1 FROM usuarios_roles ur
           JOIN roles r ON ur.rolId = r.id
           WHERE ur.usuarioId = u.id
             AND r.nombre IN ('ADMINISTRADOR', 'MODERADOR')
         )
       ORDER BY u.nombre ASC
       LIMIT 20`,
      [`%${q}%`, `%${q}%`, `%${q}%`, usuarioActualId]
    );


    return res.json(usuarios);
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return res.status(500).json({ message: "Error al buscar usuarios" });
  }
});


// 🔹 Obtener todas las conversaciones del usuario actual
router.get("/conversaciones", async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.user!.id);


    const [conversaciones] = await pool.query<ConversacionRow[]>(
      `SELECT 
        c.*,
        p.nombre AS publicacionNombre,
        CASE 
          WHEN c.usuario1Id = ? THEN c.usuario2Id 
          ELSE c.usuario1Id 
        END AS otroUsuarioId,
        CASE 
          WHEN c.usuario1Id = ? THEN u2.nombre 
          ELSE u1.nombre 
        END AS otroUsuarioNombre,
        CASE 
          WHEN c.usuario1Id = ? THEN u2.apellido 
          ELSE u1.apellido 
        END AS otroUsuarioApellido,
        CASE 
          WHEN c.usuario1Id = ? THEN u2.correo 
          ELSE u1.correo 
        END AS otroUsuarioCorreo
      FROM conversaciones c
      JOIN usuarios u1 ON c.usuario1Id = u1.id
      JOIN usuarios u2 ON c.usuario2Id = u2.id
      LEFT JOIN publicaciones p ON c.publicacionId = p.id
      WHERE c.usuario1Id = ? OR c.usuario2Id = ?
      ORDER BY c.fechaUltimoMensaje DESC`,
      [usuarioId, usuarioId, usuarioId, usuarioId, usuarioId, usuarioId]
    );


    const resultado = conversaciones.map((c) => {
      const noLeidos = c.usuario1Id === usuarioId
        ? c.usuario1NoLeidos
        : c.usuario2NoLeidos;


      return {
        id: c.id,
        otroUsuario: {
          id: c.otroUsuarioId,
          nombre: c.otroUsuarioNombre,
          apellido: c.otroUsuarioApellido,
          correo: c.otroUsuarioCorreo,
        },
        publicacion: c.publicacionId
          ? {
              id: c.publicacionId,
              nombre: c.publicacionNombre,
            }
          : null,
        ultimoMensaje: c.ultimoMensaje,
        fechaUltimoMensaje: c.fechaUltimoMensaje,
        noLeidos,
      };
    });


    return res.json(resultado);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    return res.status(500).json({ message: "Error al obtener conversaciones" });
  }
});


// 🔹 Crear u obtener conversación (VALIDA que ninguno sea admin/moderador)
router.post("/conversaciones", async (req: Request, res: Response) => {
  try {
    const usuarioActualId = parseInt(req.user!.id);
    const { otroUsuarioId, publicacionId } = req.body as {
      otroUsuarioId?: number;
      publicacionId?: number;
    };


    let destinoId: number | null = null;
    let pubId: number | null = null;


    if (publicacionId) {
      const [pubs] = await pool.query<RowDataPacket[]>(
        "SELECT id, usuarioId FROM publicaciones WHERE id = ?",
        [publicacionId]
      );


      if (pubs.length === 0) {
        return res.status(404).json({ message: "Publicación no encontrada" });
      }


      destinoId = pubs[0].usuarioId as number;
      pubId = publicacionId;
    } else if (otroUsuarioId) {
      destinoId = Number(otroUsuarioId);
    } else {
      return res.status(400).json({ message: "Se requiere otroUsuarioId o publicacionId" });
    }


    if (destinoId === usuarioActualId) {
      return res.status(400).json({ message: "No puedes chatear contigo mismo" });
    }


    const [usuarios] = await pool.query<UsuarioRow[]>(
      "SELECT id FROM usuarios WHERE id = ?",
      [destinoId]
    );


    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario destino no encontrado" });
    }


    // ✅ Verificar que ninguno de los dos sea ADMINISTRADOR o MODERADOR
    const [rolesActual] = await pool.query<RowDataPacket[]>(
      `SELECT r.nombre FROM usuarios_roles ur
       JOIN roles r ON ur.rolId = r.id
       WHERE ur.usuarioId = ?`,
      [usuarioActualId]
    );


    const [rolesDestino] = await pool.query<RowDataPacket[]>(
      `SELECT r.nombre FROM usuarios_roles ur
       JOIN roles r ON ur.rolId = r.id
       WHERE ur.usuarioId = ?`,
      [destinoId]
    );


    const rolesActualNombres = rolesActual.map((r) => r.nombre);
    const rolesDestinoNombres = rolesDestino.map((r) => r.nombre);


    const esAdminOMod = (roles: string[]) =>
      roles.includes("ADMINISTRADOR") || roles.includes("MODERADOR");


    if (esAdminOMod(rolesActualNombres) || esAdminOMod(rolesDestinoNombres)) {
      return res.status(403).json({
        message: "Los administradores y moderadores no pueden usar el chat con usuarios",
      });
    }


    const u1 = Math.min(usuarioActualId, destinoId);
    const u2 = Math.max(usuarioActualId, destinoId);


    const [existentes] = await pool.query<ConversacionRow[]>(
      `SELECT * FROM conversaciones
       WHERE (usuario1Id = ? AND usuario2Id = ?)`,
      [u1, u2]
    );


    if (existentes.length > 0) {
      const conv = existentes[0];
      if (pubId && !conv.publicacionId) {
        await pool.query(
          "UPDATE conversaciones SET publicacionId = ? WHERE id = ?",
          [pubId, conv.id]
        );
      }
      return res.json({ conversacionId: conv.id });
    }


    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO conversaciones (usuario1Id, usuario2Id, publicacionId) VALUES (?, ?, ?)",
      [u1, u2, pubId]
    );


    return res.json({ conversacionId: result.insertId });
  } catch (error) {
    console.error("Error al crear/obtener conversación:", error);
    return res.status(500).json({ message: "Error al crear conversación" });
  }
});


// 🔹 Obtener mensajes de una conversación
router.get("/conversaciones/:id/mensajes", async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.user!.id);
    const conversacionId = parseInt(req.params.id);


    const [convs] = await pool.query<ConversacionRow[]>(
      "SELECT * FROM conversaciones WHERE id = ? AND (usuario1Id = ? OR usuario2Id = ?)",
      [conversacionId, usuarioId, usuarioId]
    );


    if (convs.length === 0) {
      return res.status(403).json({ message: "No tienes acceso a esta conversación" });
    }


    const [mensajes] = await pool.query<MensajeRow[]>(
      `SELECT m.*, u.nombre AS remitenteNombre, u.apellido AS remitenteApellido
       FROM mensajes m
       JOIN usuarios u ON m.remitenteId = u.id
       WHERE m.conversacionId = ?
       ORDER BY m.fechaEnvio ASC`,
      [conversacionId]
    );


    await pool.query(
      "UPDATE mensajes SET leido = 1 WHERE conversacionId = ? AND remitenteId != ? AND leido = 0",
      [conversacionId, usuarioId]
    );


    const conv = convs[0];
    if (conv.usuario1Id === usuarioId) {
      await pool.query(
        "UPDATE conversaciones SET usuario1NoLeidos = 0 WHERE id = ?",
        [conversacionId]
      );
    } else {
      await pool.query(
        "UPDATE conversaciones SET usuario2NoLeidos = 0 WHERE id = ?",
        [conversacionId]
      );
    }


    return res.json(mensajes);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return res.status(500).json({ message: "Error al obtener mensajes" });
  }
});


// 🔹 Enviar mensaje (con emisión por Socket.IO)
router.post("/mensajes", async (req: Request, res: Response) => {
  try {
    const usuarioId = parseInt(req.user!.id);
    const { conversacionId, contenido } = req.body as {
      conversacionId: number;
      contenido: string;
    };


    if (!conversacionId || !contenido?.trim()) {
      return res.status(400).json({ message: "conversacionId y contenido son requeridos" });
    }


    const [convs] = await pool.query<ConversacionRow[]>(
      "SELECT * FROM conversaciones WHERE id = ? AND (usuario1Id = ? OR usuario2Id = ?)",
      [conversacionId, usuarioId, usuarioId]
    );


    if (convs.length === 0) {
      return res.status(403).json({ message: "No tienes acceso a esta conversación" });
    }


    const conv = convs[0];
    const esUsuario1 = conv.usuario1Id === usuarioId;


    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO mensajes (conversacionId, remitenteId, contenido) VALUES (?, ?, ?)",
      [conversacionId, usuarioId, contenido]
    );


    await pool.query(
      `UPDATE conversaciones
       SET ultimoMensaje = ?, 
           fechaUltimoMensaje = NOW(),
           ${esUsuario1 ? "usuario2NoLeidos" : "usuario1NoLeidos"} = ${
        esUsuario1 ? "usuario2NoLeidos" : "usuario1NoLeidos"
      } + 1
       WHERE id = ?`,
      [contenido, conversacionId]
    );


    const [mensajes] = await pool.query<MensajeRow[]>(
      `SELECT m.*, u.nombre AS remitenteNombre, u.apellido AS remitenteApellido
       FROM mensajes m
       JOIN usuarios u ON m.remitenteId = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );


    io.to(`conv_${conversacionId}`).emit("nuevo_mensaje", mensajes[0]);


    return res.json(mensajes[0]);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return res.status(500).json({ message: "Error al enviar mensaje" });
  }
});


export default router;
