import { outcomeEvaluationRepo } from '../repositories/outcomeEvaluationRepo';
import { auditRepo } from '../repositories/auditRepo';
import { controlStatusEngine, EvaluationInput } from './controlStatusEngine';
import { OutcomeEvaluation, ControlStatus, User } from '../types';

export const outcomeEvaluationService = {
  async getByCycleId(cycleId: string): Promise<OutcomeEvaluation | null> {
    return outcomeEvaluationRepo.getByCycleId(cycleId);
  },

  async getHistoryByCycleId(cycleId: string): Promise<OutcomeEvaluation[]> {
    return outcomeEvaluationRepo.getHistoryByCycleId(cycleId);
  },

  async getByCitizenId(citizenId: string): Promise<OutcomeEvaluation[]> {
    return outcomeEvaluationRepo.getByCitizenId(citizenId);
  },

  /**
   * Evaluates cycle outcome through the deterministic rule engine (locked under OI-08)
   */
  async evaluateCycleOutcome(params: {
    cycleId: string;
    citizenId: string;
    citizenName: string;
    condition: string;
    currentObservation?: EvaluationInput['currentObservation'];
    comparatorObservation?: EvaluationInput['comparatorObservation'];
    ruleVersion?: string;
  }): Promise<OutcomeEvaluation> {
    const engineResult = controlStatusEngine.evaluate({
      currentObservation: params.currentObservation,
      comparatorObservation: params.comparatorObservation,
      condition: params.condition,
      ruleVersion: params.ruleVersion,
    });

    const evaluation = await outcomeEvaluationRepo.create({
      cycleId: params.cycleId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      controlStatus: engineResult.controlStatus,
      evaluationMode: engineResult.evaluationMode,
      governanceNotice: engineResult.governanceNotice,
      currentObservationId: params.currentObservation?.id,
      currentObservationSummary: params.currentObservation
        ? `${params.currentObservation.label}: ${params.currentObservation.valueSummary} (${params.currentObservation.measuredAt})`
        : undefined,
      comparatorObservationId: params.comparatorObservation?.id,
      comparatorObservationSummary: params.comparatorObservation
        ? `${params.comparatorObservation.label}: ${params.comparatorObservation.valueSummary} (${params.comparatorObservation.measuredAt})`
        : undefined,
      ruleVersion: params.ruleVersion || 'v1.4.0-gov-lock',
      isManualDetermination: false,
      abnormalImprovementFlag: engineResult.abnormalImprovementFlag,
    });

    return evaluation;
  },

  /**
   * Records a manual clinician determination (authorized Doctor only).
   * Strictly enforces: if status is CONTROLLED, comparator observation is mandatory.
   */
  async recordManualClinicianDetermination(params: {
    cycleId: string;
    citizenId: string;
    citizenName: string;
    controlStatus: ControlStatus;
    manualReason: string;
    supportingEvidence: string;
    doctorUser: User;
    currentObservation?: EvaluationInput['currentObservation'];
    comparatorObservation?: EvaluationInput['comparatorObservation'];
  }): Promise<OutcomeEvaluation> {
    // 1. Validation
    const validation = controlStatusEngine.validateManualDetermination({
      status: params.controlStatus,
      hasComparator: Boolean(params.comparatorObservation?.id),
      reason: params.manualReason,
      role: params.doctorUser.roleId,
    });

    if (!validation.valid) {
      throw new Error(validation.error || 'Validasi penetapan manual gagal.');
    }

    const existing = await outcomeEvaluationRepo.getByCycleId(params.cycleId);

    const evaluationData: Omit<OutcomeEvaluation, 'id' | 'createdAt'> = {
      cycleId: params.cycleId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      controlStatus: params.controlStatus,
      evaluationMode: 'BLOCKED_OI_08',
      governanceNotice:
        'PENETAPAN MANUAL TENAGA MEDIS: Hasil evaluasi klinis ditetapkan oleh dokter pemeriksa penanggung jawab berdasarkan bukti komparator longitudinal.',
      currentObservationId: params.currentObservation?.id,
      currentObservationSummary: params.currentObservation
        ? `${params.currentObservation.label}: ${params.currentObservation.valueSummary} (${params.currentObservation.measuredAt})`
        : undefined,
      comparatorObservationId: params.comparatorObservation?.id,
      comparatorObservationSummary: params.comparatorObservation
        ? `${params.comparatorObservation.label}: ${params.comparatorObservation.valueSummary} (${params.comparatorObservation.measuredAt})`
        : undefined,
      ruleVersion: 'v1.4.0-gov-lock',
      isManualDetermination: true,
      determinedManuallyBy: `${params.doctorUser.name} (${params.doctorUser.roleName})`,
      determinedManuallyRole: params.doctorUser.roleId,
      manualReason: params.manualReason,
      supportingEvidence: params.supportingEvidence,
      abnormalImprovementFlag: false,
    };

    let result: OutcomeEvaluation;
    if (existing) {
      result = await outcomeEvaluationRepo.supersede(existing.id, evaluationData);
    } else {
      result = await outcomeEvaluationRepo.create(evaluationData);
    }

    // 2. Audit Event
    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: result.id,
      targetLabel: `Penetapan Manual Status Kontrol (${params.citizenName})`,
      details: {
        cycleId: params.cycleId,
        newStatus: params.controlStatus,
        isManual: true,
        reason: params.manualReason,
        hasComparator: Boolean(params.comparatorObservation?.id),
      },
      userId: params.doctorUser.id,
      userName: params.doctorUser.name,
    });

    return result;
  },
};
