import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const CategorySidebar = () => {
  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = [
    { id: "cat1", label: "Categoría 1", items: 3 },
    { id: "cat2", label: "Categoría 2", items: 7 },
    { id: "cat3", label: "Categoría 3", items: 5 },
  ];

  return (
    <aside className="w-full lg:w-64 bg-card rounded-xl p-6 shadow-sm border border-border h-fit sticky top-20">
      <h3 className="font-bold text-lg mb-6 text-foreground">Categorías</h3>
      
      <div className="space-y-4 mb-8">
        {categories.map((category) => (
          <div key={category.id} className="flex items-start gap-3">
            <Checkbox id={category.id} className="mt-1" />
            <Label
              htmlFor={category.id}
              className="text-sm font-medium cursor-pointer flex-1"
            >
              {category.label}
              <span className="block text-xs text-muted-foreground mt-0.5">
                ({category.items} items)
              </span>
            </Label>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-border">
        <h4 className="font-semibold text-sm mb-4 text-foreground">Rango de Precio</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100}
          step={1}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
