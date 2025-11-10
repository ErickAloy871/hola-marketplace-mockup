import { useState } from "react";
import { BACKEND_BASE } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
var ImageGallery = function (_a) {
    var images = _a.images, alt = _a.alt;
    var _b = useState(0), currentIndex = _b[0], setCurrentIndex = _b[1];
    if (!images || images.length === 0) {
        return (<div className="w-full max-w-lg mx-auto">
        <div className="h-96 bg-muted rounded-lg shadow-md flex items-center justify-center">
          <div className="text-muted-foreground">Sin imagen</div>
        </div>
      </div>);
    }
    var goToPrevious = function () {
        setCurrentIndex(function (prevIndex) {
            return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
        });
    };
    var goToNext = function () {
        setCurrentIndex(function (prevIndex) {
            return prevIndex === images.length - 1 ? 0 : prevIndex + 1;
        });
    };
    var goToImage = function (index) {
        setCurrentIndex(index);
    };
    return (<div className="w-full max-w-lg mx-auto">
      {/* Imagen principal */}
      <div className="relative flex justify-center">
        <img src={(function () {
            var img = String(images[currentIndex] || "");
            return img.startsWith("http")
                ? img
                : "".concat(BACKEND_BASE).concat(img.startsWith("/") ? "" : "/").concat(img.replace(/^\/+/, ""));
        })()} alt={"".concat(alt, " - Imagen ").concat(currentIndex + 1)} className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"/>

        {/* Navegación solo si hay más de una imagen */}
        {images.length > 1 && (<>
            <Button variant="outline" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <Button variant="outline" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={goToNext}>
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </>)}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (<div className="flex gap-2 mt-4 justify-center">
          {images.map(function (image, index) { return (<button key={index} onClick={function () { return goToImage(index); }} className={"w-16 h-16 rounded-md overflow-hidden border-2 transition-all ".concat(index === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50')}>
              <img src={(function () {
                    var img = String(image || "");
                    return img.startsWith("http")
                        ? img
                        : "".concat(BACKEND_BASE).concat(img.startsWith("/") ? "" : "/").concat(img.replace(/^\/+/, ""));
                })()} alt={"".concat(alt, " - Miniatura ").concat(index + 1)} className="w-full h-full object-cover"/>
            </button>); })}
        </div>)}

      {/* Contador de imágenes */}
      {images.length > 1 && (<div className="text-center mt-2 text-sm text-muted-foreground">
          {currentIndex + 1} de {images.length}
        </div>)}
    </div>);
};
export default ImageGallery;
