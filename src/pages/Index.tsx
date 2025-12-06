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
  
  // Estados para filtros
  const [selectedTipos, setSelectedTipos] = useState<string[]>(["PRODUCTO", "SERVICIO"]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [activeOrden, setActiveOrden] = useState<string>("new");

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    loadProducts();
  }, [selectedTipos, selectedCategorias, priceRange, activeOrden]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        q: searchQuery || undefined,
        minPrecio: priceRange[0],
        maxPrecio: priceRange[1],
      };

      // Filtrar por tipo solo si no están ambos seleccionados
      if (selectedTipos.length === 1) {
        params.tipo = selectedTipos[0];
      } else if (selectedTipos.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Filtrar por categoría si hay alguna seleccionada
      if (selectedCategorias.length === 1) {
        params.categoria = selectedCategorias[0];
      }
      // Si hay múltiples categorías, no filtramos por categoría en el backend
      // (el backend solo soporta una categoría a la vez)

      // Agregar ordenamiento
      if (activeOrden === "precio_asc") {
        params.ordenar = "precio_asc";
      } else if (activeOrden === "precio_desc") {
        params.ordenar = "precio_desc";
      } 

      const response = await productosApi.getAll(params);
      let items = response.items || [];

      // Filtrado manual en frontend si hay múltiples categorías seleccionadas
      if (selectedCategorias.length > 1) {
        items = items.filter((p: Product) => 
          selectedCategorias.includes(p.categoria)
        );
      }

      setProducts(items);
      setError(null);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleOrdenClick = (orden: string) => {
    setActiveOrden(orden);
  };

  const filters = [
    { key: "new", label: "Más Nuevo" },
    { key: "precio_asc", label: "Precio ascendente" },
    { key: "precio_desc", label: "Precio descendente" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:block hidden">
            <CategorySidebar 
              selectedTipos={selectedTipos}
              onTiposChange={setSelectedTipos}
              selectedCategorias={selectedCategorias}
              onCategoriasChange={setSelectedCategorias}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxPrice={1000}
            />
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
                {filters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant={activeOrden === filter.key ? "default" : "outline"}
                    onClick={() => handleOrdenClick(filter.key)}
                    className={
                      activeOrden === filter.key
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-4 py-1.5"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer px-4 py-1.5 border-border"
                    }
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filtros activos */}
            {(selectedCategorias.length > 0 || selectedTipos.length < 2) && (
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {selectedCategorias.map((cat) => (
                  <Badge 
                    key={cat} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setSelectedCategorias(selectedCategorias.filter(c => c !== cat))}
                  >
                    {cat} ✕
                  </Badge>
                ))}
                {selectedTipos.length === 1 && (
                  <Badge variant="secondary">
                    {selectedTipos[0] === "PRODUCTO" ? "📦 Productos" : "🛠️ Servicios"}
                  </Badge>
                )}
              </div>
            )}

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
                    nombre={product.nombre || "Sin nombre"}
                    precio={Number(product.precio) || 0}
                    descripcion={product.descripcion}
                    urlFoto={product.urlFoto}
                    ubicacion={product.ubicacion}
                    categoria={product.categoria}
                  />
                ))}
              </div>
            )}

            {/* No Products */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">No se encontraron productos con los filtros aplicados</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
