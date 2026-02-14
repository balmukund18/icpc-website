import { Request, Response } from 'express';
import * as svc from '../services/alumniService';
import { success, fail } from '../utils/response';

// Register as alumni (public endpoint, requires admin approval)
export const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !req.body.password) {
      return fail(res, 'Email and password are required', 400);
    }

    const user = await svc.registerAlumni(email, req.body);
    success(res, {
      message: 'Registration successful. Please wait for admin approval.',
      user: { id: user.id, email: user.email, role: user.role, approved: user.approved }
    }, 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return fail(res, 'Email already registered', 400);
    }
    fail(res, err.message);
  }
};

// List all approved alumni (for alumni directory)
export const list = async (req: Request, res: Response) => {
  try {
    const alumni = await svc.listAlumni();
    success(res, alumni);
  } catch (err: any) {
    fail(res, err.message);
  }
};
