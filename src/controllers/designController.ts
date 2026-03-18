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
import { sendPushToAll } from './pushController';
import { sendDesignConfirmationEmail } from '../services/emailService';

const execFileAsync = promisify(execFile);
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';

// Helper para formatear fecha DD/MM/YYYY
function formatDate(date: Date): string {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// Helper para subir un buffer a Cloudinary
function uploadBufferToCloudinary(buffer: Buffer, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

// Helper para extraer public_id y resource_type de una URL de Cloudinary
function extractCloudinaryInfo(url: string): { publicId: string; resourceType: string } | null {
  try {
    const match = url.match(/\/(image|raw|video)\/upload\/v\d+\/(.+)$/);
    if (!match) return null;
    const resourceType = match[1];
    let publicId = match[2];
    // Para imágenes, quitar extensión; para raw, conservarla
    if (resourceType === 'image') {
      publicId = publicId.replace(/\.\w+$/, '');
    }
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

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
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }
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
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }
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

  // Eliminar un diseño y su cliente asociado
  deleteDesign: async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        await t.rollback();
        res.status(400).json({ message: 'ID inválido' });
        return;
      }
      const design = await Design.findByPk(id);
      if (!design) {
        await t.rollback();
        res.status(404).json({ message: 'Diseño no encontrado' });
        return;
      }

      const designData = design.toJSON() as any;
      const clientId = designData.id_client;

      // ─── Eliminar archivos de Cloudinary ───────────────────────
      // Eliminar imagen del diseño
      if (designData.design_file_url) {
        const imgInfo = extractCloudinaryInfo(designData.design_file_url);
        if (imgInfo) {
          await cloudinary.uploader.destroy(imgInfo.publicId, { resource_type: imgInfo.resourceType })
            .catch((err: Error) => console.warn('Error eliminando imagen de Cloudinary:', err.message));
        }
      }

      // Eliminar documento(s) de Cloudinary
      const docs = await DesignDocument.findAll({ where: { id_design: id } });
      for (const doc of docs) {
        const docData = doc.toJSON() as any;
        if (docData.document_url) {
          const docInfo = extractCloudinaryInfo(docData.document_url);
          if (docInfo) {
            await cloudinary.uploader.destroy(docInfo.publicId, { resource_type: docInfo.resourceType })
              .catch((err: Error) => console.warn('Error eliminando documento de Cloudinary:', err.message));
          }
        }
      }

      // Eliminar documentos asociados
      await DesignDocument.destroy({ where: { id_design: id }, transaction: t });

      // Eliminar diseño
      await Design.destroy({ where: { id_design: id }, transaction: t });

      // Eliminar cliente asociado
      if (clientId) {
        await Client.destroy({ where: { id_client: clientId }, transaction: t });
      }

      await t.commit();
      res.status(200).json({ message: 'Diseño, cliente, documentos y archivos de Cloudinary eliminados exitosamente' });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Crear cliente, diseño y generar orden de producción en una sola petición
  createClientAndDesign: async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    let tempJsonPath = '';
    let outputXlsxPath = '';
    let imagePublicId = '';

    try {
      const { name, email, phone_number, id_product, status, tela } = req.body;

      // Parsear arrays que vienen como JSON string en multipart form-data
      const tallas = typeof req.body.tallas === 'string' ? JSON.parse(req.body.tallas) : req.body.tallas;
      const listado = typeof req.body.listado === 'string' ? JSON.parse(req.body.listado) : (req.body.listado || []);

      // Obtener archivo de imagen subido por multer
      const file = (req as any).file;

      // ─── Validaciones ──────────────────────────────────────────
      if (!file) {
        res.status(400).json({ message: 'Se requiere un archivo de imagen (campo "image")' });
        return;
      }
      if (!name || !email || !id_product) {
        res.status(400).json({ message: 'Faltan campos requeridos: name, email, id_product' });
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

      // Sanitizar nombre del cliente para usar en archivos
      const clienteSanitizado = name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '');

      // Calcular cantidad_total como la suma de las cantidades de tallas
      const cantidad_total = tallas.reduce((sum: number, t: any) => sum + (Number(t.cantidad) || 0), 0);

      // ─── 1. Crear cliente ──────────────────────────────────────
      const client = await Client.create({ name, email, phone_number }, { transaction: t });
      const clientId = (client as any).dataValues.id_client ?? client.getDataValue('id_client');

      // ─── 2. Subir imagen a Cloudinary (obligatorio) ──────────────
      const imageResult = await uploadBufferToCloudinary(file.buffer, {
        folder: 'imagenes',
        resource_type: 'image',
        public_id: `${clienteSanitizado}_${Date.now()}`,
      });
      const design_file_url = imageResult.secure_url;
      const imagePublicId = imageResult.public_id;

      // ─── 3. Crear diseño ───────────────────────────────────────
      const design = await Design.create({
        id_client: clientId,
        id_product,
        design_file_url,
        status: status || 'Pendiente',
      }, { transaction: t });
      const designId = (design as any).dataValues.id_design ?? design.getDataValue('id_design');

      // ─── 4. Generar archivo Excel ──────────────────────────────
      const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');
      if (!fs.existsSync(templatePath)) {
        await t.rollback();
        res.status(404).json({ message: 'La plantilla "Plantilla Excel.xlsx" no fue encontrada en /templates' });
        return;
      }
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

      // ─── 5. Subir Excel a Cloudinary ────────────────────────────
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

      // ─── 6. Guardar documento en BD ────────────────────────────
      const document = await DesignDocument.create({
        id_design: designId,
        document_url: uploadResult.secure_url,
      }, { transaction: t });

      // ─── 7. Confirmar transacción ──────────────────────────────
      await t.commit();

      // ─── 8. Emitir evento WebSocket ───────────────────────────
      const { io } = require('../index');
      const clientData = client.toJSON() as any;
      const newOrder = {
        id_design: designId,
        name: clientData.name,
        phone_number: clientData.phone_number || null,
        email: clientData.email,
        created_at: formatDate(clientData.created_at || new Date()),
        status: (design.toJSON() as any).status || 'Pendiente',
        design_file_url: design_file_url || null,
        document_url: uploadResult.secure_url,
      };
      io.emit('new_order', newOrder);

      // ─── 9. Enviar Push Notification a todos los suscriptores ─
      sendPushToAll(
        'Nuevo Pedido - Dark Lion',
        `${name} ha realizado un nuevo pedido`,
        newOrder
      ).catch((err) => console.error('Error enviando push:', err));

      // ─── 10. Enviar Correo de Confirmación (DESACTIVADO TEMPORALMENTE) ───────────────────
      // try {
      //   await sendDesignConfirmationEmail({
      //     clientName: clientData.name,
      //     clientEmail: clientData.email,
      //     designId: designId,
      //     folio: folio,
      //     productName: modelo,
      //     model: modelo,
      //     fabricType: tela,
      //     totalQuantity: cantidad_total,
      //     orderDate: fecha_pedido,
      //     designImageUrl: design_file_url,
      //     documentUrl: uploadResult.secure_url,
      //   });
      // } catch (emailError) {
      //   console.error('⚠️ Error enviando correo de confirmación:', emailError);
      //   // No lanzar error aquí - el pedido se creó exitosamente
      // }

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
      // Limpiar imagen subida a Cloudinary si hubo error
      if (imagePublicId) {
        cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' })
          .catch((err: Error) => console.warn('Error limpiando imagen de Cloudinary:', err.message));
      }
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Actualizar datos de un pedido (cliente, diseño, documento)
  updateOrder: async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        await t.rollback();
        res.status(400).json({ message: 'ID inválido' });
        return;
      }
      const { name, email, phone_number, status, document_url } = req.body;

      // Buscar el diseño
      const design = await Design.findByPk(id);
      if (!design) {
        await t.rollback();
        res.status(404).json({ message: 'Pedido no encontrado' });
        return;
      }

      const designData = design.toJSON() as any;

      // Actualizar campos del diseño (status)
      if (status !== undefined) {
        await Design.update({ status }, { where: { id_design: id }, transaction: t });
      }

      // Actualizar campos del cliente (name, email, phone_number)
      const clientFields: any = {};
      if (name !== undefined) clientFields.name = name;
      if (email !== undefined) clientFields.email = email;
      if (phone_number !== undefined) clientFields.phone_number = phone_number;

      if (Object.keys(clientFields).length > 0 && designData.id_client) {
        await Client.update(clientFields, { where: { id_client: designData.id_client }, transaction: t });
      }

      // Actualizar documento (document_url)
      if (document_url !== undefined) {
        const doc = await DesignDocument.findOne({ where: { id_design: id } });
        if (doc) {
          await DesignDocument.update({ document_url }, { where: { id_design: id }, transaction: t });
        }
      }

      await t.commit();

      // Obtener datos actualizados para la respuesta
      const updatedDesign = await Design.findByPk(id);
      const updatedDesignData = updatedDesign!.toJSON() as any;
      const client = await Client.findByPk(updatedDesignData.id_client);
      const clientData = client ? client.toJSON() as any : {};
      const doc = await DesignDocument.findOne({ where: { id_design: id } });
      const docData = doc ? doc.toJSON() as any : {};

      const updatedOrder = {
        id_design: updatedDesignData.id_design,
        name: clientData.name || null,
        phone_number: clientData.phone_number || null,
        email: clientData.email || null,
        created_at: updatedDesignData.created_at ? formatDate(updatedDesignData.created_at) : null,
        status: updatedDesignData.status || 'Pendiente',
        design_file_url: updatedDesignData.design_file_url || null,
        document_url: docData.document_url || null,
      };

      // Emitir evento WebSocket
      const { io } = require('../index');
      io.emit('update_order', updatedOrder);

      res.status(200).json(updatedOrder);
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener todos los pedidos para la tabla de gestión
  getAllOrders: async (req: Request, res: Response) => {
    try {
      const orders = await Design.findAll({
        attributes: ['id_design', 'id_client', 'status', 'created_at', 'design_file_url'],
        order: [['created_at', 'DESC']],
      });

      const result = [];
      for (const design of orders) {
        const designData = design.toJSON() as any;

        // Obtener cliente
        const client = await Client.findByPk(designData.id_client);
        const clientData = client ? client.toJSON() as any : {};

        // Obtener documento
        const doc = await DesignDocument.findOne({ where: { id_design: designData.id_design } });
        const docData = doc ? doc.toJSON() as any : {};

        result.push({
          id_design: designData.id_design,
          name: clientData.name || null,
          phone_number: clientData.phone_number || null,
          email: clientData.email || null,
          created_at: designData.created_at ? formatDate(designData.created_at) : null,
          status: designData.status || 'Pendiente',
          design_file_url: designData.design_file_url || null,
          document_url: docData.document_url || null,
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export default designController;
