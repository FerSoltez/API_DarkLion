import { Request, Response } from 'express';
import { DesignDocument } from '../models/DesignDocument';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
  },

  // Generar orden de producción (.xlsx) desde la plantilla
  generateProductionOrder: async (req: Request, res: Response) => {
    try {
      const {
        id_design,
        folio,
        fecha_pedido,
        cliente,
        cantidad_total,
        tela,
        modelo,
        tallas, // Array de { tipo: string, talla: string, cantidad: number }
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
      };

      const tempJsonPath = path.join(os.tmpdir(), `order_input_${Date.now()}.json`);
      const outputXlsxPath = path.join(os.tmpdir(), `${clienteSanitizado}.xlsx`);

      fs.writeFileSync(tempJsonPath, JSON.stringify(inputData, null, 2), 'utf8');

      // ─── 3. Ejecutar script Python (openpyxl) ─────────────────
      const scriptPath = path.join(process.cwd(), 'scripts', 'generate_xlsx.py');

      try {
        const { stdout, stderr } = await execFileAsync('python', [scriptPath, tempJsonPath, outputXlsxPath]);

        if (stderr) {
          console.warn('Python warnings:', stderr);
        }

        const result = JSON.parse(stdout);
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido en el script Python');
        }
      } catch (pyError: any) {
        // Limpiar temporales
        if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
        if (fs.existsSync(outputXlsxPath)) fs.unlinkSync(outputXlsxPath);

        res.status(500).json({
          message: 'Error al generar el archivo Excel',
          error: pyError.message || pyError.stderr || String(pyError),
        });
        return;
      }

      // Limpiar JSON temporal
      if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);

      // ─── 4. Subir a Cloudinary (carpeta ordenes_produccion) ────
      let uploadResult;
      try {
        uploadResult = await cloudinary.uploader.upload(outputXlsxPath, {
          resource_type: 'raw',
          folder: 'ordenes_produccion',
          public_id: clienteSanitizado,
          format: 'xlsx',
          overwrite: true,
        });
      } catch (uploadError) {
        if (fs.existsSync(outputXlsxPath)) fs.unlinkSync(outputXlsxPath);
        res.status(500).json({ message: 'Error al subir a Cloudinary', error: (uploadError as Error).message });
        return;
      }

      // Limpiar archivo Excel temporal
      if (fs.existsSync(outputXlsxPath)) fs.unlinkSync(outputXlsxPath);

      // ─── 5. Guardar en la base de datos ────────────────────────
      const document = await DesignDocument.create({
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
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};

export default designDocumentController;
