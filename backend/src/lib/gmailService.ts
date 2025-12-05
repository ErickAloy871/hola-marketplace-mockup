import { google } from 'googleapis';


export class GmailService {
  private gmail;


  constructor() {
    console.log("🔍 DEBUG - Variables de OAuth2:");
    console.log("OAUTH_CLIENT_ID:", process.env.OAUTH_CLIENT_ID ? "✅ OK" : "❌ UNDEFINED");
    console.log("OAUTH_CLIENT_SECRET:", process.env.OAUTH_CLIENT_SECRET ? "✅ OK" : "❌ UNDEFINED");
    console.log("OAUTH_REFRESH_TOKEN:", process.env.OAUTH_REFRESH_TOKEN ? "✅ OK" : "❌ UNDEFINED");
  
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN
    });
  
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }


  async enviarCodigoVerificacion(correo: string, codigo: string, nombre: string) {
    const primaryColor = '#77D9BD';      // Turquesa principal
    const primaryDark = '#5AC8A8';       // Turquesa oscuro
    const primaryLight = '#E8F7F3';      // Turquesa muy claro
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; }
          .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
          .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
          .greeting strong { color: ${primaryColor}; }
          .description { font-size: 14px; color: #666; margin-bottom: 30px; line-height: 1.8; }
          .code-box { background: ${primaryLight}; border: 2px dashed ${primaryColor}; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; }
          .code { font-size: 42px; font-weight: bold; color: ${primaryColor}; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .expiry-info { display: flex; align-items: center; justify-content: center; gap: 8px; color: #d32f2f; font-weight: bold; font-size: 14px; margin: 15px 0; }
          .icon { font-size: 16px; }
          .note { font-size: 13px; color: #666; margin: 20px 0; line-height: 1.6; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificación de Cuenta</h1>
          </div>
          <div class="content">
            <p class="greeting">Hola <strong>${nombre}</strong>,</p>
            <p class="description">Gracias por registrarte en nuestro Marketplace. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
            
            <div class="code-box">
              <div class="code">${codigo}</div>
            </div>
            
            <div class="expiry-info">
              <span>Este código expira en 15 minutos.</span>
            </div>
            
            <p class="note">Si no solicitaste este código, puedes ignorar este mensaje. Tu cuenta está segura.</p>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; 2025 Marketplace. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;


    const subject = 'Código de verificación - Marketplace';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Marketplace <${process.env.GMAIL_USER}>`,
      `To: ${correo}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      '',
      htmlContent,
    ];
    const message = messageParts.join('\n');


    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');


    try {
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      console.log('Email enviado exitosamente con Gmail API:', result.data.id);
      return true;
    } catch (error) {
      console.error('Error al enviar email con Gmail API:', error);
      throw error;
    }
  }

  async enviarLinkRecuperacion(correo: string, nombre: string, resetToken: string) {
    const primaryColor = '#77D9BD';
    const primaryDark = '#5AC8A8';
    const primaryLight = '#E8F7F3';
    
    // ✅ Link de recuperación
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; }
          .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
          .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
          .greeting strong { color: ${primaryColor}; }
          .description { font-size: 14px; color: #666; margin-bottom: 30px; line-height: 1.8; }
          .button-box { text-align: center; margin: 30px 0; }
          .reset-button { display: inline-block; background: ${primaryColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .reset-button:hover { background: ${primaryDark}; }
          .expiry-info { color: #d32f2f; font-weight: bold; font-size: 14px; text-align: center; margin: 15px 0; }
          .note { font-size: 13px; color: #666; margin: 20px 0; line-height: 1.6; background: ${primaryLight}; padding: 15px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p class="greeting">Hola <strong>${nombre}</strong>,</p>
            <p class="description">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            
            <div class="button-box">
              <a href="${resetLink}" class="reset-button">Restablecer Contraseña</a>
            </div>
            
            <p class="expiry-info">Este enlace expira en 1 hora</p>
            
            <div class="note">
              <strong>Importante:</strong><br>
              • Si no solicitaste este cambio, ignora este mensaje.<br>
              • Tu contraseña actual permanecerá segura.<br>
              • Nunca compartas este enlace con nadie.
            </div>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; 2025 Marketplace. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  
    const subject = 'Recuperación de contraseña - Marketplace';
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Marketplace <${process.env.GMAIL_USER}>`,
      `To: ${correo}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      '',
      htmlContent,
    ];
    const message = messageParts.join('\n');
  
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  
    try {
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });
      console.log('Email de recuperación enviado:', result.data.id);
      return true;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      throw error;
    }
  }
  

}
