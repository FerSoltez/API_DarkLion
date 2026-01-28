import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';  // Asegúrate de que esta ruta es correcta según tu estructura de carpetas

// Interfaz que define los atributos de un producto
export interface ProductAttributes {
  id_product?: number;
  name: string;
  description?: string;
  model_2d_url: string;
  model_3d_url: string;
}

// Interfaz que define los atributos opcionales de un producto (para la creación)
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id_product' | 'description'> {}

// Clase que representa el modelo de producto
export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id_product?: number;
  public name!: string;
  public description?: string;
  public model_2d_url!: string;
  public model_3d_url!: string;
}

// Inicializar el modelo
Product.init({
  id_product: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  model_2d_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  model_3d_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'product', // Nombre de la tabla en la base de datos
  timestamps: false     // Desactivar timestamps si no los necesitas
});
