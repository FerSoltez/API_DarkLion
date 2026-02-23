import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';  // Asegúrate de que esta ruta es correcta según tu estructura de carpetas

// Interfaz que define los atributos de un diseño
export interface DesignAttributes {
  id_design?: number;
  id_client: number;
  id_product: number;
  status?: 'En revision' | 'Pendiente' | 'Aprobado';
  created_at?: Date;
  design_file_url: string;
}

// Interfaz que define los atributos opcionales de un diseño (para la creación)
export interface DesignCreationAttributes extends Optional<DesignAttributes, 'id_design' | 'status' | 'created_at'> {}

// Clase que representa el modelo de diseño
export class Design extends Model<DesignAttributes, DesignCreationAttributes> implements DesignAttributes {
  public id_design?: number;
  public id_client!: number;
  public id_product!: number;
  public status?: 'En revision' | 'Pendiente' | 'Aprobado';
  public created_at?: Date;
  public design_file_url!: string;
}

// Inicializar el modelo
Design.init({
  id_design: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_client: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_product: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('En revision', 'Pendiente', 'Aprobado'),
    allowNull: true,
    defaultValue: 'Pendiente'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true
  },
  design_file_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Design',
  tableName: 'design', // Nombre de la tabla en la base de datos
  timestamps: false    // Desactivar timestamps automáticos de Sequelize ya que definimos created_at manualmente
});
