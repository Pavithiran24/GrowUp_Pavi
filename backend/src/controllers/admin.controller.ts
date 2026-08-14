import { Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { prisma } from '../utils/db';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await AuditService.getRecentLogs(100);
      return sendSuccess(res, 200, 'Audit logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'ADMIN';

      const projectWhere = isAdmin
        ? {}
        : {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          };

      const taskWhere = isAdmin
        ? {}
        : {
            project: projectWhere,
          };

      const [
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        recentProjects,
        recentTasks,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.project.count({ where: projectWhere }),
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ where: { ...taskWhere, status: 'DONE' } }),
        prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
        prisma.task.count({
          where: {
            ...taskWhere,
            status: { not: 'DONE' },
            dueDate: { lt: new Date() },
          },
        }),
        prisma.project.findMany({
          where: projectWhere,
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: { owner: { select: { name: true } }, _count: { select: { tasks: true, members: true } } },
        }),
        prisma.task.findMany({
          where: taskWhere,
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: { project: { select: { name: true } }, assignee: { select: { name: true } } },
        }),
        AuditService.getRecentLogs(10),
      ]);

      return sendSuccess(res, 200, 'Dashboard statistics', {
        metrics: {
          totalProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
        },
        recentProjects,
        recentTasks,
        recentActivity: recentAuditLogs,
      });
    } catch (error) {
      next(error);
    }
  }
}
