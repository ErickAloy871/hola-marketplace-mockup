import express from 'express';
import authRouter from './auth.js';
import productosRouter from './productos.js';
import verificacionRouter from './verificacion.js';

const router = express.Router();

// Registrar rutas
router.use('/auth', authRouter);
router.use('/productos', productosRouter);
router.use('/verificacion', verificacionRouter);

export default router;
