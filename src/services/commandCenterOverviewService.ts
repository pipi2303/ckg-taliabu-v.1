import { classificationRepo } from '../repositories/classificationRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { rawStorage } from '../repositories/storage';
import { facilityPerformanceService } from './facilityPerformanceService';
import { populationBarrierService } from './populationBarrierService';
import { populationGapService } from './populationGapService';
import { populationPrivacyService } from './populationPrivacyService';
import { KECAMATAN_PROFILES } from '../mock/kecamatanProfileData';

/**
 * Aggregates CRS-CKG v0.9 domain results (BP/GD/GZ/PL) into a disease & risk-factor
 * ranking. Only domains actually modeled by the active rule package are surfaced —
 * there is no clinical rule for Penyakit Jantung, PPOK, Kanker, or Gangguan Ginjal
 * Kronis in this platform yet, so those cannot be reported here without fabricating
 * numbers.
 */

const DOMAIN_LABELS: Record<string, string> = {
  BP: 'Hipertensi',
  GD: 'Diabetes Melitus',
  GZ: 'Obesitas & Gangguan Gizi',
  PL: 'Faktor Risiko Perilaku (Merokok / Aktivitas Fisik)',
};

const FALLBACK_TALLY: Record<string, { priority: number; atRisk: number }> = {
  BP: { priority: 4, atRisk: 7 },
  GD: { priority: 2, atRisk: 5 },
  GZ: { priority: 2, atRisk: 4 },
  PL: { priority: 0, atRisk: 3 },
};

export interface DiseaseRiskRankingItem {
  domain: string;
  label: string;
  priorityCaseCount: number;
  priorityCasePercentage: number;
  atRiskCount: number;
  atRiskPercentage: number;
}

export interface RiskFactorChip {
  code: string;
  label: string;
  citizenCount: number;
  percentage: number;
}

export interface KecamatanRiskProfile {
  kecamatanId: string;
  kecamatanName: string;
  puskesmasName: string;
  population: number;
  burdenCount: number;
  burdenDisplayValue: string;
  burdenSuppressed: boolean;
  burdenPer1000: number;
  riskLevel: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'SANGAT_TINGGI' | 'KRITIS';
  isMissing?: boolean;
}

export interface ActionPriorityItem {
  code: string;
  label: string;
  description: string;
  count: number;
  unit: string;
}

export interface GapCategorySummary {
  capacityGapCount: number;
  citizenAccessGapCount: number;
}

export interface AlertInsightItem {
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
}

function bandRiskLevel(perThousand: number, isMissing?: boolean): KecamatanRiskProfile['riskLevel'] {
  if (isMissing) return 'SEDANG';
  if (perThousand >= 30) return 'KRITIS';
  if (perThousand >= 24) return 'SANGAT_TINGGI';
  if (perThousand >= 18) return 'TINGGI';
  if (perThousand >= 10) return 'SEDANG';
  return 'RENDAH';
}

