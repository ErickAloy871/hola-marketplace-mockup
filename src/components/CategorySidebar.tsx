import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { moderationApi } from "@/lib/api";

interface CategorySidebarProps {
  selectedTipos: string[];
  onTiposChange: (tipos: string[]) => void;
  selectedCategorias: string[];
  onCategoriasChange: (categorias: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice?: number;
}

const CategorySidebar = ({ 
  selectedTipos, 
  onTiposChange,
  selectedCategorias,
  onCategoriasChange,
  priceRange, 
  onPriceChange,
  maxPrice = 1000 
}: CategorySidebarProps) => {
  
  const [categories, setCategories] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await moderationApi.getCategories();
        setCategories(res);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  const tipos = [
    { id: "PRODUCTO", label: "Producto", description: "Artículos físicos" },
    { id: "SERVICIO", label: "Servicio", description: "Servicios profesionales" },
  ];

  const handleTipoToggle = (tipoId: string) => {
    if (selectedTipos.includes(tipoId)) {
      onTiposChange(selectedTipos.filter(t => t !== tipoId));
    } else {
      onTiposChange([...selectedTipos, tipoId]);
    }
  };

  const handleCategoriaToggle = (categoriaNombre: string) => {
    if (selectedCategorias.includes(categoriaNombre)) {
      onCategoriasChange(selectedCategorias.filter(c => c !== categoriaNombre));
    } else {
      onCategoriasChange([...selectedCategorias, categoriaNombre]);
    }
  };

  return (
    <aside className="w-full lg:w-64 h-fit sticky top-20 space-y-6">
      {/* Tipo de publicación */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground">Tipo de publicación</h3>
        <div className="space-y-3">
          {tipos.map((tipo) => (
            <div key={tipo.id} className="flex items-start gap-2.5">
              <Checkbox 
                id={tipo.id}
                checked={selectedTipos.includes(tipo.id)}
                onCheckedChange={() => handleTipoToggle(tipo.id)}
                className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
              />
              <Label
                htmlFor={tipo.id}
                className="text-sm font-medium cursor-pointer flex-1 leading-tight"
              >
                {tipo.label}
                <span className="block text-xs text-muted-foreground mt-0.5 font-normal">
                  {tipo.description}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Categorías</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {loadingCategories ? (
            <p className="text-xs text-muted-foreground">Cargando...</p>
          ) : categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay categorías</p>
          ) : (
            categories.map((categoria) => (
              <div key={categoria.id} className="flex items-center gap-2">
                <Checkbox 
                  id={`cat-${categoria.id}`}
                  checked={selectedCategorias.includes(categoria.nombre)}
                  onCheckedChange={() => handleCategoriaToggle(categoria.nombre)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                />
                <Label
                  htmlFor={`cat-${categoria.id}`}
                  className="text-sm cursor-pointer flex-1 leading-tight font-normal"
                >
                  {categoria.nombre}
                </Label>
              </div>
            ))
          )}
        </div>
        {categories.length > 0 && (
          <button
            onClick={() => onCategoriasChange([])}
            className="text-xs text-primary hover:underline mt-2"
          >
            Limpiar categorías
          </button>
        )}
      </div>

      {/* Rango de precio */}
      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Rango de precio</h3>
        <div className="flex justify-between text-xs mb-3 font-medium">
          <span className="text-foreground">${priceRange[0]}</span>
          <span className="text-foreground">${priceRange[1]}</span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={(value) => onPriceChange(value as [number, number])}
          max={maxPrice}
          step={10}
          className="mb-1"
        />
      </div>
    </aside>
  );
};

export default CategorySidebar;
