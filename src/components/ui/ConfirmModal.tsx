import { HelpCircle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-fadeIn">

        <div className="flex flex-col items-center text-center">
          <HelpCircle className="text-blue-500 w-12 h-12 mb-3" />

          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-slate-500 text-sm mt-2">{message}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Confirmar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
