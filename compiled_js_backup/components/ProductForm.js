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
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
export default function ProductForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess;
    var toast = useToast().toast;
    var _b = useState(""), nombre = _b[0], setNombre = _b[1];
    var _c = useState(""), descripcion = _c[0], setDescripcion = _c[1];
    var _d = useState(""), precio = _d[0], setPrecio = _d[1];
    var _e = useState(""), categoria = _e[0], setCategoria = _e[1];
    var _f = useState([]), categories = _f[0], setCategories = _f[1];
    var _g = useState(false), loading = _g[0], setLoading = _g[1];
    useEffect(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var api, res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, import("@/lib/api")];
                    case 1:
                        api = _a.sent();
                        return [4 /*yield*/, api.productosApi.getCategories()];
                    case 2:
                        res = _a.sent();
                        if (Array.isArray(res))
                            setCategories(res);
                        else if (res.items)
                            setCategories(res.items);
                        else
                            setCategories(res);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error("Error cargando categorías:", e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var payload, api, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    payload = { nombre: nombre, descripcion: descripcion, precio: Number(precio) };
                    if (categoria)
                        payload.categoriaId = Number(categoria);
                    return [4 /*yield*/, import("@/lib/api")];
                case 2:
                    api = _a.sent();
                    return [4 /*yield*/, api.productosApi.create(payload)];
                case 3:
                    _a.sent();
                    toast({ title: "Publicación creada", description: "Tu producto se ha enviado y estará pendiente de aprobación." });
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error("Error creando producto:", err_1);
                    toast({ title: "Error", description: (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "No se pudo crear el producto" });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={function (e) { return setNombre(e.target.value); }} required/>
            </div>

            <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" value={descripcion} onChange={function (e) { return setDescripcion(e.target.value); }}/>
            </div>

            <div>
                <Label htmlFor="precio">Precio</Label>
                <Input id="precio" type="number" value={precio} onChange={function (e) { return setPrecio(Number(e.target.value)); }} required/>
            </div>

            <div>
                <Label htmlFor="categoria">Categoría</Label>
                <select id="categoria" value={categoria} onChange={function (e) { return setCategoria(e.target.value); }} className="w-full border border-border rounded px-2 py-1" required>
                    <option value="">-- Selecciona una categoría --</option>
                    {categories.map(function (c) { return (<option key={c.id} value={c.id}>{c.nombre}</option>); })}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Selecciona una categoría existente.</p>
            </div>

            <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                    {loading ? "Publicando..." : "Publicar"}
                </Button>
            </div>
        </form>);
}
