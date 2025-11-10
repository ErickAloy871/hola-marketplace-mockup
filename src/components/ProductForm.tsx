import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_BASE } from "@/lib/api";

type Props = {
    onSuccess?: () => void;
};

export default function ProductForm({ onSuccess }: Props) {
    const { toast } = useToast();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState<number | "">("");
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

    // Si se cargaron categorías y no hay ninguna seleccionada, prefijar la primera
    useEffect(() => {
        if (!categoriesLoading && categories.length > 0 && !categoria) {
            setCategoria(String(categories[0].id));
        }
    }, [categoriesLoading, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Si hay imágenes, enviamos multipart/form-data
            if (images.length > 0) {
                const form = new FormData();
                form.append("nombre", nombre);
                form.append("descripcion", descripcion);
                form.append("precio", String(Number(precio)));
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
                const payload: any = { nombre, descripcion, precio: Number(precio) };
                if (categoria) payload.categoriaId = Number(categoria);

                const api = await import("@/lib/api");
                await (api as any).productosApi.create(payload as any);
            }

            toast({ title: "Publicación creada", description: "Tu producto se ha enviado y estará pendiente de aprobación." });
            onSuccess?.();
        } catch (err: any) {
            console.error("Error creando producto:", err);
            toast({ title: "Error", description: err?.message || "No se pudo crear el producto" });
        } finally {
            setLoading(false);
        }
    };

    const MAX_IMAGES = 5;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB por imagen

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        if (images.length + arr.length > MAX_IMAGES) {
            toast({ title: "Límite de imágenes", description: `Máximo ${MAX_IMAGES} imágenes por producto.` });
            return;
        }

        const invalid = arr.find((f) => !f.type.startsWith("image/"));
        if (invalid) {
            toast({ title: "Archivo inválido", description: "Solo están permitidas imágenes." });
            return;
        }

        const tooLarge = arr.find((f) => f.size > MAX_SIZE_BYTES);
        if (tooLarge) {
            toast({ title: "Archivo muy grande", description: `Cada imagen debe ser menor a ${MAX_SIZE_BYTES / (1024 * 1024)}MB.` });
            return;
        }

        const newImages = [...images, ...arr];
        setImages(newImages);

        // Generar previews
        const newPreviews = arr.map((f) => URL.createObjectURL(f));
        setPreviews((p) => [...p, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setImages((imgs) => imgs.filter((_, i) => i !== index));
        setPreviews((p) => {
            // revoke object URL
            try { URL.revokeObjectURL(p[index]); } catch { }
            return p.filter((_, i) => i !== index);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div>
                <Label htmlFor="precio">Precio</Label>
                <Input id="precio" type="number" value={precio as any} onChange={(e) => setPrecio(Number(e.target.value))} required />
            </div>

            <div>
                <Label htmlFor="categoria">Categoría</Label>
                <select
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full border border-border rounded px-2 py-1"
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
                <p className="text-xs text-muted-foreground mt-1">Selecciona una categoría existente.</p>
            </div>

            <div>
                <Label>Imágenes</Label>
                {/* Botón estilizado para elegir archivos (input hidden) */}
                <div className="mt-2 flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        id="product-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />
                    <Button type="button" className="bg-secondary text-white" onClick={() => fileInputRef.current?.click()}>
                        Elegir Imagenes
                    </Button>
                    <span className="text-sm text-muted-foreground">{images.length} imagen(es) seleccionada(s)</span>
                </div>
                {previews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {previews.map((p, i) => (
                            <div key={i} className="relative">
                                <img src={p} alt={`preview-${i}`} className="w-full h-24 object-cover rounded" />
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded px-1">x</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                    {loading ? "Publicando..." : "Publicar"}
                </Button>
            </div>
        </form>
    );
}
