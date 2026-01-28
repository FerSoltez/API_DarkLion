import express from 'express';
import clientController from '../controllers/clientController';

const router = express.Router();

// Rutas para clientes

// Crear cliente (POST)
router.post('/clients', clientController.createClient);

// Obtener todos los clientes (POST según requerimiento)
// Usamos /clients/all para diferenciar de la creación si se usa la raíz
router.post('/clients/all', clientController.getAllClients);

// Obtener un cliente por ID (POST según requerimiento)
router.post('/clients/:id', clientController.getClientById);

// Actualizar un cliente (PATCH)
router.patch('/clients/:id', clientController.updateClient);

// Eliminar un cliente (DELETE)
router.delete('/clients/:id', clientController.deleteClient);

export default router;
