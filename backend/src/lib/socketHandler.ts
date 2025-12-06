import type { Server, Socket } from "socket.io";

// Tipo de datos que guardaremos en socket.data
interface SocketUserData {
  userId: number;
}

export function registerSocketHandlers(io: Server) {
  // Mapear userId -> set de socketIds (por si el usuario tiene varias pestañas abiertas)
  const userSockets = new Map<number, Set<string>>();

  io.on("connection", (socket: Socket) => {
    console.log("🔌 Nuevo cliente conectado", socket.id);

    // Esperamos un evento de autenticación inicial desde el frontend
    socket.on("auth", (data: { userId: number }) => {
      const { userId } = data;
      if (!userId) return;

      (socket.data as SocketUserData).userId = userId;

      // Registrar socket para este usuario
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      console.log(`✅ Usuario ${userId} conectado con socket ${socket.id}`);
    });

    // Unirse a una sala de conversación (room por conversacionId)
    socket.on("join_conversation", (conversacionId: number) => {
      if (!conversacionId) return;
      socket.join(`conv_${conversacionId}`);
      console.log(`📥 Socket ${socket.id} unido a conv_${conversacionId}`);
    });

    // Salir de una sala de conversación
    socket.on("leave_conversation", (conversacionId: number) => {
      if (!conversacionId) return;
      socket.leave(`conv_${conversacionId}`);
      console.log(`📤 Socket ${socket.id} salió de conv_${conversacionId}`);
    });

    // Cuando se envía un nuevo mensaje desde el backend (lo emitiremos manualmente)
    // aquí solo definimos el canal, el backend lo usará como:
    // io.to(`conv_${conversacionId}`).emit("nuevo_mensaje", mensaje);

    socket.on("disconnect", () => {
      const data = socket.data as SocketUserData;
      const userId = data?.userId;
      if (userId) {
        const set = userSockets.get(userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            userSockets.delete(userId);
          }
        }
      }
      console.log("❌ Cliente desconectado", socket.id);
    });
  });

  // Función auxiliar para emitir nuevo mensaje a una conversación
  function emitNuevoMensaje(conversacionId: number, mensaje: any) {
    io.to(`conv_${conversacionId}`).emit("nuevo_mensaje", mensaje);
  }

  // La devolvemos para usarla en rutas si la necesitamos
  return {
    emitNuevoMensaje,
  };
}
