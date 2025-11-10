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
import { google } from 'googleapis';
var GmailService = /** @class */ (function () {
    function GmailService() {
        console.log("🔍 DEBUG - Variables de OAuth2:");
        console.log("OAUTH_CLIENT_ID:", process.env.OAUTH_CLIENT_ID ? "✅ OK" : "❌ UNDEFINED");
        console.log("OAUTH_CLIENT_SECRET:", process.env.OAUTH_CLIENT_SECRET ? "✅ OK" : "❌ UNDEFINED");
        console.log("OAUTH_REFRESH_TOKEN:", process.env.OAUTH_REFRESH_TOKEN ? "✅ OK" : "❌ UNDEFINED");
        var OAuth2 = google.auth.OAuth2;
        var oauth2Client = new OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
        oauth2Client.setCredentials({
            refresh_token: process.env.OAUTH_REFRESH_TOKEN
        });
        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    }
    GmailService.prototype.enviarCodigoVerificacion = function (correo, codigo, nombre) {
        return __awaiter(this, void 0, void 0, function () {
            var primaryColor, primaryDark, primaryLight, htmlContent, subject, utf8Subject, messageParts, message, encodedMessage, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        primaryColor = '#77D9BD';
                        primaryDark = '#5AC8A8';
                        primaryLight = '#E8F7F3';
                        htmlContent = "\n      <!DOCTYPE html>\n      <html>\n      <head>\n        <meta charset=\"utf-8\">\n        <style>\n          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }\n          .container { max-width: 600px; margin: 0 auto; padding: 0; }\n          .header { background: linear-gradient(135deg, ".concat(primaryColor, " 0%, ").concat(primaryDark, " 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }\n          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }\n          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }\n          .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }\n          .greeting strong { color: ").concat(primaryColor, "; }\n          .description { font-size: 14px; color: #666; margin-bottom: 30px; line-height: 1.8; }\n          .code-box { background: ").concat(primaryLight, "; border: 2px dashed ").concat(primaryColor, "; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; }\n          .code { font-size: 42px; font-weight: bold; color: ").concat(primaryColor, "; letter-spacing: 8px; font-family: 'Courier New', monospace; }\n          .expiry-info { display: flex; align-items: center; justify-content: center; gap: 8px; color: #d32f2f; font-weight: bold; font-size: 14px; margin: 15px 0; }\n          .icon { font-size: 16px; }\n          .note { font-size: 13px; color: #666; margin: 20px 0; line-height: 1.6; }\n          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px; }\n          .footer p { margin: 5px 0; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"header\">\n            <h1>\uD83D\uDD10 Verificaci\u00F3n de Cuenta</h1>\n          </div>\n          <div class=\"content\">\n            <p class=\"greeting\">Hola <strong>").concat(nombre, "</strong>,</p>\n            <p class=\"description\">Gracias por registrarte en nuestro Marketplace. Para completar tu registro, por favor utiliza el siguiente c\u00F3digo de verificaci\u00F3n:</p>\n            \n            <div class=\"code-box\">\n              <div class=\"code\">").concat(codigo, "</div>\n            </div>\n            \n            <div class=\"expiry-info\">\n              <span class=\"icon\">\u23F0</span>\n              <span>Este c\u00F3digo expira en 15 minutos.</span>\n            </div>\n            \n            <p class=\"note\">Si no solicitaste este c\u00F3digo, puedes ignorar este mensaje. Tu cuenta est\u00E1 segura.</p>\n            \n            <div class=\"footer\">\n              <p>Este es un correo autom\u00E1tico, por favor no respondas a este mensaje.</p>\n              <p>&copy; 2025 Marketplace. Todos los derechos reservados.</p>\n            </div>\n          </div>\n        </div>\n      </body>\n      </html>\n    ");
                        subject = 'Código de verificación - Marketplace';
                        utf8Subject = "=?utf-8?B?".concat(Buffer.from(subject).toString('base64'), "?=");
                        messageParts = [
                            "From: Marketplace <".concat(process.env.GMAIL_USER, ">"),
                            "To: ".concat(correo),
                            "Content-Type: text/html; charset=utf-8",
                            "MIME-Version: 1.0",
                            "Subject: ".concat(utf8Subject),
                            '',
                            htmlContent,
                        ];
                        message = messageParts.join('\n');
                        encodedMessage = Buffer.from(message)
                            .toString('base64')
                            .replace(/\+/g, '-')
                            .replace(/\//g, '_')
                            .replace(/=+$/, '');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.gmail.users.messages.send({
                                userId: 'me',
                                requestBody: {
                                    raw: encodedMessage,
                                },
                            })];
                    case 2:
                        result = _a.sent();
                        console.log('Email enviado exitosamente con Gmail API:', result.data.id);
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error al enviar email con Gmail API:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GmailService;
}());
export { GmailService };
