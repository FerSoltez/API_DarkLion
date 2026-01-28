"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignDocument = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database"); // Asegúrate de que esta ruta es correcta según tu estructura de carpetas
// Clase que representa el modelo de documento de diseño
class DesignDocument extends sequelize_1.Model {
}
exports.DesignDocument = DesignDocument;
// Inicializar el modelo
DesignDocument.init({
    id_document: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_design: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    document_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    generated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'DesignDocument',
    tableName: 'design_document', // Nombre de la tabla en la base de datos
    timestamps: false // Desactivar timestamps automáticos de Sequelize ya que definimos generated_at manualmente
});
