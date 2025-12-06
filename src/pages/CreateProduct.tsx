import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProductForm from "@/components/ProductForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateProduct() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // ✅ NUEVO: Validaciones de permisos
    const isModerator = user?.roles?.includes("MODERADOR");
    const isAdmin = user?.roles?.includes("ADMINISTRADOR") || user?.roles?.includes("ADMIN");
    const canSell = user?.roles?.includes("VENDEDOR") || user?.roles?.includes("COMPRADOR");

    if (!isAuthenticated) {
        navigate("/auth?tab=login");
        return null;
    }

    // ✅ Bloquear si es admin o moderador
    if (isAdmin || isModerator || !canSell) {
        navigate("/");
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Publicar un artículo
                        </h1>
                        <p className="text-muted-foreground">
                            Completa la información de tu producto o servicio
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
                        <ProductForm onSuccess={() => navigate("/")} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
