import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';  // Asegúrate de que esta ruta es correcta según tu estructura de carpetas

// Interfaz que define los atributos de un cliente
export interface ClientAttributes {
  id_client?: number;
  name: string;
  email: string;
  phone_number?: string;
  created_at?: Date;
}

// Interfaz que define los atributos opcionales de un cliente (para la creación)
export interface ClientCreationAttributes extends Optional<ClientAttributes, 'id_client' | 'phone_number' | 'created_at'> {}

// Clase que representa el modelo de cliente
export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id_client?: number;
  public name!: string;
  public email!: string;
  public phone_number?: string;
  public created_at?: Date;
}

// Inicializar el modelo
Client.init({
  id_client: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Client',
  tableName: 'client', // Nombre de la tabla en la base de datos
  timestamps: false    // Desactivar timestamps automáticos de Sequelize ya que definimos created_at manualmente
});
