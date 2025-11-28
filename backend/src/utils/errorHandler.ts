import { Request, Response, NextFunction } from 'express';
import { AppError } from './customErrors';
import { logger } from './logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Operational errors (known errors we threw)
  if (err instanceof AppError && err.isOperational) {
    logger.warn(
      { 
        err: { message: err.message, stack: err.stack },
        url: req.url, 
        method: req.method,
        statusCode: err.statusCode
      }, 
      'Operational error'
    );
    
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Programming or unexpected errors
  logger.error(
    { 
      err: { message: err.message, stack: err.stack },
      url: req.url, 
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    }, 
    'Unexpected error'
  );

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  return res.status(500).json({
    success: false,
    error: message,
  });
}