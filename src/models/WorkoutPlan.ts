import mongoose, { Document, Schema } from 'mongoose';


export interface IWorkoutPlan extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  startDate: Date;
  methodKey: string;
  methodName: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  progress: {
    daysCompleted: number;
    totalDays: number;
  };
  status: string;
  routineData: any; 
}

const WorkoutPlanSchema = new Schema<IWorkoutPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  methodKey: {
    type: String,
    required: true,
    trim: true
  },
  methodName: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: String,
    enum: ['loseFat', 'maintainMuscle', 'buildMuscle', 'gainStrength'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  daysPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  progress: {
    daysCompleted: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  routineData: {
    type: Schema.Types.Mixed,
    default: []
  }
});

const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;