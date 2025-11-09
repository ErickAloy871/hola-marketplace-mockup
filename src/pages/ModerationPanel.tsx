import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { moderationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";

interface ModerationProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  categoria: string;
  estado: string;
  fechaPublicacion: string;
  vendedorNombre: string;
  vendedorCorreo: string;
  urlFoto: string | null;
}

const ModerationPanel = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState<ModerationProduct[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"pendientes" | "publicadas">("pendientes");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.roles?.includes("MODERADOR")) {
      navigate("/");
      return;
    }
    loadData();
  }, [isAuthenticated, user, loading]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const response = await moderationApi.getAllModeration();
      setProductos(response.publicaciones);
    } catch (error) {
      console.error("Error loading moderation products:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await moderationApi.approve(id);
      await loadData();
    } catch (error) {
      alert("Error al aprobar el producto");
    }
  };

  const handleReject = async (id: number) => {
    const motivo = prompt("Motivo del rechazo (opcional):");
    try {
      await moderationApi.reject(id, motivo || undefined);
      await loadData();
    } catch (error) {
      alert("Error al rechazar el producto");
    }
  };

  const handleDarDeBaja = async (id: number) => {
    const motivo = prompt("Motivo para dar de baja (opcional):");
    try {
      await moderationApi.darDeBaja(id, motivo || undefined);
      await loadData();
    } catch (error) {
      alert("Error al dar de baja el producto");
    }
  };

  const productosPendientes = productos.filter(p => p.estado === "PENDIENTE");
  const productosPublicadas = productos.filter(p => p.estado === "PUBLICADA");

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando panel de moderación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto py-10 px-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Panel de Moderación</h1>

        {/* Pestañas */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("pendientes")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "pendientes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendientes ({productosPendientes.length})
          </button>
          <button
            onClick={() => setActiveTab("publicadas")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "publicadas"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Publicadas ({productosPublicadas.length})
          </button>
        </div>

        {/* Contenido de la pestaña activa */}
        {activeTab === "pendientes" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Publicaciones Pendientes</h2>
            {productosPendientes.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay publicaciones pendientes
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {productosPendientes.map((producto) => (
                  <Card key={producto.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {producto.urlFoto && (
                          <img
                            src={`http://localhost:4000/uploads/${producto.urlFoto.replace('/uploads/', '')}`}
                            alt={producto.nombre}
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{producto.descripcion}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Precio:</strong> ${producto.precio}</p>
                            <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                            <p><strong>Vendedor:</strong> {producto.vendedorNombre} ({producto.vendedorCorreo})</p>
                            <p><strong>Fecha:</strong> {new Date(producto.fechaPublicacion).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleApprove(producto.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleReject(producto.id)}
                            variant="destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "publicadas" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Publicaciones Aprobadas</h2>
            {productosPublicadas.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay publicaciones aprobadas
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {productosPublicadas.map((producto) => (
                  <Card key={producto.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {producto.urlFoto && (
                          <img
                            src={`http://localhost:4000/uploads/${producto.urlFoto.replace('/uploads/', '')}`}
                            alt={producto.nombre}
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{producto.descripcion}</p>
                          <div className="space-y-1 text-sm">
                            <p><strong>Precio:</strong> ${producto.precio}</p>
                            <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                            <p><strong>Vendedor:</strong> {producto.vendedorNombre} ({producto.vendedorCorreo})</p>
                            <p><strong>Fecha:</strong> {new Date(producto.fechaPublicacion).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handleDarDeBaja(producto.id)}
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Dar de baja
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ModerationPanel;
