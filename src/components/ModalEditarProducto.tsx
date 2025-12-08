import { useState } from "react";
import { api } from "../lib/api";

export default function ModalEditarProducto({ producto, onClose, onUpdated }) {
  const [form, setForm] = useState(producto);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // VALIDACIÓN DEL PRECIO
  // -------------------------------
  const handlePrecioChange = (raw: string) => {
  // Reemplazar coma por punto para uniformar
  let value = raw.replace(",", ".");

  // Solo dígitos y un punto decimal
  if (!/^\d*\.?\d*$/.test(value)) {
    return; // si mete letras u otros símbolos, no actualizamos
  }

  // Si está vacío, simplemente limpiamos el precio
  if (value === "") {
    setForm({ ...form, precio: "" });
    return;
  }

  const numero = Number(value);

  // Evitar NaN y negativos
  if (isNaN(numero) || numero < 0) {
    return;
  }

  // Limitar a 2 decimales
  if (value.includes(".")) {
    const [entero, decimal] = value.split(".");
    if (decimal.length > 2) {
      return; // no permitir más de 2 decimales
    }
  }

  // Guardamos el valor tal cual se escribe (como string),
  // el backend lo convierte a DECIMAL sin problema
  setForm({ ...form, precio: value });
};



  // -------------------------------
  // ACTUALIZAR PRODUCTO
  // -------------------------------
  const actualizar = async () => {
  try {
    setLoading(true);

    await api(`/productos/${producto.id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });

    onUpdated();     // refresca lista (puedes quitarlo si no quieres)
    onClose();       // cierra modal

    // 🔥 Recargar página completa
    setTimeout(() => {
      window.location.reload();
    }, 200);

  } catch (error) {
    console.error(error);
    alert("Error al guardar cambios");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fadeIn border border-gray-200">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ✏️ Editar producto
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <div className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio
            </label>

            <input
              type="text"
              inputMode="decimal"
              value={form.precio}
              placeholder="Ej: 25.50"
              onChange={(e) => handlePrecioChange(e.target.value)}
              className="w-full mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 shadow-sm"
            />



            {/* Mensaje de error */}
            {(!form.precio || Number(form.precio) <= 0) && (
              <p className="text-red-500 text-sm mt-1">
                El precio debe ser un número mayor a 0.
              </p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-7">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition shadow-sm"
          >
            Cancelar
          </button>

          <button
            disabled={loading || !form.precio || Number(form.precio) <= 0}
            onClick={actualizar}
            className={`px-5 py-2 rounded-xl font-semibold text-white shadow-md transition 
              ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>

        </div>
      </div>
    </div>
  );
}
