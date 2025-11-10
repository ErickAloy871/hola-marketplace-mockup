import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProductForm from "@/components/ProductForm";

export default function CreateProduct() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        navigate("/auth?tab=login");
        return null;
    }

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Publicar un artículo</h2>
            <ProductForm onSuccess={() => navigate("/")} />
        </div>
    );
}
