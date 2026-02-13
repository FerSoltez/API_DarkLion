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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
// En Linux (Render) usar python3, en Windows usar python
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';
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
            listado, // Array de { nombre?: string, numero?: number, talla: string, cantidad: number, genero: string }
             } = req.body;
            // Validaciones básicas
            if (!id_design || !folio || !fecha_pedido || !cliente || !cantidad_total || !tela || !modelo || !tallas) {
                res.status(400).json({ message: 'Faltan campos requeridos: id_design, folio, fecha_pedido, cliente, cantidad_total, tela, modelo, tallas' });
                return;
            }
            // ─── 1. Verificar plantilla ────────────────────────────────
            const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');
            if (!fs.existsSync(templatePath)) {
                res.status(404).json({ message: 'La plantilla "Plantilla Excel.xlsx" no fue encontrada en /templates' });
                return;
            }
            // ─── 2. Preparar datos para el script Python ──────────────
            const clienteSanitizado = cliente.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '');
            const inputData = {
                template_path: templatePath,
                folio,
                fecha_pedido,
                cliente,
                cantidad_total,
                tela,
                modelo,
                tallas,
                listado: listado || [],
            };
            const tempJsonPath = path.join(os.tmpdir(), `order_input_${Date.now()}.json`);
            const outputXlsxPath = path.join(os.tmpdir(), `${clienteSanitizado}.xlsx`);
            fs.writeFileSync(tempJsonPath, JSON.stringify(inputData, null, 2), 'utf8');
            // ─── 3. Ejecutar script Python (openpyxl) ─────────────────
            const scriptPath = path.join(process.cwd(), 'scripts', 'generate_xlsx.py');
            try {
                const { stdout, stderr } = yield execFileAsync(PYTHON_CMD, [scriptPath, tempJsonPath, outputXlsxPath]);
                if (stderr) {
                    console.warn('Python warnings:', stderr);
                }
                const result = JSON.parse(stdout);
                if (!result.success) {
                    throw new Error(result.error || 'Error desconocido en el script Python');
                }
            }
            catch (pyError) {
                // Limpiar temporales
                if (fs.existsSync(tempJsonPath))
                    fs.unlinkSync(tempJsonPath);
                if (fs.existsSync(outputXlsxPath))
                    fs.unlinkSync(outputXlsxPath);
                res.status(500).json({
                    message: 'Error al generar el archivo Excel',
                    error: pyError.message || pyError.stderr || String(pyError),
                });
                return;
            }
            // Limpiar JSON temporal
            if (fs.existsSync(tempJsonPath))
                fs.unlinkSync(tempJsonPath);
            // ─── 4. Subir a Cloudinary (carpeta ordenes_produccion) ────
            let uploadResult;
            try {
                uploadResult = yield cloudinary_1.v2.uploader.upload(outputXlsxPath, {
                    resource_type: 'raw',
                    folder: 'ordenes_produccion',
                    public_id: clienteSanitizado,
                    format: 'xlsx',
                    overwrite: true,
                });
            }
            catch (uploadError) {
                if (fs.existsSync(outputXlsxPath))
                    fs.unlinkSync(outputXlsxPath);
                res.status(500).json({ message: 'Error al subir a Cloudinary', error: uploadError.message });
                return;
            }
            // Limpiar archivo Excel temporal
            if (fs.existsSync(outputXlsxPath))
                fs.unlinkSync(outputXlsxPath);
            // ─── 5. Guardar en la base de datos ────────────────────────
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
