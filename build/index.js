"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const designDocumentRoutes_1 = __importDefault(require("./routes/designDocumentRoutes"));
const designRoutes_1 = __importDefault(require("./routes/designRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
require("./config/cloudinaryConfig");
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Crear la aplicación Express
const app = (0, express_1.default)();
// Crear servidor HTTP y WebSocket
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
// Middleware para procesar datos en formato JSON
app.use(express_1.default.json());
// Rutas
app.use('/api', clientRoutes_1.default);
app.use('/api', designDocumentRoutes_1.default);
app.use('/api', designRoutes_1.default);
app.use('/api', productRoutes_1.default);
// Ruta de prueba
app.get('/', (req, res, next) => {
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal');
});
// Puerto del servidor
const PORT = process.env.PORT || 3000;
// Iniciar el servidor con WebSocket
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
