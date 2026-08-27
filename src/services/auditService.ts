import { AuditAction, AuditEntityType, AuditEvent, User } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export interface AuditServiceLogOptions {
  targetLabel?: string;
  citizenId?: string;
  targetId?: string;
  facilityId?: string;
  facilityName?: string;
  purposeCode?: string;
  rowCount?: number;
  filterCriteria?: string;
  notes?: string;
  details?: Record<string, any>;
}

export const auditService = {
  async log(
    actor: User,
    action: AuditAction,
    entityType: AuditEntityType,
    options?: AuditServiceLogOptions
  ): Promise<AuditEvent> {
    return auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      facilityId: options?.facilityId || actor.facilityId,
      facilityName: options?.facilityName || actor.facilityName,
      action,
      entityType,
      citizenId: options?.citizenId || options?.targetId,
      targetLabel: options?.targetLabel,
      purposeCode: options?.purposeCode,
      rowCount: options?.rowCount,
      filterCriteria: options?.filterCriteria,
      details: options?.details,
    });
  },
};
