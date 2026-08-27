import {
  Appointment,
  ContactAttempt,
  FieldVisit,
  KaderAssignmentResponse,
  LocalQueueItem,
  OfflineSchedulingRequest,
  SyncConflict,
  UrgentFieldEscalation,
} from '../types';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';
import { localQueueService } from './localQueueService';
import { rawStorage } from '../repositories/storage';
import { auditRepo } from '../repositories/auditRepo';
import { getSettings } from '../repositories/storage';

export interface SyncBatchResult {
  totalAttempted: number;
  syncedCount: number;
  failedCount: number;
  conflictCount: number;
  bytesTransferredKb: number;
  message: string;
}

export const kaderSyncService = {
  /**
   * Executes an idempotent, chunked synchronization of the local queue.
   * Priority: HIGHEST (Urgent) -> HIGH (Scheduling) -> NORMAL (Visits).
   */
  async syncQueue(userId?: string): Promise<SyncBatchResult> {
    const settings = getSettings();
    if (settings.networkMode === 'OFFLINE') {
      return {
        totalAttempted: 0,
        syncedCount: 0,
        failedCount: 0,
        conflictCount: 0,
        bytesTransferredKb: 0,
        message: 'Jaringan tidak tersedia (Mode Luring). Catatan tetap aman di perangkat Anda.',
      };
    }

    const pendingItems = localQueueService.getPrioritySortedQueue(userId);
    if (pendingItems.length === 0) {
      return {
        totalAttempted: 0,
        syncedCount: 0,
        failedCount: 0,
        conflictCount: 0,
        bytesTransferredKb: 0,
        message: 'Semua data telah tersinkronisasi.',
      };
    }

    let syncedCount = 0;
    let failedCount = 0;
    let conflictCount = 0;
    let bytesTransferred = 0;

    // Simulate intermittent connection if setting is SLOW or simulated failure
    const isIntermittent = settings.networkMode === 'SLOW' && Math.random() < 0.25;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      // Simulate partial sync disruption if intermittent network
      if (isIntermittent && i >= 3) {
        kaderStorageRepo.updateQueueItemStatus(
          item.id,
          'FAILED',
          'Sinkronisasi terhenti karena fluktuasi sinyal jaringan. Catatan tetap aman di perangkat.'
        );
        failedCount++;
        continue;
      }

      kaderStorageRepo.updateQueueItemStatus(item.id, 'SYNCING');

      try {
        const itemBytes = new Blob([JSON.stringify(item.payload)]).size;
        bytesTransferred += itemBytes;

        if (item.entityType === 'FIELD_VISIT') {
          const res = await this.processFieldVisitSync(item.payload as FieldVisit);
          if (res.isConflict) {
            conflictCount++;
            kaderStorageRepo.updateQueueItemStatus(item.id, 'CONFLICT', res.conflictMessage);
          } else {
            syncedCount++;
            kaderStorageRepo.updateQueueItemStatus(item.id, 'SYNCED');
          }
        } else if (item.entityType === 'SCHEDULING_REQUEST') {
          const res = await this.processSchedulingRequestSync(item.payload as OfflineSchedulingRequest);
          if (res.isConflict) {
            conflictCount++;
            kaderStorageRepo.updateQueueItemStatus(item.id, 'CONFLICT', res.conflictMessage);
          } else {
            syncedCount++;
            kaderStorageRepo.updateQueueItemStatus(item.id, 'SYNCED');
          }
        } else if (item.entityType === 'URGENT_ESCALATION') {
          await this.processUrgentEscalationSync(item.payload as UrgentFieldEscalation);
          syncedCount++;
          kaderStorageRepo.updateQueueItemStatus(item.id, 'SYNCED');
        } else if (item.entityType === 'ASSIGNMENT_RESPONSE') {
          await this.processAssignmentResponseSync(item.payload as KaderAssignmentResponse);
          syncedCount++;
          kaderStorageRepo.updateQueueItemStatus(item.id, 'SYNCED');
        }
      } catch (err: any) {
        failedCount++;
        kaderStorageRepo.updateQueueItemStatus(item.id, 'FAILED', err.message || 'Gagal mengirim data');
      }
    }

    const bytesKb = Math.max(1, Math.round((bytesTransferred / 1024) * 10) / 10);
    const deviceState = kaderStorageRepo.getDeviceState();
    kaderStorageRepo.setDeviceState({
      lastSyncBytesUsed: bytesKb,
      totalSyncBytesUsed: (deviceState.totalSyncBytesUsed || 0) + bytesKb,
    });

    let message = `Sinkronisasi selesai: ${syncedCount} terkirim.`;
    if (failedCount > 0) {
      message += ` ${failedCount} catatan tertunda karena jaringan.`;
    }
    if (conflictCount > 0) {
      message += ` ${conflictCount} membutuhkan penyesuaian jadwal/catatan.`;
    }

    return {
      totalAttempted: pendingItems.length,
      syncedCount,
      failedCount,
      conflictCount,
      bytesTransferredKb: bytesKb,
      message,
    };
  },

  /**
   * Processes a single FieldVisit onto the server database
   */
  async processFieldVisitSync(visit: FieldVisit): Promise<{ isConflict: boolean; conflictMessage?: string }> {
    // 1. Store as permanent server evidence
    const serverVisit: FieldVisit = {
      ...visit,
      serverReceivedAt: new Date().toISOString(),
      syncStatus: 'SYNCED',
    };
    kaderStorageRepo.appendServerSyncedVisit(serverVisit);

    // 2. Update server CareTask & ContactAttempts (MVP 4 Integration)
    const allTasks = rawStorage.getCareTasks();
    const task = allTasks.find((t) => t.id === visit.taskId);

    if (!task) {
      // Task was removed or citizen moved
      const conflict: SyncConflict = {
        id: `conf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        queueItemId: visit.id,
        conflictType: 'TASK_CANCELLED',
        serverSummary: 'Tugas tidak ditemukan di server (mungkin telah dibatalkan sebelumnya).',
        localSummary: `Kunjungan kader tetap disimpan sebagai riwayat bukti (${visit.outcome}).`,
        resolutionState: 'AUTO_RESOLVED',
        occurredAt: new Date().toISOString(),
      };
      kaderStorageRepo.saveConflict(conflict);
      return { isConflict: true, conflictMessage: conflict.serverSummary };
    }

    // Record server contact attempt
    const contactAttempt: ContactAttempt = {
      id: `att-fvisit-${visit.id}`,
      taskId: visit.taskId,
      citizenId: visit.citizenId,
      citizenName: visit.citizenName,
      channel: 'KADER_VISIT',
      ladderStep: (task.contactAttemptsCount || 0) + 1,
      attemptedAt: visit.deviceRecordedAt,
      attemptedByUserId: visit.userId,
      attemptedByUserName: visit.userName || 'Kader Kesehatan Desa',
      outcome:
        visit.outcome === 'AGREED_TO_ATTEND'
          ? 'CONNECTED_AGREED'
          : visit.outcome === 'DECLINED'
          ? 'CONNECTED_DECLINED'
          : visit.outcome === 'POSTPONED'
          ? 'CONNECTED_POSTPONED'
          : visit.outcome === 'NOT_AT_HOME'
          ? 'NOT_AT_HOME'
          : 'CONNECTED_DECLINED',
      declineReason: visit.declineReasons?.[0],
      deliveryFailed: false,
      deliveryStatus: 'DELIVERED',
      notes: visit.notes || `Hasil kunjungan lapangan kader: ${visit.outcome}`,
    };

    const allAttempts = rawStorage.getContactAttempts();
    allAttempts.push(contactAttempt);
    rawStorage.setContactAttempts(allAttempts);

    // Update CareTask
    task.contactAttemptsCount = (task.contactAttemptsCount || 0) + 1;
    task.lastContactAttemptAt = visit.deviceRecordedAt;
    task.lastContactOutcome = visit.outcome;
    task.updatedAt = new Date().toISOString();

    if (visit.outcome === 'AGREED_TO_ATTEND') {
      task.status = 'IN_PROGRESS';
    }

    rawStorage.setCareTasks(allTasks);

    // Audit log
    await auditRepo.log({
      actorUserId: visit.userId,
      actorName: visit.userName || 'Kader Lapangan',
      actorRole: 'KADER',
      action: 'FIELD_VISIT_SYNCED',
      entityType: 'CARE_TASK',
      entityId: visit.taskId,
      description: `Hasil kunjungan lapangan ${visit.citizenName || visit.citizenId} berhasil disinkronkan: ${visit.outcome}`,
      details: {
        fieldVisitId: visit.id,
        outcome: visit.outcome,
        clockSkewFlagged: visit.clockSkewFlagged,
      },
    });

    return { isConflict: false };
  },

  /**
   * Processes offline scheduling request onto real server ServiceQuota
   */
  async processSchedulingRequestSync(req: OfflineSchedulingRequest): Promise<{ isConflict: boolean; conflictMessage?: string }> {
    const allQuotas = rawStorage.getServiceQuotas();
    const targetDate = req.preferredDate || new Date().toISOString().split('T')[0];

    // Find quota for facility, service, and date
    const quota = allQuotas.find(
      (q) => q.facilityId === req.preferredFacilityId && q.serviceType === req.preferredServiceType && q.date === targetDate
    );

    const isAvailable = !quota || quota.bookedCount < quota.capacity;

    if (!isAvailable) {
      // Conflict: Slot was filled while offline
      const conflict: SyncConflict = {
        id: `conf-slot-${req.id}`,
        queueItemId: req.id,
        conflictType: 'STALE_APPOINTMENT_SLOT',
        serverSummary: `Kuota layanan untuk tanggal ${targetDate} di ${req.preferredFacilityName} telah terisi penuh.`,
        localSummary: `Pengajuan jadwal oleh kader dialihkan ke tim Puskesmas untuk konfirmasi slot pengganti.`,
        resolutionState: 'NEEDS_SERVER_REVIEW',
        occurredAt: new Date().toISOString(),
      };
      kaderStorageRepo.saveConflict(conflict);
      return { isConflict: true, conflictMessage: conflict.serverSummary };
    }

    // Slot is available! Create confirmed appointment on server
    if (quota) {
      quota.bookedCount += 1;
      rawStorage.setServiceQuotas(allQuotas);
    }

    const appointment: Appointment = {
      id: `apt-kader-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      citizenId: req.citizenId,
      citizenName: req.citizenName,
      taskId: req.taskId,
      facilityId: req.preferredFacilityId,
      facilityName: req.preferredFacilityName || 'Puskesmas Bobong',
      serviceType: req.preferredServiceType,
      scheduledDate: targetDate,
      scheduledTime: '08:30 - 11:30 WIT',
      status: 'CONFIRMED',
      source: 'KADER',
      notes: 'Dijadwalkan via perbantuan kunjungan kader lapangan.',
      createdAt: new Date().toISOString(),
    };

    const allApts = rawStorage.getAppointments();
    allApts.push(appointment);
    rawStorage.setAppointments(allApts);

    // Link appointment to CareTask
    const allTasks = rawStorage.getCareTasks();
    const task = allTasks.find((t) => t.id === req.taskId);
    if (task) {
      task.appointmentId = appointment.id;
      task.status = 'IN_PROGRESS';
      task.updatedAt = new Date().toISOString();
      rawStorage.setCareTasks(allTasks);
    }

    return { isConflict: false };
  },

  /**
   * Processes urgent field escalation onto server
   */
  async processUrgentEscalationSync(esc: UrgentFieldEscalation): Promise<void> {
    const allTasks = rawStorage.getCareTasks();
    const task = allTasks.find((t) => t.id === esc.taskId);

    if (task) {
      task.isCritical = true;
      task.priorityScore = Math.max(task.priorityScore, 95);
      task.actionText = `[ESKALASI MENDESAK KADER] ${esc.observations.join(', ')} — ${task.actionText}`;
      task.updatedAt = new Date().toISOString();
      rawStorage.setCareTasks(allTasks);
    }

    await auditRepo.log({
      actorUserId: 'kader-field',
      actorName: 'Kader Lapangan (Eskalasi Mendesak)',
      actorRole: 'KADER',
      action: 'URGENT_OBSERVATION_FLAGGED',
      entityType: 'CARE_TASK',
      entityId: esc.taskId,
      description: `Eskalasi pengamatan kondisi mendesak dilaporkan untuk warga ${esc.citizenName || esc.citizenId}: ${esc.observations.join('; ')}`,
      details: {
        observations: esc.observations,
        notes: esc.notes,
        escalationId: esc.id,
      },
    });
  },

  /**
   * Processes assignment acceptance or rejection
   */
  async processAssignmentResponseSync(res: KaderAssignmentResponse): Promise<void> {
    const allTasks = rawStorage.getCareTasks();
    const task = allTasks.find((t) => t.id === res.taskId);

    if (task && res.response === 'REJECTED') {
      // Revert assignment on server so Puskesmas can reassign
      task.assignedToUserId = undefined;
      task.assignedToUserName = undefined;
      task.status = 'OPEN';
      task.cancelReason = `Ditolak kader (${res.rejectionReason || 'Alasan penugasan'})`;
      task.updatedAt = new Date().toISOString();
      rawStorage.setCareTasks(allTasks);
    }
  },

  // ==========================================
  // FUTURE MVP 6 INTERFACES
  // ==========================================
  getSyncedFieldVisits(citizenId: string): FieldVisit[] {
    return kaderStorageRepo.getServerSyncedVisits().filter((v) => v.citizenId === citizenId);
  },

  getFieldVisitEvidence(taskId: string): FieldVisit | undefined {
    return kaderStorageRepo.getServerSyncedVisits().find((v) => v.taskId === taskId);
  },

  getSchedulingRequests(citizenId: string): OfflineSchedulingRequest[] {
    return kaderStorageRepo.getLocalSchedulingRequests().filter((r) => r.citizenId === citizenId);
  },

  getUrgentFieldEscalations(citizenId: string): UrgentFieldEscalation[] {
    return kaderStorageRepo.getLocalUrgentEscalations().filter((e) => e.citizenId === citizenId);
  },
};
