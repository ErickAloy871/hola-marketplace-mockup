import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';


export default function VerifyEmail() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState(900);
    const [reintentosRestantes, setReintentosRestantes] = useState(3);
    const [bloqueado, setBloqueado] = useState(false);


    const navigate = useNavigate();
    const location = useLocation();


    const usuarioId = location.state?.usuarioId;
    const correoUsuario = location.state?.correo;
    const nombreUsuario = location.state?.nombre;


    useEffect(() => {
        if (!usuarioId) {
            navigate('/auth');
        }
    }, [usuarioId, navigate]);


    useEffect(() => {
        if (tiempoRestante <= 0) {
            setError('El código ha expirado. Por favor, solicita uno nuevo.');
            return;
        }


        const intervalo = setInterval(() => {
            setTiempoRestante(prev => prev - 1);
        }, 1000);


        return () => clearInterval(intervalo);
    }, [tiempoRestante]);

    useEffect(() => {
        const obtenerEstadoVerificacion = async () => {
            if (!usuarioId) return;

            try {
                const response = await fetch(`http://localhost:4000/api/auth/estado-verificacion/${usuarioId}`);
                const data = await response.json();

                if (response.ok) {
                    setReintentosRestantes(data.intentosRestantes ?? 3);
                    setBloqueado(data.intentosRestantes <= 0);
                }
            } catch (error) {
                console.error('Error al obtener estado:', error);
                // Si falla, mantener el valor por defecto de 3
            }
        };

        obtenerEstadoVerificacion();
    }, [usuarioId]);

    const formatearTiempo = (segundos: number) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };


    const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value.replace(/\D/g, '');
        if (valor.length <= 6) {
            setCodigo(valor);
            setError('');
        }
    };


    const handleVerificar = async () => {
        if (bloqueado || reintentosRestantes <= 0) {
            setError("Se agotaron los intentos. Solicita un nuevo código.");
            return;
        }

        if (codigo.length !== 6) {
            setError("El código debe tener 6 dígitos");
            return;
        }

        setLoading(true);
        setError(''); // ✅ Limpiar errores anteriores

        try {
            const response = await fetch('http://localhost:4000/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, codigo })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(true);
                setError(''); // Limpiar errores

                setTimeout(() => {
                    navigate('/auth');
                }, 2000);
            } else {
                // ✅ Actualizar intentos restantes
                if (data.intentosRestantes !== undefined) {
                    setReintentosRestantes(data.intentosRestantes);
                }

                // ✅ Bloquear si se agotaron los intentos
                if (data.bloqueado || data.intentosRestantes === 0) {
                    setBloqueado(true);
                } else {
                    setError(data.message || "Código de verificación inválido");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Error de conexión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };



    const reenviarCodigo = async () => {
        setLoading(true);
        setError('');


        try {
            const response = await fetch('http://localhost:4000/api/auth/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuarioId })
            });


            const data = await response.json();


            if (response.ok) {
                setError('');
                setCodigo('');
                setTiempoRestante(900);
                setReintentosRestantes(3);
                setBloqueado(false);
                toast.success('Código reenviado a ' + correoUsuario);
            } else {
                setError(data.message || 'Error al reenviar el código');
                toast.error(data.message || 'Error al reenviar');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al reenviar el código');
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

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
                            Cuenta verificada correctamente
                        </p>
                        <p className="text-primary/80 text-center text-sm mt-2">
                            Redirigiendo al login...
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label htmlFor="codigo" className="block text-sm font-medium text-foreground">
                            Código de verificación
                        </label>
                        {/* ✅ CAMBIO: Input con colores del sistema */}
                        <input
                            id="codigo"
                            type="text"
                            maxLength={6}
                            value={codigo}
                            onChange={handleCodigoChange}
                            disabled={loading || success || bloqueado || reintentosRestantes <= 0}
                            className="appearance-none relative block w-full px-3 py-4 border-2 border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-center text-4xl tracking-widest font-bold mt-2 disabled:bg-muted disabled:opacity-50"
                            placeholder="000000"
                        />
                    </div>


                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Código expira en:{' '}
                            <span className={`font-bold ${tiempoRestante < 300 ? 'text-destructive' : 'text-primary'}`}>
                                {formatearTiempo(tiempoRestante)}
                            </span>
                        </p>
                    </div>


                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Intentos restantes: {reintentosRestantes}
                        </p>
                    </div>

                    {bloqueado ? (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                            <p className="text-destructive text-sm text-center font-medium">
                                Se agotaron los intentos. Solicita un nuevo código.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                            <p className="text-destructive text-sm text-center font-medium">
                                Error: {error}
                            </p>
                        </div>
                    ) : null}


                    {/* ✅ CAMBIO: Botón con colores primary (turquesa) */}
                    <button
                        onClick={handleVerificar}
                        disabled={loading || codigo.length !== 6 || success || tiempoRestante <= 0 || bloqueado || reintentosRestantes <= 0}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>


                    {/* ✅ CAMBIO: Botón secundario con colores del sistema */}
                    <button
                        onClick={reenviarCodigo}
                        disabled={loading || success}
                        className="w-full text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        ¿No recibiste el código? Reenviar
                    </button>


                    {/* ✅ CAMBIO: Botón terciario */}
                    <button
                        onClick={() => navigate('/auth')}
                        disabled={loading}
                        className="w-full text-sm text-muted-foreground hover:text-foreground disabled:text-muted-foreground disabled:opacity-50 transition-colors duration-200"
                    >
                        Volver al registro
                    </button>
                </div>


                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        <strong>El código es válido por 15 minutos. Si no lo recibiste, revisa tu carpeta de spam o solicita uno nuevo.</strong>
                        
                    </p>
                </div>
            </div>
        </div>
    );
}
