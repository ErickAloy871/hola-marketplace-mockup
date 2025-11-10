import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import auth from "./routes/auth.js";
import productos from "./routes/productos.js";
import router from './routes/index.js';  // ✅ MODIFICADO: Sin .js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Helmet por defecto puede establecer Cross-Origin-Resource-Policy a "same-origin",
// lo que bloquea la incrustación de imágenes desde otro origen (frontend en :5173).
// Ajustamos la política para permitir cross-origin en recursos estáticos (images).
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS para APIs
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health/db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    res.json({ db: (rows as any)[0].ok === 1 ? "up" : "down" });
  } catch (e) { res.status(500).json({ db: "down" }); }
});

app.use('/api', router);

(async () => {
  try { const c = await pool.getConnection(); await c.query("SELECT 1"); c.release(); console.log("✅ MySQL OK"); }
  catch (e) { console.error("❌ MySQL ERROR", e); }
})();

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API http://localhost:${port}`));
