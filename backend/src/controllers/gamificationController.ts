import { Request, Response } from 'express';
import * as svc from '../services/gamificationService';
import { success, fail } from '../utils/response';

export const leaderboard = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as any) || 'all';
    const list = await svc.leaderboard(period);
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const badges = async (req: Request, res: Response) => {
  try {
    const list = await svc.listBadges();
    success(res, list);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const userBadges = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const earned = await svc.earnedBadgesForUser(userId);
    success(res, earned);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const streak = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await svc.getStreak(userId);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const heatmap = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months as string) || 6;
    const data = await svc.getHeatmap(userId, months);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const achievements = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await svc.getUserAchievements(userId);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const achievementDefs = async (_req: Request, res: Response) => {
  try {
    const defs = svc.getAchievementDefs();
    success(res, defs);
  } catch (err: any) {
    fail(res, err.message);
  }
};
