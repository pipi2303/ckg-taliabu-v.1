import { PopulationDataCompleteness, MetricCompleteness } from '../types';
import { populationCompletenessRepo } from '../repositories/populationCompletenessRepo';

export interface CountyCompletenessSummary {
  overallStatus: MetricCompleteness;
  reportingFacilitiesCount: number;
  totalFacilitiesCount: number;
  reportingRatioText: string;
  missingFacilities: string[];
  staleFacilities: string[];
  totalPendingKaderSync: number;
  totalDqQueue: number;
  dataCutoffAt: string;
  qualificationNotes: string[];
}

export const populationQualificationService = {
  async getCountyCompleteness(): Promise<CountyCompletenessSummary> {
    const list = await populationCompletenessRepo.getAll();
    const totalFacilities = list.length;
    const reportingFacilities = list.filter((f) => f.reportingStatus === 'REPORTING_COMPLETE').length;
    const missing = list.filter((f) => f.reportingStatus === 'NOT_REPORTING').map((f) => f.facilityName);
    const stale = list.filter((f) => f.reportingStatus === 'STALE').map((f) => f.facilityName);
    const totalPendingKader = list.reduce((acc, f) => acc + f.pendingKaderSyncCount, 0);
    const totalDq = list.reduce((acc, f) => acc + f.dqQueueCount, 0);

    let overallStatus: MetricCompleteness = 'COMPLETE';
    const notes: string[] = [];

    if (missing.length > 0) {
      overallStatus = 'PARTIAL';
      notes.push(`Data periode ini belum mencakup: ${missing.join(', ')}.`);
    }

    if (stale.length > 0) {
      if (overallStatus !== 'PARTIAL') overallStatus = 'PARTIAL';
      notes.push(`Fasilitas dengan data terlambat (stale): ${stale.join(', ')}.`);
    }

    if (totalPendingKader > 0) {
      notes.push(`Terdapat ${totalPendingKader} catatan kunjungan kader tersimpan di perangkat offline (belum masuk server, tidak dihitung sebagai kegagalan tindak lanjut).`);
    }

    if (totalDq > 0) {
      notes.push(`Terdapat ${totalDq} data tersaring di antrean Data Quality (DQ).`);
    }

    return {
      overallStatus,
      reportingFacilitiesCount: reportingFacilities,
      totalFacilitiesCount: totalFacilities,
      reportingRatioText: `${reportingFacilities} / ${totalFacilities} Puskesmas Pelapor`,
      missingFacilities: missing,
      staleFacilities: stale,
      totalPendingKaderSync: totalPendingKader,
      totalDqQueue: totalDq,
      dataCutoffAt: '2026-08-24T07:30:00Z',
      qualificationNotes: notes,
    };
  },

  async getAllFacilityCompleteness(): Promise<PopulationDataCompleteness[]> {
    return populationCompletenessRepo.getAll();
  },
};
