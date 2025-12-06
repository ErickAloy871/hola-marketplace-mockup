import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_BASE } from "@/lib/api";
import { Upload, X, Package, DollarSign, Tag, Image as ImageIcon } from "lucide-react";

type Props = {
    onSuccess?: () => void;
};

export default function ProductForm({ onSuccess }: Props) {
    const { toast } = useToast();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
    const [tipo, setTipo] = useState<"PRODUCTO" | "SERVICIO">("PRODUCTO");
    const [categoria, setCategoria] = useState<string | number>("");
    const [categories, setCategories] = useState<Array<{ id: number; nombre: string }>>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const api = await import("@/lib/api");
                const res: any = await (api as any).moderationApi.getCategories();
                if (Array.isArray(res)) setCategories(res as any);
                else if (res.items) setCategories(res.items);
                else setCategories(res);
            } catch (e) {
                console.error("Error cargando categorías:", e);
                toast({ title: "Error", description: "No se pudieron cargar las categorías." });
            } finally {
                setCategoriesLoading(false);
            }
        })();
    }, []);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!categoriesLoading && categories.length > 0 && !categoria) {
            setCategoria(String(categories[0].id));
        }
    }, [categoriesLoading, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (images.length > 0) {
                const form = new FormData();
                form.append("nombre", nombre);
                form.append("descripcion", descripcion);
                form.append("precio", String(Number(precio)));
                form.append("tipo", tipo);
                if (categoria) form.append("categoriaId", String(categoria));

                images.forEach((f) => form.append("images", f));

                const token = localStorage.getItem("token");
                const res = await fetch(`${BACKEND_BASE}/api/productos`, {
                    method: "POST",
                    body: form,
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });

                if (!res.ok) throw new Error(await res.text());
            } else {
                const payload: any = { 
                    nombre, 
                    descripcion, 
                    precio: Number(precio),
                    tipo
                };
                if (categoria) payload.categoriaId = Number(categoria);

                const api = await import("@/lib/api");
                await (api as any).productosApi.create(payload as any);
            }

            toast({ 
                title: "¡Publicación creada!", 
                description: "Tu producto se ha enviado y estará pendiente de aprobación.",
                variant: "default"
            });
            onSuccess?.();
        } catch (err: any) {
            console.error("Error creando producto:", err);
            toast({ 
                title: "Error", 
                description: err?.message || "No se pudo crear el producto",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const MAX_IMAGES = 5;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        if (images.length + arr.length > MAX_IMAGES) {
            toast({ 
                title: "Límite de imágenes", 
                description: `Máximo ${MAX_IMAGES} imágenes por producto.`,
                variant: "destructive"
            });
            return;
        }

        const invalid = arr.find((f) => !f.type.startsWith("image/"));
        if (invalid) {
            toast({ 
                title: "Archivo inválido", 
                description: "Solo están permitidas imágenes.",
                variant: "destructive"
            });
            return;
        }

        const tooLarge = arr.find((f) => f.size > MAX_SIZE_BYTES);
        if (tooLarge) {
            toast({ 
                title: "Archivo muy grande", 
                description: `Cada imagen debe ser menor a ${MAX_SIZE_BYTES / (1024 * 1024)}MB.`,
                variant: "destructive"
            });
            return;
        }

        const newImages = [...images, ...arr];
        setImages(newImages);

        const newPreviews = arr.map((f) => URL.createObjectURL(f));
        setPreviews((p) => [...p, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setImages((imgs) => imgs.filter((_, i) => i !== index));
        setPreviews((p) => {
            try { URL.revokeObjectURL(p[index]); } catch { }
            return p.filter((_, i) => i !== index);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Nombre del producto/servicio
                </Label>
                <Input 
                    id="nombre" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Ej: Laptop HP 15 pulgadas"
                    className="h-11"
                    required 
                />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium">
                    Descripción
                </Label>
                <Textarea 
                    id="descripcion" 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    placeholder="Describe tu producto o servicio en detalle..."
                    className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                    Una buena descripción aumenta las posibilidades de venta
                </p>
            </div>

            {/* Grid para Precio y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Precio */}
                <div className="space-y-2">
                    <Label htmlFor="precio" className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Precio
                    </Label>
                    <Input 
                        id="precio" 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        value={precio as any} 
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 0 || e.target.value === "") {
                                setPrecio(val || "");
                            }
                        }}
                        placeholder="0.00"
                        className="h-11"
                        required 
                    />
                </div>

                {/* Tipo de publicación */}
                <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-sm font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Tipo de publicación
                    </Label>
                    <select
                        id="tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as "PRODUCTO" | "SERVICIO")}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    >
                        <option value="PRODUCTO">Producto</option>
                        <option value="SERVICIO">Servicio</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                        {tipo === "PRODUCTO" ? "Artículo físico que vendes" : "Servicio que ofreces"}
                    </p>
                </div>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium">
                    Categoría
                </Label>
                <select
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full h-11 border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={categoriesLoading || categories.length === 0}
                >
                    {categoriesLoading ? (
                        <option value="">Cargando categorías...</option>
                    ) : categories.length === 0 ? (
                        <option value="">No hay categorías disponibles</option>
                    ) : (
                        <>
                            <option value="">-- Selecciona una categoría --</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </>
                    )}
                </select>
            </div>

            {/* Imágenes */}
            <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Imágenes ({images.length}/{MAX_IMAGES})
                </Label>
                
                {/* Botón de subida */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        id="product-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                        Haz clic para subir imágenes
                    </p>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP hasta 5MB • Máximo {MAX_IMAGES} imágenes
                    </p>
                </div>

                {/* Preview de imágenes */}
                {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {previews.map((p, i) => (
                            <div key={i} className="relative group aspect-square">
                                <img 
                                    src={p} 
                                    alt={`Preview ${i + 1}`} 
                                    className="w-full h-full object-cover rounded-lg border border-border" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(i)} 
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium shadow-sm" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Publicando...
                        </>
                    ) : (
                        "Publicar artículo"
                    )}
                </Button>
            </div>

            {/* Info adicional */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 <strong>Consejo:</strong> Los productos con imágenes claras y descripciones detalladas tienen 
                    más probabilidades de ser aprobados automáticamente y venderse rápido.
                </p>
            </div>
        </form>
    );
}
