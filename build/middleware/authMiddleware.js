"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'darklion_secret_key_change_me';
// Middleware: Requiere autenticación (cualquier usuario con token válido)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
exports.requireAuth = requireAuth;
// Middleware: Requiere rol de administrador
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
