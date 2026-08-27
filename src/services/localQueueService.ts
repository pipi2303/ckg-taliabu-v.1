import {
  FieldVisit,
  FieldVisitSyncStatus,
  KaderAssignmentResponse,
  LocalQueueEntityType,
  LocalQueueItem,
  OfflineSchedulingRequest,
  UrgentFieldEscalation,
} from '../types';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';

export const localQueueService = {
  /**
   * Enqueues any local field work record into the durable queue.
   * Queue survives browser refresh, phone restart, logout, package expiry, and user switching.
   */
  enqueue(
    userId: string,
    entityType: LocalQueueEntityType,
    payload: FieldVisit | OfflineSchedulingRequest | UrgentFieldEscalation | KaderAssignmentResponse,
    priority: 'NORMAL' | 'HIGH' | 'HIGHEST' = 'NORMAL'
  ): LocalQueueItem {
    const queueItem: LocalQueueItem = {
      id: payload.id, // Idempotency key from record
      userId,
      entityType,
      payload,
      createdAt: new Date().toISOString(),
      syncPriority: priority,
      retryCount: 0,
      syncStatus: 'PENDING',
    };

    kaderStorageRepo.enqueueItem(queueItem);
    return queueItem;
  },

  getAllQueueItems(userId?: string): LocalQueueItem[] {
    return kaderStorageRepo.getQueueItems(userId);
  },

  getPendingCount(userId?: string): number {
    const all = kaderStorageRepo.getQueueItems(userId);
    return all.filter((i) => i.syncStatus !== 'SYNCED').length;
  },

  getQueueSummary(userId?: string) {
    const all = kaderStorageRepo.getQueueItems(userId);
    return {
      total: all.length,
      pending: all.filter((i) => i.syncStatus === 'PENDING').length,
      syncing: all.filter((i) => i.syncStatus === 'SYNCING').length,
      synced: all.filter((i) => i.syncStatus === 'SYNCED').length,
      failed: all.filter((i) => i.syncStatus === 'FAILED').length,
      conflict: all.filter((i) => i.syncStatus === 'CONFLICT').length,
    };
  },

  updateStatus(id: string, status: FieldVisitSyncStatus, error?: string) {
    kaderStorageRepo.updateQueueItemStatus(id, status, error);
  },

  retryFailedItems(userId?: string) {
    const all = kaderStorageRepo.getQueueItems(userId);
    all.forEach((item) => {
      if (item.syncStatus === 'FAILED' || item.syncStatus === 'PENDING') {
        kaderStorageRepo.updateQueueItemStatus(item.id, 'PENDING');
      }
    });
  },

  /**
   * Returns items ordered by sync priority:
   * 1. HIGHEST (Urgent escalations)
   * 2. HIGH (Scheduling requests & new task responses)
   * 3. NORMAL (Routine visits)
   */
  getPrioritySortedQueue(userId?: string): LocalQueueItem[] {
    const all = kaderStorageRepo.getQueueItems(userId).filter((i) => i.syncStatus !== 'SYNCED');
    const priorityWeight = {
      HIGHEST: 3,
      HIGH: 2,
      NORMAL: 1,
    };

    return [...all].sort((a, b) => {
      const pDiff = (priorityWeight[b.syncPriority] || 1) - (priorityWeight[a.syncPriority] || 1);
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
};
