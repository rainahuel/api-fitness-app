import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/passwordResetController';

const router = express.Router();

// Ruta para solicitar recuperación de contraseña
router.post('/request-reset', (req, res, next) => {
    console.log('Request reset route called');
    return requestPasswordReset(req, res);
  });
// Ruta para verificar token y actualizar contraseña
router.post('/reset', resetPassword);

export default router;