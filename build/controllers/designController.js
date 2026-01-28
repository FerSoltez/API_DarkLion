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
const Design_1 = require("../models/Design");
const designController = {
    // Crear un nuevo diseño
    createDesign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const design = yield Design_1.Design.create(req.body);
            res.status(201).json(design);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener todos los diseños
    getAllDesigns: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const designs = yield Design_1.Design.findAll();
            res.status(200).json(designs);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener un diseño por su ID
    getDesignById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const design = yield Design_1.Design.findByPk(id);
            if (design) {
                res.status(200).json(design);
            }
            else {
                res.status(404).json({ message: 'Diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Actualizar un diseño
    updateDesign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const [updated] = yield Design_1.Design.update(req.body, { where: { id_design: id } });
            if (updated) {
                const updatedDesign = yield Design_1.Design.findByPk(id);
                res.status(200).json(updatedDesign);
            }
            else {
                res.status(404).json({ message: 'Diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Eliminar un diseño
    deleteDesign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const deleted = yield Design_1.Design.destroy({ where: { id_design: id } });
            if (deleted) {
                res.status(200).json({ message: 'Diseño eliminado exitosamente' });
            }
            else {
                res.status(404).json({ message: 'Diseño no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = designController;
