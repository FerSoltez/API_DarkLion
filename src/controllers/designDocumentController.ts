import { Request, Response } from 'express';
import { DesignDocument } from '../models/DesignDocument';

const designDocumentController = {
  // Crear un nuevo documento de diseño
  createDesignDocument: async (req: Request, res: Response) => {
    try {
      const document = await DesignDocument.create(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener todos los documentos de diseño
  getAllDesignDocuments: async (req: Request, res: Response) => {
    try {
      const documents = await DesignDocument.findAll();
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener un documento de diseño por su ID
  getDesignDocumentById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const document = await DesignDocument.findByPk(id);
      if (document) {
        res.status(200).json(document);
      } else {
        res.status(404).json({ message: 'Documento de diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Actualizar un documento de diseño
  updateDesignDocument: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [updated] = await DesignDocument.update(req.body, { where: { id_document: id } });
      if (updated) {
        const updatedDocument = await DesignDocument.findByPk(id);
        res.status(200).json(updatedDocument);
      } else {
        res.status(404).json({ message: 'Documento de diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Eliminar un documento de diseño
  deleteDesignDocument: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await DesignDocument.destroy({ where: { id_document: id } });
      if (deleted) {
        res.status(200).json({ message: 'Documento de diseño eliminado exitosamente' });
      } else {
        res.status(404).json({ message: 'Documento de diseño no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default designDocumentController;
