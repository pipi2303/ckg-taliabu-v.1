import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { auditRepo } from '../repositories/auditRepo';
import { monitoringPlanService } from './monitoringPlanService';
import { medicationRunoutService } from './medicationRunoutService';
import { MonitoringCycle, User, CareTask } from '../types';

export const monitoringCycleService = {
  /**
   * Starts Cycle #1 when a TreatmentPlan or ClinicalEncounter is finalized in MVP 6
   */
  async startInitialCycleFromEncounter(
    encounterId: string,
    initiatorUser: User
  ): Promise<{ cycle: MonitoringCycle; task: CareTask }> {
    const encounter = await clinicalRepo.getEncounterById(encounterId);
    if (!encounter) {
      throw new Error(`Encounter ${encounterId} not found.`);
    }

    const citizen = await citizenRepo.getById(encounter.citizenId);

    // 1. Check if an active cycle already exists
    const existingActive = await monitoringCycleRepo.getActiveCycleByCitizen(encounter.citizenId);
    if (existingActive) {
      // Return existing without duplicating
      const existingTask = existingActive.taskId ? await careTaskRepo.getById(existingActive.taskId) : null;
      return { cycle: existingActive, task: existingTask! };
    }

    // 2. Plan condition-specific parameters & interval
    const plan = monitoringPlanService.getPlanForCondition(encounter.primaryDiagnosis, encounter);
    const plannedDate = encounter.nextControlDate || monitoringPlanService.calculatePlannedDate(new Date(encounter.encounterDate), plan.defaultIntervalDays);

    // 3. Compute runout estimate
    const runoutEstimate = medicationRunoutService.calculateRunoutEstimate(
      encounter.encounterDate,
      encounter.prescriptions || []
    );

    // 4. Create CareTask for Monitoring Control
    const task = await careTaskRepo.create({
      citizenId: encounter.citizenId,
      citizenName: encounter.citizenName,
      facilityId: encounter.facilityId,
      facilityName: encounter.facilityName,
      taskType: 'MONITORING_CONTROL',
      priorityScore: 60,
      status: 'OPEN',
      actionText: `Kontrol Siklus 1: ${plan.condition} di ${encounter.facilityName}`,
      completionCriteria: 'Kehadiran kontrol di faskes dan pencatatan rekam medis evaluasi klinis.',
      dueAt: `${plannedDate}T12:00:00Z`,
      escalationLevel: 0,
    });

    // 5. Create MonitoringCycle #1
    const cycle = await monitoringCycleRepo.create({
      citizenId: encounter.citizenId,
      citizenName: encounter.citizenName,
      citizenNik: encounter.citizenNik,
      citizenPhone: encounter.citizenPhone,
      facilityId: encounter.facilityId,
      facilityName: encounter.facilityName,
      villageName: encounter.villageName || citizen?.villageName || 'Desa Bobong',
      condition: plan.condition,
      cycleNumber: 1,
      plannedControlAt: plannedDate,
      intervalSourceRule: plan.intervalSourceRule,
      cycleStatus: 'ACTIVE',
      requiredParameters: plan.requiredParameters,
      encounterId: encounter.id,
      taskId: task.id,
      estimatedRunoutDate: runoutEstimate?.estimatedRunoutDate,
      notes: `Inisiasi Siklus 1 pemantauan kondisi ${plan.condition}. ${plan.clinicalGuidanceNote}`,
    });

    // 6. Audit Event
    await auditRepo.log({
      action: 'CREATE',
      entityType: 'CARE_TASK',
      entityId: cycle.id,
      targetLabel: `Pembuatan Siklus Monitoring #1 (${encounter.citizenName})`,
      details: {
        condition: plan.condition,
        plannedControlAt: plannedDate,
        intervalRule: plan.intervalSourceRule,
      },
      userId: initiatorUser.id,
      userName: initiatorUser.name,
    });

    return { cycle, task };
  },

  /**
   * Advances to next sequential cycle (Cycle 2, Cycle 3, etc.)
   * Invariant: Never extends Cycle 1 infinitely or resets cycle numbering on transfer/lapse.
   */
  async advanceToNextCycle(
    currentCycleId: string,
    initiatorUser: User,
    customIntervalDays?: number
  ): Promise<{ newCycle: MonitoringCycle; task: CareTask }> {
    const currentCycle = await monitoringCycleRepo.getById(currentCycleId);
    if (!currentCycle) {
      throw new Error(`Current cycle ${currentCycleId} not found.`);
    }

    // Mark current cycle as completed
    await monitoringCycleRepo.updateStatus(currentCycleId, 'COMPLETED', 'Siklus selesai dievaluasi.');

    const nextCycleNumber = currentCycle.cycleNumber + 1;
    const intervalDays = customIntervalDays || 30;
    const baseDate = currentCycle.actualControlAt ? new Date(currentCycle.actualControlAt) : new Date();
    const nextPlannedDate = monitoringPlanService.calculatePlannedDate(baseDate, intervalDays);

    // Create next CareTask
    const task = await careTaskRepo.create({
      citizenId: currentCycle.citizenId,
      citizenName: currentCycle.citizenName,
      facilityId: currentCycle.facilityId,
      facilityName: currentCycle.facilityName,
      taskType: 'MONITORING_CONTROL',
      priorityScore: 55,
      status: 'OPEN',
      actionText: `Kontrol Siklus ${nextCycleNumber}: ${currentCycle.condition}`,
      completionCriteria: 'Pemeriksaan kontrol berkala di faskes dan penilaian kepatuhan.',
      dueAt: `${nextPlannedDate}T12:00:00Z`,
      escalationLevel: 0,
    });

    // Create new sequential cycle
    const newCycle = await monitoringCycleRepo.create({
      citizenId: currentCycle.citizenId,
      citizenName: currentCycle.citizenName,
      citizenNik: currentCycle.citizenNik,
      citizenPhone: currentCycle.citizenPhone,
      facilityId: currentCycle.facilityId,
      facilityName: currentCycle.facilityName,
      villageName: currentCycle.villageName,
      condition: currentCycle.condition,
      cycleNumber: nextCycleNumber,
      plannedControlAt: nextPlannedDate,
      intervalSourceRule: `CR-IV-01 (Interval ${intervalDays} Hari Kontrol Rutin Puskesmas)`,
      cycleStatus: 'ACTIVE',
      requiredParameters: currentCycle.requiredParameters,
      taskId: task.id,
      notes: `Siklus ke-${nextCycleNumber} pemantauan longitudinal kondisi ${currentCycle.condition}.`,
    });

    // Audit Event
    await auditRepo.log({
      action: 'CREATE',
      entityType: 'CARE_TASK',
      entityId: newCycle.id,
      targetLabel: `Penerbitan Siklus Lanjutan #${nextCycleNumber} (${currentCycle.citizenName})`,
      details: {
        previousCycleId: currentCycleId,
        nextCycleNumber,
        plannedControlAt: nextPlannedDate,
      },
      userId: initiatorUser.id,
      userName: initiatorUser.name,
    });

    return { newCycle, task };
  },

  /**
   * Transfers cycle responsibility when citizen moves village mid-cycle
   * Invariant: Preserves cycle number and longitudinal history.
   */
  async transferCycleToNewVillage(params: {
    cycleId: string;
    newVillageName: string;
    newFacilityId: string;
    newFacilityName: string;
    operatorUser: User;
  }): Promise<MonitoringCycle> {
    const cycle = await monitoringCycleRepo.getById(params.cycleId);
    if (!cycle) {
      throw new Error(`Monitoring cycle ${params.cycleId} not found.`);
    }

    const previousVillage = cycle.villageName;
    const updated = await monitoringCycleRepo.update(params.cycleId, {
      villageName: params.newVillageName,
      facilityId: params.newFacilityId,
      facilityName: params.newFacilityName,
      transferredFromVillage: `${previousVillage} (${cycle.facilityName})`,
      notes: `Pindahan domisili dari ${previousVillage}. Siklus ke-${cycle.cycleNumber} dilanjutkan di ${params.newFacilityName}.`,
    });

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: cycle.id,
      targetLabel: `Transfer Wilayah Siklus Monitoring (${cycle.citizenName})`,
      details: {
        cycleId: cycle.id,
        fromVillage: previousVillage,
        toVillage: params.newVillageName,
        toFacility: params.newFacilityName,
      },
      userId: params.operatorUser.id,
      userName: params.operatorUser.name,
    });

    return updated;
  },

  /**
   * Marks continuing specialist care at FKRTL (RSUD Bobong)
   */
  async markContinuingFkrtl(cycleId: string, operatorUser: User): Promise<MonitoringCycle> {
    const cycle = await monitoringCycleRepo.getById(cycleId);
    if (!cycle) {
      throw new Error(`Monitoring cycle ${cycleId} not found.`);
    }

    const updated = await monitoringCycleRepo.update(cycleId, {
      isContinuingFkrtl: true,
      cycleStatus: 'ACTIVE',
      notes: 'Perawatan berlanjut di FKRTL (RSUD Bobong). Tidak diklasifikasikan sebagai putus perawatan di FKTP.',
    });

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: cycle.id,
      targetLabel: `Tandai Perawatan Berlanjut di FKRTL (${cycle.citizenName})`,
      details: { cycleId: cycle.id, isContinuingFkrtl: true },
      userId: operatorUser.id,
      userName: operatorUser.name,
    });

    return updated;
  },
};
