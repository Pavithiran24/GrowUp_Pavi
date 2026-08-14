import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'User is not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden: Insufficient privileges to access this resource');
    }

    next();
  };
};
