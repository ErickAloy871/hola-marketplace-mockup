import express from 'express';
import authRouter from './auth.js';
import productosRouter from './productos.js';
import verificacionRouter from './verificacion.js';
import moderationRouter from './moderation.js';
var router = express.Router();
// Registrar rutas
router.use('/auth', authRouter);
router.use('/productos', productosRouter);
router.use('/verificacion', verificacionRouter);
router.use('/moderation', moderationRouter);
export default router;
