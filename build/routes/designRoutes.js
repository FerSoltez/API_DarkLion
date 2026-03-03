"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const designController_1 = __importDefault(require("../controllers/designController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// ─── Rutas públicas ──────────────────────────────────────────
// Crear diseño (POST)
router.post('/designs', designController_1.default.createDesign);
// Crear cliente y diseño en una sola petición (POST)
router.post('/designs/client-and-design', designController_1.default.createClientAndDesign);
// ─── Rutas protegidas (requieren admin) ──────────────────────
// Obtener todos los pedidos para la tabla de gestión (GET)
router.get('/designs/orders', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.getAllOrders);
// Actualizar datos de un pedido (PATCH)
router.patch('/designs/orders/:id', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.updateOrder);
// Obtener todos los diseños (POST según requerimiento)
router.post('/designs/all', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.getAllDesigns);
// Obtener un diseño por ID (POST según requerimiento)
router.post('/designs/:id', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.getDesignById);
// Actualizar un diseño (PATCH)
router.patch('/designs/:id', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.updateDesign);
// Eliminar un diseño (DELETE)
router.delete('/designs/:id', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, designController_1.default.deleteDesign);
exports.default = router;
