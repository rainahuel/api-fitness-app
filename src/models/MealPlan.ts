import mongoose, { Document, Schema } from 'mongoose';

// Food interface for meal foods
interface IFood {
  type: string;
  name: string;
  amount: string | number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Meal interface for plan meals
interface IMeal {
  name: string;
  label?: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  foods: IFood[];
}

// MealPlan interface
export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  name: string;
  settings: {
    calories: number;
    mealsPerDay: number;
    goal: string;
    macroRatio: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: IMeal[];
}

// Food schema for meal foods
const FoodSchema = new Schema<IFood>({
  type: {
    type: String,
    enum: ['protein', 'carb', 'fat', 'veggie', 'fruit'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Schema.Types.Mixed,
    required: true
  },
  protein: Number,
  carbs: Number,
  fat: Number
});

// Meal schema for plan meals
const MealSchema = new Schema<IMeal>({
  name: {
    type: String,
    required: true
  },
  label: String,
  macros: {
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    },
    calories: {
      type: Number,
      required: true
    }
  },
  foods: [FoodSchema]
});

// MealPlan schema
const MealPlanSchema = new Schema<IMealPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  settings: {
    calories: {
      type: Number,
      required: true
    },
    mealsPerDay: {
      type: Number,
      required: true
    },
    goal: {
      type: String,
      enum: ['loseFat', 'maintainMuscle', 'buildMuscle'],
      required: true
    },
    macroRatio: {
      protein: {
        type: Number,
        required: true
      },
      carbs: {
        type: Number,
        required: true
      },
      fat: {
        type: Number,
        required: true
      }
    }
  },
  dailyTotals: {
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    }
  },
  meals: [MealSchema]
});

const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);

export default MealPlan;