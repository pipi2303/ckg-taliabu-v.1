import { AuditEntityType, OfflineQueueItem, SyncOperation, SyncStatus } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const syncRepo = {
  async getQueue(status?: SyncStatus | 'ALL'): Promise<OfflineQueueItem[]> {
    await simulateNetworkDelay();
    let queue = rawStorage.getSyncQueue();
    if (status && status !== 'ALL') {
      queue = queue.filter((item) => item.syncStatus === status);
    }
    return queue;
  },

  async enqueue(item: {
    entityType: AuditEntityType;
    operation: SyncOperation;
    payload: any;
    idempotencyKey?: string;
  }): Promise<OfflineQueueItem> {
    const queue = rawStorage.getSyncQueue();
    const newItem: OfflineQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      idempotencyKey: item.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      entityType: item.entityType,
      operation: item.operation,
      payload: item.payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      syncStatus: 'PENDING',
    };
    rawStorage.setSyncQueue([newItem, ...queue]);
    return newItem;
  },

  async processSyncAll(): Promise<{ synced: number; failed: number }> {
    await simulateNetworkDelay();
    const queue = rawStorage.getSyncQueue();
    let synced = 0;
    let failed = 0;

    const updated = queue.map((item) => {
      if (item.syncStatus === 'PENDING' || item.syncStatus === 'FAILED') {
        // Simulate sync success 90%, occasional conflict or failure for realism
        const isSuccess = Math.random() > 0.1;
        if (isSuccess) {
          synced++;
          return {
            ...item,
            syncStatus: 'SYNCED' as SyncStatus,
            lastAttemptAt: new Date().toISOString(),
          };
        } else {
          failed++;
          return {
            ...item,
            retryCount: item.retryCount + 1,
            syncStatus: 'FAILED' as SyncStatus,
            errorMessage: 'Server timeout saat verifikasi idempotency key',
            lastAttemptAt: new Date().toISOString(),
          };
        }
      }
      return item;
    });

    rawStorage.setSyncQueue(updated);
    return { synced, failed };
  },

  async retryItem(id: string): Promise<OfflineQueueItem> {
    await simulateNetworkDelay();
    const queue = rawStorage.getSyncQueue();
    const index = queue.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Antrian sinkronisasi tidak ditemukan');

    const updated: OfflineQueueItem = {
      ...queue[index],
      syncStatus: 'SYNCED',
      retryCount: queue[index].retryCount + 1,
      errorMessage: undefined,
      lastAttemptAt: new Date().toISOString(),
    };
    queue[index] = updated;
    rawStorage.setSyncQueue([...queue]);
    return updated;
  },

  async clearSynced(): Promise<void> {
    const queue = rawStorage.getSyncQueue();
    const remaining = queue.filter((item) => item.syncStatus !== 'SYNCED');
    rawStorage.setSyncQueue(remaining);
  },
};
