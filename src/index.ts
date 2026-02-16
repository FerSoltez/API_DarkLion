import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import clientRoutes from './routes/clientRoutes';
import designDocumentRoutes from './routes/designDocumentRoutes';
import designRoutes from './routes/designRoutes';
import productRoutes from './routes/productRoutes';
import './config/cloudinaryConfig';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear la aplicación Express
const app: Application = express();

// Crear servidor HTTP y WebSocket
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Exportar io para usarlo en controllers
export { io };

// Middleware para procesar datos en formato JSON
app.use(express.json());

// Rutas
app.use('/api', clientRoutes);
app.use('/api', designDocumentRoutes);
app.use('/api', designRoutes);
app.use('/api', productRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('¡API en funcionamiento!');
});

// WebSocket conexión
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Manejador de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal');
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor con WebSocket
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
