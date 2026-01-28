import express from 'express';
import productController from '../controllers/productController';

const router = express.Router();

// Rutas para productos

// Crear producto (POST)
router.post('/products', productController.createProduct);

// Obtener todos los productos (POST según requerimiento)
// Usamos /products/all para diferenciar de la creación si se usa la raíz
router.post('/products/all', productController.getAllProducts);

// Obtener un producto por ID (POST según requerimiento)
router.post('/products/:id', productController.getProductById);

// Actualizar un producto (PATCH)
router.patch('/products/:id', productController.updateProduct);

// Eliminar un producto (DELETE)
router.delete('/products/:id', productController.deleteProduct);

export default router;
