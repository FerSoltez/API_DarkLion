"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clientController_1 = __importDefault(require("../controllers/clientController"));
const router = express_1.default.Router();
// Rutas para clientes
// Crear cliente (POST)
router.post('/clients', clientController_1.default.createClient);
// Obtener todos los clientes (POST según requerimiento)
// Usamos /clients/all para diferenciar de la creación si se usa la raíz
router.post('/clients/all', clientController_1.default.getAllClients);
// Obtener un cliente por ID (POST según requerimiento)
router.post('/clients/:id', clientController_1.default.getClientById);
// Actualizar un cliente (PATCH)
router.patch('/clients/:id', clientController_1.default.updateClient);
// Eliminar un cliente (DELETE)
router.delete('/clients/:id', clientController_1.default.deleteClient);
exports.default = router;
