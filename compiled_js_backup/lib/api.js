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
var API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
// URL base del backend (sin el sufijo /api). Usar la variable VITE_API_URL si está definida.
export var BACKEND_BASE = (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "http://localhost:4000");
export function api(path_1) {
    return __awaiter(this, arguments, void 0, function (path, opts) {
        var token, headers, res, _a;
        if (opts === void 0) { opts = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = localStorage.getItem("token");
                    headers = __assign({ "Content-Type": "application/json" }, (token ? { Authorization: "Bearer ".concat(token) } : {}));
                    return [4 /*yield*/, fetch(API + path, __assign(__assign({}, opts), { headers: headers }))];
                case 1:
                    res = _b.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    _a = Error.bind;
                    return [4 /*yield*/, res.text()];
                case 2: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                case 3: return [2 /*return*/, res.json()];
            }
        });
    });
}
// Funciones específicas para la API
export var authApi = {
    login: function (correo, password) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ correo: correo, password: password })
                })];
        });
    }); },
    register: function (nombre, apellido, correo, password, telefono, direccion) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ nombre: nombre, apellido: apellido, correo: correo, password: password, telefono: telefono, direccion: direccion })
                })];
        });
    }); },
    me: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/auth/me")];
        });
    }); }
};
export var productosApi = {
    getAll: function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var searchParams, query;
        return __generator(this, function (_a) {
            searchParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (value !== undefined)
                        searchParams.append(key, value.toString());
                });
            }
            query = searchParams.toString();
            return [2 /*return*/, api("/productos".concat(query ? "?".concat(query) : ""))];
        });
    }); },
    getById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/productos/".concat(id))];
        });
    }); },
    // ✅ NUEVO: Crear producto
    create: function (productoData) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/productos", {
                    method: "POST",
                    body: JSON.stringify(productoData)
                })];
        });
    }); }
};
// ✅ NUEVO: API de moderación
export var moderationApi = {
    getPending: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/pending")];
        });
    }); },
    approve: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/approve/".concat(id), {
                    method: "POST"
                })];
        });
    }); },
    reject: function (id, motivo) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/reject/".concat(id), {
                    method: "POST",
                    body: JSON.stringify({ motivo: motivo })
                })];
        });
    }); },
    getStats: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/stats")];
        });
    }); },
    // ✅ AGREGADO: Obtener todas las publicaciones pendientes/publicadas (para el panel)
    getAllModeration: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/publicaciones-moderacion")];
        });
    }); },
    // ✅ AGREGADO: Dar de baja producto (pendiente o publicado)
    darDeBaja: function (id, motivo) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/moderation/dar-baja/".concat(id), {
                    method: "POST",
                    body: JSON.stringify({ motivo: motivo })
                })];
        });
    }); },
    // Obtener categorías activas
    getCategories: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api("/categorias")];
        });
    }); }
};
