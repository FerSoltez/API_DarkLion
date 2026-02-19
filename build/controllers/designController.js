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
const Design_1 = require("../models/Design");
const Client_1 = require("../models/Client");
const DesignDocument_1 = require("../models/DesignDocument");
const Product_1 = require("../models/Product");
const database_1 = require("../config/database");
const cloudinary_1 = require("cloudinary");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';
// Helper para formatear fecha DD/MM/YYYY
function formatDate(date) {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
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
    // Eliminar un diseño y su cliente asociado
    deleteDesign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const t = yield database_1.sequelize.transaction();
        try {
            const id = Number(req.params.id);
            const design = yield Design_1.Design.findByPk(id);
            if (!design) {
                yield t.rollback();
                res.status(404).json({ message: 'Diseño no encontrado' });
                return;
            }
            const designData = design.toJSON();
            const clientId = designData.id_client;
            // Eliminar documentos asociados
            yield DesignDocument_1.DesignDocument.destroy({ where: { id_design: id }, transaction: t });
            // Eliminar diseño
            yield Design_1.Design.destroy({ where: { id_design: id }, transaction: t });
            // Eliminar cliente asociado
            if (clientId) {
                yield Client_1.Client.destroy({ where: { id_client: clientId }, transaction: t });
            }
            yield t.commit();
            res.status(200).json({ message: 'Diseño, cliente y documentos asociados eliminados exitosamente' });
        }
        catch (error) {
            yield t.rollback();
            res.status(500).json({ error: error.message });
        }
    }),
    // Crear cliente, diseño y generar orden de producción en una sola petición
    createClientAndDesign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const t = yield database_1.sequelize.transaction();
        let tempJsonPath = '';
        let outputXlsxPath = '';
        try {
            const { 
            // Datos del cliente
            name, email, phone_number, 
            // Datos del diseño
            id_product, design_file_url, status, 
            // Datos de la orden de producción
            tela, tallas, listado, } = req.body;
            // ─── Validaciones ──────────────────────────────────────────
            if (!name || !email || !id_product || !design_file_url) {
                res.status(400).json({ message: 'Faltan campos requeridos: name, email, id_product, design_file_url' });
                return;
            }
            if (!tela || !tallas || !Array.isArray(tallas)) {
                res.status(400).json({ message: 'Faltan campos requeridos: tela, tallas' });
                return;
            }
            // Obtener el producto para usar su nombre como modelo
            const product = yield Product_1.Product.findByPk(id_product);
            if (!product) {
                res.status(404).json({ message: `Producto con id ${id_product} no encontrado` });
                return;
            }
            const modelo = product.name;
            // Generar folio automático (OP-YYYYMMDD-XXXX)
            const now = new Date();
            const folio = `OP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
            // Generar fecha_pedido en formato DD/MM/YYYY
            const fecha_pedido = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            // Calcular cantidad_total como la suma de las cantidades de tallas
            const cantidad_total = tallas.reduce((sum, t) => sum + (Number(t.cantidad) || 0), 0);
            // ─── 1. Crear cliente ──────────────────────────────────────
            const client = yield Client_1.Client.create({ name, email, phone_number }, { transaction: t });
            const clientId = (_a = client.dataValues.id_client) !== null && _a !== void 0 ? _a : client.getDataValue('id_client');
            // ─── 2. Crear diseño ───────────────────────────────────────
            const design = yield Design_1.Design.create({
                id_client: clientId,
                id_product,
                design_file_url,
                status: status || 'pending',
            }, { transaction: t });
            const designId = (_b = design.dataValues.id_design) !== null && _b !== void 0 ? _b : design.getDataValue('id_design');
            // ─── 3. Generar archivo Excel ──────────────────────────────
            const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');
            if (!fs.existsSync(templatePath)) {
                yield t.rollback();
                res.status(404).json({ message: 'La plantilla "Plantilla Excel.xlsx" no fue encontrada en /templates' });
                return;
            }
            const clienteSanitizado = name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '');
            const inputData = {
                template_path: templatePath,
                folio,
                fecha_pedido,
                cliente: name,
                cantidad_total,
                tela,
                modelo,
                tallas,
                listado: listado || [],
            };
            tempJsonPath = path.join(os.tmpdir(), `order_input_${Date.now()}.json`);
            outputXlsxPath = path.join(os.tmpdir(), `${clienteSanitizado}.xlsx`);
            fs.writeFileSync(tempJsonPath, JSON.stringify(inputData, null, 2), 'utf8');
            const scriptPath = path.join(process.cwd(), 'scripts', 'generate_xlsx.py');
            const { stdout, stderr } = yield execFileAsync(PYTHON_CMD, [scriptPath, tempJsonPath, outputXlsxPath]);
            if (stderr)
                console.warn('Python warnings:', stderr);
            const result = JSON.parse(stdout);
            if (!result.success) {
                throw new Error(result.error || 'Error desconocido en el script Python');
            }
            // Limpiar JSON temporal
            if (fs.existsSync(tempJsonPath))
                fs.unlinkSync(tempJsonPath);
            tempJsonPath = '';
            // ─── 4. Subir a Cloudinary ─────────────────────────────────
            const uploadResult = yield cloudinary_1.v2.uploader.upload(outputXlsxPath, {
                resource_type: 'raw',
                folder: 'ordenes_produccion',
                public_id: clienteSanitizado,
                format: 'xlsx',
                overwrite: true,
            });
            // Limpiar Excel temporal
            if (fs.existsSync(outputXlsxPath))
                fs.unlinkSync(outputXlsxPath);
            outputXlsxPath = '';
            // ─── 5. Guardar documento en BD ────────────────────────────
            const document = yield DesignDocument_1.DesignDocument.create({
                id_design: designId,
                document_url: uploadResult.secure_url,
            }, { transaction: t });
            // ─── 6. Confirmar transacción ──────────────────────────────
            yield t.commit();
            // ─── 7. Emitir evento WebSocket ───────────────────────────
            const { io } = require('../index');
            const clientData = client.toJSON();
            const newOrder = {
                id_design: designId,
                name: clientData.name,
                phone_number: clientData.phone_number || null,
                email: clientData.email,
                created_at: formatDate(clientData.created_at || new Date()),
                status: design.toJSON().status || 'pending',
                document_url: uploadResult.secure_url,
            };
            io.emit('new_order', newOrder);
            res.status(201).json({
                message: 'Cliente, diseño y orden de producción creados exitosamente',
                data: {
                    client: client.toJSON(),
                    design: design.toJSON(),
                    document: {
                        id_document: document.id_document,
                        id_design: document.id_design,
                        document_url: document.document_url,
                        generated_at: document.generated_at,
                    },
                },
            });
        }
        catch (error) {
            yield t.rollback();
            // Limpiar temporales en caso de error
            if (tempJsonPath && fs.existsSync(tempJsonPath))
                fs.unlinkSync(tempJsonPath);
            if (outputXlsxPath && fs.existsSync(outputXlsxPath))
                fs.unlinkSync(outputXlsxPath);
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener todos los pedidos para la tabla de gestión
    getAllOrders: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const orders = yield Design_1.Design.findAll({
                attributes: ['id_design', 'id_client', 'status', 'created_at'],
                order: [['created_at', 'DESC']],
            });
            const result = [];
            for (const design of orders) {
                const designData = design.toJSON();
                // Obtener cliente
                const client = yield Client_1.Client.findByPk(designData.id_client);
                const clientData = client ? client.toJSON() : {};
                // Obtener documento
                const doc = yield DesignDocument_1.DesignDocument.findOne({ where: { id_design: designData.id_design } });
                const docData = doc ? doc.toJSON() : {};
                result.push({
                    id_design: designData.id_design,
                    name: clientData.name || null,
                    phone_number: clientData.phone_number || null,
                    email: clientData.email || null,
                    created_at: designData.created_at ? formatDate(designData.created_at) : null,
                    status: designData.status || 'pending',
                    document_url: docData.document_url || null,
                });
            }
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = designController;
