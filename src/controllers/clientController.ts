import { Request, Response } from 'express';
import { Client } from '../models/Client';

const clientController = {
  // Crear un nuevo cliente
  createClient: async (req: Request, res: Response) => {
    try {
      const client = await Client.create(req.body);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener todos los clientes
  getAllClients: async (req: Request, res: Response) => {
    try {
      const clients = await Client.findAll();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener un cliente por su ID
  getClientById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const client = await Client.findByPk(id);
      if (client) {
        res.status(200).json(client);
      } else {
        res.status(404).json({ message: 'Cliente no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Actualizar un cliente
  updateClient: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [updated] = await Client.update(req.body, { where: { id_client: id } });
      if (updated) {
        const updatedClient = await Client.findByPk(id);
        res.status(200).json(updatedClient);
      } else {
        res.status(404).json({ message: 'Cliente no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Eliminar un cliente
  deleteClient: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await Client.destroy({ where: { id_client: id } });
      if (deleted) {
        res.status(200).json({ message: 'Cliente eliminado exitosamente' });
      } else {
        res.status(404).json({ message: 'Cliente no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default clientController;
