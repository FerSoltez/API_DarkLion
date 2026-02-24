"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pushController_1 = __importDefault(require("../controllers/pushController"));
const router = express_1.default.Router();
// Obtener clave pública VAPID (GET)
router.get('/push/vapid-public-key', pushController_1.default.getVapidPublicKey);
// Registrar suscripción push (POST)
router.post('/push/subscribe', pushController_1.default.subscribe);
// Eliminar suscripción push (POST)
router.post('/push/unsubscribe', pushController_1.default.unsubscribe);
exports.default = router;
