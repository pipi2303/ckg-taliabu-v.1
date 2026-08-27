import { CareTask, NextBestAction, RiskClassification, TaskStatus, TaskType } from '../types';
import { rawStorage } from '../repositories/storage';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { auditRepo } from '../repositories/auditRepo';

export interface OrchestrationGapItem {
  citizenId: string;
  citizenName: string;
  villageName?: string;
  facilityName?: string;
  riskCategory: string;
  isCritical: boolean;
  priorityScore: number;
  gapReason: string;
  screeningDate: string;
}

export const careTaskService = {
  /**
   * Generates CareTasks from MVP 3 NextBestActions for a citizen idempotently.
   */
  async generateTasksForCitizen(
    citizenId: string,
    actor: { id: string; name: string }
  ): Promise<{ created: CareTask[]; reconciled: CareTask[] }> {
    const classifications = rawStorage
      .getRiskClassifications()
      .filter((c) => c.citizenId === citizenId && !c.supersededById);

    if (classifications.length === 0) {
      return { created: [], reconciled: [] };
    }

    const classification = classifications[0];
    const citizens = rawStorage.getCitizens();
    const citizen = citizens.find((c) => c.id === citizenId);
    if (!citizen || citizen.vitalStatus === 'DECEASED' || citizen.mergedIntoId) {
      return { created: [], reconciled: [] };
    }

    const nbas = classification.nextBestActions || [];
    const activeExistingTasks = rawStorage
      .getCareTasks()
      .filter((t) => t.citizenId === citizenId && (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'));

    const createdTasks: CareTask[] = [];
    const reconciledTasks: CareTask[] = [];

    for (const nba of nbas) {
      // Hard Rule 11: Do NOT generate CareTask when NBA is BLOCKED_OPEN_RULE or source rule is still open
      if (nba.status === 'BLOCKED_OPEN_RULE') {
        continue;
      }

      const taskType = this.mapNbaActionType(nba.actionType);
      
      // Calculate Due Date from screeningDate + CRS interval
      const baseDateStr = classification.screeningDate || citizen.createdAt || new Date().toISOString();
      const baseDate = new Date(baseDateStr);
      let intervalDays = 7; // default 7 days

      if (nba.intervalValue) {
        if (nba.intervalUnit === 'MONTH') {
          intervalDays = nba.intervalValue * 30;
        } else {
          intervalDays = nba.intervalValue;
        }
      } else if (classification.isCritical) {
        intervalDays = 1; // Immediate emergency action within 24h
      }

      const dueDate = new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      let dueShiftedReason: string | undefined;

      // Check if dueDate lands on Sunday (0) or Saturday (6) -> shift to Monday
      if (dueDate.getDay() === 0) {
        dueDate.setDate(dueDate.getDate() + 1);
        dueShiftedReason = 'Hari Minggu (disesuaikan ke hari kerja berikutnya)';
      } else if (dueDate.getDay() === 6) {
        dueDate.setDate(dueDate.getDate() + 2);
        dueShiftedReason = 'Hari Sabtu (disesuaikan ke hari kerja berikutnya)';
      }

      // Check Idempotency: Is there already an active task for this source rule / action?
      const existing = activeExistingTasks.find(
        (t) => t.sourceRuleCode === nba.sourceRuleCode && t.taskType === taskType
      );

      if (existing) {
        // Reconcile / update existing task without duplicating
        const updated = await careTaskRepo.update(existing.id, {
          priorityScore: classification.priorityScore,
          isCritical: classification.isCritical,
          riskCategory: classification.finalCategory,
          classificationId: classification.id,
          ruleVersion: nba.ruleVersion,
        });
        reconciledTasks.push(updated);
      } else {
        // Create new CareTask
        const newTask = await careTaskRepo.create({
          citizenId,
          citizenName: citizen.fullName,
          citizenNik: citizen.phonePrimary ? citizen.phonePrimary : citizen.addressText,
          citizenPhone: citizen.phonePrimary,
          villageId: citizen.villageId,
          villageName: citizen.villageName,
          facilityId: citizen.facilityId,
          facilityName: citizen.facilityName,
          classificationId: classification.id,
          riskCategory: classification.finalCategory,
          isCritical: classification.isCritical,
          priorityScore: classification.priorityScore,
          taskType,
          actionText: nba.actionText,
          sourceRuleCode: nba.sourceRuleCode,
          ruleVersion: nba.ruleVersion,
          suggestedRole: nba.suggestedRole,
          dueAt: dueDate.toISOString(),
          dueShiftedReason,
          completionCriteria: this.getDefaultCompletionCriteria(taskType),
          status: 'OPEN',
          escalationLevel: classification.isCritical ? 1 : 0,
          nbaId: nba.id,
        });
        createdTasks.push(newTask);
      }
    }

    if (createdTasks.length > 0) {
      await auditRepo.log({
        action: 'CREATE',
        entityType: 'CARE_TASK',
        entityId: citizenId,
        details: {
          action: 'ORCHESTRATE_CARE_TASKS',
          tasksCreated: createdTasks.length,
          classificationId: classification.id,
        },
        userId: actor.id,
        userName: actor.name,
      });
    }

    return { created: createdTasks, reconciled: reconciledTasks };
  },

  /**
   * Invariant Check: Every ORANGE+ or Critical citizen must have an active CareTask OR valid human terminal status.
   */
  async checkOrchestrationGaps(facilityId?: string): Promise<OrchestrationGapItem[]> {
    const classifications = rawStorage
      .getRiskClassifications()
      .filter((c) => !c.supersededById);
    const citizens = rawStorage.getCitizens().filter((c) => !c.mergedIntoId && c.vitalStatus !== 'DECEASED');
    const careTasks = rawStorage.getCareTasks();
    const dropouts = rawStorage.getDropoutCandidates();

    const gaps: OrchestrationGapItem[] = [];

    for (const c of classifications) {
      if (facilityId && c.facilityId !== facilityId) continue;

      const isOrangePlus =
        c.finalCategory === 'ORANGE' || c.finalCategory === 'RED' || c.finalCategory === 'DARK_RED' || c.isCritical;

      if (!isOrangePlus) continue;

      // Check if citizen has active CareTask
      const hasActiveTask = careTasks.some(
        (t) =>
          t.citizenId === c.citizenId &&
          (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
      );

      // Check if citizen has terminal cascade status
      const terminalDropout = dropouts.find(
        (d) =>
          d.citizenId === c.citizenId &&
          (d.cascadeStatus === 'LOST_TO_FOLLOWUP' ||
            d.cascadeStatus === 'REFUSED' ||
            d.cascadeStatus === 'MOVED' ||
            d.cascadeStatus === 'DECEASED')
      );

      if (!hasActiveTask && !terminalDropout) {
        const citizen = citizens.find((cz) => cz.id === c.citizenId);
        gaps.push({
          citizenId: c.citizenId,
          citizenName: c.citizenName || citizen?.fullName || 'Warga CKG',
          villageName: c.villageName || citizen?.villageName,
          facilityName: c.facilityName || citizen?.facilityName,
          riskCategory: c.finalCategory,
          isCritical: c.isCritical,
          priorityScore: c.priorityScore,
          gapReason: c.isCritical
            ? 'Temuan Kritis tanpa Tugas Aktif (Perlu Penugasan Segera)'
            : 'Risiko Oranye/Merah tanpa Tugas Intervensi Aktif',
          screeningDate: c.screeningDate || c.createdAt,
        });
      }
    }

    return gaps;
  },

  mapNbaActionType(actionType: string): TaskType {
    const norm = (actionType || '').toUpperCase();
    if (norm.includes('RUJUK') || norm.includes('REFERRAL')) return 'REFERRAL_CHASE';
    if (norm.includes('KONFIRMASI') || norm.includes('CONFIRM')) return 'CLINICAL_CONFIRMATION';
    if (norm.includes('JADWAL') || norm.includes('VISIT') || norm.includes('KUNJUNGAN')) return 'SCHEDULE_VISIT';
    if (norm.includes('KADER') || norm.includes('RUMAH') || norm.includes('FIELD')) return 'FIELD_VISIT';
    if (norm.includes('OBAT') || norm.includes('TREATMENT')) return 'TREATMENT_INITIATION';
    if (norm.includes('KONTROL') || norm.includes('MONITOR')) return 'MONITORING_CONTROL';
    if (norm.includes('KONSELING') || norm.includes('GIZI') || norm.includes('EDUKASI')) return 'UKM_COUNSELING';
    return 'OUTREACH_CONTACT';
  },

  getDefaultCompletionCriteria(taskType: TaskType): string {
    switch (taskType) {
      case 'CLINICAL_CONFIRMATION':
        return 'Pemeriksaan klinis konfirmasi atau hasil laboratorium terverifikasi di FPKTP/FKRTL';
      case 'SCHEDULE_VISIT':
        return 'Terbentuknya janji temu terjadwal atau kehadiran terkonfirmasi';
      case 'FIELD_VISIT':
        return 'Laporan pendampingan kader dan konfirmasi rencana kunjungan warga';
      case 'TREATMENT_INITIATION':
        return 'Inisiasi rencana pengobatan terdaftar dalam rekam medis faskes';
      case 'REFERRAL_CHASE':
        return 'Surat rujukan FKRTL dan konfirmasi kehadiran di RSUD terbit';
      case 'OUTREACH_CONTACT':
      default:
        return 'Respon kontak warga tercatat (bersedia hadir/menunda/menolak berdasar alasan terverifikasi)';
    }
  },
};
