import { Request, Response, NextFunction } from 'express';
import { logger } from '../server';
import { ApiResponse } from '../types/express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    statusCode,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    err,
  });

  const response: ApiResponse = {
    success: false,
    message,
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    response.data = err instanceof AppError ? {} : err;
  }

  res.status(statusCode).json(response);
};
