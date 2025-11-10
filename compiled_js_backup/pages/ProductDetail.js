var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import { productosApi } from "@/lib/api";
var ProductDetail = function () {
    var id = useParams().id;
    var navigate = useNavigate();
    var _a = useState(null), product = _a[0], setProduct = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    useEffect(function () {
        if (id) {
            loadProduct();
        }
    }, [id]);
    var loadProduct = function () { return __awaiter(void 0, void 0, void 0, function () {
        var productData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!id)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, productosApi.getById(id)];
                case 2:
                    productData = _a.sent();
                    setProduct(productData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("Error loading product:", err_1);
                    setError("Error al cargar el producto");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="min-h-screen flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="text-xl">Cargando producto...</div>
      </div>);
    }
    if (error || !product) {
        return (<div className="min-h-screen flex flex-col items-center justify-center text-center text-muted-foreground">
        <h2 className="text-xl font-semibold mb-4">Producto no encontrado</h2>
        <button onClick={function () { return navigate("/"); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Volver al inicio
        </button>
      </div>);
    }
    return (<div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-10 px-6">
        <div className="flex-1">
          <ImageGallery images={product.imagenes || (product.urlFoto ? [product.urlFoto] : [])} alt={product.nombre}/>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {product.nombre}
          </h1>
          <p className="text-3xl font-bold text-primary">${Number(product.precio).toFixed(2)}</p>
          <p className="text-muted-foreground">{product.descripcion}</p>
          
          {product.ubicacion && (<p className="text-sm text-muted-foreground">
              📍 {product.ubicacion}
            </p>)}
          
          {product.categoria && (<p className="text-sm text-muted-foreground">
              📂 {product.categoria}
            </p>)}

          <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
            Enviar mensaje
          </button>
        </div>
      </main>

      <Footer />
    </div>);
};
export default ProductDetail;