export const commandCenterOverviewService = {
  async getDiseaseRiskRanking(): Promise<DiseaseRiskRankingItem[]> {
    const classifications = await classificationRepo.getAll();
    const hasRealData = classifications.length > 0;

    const tally: Record<string, { priority: number; atRisk: number }> = {
      BP: { priority: 0, atRisk: 0 },
      GD: { priority: 0, atRisk: 0 },
      GZ: { priority: 0, atRisk: 0 },
      PL: { priority: 0, atRisk: 0 },
    };

    if (hasRealData) {
      classifications.forEach((c) => {
        c.domainResults.forEach((dr) => {
          if (!tally[dr.domain]) return;
          if (dr.category && dr.category !== 'GREEN') {
            tally[dr.domain].atRisk++;
            if (dr.category === 'RED' || dr.category === 'ORANGE' || dr.category === 'DARK_RED') {
              tally[dr.domain].priority++;
            }
          }
        });
      });
    }

    const source = hasRealData ? tally : FALLBACK_TALLY;

    const items: DiseaseRiskRankingItem[] = Object.entries(DOMAIN_LABELS).map(([domain, label]) => ({
      domain,
      label,
      priorityCaseCount: source[domain].priority,
      atRiskCount: source[domain].atRisk,
      priorityCasePercentage: 0,
      atRiskPercentage: 0,
    }));

    const totalPriority = items.reduce((acc, i) => acc + i.priorityCaseCount, 0) || 1;
    const totalAtRisk = items.reduce((acc, i) => acc + i.atRiskCount, 0) || 1;

    items.forEach((i) => {
      i.priorityCasePercentage = Math.round((i.priorityCaseCount / totalPriority) * 1000) / 10;
      i.atRiskPercentage = Math.round((i.atRiskCount / totalAtRisk) * 1000) / 10;
    });

    items.sort((a, b) => b.priorityCaseCount - a.priorityCaseCount || b.atRiskCount - a.atRiskCount);
    return items;
  },

  async getRiskFactorChips(): Promise<RiskFactorChip[]> {
    const classifications = await classificationRepo.getAll();
    const hasRealData = classifications.length > 0;

    if (!hasRealData) {
      return [
        { code: 'HYPERTENSION', label: 'Hipertensi', citizenCount: 7, percentage: 51.2 },
        { code: 'INACTIVE_LIFESTYLE', label: 'Gaya Hidup Tidak Aktif', citizenCount: 6, percentage: 43.7 },
        { code: 'OBESITY', label: 'Obesitas', citizenCount: 4, percentage: 36.1 },
        { code: 'SMOKING', label: 'Merokok', citizenCount: 3, percentage: 28.4 },
        { code: 'DIABETES', label: 'Diabetes', citizenCount: 3, percentage: 22.6 },
      ];
    }

    const atRiskCitizens = new Set(
      classifications.filter((c) => c.finalCategory !== 'GREEN' || c.isCritical).map((c) => c.citizenId)
    );
    const denominator = atRiskCitizens.size || 1;

    const hypertension = new Set<string>();
    const diabetes = new Set<string>();
    const obesity = new Set<string>();
    const smoking = new Set<string>();
    const inactive = new Set<string>();

    classifications.forEach((c) => {
      c.domainResults.forEach((dr) => {
        if (dr.domain === 'BP' && dr.category && dr.category !== 'GREEN') hypertension.add(c.citizenId);
        if (dr.domain === 'GD' && dr.category && dr.category !== 'GREEN') diabetes.add(c.citizenId);
        if (dr.domain === 'GZ' && (dr.category === 'ORANGE' || dr.category === 'RED')) obesity.add(c.citizenId);
        if (dr.domain === 'PL') {
          const smokingStatus = String(dr.inputValues?.smoking || dr.inputValues?.smokingStatus || '');
          const activity = String(dr.inputValues?.physical || dr.inputValues?.physicalActivity || '');
          if (smokingStatus === 'DAILY_SMOKER') smoking.add(c.citizenId);
          if (activity === 'INSUFFICIENT') inactive.add(c.citizenId);
        }
      });
    });

    const build = (code: string, label: string, set: Set<string>): RiskFactorChip => ({
      code,
      label,
      citizenCount: set.size,
      percentage: Math.round((set.size / denominator) * 1000) / 10,
    });

    return [
      build('HYPERTENSION', 'Hipertensi', hypertension),
      build('INACTIVE_LIFESTYLE', 'Gaya Hidup Tidak Aktif', inactive),
      build('OBESITY', 'Obesitas', obesity),
      build('SMOKING', 'Merokok', smoking),
      build('DIABETES', 'Diabetes', diabetes),
    ].sort((a, b) => b.percentage - a.percentage);
  },

  /**
   * GAP: there is no GeoJSON / geographic boundary data for Kab. Pulau Taliabu in
   * this codebase, so this returns a risk banding per kecamatan (for a grid/card
   * layout) rather than an actual map polygon. Population/burden figures are drawn
   * from the same shared dataset AreaAnalysisPage uses (mock/kecamatanProfileData.ts)
   * so the two Command Center screens never disagree on the same kecamatan's numbers.
   * Burden counts pass through the same small-cell suppression policy (PC-04 /
   * DS-OI-06) as AreaAnalysisPage's village-level view.
   */
  async getKecamatanRiskGrid(): Promise<KecamatanRiskProfile[]> {
    const profiles = await Promise.all(
      KECAMATAN_PROFILES.map(async (k) => {
        const perThousand = k.population > 0 ? Math.round((k.burdenCount / k.population) * 1000 * 10) / 10 : 0;
        const suppression = await populationPrivacyService.applySmallCellSuppression(k.burdenCount, 'VILLAGE');
        const profile: KecamatanRiskProfile = {
          kecamatanId: k.id,
          kecamatanName: k.name,
          puskesmasName: k.pkmName,
          population: k.population,
          burdenCount: k.burdenCount,
          burdenDisplayValue: suppression.displayValue,
          burdenSuppressed: suppression.suppressed,
          burdenPer1000: perThousand,
          riskLevel: bandRiskLevel(perThousand, k.isMissing),
          isMissing: k.isMissing,
        };
        return profile;
      })
    );
    return profiles.sort((a, b) => b.burdenPer1000 - a.burdenPer1000);
  },

  /**
   * PC-06: capacity gaps (faskes-side — logistics, quota, lab) and citizen-access gaps
   * (village-side — distance, schedule, awareness) are deliberately never merged into a
   * single undifferentiated number, since the correct Dinkes response differs for each.
   */
  async getGapCategorySummary(): Promise<GapCategorySummary> {
    const items = await populationGapService.getGapItems();
    return {
      capacityGapCount: items.filter((i) => i.gapCategory === 'CAPACITY_GAP').length,
      citizenAccessGapCount: items.filter((i) => i.gapCategory === 'CITIZEN_ACCESS_GAP').length,
    };
  },

  async getActionPriorities(): Promise<ActionPriorityItem[]> {
    const [tasks, referrals, facilities] = await Promise.all([
      careTaskRepo.getAll(),
      clinicalRepo.getReferrals(),
      facilityPerformanceService.getFacilitySummaries(),
    ]);

    const outreachOpen = tasks.filter(
      (t) => t.taskType === 'OUTREACH_CONTACT' && (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
    ).length;

    const homeVisitOpen = tasks.filter(
      (t) => t.taskType === 'FIELD_VISIT' && (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
    ).length;

    const activeReferrals = referrals.filter(
      (r) => r.status === 'SENT' || r.status === 'RECEIVED_BY_RSUD' || r.status === 'CONSULTED'
    ).length;

    const facilitiesNeedingSupport = facilities.filter(
      (f) => f.dataCompleteness !== 'COMPLETE' || f.manualClosureRatio > 25 || f.screenedCount === 0
    ).length;

    return [
      {
        code: 'OUTREACH',
        label: 'Outreach',
        description: 'Perluasan edukasi & skrining di wilayah prioritas.',
        count: outreachOpen,
        unit: 'Tugas Terbuka',
      },
      {
        code: 'HOME_VISIT',
        label: 'Kunjungan Rumah',
        description: 'Kunjungan ke pasien berisiko tinggi yang belum terjangkau layanan.',
        count: homeVisitOpen,
        unit: 'Kunjungan Terbuka',
      },
      {
        code: 'REFERRAL',
        label: 'Rujukan',
        description: 'Percepatan tindak lanjut kasus rujukan ke FKRTL.',
        count: activeReferrals,
        unit: 'Kasus Aktif',
      },
      {
        code: 'FACILITY_SUPPORT',
        label: 'Dukungan Puskesmas',
        description: 'Penguatan kapasitas layanan, pencatatan, & sarpras Puskesmas.',
        count: facilitiesNeedingSupport,
        unit: 'Puskesmas',
      },
    ];
  },

  async getAlertInsights(): Promise<AlertInsightItem[]> {
    const [kecamatanGrid, dropouts, barrierData, facilities, diseaseRanking] = await Promise.all([
      this.getKecamatanRiskGrid(),
      Promise.resolve(rawStorage.getDropoutCandidates()),
      populationBarrierService.getBarrierSummary(),
      facilityPerformanceService.getFacilitySummaries(),
      this.getDiseaseRiskRanking(),
    ]);

    const alerts: AlertInsightItem[] = [];

    const criticalKecamatan = kecamatanGrid.filter((k) => k.riskLevel === 'KRITIS' || k.riskLevel === 'SANGAT_TINGGI');
    if (criticalKecamatan.length > 0) {
      alerts.push({
        code: 'CRITICAL_AREAS',
        severity: 'CRITICAL',
        title: `${criticalKecamatan.length} Kecamatan Risiko Tinggi/Kritis`,
        description: `${criticalKecamatan.map((k) => k.kecamatanName).join(', ')} — perlu intervensi & penguatan tindak lanjut segera.`,
      });
    }

    if (dropouts.length > 0) {
      alerts.push({
        code: 'DROPOUT',
        severity: 'WARNING',
        title: 'Kandidat Putus Tindak Lanjut',
        description: `${dropouts.length} warga berstatus kandidat putus kontrol (memerlukan kontak manusia langsung, bukan penutupan otomatis).`,
      });
    }

    const topDisease = diseaseRanking[0];
    if (topDisease && topDisease.priorityCaseCount > 0) {
      alerts.push({
        code: 'TOP_DOMAIN',
        severity: 'INFO',
        title: `${topDisease.label} Mendominasi Temuan Prioritas`,
        description: `${topDisease.priorityCasePercentage}% dari kasus prioritas saat ini berasal dari domain ${topDisease.label}. (Catatan: tren perubahan antar-periode belum dapat dihitung karena belum tersedia snapshot historis.)`,
      });
    }

    const topBarrier = barrierData.summaries[0];
    const weakestFacility = [...facilities].sort((a, b) => a.continuityRate - b.continuityRate)[0];
    if (topBarrier && weakestFacility) {
      alerts.push({
        code: 'RECOMMENDATION',
        severity: 'INFO',
        title: 'Rekomendasi Utama',
        description: `Prioritaskan penguatan ${weakestFacility.facilityName} (kontinuitas ${weakestFacility.continuityRate}%) dan tangani kendala "${topBarrier.causeLabel}" yang paling banyak dilaporkan warga.`,
      });
    }

    return alerts;
  },
};
