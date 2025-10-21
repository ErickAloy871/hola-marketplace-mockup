import { useState } from "react";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerNombre, setRegisterNombre] = useState("");
  const [registerApellido, setRegisterApellido] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerTelefono, setRegisterTelefono] = useState("");
  const [registerDireccion, setRegisterDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Inicio de sesión exitoso!");
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar que todos los campos estén completos
      if (!registerNombre || !registerApellido || !registerEmail || !registerPassword || !registerTelefono || !registerDireccion) {
        toast.error("Por favor, completa todos los campos");
        return;
      }
      
      // Llamar a la API de registro
      const response = await authApi.register(
        registerNombre,
        registerApellido,
        registerEmail,
        registerPassword,
        registerTelefono,
        registerDireccion
      );
      
      // Usar el hook de autenticación para guardar el token y usuario
      login(response.token, response.user);
      
      toast.success("¡Registro exitoso!");
      navigate("/");
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error("Error al registrarse. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-foreground hover:text-primary z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
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
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl border-4 border-primary/30 p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
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
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground font-semibold">
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-lg shadow-sm"
                >
                  Entrar
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
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
                    <Input
                      id="register-nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={registerNombre}
                      onChange={(e) => setRegisterNombre(e.target.value)}
                      className="border-2 border-border focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-apellido" className="text-foreground font-semibold">
                      Apellido
                    </Label>
                    <Input
                      id="register-apellido"
                      type="text"
                      placeholder="Tu apellido"
                      value={registerApellido}
                      onChange={(e) => setRegisterApellido(e.target.value)}
                      className="border-2 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground font-semibold">
                    Correo electrónico
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground font-semibold">
                    Contraseña
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-telefono" className="text-foreground font-semibold">
                    Teléfono
                  </Label>
                  <Input
                    id="register-telefono"
                    type="tel"
                    placeholder="0991234567"
                    value={registerTelefono}
                    onChange={(e) => setRegisterTelefono(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-direccion" className="text-foreground font-semibold">
                    Dirección
                  </Label>
                  <Input
                    id="register-direccion"
                    type="text"
                    placeholder="Tu dirección completa"
                    value={registerDireccion}
                    onChange={(e) => setRegisterDireccion(e.target.value)}
                    className="border-2 border-border focus:border-primary"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-lg shadow-sm"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
