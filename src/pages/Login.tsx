import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(correo, password);

      // Usar el hook de autenticación
      login(response.token, response.user);

      // Redirigir al inicio
      navigate("/");
    } catch (err: any) {
      // 🔍 DEBUG: Ver qué error exacto recibimos
      console.log('🔍 Error completo:', err);
      console.log('🔍 Status:', err.response?.status);
      console.log('🔍 Data:', err.response?.data);
      console.log('🔍 Suspended flag:', err.response?.data?.suspended);

      // ✅ Verificar si la cuenta está suspendida
      if (err.response?.status === 403 && err.response?.data?.suspended) {
        console.log('✅ Mostrando modal de cuenta suspendida');
        setSuspensionMessage(err.response.data.message || "Tu cuenta ha sido suspendida. Contacta al soporte para más información.");
        setShowSuspendedModal(true);
      } else if (err.response?.status === 401) {
        setError("❌ Credenciales incorrectas. Verifica tu email y contraseña.");
      } else {
        setError("❌ Error al iniciar sesión. Inténtalo de nuevo.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-foreground hover:text-primary z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a la página principal
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="tu@email.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Usuarios de prueba:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Vendedor:</strong> ana@demo.com / 123456</div>
              <div><strong>Comprador:</strong> luis@demo.com / 123456</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cuenta Suspendida */}
      <Dialog open={showSuspendedModal} onOpenChange={setShowSuspendedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <DialogTitle className="text-xl">Cuenta Suspendida</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {suspensionMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Si crees que esto es un error, por favor contacta al equipo de soporte para resolver esta situación.
            </p>
            <Button
              onClick={() => setShowSuspendedModal(false)}
              className="w-full"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
