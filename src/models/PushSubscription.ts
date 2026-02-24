import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Interfaz que define los atributos de una suscripción push
export interface PushSubscriptionAttributes {
  id_subscription?: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at?: Date;
}

// Interfaz para la creación
export interface PushSubscriptionCreationAttributes extends Optional<PushSubscriptionAttributes, 'id_subscription' | 'created_at'> {}

// Clase del modelo
export class PushSubscription extends Model<PushSubscriptionAttributes, PushSubscriptionCreationAttributes> implements PushSubscriptionAttributes {
  public id_subscription?: number;
  public endpoint!: string;
  public p256dh!: string;
  public auth!: string;
  public created_at?: Date;
}

// Inicializar el modelo
PushSubscription.init({
  id_subscription: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  p256dh: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  auth: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'PushSubscription',
  tableName: 'push_subscription',
  timestamps: false,
});
