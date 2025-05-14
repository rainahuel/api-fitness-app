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
// Modificación al controlador passwordResetController.ts

/**
 * Verificar el token/código de verificación y actualizar la contraseña
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Reset password request received');
      const { token, newPassword } = req.body;
  
      if (!token || !newPassword) {
        res.status(400).json({ message: 'Verification code and new password are required' });
        return;
      }
  
      // Validación y procesamiento del token
      const isVerificationCode = token.length <= 8;
      let resetToken;
      
      if (isVerificationCode) {
        const upperCaseCode = token.toUpperCase();
        const validTokens = await PasswordResetToken.find({
          expiresAt: { $gt: new Date() }
        });
        resetToken = validTokens.find(tokenDoc => 
          tokenDoc.token.substring(0, 8).toUpperCase() === upperCaseCode
        );
      } else {
        resetToken = await PasswordResetToken.findOne({
          token,
          expiresAt: { $gt: new Date() }
        });
      }
  
      if (!resetToken) {
        res.status(400).json({ message: 'Invalid or expired verification code' });
        return;
      }
  
      // Buscar el usuario
      const user = await User.findById(resetToken.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // Hashear la contraseña manualmente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // SOLUCIÓN: Usar updateOne para evitar el middleware pre-save
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      // Eliminar el token usado
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
  
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'An error occurred while resetting your password' });
    }
  };