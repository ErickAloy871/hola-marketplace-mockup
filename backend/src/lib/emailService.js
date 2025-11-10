var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
var EmailService = /** @class */ (function () {
    function EmailService() {
        // Configurar OAuth2 client
        var OAuth2 = google.auth.OAuth2;
        var oauth2Client = new OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
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
    EmailService.prototype.enviarCodigoVerificacion = function (correo, codigo, nombre) {
        return __awaiter(this, void 0, void 0, function () {
            var mailOptions, info, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mailOptions = {
                            from: "\"Marketplace\" <".concat(process.env.GMAIL_USER, ">"),
                            to: correo,
                            subject: 'Código de verificación - Marketplace',
                            html: "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset=\"utf-8\">\n          <style>\n            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n            .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }\n            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }\n            .code-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }\n            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }\n            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }\n          </style>\n        </head>\n        <body>\n          <div class=\"container\">\n            <div class=\"header\">\n              <h1>\uD83D\uDD10 Verificaci\u00F3n de Cuenta</h1>\n            </div>\n            <div class=\"content\">\n              <p>Hola <strong>".concat(nombre, "</strong>,</p>\n              <p>Gracias por registrarte en nuestro Marketplace. Para completar tu registro, por favor utiliza el siguiente c\u00F3digo de verificaci\u00F3n:</p>\n              \n              <div class=\"code-box\">\n                <div class=\"code\">").concat(codigo, "</div>\n              </div>\n              \n              <p><strong>\u23F0 Este c\u00F3digo expira en 15 minutos.</strong></p>\n              <p>Si no solicitaste este c\u00F3digo, puedes ignorar este mensaje.</p>\n              \n              <div class=\"footer\">\n                <p>Este es un correo autom\u00E1tico, por favor no respondas a este mensaje.</p>\n                <p>&copy; 2025 Marketplace. Todos los derechos reservados.</p>\n              </div>\n            </div>\n          </div>\n        </body>\n        </html>\n      ")
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 2:
                        info = _a.sent();
                        console.log('Email enviado exitosamente:', info.messageId);
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error al enviar email:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifica que la configuración de SMTP esté correcta
     */
    EmailService.prototype.verificarConfiguracion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.transporter.verify()];
                    case 1:
                        _a.sent();
                        console.log('Configuración de email verificada correctamente con OAuth2');
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error en la configuración de email:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return EmailService;
}());
export { EmailService };
