import { prisma } from '../utils/db';

export class AuditRepository {
  static async create(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  static async findAll(limit: number = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}
