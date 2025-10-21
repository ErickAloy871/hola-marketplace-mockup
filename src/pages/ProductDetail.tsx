import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import { productosApi } from "@/lib/api";

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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="text-xl">Cargando producto...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-muted-foreground">
        <h2 className="text-xl font-semibold mb-4">Producto no encontrado</h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-10 px-6">
        <div className="flex-1">
          <ImageGallery 
            images={product.imagenes || (product.urlFoto ? [product.urlFoto] : [])} 
            alt={product.nombre} 
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {product.nombre}
          </h1>
          <p className="text-3xl font-bold text-primary">${Number(product.precio).toFixed(2)}</p>
          <p className="text-muted-foreground">{product.descripcion}</p>
          
          {product.ubicacion && (
            <p className="text-sm text-muted-foreground">
              📍 {product.ubicacion}
            </p>
          )}
          
          {product.categoria && (
            <p className="text-sm text-muted-foreground">
              📂 {product.categoria}
            </p>
          )}

          <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
            Enviar mensaje
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
