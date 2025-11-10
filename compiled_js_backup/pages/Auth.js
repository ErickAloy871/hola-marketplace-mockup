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
import { useState } from "react";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
var Auth = function () {
    var navigate = useNavigate();
    var searchParams = useSearchParams()[0];
    var login = useAuth().login;
    // ✅ CAMBIO: Obtener el tab desde URL params
    var tabParam = searchParams.get("tab") || "login";
    var _a = useState(tabParam), activeTab = _a[0], setActiveTab = _a[1];
    var _b = useState(""), loginEmail = _b[0], setLoginEmail = _b[1];
    var _c = useState(""), loginPassword = _c[0], setLoginPassword = _c[1];
    var _d = useState(""), registerNombre = _d[0], setRegisterNombre = _d[1];
    var _e = useState(""), registerApellido = _e[0], setRegisterApellido = _e[1];
    var _f = useState(""), registerEmail = _f[0], setRegisterEmail = _f[1];
    var _g = useState(""), registerPassword = _g[0], setRegisterPassword = _g[1];
    var _h = useState(""), registerTelefono = _h[0], setRegisterTelefono = _h[1];
    var _j = useState(""), registerDireccion = _j[0], setRegisterDireccion = _j[1];
    var _k = useState(false), loading = _k[0], setLoading = _k[1];
    var _l = useState(''), error = _l[0], setError = _l[1];
    // ✅ CAMBIO: Login real con API
    var handleLogin = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!loginEmail || !loginPassword) {
                        toast.error("Por favor, completa todos los campos");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('http://localhost:4000/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                correo: loginEmail,
                                password: loginPassword
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    toast.error(errorData.message || 'Credenciales inválidas');
                    setLoading(false);
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    // ✅ Guardar token y usuario
                    login(data.token, data.usuario);
                    toast.success("¡Inicio de sesión exitoso!");
                    // ✅ Redirigir a homepage
                    navigate("/");
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _a.sent();
                    console.error("Error en login:", err_1);
                    toast.error("Error al iniciar sesión");
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleRegister = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, data, usuarioId, sendVerificationResponse, errorData, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, 10, 11]);
                    if (!registerNombre || !registerApellido || !registerEmail ||
                        !registerPassword || !registerTelefono || !registerDireccion) {
                        toast.error("Por favor, completa todos los campos");
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('http://localhost:4000/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nombre: registerNombre,
                                apellido: registerApellido,
                                correo: registerEmail,
                                password: registerPassword,
                                telefono: registerTelefono,
                                direccion: registerDireccion
                            })
                        })];
                case 2:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _c.sent();
                    throw new Error(errorData.message || 'Error en registro');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _c.sent();
                    usuarioId = (_a = data.usuarioId) !== null && _a !== void 0 ? _a : (_b = data.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!usuarioId) {
                        throw new Error("No se recibió el ID del usuario");
                    }
                    console.log("Enviando a send-verification:", { usuarioId: usuarioId });
                    return [4 /*yield*/, fetch('http://localhost:4000/api/auth/send-verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ usuarioId: usuarioId })
                        })];
                case 6:
                    sendVerificationResponse = _c.sent();
                    if (!!sendVerificationResponse.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, sendVerificationResponse.json()];
                case 7:
                    errorData = _c.sent();
                    toast.error('Error al enviar código de verificación');
                    setLoading(false);
                    return [2 /*return*/];
                case 8:
                    toast.success("¡Registro exitoso! Verifica tu email");
                    navigate('/verify-email', {
                        state: { usuarioId: usuarioId, correo: registerEmail, nombre: registerNombre }
                    });
                    return [3 /*break*/, 11];
                case 9:
                    error_1 = _c.sent();
                    console.error("Error en registro:", error_1);
                    toast.error("Error al registrarse. Verifica tus datos.");
                    return [3 /*break*/, 11];
                case 10:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <Button variant="ghost" onClick={function () { return navigate("/"); }} className="absolute top-4 left-4 text-foreground hover:text-primary z-10">
        <ArrowLeft className="w-4 h-4 mr-2"/>
        Volver a la página principal
      </Button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-foreground">Lo que buscas,</span>{" "}
            <span className="text-primary">lo tenemos...</span>
          </h1>
          <div className="flex justify-center mt-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-10 h-10 text-white"/>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl border-4 border-primary/30 p-8">
          {/* ✅ CAMBIO: Usar activeTab y setActiveTab */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
              {/* ✅ CAMBIO: value="register" (no "registrarse") */}
              <TabsTrigger value="register" className="data-[state=active]:bg-card">
                Registrarse
              </TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Iniciar sesión
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground font-semibold">
                    Correo electrónico
                  </Label>
                  <Input id="login-email" type="email" placeholder="tu@correo.com" value={loginEmail} onChange={function (e) { return setLoginEmail(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground font-semibold">
                    Contraseña
                  </Label>
                  <Input id="login-password" type="password" placeholder="••••••" value={loginPassword} onChange={function (e) { return setLoginPassword(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-lg shadow-sm" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Entrar"}
                </Button>
                <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                  ¿Recuperar Contraseña?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nombre" className="text-foreground font-semibold">
                      Nombre
                    </Label>
                    <Input id="register-nombre" type="text" placeholder="Tu nombre" value={registerNombre} onChange={function (e) { return setRegisterNombre(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-apellido" className="text-foreground font-semibold">
                      Apellido
                    </Label>
                    <Input id="register-apellido" type="text" placeholder="Tu apellido" value={registerApellido} onChange={function (e) { return setRegisterApellido(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground font-semibold">
                    Correo electrónico
                  </Label>
                  <Input id="register-email" type="email" placeholder="tu@correo.com" value={registerEmail} onChange={function (e) { return setRegisterEmail(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground font-semibold">
                    Contraseña
                  </Label>
                  <Input id="register-password" type="password" placeholder="••••••" value={registerPassword} onChange={function (e) { return setRegisterPassword(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-telefono" className="text-foreground font-semibold">
                    Teléfono
                  </Label>
                  <Input id="register-telefono" type="tel" placeholder="0991234567" value={registerTelefono} onChange={function (e) { return setRegisterTelefono(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-direccion" className="text-foreground font-semibold">
                    Dirección
                  </Label>
                  <Input id="register-direccion" type="text" placeholder="Tu dirección completa" value={registerDireccion} onChange={function (e) { return setRegisterDireccion(e.target.value); }} className="border-2 border-border focus:border-primary" required/>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-lg shadow-sm" disabled={loading}>
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>);
};
export default Auth;
