import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const CategorySidebar = () => {
  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = [
    { id: "cat1", label: "Categoría 1", checked: true },
    { id: "cat2", label: "Categoría 2", checked: true },
    { id: "cat3", label: "Categoría 3", checked: true },
  ];

  return (
    <aside className="w-full lg:w-56 h-fit sticky top-20">
      <div className="bg-card rounded-lg p-5 border border-border shadow-sm">
        <h3 className="font-semibold text-sm mb-5 text-foreground">Categorías</h3>
        
        <div className="space-y-3.5 mb-6">
          {categories.map((category) => (
            <div key={category.id} className="flex items-start gap-2.5">
              <Checkbox 
                id={category.id}
                defaultChecked={category.checked}
                className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-medium cursor-pointer flex-1 leading-tight"
              >
                {category.label}
                <span className="block text-xs text-muted-foreground mt-0.5 font-normal">
                  Description
                </span>
              </Label>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm mb-3 font-medium">
            <span className="text-foreground">${priceRange[0]}</span>
            <span className="text-foreground">${priceRange[1]}</span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100}
            step={1}
            className="mb-1"
          />
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
