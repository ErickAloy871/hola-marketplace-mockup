import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { sign, verifyJwt, JWTPayload } from "../lib/jwt.js";
import type { RowDataPacket } from "mysql2";
import { GmailService } from "../lib/gmailService.js";
import crypto from 'crypto';

function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!hasUpperCase) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  if (!hasLowerCase) {
      return { valid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
  }
  if (!hasNumber) {
      return { valid: false, message: 'La contraseña debe contener al menos un número' };
  }
  if (!hasSpecialChar) {
      return { valid: false, message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)' };
  }

  return { valid: true };
}

type UserRow = RowDataPacket & {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  passwordHash: string | null;
  cuentaVerificada?: boolean;
  codigoVerificacion?: string | null;
  codigoExpiracion?: Date | null;
  intentosRestantes?: number;
};

type RolRow = RowDataPacket & {
  id: number;
  nombre: string;
};

const r = Router();

// LOGIN
r.post("/login", async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body as { correo: string; password: string };
    
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, nombre, apellido, correo, passwordHash FROM USUARIOS WHERE correo=? LIMIT 1",
      [correo]
    );
    
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const hash = user.passwordHash ?? "";
    const ok = hash.startsWith("$2a$") || hash.startsWith("$2b$")
      ? await bcrypt.compare(password, hash)
      : password === hash;

    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    // ✅ NUEVO: Obtener todos los roles del usuario
    const [rolesResult] = await pool.query<RolRow[]>(
      "SELECT r.id, r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rolId = r.id WHERE ur.usuarioId = ?",
      [user.id]
    );

    const roles = rolesResult.map(r => r.nombre);

    const payload: JWTPayload = { 
      sub: user.id.toString(), 
      rol: roles.join(",") // Guardar todos los roles en el token
    };
    const token = sign(payload);

    return res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        roles: roles // Devolver array de roles
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// REGISTER
r.post("/register", async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, correo, password, telefono, direccion } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    } 

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Verificar si el correo ya existe
    const [existing] = await pool.query<UserRow[]>(
      "SELECT id FROM USUARIOS WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hash de la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      "INSERT INTO USUARIOS (nombre, apellido, correo, passwordHash, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, hash, telefono, direccion]
    );

    const usuarioId = (result as any).insertId;

    // ✅ NUEVO: Asignar rol COMPRADOR automáticamente
    await pool.query(
      "INSERT INTO usuarios_roles (usuarioId, rolId) VALUES (?, 1)",
      [usuarioId]
    );

    console.log(`Usuario ${usuarioId} registrado como COMPRADOR`);

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuarioId
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// SEND VERIFICATION CODE
r.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.body;
    console.log("send-verification body:", req.body);

    if (!usuarioId) {
      return res.status(400).json({ message: "usuarioId es requerido" });
    }

    // Verificar que el usuario existe
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id, nombre, correo, cuentaVerificada FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];

    // Verificar si ya está verificado
    if (usuario.cuentaVerificada) {
      return res.status(400).json({ message: "La cuenta ya está verificada" });
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcular fecha de expiración (15 minutos)
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    // Actualizar código en la tabla USUARIOS
    await pool.query(
      "UPDATE USUARIOS SET codigoVerificacion = ?, codigoExpiracion = ?, intentosRestantes = 3 WHERE id = ?",
      [codigo, fechaExpiracion, usuarioId]
    );

    // Enviar email con el código
    const gmailService = new GmailService();
    await gmailService.enviarCodigoVerificacion(
      usuario.correo,
      codigo,
      usuario.nombre
    );

    console.log(`Código de verificación enviado a ${usuario.correo}: ${codigo}`);

    return res.json({
      message: "Código de verificación enviado exitosamente",
      expiraEn: fechaExpiracion
    });
  } catch (error) {
    console.error("send-verification error:", error);
    return res.status(500).json({
      message: "Error al enviar código de verificación"
    });
  }
});

