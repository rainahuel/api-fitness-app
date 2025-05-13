import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
console.log('API Key:', resendApiKey ? 'Found' : 'Missing');
const fromEmail = process.env.FROM_EMAIL || 'reset@builtbyrain.com';
const resend = new Resend(resendApiKey);

/**
 * Envía un email de recuperación de contraseña
 * @param email Correo electrónico del destinatario
 * @param token Token de recuperación
 * @param username Nombre de usuario (opcional)
 */
export const sendPasswordResetEmail = async (email: string, token: string, username?: string): Promise<void> => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Built by Rain Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0097a7;">Built by Rain</h1>
          </div>
          <p>Hello ${username || 'there'},</p>
          <p>You requested to reset your password. Please click on the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0097a7; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>Regards,<br>Built by Rain Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message);
    }

    console.log('Password reset email sent successfully:', data);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    throw new Error('Failed to send password reset email');
  }
};