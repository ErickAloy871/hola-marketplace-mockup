import { ShoppingCart, User, LogOut, Shield } from "lucide-react"; // ✅ Agregar Shield
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, // ✅ NUEVO
 } from "@/components/ui/dropdown-menu";
var Navbar = function () {
    var _a, _b, _c, _d;
    var navigate = useNavigate();
    var _e = useAuth(), user = _e.user, isAuthenticated = _e.isAuthenticated, logout = _e.logout;
    var handleLogout = function () {
        logout();
        navigate("/");
    };
    // ✅ NUEVO: Verificar si es moderador
    var isModerator = (_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.includes("MODERADOR");
    return (<nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={function () { return navigate("/"); }}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-6 h-6 text-white"/>
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
            {isAuthenticated ? (<>
                {/* Mostrar rol del usuario */}
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {((_b = user === null || user === void 0 ? void 0 : user.roles) === null || _b === void 0 ? void 0 : _b.join(", ")) || "Usuario"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <User className="h-4 w-4"/>
                      <span className="sr-only">Menú de usuario</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      {user === null || user === void 0 ? void 0 : user.nombre} {user === null || user === void 0 ? void 0 : user.apellido}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {user === null || user === void 0 ? void 0 : user.correo}
                    </div>

                    <DropdownMenuSeparator />

                    {/* ✅ NUEVO: Panel de moderación (solo para moderadores) */}
                    {isModerator && (<DropdownMenuItem onClick={function () { return navigate("/moderation"); }}>
                        <Shield className="mr-2 h-4 w-4 text-blue-600"/>
                        <span className="text-blue-600">Panel de Moderación</span>
                      </DropdownMenuItem>)}

                    {/* ✅ MODIFICADO: Ocultar "Empezar a vender" para moderadores */}
                    {!isModerator && ((_c = user === null || user === void 0 ? void 0 : user.roles) === null || _c === void 0 ? void 0 : _c.includes("COMPRADOR")) && !((_d = user === null || user === void 0 ? void 0 : user.roles) === null || _d === void 0 ? void 0 : _d.includes("VENDEDOR")) && (<DropdownMenuItem onClick={function () { return window.dispatchEvent(new CustomEvent('open-sell-modal')); }} className="text-green-600">
                        Empezar a vender
                      </DropdownMenuItem>)}

                    {isModerator && (<DropdownMenuSeparator />)}

                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4"/>
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>) : (<>
                <Button variant="outline" onClick={function () { return navigate("/auth?tab=login"); }} className="border-primary text-primary hover:bg-primary hover:text-white">
                  Entrar
                </Button>

                <Button onClick={function () { return navigate("/auth?tab=register"); }} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-sm">
                  Registrarse
                </Button>
              </>)}
          </div>
        </div>
      </div>
    </nav>);
};
export default Navbar;