// VERIFY CODE
r.post("/verify-code", async (req: Request, res: Response) => {
  try {
    const { usuarioId, codigo } = req.body;

    if (!usuarioId || !codigo) {
      return res.status(400).json({ message: "usuarioId y codigo son requeridos" });
    }

    // Buscar el usuario
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id, codigoVerificacion, codigoExpiracion, cuentaVerificada, intentosRestantes FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];
    const intentosRestantes = usuario.intentosRestantes ?? 0;

    // ✅ BLOQUEO ABSOLUTO: Si no hay intentos, rechazar INMEDIATAMENTE
    if (intentosRestantes <= 0) {
      return res.status(403).json({ 
        message: "Se agotaron los intentos. Solicita un nuevo código.",
        intentosRestantes: 0,
        bloqueado: true  // Bandera para el frontend
      });
    }

    // Verificar si ya está verificado
    if (usuario.cuentaVerificada) {
      return res.status(400).json({ message: "La cuenta ya está verificada" });
    }

    // Verificar que existe un código
    if (!usuario.codigoVerificacion || !usuario.codigoExpiracion) {
      return res.status(400).json({ message: "No hay código de verificación pendiente" });
    }

    // Verificar si el código expiró
    const ahora = new Date();
    const expiracion = new Date(usuario.codigoExpiracion);
    
    if (ahora > expiracion) {
      return res.status(400).json({ 
        message: "El código de verificación ha expirado",
        expirado: true 
      });
    }

    // Verificar el código
    if (usuario.codigoVerificacion !== codigo) {
      const nuevosIntentos = Math.max(0, intentosRestantes - 1);
      
      await pool.query(
        "UPDATE USUARIOS SET intentosRestantes = ? WHERE id = ?",
        [nuevosIntentos, usuarioId]
      );

      return res.status(400).json({ 
        message: nuevosIntentos === 0 
          ? "Se agotaron los intentos. Solicita un nuevo código." 
          : "Código de verificación inválido",
        intentosRestantes: nuevosIntentos,
        bloqueado: nuevosIntentos === 0
      });
    }

    await pool.query(
      "UPDATE USUARIOS SET cuentaVerificada = 1, codigoVerificacion = NULL, codigoExpiracion = NULL, intentosRestantes = 3 WHERE id = ?",
      [usuarioId]
    );

    return res.json({
      message: "Cuenta verificada exitosamente",
      success: true
    });

  } catch (error) {
    console.error("verify-code error:", error);
    return res.status(500).json({
      message: "Error al verificar código"
    });
  }
});

r.post("/cambiar-a-vendedor", async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ message: "usuarioId es requerido" });
    }

    // Verificar que el usuario existe
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si ya es vendedor
    const [rolExistente] = await pool.query<RolRow[]>(
      "SELECT * FROM usuarios_roles WHERE usuarioId = ? AND rolId = 2",
      [usuarioId]
    );

    if (rolExistente.length > 0) {
      return res.status(400).json({ message: "El usuario ya es vendedor" });
    }

    // Agregar rol de VENDEDOR (sin eliminar COMPRADOR)
    await pool.query(
      "INSERT INTO usuarios_roles (usuarioId, rolId) VALUES (?, 2)",
      [usuarioId]
    );

    console.log(`Usuario ${usuarioId} ahora es VENDEDOR`);

    return res.json({
      message: "Usuario convertido a vendedor exitosamente"
    });
  } catch (error) {
    console.error("cambiar-a-vendedor error:", error);
    return res.status(500).json({
      message: "Error al cambiar a vendedor"
    });
  }
});

// ✅ NUEVO ENDPOINT: Obtener estado de verificación
r.get("/estado-verificacion/:usuarioId", async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT intentosRestantes, cuentaVerificada, codigoExpiracion FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];

    return res.json({
      intentosRestantes: usuario.intentosRestantes ?? 3,
      cuentaVerificada: usuario.cuentaVerificada,
      codigoExpirado: usuario.codigoExpiracion 
        ? new Date() > new Date(usuario.codigoExpiracion) 
        : false
    });
  } catch (error) {
    console.error("estado-verificacion error:", error);
    return res.status(500).json({
      message: "Error al obtener estado de verificación"
    });
  }
});

