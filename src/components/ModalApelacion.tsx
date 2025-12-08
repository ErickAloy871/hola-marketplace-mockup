import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ModalApelacion({ open, onClose, onSubmit }) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setMotivo("");
      setLoading(false);
    }
  }, [open]);

  const enviar = async () => {
    if (!motivo.trim() || loading) return;

    setLoading(true);

    try {
      await onSubmit(motivo);
      setMotivo("");
      onClose();
    } catch (err) {
      console.error("Error al enviar apelación", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Apelar restricción
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 text-sm mb-3">
          Explica por qué consideras que tu producto no debería estar restringido.
        </p>

        <Textarea
          rows={5}
          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe tu apelación..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            disabled={!motivo.trim() || loading}
            onClick={enviar}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Enviando..." : "Enviar apelación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
