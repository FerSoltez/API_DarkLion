"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Design = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database"); // Asegúrate de que esta ruta es correcta según tu estructura de carpetas
// Clase que representa el modelo de diseño
class Design extends sequelize_1.Model {
}
exports.Design = Design;
// Inicializar el modelo
Design.init({
    id_design: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_client: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    id_product: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'in_production', 'completed'),
        allowNull: true,
        defaultValue: 'pending'
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: true
    },
    design_file_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Design',
    tableName: 'design', // Nombre de la tabla en la base de datos
    timestamps: false // Desactivar timestamps automáticos de Sequelize ya que definimos created_at manualmente
});
