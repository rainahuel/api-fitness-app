import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const PasswordResetTokenSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automáticamente elimina el documento después de 1 hora
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Al final del archivo
export default mongoose.models.PasswordResetToken || 
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
