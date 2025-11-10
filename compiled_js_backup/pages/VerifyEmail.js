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
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
export default function VerifyEmail() {
    var _this = this;
    var _a, _b, _c;
    var _d = useState(''), codigo = _d[0], setCodigo = _d[1];
    var _e = useState(false), loading = _e[0], setLoading = _e[1];
    var _f = useState(''), error = _f[0], setError = _f[1];
    var _g = useState(false), success = _g[0], setSuccess = _g[1];
    var _h = useState(900), tiempoRestante = _h[0], setTiempoRestante = _h[1];
    var _j = useState(3), reintentosRestantes = _j[0], setReintentosRestantes = _j[1];
    var navigate = useNavigate();
    var location = useLocation();
    var usuarioId = (_a = location.state) === null || _a === void 0 ? void 0 : _a.usuarioId;
    var correoUsuario = (_b = location.state) === null || _b === void 0 ? void 0 : _b.correo;
    var nombreUsuario = (_c = location.state) === null || _c === void 0 ? void 0 : _c.nombre;
    useEffect(function () {
        if (!usuarioId) {
            navigate('/auth');
        }
    }, [usuarioId, navigate]);
    useEffect(function () {
        if (tiempoRestante <= 0) {
            setError('El código ha expirado. Por favor, solicita uno nuevo.');
            return;
        }
        var intervalo = setInterval(function () {
            setTiempoRestante(function (prev) { return prev - 1; });
        }, 1000);
        return function () { return clearInterval(intervalo); };
    }, [tiempoRestante]);
    var formatearTiempo = function (segundos) {
        var minutos = Math.floor(segundos / 60);
        var segs = segundos % 60;
        return "".concat(minutos.toString().padStart(2, '0'), ":").concat(segs.toString().padStart(2, '0'));
    };
    var handleCodigoChange = function (e) {
        var valor = e.target.value.replace(/\D/g, '');
        if (valor.length <= 6) {
            setCodigo(valor);
            setError('');
        }
    };
    var verificarCodigo = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (codigo.length !== 6) {
                        setError('El código debe tener 6 dígitos');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('http://localhost:4000/api/auth/verify-code', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                usuarioId: usuarioId,
                                codigo: codigo
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (response.ok) {
                        setSuccess(true);
                        toast.success('¡Cuenta verificada exitosamente!');
                        setTimeout(function () {
                            navigate('/auth', {
                                state: {
                                    mensaje: 'Cuenta verificada correctamente. Ahora puedes iniciar sesión.',
                                    correo: correoUsuario
                                }
                            });
                        }, 2000);
                    }
                    else {
                        setReintentosRestantes(function (prev) { return prev - 1; });
                        setError(data.message || 'Código inválido o expirado');
                        toast.error(data.message || 'Código incorrecto');
                        if (reintentosRestantes <= 1) {
                            setError('Se agotaron los intentos. Solicita un nuevo código.');
                        }
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    setError('Error al verificar el código. Intenta de nuevo.');
                    toast.error('Error de conexión');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var reenviarCodigo = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('http://localhost:4000/api/auth/send-verification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ usuarioId: usuarioId })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (response.ok) {
                        setError('');
                        setCodigo('');
                        setTiempoRestante(900);
                        setReintentosRestantes(3);
                        toast.success('Código reenviado a ' + correoUsuario);
                    }
                    else {
                        setError(data.message || 'Error al reenviar el código');
                        toast.error(data.message || 'Error al reenviar');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    setError('Error al reenviar el código');
                    toast.error('Error de conexión');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (!usuarioId) {
        return null;
    }
    return (
    // ✅ CAMBIO: De azul a turquesa (background del sistema)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background py-12 px-4 sm:px-6 lg:px-8">
            {/* ✅ CAMBIO: Card con colores del sistema */}
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg border-2 border-primary/20">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-foreground">
                        Verificar Email
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ingresa el código de 6 dígitos enviado a
                    </p>
                    {/* ✅ CAMBIO: Color primary (turquesa) */}
                    <p className="text-sm font-medium text-primary">
                        {correoUsuario}
                    </p>
                </div>


                {success && (
        // ✅ CAMBIO: Verde cohesivo con el sistema
        <div className="bg-primary/10 border border-primary/30 rounded-md p-4">
                        <p className="text-primary text-center font-medium">
                            ✅ Cuenta verificada correctamente
                        </p>
                        <p className="text-primary/80 text-center text-sm mt-2">
                            Redirigiendo al login...
                        </p>
                    </div>)}


                {error && (
        // ✅ CAMBIO: Error con color destructive del sistema
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                        <p className="text-destructive text-sm">
                            ❌ {error}
                        </p>
                    </div>)}


                <div className="space-y-6">
                    <div>
                        <label htmlFor="codigo" className="block text-sm font-medium text-foreground">
                            Código de verificación
                        </label>
                        {/* ✅ CAMBIO: Input con colores del sistema */}
                        <input id="codigo" type="text" maxLength={6} value={codigo} onChange={handleCodigoChange} disabled={loading || success} className="appearance-none relative block w-full px-3 py-4 border-2 border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-center text-4xl tracking-widest font-bold mt-2 disabled:bg-muted disabled:opacity-50" placeholder="000000"/>
                    </div>


                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Código expira en:{' '}
                            <span className={"font-bold ".concat(tiempoRestante < 300 ? 'text-destructive' : 'text-primary')}>
                                {formatearTiempo(tiempoRestante)}
                            </span>
                        </p>
                    </div>


                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Intentos restantes: {reintentosRestantes}
                        </p>
                    </div>


                    {/* ✅ CAMBIO: Botón con colores primary (turquesa) */}
                    <button onClick={verificarCodigo} disabled={loading || codigo.length !== 6 || success || tiempoRestante <= 0} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed transition-colors duration-200">
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>


                    {/* ✅ CAMBIO: Botón secundario con colores del sistema */}
                    <button onClick={reenviarCodigo} disabled={loading || success} className="w-full text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200">
                        ¿No recibiste el código? Reenviar
                    </button>


                    {/* ✅ CAMBIO: Botón terciario */}
                    <button onClick={function () { return navigate('/auth'); }} disabled={loading} className="w-full text-sm text-muted-foreground hover:text-foreground disabled:text-muted-foreground disabled:opacity-50 transition-colors duration-200">
                        Volver al registro
                    </button>
                </div>


                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        💡 El código es válido por 15 minutos. Si no lo recibiste, revisa tu carpeta de spam o solicita uno nuevo.
                    </p>
                </div>
            </div>
        </div>);
}
