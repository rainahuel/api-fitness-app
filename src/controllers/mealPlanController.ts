import { Request, Response } from 'express';
import MealPlan from '../models/MealPlan';
import mongoose from 'mongoose';

// Define AuthRequest interface to handle the user object added by auth middleware
interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new meal plan
// @route   POST /api/meal-plans
// @access  Private
export const createMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      settings,
      dailyTotals,
      meals
    } = req.body;

    // Create new meal plan
    const mealPlan = await MealPlan.create({
      userId: req.user._id,
      name,
      settings,
      dailyTotals,
      meals
    });

    res.status(201).json(mealPlan);
  } catch (error: any) {
    console.error('Create meal plan error:', error);
    res.status(500).json({
      message: 'Failed to create meal plan',
      error: error.message
    });
  }
};

// @desc    Get all meal plans for a user
// @route   GET /api/meal-plans
// @access  Private
export const getMealPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mealPlans = await MealPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(mealPlans);
  } catch (error: any) {
    console.error('Get meal plans error:', error);
    res.status(500).json({
      message: 'Failed to retrieve meal plans',
      error: error.message
    });
  }
};

// @desc    Get a meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Private
export const getMealPlanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: 'Meal plan not found' });
      return;
    }

    // Check if the meal plan belongs to the logged-in user
    if (mealPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to access this meal plan' });
      return;
    }

    res.json(mealPlan);
  } catch (error: any) {
    console.error('Get meal plan by ID error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid meal plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to retrieve meal plan',
      error: error.message
    });
  }
};

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
export const updateMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: 'Meal plan not found' });
      return;
    }

    // Check if the meal plan belongs to the logged-in user
    if (mealPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this meal plan' });
      return;
    }

    // Update fields
    const {
      name,
      settings,
      dailyTotals,
      meals
    } = req.body;

    if (name) mealPlan.name = name;
    if (settings) mealPlan.settings = settings;
    if (dailyTotals) mealPlan.dailyTotals = dailyTotals;
    if (meals) mealPlan.meals = meals;

    const updatedMealPlan = await mealPlan.save();

    res.json(updatedMealPlan);
  } catch (error: any) {
    console.error('Update meal plan error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid meal plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to update meal plan',
      error: error.message
    });
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
export const deleteMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: 'Meal plan not found' });
      return;
    }

    // Check if the meal plan belongs to the logged-in user
    if (mealPlan.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this meal plan' });
      return;
    }

    await mealPlan.deleteOne();

    res.json({ message: 'Meal plan removed' });
  } catch (error: any) {
    console.error('Delete meal plan error:', error);
    
    // Check if error is due to invalid ID format
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid meal plan ID' });
      return;
    }
    
    res.status(500).json({
      message: 'Failed to delete meal plan',
      error: error.message
    });
  }
};