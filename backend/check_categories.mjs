import { pool } from './src/db.js';

(async () => {
    try {
        const [rows] = await pool.query("SELECT id, nombre FROM CATEGORIAS WHERE estado = 'ACTIVA' ORDER BY nombre ASC");
        console.log('rows:', rows);
        process.exit(0);
    } catch (e) {
        console.error('query error:', e);
        process.exit(1);
    }
})();
