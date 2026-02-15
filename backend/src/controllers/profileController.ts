import { Request, Response } from 'express';
import * as profileService from '../services/profileService';
import { success, fail } from '../utils/response';

export const upsert = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const isAdmin = req.user.role === 'ADMIN';
    const profile = await profileService.upsertProfile(userId, payload, isAdmin);
    success(res, profile);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const get = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);
    success(res, profile);
  } catch (err: any) {
    fail(res, err.message);
  }
};

// Admin-only: update any user's handles
export const adminUpdateHandles = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { handles } = req.body;
    if (!handles || typeof handles !== 'object') {
      return fail(res, "handles object is required", 400);
    }
    const profile = await profileService.adminUpdateUserHandles(id, handles);
    success(res, profile);
  } catch (err: any) {
    fail(res, err.message);
  }
};
