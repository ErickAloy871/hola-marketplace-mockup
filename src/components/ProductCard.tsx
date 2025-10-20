import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string | null;
  location?: string;
  category?: string;
}

const ProductCard = ({ id, title, price, description, image, location, category }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/product/${id}`)}
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border overflow-hidden bg-card"
    >
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-muted-foreground text-sm">Sin imagen</div>
          </div>
        )}
        {category && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 text-xs"
          >
            {category}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">${Number(price).toFixed(2)}</p>
          {location && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
