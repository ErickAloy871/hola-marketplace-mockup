import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

// instancia global compartida
let globalSocket: Socket | null = null;

export function useSocket() {
  const { user } = useAuth();
  const readyHandlersRef = useRef<Array<(socket: Socket) => void>>([]);

  useEffect(() => {
    if (!user) return;

    // si ya existe, reutilizarla
    if (!globalSocket) {
      const socket = io(WS_URL, {
        transports: ["websocket"],
      });

      globalSocket = socket;

      socket.on("connect", () => {
        socket.emit("auth", { userId: Number(user.id) });
        // notificar a los que estaban esperando
        readyHandlersRef.current.forEach((cb) => cb(socket));
        readyHandlersRef.current = [];
      });
    } else {
      // si ya estaba creada y conectada, volver a autenticar al nuevo user
      globalSocket.emit("auth", { userId: Number(user.id) });
    }

    return () => {
      // opcional: no desconectar aquí
    };
  }, [user]);

  const withSocketReady = (cb: (socket: Socket) => void) => {
    if (globalSocket && globalSocket.connected) {
      cb(globalSocket);
    } else {
      readyHandlersRef.current.push(cb);
    }
  };

  const joinConversation = (conversacionId: number) => {
    withSocketReady((socket) =>
      socket.emit("join_conversation", conversacionId)
    );
  };

  const leaveConversation = (conversacionId: number) => {
    withSocketReady((socket) =>
      socket.emit("leave_conversation", conversacionId)
    );
  };

  const onNuevoMensaje = (handler: (mensaje: any) => void) => {
    withSocketReady((socket) => socket.on("nuevo_mensaje", handler));
  };

  const offNuevoMensaje = (handler: (mensaje: any) => void) => {
    if (globalSocket) {
      globalSocket.off("nuevo_mensaje", handler);
    }
  };

  return {
    socket: globalSocket,
    joinConversation,
    leaveConversation,
    onNuevoMensaje,
    offNuevoMensaje,
  };
}
