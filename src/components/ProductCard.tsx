import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE } from "@/lib/api";
import { MapPin } from "lucide-react";

interface ProductCardProps {
  id: string;
  nombre: string; // ✅ CAMBIO: era "title"
  precio: number; // ✅ CAMBIO: era "price"
  descripcion?: string; // ✅ CAMBIO: era "description"
  urlFoto?: string | null; // ✅ CAMBIO: era "image"
  ubicacion?: string; // ✅ CAMBIO: era "location"
  categoria?: string; // ✅ CAMBIO: era "category"
}

const ProductCard = ({ id, nombre, precio, descripcion, urlFoto, ubicacion, categoria }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/product/${id}`)}
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border overflow-hidden bg-card"
    >
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {urlFoto ? (
          (() => {
            const imgStr = String(urlFoto);
            const src = imgStr.startsWith("http")
              ? imgStr
              : imgStr.startsWith("/")
                ? `${BACKEND_BASE}${imgStr}`
                : `${BACKEND_BASE}/${imgStr}`;

            return (
              <img
                src={src}
                alt={nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            );
          })()
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-muted-foreground text-sm">Sin imagen</div>
          </div>
        )}
        {categoria && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-xs"
          >
            {categoria}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{nombre}</h3>
        {descripcion && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{descripcion}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">${Number(precio).toFixed(2)}</p>
          {ubicacion && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {ubicacion}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
