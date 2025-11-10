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
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { productosApi } from "@/lib/api";
var Index = function () {
    var _a = useState([]), products = _a[0], setProducts = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    useEffect(function () {
        loadProducts();
    }, []);
    var loadProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, productosApi.getAll()];
                case 1:
                    response = _a.sent();
                    console.log("API Response:", response);
                    setProducts(response.items || []);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error loading products:", err_1);
                    setError("Error al cargar productos: " + err_1.message);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSearch = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, productosApi.getAll({ q: searchQuery })];
                case 1:
                    response = _a.sent();
                    setProducts(response.items || []);
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    setError("Error al buscar productos");
                    console.error("Error searching products:", err_2);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var filters = [
        { label: "New", active: true },
        { label: "Price ascending", active: false },
        { label: "Price descending", active: false },
        { label: "Rating", active: false },
    ];
    return (
    // ✅ CAMBIO: Agregar flex y flex-col para layout vertical
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      {/* ✅ CAMBIO: flex-1 para que el contenido crezca */}
      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:block hidden">
            <CategorySidebar />
          </div>


          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative mb-4">
                <Input type="search" placeholder="Buscar productos..." className="pl-10 bg-card border-border h-10 text-sm" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} onKeyPress={function (e) { return e.key === 'Enter' && handleSearch(); }}/>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" onClick={handleSearch}/>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map(function (filter, idx) { return (<Badge key={idx} variant={filter.active ? "default" : "outline"} className={filter.active
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-4 py-1.5"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer px-4 py-1.5 border-border"}>
                    {filter.label}
                  </Badge>); })}
              </div>
            </div>



            {/* Loading State */}
            {loading && (<div className="text-center py-8">
                <div className="text-muted-foreground">Cargando productos...</div>
              </div>)}


            {/* Error State */}
            {error && (<div className="text-center py-8">
                <div className="text-destructive">{error}</div>
                <button onClick={loadProducts} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Reintentar
                </button>
              </div>)}


            {/* Products Grid */}
            {!loading && !error && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(function (product) { return (<ProductCard key={product.id} id={product.id} title={product.nombre || "Sin nombre"} price={Number(product.precio) || 0} description={product.descripcion} image={product.urlFoto} location={product.ubicacion} category={product.categoria}/>); })}
              </div>)}


            {/* No Products */}
            {!loading && !error && products.length === 0 && (<div className="text-center py-8">
                <div className="text-muted-foreground">No se encontraron productos</div>
              </div>)}
          </div>
        </div>
      </main>


      {/* ✅ Footer siempre al final */}
      <Footer />
    </div>);
};
export default Index;
