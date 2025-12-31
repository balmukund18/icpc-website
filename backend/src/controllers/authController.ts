import { Request, Response } from "express";
import * as authService from "../services/authService";
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
