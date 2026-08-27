import { AuditAction, AuditEntityType, AuditEvent } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export interface AuditQueryFilter {
  actorUserId?: string;
  actorRole?: string;
  action?: AuditAction | 'ALL';
  entityType?: AuditEntityType | 'ALL';
  facilityId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const auditRepo = {
  async getLogs(filter?: AuditQueryFilter): Promise<AuditEvent[]> {
    await simulateNetworkDelay();
    let logs = rawStorage.getAuditLogs();

    if (!filter) return logs;

    if (filter.action && filter.action !== 'ALL') {
      logs = logs.filter((l) => l.action === filter.action);
    }
    if (filter.entityType && filter.entityType !== 'ALL') {
      logs = logs.filter((l) => l.entityType === filter.entityType);
    }
    if (filter.actorRole && filter.actorRole !== 'ALL') {
      logs = logs.filter((l) => l.actorRole === filter.actorRole);
    }
    if (filter.actorUserId) {
      logs = logs.filter((l) => l.actorUserId === filter.actorUserId);
    }
    if (filter.facilityId) {
      logs = logs.filter((l) => l.facilityId === filter.facilityId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          (l.targetLabel && l.targetLabel.toLowerCase().includes(q)) ||
          l.action.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q) ||
          (l.purposeCode && l.purposeCode.toLowerCase().includes(q)),
      );
    }

    return logs;
  },

  async log(eventData: Omit<AuditEvent, 'id' | 'occurredAt'>): Promise<AuditEvent> {
    const event: AuditEvent = {
      ...eventData,
      actorUserId: eventData.actorUserId || eventData.userId || 'system',
      actorName: eventData.actorName || eventData.userName || 'Petugas Sistem',
      actorRole: eventData.actorRole || 'ADMIN_DINKES',
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      occurredAt: new Date().toISOString(),
    };
    // Append-only to database
    rawStorage.appendAuditLog(event);
    return event;
  },
};
