import { OfflineQueueItem, SyncStatus, SystemSettings, User } from '../types';
import { syncRepo } from '../repositories/syncRepo';
import { auditRepo } from '../repositories/auditRepo';
import { getSettings, saveSettings } from '../repositories/storage';

export const syncService = {
  getSettings(): SystemSettings {
    return getSettings();
  },

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = getSettings();
    const updated = { ...current, ...updates };
    saveSettings(updated);
    return updated;
  },

  async getQueue(status?: SyncStatus | 'ALL'): Promise<OfflineQueueItem[]> {
    return syncRepo.getQueue(status);
  },

  async syncAll(actor: User): Promise<{ synced: number; failed: number }> {
    const result = await syncRepo.processSyncAll();

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'SYNC_QUEUE',
      targetLabel: `Eksekusi Sinkronisasi Paket: ${result.synced} Berhasil, ${result.failed} Gagal`,
      facilityId: actor.facilityId,
      facilityName: actor.facilityName,
      purposeCode: 'SYNC_QUEUE_EXECUTION',
      details: { synced: result.synced, failed: result.failed },
    });

    return result;
  },

  async retryItem(actor: User, id: string): Promise<OfflineQueueItem> {
    const retried = await syncRepo.retryItem(id);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'SYNC_QUEUE',
      entityId: retried.id,
      targetLabel: `Retry Sinkronisasi Antrian: ${retried.entityType} (${retried.idempotencyKey})`,
      facilityId: actor.facilityId,
      facilityName: actor.facilityName,
      purposeCode: 'SYNC_QUEUE_RETRY',
    });

    return retried;
  },

  async clearSynced(): Promise<void> {
    return syncRepo.clearSynced();
  },
};
