"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Iniciar sesión (público)
router.post('/auth/login', authController_1.default.login);
// Crear usuario (público) - la contraseña se cifra automáticamente
router.post('/auth/create-user', authController_1.default.register);
// Registrar usuario (protegido: solo admins pueden crear usuarios)
router.post('/auth/register', authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin, authController_1.default.register);
// Obtener perfil del usuario autenticado
router.get('/auth/profile', authMiddleware_1.requireAuth, authController_1.default.getProfile);
exports.default = router;
