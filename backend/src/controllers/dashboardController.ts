import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { success, fail } from '../utils/response';

/**
 * Get all dashboard data for the authenticated user
 * GET /api/dashboard
 */
export const getDashboard = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getDashboardData(userId);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message);
  }
};
