import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { MonitoringGapItem, MonitoringCycle } from '../types';

export interface IntegrityAuditReport {
  totalOnTreatmentCitizens: number;
  activeCycleCount: number;
  outreachReengagementCount: number;
  fkrtlContinuingCount: number;
  terminalCount: number;
  gapCount: number;
  gaps: MonitoringGapItem[];
  overlappingCycleAlerts: Array<{
    citizenId: string;
    citizenName: string;
    cycleIds: string[];
    notice: string;
  }>;
}

export const monitoringIntegrityService = {
  /**
   * Performs systematic audit across all clinical encounters and monitoring cycles.
   * Target Gap Count = 0.
   */
  async checkIntegrity(): Promise<IntegrityAuditReport> {
    const [allCitizens, allCycles, allEncounters, allTasks] = await Promise.all([
      citizenRepo.getAll(),
      monitoringCycleRepo.getAll(),
      clinicalRepo.getAllEncounters(),
      careTaskRepo.getAll(),
    ]);

    // Find citizens who have received treatment / diagnosed in MVP 6
    const treatedCitizenIds = new Set<string>();
    allEncounters.forEach((enc) => {
      if (
        enc.resolutionOutcome === 'CONFIRMED_CONTROLLED' ||
        enc.resolutionOutcome === 'CONFIRMED_THERAPY_INITIATED' ||
        (enc.prescriptions && enc.prescriptions.length > 0)
      ) {
        treatedCitizenIds.add(enc.citizenId);
      }
    });

    // Also include citizens with existing monitoring cycles
    allCycles.forEach((c) => treatedCitizenIds.add(c.citizenId));

    const gaps: MonitoringGapItem[] = [];
    const overlappingAlerts: IntegrityAuditReport['overlappingCycleAlerts'] = [];

    // Group cycles by citizen
    const cyclesByCitizen = new Map<string, MonitoringCycle[]>();
    allCycles.forEach((c) => {
      const list = cyclesByCitizen.get(c.citizenId) || [];
      list.push(c);
      cyclesByCitizen.set(c.citizenId, list);
    });

    let activeCycleCount = 0;
    let outreachReengagementCount = 0;
    let fkrtlContinuingCount = 0;
    let terminalCount = 0;

    for (const citizenId of treatedCitizenIds) {
      const citizen = allCitizens.find((c) => c.id === citizenId);
      if (!citizen) continue;

      const citizenCycles = cyclesByCitizen.get(citizenId) || [];
      const activeCycles = citizenCycles.filter(
        (c) =>
          c.cycleStatus === 'ACTIVE' ||
          c.cycleStatus === 'AWAITING_CONTROL' ||
          c.cycleStatus === 'AWAITING_MEASUREMENT' ||
          c.cycleStatus === 'AWAITING_EVALUATION' ||
          c.cycleStatus === 'PLANNED'
      );

      // Check for overlapping cycles
      if (activeCycles.length > 1) {
        overlappingAlerts.push({
          citizenId,
          citizenName: citizen.fullName,
          cycleIds: activeCycles.map((c) => c.id),
          notice: `Terdeteksi ${activeCycles.length} siklus aktif bersamaan untuk kondisi yang sama. Perlu rekonsiliasi penggabungan siklus.`,
        });
      }

      const activeTasks = allTasks.filter(
        (t) =>
          t.citizenId === citizenId &&
          (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
      );

      const hasActiveCycle = activeCycles.length > 0;
      const isFkrtlCare = citizenCycles.some((c) => c.isContinuingFkrtl);
      const isTerminal = citizenCycles.some((c) => c.cycleStatus === 'COMPLETED' && !hasActiveCycle);
      const hasActiveOutreach = activeTasks.some((t) => t.taskType === 'OUTREACH_CONTACT' || t.taskType === 'FIELD_VISIT' || t.taskType === 'ADHERENCE_SUPPORT');

      if (hasActiveCycle) {
        activeCycleCount++;
      } else if (isFkrtlCare) {
        fkrtlContinuingCount++;
      } else if (hasActiveOutreach) {
        outreachReengagementCount++;
      } else if (isTerminal) {
        terminalCount++;
      } else {
        // GAP DETECTED!
        const lastCycle = citizenCycles[0];
        gaps.push({
          citizenId,
          citizenName: citizen.fullName,
          citizenNik: (citizen as any).nikPrimary || (citizen as any).nik || citizen.id,
          facilityId: citizen.facilityId || 'fac-001',
          facilityName: citizen.facilityName || 'Puskesmas Bobong',
          villageName: citizen.villageName || '-',
          lastClinicalEvent: lastCycle ? `Siklus ${lastCycle.cycleNumber} (${lastCycle.plannedControlAt})` : 'Inisiasi Terapi FKTP',
          lastCycleNumber: lastCycle?.cycleNumber,
          currentStatus: 'TERPUTUS / PERLU SIKLUS BARU',
          gapReason: 'Siklus sebelumnya telah berakhir namun belum diterbitkan siklus lanjutan atau task re-engagement.',
          recommendedAction: 'Terbitkan Siklus Monitoring Baru (Cycle + 1) atau Jadwalkan Kontrol Ulang.',
          detectedAt: new Date().toISOString(),
        });
      }
    }

    return {
      totalOnTreatmentCitizens: treatedCitizenIds.size,
      activeCycleCount,
      outreachReengagementCount,
      fkrtlContinuingCount,
      terminalCount,
      gapCount: gaps.length,
      gaps,
      overlappingCycleAlerts: overlappingAlerts,
    };
  },
};
