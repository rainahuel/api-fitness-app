import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface
export interface IUser extends Document {
  email: string;
  displayName: string;
  password: string;
  createdAt: Date;
  lastLogin: Date;
  profile?: {
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    dailyActivity?: {
      sleepHours?: number;
      sittingHours?: number;
      walkingMinutes?: number;
      strengthMinutes?: number;
      cardioMinutes?: number;
    };
  };
  comparePassword(password: string): Promise<boolean>;
}

// User schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  profile: {
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    age: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    dailyActivity: {
      sleepHours: {
        type: Number,
      },
      sittingHours: {
        type: Number,
      },
      walkingMinutes: {
        type: Number,
      },
      strengthMinutes: {
        type: Number,
      },
      cardioMinutes: {
        type: Number,
      },
    },
  },
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


export default User;