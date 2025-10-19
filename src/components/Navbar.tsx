import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

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

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-sm"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
