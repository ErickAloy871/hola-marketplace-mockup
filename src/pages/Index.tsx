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

  const filters = [
    { label: "New", active: true },
    { label: "Price ascending", active: false },
    { label: "Price descending", active: false },
    { label: "Rating", active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-6">
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
                  placeholder="Search"
                  className="pl-10 bg-card border-border h-10 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id} 
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
