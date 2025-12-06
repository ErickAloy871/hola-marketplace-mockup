import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import ReportDialog from "@/components/ReportDialog";
import { productosApi, interesesApi } from "@/lib/api";
import { ArrowLeft, MapPin, Tag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  urlFoto: string | null;
  imagenes?: string[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [loadingFavorito, setLoadingFavorito] = useState(false);

  // Verificar si el usuario puede usar "me interesa"
  const puedeUsarIntereses = () => {
    if (!user?.roles) return false;
    return user.roles.includes("COMPRADOR") || user.roles.includes("VENDEDOR");
  };

  useEffect(() => {
    if (id) {
      loadProduct();
      if (isAuthenticated && puedeUsarIntereses()) {
        verificarFavorito();
      }
    }
  }, [id, isAuthenticated]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const productData = await productosApi.getById(id);
      setProduct(productData);
    } catch (err) {
      console.error("Error loading product:", err);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const verificarFavorito = async () => {
    if (!id) return;
    
    try {
      const response = await interesesApi.verificar(Number(id));
      setEsFavorito(response.esFavorito);
    } catch (err) {
      console.error("Error verificando favorito:", err);
    }
  };

  const toggleFavorito = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para marcar productos como favoritos",
        variant: "destructive",
      });
      return;
    }

    if (!puedeUsarIntereses()) {
      toast({
        title: "Función no disponible",
        description: "Esta función solo está disponible para compradores y vendedores",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setLoadingFavorito(true);
    try {
      if (esFavorito) {
        await interesesApi.eliminar(Number(id));
        setEsFavorito(false);
        toast({
          title: "Eliminado",
          description: "Producto eliminado de tu lista de interés",
        });
      } else {
        await interesesApi.agregar(Number(id));
        setEsFavorito(true);
        toast({
          title: "¡Agregado!",
          description: "Producto agregado a tu lista de interés",
        });
      }
    } catch (err) {
      console.error("Error toggling favorito:", err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      });
    } finally {
      setLoadingFavorito(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando producto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Producto no encontrado</h2>
            <Button onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
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
        {/* Botón volver */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div>
            <ImageGallery 
              images={product.imagenes || (product.urlFoto ? [product.urlFoto] : [])} 
              alt={product.nombre} 
            />
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.nombre}
                </h1>
                <p className="text-4xl font-bold text-primary">
                  ${Number(product.precio).toFixed(2)}
                </p>
              </div>
              
              {/* Botón Me interesa */}
              {puedeUsarIntereses() && (
                <Button
                  variant={esFavorito ? "default" : "outline"}
                  size="icon"
                  onClick={toggleFavorito}
                  disabled={loadingFavorito}
                  className={`w-12 h-12 ${esFavorito ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${esFavorito ? 'fill-white' : ''}`} 
                  />
                </Button>
              )}
            </div>

            {/* Detalles */}
            <div className="space-y-3 border-t border-b border-border py-4">
              {product.categoria && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">{product.categoria}</span>
                </div>
              )}
              {product.ubicacion && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{product.ubicacion}</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.descripcion || "Sin descripción"}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 pt-4">
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium">
                Enviar mensaje
              </Button>
              
              {/* Botón de reporte */}
              <div className="flex justify-center">
                <ReportDialog publicacionId={product.id} />
              </div>
            </div>

            {/* Advertencia de seguridad */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ⚠️ <strong>Consejo de seguridad:</strong> Nunca realices pagos por adelantado sin verificar el producto. 
                Reúnete en lugares públicos para transacciones seguras.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
