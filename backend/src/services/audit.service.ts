import { AuditRepository } from '../repositories/audit.repository';

export class AuditService {
  static async log(
    userId: string | undefined,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await AuditRepository.create({
        userId,
        action,
        entityType,
        entityId,
        metadata,
      });
    } catch (err) {
      console.error('[Audit Log Failure]:', err);
    }
  }

  static async getRecentLogs(limit: number = 50) {
    return AuditRepository.findAll(limit);
  }
}
