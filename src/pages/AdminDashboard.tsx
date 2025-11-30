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
} from "lucide-react";

import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ErrorModal from "@/components/ui/ErrorModal";
import WarningModal from "@/components/ui/WarningModal";

import { useAuth } from "@/hooks/useAuth";

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

  const [loadingData, setLoadingData] = useState(true);

    const [publicacionesConfig, setPublicacionesConfig] = useState<any[]>([]);



  // Modales
  const [successModal, setSuccessModal] = useState<any>(null);
  const [errorModal, setErrorModal] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);

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


      // ✅ Publicaciones para configuración
    const pubsRes = await fetch(`${API}/publicaciones-configuracion`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            const pubsJson = await pubsRes.json();
            console.log("publicaciones-configuracion:", pubsJson); // 👈 para debug
            setPublicacionesConfig(Array.isArray(pubsJson) ? pubsJson : []);
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
  //    (recuerda que en backend ya quitamos COMPRADOR/VENDEDOR
  //     y añadimos solo MODERADOR)
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
  // ❌ Eliminar rol de moderador (y en backend vuelve a comprador+vendedor)
  // =====================================================
  const eliminarRol = async (id: number) => {
    setConfirmModal({
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
            Reportes
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
            TAB: REPORTES
        ===================================================== */}
        {activeTab === "reportes" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Reportes del sistema</h2>
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Próximamente
              </CardContent>
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

      {/* ===== MODALES ===== */}
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

      {confirmModal && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
