import express from 'express';
import {
  createNutritionGoal,
  getNutritionGoals,
  getNutritionGoalById,
  updateNutritionGoal,
  deleteNutritionGoal
} from '../controllers/nutritionGoalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createNutritionGoal)
  .get(getNutritionGoals);

router.route('/:id')
  .get(getNutritionGoalById)
  .put(updateNutritionGoal)
  .delete(deleteNutritionGoal);

export default router;