import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

// Interfaz que define los atributos de un usuario
export interface UserAttributes {
  id_user?: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  created_at?: Date;
}

// Interfaz para la creación
export interface UserCreationAttributes extends Optional<UserAttributes, 'id_user' | 'role' | 'created_at'> {}

// Clase del modelo
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id_user?: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: 'admin' | 'user';
  public created_at?: Date;

  // Método para verificar contraseña
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

// Inicializar el modelo
User.init({
  id_user: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'user',
  timestamps: false,
  hooks: {
    // Hash de contraseña antes de crear
    beforeCreate: async (user: User) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    // Hash de contraseña antes de actualizar (solo si cambió)
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});
