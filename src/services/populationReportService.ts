import { User } from '../types';
import { impactIndexService } from './impactIndexService';
import { populationCascadeService } from './populationCascadeService';
import { populationQualificationService } from './populationQualificationService';
import { facilityPerformanceService } from './facilityPerformanceService';
import { auditRepo } from '../repositories/auditRepo';

export interface AggregateReportSnapshot {
  generatedAt: string;
  generatedBy: string;
  period: string;
  dataCutoffAt: string;
  completenessStatus: string;
  reportingRatioText: string;
  missingFacilities: string[];
  caveats: string[];
  impactIndex: {
    level1Coverage: { numerator: number; denominator: number; percentage: number; version: string };
    level2Continuity: { numerator: number; denominator: number; percentage: number; version: string };
    level3Outcome: { status: string; reason: string; version: string };
  };
  cascade: {
    screened: number;
    needsFollowup: number;
    contacted: number;
    attended: number;
    confirmed: number;
    onTreatment: number;
    retained: number;
    controlled: string;
    awaitingConfirmation: number;
    totalExits: number;
    manualTaskClosureRatio: number;
  };
  facilitySummaries: {
    facilityName: string;
    kecamatanName: string;
    screenedCount: number;
    attendedCount: number;
    continuityRate: number;
    dataCompleteness: string;
    context: string;
  }[];
}

export const populationReportService = {
  async generateSnapshot(user?: User | null): Promise<AggregateReportSnapshot> {
    const [completeness, impact, cascade, facilities] = await Promise.all([
      populationQualificationService.getCountyCompleteness(),
      impactIndexService.getImpactIndex(),
      populationCascadeService.getCascadeAggregation(),
      facilityPerformanceService.getFacilitySummaries(),
    ]);

    const userName = user?.name ? `${user.name} (${user.roleName})` : 'dr. Hj. Nur Aini, M.Kes (Kepala Dinas Kesehatan)';

    const snapshot: AggregateReportSnapshot = {
      generatedAt: new Date().toISOString(),
      generatedBy: userName,
      period: 'Agustus 2026',
      dataCutoffAt: completeness.dataCutoffAt,
      completenessStatus: completeness.overallStatus,
      reportingRatioText: completeness.reportingRatioText,
      missingFacilities: completeness.missingFacilities,
      caveats: completeness.qualificationNotes,
      impactIndex: {
        level1Coverage: {
          numerator: impact.level1Coverage.numerator || 0,
          denominator: impact.level1Coverage.denominator || 0,
          percentage: impact.level1Coverage.percentage || 0,
          version: impact.level1Coverage.definitionVersion,
        },
        level2Continuity: {
          numerator: impact.level2Continuity.numerator || 0,
          denominator: impact.level2Continuity.denominator || 0,
          percentage: impact.level2Continuity.percentage || 0,
          version: impact.level2Continuity.definitionVersion,
        },
        level3Outcome: {
          status: 'BELUM DAPAT DINILAI (NOT ASSESSABLE)',
          reason: 'Menunggu verifikasi aturan klinis terstandar CR-OC (Governance Lock OI-08).',
          version: impact.level3Outcome.definitionVersion,
        },
      },
      cascade: {
        screened: cascade.stages[0]?.count || 0,
        needsFollowup: cascade.stages[1]?.count || 0,
        contacted: cascade.stages[2]?.count || 0,
        attended: cascade.stages[3]?.count || 0,
        confirmed: cascade.stages[4]?.count || 0,
        onTreatment: cascade.stages[5]?.count || 0,
        retained: cascade.stages[6]?.count || 0,
        controlled: 'Belum dinilai (OI-08)',
        awaitingConfirmation: cascade.awaitingConfirmationCount,
        totalExits: cascade.exits.totalExits,
        manualTaskClosureRatio: cascade.manualTaskClosureRatio,
      },
      facilitySummaries: facilities.map((f) => ({
        facilityName: f.facilityName,
        kecamatanName: f.kecamatanName,
        screenedCount: f.screenedCount,
        attendedCount: f.attendedFollowUpCount,
        continuityRate: f.continuityRate,
        dataCompleteness: f.dataCompleteness,
        context: f.accessibilityContext,
      })),
    };

    // Log export audit
    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'EXPORT',
      entityType: 'POPULATION_REPORT',
      entityId: 'RPT-POP-SNAPSHOT',
      targetLabel: 'Ekspor Laporan Agregat Populasi CKG',
      description: `Periode: ${snapshot.period} | Cutoff: ${snapshot.dataCutoffAt}`,
      details: {
        period: snapshot.period,
        dataCutoffAt: snapshot.dataCutoffAt,
        reportingRatioText: snapshot.reportingRatioText,
      },
    });

    return snapshot;
  },

  exportToCSV(snapshot: AggregateReportSnapshot): string {
    const headers = ['Puskesmas', 'Kecamatan', 'Skrining Selesai', 'Hadir Tindak Lanjut', 'Kontinuitas (%)', 'Status Data', 'Konteks Wilayah'];
    const rows = snapshot.facilitySummaries.map((f) => [
      `"${f.facilityName}"`,
      `"${f.kecamatanName}"`,
      f.screenedCount,
      f.attendedCount,
      `${f.continuityRate}%`,
      f.dataCompleteness,
      `"${f.context}"`,
    ]);

    const metadata = [
      `# LAPORAN POPULASI CKG KABUPATEN PULAU TALIABU`,
      `# Periode: ${snapshot.period}`,
      `# Data Cutoff: ${snapshot.dataCutoffAt}`,
      `# Status Kelengkapan: ${snapshot.reportingRatioText}`,
      `# Caveats: ${snapshot.caveats.join(' | ')}`,
      `# Impact Level 1 (Coverage): ${snapshot.impactIndex.level1Coverage.percentage}% (${snapshot.impactIndex.level1Coverage.numerator}/${snapshot.impactIndex.level1Coverage.denominator})`,
      `# Impact Level 2 (Continuity): ${snapshot.impactIndex.level2Continuity.percentage}% (${snapshot.impactIndex.level2Continuity.numerator}/${snapshot.impactIndex.level2Continuity.denominator})`,
      `# Impact Level 3 (Outcome): ${snapshot.impactIndex.level3Outcome.status} - ${snapshot.impactIndex.level3Outcome.reason}`,
      '',
    ];

    return metadata.join('\n') + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
  },
};
