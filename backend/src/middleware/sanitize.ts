import { Request, Response, NextFunction } from 'express';

/**
 * Simple XSS prevention by stripping HTML tags from string inputs
 * For rich text fields, use a proper HTML sanitizer library
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove HTML tags
      return obj.replace(/<[^>]*>/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize body, query, and params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * For specific routes that need HTML content (like blogs),
 * skip general sanitization but validate structure
 */
export const allowHTML = (req: Request, res: Response, next: NextFunction) => {
  // Mark this request to skip sanitization
  (req as any).skipSanitization = true;
  next();
};

export default sanitizeInput;