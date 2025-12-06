import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { chatApi } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMessagesContext } from "@/context/MessagesContext";

interface UsuarioResumen {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface ConversacionResumen {
  id: number;
  otroUsuario: UsuarioResumen;
  publicacion: { id: number; nombre: string } | null;
  ultimoMensaje: string | null;
  fechaUltimoMensaje: string;
  noLeidos: number;
}

interface Mensaje {
  id: number;
  conversacionId: number;
  remitenteId: number;
  contenido: string;
  leido: number;
  fechaEnvio: string;
  remitenteNombre: string;
  remitenteApellido: string;
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const {
    joinConversation,
    leaveConversation,
    onNuevoMensaje,
    offNuevoMensaje,
  } = useSocket();
  const { setTotalNoLeidos } = useMessagesContext();

  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] =
    useState<ConversacionResumen | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<UsuarioResumen[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    cargarConversaciones();
  }, [isAuthenticated]);

  // Mensajes en tiempo real + contador global
  useEffect(() => {
    const handler = (mensaje: Mensaje) => {
      const esMio = Number(user?.id) === mensaje.remitenteId;

      if (
        conversacionSeleccionada &&
        mensaje.conversacionId === conversacionSeleccionada.id
      ) {
        // Chat abierto
        setMensajes((prev) => {
          const existe = prev.some((m) => m.id === mensaje.id);
          if (existe) return prev;
          return [...prev, mensaje];
        });

        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === mensaje.conversacionId
              ? { ...c, noLeidos: 0, ultimoMensaje: mensaje.contenido }
              : c
          )
        );

        // Si el mensaje NO es mío y este chat pasa a leídos, restar sus noLeídos
        if (!esMio) {
          const conv = conversaciones.find((c) => c.id === mensaje.conversacionId);
          const antes = conv?.noLeidos || 0;
          if (antes > 0) {
            setTotalNoLeidos((prev) => Math.max(0, prev - antes));
          }
        }
      } else {
        // Chat NO abierto
        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === mensaje.conversacionId
              ? {
                  ...c,
                  noLeidos: esMio ? c.noLeidos : (c.noLeidos || 0) + 1,
                  ultimoMensaje: mensaje.contenido,
                }
              : c
          )
        );

        // Incrementar global solo si NO es mi mensaje
        if (!esMio) {
          setTotalNoLeidos((prev) => prev + 1);
        }
      }
    };

    onNuevoMensaje(handler);
    return () => {
      offNuevoMensaje(handler);
    };
  }, [conversacionSeleccionada?.id, conversaciones, user?.id, setTotalNoLeidos, onNuevoMensaje, offNuevoMensaje]);

  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  useEffect(() => {
    if (!isAuthenticated || conversaciones.length === 0) return;

    const params = new URLSearchParams(location.search);
    const convIdStr = params.get("conv");
    if (!convIdStr) return;

    const convId = Number(convIdStr);
    if (!convId || isNaN(convId)) return;

    const conv = conversaciones.find((c) => c.id === convId);
    if (conv && (!conversacionSeleccionada || conversacionSeleccionada.id !== conv.id)) {
      seleccionarConversacion(conv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversaciones]);

  const cargarConversaciones = async () => {
    try {
      const data = await chatApi.getConversaciones();
      setConversaciones(data);
      const total = data.reduce(
        (acc: number, c: ConversacionResumen) => acc + (c.noLeidos || 0),
        0
      );
      setTotalNoLeidos(total);
    } catch (e) {
      console.error(e);
    }
  };

  const seleccionarConversacion = async (conv: ConversacionResumen) => {
    if (conversacionSeleccionada) {
      leaveConversation(conversacionSeleccionada.id);
    }
    setConversacionSeleccionada(conv);
    joinConversation(conv.id);

    // Esta conversación se marca leída localmente
    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              noLeidos: 0,
            }
          : c
      )
    );

    // Restar sus noLeídos del total
    setTotalNoLeidos((prevTotal) => {
      const antes = conv.noLeidos || 0;
      return Math.max(0, prevTotal - antes);
    });

    setLoadingMensajes(true);
    try {
      const data = await chatApi.getMensajes(conv.id);
      setMensajes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMensajes(false);
    }
  };

  const enviarMensaje = async () => {
    if (!conversacionSeleccionada || !nuevoMensaje.trim()) return;

    const contenidoTemp = nuevoMensaje.trim();
    setNuevoMensaje("");

    try {
      await chatApi.enviarMensaje(conversacionSeleccionada.id, contenidoTemp);
    } catch (e) {
      console.error(e);
      setNuevoMensaje(contenidoTemp);
    }
  };

  const manejarBusqueda = async (value: string) => {
    setBusqueda(value);
    if (!value.trim()) {
      setResultadosBusqueda([]);
      return;
    }
    try {
      const res = await chatApi.buscarUsuarios(value.trim());
      setResultadosBusqueda(res);
    } catch (e) {
      console.error(e);
    }
  };

  const iniciarChatConUsuario = async (otro: UsuarioResumen) => {
    try {
      const res = await chatApi.crearConversacionConUsuario(otro.id);
      setBusqueda("");
      setResultadosBusqueda([]);
      await cargarConversaciones();
      const lista = (await chatApi.getConversaciones()) as ConversacionResumen[];
      const conv = lista.find((c) => c.id === res.conversacionId);
      if (conv) {
        seleccionarConversacion(conv);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          Debes iniciar sesión para ver tus mensajes.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 flex h-[calc(100vh-4rem)] gap-4">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/3 border rounded-lg p-3 flex flex-col bg-card">
          <h2 className="font-semibold mb-3 text-lg">Mensajes</h2>

          <Input
            placeholder="Buscar usuario por nombre o correo..."
            value={busqueda}
            onChange={(e) => manejarBusqueda(e.target.value)}
            className="mb-2"
          />

          {resultadosBusqueda.length > 0 && (
            <div className="border rounded-md mb-2 max-h-40 overflow-y-auto bg-background">
              {resultadosBusqueda.map((u) => (
                <button
                  key={u.id}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  onClick={() => iniciarChatConUsuario(u)}
                >
                  {u.nombre} {u.apellido} ({u.correo})
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto mt-2 space-y-1">
            {conversaciones.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aún no tienes conversaciones.
              </p>
            )}
            {conversaciones.map((conv) => (
              <button
                key={conv.id}
                onClick={() => seleccionarConversacion(conv)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                  conversacionSeleccionada?.id === conv.id
                    ? "bg-primary/5 border-primary/40"
                    : "bg-card hover:bg-muted border-border/60"
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {conv.otroUsuario.nombre} {conv.otroUsuario.apellido}
                    </div>
                    {conv.publicacion && (
                      <div className="text-xs text-muted-foreground truncate">
                        Sobre: {conv.publicacion.nombre}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground truncate">
                      {conv.ultimoMensaje || "Sin mensajes aún"}
                    </div>
                  </div>
                  {conv.noLeidos > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                      {conv.noLeidos}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="hidden md:flex flex-1 border rounded-lg p-3 flex-col bg-muted/40">
          {conversacionSeleccionada ? (
            <>
              <div className="border-b pb-2 mb-2">
                <div className="font-semibold text-sm">
                  {conversacionSeleccionada.otroUsuario.nombre}{" "}
                  {conversacionSeleccionada.otroUsuario.apellido}
                </div>
                {conversacionSeleccionada.publicacion && (
                  <div className="text-xs text-muted-foreground">
                    Publicación: {conversacionSeleccionada.publicacion.nombre}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1">
                {loadingMensajes ? (
                  <p className="text-sm text-muted-foreground">
                    Cargando mensajes...
                  </p>
                ) : mensajes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay mensajes. Escribe el primero.
                  </p>
                ) : (
                  <>
                    {mensajes.map((m) => {
                      const esMio = Number(user?.id) === m.remitenteId;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            esMio ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 text-base ${
                              esMio
                                ? "rounded-2xl rounded-br-sm bg-primary text-white"
                                : "rounded-2xl rounded-bl-sm bg-white text-foreground shadow-sm"
                            }`}
                          >
                            {!esMio && (
                              <div className="text-[11px] font-semibold mb-0.5">
                                {m.remitenteNombre} {m.remitenteApellido}
                              </div>
                            )}
                            <div>{m.contenido}</div>
                            <div className="text-[11px] opacity-70 mt-0.5 text-right">
                              {new Date(m.fechaEnvio).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={mensajesEndRef} />
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviarMensaje();
                    }
                  }}
                />
                <Button onClick={enviarMensaje}>Enviar</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Selecciona una conversación o busca un usuario para empezar a
              chatear.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
