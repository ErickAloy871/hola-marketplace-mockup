import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 🔧 En una versión real, esto vendría de una API o base de datos
  const products = [
    { id: 1, title: "Articulo 1", price: 50, description: "Descripción del producto 1", image: "https://via.placeholder.com/400" },
    { id: 2, title: "Artículo 2", price: 75, description: "Descripción del producto 2", image: "https://via.placeholder.com/400" },
    { id: 3, title: "Artículo 3", price: 100, description: "Descripción del producto 3", image: "https://via.placeholder.com/400" },
  ];

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
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
          <img
            src={product.image}
            alt={product.title}
            className="w-full max-w-md rounded-lg shadow-md mx-auto"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {product.title}
          </h1>
          <p className="text-3xl font-bold text-primary">${product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>

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
