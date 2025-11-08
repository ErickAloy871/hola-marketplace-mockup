import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { productosApi } from "@/lib/api";


interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  urlFoto: string | null;
}


const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    loadProducts();
  }, []);


  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productosApi.getAll();
      console.log("API Response:", response);
      setProducts(response.items || []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await productosApi.getAll({ q: searchQuery });
      setProducts(response.items || []);
    } catch (err) {
      setError("Error al buscar productos");
      console.error("Error searching products:", err);
    } finally {
      setLoading(false);
    }
  };


  const filters = [
    { label: "New", active: true },
    { label: "Price ascending", active: false },
    { label: "Price descending", active: false },
    { label: "Rating", active: false },
  ];


  return (
    // ✅ CAMBIO: Agregar flex y flex-col para layout vertical
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      {/* ✅ CAMBIO: flex-1 para que el contenido crezca */}
      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:block hidden">
            <CategorySidebar />
          </div>


          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative mb-4">
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-10 bg-card border-border h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" 
                  onClick={handleSearch}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, idx) => (
                  <Badge
                    key={idx}
                    variant={filter.active ? "default" : "outline"}
                    className={
                      filter.active
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-4 py-1.5"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer px-4 py-1.5 border-border"
                    }
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>



            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Cargando productos...</div>
              </div>
            )}


            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-destructive">{error}</div>
                <button 
                  onClick={loadProducts}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            )}


            {/* Products Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id} 
                    title={product.nombre || "Sin nombre"}
                    price={Number(product.precio) || 0}
                    description={product.descripcion}
                    image={product.urlFoto}
                    location={product.ubicacion}
                    category={product.categoria}
                  />
                ))}
              </div>
            )}


            {/* No Products */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">No se encontraron productos</div>
              </div>
            )}
          </div>
        </div>
      </main>


      {/* ✅ Footer siempre al final */}
      <Footer />
    </div>
  );
};


export default Index;
