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
const DesignDocument_1 = require("../models/DesignDocument");
const designDocumentController = {
    // Crear un nuevo documento de diseño
    createDesignDocument: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const document = yield DesignDocument_1.DesignDocument.create(req.body);
            res.status(201).json(document);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener todos los documentos de diseño
    getAllDesignDocuments: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const documents = yield DesignDocument_1.DesignDocument.findAll();
            res.status(200).json(documents);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener un documento de diseño por su ID
    getDesignDocumentById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const document = yield DesignDocument_1.DesignDocument.findByPk(id);
            if (document) {
                res.status(200).json(document);
            }
            else {
                res.status(404).json({ message: 'Documento de diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Actualizar un documento de diseño
    updateDesignDocument: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const [updated] = yield DesignDocument_1.DesignDocument.update(req.body, { where: { id_document: id } });
            if (updated) {
                const updatedDocument = yield DesignDocument_1.DesignDocument.findByPk(id);
                res.status(200).json(updatedDocument);
            }
            else {
                res.status(404).json({ message: 'Documento de diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Eliminar un documento de diseño
    deleteDesignDocument: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const deleted = yield DesignDocument_1.DesignDocument.destroy({ where: { id_document: id } });
            if (deleted) {
                res.status(200).json({ message: 'Documento de diseño eliminado exitosamente' });
            }
            else {
                res.status(404).json({ message: 'Documento de diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = designDocumentController;
