"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../models/Product");
const productController = {
    // Crear un nuevo producto
    createProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const product = yield Product_1.Product.create(req.body);
            res.status(201).json(product);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener todos los productos
    getAllProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const products = yield Product_1.Product.findAll();
            res.status(200).json(products);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener un producto por su ID
    getProductById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const product = yield Product_1.Product.findByPk(id);
            if (product) {
                res.status(200).json(product);
            }
            else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Actualizar un producto
    updateProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const [updated] = yield Product_1.Product.update(req.body, { where: { id_product: id } });
            if (updated) {
                const updatedProduct = yield Product_1.Product.findByPk(id);
                res.status(200).json(updatedProduct);
            }
            else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Eliminar un producto
    deleteProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const deleted = yield Product_1.Product.destroy({ where: { id_product: id } });
            if (deleted) {
                res.status(200).json({ message: 'Producto eliminado exitosamente' });
            }
            else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = productController;
