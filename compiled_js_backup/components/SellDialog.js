import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
export default function SellDialog() {
    var _a = useState(false), open = _a[0], setOpen = _a[1];
    useEffect(function () {
        var handler = function () { return setOpen(true); };
        window.addEventListener("open-sell-modal", handler);
        return function () { return window.removeEventListener("open-sell-modal", handler); };
    }, []);
    return (<Dialog open={open} onOpenChange={function (o) { return setOpen(o); }}>
            <DialogContent>
                <DialogTitle>Publicar un artículo</DialogTitle>
                <DialogDescription>Completa los datos para publicar tu producto.</DialogDescription>

                <div className="mt-4">
                    <ProductForm onSuccess={function () { return setOpen(false); }}/>
                </div>

                <DialogClose asChild>
                    <button className="absolute right-4 top-4">Cerrar</button>
                </DialogClose>
            </DialogContent>
        </Dialog>);
}
