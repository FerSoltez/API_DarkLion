import { Request, Response } from 'express';
import { Product } from '../models/Product';

const productController = {
  // Crear un nuevo producto
  createProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener todos los productos
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener un producto por su ID
  getProductById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const product = await Product.findByPk(id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Actualizar un producto
  updateProduct: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [updated] = await Product.update(req.body, { where: { id_product: id } });
      if (updated) {
        const updatedProduct = await Product.findByPk(id);
        res.status(200).json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Eliminar un producto
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await Product.destroy({ where: { id_product: id } });
      if (deleted) {
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default productController;
