import {
  DeclineDelayReason,
  FieldVisit,
  FieldVisitOutcome,
} from '../types';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';
import { localQueueService } from './localQueueService';

export interface RecordVisitParams {
  packageId: string;
  taskId: string;
  citizenId: string;
  citizenName?: string;
  userId: string;
  userName?: string;
  outcome: FieldVisitOutcome;
  declineReasons?: DeclineDelayReason[];
  dangerSignFlagged?: boolean;
  notes?: string;
}

export const fieldVisitService = {
  /**
   * Records or updates a FieldVisit on device with IMMEDIATE AUTOSAVE.
   * Generates a stable UUID idempotency key.
   */
  recordVisit(params: RecordVisitParams): FieldVisit {
    const existingVisits = kaderStorageRepo.getLocalFieldVisits();
    const existing = existingVisits.find((v) => v.taskId === params.taskId);

    const deviceState = kaderStorageRepo.getDeviceState();
    const skewMinutes = deviceState.simulatedClockSkewMinutes || 0;
    const now = new Date(Date.now() + skewMinutes * 60 * 1000);
    const clockSkewFlagged = Math.abs(skewMinutes) > 60;

    const visitId = existing ? existing.id : `fvisit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const visit: FieldVisit = {
      id: visitId,
      packageId: params.packageId,
      taskId: params.taskId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      userId: params.userId,
      userName: params.userName,
      outcome: params.outcome,
      declineReasons: params.declineReasons || [],
      dangerSignFlagged: !!params.dangerSignFlagged,
      deviceRecordedAt: now.toISOString(),
      clockSkewFlagged,
      notes: params.notes || '',
      syncStatus: 'PENDING',
    };

    // Autosave immediately to local storage
    kaderStorageRepo.saveLocalFieldVisit(visit);

    // Enqueue to durable sync queue
    localQueueService.enqueue(params.userId, 'FIELD_VISIT', visit, 'NORMAL');

    return visit;
  },

  getLocalVisitForTask(taskId: string): FieldVisit | undefined {
    const all = kaderStorageRepo.getLocalFieldVisits();
    return all.find((v) => v.taskId === taskId);
  },

  getAllLocalVisits(userId?: string): FieldVisit[] {
    return kaderStorageRepo.getLocalFieldVisits(userId);
  },
};
