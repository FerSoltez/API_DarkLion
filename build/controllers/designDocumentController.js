"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const cloudinary_1 = require("cloudinary");
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
// Mapa de tallas: tipo -> talla -> celda de Excel
const MAPA_TALLAS = {
    DAMA: {
        XCH: 'F22', CH: 'H22', MD: 'J22', GD: 'L22', XL: 'N22',
        XXL: 'P22', XXXL: 'R22',
    },
    CABALLERO: {
        XCH: 'F23', CH: 'H23', MD: 'J23', GD: 'L23', XL: 'N23',
        XXL: 'P23', XXXL: 'R23',
    },
    INFANTIL: {
        XCH: 'F21', CH: 'H21', MD: 'J21', GD: 'L21', XL: 'N21',
        XXL: 'P21', XXXL: 'R21', XXXL2: 'T21',
    },
};
/**
 * Escribe un valor en una celda conservando el estilo original de la plantilla.
 */
function setCellValue(worksheet, cellAddress, value) {
    const cell = worksheet.getCell(cellAddress);
    const currentStyle = Object.assign({}, cell.style);
    cell.value = value;
    cell.style = currentStyle;
}
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
    }),
    // Generar orden de producción (.xlsx) desde la plantilla
    generateProductionOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id_design, folio, fecha_pedido, cliente, cantidad_total, tela, modelo, tallas, // Array de { tipo: string, talla: string, cantidad: number }
             } = req.body;
            // Validaciones básicas
            if (!id_design || !folio || !fecha_pedido || !cliente || !cantidad_total || !tela || !modelo || !tallas) {
                res.status(400).json({ message: 'Faltan campos requeridos: id_design, folio, fecha_pedido, cliente, cantidad_total, tela, modelo, tallas' });
                return;
            }
            // ─── 1. Cargar la plantilla ────────────────────────────────
            const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');
            if (!fs.existsSync(templatePath)) {
                res.status(404).json({ message: 'La plantilla "Plantilla Excel.xlsx" no fue encontrada en /templates' });
                return;
            }
            const workbook = new ExcelJS.Workbook();
            yield workbook.xlsx.readFile(templatePath);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                res.status(500).json({ message: 'No se encontró una hoja en la plantilla' });
                return;
            }
            // ─── 2. Escribir datos fijos en las celdas ─────────────────
            setCellValue(worksheet, 'L5', folio);
            setCellValue(worksheet, 'L6', fecha_pedido);
            setCellValue(worksheet, 'D9', cliente);
            setCellValue(worksheet, 'K12', `${cantidad_total} PLAYERAS`);
            setCellValue(worksheet, 'C19', tela);
            setCellValue(worksheet, 'H19', modelo);
            // ─── 3. Escribir tallas (X si cantidad=1, número si >1) ────
            for (const tallaDetail of tallas) {
                const tipoKey = tallaDetail.tipo.toUpperCase();
                const tallaKey = tallaDetail.talla.toUpperCase();
                const tipoMap = MAPA_TALLAS[tipoKey];
                if (!tipoMap) {
                    res.status(400).json({ message: `Tipo "${tallaDetail.tipo}" no es válido. Usa: DAMA, CABALLERO o INFANTIL` });
                    return;
                }
                const cellAddress = tipoMap[tallaKey];
                if (!cellAddress) {
                    res.status(400).json({ message: `Talla "${tallaDetail.talla}" no es válida para tipo "${tallaDetail.tipo}"` });
                    return;
                }
                const valorCelda = tallaDetail.cantidad === 1 ? 'X' : tallaDetail.cantidad;
                setCellValue(worksheet, cellAddress, valorCelda);
            }
            // ─── 4. Guardar archivo temporalmente ──────────────────────
            const clienteSanitizado = cliente.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '');
            const tempFileName = `${clienteSanitizado}.xlsx`;
            const tempFilePath = path.join(os.tmpdir(), tempFileName);
            yield workbook.xlsx.writeFile(tempFilePath);
            // ─── 5. Subir a Cloudinary (carpeta ordenes_produccion) ────
            let uploadResult;
            try {
                uploadResult = yield cloudinary_1.v2.uploader.upload(tempFilePath, {
                    resource_type: 'raw',
                    folder: 'ordenes_produccion',
                    public_id: clienteSanitizado,
                    format: 'xlsx',
                    overwrite: true,
                });
            }
            catch (uploadError) {
                // Limpiar archivo temporal en caso de error
                if (fs.existsSync(tempFilePath))
                    fs.unlinkSync(tempFilePath);
                res.status(500).json({ message: 'Error al subir a Cloudinary', error: uploadError.message });
                return;
            }
            // Limpiar archivo temporal
            if (fs.existsSync(tempFilePath))
                fs.unlinkSync(tempFilePath);
            // ─── 6. Guardar en la base de datos ────────────────────────
            const document = yield DesignDocument_1.DesignDocument.create({
                id_design,
                document_url: uploadResult.secure_url,
            });
            res.status(201).json({
                message: 'Orden de producción generada exitosamente',
                data: {
                    id_document: document.id_document,
                    id_design: document.id_design,
                    document_url: document.document_url,
                    generated_at: document.generated_at,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = designDocumentController;
