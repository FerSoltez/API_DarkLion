import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear una instancia de Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME || '',     // Nombre de la base de datos
  process.env.DB_USER || '',         // Usuario de la base de datos
  process.env.DB_PASSWORD || '',         // Contraseña de la base de datos
  {
    host: process.env.DB_HOST || '', // Dirección del servidor de base de datos
    dialect: 'mysql',                      // Usar MariaDB
    port: Number(process.env.DB_PORT) || 3306, // Puerto de la base de datos
    logging: false  ,                         // Desactivar logging para Sequelize (puedes activarlo si deseas ver las consultas SQL generadas)
    timezone: '-06:00'                      // Configurar la zona horaria a GMT-6 (horario de México)
  }
);

// Verificar la conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos exitosa.');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });
