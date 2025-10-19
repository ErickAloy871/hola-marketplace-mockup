import { Card } from "@/components/ui/card";

interface ProductCardProps {
  title: string;
  price: number;
  image?: string;
}

const ProductCard = ({ title, price, image }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border overflow-hidden bg-card">
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
