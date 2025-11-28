import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from './logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn({ err, url: req.url, method: req.method }, 'Operational error');
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Unexpected errors
  logger.error({ err, url: req.url, method: req.method }, 'Unexpected error');
  
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}