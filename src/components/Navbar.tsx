import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <button className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Productos
            </button>
            <button className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Notificaciones
            </button>
            <button className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Mensajes
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="border-border text-foreground hover:bg-secondary"
            >
              Entrar
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-foreground hover:bg-foreground/90 text-white"
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
