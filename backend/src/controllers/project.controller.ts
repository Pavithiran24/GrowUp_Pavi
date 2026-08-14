import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ProjectController {
  static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getProjects(req.user!);
      return sendSuccess(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user!);
      return sendSuccess(res, 200, 'Project details', project);
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.user!, req.body);
      return sendSuccess(res, 201, 'Project created successfully', project);
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(req.params.id, req.user!, req.body);
      return sendSuccess(res, 200, 'Project updated successfully', project);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.deleteProject(req.params.id, req.user!);
      return sendSuccess(res, 200, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.addMember(req.params.id, req.user!, req.body);
      return sendSuccess(res, 201, 'Member added successfully', member);
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.removeMember(req.params.id, req.params.userId, req.user!);
      return sendSuccess(res, 200, 'Member removed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = await ProjectService.getMembers(req.params.id, req.user!);
      return sendSuccess(res, 200, 'Project members retrieved successfully', members);
    } catch (error) {
      next(error);
    }
  }
}
