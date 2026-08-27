import {
  Citizen,
  ClinicalRiskCategory,
  Observation,
  PriorityWeightVersion,
  RiskClassification,
} from '../../../types';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeightVersion = {
  id: 'PW-V1-2026',
  version: 'v1.0-TALIABU-2026',
  weights: {
    riskCategory: 0.40,
    accompanyingFactors: 0.20,
    daysSinceFinding: 0.15,
    missedVisits: 0.10,
    criticalFinding: 0.15,
    accessibility: 0.0,
  },
  activeFrom: '2026-08-01T00:00:00.000Z',
  createdBy: 'Dinas Kesehatan Kab. Pulau Taliabu',
  status: 'ACTIVE',
  notes: 'Konfigurasi bobot standar operasional triage CKG Pulau Taliabu 2026',
};

export interface PriorityScoreResult {
  totalScore: number;
  components: {
    riskCategory: number;
    accompanyingFactors: number;
    daysSinceFinding: number;
    missedVisits: number;
    criticalFinding: number;
    accessibility?: number;
  };
  weightVersion: string;
}

export const priorityEngine = {
  calculate(
    citizen: Citizen,
    classification: {
      finalCategory: ClinicalRiskCategory;
      isCritical: boolean;
      domainResults: Array<{ category?: ClinicalRiskCategory; status: string }>;
      screeningDate?: string;
    },
    observations: Observation[] = [],
    weightConfig: PriorityWeightVersion = DEFAULT_PRIORITY_WEIGHTS
  ): PriorityScoreResult {
    const { weights } = weightConfig;

    // 1. Risk Category Base Score (0 - 100)
    let categoryBase = 5;
    switch (classification.finalCategory) {
      case 'DARK_RED':
        categoryBase = 95;
        break;
      case 'RED':
        categoryBase = 75;
        break;
      case 'ORANGE':
        categoryBase = 50;
        break;
      case 'YELLOW':
        categoryBase = 25;
        break;
      case 'GREEN':
        categoryBase = 10;
        break;
      case 'UNDETERMINED':
      default:
        categoryBase = 5;
        break;
    }
    const riskCategoryScore = Math.round(categoryBase * weights.riskCategory);

    // 2. Accompanying Factors (Count of non-GREEN/non-normal domains)
    const riskDomainCount = classification.domainResults.filter(
      (d) => d.category && ['YELLOW', 'ORANGE', 'RED', 'DARK_RED'].includes(d.category)
    ).length;
    const factorRatio = Math.min(riskDomainCount / 4, 1.0);
    const accompanyingFactorsScore = Math.round(factorRatio * 100 * weights.accompanyingFactors);

    // 3. Days Since Finding (Slight bump for older unresolved findings to avoid patient neglect)
    let daysSince = 14;
    if (classification.screeningDate) {
      const screeningTime = new Date(classification.screeningDate).getTime();
      const nowTime = new Date('2026-08-24T00:00:00.000Z').getTime();
      daysSince = Math.max(0, Math.floor((nowTime - screeningTime) / (1000 * 60 * 60 * 24)));
    }
    const daysRatio = Math.min(daysSince / 60, 1.0);
    const daysSinceFindingScore = Math.round(daysRatio * 100 * weights.daysSinceFinding);

    // 4. Missed Visits / Incomplete Sessions
    const unconfirmedCount = observations.filter((o) => o.isConfirmatory === false).length;
    const missedRatio = Math.min(Math.max(0, unconfirmedCount - 1) / 3, 1.0);
    const missedVisitsScore = Math.round(missedRatio * 100 * weights.missedVisits);

    // 5. Critical Finding Status (+100 if critical)
    const criticalBase = classification.isCritical ? 100 : 0;
    const criticalFindingScore = Math.round(criticalBase * weights.criticalFinding);

    // Total Normalized Score (0 - 100)
    const rawTotal =
      riskCategoryScore +
      accompanyingFactorsScore +
      daysSinceFindingScore +
      missedVisitsScore +
      criticalFindingScore;

    const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    return {
      totalScore,
      components: {
        riskCategory: riskCategoryScore,
        accompanyingFactors: accompanyingFactorsScore,
        daysSinceFinding: daysSinceFindingScore,
        missedVisits: missedVisitsScore,
        criticalFinding: criticalFindingScore,
      },
      weightVersion: weightConfig.version,
    };
  },
};
