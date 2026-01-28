"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Crear una instancia de Sequelize
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || '', // Nombre de la base de datos
process.env.DB_USER || '', // Usuario de la base de datos
process.env.DB_PASSWORD || '', // Contraseña de la base de datos
{
    host: process.env.DB_HOST || '', // Dirección del servidor de base de datos
    dialect: 'mysql', // Usar MariaDB
    port: Number(process.env.DB_PORT) || 3306, // Puerto de la base de datos
    logging: false, // Desactivar logging para Sequelize (puedes activarlo si deseas ver las consultas SQL generadas)
    timezone: '-06:00' // Configurar la zona horaria a GMT-6 (horario de México)
});
// Verificar la conexión
exports.sequelize.authenticate()
    .then(() => {
    console.log('Conexión a la base de datos exitosa.');
})
    .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
});
