import express from 'express';
import {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan
} from '../controllers/mealPlanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createMealPlan)
  .get(getMealPlans);

router.route('/:id')
  .get(getMealPlanById)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

export default router;