import { Request, Response } from 'express';
import { Design } from '../models/Design';

const designController = {
  // Crear un nuevo diseño
  createDesign: async (req: Request, res: Response) => {
    try {
      const design = await Design.create(req.body);
      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener todos los diseños
  getAllDesigns: async (req: Request, res: Response) => {
    try {
      const designs = await Design.findAll();
      res.status(200).json(designs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener un diseño por su ID
  getDesignById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const design = await Design.findByPk(id);
      if (design) {
        res.status(200).json(design);
      } else {
        res.status(404).json({ message: 'Diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Actualizar un diseño
  updateDesign: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [updated] = await Design.update(req.body, { where: { id_design: id } });
      if (updated) {
        const updatedDesign = await Design.findByPk(id);
        res.status(200).json(updatedDesign);
      } else {
        res.status(404).json({ message: 'Diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Eliminar un diseño
  deleteDesign: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await Design.destroy({ where: { id_design: id } });
      if (deleted) {
        res.status(200).json({ message: 'Diseño eliminado exitosamente' });
      } else {
        res.status(404).json({ message: 'Diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default designController;
