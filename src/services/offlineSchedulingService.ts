import { OfflineSchedulingRequest } from '../types';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';
import { localQueueService } from './localQueueService';

export interface CreateSchedulingRequestParams {
  taskId: string;
  citizenId: string;
  citizenName?: string;
  preferredFacilityId: string;
  preferredFacilityName?: string;
  preferredServiceType: string;
  preferredDate?: string;
  cachedSlotId?: string;
  userId: string;
}

export const offlineSchedulingService = {
  /**
   * Creates an offline scheduling request.
   * NOTE: Never promises a confirmed slot while offline; status is provisional until synced.
   */
  requestScheduling(params: CreateSchedulingRequestParams): OfflineSchedulingRequest {
    const deviceState = kaderStorageRepo.getDeviceState();
    const skewMinutes = deviceState.simulatedClockSkewMinutes || 0;
    const now = new Date(Date.now() + skewMinutes * 60 * 1000);

    const requestId = `sched-req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const req: OfflineSchedulingRequest = {
      id: requestId,
      taskId: params.taskId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      preferredFacilityId: params.preferredFacilityId,
      preferredFacilityName: params.preferredFacilityName,
      preferredServiceType: params.preferredServiceType,
      preferredDate: params.preferredDate,
      cachedSlotId: params.cachedSlotId,
      deviceRecordedAt: now.toISOString(),
      syncStatus: 'PENDING',
    };

    kaderStorageRepo.saveLocalSchedulingRequest(req);
    localQueueService.enqueue(params.userId, 'SCHEDULING_REQUEST', req, 'HIGH');

    return req;
  },

  getLocalRequestForTask(taskId: string): OfflineSchedulingRequest | undefined {
    const all = kaderStorageRepo.getLocalSchedulingRequests();
    return all.find((r) => r.taskId === taskId);
  },
};
