import express from 'express';
import designController from '../controllers/designController';

const router = express.Router();

// Rutas para diseños

// Crear diseño (POST)
router.post('/designs', designController.createDesign);

// Crear cliente y diseño en una sola petición (POST)
router.post('/designs/client-and-design', designController.createClientAndDesign);

// Obtener todos los pedidos para la tabla de gestión (POST)
router.post('/designs/orders', designController.getAllOrders);

// Obtener todos los diseños (POST según requerimiento)
// Usamos /designs/all para diferenciar de la creación si se usa la raíz
router.post('/designs/all', designController.getAllDesigns);

// Obtener un diseño por ID (POST según requerimiento)
router.post('/designs/:id', designController.getDesignById);

// Actualizar un diseño (PATCH)
router.patch('/designs/:id', designController.updateDesign);

// Eliminar un diseño (DELETE)
router.delete('/designs/:id', designController.deleteDesign);

export default router;
