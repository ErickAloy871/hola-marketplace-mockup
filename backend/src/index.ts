import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { pool } from "./db.js";
import router from "./routes/index.js";
import adminRoutes from "./routes/admin.js";
import { registerSocketHandlers } from "./lib/socketHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Seguridad básica
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS para APIs REST - permitir múltiples orígenes en desarrollo
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://auramarket-orpin.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir sin origin (postman, curl, etc)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Permitir localhost y redes locales
      if (origin.startsWith('http://localhost') || 
          origin.startsWith('http://192.168.') || 
          origin.startsWith('http://10.') ||
          ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Healthcheck BD
app.get("/health/db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    res.json({ db: (rows as any)[0].ok === 1 ? "up" : "down" });
  } catch (e) {
    res.status(500).json({ db: "down" });
  }
});

// Rutas principales
app.use("/api", router);
app.use("/api/admin", adminRoutes);

// Crear servidor HTTP y Socket.IO
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Sin origin (servidor a servidor)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Verificar si el origin está en la lista permitida o es localhost/red local
      if (origin.startsWith('http://localhost') || 
          origin.startsWith('http://192.168.') || 
          origin.startsWith('http://10.') ||
          ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Registrar handlers de sockets
const socketUtils = registerSocketHandlers(io);

// 🔧 Hacer io accesible globalmente para las rutas
import { setIO } from "./lib/socketIO.js";
setIO(io);

// Hacer accesible socketUtils globalmente si luego queremos usar emitNuevoMensaje en rutas
// (opcional, de momento no lo usaremos directamente)
export { io, socketUtils };

(async () => {
  try {
    const c = await pool.getConnection();
    await c.query("SELECT 1");
    c.release();
    console.log("✅ MySQL OK");
  } catch (e) {
    console.error("❌ MySQL ERROR", e);
  }
})();

const port = Number(process.env.PORT || 4000);
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`API + WS http://localhost:${port}`);
  console.log(`Network: http://192.168.0.18:${port}`); // Cambia esta IP por la tuya
});
