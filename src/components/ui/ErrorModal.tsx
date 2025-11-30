import { XCircle } from "lucide-react";

export default function ErrorModal({ open, onClose, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-fadeIn">

        <div className="flex flex-col items-center text-center">
          <XCircle className="text-red-500 w-12 h-12 mb-3" />

          <h2 className="text-lg font-semibold text-red-600">{title}</h2>
          <p className="text-slate-500 text-sm mt-2">{message}</p>

          <button
            onClick={onClose}
            className="mt-5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
