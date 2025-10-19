import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

const Index = () => {
  const products = [
    { id: 1, title: "Artículo 1", price: 0 },
    { id: 2, title: "Artículo 2", price: 0 },
    { id: 3, title: "Artículo 3", price: 0 },
    { id: 4, title: "Artículo 4", price: 0 },
    { id: 5, title: "Artículo 5", price: 0 },
    { id: 6, title: "Artículo 6", price: 0 },
  ];

  const filters = ["Todos", "Más vendidos", "Más recientes", "Mejor precio"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:block hidden">
            <CategorySidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-12 py-6 bg-card border-border rounded-xl shadow-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.map((filter, idx) => (
                  <Badge
                    key={idx}
                    variant={idx === 0 ? "default" : "outline"}
                    className={idx === 0 ? "bg-primary text-white hover:bg-primary/90 cursor-pointer" : "cursor-pointer hover:bg-secondary"}
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
