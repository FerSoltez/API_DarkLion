import express from 'express';
import multer from 'multer';
import designController from '../controllers/designController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Rutas públicas ──────────────────────────────────────────

// Crear diseño (POST)
router.post('/designs', designController.createDesign);

// Crear cliente y diseño en una sola petición (POST) - recibe imagen como archivo
router.post('/designs/client-and-design', upload.single('image'), designController.createClientAndDesign);

// ─── Rutas protegidas (requieren admin) ──────────────────────

// Obtener todos los pedidos para la tabla de gestión (GET)
router.get('/designs/orders', requireAuth, requireAdmin, designController.getAllOrders);

// Actualizar datos de un pedido (PATCH)
router.patch('/designs/orders/:id', requireAuth, requireAdmin, designController.updateOrder);

// Obtener todos los diseños (POST según requerimiento)
router.post('/designs/all', requireAuth, requireAdmin, designController.getAllDesigns);

// Obtener un diseño por ID (POST según requerimiento)
router.post('/designs/:id', requireAuth, requireAdmin, designController.getDesignById);

// Actualizar un diseño (PATCH)
router.patch('/designs/:id', requireAuth, requireAdmin, designController.updateDesign);

// Eliminar un diseño (DELETE)
router.delete('/designs/:id', requireAuth, requireAdmin, designController.deleteDesign);

export default router;
