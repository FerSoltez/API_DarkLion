"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database"); // Asegúrate de que esta ruta es correcta según tu estructura de carpetas
// Clase que representa el modelo de producto
class Product extends sequelize_1.Model {
}
exports.Product = Product;
// Inicializar el modelo
Product.init({
    id_product: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    model_2d_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    model_3d_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Product',
    tableName: 'product', // Nombre de la tabla en la base de datos
    timestamps: false // Desactivar timestamps si no los necesitas
});
