import { ShoppingCart, User, LogOut, Shield, PlusCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useMessagesContext } from "@/context/MessagesContext";
import { useEffect } from "react";
import NotificationBell from "@/components/NotificationBell";

function getDisplayRole(roles: string[]) {
  if (!roles) return "";
  if (roles.includes("ADMINISTRADOR")) return "ADMINISTRADOR";
  if (roles.includes("MODERADOR")) return "MODERADOR";
  return roles.join(", ");
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { setTotalNoLeidos } = useMessagesContext();

  const handleLogout = () => {
    logout();
    setTotalNoLeidos(0);
    navigate("/");
  };

  const isModerator = user?.roles?.includes("MODERADOR");
  const isAdmin =
    user?.roles?.includes("ADMINISTRADOR") || user?.roles?.includes("ADMIN");
  const isVendedor = user?.roles?.includes("VENDEDOR");
  const isComprador = user?.roles?.includes("COMPRADOR");

  // Si se desautentica por cualquier razón, limpiar contador
  useEffect(() => {
    if (!isAuthenticated) setTotalNoLeidos(0);
  }, [isAuthenticated, setTotalNoLeidos]);



  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* SOLO mostrar al usuario normal (NO admin, NO moderador) */}
            {!isAdmin && !isModerator && (
              <>
                {(isVendedor || isComprador) && (
                  <button
                    onClick={() => navigate("/mis-productos")}
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    Mis Productos
                  </button>
                )}

                <button className="text-foreground hover:text-primary transition-colors font-medium">
                  Notificaciones
                </button>

                <button
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => navigate("/mensajes")}
                >
                  Mensajes
                </button>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell for Moderators/Admins */}
                <NotificationBell />

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {getDisplayRole(user.roles)}
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

                    {/* ✅ EDITAR PERFIL - OCULTO PARA ADMINISTRADORES */}
                    {!isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/profile/edit")}>
                          <User className="mr-2 h-4 w-4" />
                          Editar perfil
                        </DropdownMenuItem>
                      </>
                    )}

                    {(isComprador || isVendedor) && !isAdmin && !isModerator && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/mis-intereses")}>
                          <Heart className="mr-2 h-4 w-4 text-red-500" />
                          <span>Me Interesa</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {(isVendedor || isComprador) && !isAdmin && !isModerator && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/create-product")}
                          className="text-green-600 font-medium"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Publicar producto
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* ✅ PANEL DE MODERACIÓN - SOLO PARA MODERADORES (no admins) */}
                    {!isAdmin && isModerator && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/moderation")}>
                          <Shield className="mr-2 h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">Panel de Moderación</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {!isModerator &&
                      !isAdmin &&
                      user?.roles?.includes("COMPRADOR") &&
                      !user?.roles?.includes("VENDEDOR") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("open-sell-modal")
                              )
                            }
                            className="text-green-600"
                          >
                            Empezar a vender
                          </DropdownMenuItem>
                        </>
                      )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
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
