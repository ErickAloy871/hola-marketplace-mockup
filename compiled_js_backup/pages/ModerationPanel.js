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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { moderationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
var ModerationPanel = function () {
    var _a = useAuth(), user = _a.user, isAuthenticated = _a.isAuthenticated, loading = _a.loading;
    var navigate = useNavigate();
    var _b = useState([]), productos = _b[0], setProductos = _b[1];
    var _c = useState(true), loadingData = _c[0], setLoadingData = _c[1];
    var _d = useState("pendientes"), activeTab = _d[0], setActiveTab = _d[1];
    useEffect(function () {
        var _a;
        if (loading)
            return;
        if (!isAuthenticated || !((_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.includes("MODERADOR"))) {
            navigate("/");
            return;
        }
        loadData();
    }, [isAuthenticated, user, loading]);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoadingData(true);
                    return [4 /*yield*/, moderationApi.getAllModeration()];
                case 1:
                    response = _a.sent();
                    setProductos(response.publicaciones);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error loading moderation products:", error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoadingData(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleApprove = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, moderationApi.approve(id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadData()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    alert("Error al aprobar el producto");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var motivo, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    motivo = prompt("Motivo del rechazo (opcional):");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, moderationApi.reject(id, motivo || undefined)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, loadData()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    alert("Error al rechazar el producto");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDarDeBaja = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var motivo, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    motivo = prompt("Motivo para dar de baja (opcional):");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, moderationApi.darDeBaja(id, motivo || undefined)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, loadData()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    alert("Error al dar de baja el producto");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var productosPendientes = productos.filter(function (p) { return p.estado === "PENDIENTE"; });
    var productosPublicadas = productos.filter(function (p) { return p.estado === "PUBLICADA"; });
    if (loading || loadingData) {
        return (<div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando panel de moderación...</p>
      </div>);
    }
    return (<div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto py-10 px-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Panel de Moderación</h1>

        {/* Pestañas */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button onClick={function () { return setActiveTab("pendientes"); }} className={"pb-2 px-4 font-semibold transition-colors ".concat(activeTab === "pendientes"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground hover:text-foreground")}>
            Pendientes ({productosPendientes.length})
          </button>
          <button onClick={function () { return setActiveTab("publicadas"); }} className={"pb-2 px-4 font-semibold transition-colors ".concat(activeTab === "publicadas"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground hover:text-foreground")}>
            Publicadas ({productosPublicadas.length})
          </button>
        </div>

        {/* Contenido de la pestaña activa */}
        {activeTab === "pendientes" && (<>
            <h2 className="text-2xl font-semibold mb-4">Publicaciones Pendientes</h2>
            {productosPendientes.length === 0 ? (<Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay publicaciones pendientes
                </CardContent>
              </Card>) : (<div className="grid grid-cols-1 gap-4">
                {productosPendientes.map(function (producto) { return (<Card key={producto.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {producto.urlFoto && (<img src={"http://localhost:4000/uploads/".concat(producto.urlFoto.replace('/uploads/', ''))} alt={producto.nombre} className="w-32 h-32 object-cover rounded-md"/>)}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{producto.descripcion}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Precio:</strong> ${producto.precio}</p>
                            <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                            <p><strong>Vendedor:</strong> {producto.vendedorNombre} ({producto.vendedorCorreo})</p>
                            <p><strong>Fecha:</strong> {new Date(producto.fechaPublicacion).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={function () { return handleApprove(producto.id); }} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4"/>
                            Aprobar
                          </Button>
                          <Button onClick={function () { return handleReject(producto.id); }} variant="destructive">
                            <XCircle className="mr-2 h-4 w-4"/>
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </>)}

        {activeTab === "publicadas" && (<>
            <h2 className="text-2xl font-semibold mb-4">Publicaciones Aprobadas</h2>
            {productosPublicadas.length === 0 ? (<Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay publicaciones aprobadas
                </CardContent>
              </Card>) : (<div className="grid grid-cols-1 gap-4">
                {productosPublicadas.map(function (producto) { return (<Card key={producto.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {producto.urlFoto && (<img src={"http://localhost:4000/uploads/".concat(producto.urlFoto.replace('/uploads/', ''))} alt={producto.nombre} className="w-32 h-32 object-cover rounded-md"/>)}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{producto.descripcion}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Precio:</strong> ${producto.precio}</p>
                            <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                            <p><strong>Vendedor:</strong> {producto.vendedorNombre} ({producto.vendedorCorreo})</p>
                            <p><strong>Fecha:</strong> {new Date(producto.fechaPublicacion).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={function () { return handleDarDeBaja(producto.id); }} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Dar de baja
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </>)}
      </main>

      <Footer />
    </div>);
};
export default ModerationPanel;
