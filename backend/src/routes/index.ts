import express from 'express';
import authRouter from './auth.js';
import productosRouter from './productos.js';
import verificacionRouter from './verificacion.js';
import moderationRouter from './moderation.js';
import reportesRouter from './reportes.js';
import interesesRouter from './intereses.js'; // ✅ AGREGAR ESTA LÍNEA

const router = express.Router();

router.use('/auth', authRouter);
router.use('/productos', productosRouter);
router.use('/verificacion', verificacionRouter);
router.use('/moderation', moderationRouter);
router.use('/reportes', reportesRouter);
router.use('/intereses', interesesRouter); // ✅ AGREGAR ESTA LÍNEA

export default router;
