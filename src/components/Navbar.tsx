import { ShoppingCart, User, LogOut, Shield } from "lucide-react"; // ✅ Agregar Shield
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // ✅ NUEVO
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ NUEVO: Verificar si es moderador
  const isModerator = user?.roles?.includes("MODERADOR");

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button className="text-foreground hover:text-primary transition-colors font-medium">
              Productos
            </button>
            <button className="text-foreground hover:text-primary transition-colors font-medium">
              Notificaciones
            </button>
            <button className="text-foreground hover:text-primary transition-colors font-medium">
              Mensajes
            </button>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Mostrar rol del usuario */}
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {user?.roles?.join(", ") || "Usuario"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Menú de usuario</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      {user?.nombre} {user?.apellido}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {user?.correo}
                    </div>

                    <DropdownMenuSeparator />

                    {/* ✅ NUEVO: Panel de moderación (solo para moderadores) */}
                    {isModerator && (
                      <DropdownMenuItem onClick={() => navigate("/moderation")}>
                        <Shield className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">Panel de Moderación</span>
                      </DropdownMenuItem>
                    )}

                    {/* ✅ MODIFICADO: Ocultar "Empezar a vender" para moderadores */}
                    {!isModerator && user?.roles?.includes("COMPRADOR") && !user?.roles?.includes("VENDEDOR") && (
                      <DropdownMenuItem
                        onClick={() => window.dispatchEvent(new CustomEvent('open-sell-modal'))}
                        className="text-green-600"
                      >
                        Empezar a vender
                      </DropdownMenuItem>
                    )}

                    {isModerator && (
                      <DropdownMenuSeparator />
                    )}

                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth?tab=login")}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Entrar
                </Button>

                <Button
                  onClick={() => navigate("/auth?tab=register")}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-sm"
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
