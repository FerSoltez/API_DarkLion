import express from 'express';
import authController from '../controllers/authController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Iniciar sesión (público)
router.post('/auth/login', authController.login);

// Crear usuario (público) - la contraseña se cifra automáticamente
router.post('/auth/create-user', authController.register);

// Registrar usuario (protegido: solo admins pueden crear usuarios)
router.post('/auth/register', requireAuth, requireAdmin, authController.register);

// Obtener perfil del usuario autenticado
router.get('/auth/profile', requireAuth, authController.getProfile);

export default router;
