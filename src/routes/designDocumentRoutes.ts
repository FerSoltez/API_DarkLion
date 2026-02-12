import express from 'express';
import designDocumentController from '../controllers/designDocumentController';

const router = express.Router();

// Rutas para documentos de diseño

// Crear documento (POST)
router.post('/design-documents', designDocumentController.createDesignDocument);

// Obtener todos los documentos (POST según requerimiento)
// Usamos /design-documents/all para diferenciar de la creación si se usa la raíz
router.post('/design-documents/all', designDocumentController.getAllDesignDocuments);

// Generar orden de producción (.xlsx) — debe ir ANTES de /:id para que no se confunda
router.post('/design-documents/generate-order', designDocumentController.generateProductionOrder);

// Obtener un documento por ID (POST según requerimiento)
router.post('/design-documents/:id', designDocumentController.getDesignDocumentById);

// Actualizar un documento (PATCH)
router.patch('/design-documents/:id', designDocumentController.updateDesignDocument);

// Eliminar un documento (DELETE)
router.delete('/design-documents/:id', designDocumentController.deleteDesignDocument);

export default router;
