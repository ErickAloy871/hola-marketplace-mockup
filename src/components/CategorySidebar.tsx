import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const CategorySidebar = () => {
  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = [
    { id: "cat1", label: "Categoría 1", description: "Description" },
    { id: "cat2", label: "Categoría 2", description: "Description" },
    { id: "cat3", label: "Categoría 3", description: "Description" },
  ];

  return (
    <aside className="w-full lg:w-64 bg-card rounded-lg p-6 border border-border h-fit sticky top-20">
      <h3 className="font-bold text-base mb-6 text-foreground">Categorías</h3>
      
      <div className="space-y-4 mb-8">
        {categories.map((category) => (
          <div key={category.id} className="flex items-start gap-3">
            <Checkbox 
              id={category.id} 
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
            />
            <Label
              htmlFor={category.id}
              className="text-sm font-medium cursor-pointer flex-1 leading-tight"
            >
              {category.label}
              <span className="block text-xs text-muted-foreground mt-1 font-normal">
                {category.description}
              </span>
            </Label>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex justify-between text-sm mb-4">
          <span className="font-medium text-foreground">${priceRange[0]}</span>
          <span className="font-medium text-foreground">${priceRange[1]}</span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100}
          step={1}
          className="mb-2"
        />
      </div>
    </aside>
  );
};

export default CategorySidebar;
