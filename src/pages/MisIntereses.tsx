import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { interesesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  tipo: string;
  urlFoto: string | null;
  fechaInteres: string;
}

const MisIntereses = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // ✅ AGREGAR loading
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario puede acceder
  const puedeAcceder = () => {
    if (!user?.roles) return false;
    return user.roles.includes("COMPRADOR") || user.roles.includes("VENDEDOR");
  };

  useEffect(() => {
    // ✅ CAMBIO: Esperar a que termine de cargar la autenticación
    if (authLoading) {
      return; // No hacer nada mientras carga
    }

    if (!isAuthenticated) {
      navigate("/auth?tab=login");
      return;
    }

    if (!puedeAcceder()) {
      navigate("/");
      return;
    }

    loadProductos();
  }, [isAuthenticated, authLoading]); // ✅ AGREGAR authLoading a las dependencias

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await interesesApi.obtenerTodos();
      setProductos(response.items || []);
    } catch (error) {
      console.error("Error cargando productos de interés:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CAMBIO: Mostrar loading mientras verifica autenticación
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Me Interesa</h1>
              <p className="text-muted-foreground">
                {productos.length} {productos.length === 1 ? 'producto guardado' : 'productos guardados'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {productos.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              No tienes productos guardados
            </h2>
            <p className="text-muted-foreground mb-6">
              Explora el marketplace y marca los productos que te interesen
            </p>
            <Button onClick={() => navigate("/")}>
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                id={producto.id}
                nombre={producto.nombre}
                precio={producto.precio}
                descripcion={producto.descripcion}
                urlFoto={producto.urlFoto}
                ubicacion={producto.ubicacion}
                categoria={producto.categoria}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MisIntereses;
