"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database"); // Asegúrate de que esta ruta es correcta según tu estructura de carpetas
// Clase que representa el modelo de cliente
class Client extends sequelize_1.Model {
}
exports.Client = Client;
// Inicializar el modelo
Client.init({
    id_client: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Client',
    tableName: 'client', // Nombre de la tabla en la base de datos
    timestamps: false // Desactivar timestamps automáticos de Sequelize ya que definimos created_at manualmente
});
