var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken, blockModerator } from "../middleware/roleMiddleware.js"; // ✅ NUEVO
var r = Router();
/* =============================
   � GET /categorias → listar categorías activas
   ============================= */
r.get("/categorias", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT id, nombre FROM CATEGORIAS WHERE activa = 1 ORDER BY nombre ASC")];
            case 1:
                rows = (_a.sent())[0];
                res.json(rows);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error al obtener categorias:", error_1);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/* =============================
   �📦 GET /productos → listar productos
   ============================= */
r.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, q, categoria, minPrecio, maxPrecio, _b, page, _c, pageSize, p, ps, where, args, whereSql, items, countRows, err_1;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 3, , 4]);
                _a = req.query, q = _a.q, categoria = _a.categoria, minPrecio = _a.minPrecio, maxPrecio = _a.maxPrecio, _b = _a.page, page = _b === void 0 ? "1" : _b, _c = _a.pageSize, pageSize = _c === void 0 ? "12" : _c;
                p = Number(page);
                ps = Number(pageSize);
                where = [
                    "(PUBLICACIONES.estado IS NULL OR PUBLICACIONES.estado='PUBLICADA')",
                    "PUBLICACIONES.disponibilidad = 1",
                ];
                args = [];
                if (q) {
                    where.push("(PUBLICACIONES.nombre LIKE ? OR PUBLICACIONES.descripcion LIKE ?)");
                    args.push("%".concat(q, "%"), "%".concat(q, "%"));
                }
                if (categoria) {
                    where.push("CATEGORIAS.nombre = ?");
                    args.push(categoria);
                }
                if (minPrecio) {
                    where.push("PUBLICACIONES.precio >= ?");
                    args.push(Number(minPrecio));
                }
                if (maxPrecio) {
                    where.push("PUBLICACIONES.precio <= ?");
                    args.push(Number(maxPrecio));
                }
                whereSql = where.length ? "WHERE ".concat(where.join(" AND ")) : "";
                return [4 /*yield*/, pool.query("SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,\n              PUBLICACIONES.ubicacion, CATEGORIAS.nombre AS categoria, f.urlFoto\n       FROM PUBLICACIONES\n       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId\n       LEFT JOIN fotos_publicacion f ON f.publicacionId = PUBLICACIONES.id AND f.orden = 1\n       ".concat(whereSql, "\n       ORDER BY PUBLICACIONES.fechaPublicacion DESC\n       LIMIT ? OFFSET ?"), __spreadArray(__spreadArray([], args, true), [ps, (p - 1) * ps], false))];
            case 1:
                items = (_f.sent())[0];
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as total\n       FROM PUBLICACIONES\n       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId\n       ".concat(whereSql), args)];
            case 2:
                countRows = (_f.sent())[0];
                res.json({
                    items: items,
                    total: (_e = (_d = countRows[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0,
                    page: p,
                    pageSize: ps,
                });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _f.sent();
                console.error("Error al obtener productos:", err_1);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/* =============================
   🛒 GET /productos/:id → obtener un producto
   ============================= */
r.get("/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, productRows, imageRows, product, imagenes, productWithImages, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.query("SELECT PUBLICACIONES.id, PUBLICACIONES.nombre, PUBLICACIONES.descripcion, PUBLICACIONES.precio,\n              PUBLICACIONES.ubicacion, CATEGORIAS.nombre AS categoria, f.urlFoto\n       FROM PUBLICACIONES\n       JOIN CATEGORIAS ON CATEGORIAS.id = PUBLICACIONES.categoriaId\n       LEFT JOIN fotos_publicacion f ON f.publicacionId = PUBLICACIONES.id AND f.orden = 1\n       WHERE PUBLICACIONES.id = ? \n         AND (PUBLICACIONES.estado IS NULL OR PUBLICACIONES.estado = 'PUBLICADA')\n       LIMIT 1", [id])];
            case 2:
                productRows = (_a.sent())[0];
                if (productRows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "Producto no encontrado" })];
                }
                return [4 /*yield*/, pool.query("SELECT urlFoto, orden FROM fotos_publicacion \n       WHERE publicacionId = ? \n       ORDER BY orden ASC", [id])];
            case 3:
                imageRows = (_a.sent())[0];
                product = productRows[0];
                imagenes = imageRows.map(function (row) { return row.urlFoto; });
                productWithImages = __assign(__assign({}, product), { imagenes: imagenes.length > 0 ? imagenes : (product.urlFoto ? [product.urlFoto] : []) });
                res.json(productWithImages);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                console.error("Error al obtener producto:", err_2);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/* =============================
   ✅ NUEVO: POST /productos → crear producto
   Solo VENDEDORES pueden crear productos (NO moderadores)
   ============================= */
r.post("/", verifyToken, blockModerator, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, nombre, descripcion, precio, ubicacion, categoriaId, categoria, vendedorId, finalCategoriaId, rows, insertCat, finalUbicacion, uRows, result, publicacionId, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 8, , 9]);
                _a = req.body, nombre = _a.nombre, descripcion = _a.descripcion, precio = _a.precio, ubicacion = _a.ubicacion, categoriaId = _a.categoriaId, categoria = _a.categoria;
                vendedorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                // Validaciones mínimas
                if (!nombre || !precio) {
                    return [2 /*return*/, res.status(400).json({ message: "Faltan campos requeridos: nombre, precio" })];
                }
                finalCategoriaId = categoriaId;
                if (!(!finalCategoriaId && categoria)) return [3 /*break*/, 4];
                return [4 /*yield*/, pool.query("SELECT id FROM CATEGORIAS WHERE LOWER(nombre)=LOWER(?) LIMIT 1", [categoria])];
            case 1:
                rows = (_c.sent())[0];
                if (!(rows.length > 0)) return [3 /*break*/, 2];
                finalCategoriaId = rows[0].id;
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, pool.query("INSERT INTO CATEGORIAS (nombre, descripcion, activa, fecha_creacion) VALUES (?, '', 1, NOW())", [categoria])];
            case 3:
                insertCat = (_c.sent())[0];
                finalCategoriaId = insertCat.insertId;
                _c.label = 4;
            case 4:
                finalUbicacion = ubicacion;
                if (!!finalUbicacion) return [3 /*break*/, 6];
                return [4 /*yield*/, pool.query("SELECT direccion FROM USUARIOS WHERE id = ? LIMIT 1", [vendedorId])];
            case 5:
                uRows = (_c.sent())[0];
                if (uRows.length > 0) {
                    finalUbicacion = uRows[0].direccion || null;
                }
                _c.label = 6;
            case 6: return [4 /*yield*/, pool.query("INSERT INTO PUBLICACIONES (nombre, descripcion, precio, ubicacion, categoriaId, vendedorId, estado, fechaPublicacion)\n       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())", [nombre, descripcion, precio, finalUbicacion, finalCategoriaId, vendedorId])];
            case 7:
                result = (_c.sent())[0];
                publicacionId = result.insertId;
                console.log("\u2705 Nueva publicaci\u00F3n creada: ".concat(publicacionId, " por vendedor ").concat(vendedorId));
                res.status(201).json({
                    message: "Publicación creada exitosamente. Pendiente de aprobación",
                    publicacionId: publicacionId
                });
                return [3 /*break*/, 9];
            case 8:
                error_2 = _c.sent();
                console.error("Error al crear publicación:", error_2);
                res.status(500).json({ message: "Error interno del servidor" });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
export default r;
