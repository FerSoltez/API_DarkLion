"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'darklion_secret_key_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const authController = {
    // Registrar un nuevo usuario (solo admins pueden crear otros admins)
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, name, role } = req.body;
            if (!email || !password || !name) {
                res.status(400).json({ message: 'Faltan campos requeridos: email, password, name' });
                return;
            }
            // Verificar si el email ya existe
            const existing = yield User_1.User.findOne({ where: { email } });
            if (existing) {
                res.status(409).json({ message: 'El correo ya está registrado' });
                return;
            }
            const user = yield User_1.User.create({
                email,
                password,
                name,
                role: role || 'user',
            });
            const userData = user.toJSON();
            delete userData.password;
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userData,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Iniciar sesión
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Faltan campos requeridos: email, password' });
                return;
            }
            // Buscar usuario por email
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            // Verificar contraseña
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            // Generar JWT
            const signOptions = { expiresIn: 86400 }; // 24 horas en segundos
            const token = jsonwebtoken_1.default.sign({
                id_user: user.id_user,
                email: user.email,
                name: user.name,
                role: user.role,
            }, JWT_SECRET, signOptions);
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id_user: user.id_user,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // Obtener perfil del usuario autenticado
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id_user;
            const user = yield User_1.User.findByPk(userId, {
                attributes: ['id_user', 'email', 'name', 'role', 'created_at'],
            });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = authController;
