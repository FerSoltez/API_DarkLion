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
const Client_1 = require("../models/Client");
const clientController = {
    // Crear un nuevo cliente
    createClient: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const client = yield Client_1.Client.create(req.body);
            res.status(201).json(client);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener todos los clientes
    getAllClients: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const clients = yield Client_1.Client.findAll();
            res.status(200).json(clients);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener un cliente por su ID
    getClientById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const client = yield Client_1.Client.findByPk(id);
            if (client) {
                res.status(200).json(client);
            }
            else {
                res.status(404).json({ message: 'Cliente no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Actualizar un cliente
    updateClient: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const [updated] = yield Client_1.Client.update(req.body, { where: { id_client: id } });
            if (updated) {
                const updatedClient = yield Client_1.Client.findByPk(id);
                res.status(200).json(updatedClient);
            }
            else {
                res.status(404).json({ message: 'Cliente no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Eliminar un cliente
    deleteClient: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const deleted = yield Client_1.Client.destroy({ where: { id_client: id } });
            if (deleted) {
                res.status(200).json({ message: 'Cliente eliminado exitosamente' });
            }
            else {
                res.status(404).json({ message: 'Cliente no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = clientController;
