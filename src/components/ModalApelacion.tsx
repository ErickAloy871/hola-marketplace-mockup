import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ModalApelacion({ open, onClose, onSubmit }) {
  const [motivo, setMotivo] = useState("");

  // Limpia el texto cuando se cierre el modal
  useEffect(() => {
    if (!open) setMotivo("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Apelar restricción
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 text-sm mb-3">
          Explica detalladamente por qué consideras que tu producto no debería estar restringido.
          El equipo de moderación revisará tu solicitud.
        </p>

        {/* Caja de texto */}
        <Textarea
          rows={5}
          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe las razones de tu apelación..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancelar
          </Button>

          <Button
            onClick={() => onSubmit(motivo)}
            disabled={!motivo.trim()}
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            Enviar apelación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
