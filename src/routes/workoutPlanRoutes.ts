import express from 'express';
import {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  updateWorkoutProgress,
  deleteWorkoutPlan
} from '../controllers/workoutPlanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createWorkoutPlan)
  .get(getWorkoutPlans);

router.route('/:id')
  .get(getWorkoutPlanById)
  .put(updateWorkoutPlan)
  .delete(deleteWorkoutPlan);

router.route('/:id/progress')
  .patch(updateWorkoutProgress);

export default router;