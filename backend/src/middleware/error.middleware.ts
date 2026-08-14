import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Unhandled Error]:', err);

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  // Prisma or Database specific error codes
  if (err.code === 'P2002') {
    return sendError(res, 409, 'A resource with that unique key already exists');
  }
  if (err.code === 'P2025') {
    return sendError(res, 404, 'Record to update/delete not found');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Unexpected server error';

  return sendError(res, statusCode, message);
};
