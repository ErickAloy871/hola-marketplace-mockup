interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    description?: string;
    image?: string | null;
    location?: string;
    category?: string;
}
declare const ProductCard: ({ id, title, price, description, image, location, category }: ProductCardProps) => import("react").JSX.Element;
export default ProductCard;
