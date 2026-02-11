import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper para async/await em rotas Express
 * Evita try-catch boilerplate
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Wrapper alternativo para controllers
 */
export const tryCatch =
  (fn: Function) =>
  async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
