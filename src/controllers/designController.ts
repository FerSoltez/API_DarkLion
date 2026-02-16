import { Request, Response } from 'express';
import { Design } from '../models/Design';
import { Client } from '../models/Client';
import { DesignDocument } from '../models/DesignDocument';
import { Product } from '../models/Product';
import { sequelize } from '../config/database';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';

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
  },

  // Crear cliente, diseño y generar orden de producción en una sola petición
  createClientAndDesign: async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    let tempJsonPath = '';
    let outputXlsxPath = '';

    try {
      const {
        // Datos del cliente
        name,
        email,
        phone_number,
        // Datos del diseño
        id_product,
        design_file_url,
        status,
        // Datos de la orden de producción
        tela,
        tallas,
        listado,
      } = req.body;

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
      const product = await Product.findByPk(id_product);
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
      const cantidad_total = tallas.reduce((sum: number, t: any) => sum + (Number(t.cantidad) || 0), 0);

      // ─── 1. Crear cliente ──────────────────────────────────────
      const client = await Client.create({ name, email, phone_number }, { transaction: t });
      const clientId = (client as any).dataValues.id_client ?? client.getDataValue('id_client');

      // ─── 2. Crear diseño ───────────────────────────────────────
      const design = await Design.create({
        id_client: clientId,
        id_product,
        design_file_url,
        status: status || 'pending',
      }, { transaction: t });
      const designId = (design as any).dataValues.id_design ?? design.getDataValue('id_design');

      // ─── 3. Generar archivo Excel ──────────────────────────────
      const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');
      if (!fs.existsSync(templatePath)) {
        await t.rollback();
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
      const { stdout, stderr } = await execFileAsync(PYTHON_CMD, [scriptPath, tempJsonPath, outputXlsxPath]);

      if (stderr) console.warn('Python warnings:', stderr);

      const result = JSON.parse(stdout);
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido en el script Python');
      }

      // Limpiar JSON temporal
      if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
      tempJsonPath = '';

      // ─── 4. Subir a Cloudinary ─────────────────────────────────
      const uploadResult = await cloudinary.uploader.upload(outputXlsxPath, {
        resource_type: 'raw',
        folder: 'ordenes_produccion',
        public_id: clienteSanitizado,
        format: 'xlsx',
        overwrite: true,
      });

      // Limpiar Excel temporal
      if (fs.existsSync(outputXlsxPath)) fs.unlinkSync(outputXlsxPath);
      outputXlsxPath = '';

      // ─── 5. Guardar documento en BD ────────────────────────────
      const document = await DesignDocument.create({
        id_design: designId,
        document_url: uploadResult.secure_url,
      }, { transaction: t });

      // ─── 6. Confirmar transacción ──────────────────────────────
      await t.commit();

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
    } catch (error) {
      await t.rollback();
      // Limpiar temporales en caso de error
      if (tempJsonPath && fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
      if (outputXlsxPath && fs.existsSync(outputXlsxPath)) fs.unlinkSync(outputXlsxPath);
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default designController;
