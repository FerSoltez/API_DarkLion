"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const designDocumentController_1 = __importDefault(require("../controllers/designDocumentController"));
const router = express_1.default.Router();
// Rutas para documentos de diseño
// Crear documento (POST)
router.post('/design-documents', designDocumentController_1.default.createDesignDocument);
// Obtener todos los documentos (POST según requerimiento)
// Usamos /design-documents/all para diferenciar de la creación si se usa la raíz
router.post('/design-documents/all', designDocumentController_1.default.getAllDesignDocuments);
// Obtener un documento por ID (POST según requerimiento)
router.post('/design-documents/:id', designDocumentController_1.default.getDesignDocumentById);
// Actualizar un documento (PATCH)
router.patch('/design-documents/:id', designDocumentController_1.default.updateDesignDocument);
// Eliminar un documento (DELETE)
router.delete('/design-documents/:id', designDocumentController_1.default.deleteDesignDocument);
exports.default = router;
