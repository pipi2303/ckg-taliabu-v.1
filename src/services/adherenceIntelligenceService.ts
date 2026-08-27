import { AdherenceIntelligenceResult } from '../types';

const defaultResults: Record<string, AdherenceIntelligenceResult> = {
  'CIT-8208-0012': {
    id: 'ADH-0012',
    citizenId: 'CIT-8208-0012',
    citizenName: 'Baharudin Ode',
    cycleId: 'CYCLE-2026-03',
    level: 'PARTIAL',
    evidenceStrength: 'KUAT',
    evidenceSources: [
      {
        sourceType: 'STAFF_ASSESSMENT',
        reportedAt: '2026-07-15T09:30:00Z',
        status: 'Minum obat 4-5 hari per minggu saat merasa tegang leher',
        notes: 'Verifikasi perawat poli: Pasien sering berhenti saat merasa badan segar.'
      },
      {
        sourceType: 'MEDICATION_DISPENSE',
        reportedAt: '2026-07-15T09:45:00Z',
        status: 'Amlodipine 10mg diserahkan 30 tablet',
        notes: 'Pengambilan obat terlambat 12 hari dari estimasi tanggal habis.'
      },
      {
        sourceType: 'KADER_REPORT',
        reportedAt: '2026-06-28T14:00:00Z',
        status: 'Kader melaporkan warga sedang melaut di perairan Obi',
        notes: 'Obat tidak dibawa melaut.'
      }
    ],
    dominantCauses: [
      'FEELS_HEALTHY',
      'DISTANCE_TRANSPORT'
    ],
    systemFactorsIdentified: [
      'Aksesibilitas jadwal penyeberangan perahu motor terhambat ombak'
    ],
    generatedAt: '2026-08-24T06:00:00Z',
    modelVersion: 'v2.0-shadow'
  },
  'CIT-8208-0045': {
    id: 'ADH-0045',
    citizenId: 'CIT-8208-0045',
    citizenName: 'Wa Ode Fatimah',
    cycleId: 'CYCLE-2026-02',
    level: 'IRREGULAR',
    evidenceStrength: 'KUAT',
    evidenceSources: [
      {
        sourceType: 'STAFF_ASSESSMENT',
        reportedAt: '2026-08-02T10:15:00Z',
        status: 'Menghentikan Captopril karena batuk malam hari',
        notes: 'Dokter FKTP telah mengalihkan resep ke Amlodipine 5mg.'
      },
      {
        sourceType: 'CITIZEN_SELF_REPORT',
        reportedAt: '2026-07-20T08:30:00Z',
        status: 'Lapor via SMS Sahabat: Batuk tidak berhenti saat minum obat putih',
      }
    ],
    dominantCauses: [
      'SIDE_EFFECT_CONCERN',
      'LIVING_ALONE'
    ],
    systemFactorsIdentified: [],
    generatedAt: '2026-08-24T06:00:00Z',
    modelVersion: 'v2.0-shadow'
  },
  'CIT-8208-0078': {
    id: 'ADH-0078',
    citizenId: 'CIT-8208-0078',
    citizenName: 'La Usman',
    cycleId: 'CYCLE-2026-01',
    level: 'PARTIAL',
    evidenceStrength: 'SEDANG',
    evidenceSources: [
      {
        sourceType: 'MEDICATION_DISPENSE',
        reportedAt: '2026-05-10T11:00:00Z',
        status: 'Obat Metformin 500mg sempat kosong di Pustu, baru diambil 2 minggu kemudian',
        notes: 'Pencatatan farmasi: Stockout 14 hari.'
      }
    ],
    dominantCauses: [
      'MEDICATION_UNAVAILABLE'
    ],
    systemFactorsIdentified: [
      'Kekosongan stok obat di faskes pembina (Stok Kosong Farmasi)'
    ],
    generatedAt: '2026-08-24T06:00:00Z',
    modelVersion: 'v2.0-shadow'
  }
};

export const adherenceIntelligenceService = {
  getAdherenceIntelligence(citizenId: string): AdherenceIntelligenceResult | null {
    if (defaultResults[citizenId]) {
      return defaultResults[citizenId];
    }
    return {
      id: `ADH-${citizenId}`,
      citizenId,
      citizenName: 'Warga Terdaftar',
      cycleId: 'CYCLE-CURRENT',
      level: 'REGULAR',
      evidenceStrength: 'SEDANG',
      evidenceSources: [
        {
          sourceType: 'MEDICATION_DISPENSE',
          reportedAt: new Date().toISOString(),
          status: 'Pengambilan obat rutin tercatat di resep faskes',
        }
      ],
      dominantCauses: [],
      systemFactorsIdentified: [],
      generatedAt: new Date().toISOString(),
      modelVersion: 'v2.0-shadow'
    };
  },

  getAllAdherenceInsights(): AdherenceIntelligenceResult[] {
    return Object.values(defaultResults);
  },

  getInterventionEffectivenessPatterns() {
    return [
      {
        causeCategory: 'LUPA / FEELS HEALTHY',
        interventionType: 'Pengingat WhatsApp & Kunjungan Kader',
        sampleSize: 142,
        retentionBefore: 42,
        retentionAfter: 78,
        direction: 'MEMBAIK',
        note: 'Peningkatan kehadiran kontrol teramati setelah penerapan edukasi dialogis kader.'
      },
      {
        causeCategory: 'HAMBATAN MARITIM / TRANSPORT',
        interventionType: 'Buffer Stock 3 Bulan di Pustu Pesisir',
        sampleSize: 98,
        retentionBefore: 35,
        retentionAfter: 84,
        direction: 'MEMBAIK',
        note: 'Retensi pengobatan stabil tanpa terputus selama musim ombak tinggi.'
      },
      {
        causeCategory: 'OBAT KOSONG (MEDICATION_UNAVAILABLE)',
        interventionType: 'Buffer Stock Logistik Dinkes Terpadu',
        sampleSize: 64,
        retentionBefore: 50,
        retentionAfter: 92,
        direction: 'MEMBAIK',
        note: 'Penjaminan ketersediaan obat mengembalikan kepercayaan pasien untuk hadir faskes.'
      }
    ];
  }
};
