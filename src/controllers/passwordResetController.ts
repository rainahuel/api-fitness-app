import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import PasswordResetToken from '../models/passwordResetToken';
import { sendPasswordResetEmail } from '../utils/emailService';
import User from '../models/User';

/**
 * Solicitar un restablecimiento de contraseña
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Buscar el usuario por email
    const user = await User.findOne({ email });

    // No revelar si el email existe o no por motivos de seguridad
    if (!user) {
      res.status(200).json({ 
        message: 'If an account with that email exists, we have sent password reset instructions.' 
      });
      return;
    }

    // Generar un token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

    // Guardar el token en la base de datos
    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      { 
        userId: user._id,
        token,
        expiresAt
      },
      { upsert: true, new: true }
    );

    // Enviar el email con el token
    await sendPasswordResetEmail(email, token, user.name || user.username);

    // Para desarrollo, incluir el token en la respuesta
    if (process.env.NODE_ENV !== 'production') {
      res.status(200).json({ 
        message: 'Password reset instructions sent',
        devToken: token // Solo para desarrollo
      });
    } else {
      res.status(200).json({ 
        message: 'If an account with that email exists, we have sent password reset instructions.' 
      });
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
};

/**
 * Verificar el token y actualizar la contraseña
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // Validar la complejidad de la contraseña
    if (newPassword.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long' });
      return;
    }

    // Buscar el token válido
    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Buscar el usuario
    const user = await User.findById(resetToken.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    await user.save();

    // Eliminar el token usado
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An error occurred while resetting your password' });
  }
};