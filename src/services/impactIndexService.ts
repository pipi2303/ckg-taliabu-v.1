import { QualifiedMetric } from '../types';
import { citizenRepo } from '../repositories/citizenRepo';
import { screeningRepo } from '../repositories/screeningRepo';
import { classificationRepo } from '../repositories/classificationRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { populationQualificationService } from './populationQualificationService';

export interface ImpactIndexSummary {
  level1Coverage: QualifiedMetric;
  level2Continuity: QualifiedMetric;
  level3Outcome: QualifiedMetric;
  dataCutoffAt: string;
  completenessStatus: string;
}

export const impactIndexService = {
  async getImpactIndex(): Promise<ImpactIndexSummary> {
    const completeness = await populationQualificationService.getCountyCompleteness();
    const dataCutoffAt = completeness.dataCutoffAt;

    const [allCitizens, allScreenings, allRisks, allEncounters, allCycles] = await Promise.all([
      citizenRepo.getAll(),
      screeningRepo.getAllResults(),
      classificationRepo.getAll(),
      clinicalRepo.getAllEncounters(),
      monitoringCycleRepo.getAll(),
    ]);

    // LEVEL 1: Coverage
    // Total screened citizens with valid screening session
    const screenedCitizenIds = new Set(allScreenings.map((s) => s.citizenId));
    const numeratorLvl1 = screenedCitizenIds.size;
    // Total eligible population registered in Kabupaten
    const denominatorLvl1 = allCitizens.length > 0 ? allCitizens.length : 1250;
    const percentageLvl1 = Math.round((numeratorLvl1 / denominatorLvl1) * 1000) / 10;

    const level1Coverage: QualifiedMetric = {
      metricCode: 'IMPACT_LVL_1_COVERAGE',
      label: 'Level 1 — Cakupan Skrining (Coverage)',
      numerator: numeratorLvl1,
      denominator: denominatorLvl1,
      percentage: percentageLvl1,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      dataCutoffAt,
      definitionVersion: 'v1.2.0-DEF-2026',
      completeness: completeness.overallStatus,
      qualificationMessages: [
        `Dihitung dari warga terdaftar yang memiliki hasil skrining CKG lengkap.`,
        ...(completeness.missingFacilities.length > 0
          ? [`Belum mencakup data dari ${completeness.missingFacilities.join(', ')}.`]
          : []),
      ],
      suppressed: false,
    };

    // LEVEL 2: Continuity
    // Eligible abnormal findings: Yellow, Orange, Red, Dark Red (Moderate, High, Critical risks)
    const eligibleRiskCitizens = new Set(
      allRisks
        .filter((r) => r.finalCategory !== 'GREEN' || r.isCritical)
        .map((r) => r.citizenId)
    );
    const denominatorLvl2 = eligibleRiskCitizens.size;

    // Attended: citizens who had at least 1 clinical encounter
    const attendedCitizenIds = new Set(allEncounters.map((e) => e.citizenId));
    let attendedCount = 0;
    eligibleRiskCitizens.forEach((id) => {
      if (attendedCitizenIds.has(id)) attendedCount++;
    });
    const numeratorLvl2 = attendedCount;
    const percentageLvl2 =
      denominatorLvl2 > 0 ? Math.round((numeratorLvl2 / denominatorLvl2) * 1000) / 10 : 0;

    const level2Continuity: QualifiedMetric = {
      metricCode: 'IMPACT_LVL_2_CONTINUITY',
      label: 'Level 2 — Kontinuitas Tindak Lanjut (Continuity)',
      numerator: numeratorLvl2,
      denominator: denominatorLvl2,
      percentage: percentageLvl2,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      dataCutoffAt,
      definitionVersion: 'v1.2.0-DEF-2026',
      completeness: completeness.overallStatus,
      qualificationMessages: [
        `Dihitung dari warga dengan temuan skrining berisiko (Kuning/Merah/Kritis) yang telah hadir di layanan klinis faskes.`,
      ],
      suppressed: false,
    };

    // LEVEL 3: Outcome (HARD LOCK OI-08)
    // Automated Outcome evaluation is locked pending CR-OC verification. Must show NOT_ASSESSABLE.
    const level3Outcome: QualifiedMetric = {
      metricCode: 'IMPACT_LVL_3_OUTCOME',
      label: 'Level 3 — Status Terkendali (Outcome)',
      numerator: undefined,
      denominator: undefined,
      percentage: undefined,
      value: undefined,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      dataCutoffAt,
      definitionVersion: 'v1.0.0-OI08-LOCKED',
      completeness: 'NOT_ASSESSABLE',
      qualificationMessages: [
        'Kriteria outcome terkendali masih menunggu pengesahan aturan CR-OC yang terverifikasi (Governance Lock OI-08).',
        'Penetapan otomatis tidak diberlakukan agar tidak mempublikasikan angka perkiraan semu ke pimpinan wilayah.',
      ],
      suppressed: false,
    };

    return {
      level1Coverage,
      level2Continuity,
      level3Outcome,
      dataCutoffAt,
      completenessStatus: completeness.overallStatus,
    };
  },
};
