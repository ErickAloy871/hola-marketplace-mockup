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
import { verifyToken, requireModerator } from "../middleware/roleMiddleware.js";
var r = Router();
// Todas las rutas requieren autenticación y rol MODERADOR
r.use(verifyToken, requireModerator);
// Obtener todas las publicaciones PENDIENTES Y PUBLICADAS
r.get("/publicaciones-moderacion", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var publicaciones, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT \n        p.id, \n        p.nombre, \n        p.descripcion, \n        p.precio, \n        p.ubicacion, \n        p.estado,\n        p.fechaPublicacion,\n        c.nombre AS categoria,\n        CONCAT(u.nombre, ' ', u.apellido) AS vendedorNombre,\n        u.correo AS vendedorCorreo,\n        f.urlFoto\n       FROM publicaciones p\n       JOIN categorias c ON c.id = p.categoriaId\n       JOIN usuarios u ON u.id = p.usuarioId\n       LEFT JOIN fotos_publicacion f ON f.publicacionId = p.id AND f.orden = 1\n       WHERE p.estado IN ('PENDIENTE', 'PUBLICADA')\n       ORDER BY p.fechaPublicacion DESC")];
            case 1:
                publicaciones = (_a.sent())[0];
                res.json({
                    publicaciones: publicaciones,
                    total: publicaciones.length
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error al obtener publicaciones para moderación:", error_1);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
r.post("/approve/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, publicaciones, publicacion, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.query("SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1", [id])];
            case 2:
                publicaciones = (_a.sent())[0];
                if (publicaciones.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Publicación no encontrada" })];
                }
                publicacion = publicaciones[0];
                if (publicacion.estado !== "PENDIENTE") {
                    return [2 /*return*/, res.status(400).json({
                            message: "La publicaci\u00F3n ya est\u00E1 ".concat(publicacion.estado)
                        })];
                }
                return [4 /*yield*/, pool.query("UPDATE publicaciones SET estado = 'PUBLICADA' WHERE id = ?", [id])];
            case 3:
                _a.sent();
                res.json({
                    message: "Publicación aprobada exitosamente",
                    publicacionId: id
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error("Error al aprobar publicación:", error_2);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
r.post("/reject/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, motivo, publicaciones, publicacion, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                motivo = req.body.motivo;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.query("SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1", [id])];
            case 2:
                publicaciones = (_a.sent())[0];
                if (publicaciones.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Publicación no encontrada" })];
                }
                publicacion = publicaciones[0];
                if (publicacion.estado !== "PENDIENTE") {
                    return [2 /*return*/, res.status(400).json({
                            message: "La publicaci\u00F3n ya est\u00E1 ".concat(publicacion.estado)
                        })];
                }
                return [4 /*yield*/, pool.query("UPDATE publicaciones SET estado = 'RECHAZADA' WHERE id = ?", [id])];
            case 3:
                _a.sent();
                console.log("\u274C Publicaci\u00F3n ".concat(id, " rechazada. Motivo: ").concat(motivo || 'No especificado'));
                res.json({
                    message: "Publicación rechazada exitosamente",
                    publicacionId: id
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error("Error al rechazar publicación:", error_3);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// NUEVO: Dar de baja un producto aprobado o pendiente
r.post('/dar-baja/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, motivo, publicaciones, publicacion, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                motivo = req.body.motivo;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.query("SELECT id, estado FROM publicaciones WHERE id = ? LIMIT 1", [id])];
            case 2:
                publicaciones = (_a.sent())[0];
                if (publicaciones.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Publicación no encontrada" })];
                }
                publicacion = publicaciones[0];
                if (publicacion.estado !== "PUBLICADA" && publicacion.estado !== "PENDIENTE") {
                    return [2 /*return*/, res.status(400).json({
                            message: "No se puede dar de baja una publicaci\u00F3n en estado ".concat(publicacion.estado)
                        })];
                }
                return [4 /*yield*/, pool.query("UPDATE publicaciones SET estado = 'DADO_DE_BAJA' WHERE id = ?", [id])];
            case 3:
                _a.sent();
                console.log("Publicaci\u00F3n ".concat(id, " dada de baja. Motivo: ").concat(motivo || 'No especificado'));
                res.json({
                    message: "Publicación dada de baja exitosamente",
                    publicacionId: id
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error("Error al dar de baja publicación:", error_4);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
r.get("/stats", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pendientes, aprobadas, rechazadas, dadasDeBaja, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'PENDIENTE'")];
            case 1:
                pendientes = (_a.sent())[0];
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'PUBLICADA'")];
            case 2:
                aprobadas = (_a.sent())[0];
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'RECHAZADA'")];
            case 3:
                rechazadas = (_a.sent())[0];
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as total FROM publicaciones WHERE estado = 'DADO_DE_BAJA'")];
            case 4:
                dadasDeBaja = (_a.sent())[0];
                res.json({
                    pendientes: pendientes[0].total,
                    aprobadas: aprobadas[0].total,
                    rechazadas: rechazadas[0].total,
                    dadasDeBaja: dadasDeBaja[0].total,
                });
                return [3 /*break*/, 6];
            case 5:
                error_5 = _a.sent();
                console.error("Error al obtener estadísticas:", error_5);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
export default r;
