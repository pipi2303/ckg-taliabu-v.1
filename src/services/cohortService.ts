import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { outcomeEvaluationRepo } from '../repositories/outcomeEvaluationRepo';
import { adherenceAssessmentRepo } from '../repositories/adherenceAssessmentRepo';
import { ConditionCohortSummary, ControlStatus, ExtendedBarrierCause } from '../types';
import { controlStatusEngine } from './controlStatusEngine';

export interface MonitoringCascadeMetrics {
  totalInTreatment: number;
  activeCycles: number;
  dueThisWeek: number;
  missedControl: number;
  atRiskDropout: number;
  continuingFkrtl: number;
}

export interface OutcomeDistributionMetrics {
  controlledCount: number;
  notControlledCount: number;
  notYetAssessableCount: number;
  evaluationMode: string;
  governanceNotice: string;
}

export const cohortService = {
  /**
   * Summarizes condition cohorts from confirmed monitoring cycles
   */
  async getConditionCohorts(): Promise<ConditionCohortSummary[]> {
    const cycles = await monitoringCycleRepo.getAll();
    const evals = await outcomeEvaluationRepo.getAll();

    // Group cycles by normalized condition name
    const groups = new Map<string, typeof cycles>();
    cycles.forEach((c) => {
      let key = 'Hipertensi (I10)';
      const cond = c.condition.toLowerCase();
      if (cond.includes('hipertensi')) key = 'Hipertensi (I10)';
      else if (cond.includes('diabetes') || cond.includes('dm')) key = 'Diabetes Mellitus (E11)';
      else if (cond.includes('prediabetes') || cond.includes('obesitas')) key = 'Prediabetes & Obesitas';
      else if (cond.includes('ginjal') || cond.includes('pgk')) key = 'Penyakit Ginjal Kronik (N18)';
      else key = c.condition;

      const list = groups.get(key) || [];
      list.push(c);
      groups.set(key, list);
    });

    const now = Date.now();
    const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

    const summaries: ConditionCohortSummary[] = [];

    for (const [condName, condCycles] of groups.entries()) {
      let activeCount = 0;
      let dueThisWeek = 0;
      let missedCount = 0;
      let atRiskCount = 0;
      let notAssessable = 0;
      let controlled = 0;
      let notControlled = 0;
      let totalCyclesNum = 0;
      const cycleDist: Record<number, number> = {};

      for (const c of condCycles) {
        totalCyclesNum += c.cycleNumber;
        cycleDist[c.cycleNumber] = (cycleDist[c.cycleNumber] || 0) + 1;

        if (c.cycleStatus === 'ACTIVE' || c.cycleStatus === 'AWAITING_CONTROL' || c.cycleStatus === 'AWAITING_EVALUATION' || c.cycleStatus === 'AWAITING_MEASUREMENT') {
          activeCount++;
        }

        const plannedTime = new Date(c.plannedControlAt).getTime();
        if (plannedTime >= now && plannedTime <= weekAhead) {
          dueThisWeek++;
        } else if (plannedTime < now && c.cycleStatus !== 'COMPLETED') {
          missedCount++;
        }

        if (c.cycleStatus === 'AT_RISK_DROPOUT' || c.dropoutRiskFlagged) {
          atRiskCount++;
        }

        // Match outcome
        const cycleEval = evals.find((e) => e.cycleId === c.id && !e.supersededById);
        if (cycleEval) {
          if (cycleEval.controlStatus === 'CONTROLLED') controlled++;
          else if (cycleEval.controlStatus === 'NOT_CONTROLLED') notControlled++;
          else notAssessable++;
        } else {
          notAssessable++;
        }
      }

      summaries.push({
        conditionId: condName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        conditionName: condName,
        totalInTreatment: condCycles.length,
        activeMonitoringCount: activeCount,
        dueThisWeekCount: dueThisWeek,
        missedControlCount: missedCount,
        atRiskDropoutCount: atRiskCount,
        notYetAssessableCount: notAssessable,
        controlledCount: controlled,
        notControlledCount: notControlled,
        averageCycleNumber: condCycles.length > 0 ? Number((totalCyclesNum / condCycles.length).toFixed(1)) : 1,
        cyclesDistribution: cycleDist,
      });
    }

    return summaries;
  },

  /**
   * Returns aggregated Monitoring Cascade metrics
   */
  async getMonitoringCascade(): Promise<MonitoringCascadeMetrics> {
    const cycles = await monitoringCycleRepo.getAll();
    const now = Date.now();
    const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

    let active = 0;
    let due = 0;
    let missed = 0;
    let atRisk = 0;
    let continuingFkrtl = 0;

    cycles.forEach((c) => {
      if (c.isContinuingFkrtl) continuingFkrtl++;

      if (
        c.cycleStatus === 'ACTIVE' ||
        c.cycleStatus === 'AWAITING_CONTROL' ||
        c.cycleStatus === 'AWAITING_MEASUREMENT' ||
        c.cycleStatus === 'AWAITING_EVALUATION'
      ) {
        active++;
      }

      const plannedTime = new Date(c.plannedControlAt).getTime();
      if (plannedTime >= now && plannedTime <= weekAhead) {
        due++;
      } else if (plannedTime < now && c.cycleStatus !== 'COMPLETED') {
        missed++;
      }

      if (c.cycleStatus === 'AT_RISK_DROPOUT' || c.dropoutRiskFlagged) {
        atRisk++;
      }
    });

    return {
      totalInTreatment: cycles.length,
      activeCycles: active,
      dueThisWeek: due,
      missedControl: missed,
      atRiskDropout: atRisk,
      continuingFkrtl,
    };
  },

  /**
   * Returns aggregated Outcome Distribution strictly respecting OI-08
   */
  async getOutcomeDistribution(): Promise<OutcomeDistributionMetrics> {
    const evals = await outcomeEvaluationRepo.getAll();
    const activeEvals = evals.filter((e) => !e.supersededById);

    let controlled = 0;
    let notControlled = 0;
    let notAssessable = 0;

    activeEvals.forEach((e) => {
      if (e.controlStatus === 'CONTROLLED') controlled++;
      else if (e.controlStatus === 'NOT_CONTROLLED') notControlled++;
      else notAssessable++;
    });

    const mode = controlStatusEngine.getEvaluationMode();

    return {
      controlledCount: controlled,
      notControlledCount: notControlled,
      notYetAssessableCount: notAssessable,
      evaluationMode: mode,
      governanceNotice:
        mode === 'BLOCKED_OI_08'
          ? 'OI-08: Kriteria numerik CR-OC belum disahkan. Status otomatis terstandar: Belum Dapat Dinilai.'
          : 'CR-OC Aktif.',
    };
  },

  /**
   * Returns aggregated distribution of non-adherence causes
   */
  async getNonAdherenceCauseDistribution(): Promise<Record<ExtendedBarrierCause, number>> {
    const assessments = await adherenceAssessmentRepo.getAll();
    const distribution: Record<string, number> = {};

    assessments.forEach((a) => {
      (a.causes || []).forEach((c) => {
        distribution[c.causeCode] = (distribution[c.causeCode] || 0) + 1;
      });
    });

    return distribution as Record<ExtendedBarrierCause, number>;
  },

  /**
   * Qualification for MVP 9 handoff:
   * Level 3 Impact status must be NOT_ASSESSABLE while OI-08 is open (never faked 0% or N/A numeric).
   */
  getOutcomeQualification(): {
    impactIndexLevel3Status: 'NOT_ASSESSABLE' | 'CALCULATED';
    reason: string;
  } {
    const mode = controlStatusEngine.getEvaluationMode();
    if (mode === 'BLOCKED_OI_08') {
      return {
        impactIndexLevel3Status: 'NOT_ASSESSABLE',
        reason: 'OI-08: CR-OC numeric threshold is unratified in the active clinical rule package.',
      };
    }
    return {
      impactIndexLevel3Status: 'CALCULATED',
      reason: 'CR-OC ratified.',
    };
  },
};
