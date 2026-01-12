import { Request, Response } from 'express';
import * as svc from '../services/sessionService';
import { success, fail } from '../utils/response';

export const create = async (req: Request, res: Response) => {
  try {
    const s = await svc.createSession(req.body);
    success(res, s, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const s = await svc.updateSession(req.params.id, req.body);
    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const s = await svc.deleteSession(req.params.id);
    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const listAll = async (req: Request, res: Response) => {
  try {
    const s = await svc.listSessions();
    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const s = await svc.getSessionById(req.params.id);
    success(res, s);
  } catch (err: any) {
    fail(res, err.message, 404);
  }
};

export const register = async (req: any, res: Response) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;
    const s = await svc.registerForSession(sessionId, userId);
    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const attendance = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, present } = req.body;
    const s = await svc.markAttendance(id, userId, !!present);
    success(res, s);
  } catch (err: any) {
    fail(res, err.message);
  }
};
