import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      return sendSuccess(res, 200, 'User profile', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, 200, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      return sendSuccess(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return sendSuccess(res, 200, 'User details', user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.user!.id, req.body);
      return sendSuccess(res, 201, 'User account created successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.updateUserRole(req.user!.id, req.params.id, req.body);
      return sendSuccess(res, 200, 'User role updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(req.user!.id, req.params.id);
      return sendSuccess(res, 200, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
