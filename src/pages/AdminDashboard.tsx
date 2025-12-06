import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  UserPlus,
  Users,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ErrorModal from "@/components/ui/ErrorModal";
import WarningModal from "@/components/ui/WarningModal";

import { useAuth } from "@/hooks/useAuth";
import { reportesApi } from "@/lib/api";

const API = "http://localhost:4000/api/admin";

interface AdminUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  estadoCuenta: string;
  cuentaVerificada?: 0 | 1 | boolean;
  fechaCreacion?: string;
}

interface Reporte {
  id: number;
  publicacionId: number;
  publicacionNombre: string;
  publicacionPrecio: number;
  categoria: string;
  motivo: string | null;
  estado: "PENDIENTE" | "REVISADO" | "RESUELTO";
  fechaReporte: string;
  reportadoPor: string;
  reportadoPorCorreo: string;
  revisadoPorNombre: string | null;
}

const categoriaLabels: Record<string, string> = {
  ESTAFA: "Estafa",
  ARTICULOS_RESTRINGIDOS: "Artículos restringidos",
  ANUNCIOS_IMPRECISOS: "Anuncios imprecisos",
  DESNUDOS_ACTIVIDAD_SEXUAL: "Desnudos o actividad sexual",
  VIOLENCIA_ODIO_EXPLOTACION: "Violencia, odio o explotación",
  BULLYING_ACOSO: "Bullying o acoso",
  SUICIDIO_AUTOLESION: "Suicidio o autolesión"
};

