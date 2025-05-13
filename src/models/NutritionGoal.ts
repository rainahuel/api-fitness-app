// src/models/NutritionGoal.ts
import mongoose, { Document, Schema } from 'mongoose';

// NutritionGoal interface
export interface INutritionGoal extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  status: string;
  name: string;
  startDate: Date;
  calorieCalculation: {
    bmr?: number;
    tdee?: number;
    calorieTarget: number;
    goalType: string;
    estimatedWeeklyChange?: number;
  };
  macroDistribution?: {
    protein?: {
      grams?: number;
      percentage?: number;
    };
    carbs?: {
      grams?: number;
      percentage?: number;
    };
    fat?: {
      grams?: number;
      percentage?: number;
    };
  };
}

// NutritionGoal schema
const NutritionGoalSchema = new Schema<INutritionGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  calorieCalculation: {
    bmr: Number,
    tdee: Number,
    calorieTarget: {
      type: Number,
      required: true,
    },
    goalType: {
      type: String,
      enum: ['deficit', 'aggressiveDeficit', 'maintenance', 'surplus'],
      required: true,
    },
    estimatedWeeklyChange: Number,
  },
  macroDistribution: {
    protein: {
      grams: Number,
      percentage: Number,
    },
    carbs: {
      grams: Number,
      percentage: Number,
    },
    fat: {
      grams: Number,
      percentage: Number,
    },
  },
});

const NutritionGoal = mongoose.model<INutritionGoal>('NutritionGoal', NutritionGoalSchema);

export default NutritionGoal;