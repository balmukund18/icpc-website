import { Request, Response } from "express";
import * as authService from "../services/authService";
import * as googleAuthService from "../services/googleAuthService";
import { success, fail } from "../utils/response";
import { validationResult } from "express-validator";

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, { errors: errors.array() }, 422);
  try {
    const { email, password, role } = req.body;
    const user = await authService.registerUser(email, password, role);
    success(res, { id: user.id, email: user.email }, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await authService.approveUser(id);
    success(res, { id: user.id, approved: user.approved });
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await authService.getAllUsers();
    success(res, users);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const listPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await authService.getPendingUsers();
    success(res, users);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const checkApprovalStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return fail(res, "User ID is required", 400);
    }
    const user = await authService.getUserApprovalStatus(userId);
    success(res, {
      id: user.id,
      email: user.email,
      approved: user.approved,
      role: user.role,
    });
  } catch (err: any) {
    console.error("checkApprovalStatus error:", err);
    fail(res, err.message, 404);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["STUDENT", "ADMIN", "ALUMNI"].includes(role)) {
      return fail(res, "Invalid role", 400);
    }
    const user = await authService.updateUserRole(id, role);
    success(res, user);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    success(res, data);
  } catch (err: any) {
    fail(res, err.message, 401);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as any).user;

    const result = await authService.deleteUser(id, requestingUser.id);
    success(res, result);
  } catch (err: any) {
    fail(res, err.message, 400);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return fail(res, "Authentication failed", 401);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Generate JWT token for user (no approval needed)
    const token = googleAuthService.generateToken(user.id, user.role);

    // Redirect to frontend with token and user info
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&userId=${user.id}&email=${encodeURIComponent(user.email)}&role=${user.role}`
    );
  } catch (err: any) {
    fail(res, err.message, 401);
  }
};
