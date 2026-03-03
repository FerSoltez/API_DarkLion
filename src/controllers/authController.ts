import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'darklion_secret_key_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authController = {
  // Registrar un nuevo usuario (solo admins pueden crear otros admins)
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Faltan campos requeridos: email, password, name' });
        return;
      }

      // Verificar si el email ya existe
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        res.status(409).json({ message: 'El correo ya está registrado' });
        return;
      }

      const user = await User.create({
        email,
        password,
        name,
        role: role || 'user',
      });

      const userData = user.toJSON() as any;
      delete userData.password;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userData,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Iniciar sesión
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Faltan campos requeridos: email, password' });
        return;
      }

      // Buscar usuario por email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Verificar contraseña
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Generar JWT
      const signOptions: SignOptions = { expiresIn: 86400 }; // 24 horas en segundos
      const token = jwt.sign(
        {
          id_user: user.id_user,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        signOptions
      );

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
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id_user;
      const user = await User.findByPk(userId, {
        attributes: ['id_user', 'email', 'name', 'role', 'created_at'],
      });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};

export default authController;
