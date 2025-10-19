import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import { TooltipProvider } from "@/components/ui/tooltip"; // si lo usas

export default function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/product/:id" element={<ProductDetail />} /> 
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
}
