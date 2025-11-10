import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE } from "@/lib/api";
import { MapPin } from "lucide-react";
var ProductCard = function (_a) {
    var id = _a.id, title = _a.title, price = _a.price, description = _a.description, image = _a.image, location = _a.location, category = _a.category;
    var navigate = useNavigate();
    return (<Card onClick={function () { return navigate("/product/".concat(id)); }} className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border overflow-hidden bg-card">
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {image ? ((function () {
            // Normalizar la URL de la imagen: puede ser
            // - URL completa: http(s)://...
            // - ruta relativa empezando con /uploads/...
            // - solo el nombre de archivo
            var imgStr = String(image);
            var src = imgStr.startsWith("http")
                ? imgStr
                : "".concat(BACKEND_BASE).concat(imgStr.startsWith("/") ? "" : "/").concat(imgStr.replace(/^\/+/, ""));
            return (<img src={src} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"/>);
        })()) : (<div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-muted-foreground text-sm">Sin imagen</div>
          </div>)}
        {category && (<Badge variant="secondary" className="absolute top-2 left-2 text-xs">
            {category}
          </Badge>)}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{title}</h3>
        {description && (<p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>)}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">${Number(price).toFixed(2)}</p>
          {location && (<div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1"/>
              {location}
            </div>)}
        </div>
      </div>
    </Card>);
};
export default ProductCard;
