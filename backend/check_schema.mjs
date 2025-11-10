import { pool } from './src/db.js';

(async () => {
    try {
        const [rows] = await pool.query("DESCRIBE categorias");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('describe error:', e);
        process.exit(1);
    }
})();
