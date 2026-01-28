"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = __importDefault(require("../controllers/productController"));
const router = express_1.default.Router();
// Rutas para productos
// Crear producto (POST)
router.post('/products', productController_1.default.createProduct);
// Obtener todos los productos (POST según requerimiento)
// Usamos /products/all para diferenciar de la creación si se usa la raíz
router.post('/products/all', productController_1.default.getAllProducts);
// Obtener un producto por ID (POST según requerimiento)
router.post('/products/:id', productController_1.default.getProductById);
// Actualizar un producto (PATCH)
router.patch('/products/:id', productController_1.default.updateProduct);
// Eliminar un producto (DELETE)
router.delete('/products/:id', productController_1.default.deleteProduct);
exports.default = router;
