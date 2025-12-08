import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Trash2,
  Users as UsersIcon,
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
import WarningModal from "@/components/ui/WarningModal"; // por si luego lo usas

import { useAuth } from "@/hooks/useAuth";
import { reportesApi } from "@/lib/api";

function convertirValorFront(valor: string) {
  const cantidad = parseInt(valor);
  const unidad = valor.replace(String(cantidad), "");

  const multipliers: any = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return cantidad * multipliers[unidad];
}


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
  roles?: string; // ✅ para usuarios-clientes (COMPRADOR, VENDEDOR)
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
  SUICIDIO_AUTOLESION: "Suicidio o autolesión",
};

const AdminPanel = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
  "moderadores" |
  "registrar" |
  "configuracion" |
  "usuarios" |
  "reportes" |


  "apelaciones" |
  "baja"
>("moderadores");



  // Datos
  const [moderadores, setModeradores] = useState<AdminUser[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<AdminUser[]>([]);
  const [publicacionesConfig, setPublicacionesConfig] = useState<any[]>([]);
  const [usuariosClientes, setUsuariosClientes] = useState<AdminUser[]>([]); // ✅ compradores/vendedores
  const [publicacionesAprobadas, setPublicacionesAprobadas] = useState<any[]>([]);
  const [apelaciones, setApelaciones] = useState([]);


  // Reportes
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
  const [publicacionesBaja, setPublicacionesBaja] = useState([]);

  

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

      // 2. Usuarios NO moderadores NI admins (para registrar moderador)
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

      // 4. Usuarios clientes (COMPRADOR / VENDEDOR)
      const clientesRes = await fetch(`${API}/usuarios-clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuariosClientes(await clientesRes.json());

      // 5. Reportes
      const reportesData = await reportesApi.getAll();
      setReportes(reportesData);

      const publicacionesRes = await fetch(`${API}/publicaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPublicacionesBaja(await publicacionesRes.json());

      
      const apelacionesRes = await fetch(`${API}/apelaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setApelaciones(await apelacionesRes.json());

      
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
  const suspenderModerador = async (id: number) => {
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
  const reactivarModerador = async (id: number) => {
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
      message:
        "¿Estás seguro de eliminar este rol? El usuario volverá a ser comprador y vendedor.",
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

  const reactivarPublicacion = async (id: number) => {
  try {
    const res = await fetch(`${API}/publicaciones/${id}/reactivar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      return setErrorModal({
        title: "Error al reactivar",
        message: data.message || "No se pudo reactivar la publicación"
      });
    }

    setSuccessModal({
      title: "Publicación reactivada",
      message: "La publicación fue restaurada exitosamente."
    });

    loadData();
  } catch (err) {
    setErrorModal({
      title: "Error",
      message: "No se pudo conectar con el servidor."
    });
  }
};


  const aprobarApelacion = async (id: number) => {
  try {
    await fetch(`${API}/apelaciones/${id}/aprobar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setSuccessModal({
      title: "Apelación aprobada",
      message: "La publicación fue restaurada.",
    });

    loadData();
  } catch (err) {
    setErrorModal({ title: "Error", message: "No se pudo aprobar." });
  }
};

const rechazarApelacion = async (id: number) => {
  try {
    await fetch(`${API}/apelaciones/${id}/rechazar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setSuccessModal({
      title: "Apelación rechazada",
      message: "La publicación seguirá dada de baja.",
    });

    loadData();
  } catch (err) {
    setErrorModal({ title: "Error", message: "No se pudo rechazar." });
  }
};


  // =====================================================
  // ⚙️ Actualizar tiempo de publicación
  // =====================================================
  const actualizarTiempo = async (id: number, cantidad: number, unidad: string) => {
  try {
    await fetch(`${API}/publicaciones/${id}/tiempo-publicacion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cantidad, unidad }),
    });

    setSuccessModal({
      title: "Tiempo guardado",
      message: `La publicación fue configurada a ${cantidad}${unidad}.`,
    });

    loadData();
  } catch (error) {
    setErrorModal({
      title: "Error",
      message: "No se pudo guardar el tiempo.",
    });
  }
};


  // =====================================================
  // ✅ Gestión de reportes
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
        description: "El reporte ha sido marcado como revisado",
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
        message: "El reporte ha sido eliminado sin afectar la publicación",
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
        message: "La publicación y todos sus reportes han sido eliminados",
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
      RESUELTO: "secondary",
    };
    return <Badge variant={variants[estado] || "default"}>{estado}</Badge>;
  };

  // =====================================================
  // ✅ Suspender / Reactivar COMPRADORES y VENDEDORES
  // =====================================================
  const suspenderCliente = async (id: number) => {
    try {
      await fetch(`${API}/usuarios/${id}/suspender`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo: "Suspensión administrativa" }),
      });

      setSuccessModal({
        title: "Usuario suspendido",
        message: "La cuenta ha sido suspendida correctamente.",
      });

      loadData();
    } catch (e) {
      setErrorModal({
        title: "Error al suspender",
        message: "No se pudo suspender al usuario.",
      });
    }
  };

  const darDeBaja = async (id: number) => {
  try {
    const res = await fetch(`${API}/dar-baja/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ motivo: "Baja administrativa" })
    });

    const data = await res.json();

    if (!res.ok) {
      return setErrorModal({
        title: "Error al dar de baja",
        message: data.message || "No se pudo dar de baja la publicación"
      });
    }

    setSuccessModal({
      title: "Publicación dada de baja",
      message: "La publicación fue marcada como DADO_DE_BAJA correctamente."
    });

    loadData(); // Recargar publicaciones
  } catch (err) {
    console.error(err);
    setErrorModal({
      title: "Error",
      message: "No se pudo conectar con el servidor."
    });
  }
};


  const reactivarCliente = async (id: number) => {
    try {
      await fetch(`${API}/usuarios/${id}/reactivar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessModal({
        title: "Usuario reactivado",
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

  if (loadingData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando panel de administración...</p>
      </div>
    );

    const formatSeconds = (s: number) => {
  if (s <= 0) return "Expirado";

  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;

  return `${sec}s`;
};

  // =====================================================
  // 🔥 RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto py-10 px-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
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
            onClick={() => setActiveTab("usuarios")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "usuarios"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Usuarios
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
            Reportes ({reportes.filter((r) => r.estado === "PENDIENTE").length})
          </button>

          
          <button
          onClick={() => setActiveTab("apelaciones")}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === "apelaciones"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Apelaciones
        </button>

        <button
          onClick={() => setActiveTab("baja")}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === "baja"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dar de baja
        </button>
         


          
        </div>


        {activeTab === "baja" && (
  <>
    <h2 className="text-2xl font-semibold mb-4">Dar de baja publicaciones</h2>

    {publicacionesBaja.length === 0 ? (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay publicaciones registradas.
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {publicacionesBaja.map((p) => (
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
                <span
                  className={`font-semibold ${
                    p.estado === "DADO_DE_BAJA"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {p.estado}
                </span>
              </div>

              {/* BOTONES */}
              {p.estado !== "DADO_DE_BAJA" ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => darDeBaja(p.id)}
                >
                  Dar de baja
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => reactivarPublicacion(p.id)}
                >
                  Reactivar publicación
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </>
)}


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
                          onClick={() => suspenderModerador(m.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Suspender
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => reactivarModerador(m.id)}
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

        {activeTab === "apelaciones" && (
  <>
    <h2 className="text-2xl font-semibold mb-4">Apelaciones de Publicaciones</h2>

    {apelaciones.length === 0 ? (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay apelaciones registradas.
        </CardContent>
      </Card>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Publicación</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {apelaciones.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.id}</TableCell>
              <TableCell>{a.publicacionNombre}</TableCell>
              <TableCell>{a.usuarioNombre} {a.usuarioApellido}</TableCell>
              <TableCell className="max-w-[200px] truncate">{a.motivo}</TableCell>
              <TableCell>
                <Badge>{a.estado}</Badge>
              </TableCell>
              <TableCell>{new Date(a.fechaCreacion).toLocaleDateString()}</TableCell>

              <TableCell className="flex gap-2">
                {a.estado === "PENDIENTE" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => aprobarApelacion(a.id)}
                    >
                      Aprobar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rechazarApelacion(a.id)}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </>
)}


        {/* =====================================================
            TAB: REGISTRAR MODERADOR
        ===================================================== */}
        {activeTab === "registrar" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Registrar nuevo moderador
            </h2>

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
            TAB: USUARIOS (COMPRADORES / VENDEDORES)
        ===================================================== */}
        {activeTab === "usuarios" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Usuarios (compradores y vendedores)
              </h2>
            </div>

            {usuariosClientes.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {usuariosClientes.map((u) => (
                  <Card key={u.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {u.nombre} {u.apellido}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {u.correo}
                          </p>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-right">
                          {u.roles || "SIN ROL"}
                        </span>
                      </div>
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

                      <div className="flex justify-between items-center">
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

                      <div className="pt-3 flex justify-end gap-2 border-t mt-2">
                        {u.estadoCuenta === "ACTIVO" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => suspenderCliente(u.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => reactivarCliente(u.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivar
                          </Button>
                        )}
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
                {publicacionesConfig.map((p) => {
  // 🔥 Calcular fecha de expiración
  const pubDate = new Date(p.fechaPublicacion).getTime();
  let tiempoMs = null;

  if (p.tiempoPublicacion) {
    tiempoMs = convertirValorFront(p.tiempoPublicacion);
  } else if (p.tiempoGlobal) {
    tiempoMs = convertirValorFront(p.tiempoGlobal);
  }

  const expiraEn = tiempoMs ? pubDate + tiempoMs : null;
  const ahora = Date.now();
  const expirado = expiraEn && ahora >= expiraEn;

  return (
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

        <div className="flex justify-between">
          <span className="font-medium">Estado:</span>
          <span className={`font-semibold ${
            expirado ? "text-red-600" : "text-green-600"
          }`}>
            {expirado ? "EXPIRADA (auto-baja)" : p.estado}
          </span>
        </div>

        {/* ⏳ Fecha de expiración */}
        {expiraEn && (
          <div className="flex justify-between">
            <span className="font-medium">Expira:</span>
            <span className={`${expirado ? "text-red-600" : "text-blue-600"}`}>
              {new Date(expiraEn).toLocaleString()}
            </span>
          </div>
        )}

        {/* 🔧 Tiempo global */}
        <div className="flex justify-between">
          <span className="font-medium">Tiempo global:</span>
          <span>{p.tiempoGlobal || "No definido"}</span>
        </div>

        {/* 🔧 Tiempo específico */}
        <div className="flex justify-between">
          <span className="font-medium">Tiempo específico:</span>
          <span>{p.tiempoPublicacion || "Usando global"}</span>
        </div>

        {/* Formulario para cambiar tiempo */}
        <div className="mt-2">
          <label className="text-muted-foreground text-xs">
            Tiempo personalizado:
          </label>

          <div className="flex gap-2 mt-1">
            {/* Cantidad */}
            <input
              type="number"
              min={1}
              placeholder="Ej: 10"
              className="border rounded px-2 py-1 w-24 text-sm"
              onChange={(e) => (p._cantidad = Number(e.target.value))}
            />

            {/* Unidad */}
            <select
              className="border rounded px-2 py-1 text-sm"
              defaultValue="d"
              onChange={(e) => (p._unidad = e.target.value)}
            >
              <option value="s">Segundos (s)</option>
              <option value="m">Minutos (m)</option>
              <option value="h">Horas (h)</option>
              <option value="d">Días (d)</option>
            </select>
          </div>
        </div>

        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 w-full mt-3"
          onClick={() =>
            actualizarTiempo(
              p.id,
              p._cantidad || 1,
              p._unidad || "d"
            )
          }
        >
          Guardar tiempo
        </Button>
      </CardContent>
    </Card>
  );
})}

              </div>
            )}
          </>
        )}

        {/* =====================================================
            TAB: REPORTES
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
                        {reportes.filter((r) => r.estado === "PENDIENTE").length}
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
                        {reportes.filter((r) => r.estado === "REVISADO").length}
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
                  No hay reportes{" "}
                  {filtroEstado !== "TODOS" ? filtroEstado.toLowerCase() : ""}
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
                        <TableCell className="font-medium">
                          #{reporte.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {reporte.publicacionNombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${reporte.publicacionPrecio}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {categoriaLabels[reporte.categoria] ||
                              reporte.categoria}
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
                            {new Date(
                              reporte.fechaReporte
                            ).toLocaleDateString()}
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
                                onClick={() =>
                                  handleMarcarRevisado(reporte.id)
                                }
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
                                  reporteId: reporte.id,
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
                                  reporteId: reporte.id,
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

       

        
      </main>

      <Footer />

      {/* ===== DIALOG DE DETALLES DE REPORTE ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalles del Reporte #{selectedReporte?.id}
            </DialogTitle>
            <DialogDescription>
              Información completa del reporte
            </DialogDescription>
          </DialogHeader>
          {selectedReporte && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Publicación
                  </p>
                  <p className="text-sm">
                    {selectedReporte.publicacionNombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Precio
                  </p>
                  <p className="text-sm">
                    ${selectedReporte.publicacionPrecio}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Categoría
                  </p>
                  <p className="text-sm">
                    {categoriaLabels[selectedReporte.categoria]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado
                  </p>
                  {getEstadoBadge(selectedReporte.estado)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reportado por
                  </p>
                  <p className="text-sm">{selectedReporte.reportadoPor}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReporte.reportadoPorCorreo}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha
                  </p>
                  <p className="text-sm">
                    {new Date(
                      selectedReporte.fechaReporte
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedReporte.motivo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Motivo
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{selectedReporte.motivo}</p>
                  </div>
                </div>
              )}
              {selectedReporte.revisadoPorNombre && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Revisado por
                  </p>
                  <p className="text-sm">
                    {selectedReporte.revisadoPorNombre}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    navigate(`/product/${selectedReporte.publicacionId}`)
                  }
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
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
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
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  tipo: null,
                  reporteId: null,
                })
              }
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