// ✅ FORGOT PASSWORD - Solicitar reseteo
r.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    // Buscar usuario
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id, nombre, correo FROM USUARIOS WHERE correo = ? LIMIT 1",
      [correo]
    );

    // ✅ Por seguridad, siempre respondemos lo mismo (aunque no exista)
    if (usuarios.length === 0) {
      return res.json({
        message: "Si el correo existe, recibirás un enlace de recuperación"
      });
    }

    const usuario = usuarios[0];

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Expira en 1 hora
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);

    // Guardar token en BD
    await pool.query(
      "UPDATE USUARIOS SET resetToken = ?, resetTokenExpiracion = ? WHERE id = ?",
      [resetToken, expiracion, usuario.id]
    );

    // Enviar email
    const gmailService = new GmailService();
    await gmailService.enviarLinkRecuperacion(
      usuario.correo,
      usuario.nombre,
      resetToken
    );

    console.log(`Link de recuperación enviado a ${usuario.correo}`);

    return res.json({
      message: "Si el correo existe, recibirás un enlace de recuperación"
    });

  } catch (error) {
    console.error("forgot-password error:", error);
    return res.status(500).json({
      message: "Error al procesar la solicitud"
    });
  }
});

// ✅ RESET PASSWORD - Cambiar contraseña
r.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y contraseña son requeridos" });
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Buscar usuario con el token
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id, resetToken, resetTokenExpiracion FROM USUARIOS WHERE resetToken = ? LIMIT 1",
      [token]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const usuario = usuarios[0];

    // Verificar expiración
    const ahora = new Date();
    const expiracion = usuario.resetTokenExpiracion ? new Date(usuario.resetTokenExpiracion) : null;

    if (!expiracion || ahora > expiracion) {
      return res.status(400).json({ message: "El token ha expirado" });
    }

    // Hash de la nueva contraseña
    const hash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await pool.query(
      "UPDATE USUARIOS SET passwordHash = ?, resetToken = NULL, resetTokenExpiracion = NULL WHERE id = ?",
      [hash, usuario.id]
    );

    console.log(`Contraseña actualizada para usuario ${usuario.id}`);

    return res.json({
      message: "Contraseña actualizada exitosamente",
      success: true
    });

  } catch (error) {
    console.error("reset-password error:", error);
    return res.status(500).json({
      message: "Error al actualizar contraseña"
    });
  }
});

// ✅ UPDATE PROFILE - Actualizar perfil del usuario
r.put("/update-profile", async (req: Request, res: Response) => {
  try {
    const { usuarioId, nombre, apellido, telefono, direccion } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ message: "usuarioId es requerido" });
    }

    if (!nombre || !apellido || !telefono || !direccion) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar que el usuario existe
    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar datos del usuario
    await pool.query(
      "UPDATE USUARIOS SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id = ?",
      [nombre, apellido, telefono, direccion, usuarioId]
    );

    console.log(`Perfil actualizado para usuario ${usuarioId}`);

    // Obtener datos actualizados con roles
    const [usuarioActualizado] = await pool.query<UserRow[]>(
      "SELECT id, nombre, apellido, correo FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    const [rolesResult] = await pool.query<RolRow[]>(
      "SELECT r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rolId = r.id WHERE ur.usuarioId = ?",
      [usuarioId]
    );

    const roles = rolesResult.map(r => r.nombre);

    return res.json({
      message: "Perfil actualizado exitosamente",
      usuario: {
        id: usuarioActualizado[0].id,
        nombre: usuarioActualizado[0].nombre,
        apellido: usuarioActualizado[0].apellido,
        correo: usuarioActualizado[0].correo,
        roles: roles
      },
      success: true
    });

  } catch (error) {
    console.error("update-profile error:", error);
    return res.status(500).json({
      message: "Error al actualizar perfil"
    });
  }
});

// ✅ GET USER PROFILE - Obtener perfil completo
r.get("/profile/:usuarioId", async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    const [usuarios] = await pool.query<UserRow[]>(
      "SELECT id, nombre, apellido, correo, telefono, direccion FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(usuarios[0]);
  } catch (error) {
    console.error("get-profile error:", error);
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
});

