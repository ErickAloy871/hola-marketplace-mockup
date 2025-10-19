import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";
import auth from "./routes/auth.js";
import productos from "./routes/productos.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health/db", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    res.json({ db: (rows as any)[0].ok === 1 ? "up" : "down" });
  } catch { res.status(500).json({ db: "down" }); }
});

app.use("/auth", auth);
app.use("/productos", productos);

(async () => {
  try { const c = await pool.getConnection(); await c.query("SELECT 1"); c.release(); console.log("✅ MySQL OK"); }
  catch (e) { console.error("❌ MySQL ERROR", e); }
})();

const port = Number(process.env.PORT || 8000);
app.listen(port, () => console.log(`API http://localhost:${port}`));
