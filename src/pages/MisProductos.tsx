import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Navbar from "../components/Navbar";

import ModalEditarProducto from "../components/ModalEditarProducto";
import ModalFotosProducto from "../components/ModalFotosProducto";
import ModalApelacion from "../components/ModalApelacion";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, EyeOff, ImagePlus, Trash2, Pencil } from "lucide-react";

// ⭐ SOLO ESTOS MODALES
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MisProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [productoEditar, setProductoEditar] = useState(null);
  const [productoFotos, setProductoFotos] = useState<number | null>(null);

  // ⭐ NUEVO: Estado para apelación
  const [productoApelar, setProductoApelar] = useState<number | null>(null);

  const [successModal, setSuccessModal] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  useEffect(() => {
    cargarMisProductos();
  }, []);

  const cargarMisProductos = async () => {
    try {
      const data = await api("/productos/mis-productos");
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
    setLoading(false);
  };

  // ⭐ ELIMINAR PRODUCTO
  const eliminarProducto = (id: number) => {
    setConfirmModal({
      title: "Eliminar producto",
      message: "¿Estás seguro de que deseas eliminar este producto?",
      onConfirm: async () => {
        try {
          await api(`/productos/${id}`, { method: "DELETE" });

          setProductos((prev) => prev.filter((p) => p.id !== id));

          setSuccessModal({
            title: "Eliminado",
            message: "El producto se eliminó correctamente.",
          });
        } catch (error) {
          console.error("Error eliminando producto");
        }
      },
    });
  };

  // ⭐ CAMBIAR VISIBILIDAD
  const cambiarVisibilidad = async (p: any) => {
    try {
      await api(`/productos/${p.id}/visibilidad`, {
        method: "PATCH",
        body: JSON.stringify({ visible: p.disponibilidad === 0 }),
      });

      setProductos((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, disponibilidad: x.disponibilidad ? 0 : 1 } : x
        )
      );

      setSuccessModal({
        title: "Actualizado",
        message: p.disponibilidad
          ? "El producto ahora está oculto."
          : "El producto ahora es visible.",
      });
    } catch (error) {
      console.error("Error cambiando visibilidad");
    }
  };

  if (loading)
    return <p className="p-6 text-lg font-medium">Cargando productos...</p>;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Mis Productos</h1>

        {productos.length === 0 && (
          <p className="text-gray-600">No tienes productos publicados.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {productos.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden border bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={p.foto || "/placeholder.png"}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                />

                <Badge
                  className={`absolute top-2 left-2 ${
                    p.estado === "DADO_DE_BAJA"
                      ? "bg-red-200 text-red-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {p.estado}
                </Badge>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {p.nombre}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {p.descripcion}
                </p>

                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-primary text-lg">
                    ${p.precio}
                  </span>

                  <span className="flex items-center text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {p.ubicacion || "N/A"}
                  </span>
                </div>

                <Badge className="mt-2 bg-gray-100 text-gray-700">
                  {p.categoriaNombre}
                </Badge>

                <div className="mt-4 flex flex-col gap-2">

                  {/* 🚫 PRODUCTO DADO_DE_BAJA */}
                  {p.estado === "DADO_DE_BAJA" ? (
                    <>
                      {/* Ya envió apelación */}
                      {p.apelacionEstado === "PENDIENTE" ? (
                        <div className="text-yellow-600 font-medium">Apelación pendiente</div>
                      
                      ) : p.apelacionEstado === "ACEPTADA" ? (
                        <div className="text-green-600 font-medium">
                          Apelación aceptada ✔
                        </div>

                      ) : (
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setProductoApelar(p.id)}
                        >
                          Apelar restricción
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => setProductoEditar(p)}
                      >
                        Editar
                      </Button>

                      <Button onClick={() => setProductoFotos(p.id)}>
                        Administrar Fotos
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => cambiarVisibilidad(p)}
                      >
                        {p.disponibilidad ? "Ocultar" : "Mostrar"}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => eliminarProducto(p.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>



              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* MODALES */}
      {productoEditar && (
        <ModalEditarProducto
          producto={productoEditar}
          onClose={() => setProductoEditar(null)}
          onUpdated={cargarMisProductos}
        />
      )}

      {productoFotos && (
        <ModalFotosProducto
          productoId={productoFotos}
          onClose={() => setProductoFotos(null)}
        />
      )}

      {productoApelar !== null && (
          <ModalApelacion
            open={true}
            onClose={() => setProductoApelar(null)}
            onSubmit={async (motivo) => {
              try {
                await api(`/productos/${productoApelar}/apelar`, {
                  method: "POST",
                  body: JSON.stringify({ motivo }),
                });

                setSuccessModal({
                  title: "Apelación enviada",
                  message: "Tu solicitud fue enviada correctamente.",
                });

                cargarMisProductos();
              } catch (error) {
                console.error("Error apelando:", error);
              }
            }}
          />
        )}



      {successModal && (
        <SuccessModal
          open={true}
          title={successModal.title}
          message={successModal.message}
          onClose={() => setSuccessModal(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </>
  );
}
