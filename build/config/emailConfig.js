"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
// Crear transporte de Nodemailer configurado con Gmail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});
// Verificar la conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ Advertencia de Email:', error.message);
    }
    else {
        console.log('✅ Servidor de correo configurado correctamente');
    }
});
exports.default = transporter;
