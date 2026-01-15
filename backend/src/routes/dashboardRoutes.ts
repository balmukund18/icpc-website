import { Router } from 'express';
import * as ctrl from '../controllers/dashboardController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// GET /api/dashboard - Get all dashboard data for authenticated user
router.get('/', isAuthenticated, ctrl.getDashboard);

export default router;
