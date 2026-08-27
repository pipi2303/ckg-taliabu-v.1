import { UrgentFieldEscalation } from '../types';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';
import { localQueueService } from './localQueueService';

export interface CreateUrgentEscalationParams {
  taskId: string;
  citizenId: string;
  citizenName?: string;
  fieldVisitId?: string;
  observations: string[];
  notes?: string;
  userId: string;
}

export const APPROVED_DANGER_OBSERVATIONS = [
  'Sesak napas berat / napas terengah-engah saat istirahat',
  'Kelemahan atau kelumpuhan mendadak pada satu sisi tubuh / wajah pelo',
  'Nyeri dada hebat menjalar ke punggung/lengan disertai keringat dingin',
  'Penurunan kesadaran mendadak / bicara melantur / mengantuk berat',
  'Kejang berulang atau kekakuan tubuh mendadak',
  'Perdarahan aktif yang tidak kunjung berhenti',
  'Sakit kepala luar biasa hebat disertai muntah menyemprot',
];

export const urgentEscalationService = {
  /**
   * Creates an urgent observation escalation.
   * Observations ONLY — NO clinical diagnosis is made.
   * Enqueued with HIGHEST sync priority.
   */
  escalateUrgent(params: CreateUrgentEscalationParams): UrgentFieldEscalation {
    const deviceState = kaderStorageRepo.getDeviceState();
    const skewMinutes = deviceState.simulatedClockSkewMinutes || 0;
    const now = new Date(Date.now() + skewMinutes * 60 * 1000);

    const escalationId = `urgent-esc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const escalation: UrgentFieldEscalation = {
      id: escalationId,
      taskId: params.taskId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      fieldVisitId: params.fieldVisitId,
      observations: params.observations,
      notes: params.notes || '',
      deviceRecordedAt: now.toISOString(),
      syncPriority: 'HIGHEST',
      syncStatus: 'PENDING',
    };

    kaderStorageRepo.saveLocalUrgentEscalation(escalation);
    localQueueService.enqueue(params.userId, 'URGENT_ESCALATION', escalation, 'HIGHEST');

    return escalation;
  },

  getLocalEscalationForTask(taskId: string): UrgentFieldEscalation | undefined {
    const all = kaderStorageRepo.getLocalUrgentEscalations();
    return all.find((e) => e.taskId === taskId);
  },
};
