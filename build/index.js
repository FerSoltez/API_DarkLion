"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const designDocumentRoutes_1 = __importDefault(require("./routes/designDocumentRoutes"));
require("./config/cloudinaryConfig");
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Crear la aplicación Express
const app = (0, express_1.default)();
// Middleware para procesar datos en formato JSON
app.use(express_1.default.json());
// Rutas
app.use('/api', clientRoutes_1.default);
app.use('/api', designDocumentRoutes_1.default);
// Ruta de prueba
app.get('/', (req, res, next) => {
    res.send('¡API en funcionamiento!');
});
// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal');
});
// Puerto del servidor
const PORT = process.env.PORT || 3000;
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