const AdminPanel = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    | "moderadores"
    | "registrar"
    | "configuracion"
    | "reportes"
    | "incidencias"
    | "peligrosos"
  >("moderadores");

  // Datos
  const [moderadores, setModeradores] = useState<AdminUser[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<AdminUser[]>([]);
  const [publicacionesConfig, setPublicacionesConfig] = useState<any[]>([]);
  
  // ✅ NUEVO: Estados para reportes
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    tipo: "eliminar-reporte" | "eliminar-publicacion" | null;
    reporteId: number | null;
  }>({ open: false, tipo: null, reporteId: null });

  const [loadingData, setLoadingData] = useState(true);

  // Modales
  const [successModal, setSuccessModal] = useState<any>(null);
  const [errorModal, setErrorModal] = useState<any>(null);
  const [confirmModalOld, setConfirmModalOld] = useState<any>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.roles?.includes("ADMINISTRADOR")) {
      navigate("/");
      return;
    }

    loadData();
  }, [loading, isAuthenticated, user]);

  // ==========================
  // ⬇ Cargar datos del panel
  // ==========================
  const loadData = async () => {
    setLoadingData(true);

    try {
      // 1. Moderadores
      const modRes = await fetch(`${API}/moderadores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModeradores(await modRes.json());

      // 2. Usuarios NO moderadores NI admins
      const usuariosRes = await fetch(`${API}/usuarios-disponibles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuariosDisponibles(await usuariosRes.json());

      // 3. Publicaciones para configuración
      const pubsRes = await fetch(`${API}/publicaciones-configuracion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pubsJson = await pubsRes.json();
      setPublicacionesConfig(Array.isArray(pubsJson) ? pubsJson : []);

      // ✅ 4. NUEVO: Cargar reportes
      const reportesData = await reportesApi.getAll();
      setReportes(reportesData);
    } catch (e) {
      console.error(e);
      setErrorModal({
        title: "Error al cargar datos",
        message: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // =====================================================
  // 🔵 Registrar moderador
  // =====================================================
  const registrarModerador = async (id: number) => {
    try {
      await fetch(`${API}/moderadores`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId: id }),
      });

      setSuccessModal({
        title: "Moderador registrado",
        message: "El usuario ahora tiene rol de moderador.",
      });

      loadData();
    } catch (e) {
      setErrorModal({
        title: "Error al registrar",
        message: "No se pudo registrar al moderador.",
      });
    }
  };

  // =====================================================
  // 🔴 Suspender moderador
  // =====================================================
  const suspender = async (id: number) => {
    try {
      await fetch(`${API}/moderadores/${id}/suspender`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo: "Suspensión administrativa" }),
      });

      setSuccessModal({
        title: "Moderador suspendido",
        message: "La cuenta ha sido suspendida correctamente.",
      });

      loadData();
    } catch (e) {
      setErrorModal({
        title: "Error al suspender",
        message: "No se pudo suspender al moderador.",
      });
    }
  };

  // =====================================================
  // 🟢 Reactivar moderador
  // =====================================================
  const reactivar = async (id: number) => {
    try {
      await fetch(`${API}/moderadores/${id}/reactivar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessModal({
        title: "Moderador reactivado",
        message: "El usuario está activo nuevamente.",
      });

      loadData();
    } catch (e) {
      setErrorModal({
        title: "Error al reactivar",
        message: "No se pudo reactivar la cuenta.",
      });
    }
  };

  // =====================================================
  // ❌ Eliminar rol de moderador
  // =====================================================
  const eliminarRol = async (id: number) => {
    setConfirmModalOld({
      title: "Eliminar rol de moderador",
      message: "¿Estás seguro de eliminar este rol? El usuario volverá a ser comprador y vendedor.",
      onConfirm: async () => {
        try {
          await fetch(`${API}/moderadores/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          setSuccessModal({
            title: "Rol eliminado",
            message: "El usuario ya no es moderador.",
          });

          loadData();
        } catch (e) {
          setErrorModal({
            title: "Error al eliminar",
            message: "No se pudo eliminar el rol.",
          });
        }
      },
    });
  };

  const actualizarTiempo = async (id: number, dias: number) => {
    if (!dias || dias < 1) {
      return setErrorModal({
        title: "Valor inválido",
        message: "Debe ingresar un número de días mayor a 0",
      });
    }

    try {
      await fetch(`${API}/publicaciones/${id}/tiempo-publicacion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dias }),
      });

      setSuccessModal({
        title: "Tiempo actualizado",
        message: "El tiempo máximo de publicación fue actualizado.",
      });

      loadData();
    } catch (e) {
      console.error(e);
      setErrorModal({
        title: "Error",
        message: "No se pudo actualizar el tiempo.",
      });
    }
  };

  // =====================================================
  // ✅ NUEVO: Funciones para gestión de reportes
  // =====================================================
  const handleVerDetalle = (reporte: Reporte) => {
    setSelectedReporte(reporte);
    setDialogOpen(true);
  };

  const handleMarcarRevisado = async (id: number) => {
    try {
      await reportesApi.marcarRevisado(id);
      setSuccessModal({
        title: "Reporte revisado",
        description: "El reporte ha sido marcado como revisado"
      });
      loadData();
    } catch (error) {
      setErrorModal({
        title: "Error",
        message: "No se pudo marcar el reporte como revisado",
      });
    }
  };

  const handleEliminarReporte = async (id: number) => {
    try {
      await reportesApi.eliminar(id);
      setSuccessModal({
        title: "Reporte eliminado",
        message: "El reporte ha sido eliminado sin afectar la publicación"
      });
      setConfirmDialog({ open: false, tipo: null, reporteId: null });
      loadData();
    } catch (error) {
      setErrorModal({
        title: "Error",
        message: "No se pudo eliminar el reporte",
      });
    }
  };

  const handleEliminarPublicacion = async (id: number) => {
    try {
      await reportesApi.eliminarPublicacion(id);
      setSuccessModal({
        title: "Publicación eliminada",
        message: "La publicación y todos sus reportes han sido eliminados"
      });
      setConfirmDialog({ open: false, tipo: null, reporteId: null });
      loadData();
    } catch (error) {
      setErrorModal({
        title: "Error",
        message: "No se pudo eliminar la publicación",
      });
    }
  };

  const reportesFiltrados = reportes.filter((r) => {
    if (filtroEstado === "TODOS") return true;
    return r.estado === filtroEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      PENDIENTE: "destructive",
      REVISADO: "default",
      RESUELTO: "secondary"
    };
    return (
      <Badge variant={variants[estado] || "default"}>
        {estado}
      </Badge>
    );
  };

  if (loadingData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando panel de administración...</p>
      </div>
    );

  // =====================================================
  // 🔥 RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto py-10 px-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("moderadores")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "moderadores"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Moderadores ({moderadores.length})
          </button>

          <button
            onClick={() => setActiveTab("registrar")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "registrar"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrar moderador
          </button>

          <button
            onClick={() => setActiveTab("configuracion")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "configuracion"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuración
          </button>

          <button
            onClick={() => setActiveTab("reportes")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "reportes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reportes ({reportes.filter(r => r.estado === "PENDIENTE").length})
          </button>

          <button
            onClick={() => setActiveTab("incidencias")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "incidencias"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Incidencias
          </button>

          <button
            onClick={() => setActiveTab("peligrosos")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "peligrosos"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Productos peligrosos
          </button>
        </div>

        {/* =====================================================
            TAB: LISTA DE MODERADORES
        ===================================================== */}
        {activeTab === "moderadores" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Moderadores registrados</h2>

            {moderadores.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay moderadores registrados
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {moderadores.map((m) => (
                  <Card key={m.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {m.nombre} {m.apellido}
                        </CardTitle>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          MODERADOR
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.correo}</p>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono</span>
                        <span>{m.telefono || "No registrado"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección</span>
                        <span className="text-right max-w-[60%]">
                          {m.direccion || "No registrada"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            m.estadoCuenta === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {m.estadoCuenta}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verificación</span>
                        <span>
                          {m.cuentaVerificada
                            ? "Cuenta verificada"
                            : "Pendiente de verificación"}
                        </span>
                      </div>

                      {m.fechaCreacion && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registrado</span>
                          <span>
                            {new Date(m.fechaCreacion).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-3 flex gap-2 justify-end border-t mt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => suspender(m.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Suspender
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => reactivar(m.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Reactivar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gray-600 hover:bg-gray-700"
                          onClick={() => eliminarRol(m.id)}
                        >
                          Eliminar rol
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================================
            TAB: REGISTRAR MODERADOR
        ===================================================== */}
        {activeTab === "registrar" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Registrar nuevo moderador</h2>

            {usuariosDisponibles.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay usuarios disponibles para convertir en moderador.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {usuariosDisponibles.map((u) => (
                  <Card key={u.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {u.nombre} {u.apellido}
                        </CardTitle>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          Usuario estándar
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.correo}</p>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono</span>
                        <span>{u.telefono || "No registrado"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección</span>
                        <span className="text-right max-w-[60%]">
                          {u.direccion || "No registrada"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            u.estadoCuenta === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {u.estadoCuenta}
                        </span>
                      </div>

                      {u.fechaCreacion && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registrado</span>
                          <span>
                            {new Date(u.fechaCreacion).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-3 flex justify-end border-t mt-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => registrarModerador(u.id)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrar como moderador
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================================
            TAB: CONFIGURACIÓN
        ===================================================== */}
        {activeTab === "configuracion" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Configurar tiempo de publicación por publicación
            </h2>

            {publicacionesConfig.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay publicaciones registradas.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {publicacionesConfig.map((p) => (
                  <Card key={p.id} className="overflow-hidden shadow">
                    {/* Imagen */}
                    <CardHeader className="p-0">
                      {p.urlFoto ? (
                        <img
                          src={
                            p.urlFoto.startsWith("http")
                              ? p.urlFoto
                              : `http://localhost:4000${p.urlFoto}`
                          }
                          alt={p.nombre}
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-500">
                          Sin imagen
                        </div>
                      )}
                    </CardHeader>

                    {/* Contenido */}
                    <CardContent className="p-4 space-y-3 text-sm">
                      <h3 className="font-semibold text-lg">{p.nombre}</h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {p.descripcion}
                      </p>

                      <div className="flex justify-between">
                        <span className="font-medium">Precio:</span>
                        <span>${p.precio}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">Estado:</span>
                        <span>{p.estado}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">Tiempo global:</span>
                        <span className="font-semibold">
                          {p.tiempoGlobal ? `${p.tiempoGlobal} días` : "No definido"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">Tiempo específico:</span>
                        <span className="font-semibold">
                          {p.tiempoPublicacion
                            ? `${p.tiempoPublicacion} días`
                            : "Usando global"}
                        </span>
                      </div>

                      <div className="mt-2">
                        <label className="text-muted-foreground text-xs">
                          Nuevo tiempo (días):
                        </label>
                        <input
                          type="number"
                          min={1}
                          defaultValue={p.tiempoPublicacion || p.tiempoGlobal || 10}
                          className="border rounded px-2 py-1 w-full mt-1 text-sm"
                          onChange={(e) => (p._nuevoTiempo = Number(e.target.value))}
                        />
                      </div>

                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 w-full mt-3"
                        onClick={() =>
                          actualizarTiempo(
                            p.id,
                            p._nuevoTiempo || p.tiempoPublicacion || p.tiempoGlobal || 10
                          )
                        }
                      >
                        Guardar tiempo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================================
            TAB: REPORTES ✅ NUEVO - COMPLETAMENTE FUNCIONAL
        ===================================================== */}
        {activeTab === "reportes" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Gestión de Reportes</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar:</span>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                    <SelectItem value="REVISADO">Revisados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                      <p className="text-3xl font-bold text-destructive">
                        {reportes.filter(r => r.estado === "PENDIENTE").length}
                      </p>
                    </div>
                    <Flag className="w-10 h-10 text-destructive" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revisados</p>
                      <p className="text-3xl font-bold text-primary">
                        {reportes.filter(r => r.estado === "REVISADO").length}
                      </p>
                    </div>
                    <Eye className="w-10 h-10 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-3xl font-bold text-foreground">
                        {reportes.length}
                      </p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de reportes */}
            <Card>
              {reportesFiltrados.length === 0 ? (
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay reportes {filtroEstado !== "TODOS" ? filtroEstado.toLowerCase() : ""}
                </CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Publicación</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Reportado por</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportesFiltrados.map((reporte) => (
                      <TableRow key={reporte.id}>
                        <TableCell className="font-medium">#{reporte.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{reporte.publicacionNombre}</p>
                            <p className="text-xs text-muted-foreground">
                              ${reporte.publicacionPrecio}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {categoriaLabels[reporte.categoria] || reporte.categoria}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{reporte.reportadoPor}</p>
                            <p className="text-xs text-muted-foreground">
                              {reporte.reportadoPorCorreo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(reporte.fechaReporte).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>{getEstadoBadge(reporte.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerDetalle(reporte)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {reporte.estado === "PENDIENTE" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarcarRevisado(reporte.id)}
                              >
                                ✓
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  tipo: "eliminar-reporte",
                                  reporteId: reporte.id
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  tipo: "eliminar-publicacion",
                                  reporteId: reporte.id
                                })
                              }
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}

        {/* =====================================================
            TAB: INCIDENCIAS
        ===================================================== */}
        {activeTab === "incidencias" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Incidencias</h2>

            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Módulo en desarrollo
              </CardContent>
            </Card>
          </>
        )}

        {/* =====================================================
            TAB: PELIGROSOS
        ===================================================== */}
        {activeTab === "peligrosos" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Productos detectados como peligrosos
            </h2>

            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Módulo en desarrollo
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />

      {/* ===== DIALOG DE DETALLES DE REPORTE ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte #{selectedReporte?.id}</DialogTitle>
            <DialogDescription>
              Información completa del reporte
            </DialogDescription>
          </DialogHeader>
          {selectedReporte && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Publicación</p>
                  <p className="text-sm">{selectedReporte.publicacionNombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio</p>
                  <p className="text-sm">${selectedReporte.publicacionPrecio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <p className="text-sm">
                    {categoriaLabels[selectedReporte.categoria]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  {getEstadoBadge(selectedReporte.estado)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reportado por</p>
                  <p className="text-sm">{selectedReporte.reportadoPor}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReporte.reportadoPorCorreo}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-sm">
                    {new Date(selectedReporte.fechaReporte).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedReporte.motivo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Motivo</p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{selectedReporte.motivo}</p>
                  </div>
                </div>
              )}
              {selectedReporte.revisadoPorNombre && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revisado por</p>
                  <p className="text-sm">{selectedReporte.revisadoPorNombre}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/product/${selectedReporte.publicacionId}`)}
                >
                  Ver publicación
                </Button>
                {selectedReporte.estado === "PENDIENTE" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleMarcarRevisado(selectedReporte.id);
                      setDialogOpen(false);
                    }}
                  >
                    Marcar como revisado
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG DE CONFIRMACIÓN DE ELIMINACIÓN ===== */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.tipo === "eliminar-publicacion"
                ? "¿Eliminar publicación?"
                : "¿Eliminar reporte?"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.tipo === "eliminar-publicacion"
                ? "Esta acción eliminará permanentemente la publicación y todos sus reportes. No se puede deshacer."
                : "Esta acción eliminará el reporte pero la publicación seguirá activa."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, tipo: null, reporteId: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDialog.reporteId) {
                  if (confirmDialog.tipo === "eliminar-publicacion") {
                    handleEliminarPublicacion(confirmDialog.reporteId);
                  } else {
                    handleEliminarReporte(confirmDialog.reporteId);
                  }
                }
              }}
            >
              {confirmDialog.tipo === "eliminar-publicacion"
                ? "Eliminar publicación"
                : "Eliminar reporte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== MODALES ANTERIORES ===== */}
      {successModal && (
        <SuccessModal
          open={true}
          onClose={() => setSuccessModal(null)}
          title={successModal.title}
          message={successModal.message}
        />
      )}

      {errorModal && (
        <ErrorModal
          open={true}
          onClose={() => setErrorModal(null)}
          title={errorModal.title}
          message={errorModal.message}
        />
      )}

      {confirmModalOld && (
        <ConfirmModal
          open={true}
          title={confirmModalOld.title}
          message={confirmModalOld.message}
          onCancel={() => setConfirmModalOld(null)}
          onConfirm={() => {
            confirmModalOld.onConfirm();
            setConfirmModalOld(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
