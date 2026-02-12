import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes';
import designDocumentRoutes from './routes/designDocumentRoutes';
import './config/cloudinaryConfig';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear la aplicación Express
const app: Application = express();

// Middleware para procesar datos en formato JSON
app.use(express.json());

// Rutas
app.use('/api', clientRoutes);
app.use('/api', designDocumentRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('¡API en funcionamiento!');
});

// Manejador de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal');
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
