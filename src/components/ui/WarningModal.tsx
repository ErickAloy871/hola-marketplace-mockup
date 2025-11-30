import { AlertTriangle } from "lucide-react";

export default function WarningModal({ open, onClose, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-fadeIn">

        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="text-amber-500 w-12 h-12 mb-3" />

          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-slate-500 text-sm mt-2">{message}</p>

          <button
            onClick={onClose}
            className="mt-5 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
