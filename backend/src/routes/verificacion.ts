import { Router } from 'express';
import { EmailService } from '../lib/emailService.js';
import { generarCodigoVerificacion, calcularFechaExpiracion, formatearFechaMySQL } from '../utils/tokenGenerator.js';
import { pool } from '../db.js';

const router = Router();
const emailService = new EmailService();

// Ruta: POST /api/verificacion/enviar-codigo
// Envía código de verificación al email del usuario
router.post('/enviar-codigo', async (req, res) => {
  try {
    const { correo, nombre, usuarioId } = req.body;

    // Validación de datos
    if (!correo || !nombre || !usuarioId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Generar código de 6 dígitos
    const codigo = generarCodigoVerificacion();
    const fechaExpiracion = calcularFechaExpiracion(15); // 15 minutos
    const fechaExpiracionMySQL = formatearFechaMySQL(fechaExpiracion);

    // Guardar token en la base de datos
    await pool.query(
      `INSERT INTO tokens_verificacion (usuarioId, token, tipo, fechaExpiracion) 
       VALUES (?, ?, 'VERIFICACION_EMAIL', ?)`,
      [usuarioId, codigo, fechaExpiracionMySQL]
    );

    // Enviar email con el código
    await emailService.enviarCodigoVerificacion(correo, codigo, nombre);

    res.json({ 
      success: true, 
      message: 'Código enviado correctamente al correo' 
    });
  } catch (error) {
    console.error('Error al enviar código:', error);
    res.status(500).json({ error: 'Error al enviar código de verificación' });
  }
});

// Ruta: POST /api/verificacion/verificar-codigo
// Verifica el código ingresado por el usuario
router.post('/verificar-codigo', async (req, res) => {
  try {
    const { usuarioId, codigo } = req.body;

    // Validación de datos
    if (!usuarioId || !codigo) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Buscar token válido (no usado y no expirado)
    const [rows]: any = await pool.query(
      `SELECT * FROM tokens_verificacion 
       WHERE usuarioId = ? AND token = ? AND usado = 0 
       AND fechaExpiracion > NOW()`,
      [usuarioId, codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    // Marcar token como usado
    await pool.query(
      `UPDATE tokens_verificacion SET usado = 1 WHERE id = ?`,
      [rows[0].id]
    );

    // Actualizar usuario como verificado
    await pool.query(
      `UPDATE usuarios SET cuentaVerificada = 1, fechaVerificacion = NOW() 
       WHERE id = ?`,
      [usuarioId]
    );

    res.json({ 
      success: true, 
      message: 'Cuenta verificada correctamente' 
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ error: 'Error al verificar código' });
  }
});

// Ruta: POST /api/verificacion/reenviar-codigo
// Reenvía un nuevo código al usuario
router.post('/reenviar-codigo', async (req, res) => {
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: 'Falta el ID del usuario' });
    }

    // Obtener datos del usuario
    const [usuarios]: any = await pool.query(
      `SELECT correo, nombre FROM usuarios WHERE id = ?`,
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { correo, nombre } = usuarios[0];

    // Generar nuevo código
    const codigo = generarCodigoVerificacion();
    const fechaExpiracion = calcularFechaExpiracion(15);
    const fechaExpiracionMySQL = formatearFechaMySQL(fechaExpiracion);

    // Marcar tokens anteriores como usados
    await pool.query(
      `UPDATE tokens_verificacion SET usado = 1 
       WHERE usuarioId = ? AND usado = 0`,
      [usuarioId]
    );

    // Guardar nuevo token
    await pool.query(
      `INSERT INTO tokens_verificacion (usuarioId, token, tipo, fechaExpiracion) 
       VALUES (?, ?, 'VERIFICACION_EMAIL', ?)`,
      [usuarioId, codigo, fechaExpiracionMySQL]
    );

    // Enviar email
    await emailService.enviarCodigoVerificacion(correo, codigo, nombre);

    res.json({ 
      success: true, 
      message: 'Código reenviado correctamente' 
    });
  } catch (error) {
    console.error('Error al reenviar código:', error);
    res.status(500).json({ error: 'Error al reenviar código' });
  }
});

export default router;
