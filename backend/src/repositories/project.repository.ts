import { prisma } from '../utils/db';
import { MemberRole } from '../types';

export class ProjectRepository {
  static async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async findAccessibleProjects(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return prisma.project.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async create(data: { name: string; description?: string; ownerId: string }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  static async update(id: string, data: { name?: string; description?: string }) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  static async getMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  static async addMember(projectId: string, userId: string, role: MemberRole = 'MEMBER') {
    return prisma.projectMember.create({
      data: { projectId, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async removeMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }
}
