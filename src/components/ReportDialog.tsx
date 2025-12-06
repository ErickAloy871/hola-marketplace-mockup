import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface ReportDialogProps {
  publicacionId: string;
}

const ReportDialog = ({ publicacionId }: ReportDialogProps) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"categoria" | "motivo">("categoria");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const categorias = [
    {
      id: "ESTAFA",
      label: "Estafa",
      description: "Fraude o engaño intencional"
    },
    {
      id: "ARTICULOS_RESTRINGIDOS",
      label: "Venta o promoción de artículos restringidos",
      description: "Productos prohibidos o ilegales"
    },
    {
      id: "ANUNCIOS_IMPRECISOS",
      label: "Anuncios imprecisos",
      description: "Información falsa o engañosa"
    },
    {
      id: "DESNUDOS_ACTIVIDAD_SEXUAL",
      label: "Desnudos o actividad sexual",
      description: "Contenido sexualmente explícito"
    },
    {
      id: "VIOLENCIA_ODIO_EXPLOTACION",
      label: "Violencia, odio o explotación",
      description: "Contenido que incita al odio o violencia"
    },
    {
      id: "BULLYING_ACOSO",
      label: "Bullying o acoso",
      description: "Hostigamiento o intimidación"
    },
    {
      id: "SUICIDIO_AUTOLESION",
      label: "Suicidio, autolesión o trastornos alimenticios",
      description: "Contenido que promueve daño personal"
    }
  ];

  const handleCategoriaSelect = (categoriaId: string) => {
    setSelectedCategoria(categoriaId);
    setStep("motivo");
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para reportar esta publicación",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCategoria) {
      toast({
        title: "Selecciona una categoría",
        description: "Debes seleccionar una razón para el reporte",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await reportesApi.create(Number(publicacionId), selectedCategoria, motivo);
      
      toast({
        title: "Reporte enviado",
        description: "Gracias por tu reporte. Lo revisaremos pronto.",
      });

      setOpen(false);
      setStep("categoria");
      setSelectedCategoria("");
      setMotivo("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("categoria");
    setSelectedCategoria("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
          <Flag className="w-4 h-4 mr-2" />
          Reportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Denunciar</DialogTitle>
          <DialogDescription>
            {step === "categoria" 
              ? "¿Por qué quieres denunciar esta publicación?"
              : "Proporciona detalles adicionales (opcional)"}
          </DialogDescription>
        </DialogHeader>

        {step === "categoria" ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            <p className="text-sm text-muted-foreground mb-4">
              Si alguien se encuentra en peligro inminente, busca ayuda antes de enviar una denuncia. No esperes.
            </p>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoriaSelect(cat.id)}
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-sm">{cat.label}</p>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">
                {categorias.find(c => c.id === selectedCategoria)?.label}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivo">Describe el problema (opcional)</Label>
              <Textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Proporciona más detalles sobre el problema..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={loading}
              >
                Atrás
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-destructive hover:bg-destructive/90"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar reporte"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
