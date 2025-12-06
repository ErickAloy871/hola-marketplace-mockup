import { useState } from "react";
import { api } from "../lib/api";

export default function ModalEditarProducto({ producto, onClose, onUpdated }) {
  const [form, setForm] = useState(producto);
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    try {
      setLoading(true);

      await api(`/productos/${producto.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      onUpdated();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Editar producto
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              className="w-full mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 shadow-sm"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              className="w-full mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 shadow-sm resize-none"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          {/* Precio */}
          <div>
            <label className="text-sm font-medium text-gray-700">Precio ($)</label>
            <input
              type="number"
              className="w-full mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 shadow-sm"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="text-sm font-medium text-gray-700">Ubicación</label>
            <input
              type="text"
              className="w-full mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 shadow-sm"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
