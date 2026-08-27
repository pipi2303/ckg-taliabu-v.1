import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { auditRepo } from '../repositories/auditRepo';
import { MonitoringCycle, CareTask, User } from '../types';

export interface DropoutRiskAssessment {
  cycleId: string;
  citizenId: string;
  citizenName: string;
  facilityName: string;
  condition: string;
  plannedControlAt: string;
  daysOverdue: number;
  estimatedRunoutDate?: string;
  isRunoutPassed: boolean;
  isAtRisk: boolean;
  recommendedPriorityScore: number;
  reason: string;
}

export const dropoutMonitoringService = {
  /**
   * Scans active monitoring cycles for dropout risk (> 14 days overdue or runout passed)
   */
  async scanCyclesForDropoutRisk(): Promise<DropoutRiskAssessment[]> {
    const cycles = await monitoringCycleRepo.getAll();
    const activeCycles = cycles.filter(
      (c) =>
        c.cycleStatus === 'ACTIVE' ||
        c.cycleStatus === 'AWAITING_CONTROL' ||
        c.cycleStatus === 'AT_RISK_DROPOUT'
    );

    const now = Date.now();
    const results: DropoutRiskAssessment[] = [];

    for (const c of activeCycles) {
      const plannedTime = new Date(c.plannedControlAt).getTime();
      const daysOverdue = Math.max(0, Math.floor((now - plannedTime) / (24 * 60 * 60 * 1000)));

      let isRunoutPassed = false;
      if (c.estimatedRunoutDate) {
        const runoutTime = new Date(c.estimatedRunoutDate).getTime();
        isRunoutPassed = now > runoutTime;
      }

      const isAtRisk = daysOverdue >= 14 || (daysOverdue >= 7 && isRunoutPassed);

      if (isAtRisk) {
        // Calculate heightened priority score for on-treatment dropout vs never-started citizen
        let priority = 70 + Math.min(25, daysOverdue * 2);
        if (isRunoutPassed) priority += 10;

        results.push({
          cycleId: c.id,
          citizenId: c.citizenId,
          citizenName: c.citizenName,
          facilityName: c.facilityName,
          condition: c.condition,
          plannedControlAt: c.plannedControlAt,
          daysOverdue,
          estimatedRunoutDate: c.estimatedRunoutDate,
          isRunoutPassed,
          isAtRisk,
          recommendedPriorityScore: Math.min(100, priority),
          reason: `Jadwal kontrol terlewat ${daysOverdue} hari.${
            isRunoutPassed ? ' Estimasi perbekalan obat telah habis.' : ''
          }`,
        });
      }
    }

    return results;
  },

  /**
   * Flags a cycle as AT_RISK_DROPOUT and creates an outreach re-engagement task in MVP 4.
   * Invariant: Never automatically assigns LOST_TO_FOLLOWUP (human decision only).
   */
  async flagDropoutAndCreateOutreach(
    cycleId: string,
    operatorUser: User
  ): Promise<{ cycle: MonitoringCycle; outreachTask: CareTask }> {
    const cycle = await monitoringCycleRepo.getById(cycleId);
    if (!cycle) {
      throw new Error(`Monitoring cycle ${cycleId} not found.`);
    }

    const updatedCycle = await monitoringCycleRepo.update(cycleId, {
      cycleStatus: 'AT_RISK_DROPOUT',
      dropoutRiskFlagged: true,
      notes: 'Terdeteksi risiko putus perawatan (terlewat kontrol). Dialirkan ke kaskade penjangkauan ulang antrean tugas.',
    });

    // Create high priority outreach task
    const outreachTask = await careTaskRepo.create({
      citizenId: cycle.citizenId,
      citizenName: cycle.citizenName,
      facilityId: cycle.facilityId,
      facilityName: cycle.facilityName,
      taskType: 'OUTREACH_CONTACT',
      priorityScore: 85,
      status: 'OPEN',
      actionText: `Penjangkauan Re-engagement Pasien Dalam Perawatan: ${cycle.condition} (Kontrol Terlewat)`,
      completionCriteria: 'Pasien berhasil dikontak dan menyepakati jadwal kontrol baru atau kunjungan kader.',
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 1,
    });

    // Audit Event
    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: cycle.id,
      targetLabel: `Flag Risiko Putus Perawatan (${cycle.citizenName})`,
      details: {
        cycleId: cycle.id,
        newStatus: 'AT_RISK_DROPOUT',
        outreachTaskId: outreachTask.id,
      },
      userId: operatorUser.id,
      userName: operatorUser.name,
    });

    return { cycle: updatedCycle, outreachTask };
  },
};
