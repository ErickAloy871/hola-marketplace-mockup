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
import ResetPassword from "./pages/ResetPassword";
import EditProfile from "./pages/EditProfile";
import MisIntereses from "./pages/MisIntereses"; // ✅ NUEVO

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
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/moderation" element={<ModerationPanel />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/sell" element={<CreateProduct />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/mis-intereses" element={<MisIntereses />} /> {/* ✅ NUEVO */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
}
