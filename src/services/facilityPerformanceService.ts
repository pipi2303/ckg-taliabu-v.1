import { FacilityPerformanceSummary } from '../types';
import { facilityRepo } from '../repositories/facilityRepo';
import { populationQualificationService } from './populationQualificationService';

export const facilityPerformanceService = {
  async getFacilitySummaries(): Promise<FacilityPerformanceSummary[]> {
    const [facilities, completenessList] = await Promise.all([
      facilityRepo.getAll(),
      populationQualificationService.getAllFacilityCompleteness(),
    ]);

    const completenessMap = new Map(completenessList.map((c) => [c.facilityId, c]));

    const puskesmasList = facilities.filter((f) => f.type === 'PUSKESMAS');

    // Contextual metrics for each Puskesmas in Pulau Taliabu
    const facilityProfiles: Record<string, Partial<FacilityPerformanceSummary>> = {
      'faskes-1': {
        isRemoteIsland: false,
        accessibilityContext: 'Ibu kota kabupaten. Akses jalan darat utama tersedia. Terkoneksi puskesmas keliling air untuk desa pesisir.',
        screenedCount: 310,
        eligibleFollowUpCount: 142,
        attendedFollowUpCount: 88,
        continuityRate: 62.0,
        manualClosureCount: 8,
        manualClosureRatio: 9.1,
        topBarriers: [
          { causeCode: 'WORK_SCHEDULE', count: 18 },
          { causeCode: 'DISTANCE_TRANSPORT', count: 12 },
        ],
        notes: ['Beban sasaran terbesar.', 'Rasio penutupan manual rendah (kualitas pencatatan baik).'],
      },
      'faskes-2': {
        isRemoteIsland: false,
        accessibilityContext: 'Wilayah daratan utara. Akses darat berbukit dengan kerentanan longsor saat hujan lebat.',
        screenedCount: 145,
        eligibleFollowUpCount: 68,
        attendedFollowUpCount: 39,
        continuityRate: 57.4,
        manualClosureCount: 6,
        manualClosureRatio: 15.4,
        topBarriers: [
          { causeCode: 'MEDICATION_UNAVAILABLE', count: 9 },
          { causeCode: 'FEELS_HEALTHY', count: 8 },
        ],
        notes: ['Terdapat buffer stok di Pustu Todoli yang perlu pemantauan berkala.'],
      },
      'faskes-3': {
        isRemoteIsland: true,
        accessibilityContext: 'Kawasan pesisir barat laut. Sangat bergantung pada transportasi laut motor tempel antar-tanjung.',
        screenedCount: 98,
        eligibleFollowUpCount: 46,
        attendedFollowUpCount: 24,
        continuityRate: 52.2,
        manualClosureCount: 4,
        manualClosureRatio: 16.7,
        topBarriers: [
          { causeCode: 'DISTANCE_TRANSPORT', count: 14 },
          { causeCode: 'WORK_SCHEDULE', count: 6 },
        ],
        notes: ['Ketergantungan tinggi pada kondisi cuaca gelombang perahu nelayan.'],
      },
      'faskes-4': {
        isRemoteIsland: true,
        accessibilityContext: 'Kawasan selatan pulau. Akses jalan darat rusak berat, evakuasi dan rujukan via laut 3-4 jam.',
        screenedCount: 85,
        eligibleFollowUpCount: 41,
        attendedFollowUpCount: 16,
        continuityRate: 39.0,
        manualClosureCount: 6,
        manualClosureRatio: 37.5,
        topBarriers: [
          { causeCode: 'DISTANCE_TRANSPORT', count: 19 },
          { causeCode: 'SERVICE_COST', count: 8 },
        ],
        notes: [
          'Sinyal Kualitas: Proporsi penutupan manual tinggi (37.5%) — perlu peninjauan proses tindak lanjut.',
          'Data berstatus Terlambat (STALE) akibat gangguan menara BTS lokal.',
        ],
      },
      'faskes-5': {
        isRemoteIsland: true,
        accessibilityContext: 'Pesisir timur. Wilayah kantong pemukiman terpisah teluk. Kunjungan kader memerlukan perahu sewa.',
        screenedCount: 64,
        eligibleFollowUpCount: 31,
        attendedFollowUpCount: 15,
        continuityRate: 48.4,
        manualClosureCount: 2,
        manualClosureRatio: 13.3,
        topBarriers: [
          { causeCode: 'DISTANCE_TRANSPORT', count: 11 },
          { causeCode: 'FORGOT', count: 4 },
        ],
        notes: ['Populasi kecil namun sebaran geografis luas.'],
      },
      'faskes-6': {
        isRemoteIsland: true,
        accessibilityContext: 'Pesisir tenggara terisolir. Ketiadaan pelabuhan permanen menyulitkan sandar kapal saat musim timur.',
        screenedCount: 0, // Not reporting this period
        eligibleFollowUpCount: 0,
        attendedFollowUpCount: 0,
        continuityRate: 0,
        manualClosureCount: 0,
        manualClosureRatio: 0,
        topBarriers: [],
        notes: ['Data periode ini belum masuk (NOT_REPORTING). Tidak diimputasi sebagai nilai nol performa.'],
      },
      'faskes-7': {
        isRemoteIsland: true,
        accessibilityContext: 'Kepulauan utara terdepan. Melayani pulau-pulau kecil dengan gelombang laut lepas.',
        screenedCount: 120,
        eligibleFollowUpCount: 54,
        attendedFollowUpCount: 27,
        continuityRate: 50.0,
        manualClosureCount: 3,
        manualClosureRatio: 11.1,
        topBarriers: [
          { causeCode: 'DISTANCE_TRANSPORT', count: 21 },
          { causeCode: 'NO_COMPANION', count: 6 },
        ],
        notes: ['Terdapat 18 catatan lapangan tersimpan di perangkat offline kader desa binaan.'],
      },
      'faskes-8_pkm': {
        isRemoteIsland: true,
        accessibilityContext: 'Kecamatan Tabona. Wilayah pesisir selatan-barat. Akses terhubung jalur laut ke Bobong.',
        screenedCount: 75,
        eligibleFollowUpCount: 36,
        attendedFollowUpCount: 18,
        continuityRate: 50.0,
        manualClosureCount: 2,
        manualClosureRatio: 11.1,
        topBarriers: [
          { causeCode: 'DISTANCE_TRANSPORT', count: 10 },
          { causeCode: 'FEAR_SHAME', count: 5 },
        ],
        notes: ['Program edukasi Posyandu aktif.'],
      },
    };

    return puskesmasList.map((pkm) => {
      const comp = completenessMap.get(pkm.id);
      const prof = facilityProfiles[pkm.id] || {
        isRemoteIsland: true,
        accessibilityContext: 'Wilayah kerja Puskesmas di Kabupaten Pulau Taliabu.',
        screenedCount: 50,
        eligibleFollowUpCount: 25,
        attendedFollowUpCount: 12,
        continuityRate: 48.0,
        manualClosureCount: 2,
        manualClosureRatio: 16.0,
        topBarriers: [{ causeCode: 'DISTANCE_TRANSPORT', count: 6 }],
        notes: [],
      };

      const dataCompleteness: 'COMPLETE' | 'PARTIAL' | 'STALE' =
        comp?.reportingStatus === 'REPORTING_COMPLETE'
          ? 'COMPLETE'
          : comp?.reportingStatus === 'STALE'
          ? 'STALE'
          : 'PARTIAL';

      return {
        facilityId: pkm.id,
        facilityName: pkm.name,
        kecamatanName: pkm.kecamatanName,
        isRemoteIsland: prof.isRemoteIsland ?? false,
        accessibilityContext: prof.accessibilityContext || '',
        screenedCount: prof.screenedCount || 0,
        eligibleFollowUpCount: prof.eligibleFollowUpCount || 0,
        attendedFollowUpCount: prof.attendedFollowUpCount || 0,
        continuityRate: prof.continuityRate || 0,
        manualClosureCount: prof.manualClosureCount || 0,
        manualClosureRatio: prof.manualClosureRatio || 0,
        dataCompleteness,
        pendingKaderSyncCount: comp?.pendingKaderSyncCount || 0,
        topBarriers: prof.topBarriers || [],
        notes: prof.notes || [],
      };
    });
  },
};
