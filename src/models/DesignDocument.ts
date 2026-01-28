import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';  // Asegúrate de que esta ruta es correcta según tu estructura de carpetas

// Interfaz que define los atributos de un documento de diseño
export interface DesignDocumentAttributes {
  id_document?: number;
  id_design: number;
  document_url: string;
  generated_at?: Date;
}

// Interfaz que define los atributos opcionales de un documento de diseño (para la creación)
export interface DesignDocumentCreationAttributes extends Optional<DesignDocumentAttributes, 'id_document' | 'generated_at'> {}

// Clase que representa el modelo de documento de diseño
export class DesignDocument extends Model<DesignDocumentAttributes, DesignDocumentCreationAttributes> implements DesignDocumentAttributes {
  public id_document?: number;
  public id_design!: number;
  public document_url!: string;
  public generated_at?: Date;
}

// Inicializar el modelo
DesignDocument.init({
  id_document: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_design: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  document_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'DesignDocument',
  tableName: 'design_document', // Nombre de la tabla en la base de datos
  timestamps: false             // Desactivar timestamps automáticos de Sequelize ya que definimos generated_at manualmente
});
