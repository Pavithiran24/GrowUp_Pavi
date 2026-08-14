import { prisma } from '../utils/db';
import { TaskStatus, TaskPriority, TaskFilterParams } from '../types';

export class TaskRepository {
  static async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, ownerId: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async findProjectTasks(projectId: string, filters: TaskFilterParams) {
    const where: any = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async create(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: Date | null;
  }) {
    return prisma.task.create({
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async updateStatus(id: string, status: TaskStatus) {
    return prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}
