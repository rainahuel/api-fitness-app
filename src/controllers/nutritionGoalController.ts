import { Request, Response } from 'express';
import NutritionGoal from '../models/NutritionGoal';
import mongoose from 'mongoose';

// Define AuthRequest interface to handle the user object added by auth middleware
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new nutrition goal
// @route   POST /api/nutrition-goals
// @access  Private
export const createNutritionGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      startDate,
      calorieCalculation,
      macroDistribution
    } = req.body;

    // Create new nutrition goal
    const nutritionGoal = await NutritionGoal.create({
      userId: req.user._id,
      name,
      startDate: startDate || new Date(),
      status: 'active',
      calorieCalculation,
      macroDistribution
    });

    res.status(201).json(nutritionGoal);
  } catch (error: any) {
    console.error('Create nutrition goal error:', error);
    res.status(500).json({
      message: 'Failed to create nutrition goal',
      error: error.message
    });
  }
};

// @desc    Get all nutrition goals for a user
// @route   GET /api/nutrition-goals
// @access  Private
export const getNutritionGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nutritionGoals = await NutritionGoal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(nutritionGoals);
  } catch (error: any) {
    console.error('Get nutrition goals error:', error);
    res.status(500).json({
      message: 'Failed to retrieve nutrition goals',
      error: error.message
    });
  }
};

// @desc    Get a nutrition goal by ID
// @route   GET /api/nutrition-goals/:id
// @access  Private
export const getNutritionGoalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nutritionGoal = await NutritionGoal.findById(req.params.id);

    if (!nutritionGoal) {
      res.status(404).json({ message: 'Nutrition goal not found' });
      return;
    }

    // Check if the goal belongs to the logged-in user
    if (nutritionGoal.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to access this nutrition goal' });
      return;
    }

    res.json(nutritionGoal);
  } catch (error: any) {
    console.error('Get nutrition goal by ID error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid nutrition goal ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to retrieve nutrition goal',
      error: error.message
    });
  }
};

// @desc    Update a nutrition goal
// @route   PUT /api/nutrition-goals/:id
// @access  Private
export const updateNutritionGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nutritionGoal = await NutritionGoal.findById(req.params.id);

    if (!nutritionGoal) {
      res.status(404).json({ message: 'Nutrition goal not found' });
      return;
    }

    // Check if the goal belongs to the logged-in user
    if (nutritionGoal.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this nutrition goal' });
      return;
    }

    // Update fields
    const {
      name,
      status,
      startDate,
      calorieCalculation,
      macroDistribution
    } = req.body;

    if (name) nutritionGoal.name = name;
    if (status) nutritionGoal.status = status;
    if (startDate) nutritionGoal.startDate = startDate;
    
    if (calorieCalculation) {
      nutritionGoal.calorieCalculation = {
        ...nutritionGoal.calorieCalculation,
        ...calorieCalculation
      };
    }
    
    if (macroDistribution) {
      nutritionGoal.macroDistribution = {
        ...nutritionGoal.macroDistribution,
        ...macroDistribution
      };
    }

    const updatedNutritionGoal = await nutritionGoal.save();

    res.json(updatedNutritionGoal);
  } catch (error: any) {
    console.error('Update nutrition goal error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid nutrition goal ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to update nutrition goal',
      error: error.message
    });
  }
};

// @desc    Delete a nutrition goal
// @route   DELETE /api/nutrition-goals/:id
// @access  Private
export const deleteNutritionGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nutritionGoal = await NutritionGoal.findById(req.params.id);

    if (!nutritionGoal) {
      res.status(404).json({ message: 'Nutrition goal not found' });
      return;
    }

    // Check if the goal belongs to the logged-in user
    if (nutritionGoal.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this nutrition goal' });
      return;
    }

    await nutritionGoal.deleteOne();

    res.json({ message: 'Nutrition goal removed' });
  } catch (error: any) {
    console.error('Delete nutrition goal error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid nutrition goal ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to delete nutrition goal',
      error: error.message
    });
  }
};