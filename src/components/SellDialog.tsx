import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

export default function SellDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener("open-sell-modal", handler as EventListener);
        return () => window.removeEventListener("open-sell-modal", handler as EventListener);
    }, []);

    return (
        <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
            <DialogContent>
                <DialogTitle>Publicar un artículo</DialogTitle>
                <DialogDescription>Completa los datos para publicar tu producto.</DialogDescription>

                <div className="mt-4">
                    <ProductForm onSuccess={() => setOpen(false)} />
                </div>

                <DialogClose asChild>
                    <button className="absolute right-4 top-4">Cerrar</button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
