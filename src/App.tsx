import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import VerifyEmailPage from "./pages/VerifyEmail";
import ModerationPanel from "./pages/ModerationPanel"; 
import CreateProduct from "./pages/CreateProduct";
import SellDialog from "@/components/SellDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <TooltipProvider>
      <SellDialog />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/moderation" element={<ModerationPanel />} /> {/* ✅ NUEVO */}
         <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/sell" element={<CreateProduct />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
}