// ✅ DELETE ACCOUNT - ELIMINACIÓN FÍSICA GARANTIZADA
r.delete("/delete-account", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      connection.release();
      return res.status(400).json({ message: "usuarioId es requerido" });
    }

    // Verificar que el usuario existe
    const [usuarios] = await connection.query<UserRow[]>(
      "SELECT id, nombre, correo FROM USUARIOS WHERE id = ? LIMIT 1",
      [usuarioId]
    );

    if (usuarios.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar roles del usuario (NO permitir a moderadores ni admins)
    const [rolesResult] = await connection.query<RolRow[]>(
      "SELECT r.id, r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rolId = r.id WHERE ur.usuarioId = ?",
      [usuarioId]
    );

    const roles = rolesResult.map(r => r.nombre.toUpperCase());
    
    // Bloquear si es MODERADOR o ADMINISTRADOR
    if (roles.includes("MODERADOR") || roles.includes("ADMINISTRADOR")) {
      connection.release();
      return res.status(403).json({ 
        message: "Los moderadores y administradores no pueden eliminar su cuenta desde aquí. Contacta al administrador del sistema." 
      });
    }

    // Verificar que sea COMPRADOR o VENDEDOR
    if (!roles.includes("COMPRADOR") && !roles.includes("VENDEDOR")) {
      connection.release();
      return res.status(403).json({ 
        message: "No tienes permisos para realizar esta acción" 
      });
    }

    console.log(`🗑️ Iniciando eliminación del usuario ${usuarioId} (${usuarios[0].nombre} - ${usuarios[0].correo})`);

    // ✅ DESACTIVAR VERIFICACIONES DE FOREIGN KEY TEMPORALMENTE
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    try {
      // 1. Eliminar reportes donde el usuario es revisor
      await connection.query(
        "UPDATE reportes_publicaciones SET revisadoPor = NULL WHERE revisadoPor = ?",
        [usuarioId]
      );
      console.log(`  ✓ Reportes actualizados`);

      // 2. Eliminar apelaciones creadas por el usuario
      await connection.query(
        "DELETE FROM apelaciones_publicacion WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Apelaciones eliminadas`);

      // 3. Eliminar apelaciones revisadas por el usuario
      await connection.query(
        "UPDATE apelaciones_publicacion SET revisadoPor = NULL WHERE revisadoPor = ?",
        [usuarioId]
      );
      console.log(`  ✓ Apelaciones revisadas actualizadas`);

      // 4. Eliminar mensajes
      await connection.query(
        "DELETE FROM mensajes WHERE remitenteId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Mensajes eliminados`);

      // 5. Eliminar conversaciones
      await connection.query(
        "DELETE FROM conversaciones WHERE usuario1Id = ? OR usuario2Id = ?",
        [usuarioId, usuarioId]
      );
      console.log(`  ✓ Conversaciones eliminadas`);

      // 6. Eliminar productos interesados
      await connection.query(
        "DELETE FROM productos_interesados WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Productos interesados eliminados`);

      // 7. Eliminar reportes de publicaciones
      await connection.query(
        "DELETE FROM reportes_publicaciones WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Reportes de publicaciones eliminados`);

      // 8. Eliminar fotos de publicaciones del usuario
      await connection.query(
        "DELETE FROM fotos_publicacion WHERE publicacionId IN (SELECT id FROM publicaciones WHERE usuarioId = ?)",
        [usuarioId]
      );
      console.log(`  ✓ Fotos de publicaciones eliminadas`);

      // 9. Eliminar publicaciones
      await connection.query(
        "DELETE FROM publicaciones WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Publicaciones eliminadas`);

      // 10. Eliminar suspensiones
      await connection.query(
        "DELETE FROM suspensiones WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Suspensiones eliminadas`);

      // 11. Eliminar roles del usuario
      await connection.query(
        "DELETE FROM usuarios_roles WHERE usuarioId = ?",
        [usuarioId]
      );
      console.log(`  ✓ Roles de usuario eliminados`);

      // 12. FINALMENTE, ELIMINAR EL USUARIO
      const [deleteResult] = await connection.query(
        "DELETE FROM USUARIOS WHERE id = ?",
        [usuarioId]
      );
      console.log(`  ✓ Usuario eliminado de la tabla USUARIOS`);

      // Verificar que realmente se eliminó
      const [verificacion] = await connection.query<UserRow[]>(
        "SELECT id FROM USUARIOS WHERE id = ? LIMIT 1",
        [usuarioId]
      );

      if (verificacion.length > 0) {
        throw new Error("El usuario no fue eliminado correctamente");
      }

      console.log(`✅ Usuario ${usuarioId} (${usuarios[0].nombre}) ELIMINADO COMPLETAMENTE`);

    } finally {
      // ✅ REACTIVAR VERIFICACIONES DE FOREIGN KEY
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    connection.release();

    return res.json({
      message: "Tu cuenta ha sido eliminada exitosamente",
      success: true
    });

  } catch (error) {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    connection.release();
    
    console.error("❌ delete-account error:", error);
    return res.status(500).json({
      message: "Error al eliminar la cuenta",
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

export default r;
