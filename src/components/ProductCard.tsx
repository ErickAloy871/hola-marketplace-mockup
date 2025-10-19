import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image?: string;
}

const ProductCard = ({ id, title, price, image }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/product/${id}`)}
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border overflow-hidden bg-card"
    >
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-1">{title}</h3>
        <p className="text-sm font-semibold text-foreground">${price}</p>
      </div>
    </Card>
  );
};

export default ProductCard;
