import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  title: string;
  price: number;
  image?: string;
}

const ProductCard = ({ title, price, image }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-4xl text-primary/40">📦</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-lg font-bold text-primary">${price}</p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
