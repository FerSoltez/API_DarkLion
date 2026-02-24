import express from 'express';
import pushController from '../controllers/pushController';

const router = express.Router();

// Obtener clave pública VAPID (GET)
router.get('/push/vapid-public-key', pushController.getVapidPublicKey);

// Registrar suscripción push (POST)
router.post('/push/subscribe', pushController.subscribe);

// Eliminar suscripción push (POST)
router.post('/push/unsubscribe', pushController.unsubscribe);

export default router;
