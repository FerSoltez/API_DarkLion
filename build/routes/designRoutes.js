"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const designController_1 = __importDefault(require("../controllers/designController"));
const router = express_1.default.Router();
// Rutas para diseños
// Crear diseño (POST)
router.post('/designs', designController_1.default.createDesign);
// Crear cliente y diseño en una sola petición (POST)
router.post('/designs/client-and-design', designController_1.default.createClientAndDesign);
// Obtener todos los pedidos para la tabla de gestión (POST)
router.post('/designs/orders', designController_1.default.getAllOrders);
// Obtener todos los diseños (POST según requerimiento)
// Usamos /designs/all para diferenciar de la creación si se usa la raíz
router.post('/designs/all', designController_1.default.getAllDesigns);
// Obtener un diseño por ID (POST según requerimiento)
router.post('/designs/:id', designController_1.default.getDesignById);
// Actualizar un diseño (PATCH)
router.patch('/designs/:id', designController_1.default.updateDesign);
// Eliminar un diseño (DELETE)
router.delete('/designs/:id', designController_1.default.deleteDesign);
exports.default = router;
