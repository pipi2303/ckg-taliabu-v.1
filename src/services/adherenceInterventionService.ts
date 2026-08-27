import { careTaskRepo } from '../repositories/careTaskRepo';
import { NonAdherenceCause, CareTask, User } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const adherenceInterventionService = {
  /**
   * Deterministically routes identified causes to appropriate care tasks idempotently
   */
  async routeCausesToInterventions(params: {
    citizenId: string;
    citizenName: string;
    facilityId: string;
    facilityName: string;
    cycleId: string;
    causes: NonAdherenceCause[];
    assessorUser?: User;
  }): Promise<{ createdTasks: CareTask[]; notes: string[] }> {
    const createdTasks: CareTask[] = [];
    const notes: string[] = [];

    // Get active tasks for citizen to ensure idempotency
    const existingTasks = await careTaskRepo.getByCitizenId(params.citizenId);
    const activeTasks = existingTasks.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');

    const categories = new Set(params.causes.map((c) => c.suggestedInterventionCategory));

    // 1. Route CLINICAL Causes (Side Effects, Dose Confusion) -> Clinical Review CareTask
    if (categories.has('CLINICAL')) {
      const hasActiveClinical = activeTasks.some((t) => t.taskType === 'CLINICAL_CONFIRMATION' || t.taskType === 'MONITORING_CONTROL');
      if (!hasActiveClinical) {
        const sideEffects = params.causes
           .filter((c) => c.suggestedInterventionCategory === 'CLINICAL')
           .map((c) => c.causeLabel)
           .join(', ');

        const task = await careTaskRepo.create({
          citizenId: params.citizenId,
          citizenName: params.citizenName,
          facilityId: params.facilityId,
          facilityName: params.facilityName,
          taskType: 'CLINICAL_CONFIRMATION',
          priorityScore: 75,
          status: 'OPEN',
          actionText: `Telaah Klinis Dokter: ${sideEffects}. Evaluasi toleransi terapi & kepatuhan.`,
          completionCriteria: 'Pemeriksaan langsung oleh Dokter Puskesmas dan catatan re-evaluasi terapi.',
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 0,
        });
        createdTasks.push(task);
        notes.push(`Dibuat task Telaah Klinis Dokter (Prioritas Tinggi) untuk keluhan: ${sideEffects}`);
      } else {
        notes.push('Task telaah klinis aktif sudah tersedia, tidak diduplikasi (Idempotensi).');
      }
    }

    // 2. Route SYSTEM_SUPPLY Causes (Medication Unavailable) -> Medication Resupply Task
    if (categories.has('SYSTEM_SUPPLY')) {
      const hasActiveSupply = activeTasks.some((t) => t.taskType === 'MEDICATION_RESUPPLY' || t.actionText?.includes('Resupply'));
      if (!hasActiveSupply) {
        const task = await careTaskRepo.create({
          citizenId: params.citizenId,
          citizenName: params.citizenName,
          facilityId: params.facilityId,
          facilityName: params.facilityName,
          taskType: 'MEDICATION_RESUPPLY',
          priorityScore: 70,
          status: 'OPEN',
          actionText: 'Koordinasi Resupply Obat Farmasi Puskesmas / Pengiriman Obat ke Poskesdes',
          completionCriteria: 'Obat diserahkan kepada warga atau ketersediaan stok di Pustu dipulihkan.',
          dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 0,
        });
        createdTasks.push(task);
        notes.push('Dibuat task Koordinasi Resupply Obat Farmasi.');
      }
    }

    // 3. Route COMMUNITY Causes (Forgot, Distance) -> Kader Field Support (S2 Ceiling)
    if (categories.has('COMMUNITY')) {
      const hasActiveKader = activeTasks.some((t) => t.taskType === 'FIELD_VISIT' || t.taskType === 'ADHERENCE_SUPPORT' || t.taskType === 'OUTREACH_CONTACT');
      if (!hasActiveKader) {
        const task = await careTaskRepo.create({
          citizenId: params.citizenId,
          citizenName: params.citizenName,
          facilityId: params.facilityId,
          facilityName: params.facilityName,
          taskType: 'ADHERENCE_SUPPORT',
          priorityScore: 60,
          status: 'OPEN',
          actionText: 'Kunjungan Kader: Ingatkan jadwal kontrol dan dukung kepatuhan perawatan Puskesmas.',
          completionCriteria: 'Kader mengunjungi warga dan mencatat konfirmasi kehadiran kontrol.',
          dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 0,
        });
        createdTasks.push(task);
        notes.push('Dibuat task Pendampingan Lapangan Kader (S2 Operational Ceiling).');
      }
    }

    return { createdTasks, notes };
  },
};
