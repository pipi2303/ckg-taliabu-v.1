import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { adherenceAssessmentRepo } from '../repositories/adherenceAssessmentRepo';
import { outcomeEvaluationRepo } from '../repositories/outcomeEvaluationRepo';
import { OutcomeTrendPoint, AdherenceLevel, ControlStatus } from '../types';

export interface CitizenOutcomeTrendProfile {
  citizenId: string;
  citizenName: string;
  condition: string;
  totalCyclesCount: number;
  hasEnoughDataForTrend: boolean;
  trendNotice: string;
  points: OutcomeTrendPoint[];
}

export const outcomeTrendService = {
  /**
   * Builds longitudinal multi-cycle trend points with interventions alongside
   */
  async getCitizenTrendProfile(citizenId: string): Promise<CitizenOutcomeTrendProfile> {
    const [cycles, encounters, assessments, evals] = await Promise.all([
      monitoringCycleRepo.getByCitizenId(citizenId),
      clinicalRepo.getEncountersByCitizenId(citizenId),
      adherenceAssessmentRepo.getByCitizenId(citizenId),
      outcomeEvaluationRepo.getByCitizenId(citizenId),
    ]);

    if (cycles.length === 0) {
      return {
        citizenId,
        citizenName: encounters[0]?.citizenName || 'Warga',
        condition: encounters[0]?.primaryDiagnosis?.name || 'Kondisi Kronis',
        totalCyclesCount: 0,
        hasEnoughDataForTrend: false,
        trendNotice: 'Belum ada siklus pemantauan yang tercatat.',
        points: [],
      };
    }

    // Sort cycles chronologically (Cycle 1, 2, 3...)
    const sortedCycles = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber);
    const citizenName = sortedCycles[0].citizenName;
    const condition = sortedCycles[0].condition;

    const points: OutcomeTrendPoint[] = [];

    for (const c of sortedCycles) {
      const enc = encounters.find((e) => e.id === c.encounterId || e.taskId === c.taskId);
      const adh = assessments.find((a) => a.cycleId === c.id);
      const evalItem = evals.find((e) => e.cycleId === c.id && !e.supersededById);

      const causesText = adh?.causes?.map((cause) => cause.causeLabel).join(', ');
      const interventions = causesText
        ? `Kendala: ${causesText}`
        : adh?.notes || 'Edukasi rutin';

      const rxText = enc?.prescriptions?.map((p) => `${p.drugName} ${p.dosage}`).join(', ');

      points.push({
        cycleNumber: c.cycleNumber,
        cycleDate: c.actualControlAt || c.plannedControlAt,
        encounterDate: enc?.encounterDate,
        systolicBp: enc?.systolicBp,
        diastolicBp: enc?.diastolicBp,
        bloodGlucose: enc?.fastingBloodGlucose || enc?.randomBloodGlucose,
        adherenceLevel: (adh?.adherenceLevel as AdherenceLevel) || 'NOT_ASSESSABLE',
        interventionSummary: interventions,
        treatmentAdjustmentSummary: rxText || 'Regimen tetap / Modifikasi gaya hidup',
        controlStatus: (evalItem?.controlStatus as ControlStatus) || 'NOT_YET_ASSESSABLE',
        isManual: evalItem?.isManualDetermination || false,
        missedVisit: c.cycleStatus === 'AT_RISK_DROPOUT',
      });
    }

    const measuredPointsCount = points.filter((p) => p.systolicBp || p.bloodGlucose).length;
    const hasEnoughData = measuredPointsCount >= 2;

    return {
      citizenId,
      citizenName,
      condition,
      totalCyclesCount: cycles.length,
      hasEnoughDataForTrend: hasEnoughData,
      trendNotice: hasEnoughData
        ? `Menampilkan tren klinis longitudinal dari ${measuredPointsCount} kali pemeriksaan kontrol.`
        : 'Data belum cukup untuk melihat tren klinis (membutuhkan minimal 2 siklus dengan pengukuran terkonfirmasi).',
      points,
    };
  },
};
