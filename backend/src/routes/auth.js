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
import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { sign } from "../lib/jwt.js";
import { GmailService } from "../lib/gmailService.js";
var r = Router();
// LOGIN
r.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, correo, password, rows, user, hash, ok, _b, rolesResult, roles, payload, token, error_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                _a = req.body, correo = _a.correo, password = _a.password;
                return [4 /*yield*/, pool.query("SELECT id, nombre, apellido, correo, passwordHash FROM USUARIOS WHERE correo=? LIMIT 1", [correo])];
            case 1:
                rows = (_d.sent())[0];
                user = rows[0];
                if (!user)
                    return [2 /*return*/, res.status(401).json({ message: "Credenciales inválidas" })];
                hash = (_c = user.passwordHash) !== null && _c !== void 0 ? _c : "";
                if (!(hash.startsWith("$2a$") || hash.startsWith("$2b$"))) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt.compare(password, hash)];
            case 2:
                _b = _d.sent();
                return [3 /*break*/, 4];
            case 3:
                _b = password === hash;
                _d.label = 4;
            case 4:
                ok = _b;
                if (!ok)
                    return [2 /*return*/, res.status(401).json({ message: "Credenciales inválidas" })];
                return [4 /*yield*/, pool.query("SELECT r.id, r.nombre FROM usuarios_roles ur JOIN roles r ON ur.rolId = r.id WHERE ur.usuarioId = ?", [user.id])];
            case 5:
                rolesResult = (_d.sent())[0];
                roles = rolesResult.map(function (r) { return r.nombre; });
                payload = {
                    sub: user.id.toString(),
                    rol: roles.join(",") // Guardar todos los roles en el token
                };
                token = sign(payload);
                return [2 /*return*/, res.json({
                        token: token,
                        usuario: {
                            id: user.id,
                            nombre: user.nombre,
                            apellido: user.apellido,
                            correo: user.correo,
                            roles: roles // Devolver array de roles
                        }
                    })];
            case 6:
                error_1 = _d.sent();
                console.error("Login error:", error_1);
                return [2 /*return*/, res.status(500).json({ message: "Error al iniciar sesión" })];
            case 7: return [2 /*return*/];
        }
    });
}); });
// REGISTER
r.post("/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nombre, apellido, correo, password, telefono, direccion, existing, hash, result, usuarioId, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, nombre = _a.nombre, apellido = _a.apellido, correo = _a.correo, password = _a.password, telefono = _a.telefono, direccion = _a.direccion;
                // Validaciones básicas
                if (!nombre || !apellido || !correo || !password) {
                    return [2 /*return*/, res.status(400).json({ message: "Faltan campos requeridos" })];
                }
                return [4 /*yield*/, pool.query("SELECT id FROM USUARIOS WHERE correo = ? LIMIT 1", [correo])];
            case 1:
                existing = (_b.sent())[0];
                if (existing.length > 0) {
                    return [2 /*return*/, res.status(409).json({ message: "El correo ya está registrado" })];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 2:
                hash = _b.sent();
                return [4 /*yield*/, pool.query("INSERT INTO USUARIOS (nombre, apellido, correo, passwordHash, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)", [nombre, apellido, correo, hash, telefono, direccion])];
            case 3:
                result = (_b.sent())[0];
                usuarioId = result.insertId;
                // ✅ NUEVO: Asignar rol COMPRADOR automáticamente
                return [4 /*yield*/, pool.query("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES (?, 1)", [usuarioId])];
            case 4:
                // ✅ NUEVO: Asignar rol COMPRADOR automáticamente
                _b.sent();
                console.log("Usuario ".concat(usuarioId, " registrado como COMPRADOR"));
                return [2 /*return*/, res.status(201).json({
                        message: "Usuario registrado exitosamente",
                        usuarioId: usuarioId
                    })];
            case 5:
                error_2 = _b.sent();
                console.error("Register error:", error_2);
                return [2 /*return*/, res.status(500).json({ message: "Error al registrar usuario" })];
            case 6: return [2 /*return*/];
        }
    });
}); });
// SEND VERIFICATION CODE
r.post("/send-verification", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var usuarioId, usuarios, usuario, codigo, fechaExpiracion, gmailService, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                usuarioId = req.body.usuarioId;
                console.log("send-verification body:", req.body);
                if (!usuarioId) {
                    return [2 /*return*/, res.status(400).json({ message: "usuarioId es requerido" })];
                }
                return [4 /*yield*/, pool.query("SELECT id, nombre, correo, cuentaVerificada FROM USUARIOS WHERE id = ? LIMIT 1", [usuarioId])];
            case 1:
                usuarios = (_a.sent())[0];
                if (usuarios.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Usuario no encontrado" })];
                }
                usuario = usuarios[0];
                // Verificar si ya está verificado
                if (usuario.cuentaVerificada) {
                    return [2 /*return*/, res.status(400).json({ message: "La cuenta ya está verificada" })];
                }
                codigo = Math.floor(100000 + Math.random() * 900000).toString();
                fechaExpiracion = new Date();
                fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);
                // Actualizar código en la tabla USUARIOS
                return [4 /*yield*/, pool.query("UPDATE USUARIOS SET codigoVerificacion = ?, codigoExpiracion = ? WHERE id = ?", [codigo, fechaExpiracion, usuarioId])];
            case 2:
                // Actualizar código en la tabla USUARIOS
                _a.sent();
                gmailService = new GmailService();
                return [4 /*yield*/, gmailService.enviarCodigoVerificacion(usuario.correo, codigo, usuario.nombre)];
            case 3:
                _a.sent();
                console.log("C\u00F3digo de verificaci\u00F3n enviado a ".concat(usuario.correo, ": ").concat(codigo));
                return [2 /*return*/, res.json({
                        message: "Código de verificación enviado exitosamente",
                        expiraEn: fechaExpiracion
                    })];
            case 4:
                error_3 = _a.sent();
                console.error("send-verification error:", error_3);
                return [2 /*return*/, res.status(500).json({
                        message: "Error al enviar código de verificación"
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// VERIFY CODE
r.post("/verify-code", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, usuarioId, codigo, usuarios, usuario, ahora, expiracion, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, usuarioId = _a.usuarioId, codigo = _a.codigo;
                if (!usuarioId || !codigo) {
                    return [2 /*return*/, res.status(400).json({ message: "usuarioId y codigo son requeridos" })];
                }
                return [4 /*yield*/, pool.query("SELECT id, nombre, correo, codigoVerificacion, codigoExpiracion, cuentaVerificada FROM USUARIOS WHERE id = ? LIMIT 1", [usuarioId])];
            case 1:
                usuarios = (_b.sent())[0];
                if (usuarios.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Usuario no encontrado" })];
                }
                usuario = usuarios[0];
                // Verificar si ya está verificado
                if (usuario.cuentaVerificada) {
                    return [2 /*return*/, res.status(400).json({ message: "La cuenta ya está verificada" })];
                }
                // Verificar que existe un código
                if (!usuario.codigoVerificacion || !usuario.codigoExpiracion) {
                    return [2 /*return*/, res.status(400).json({ message: "No hay código de verificación pendiente" })];
                }
                ahora = new Date();
                expiracion = new Date(usuario.codigoExpiracion);
                if (ahora > expiracion) {
                    return [2 /*return*/, res.status(400).json({ message: "El código de verificación ha expirado" })];
                }
                // Verificar el código
                if (usuario.codigoVerificacion !== codigo) {
                    return [2 /*return*/, res.status(400).json({ message: "Código de verificación inválido" })];
                }
                // Marcar como verificado y limpiar el código
                return [4 /*yield*/, pool.query("UPDATE USUARIOS SET cuentaVerificada = 1, codigoVerificacion = NULL, codigoExpiracion = NULL WHERE id = ?", [usuarioId])];
            case 2:
                // Marcar como verificado y limpiar el código
                _b.sent();
                return [2 /*return*/, res.json({
                        message: "Cuenta verificada exitosamente"
                    })];
            case 3:
                error_4 = _b.sent();
                console.error("verify-code error:", error_4);
                return [2 /*return*/, res.status(500).json({
                        message: "Error al verificar código"
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ✅ NUEVO ENDPOINT: Cambiar usuario a VENDEDOR (cuando publica su primer producto)
r.post("/cambiar-a-vendedor", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var usuarioId, usuarios, rolExistente, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                usuarioId = req.body.usuarioId;
                if (!usuarioId) {
                    return [2 /*return*/, res.status(400).json({ message: "usuarioId es requerido" })];
                }
                return [4 /*yield*/, pool.query("SELECT id FROM USUARIOS WHERE id = ? LIMIT 1", [usuarioId])];
            case 1:
                usuarios = (_a.sent())[0];
                if (usuarios.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Usuario no encontrado" })];
                }
                return [4 /*yield*/, pool.query("SELECT * FROM usuarios_roles WHERE usuarioId = ? AND rolId = 2", [usuarioId])];
            case 2:
                rolExistente = (_a.sent())[0];
                if (rolExistente.length > 0) {
                    return [2 /*return*/, res.status(400).json({ message: "El usuario ya es vendedor" })];
                }
                // Agregar rol de VENDEDOR (sin eliminar COMPRADOR)
                return [4 /*yield*/, pool.query("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES (?, 2)", [usuarioId])];
            case 3:
                // Agregar rol de VENDEDOR (sin eliminar COMPRADOR)
                _a.sent();
                console.log("Usuario ".concat(usuarioId, " ahora es VENDEDOR"));
                return [2 /*return*/, res.json({
                        message: "Usuario convertido a vendedor exitosamente"
                    })];
            case 4:
                error_5 = _a.sent();
                console.error("cambiar-a-vendedor error:", error_5);
                return [2 /*return*/, res.status(500).json({
                        message: "Error al cambiar a vendedor"
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
export default r;
