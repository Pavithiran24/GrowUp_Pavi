import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, TaskFilterParams } from '../types';

export class TaskController {
  static async getProjectTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters: TaskFilterParams = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        assigneeId: req.query.assigneeId as string,
        search: req.query.search as string,
      };

      const tasks = await TaskService.getProjectTasks(req.params.projectId, req.user!, filters);
      return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks);
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.id, req.user!);
      return sendSuccess(res, 200, 'Task details', task);
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(req.params.projectId, req.user!, req.body);
      return sendSuccess(res, 201, 'Task created successfully', task);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTask(req.params.id, req.user!, req.body);
      return sendSuccess(res, 200, 'Task updated successfully', task);
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTaskStatus(req.params.id, req.user!, req.body);
      return sendSuccess(res, 200, 'Task status updated successfully', task);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteTask(req.params.id, req.user!);
      return sendSuccess(res, 200, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
