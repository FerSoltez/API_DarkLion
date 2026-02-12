import { Request, Response } from 'express';
import { DesignDocument } from '../models/DesignDocument';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// xlsx-populate no tiene tipos de TS, se importa con require
const XlsxPopulate = require('xlsx-populate');

// Mapa de tallas: tipo -> talla -> celda de Excel
const MAPA_TALLAS: Record<string, Record<string, string>> = {
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

      // ─── 1. Cargar la plantilla con xlsx-populate ─────────────
      const templatePath = path.join(process.cwd(), 'templates', 'Plantilla Excel.xlsx');

      if (!fs.existsSync(templatePath)) {
        res.status(404).json({ message: 'La plantilla "Plantilla Excel.xlsx" no fue encontrada en /templates' });
        return;
      }

      // xlsx-populate preserva colores, imágenes, merges y todo el formato original
      const workbook = await XlsxPopulate.fromFileAsync(templatePath);
      const sheet = workbook.sheet(0);

      if (!sheet) {
        res.status(500).json({ message: 'No se encontró una hoja en la plantilla' });
        return;
      }

      // ─── 2. Escribir datos fijos en las celdas ─────────────────
      sheet.cell('L5').value(folio);
      sheet.cell('L6').value(fecha_pedido);
      sheet.cell('D9').value(cliente);
      sheet.cell('K12').value(`${cantidad_total} PLAYERAS`);
      sheet.cell('C19').value(tela);
      sheet.cell('H19').value(modelo);

      // ─── 3. Escribir tallas (X si cantidad=1, número si >1) ────
      for (const tallaDetail of tallas as { tipo: string; talla: string; cantidad: number }[]) {
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
        sheet.cell(cellAddress).value(valorCelda);
      }

      // ─── 4. Guardar archivo temporalmente ──────────────────────
      const clienteSanitizado = cliente.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '');
      const tempFileName = `${clienteSanitizado}.xlsx`;
      const tempFilePath = path.join(os.tmpdir(), tempFileName);

      await workbook.toFileAsync(tempFilePath);

      // ─── 5. Subir a Cloudinary (carpeta ordenes_produccion) ────
      let uploadResult;
      try {
        uploadResult = await cloudinary.uploader.upload(tempFilePath, {
          resource_type: 'raw',
          folder: 'ordenes_produccion',
          public_id: clienteSanitizado,
          format: 'xlsx',
          overwrite: true,
        });
      } catch (uploadError) {
        // Limpiar archivo temporal en caso de error
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        res.status(500).json({ message: 'Error al subir a Cloudinary', error: (uploadError as Error).message });
        return;
      }

      // Limpiar archivo temporal
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      // ─── 6. Guardar en la base de datos ────────────────────────
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
