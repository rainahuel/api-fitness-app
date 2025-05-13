import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import userRoutes from './routes/userRoutes';
import nutritionGoalRoutes from './routes/nutritionGoalRoutes';
import mealPlanRoutes from './routes/mealPlanRoutes';
import workoutPlanRoutes from './routes/workoutPlanRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rain Fitness API' });
});

app.use('/api/users', userRoutes);
app.use('/api/nutrition-goals', nutritionGoalRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

connectDB();

export default app;
