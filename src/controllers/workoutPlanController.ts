import { Request, Response } from 'express';
import WorkoutPlan from '../models/WorkoutPlan';
import mongoose from 'mongoose';

// Define AuthRequest interface to handle the user object added by auth middleware
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new workout plan
// @route   POST /api/workout-plans
// @access  Private
export const createWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      startDate,
      methodKey,
      methodName,
      goal,
      level,
      daysPerWeek,
      totalDays
    } = req.body;

    // Create new workout plan
    const workoutPlan = await WorkoutPlan.create({
      userId: req.user._id,
      startDate: startDate || new Date(),
      methodKey,
      methodName,
      goal,
      level,
      daysPerWeek,
      progress: {
        daysCompleted: 0,
        totalDays
      },
      status: 'active'
    });

    res.status(201).json(workoutPlan);
  } catch (error: any) {
    console.error('Create workout plan error:', error);
    res.status(500).json({
      message: 'Failed to create workout plan',
      error: error.message
    });
  }
};

// @desc    Get all workout plans for a user
// @route   GET /api/workout-plans
// @access  Private
export const getWorkoutPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get query parameters
    const status = req.query.status as string | undefined;
    
    // Build filter
    const filter: any = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const workoutPlans = await WorkoutPlan.find(filter)
      .sort({ createdAt: -1 });

    res.json(workoutPlans);
  } catch (error: any) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      message: 'Failed to retrieve workout plans',
      error: error.message
    });
  }
};

// @desc    Get a workout plan by ID
// @route   GET /api/workout-plans/:id
// @access  Private
export const getWorkoutPlanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      res.status(404).json({ message: 'Workout plan not found' });
      return;
    }

    // Check if the workout plan belongs to the logged-in user
    if (workoutPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to access this workout plan' });
      return;
    }

    res.json(workoutPlan);
  } catch (error: any) {
    console.error('Get workout plan by ID error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid workout plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to retrieve workout plan',
      error: error.message
    });
  }
};

// @desc    Update a workout plan
// @route   PUT /api/workout-plans/:id
// @access  Private
export const updateWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      res.status(404).json({ message: 'Workout plan not found' });
      return;
    }

    // Check if the workout plan belongs to the logged-in user
    if (workoutPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this workout plan' });
      return;
    }

    // Update fields
    const {
      startDate,
      methodKey,
      methodName,
      goal,
      level,
      daysPerWeek,
      progress,
      status
    } = req.body;

    if (startDate) workoutPlan.startDate = startDate;
    if (methodKey) workoutPlan.methodKey = methodKey;
    if (methodName) workoutPlan.methodName = methodName;
    if (goal) workoutPlan.goal = goal;
    if (level) workoutPlan.level = level;
    if (daysPerWeek) workoutPlan.daysPerWeek = daysPerWeek;
    
    if (progress) {
      workoutPlan.progress = {
        ...workoutPlan.progress,
        ...progress
      };
    }
    
    if (status) workoutPlan.status = status;

    const updatedWorkoutPlan = await workoutPlan.save();

    res.json(updatedWorkoutPlan);
  } catch (error: any) {
    console.error('Update workout plan error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid workout plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to update workout plan',
      error: error.message
    });
  }
};

// @desc    Update workout progress
// @route   PATCH /api/workout-plans/:id/progress
// @access  Private
export const updateWorkoutProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      res.status(404).json({ message: 'Workout plan not found' });
      return;
    }

    // Check if the workout plan belongs to the logged-in user
    if (workoutPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this workout plan' });
      return;
    }

    // Update progress
    const { daysCompleted } = req.body;

    if (daysCompleted !== undefined) {
      workoutPlan.progress.daysCompleted = daysCompleted;
      
      // Check if plan is completed
      if (daysCompleted >= workoutPlan.progress.totalDays) {
        workoutPlan.status = 'completed';
      }
    }

    const updatedWorkoutPlan = await workoutPlan.save();

    res.json(updatedWorkoutPlan);
  } catch (error: any) {
    console.error('Update workout progress error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid workout plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to update workout progress',
      error: error.message
    });
  }
};

// @desc    Delete a workout plan
// @route   DELETE /api/workout-plans/:id
// @access  Private
export const deleteWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      res.status(404).json({ message: 'Workout plan not found' });
      return;
    }

    // Check if the workout plan belongs to the logged-in user
    if (workoutPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this workout plan' });
      return;
    }

    await workoutPlan.deleteOne();

    res.json({ message: 'Workout plan removed' });
  } catch (error: any) {
    console.error('Delete workout plan error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid workout plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to delete workout plan',
      error: error.message
    });
  }
};