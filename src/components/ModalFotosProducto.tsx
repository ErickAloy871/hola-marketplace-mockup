import { useEffect, useState } from "react";
import { api, apiUpload } from "../lib/api";

import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ErrorModal from "@/components/ui/ErrorModal";
import WarningModal from "@/components/ui/WarningModal";

export default function ModalFotosProducto({ productoId, onClose }) {
  const [fotos, setFotos] = useState<any[]>([]);
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  // ===== MODALES =====
  const [successModal, setSuccessModal] = useState<any>(null);
  const [errorModal, setErrorModal] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [warningModal, setWarningModal] = useState<any>(null);

  useEffect(() => {
    cargarFotos();
  }, []);

  const cargarFotos = async () => {
    const data = await api(`/productos/${productoId}/fotos`);
    setFotos(data);
  };

  // 📌 ELIMINAR FOTO (CON MODAL)
  const eliminarFoto = (fotoId: number) => {
    setConfirmModal({
      title: "Eliminar foto",
      message: "¿Estás seguro de que quieres eliminar esta foto?",
      onConfirm: async () => {
        try {
          await api(`/productos/fotos/${fotoId}`, {
            method: "DELETE",
          });

          setFotos((prev) => prev.filter((f) => f.id !== fotoId));

          setSuccessModal({
            title: "Foto eliminada",
            message: "La fotografía fue eliminada exitosamente.",
          });
        } catch (error) {
          console.error("Error eliminando foto:", error);
          setErrorModal({
            title: "Error eliminando foto",
            message: "No se pudo eliminar la fotografía.",
          });
        }
      },
    });
  };

  // 📌 SUBIR FOTOS (CON MODALES)
  const subirFotos = async () => {
    if (!archivos || archivos.length === 0) {
      setWarningModal({
        title: "Sin imágenes",
        message: "Selecciona una o más fotografías para subir.",
      });
      return;
    }

    const form = new FormData();
    for (let i = 0; i < archivos.length; i++) {
      form.append("images", archivos[i]);
    }

    setSubiendo(true);

    try {
      await apiUpload(`/productos/${productoId}/fotos`, form);

      await cargarFotos();
      setArchivos(null);

      setSuccessModal({
        title: "Fotos subidas",
        message: "Las fotografías se subieron correctamente.",
      });
    } catch (error) {
      console.error("Error subiendo fotos:", error);
      setErrorModal({
        title: "Error en la subida",
        message: "No se pudieron subir las fotografías.",
      });
    }

    setSubiendo(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 shadow-lg relative">

        {/* BOTÓN CERRAR */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Administrar Fotos</h2>

        {/* SUBIR FOTOS */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="file"
            multiple
            onChange={(e) => setArchivos(e.target.files)}
          />

          <button
            onClick={subirFotos}
            disabled={subiendo}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : "Subir fotos"}
          </button>
        </div>

        {/* LISTA DE FOTOS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fotos.map((f) => (
            <div key={f.id} className="rounded-lg overflow-hidden shadow">
              <img
                src={f.urlFoto}
                alt="foto"
                className="w-full h-40 object-cover"
              />

              <button
                className="w-full bg-red-600 text-white py-2 hover:bg-red-700"
                onClick={() => eliminarFoto(f.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ===== RENDER DE MODALES ===== */}

      {successModal && (
        <SuccessModal
          open={true}
          title={successModal.title}
          message={successModal.message}
          onClose={() => setSuccessModal(null)}
        />
      )}

      {errorModal && (
        <ErrorModal
          open={true}
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal(null)}
        />
      )}

      {warningModal && (
        <WarningModal
          open={true}
          title={warningModal.title}
          message={warningModal.message}
          onClose={() => setWarningModal(null)}
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
    </div>
  );
}
