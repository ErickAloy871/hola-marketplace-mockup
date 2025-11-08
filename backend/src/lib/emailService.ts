import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export class EmailService {
  private transporter;

  constructor() {
    // Configurar OAuth2 client
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    // Establecer las credenciales con el refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN
    });

    // ✅ CAMBIO: Usar configuración explícita con puerto 587
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para 587
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
      tls: {
        rejectUnauthorized: false // Útil para desarrollo
      }
    });
  }

  /**
   * Envía un email con el código de verificación al usuario
   */
  async enviarCodigoVerificacion(correo: string, codigo: string, nombre: string) {
    const mailOptions = {
      from: `"Marketplace" <${process.env.GMAIL_USER}>`,
      to: correo,
      subject: 'Código de verificación - Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verificación de Cuenta</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Gracias por registrarte en nuestro Marketplace. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
              
              <div class="code-box">
                <div class="code">${codigo}</div>
              </div>
              
              <p><strong>⏰ Este código expira en 15 minutos.</strong></p>
              <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; 2025 Marketplace. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado exitosamente:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  }

  /**
   * Verifica que la configuración de SMTP esté correcta
   */
  async verificarConfiguracion(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Configuración de email verificada correctamente con OAuth2');
      return true;
    } catch (error) {
      console.error('Error en la configuración de email:', error);
      return false;
    }
  }
}
