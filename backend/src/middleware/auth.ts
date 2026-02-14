import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient";
import { User } from "@prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment");
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: User;
}

export const isAuthenticated: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const auth = authReq.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id?: string } | null;
    const user = await prisma.user.findUnique({
      where: { id: payload?.id as string },
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "User not found" });
    }

    authReq.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  if (!authReq.user)
    return res.status(401).json({ message: "Not authenticated" });
  if (authReq.user.role !== "ADMIN")
    return res.status(403).json({ message: "Admin only" });
  next();
};

export const isAlumni: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  if (!authReq.user)
    return res.status(401).json({ message: "Not authenticated" });
  if (authReq.user.role !== "ALUMNI")
    return res.status(403).json({ message: "Alumni only" });
  next();
};

// Optional authentication - allows both authenticated and unauthenticated access
// If token is provided and valid, req.user will be set; otherwise, proceeds without user
export const optionalAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const auth = authReq.headers.authorization;

  // No token provided - proceed without user
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return next();
  }

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id?: string } | null;
    const user = await prisma.user.findUnique({
      where: { id: payload?.id as string },
    });

    if (user) {
      authReq.user = user;
    }
  } catch (err) {
    // Invalid token - proceed without user (don't fail the request)
  }

  next();
};
