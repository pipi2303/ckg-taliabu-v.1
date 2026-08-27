import { CitizenHealthTwin } from '../types';

// Mock database of longitudinal digital twin representations
const initialTwins: Record<string, CitizenHealthTwin> = {
  'CIT-8208-0012': {
    citizenId: 'CIT-8208-0012',
    citizenName: 'Baharudin Ode',
    nikMasked: '8208010405******',
    desaName: 'Desa Pancado',
    kecamatanName: 'Taliabu Barat Daya',
    asOf: '2026-08-25T08:00:00Z',
    dataCompleteness: 'LENGKAP',
    twinVersion: 'v2.0-composite',
    staleStatus: false,
    observedState: {
      screeningCount: 3,
      lastSystolic: 158,
      lastDiastolic: 96,
      lastBloodSugar: 142,
      lastHbA1c: 6.8,
      confirmedDiagnoses: ['Hipertensi Primer Derajat II (ICD-10 I10)'],
      lastAttendedDate: '2026-07-15',
      medicationDispensesCount: 4,
      latestOutcomeStatus: 'BELUM_TERKONTROL',
    },
    careState: {
      crsCategory: 'ORANGE',
      activeCareTasksCount: 1,
      lastOutreachStage: 'KONTAK_KADER_DESA',
      nextFollowUpDue: '2026-08-28',
      monitoringCycleNumber: 3,
      controlStatus: 'BELUM_TERKONTROL',
    },
    longitudinalFactors: [
      {
        date: '2026-02-10',
        event: 'Skrining Awal CKG Posyandu Pancado',
        impact: 'TD 162/100 mmHg terdeteksi abnormalitas awal',
        source: 'POSYANDU',
      },
      {
        date: '2026-03-02',
        event: 'Konfirmasi Diagnosa FKTP Puskesmas Pancado',
        impact: 'Diagnosa Hipertensi Derajat II, resep Amlodipine 10mg',
        source: 'FASKES',
      },
      {
        date: '2026-05-12',
        event: 'Kunjungan Lapangan Kader (Kendala Ombak Laut)',
        impact: 'Penjadwalan ulang kontrol faskes karena cuaca buruk',
        source: 'KADER',
      },
      {
        date: '2026-07-15',
        event: 'Evaluasi Siklus II Puskesmas',
        impact: 'TD turun ke 158/96 mmHg, kepatuhan parsial',
        source: 'FASKES',
      },
    ],
    interventionHistory: [
      {
        id: 'INT-01',
        date: '2026-03-05',
        type: 'Pemberian Edukasi Rendah Garam & Pendamping Minum Obat',
        actor: 'Bidan Desa Pancado',
        result: 'Keluarga bersedia memantau minum obat harian',
      },
      {
        id: 'INT-02',
        date: '2026-05-14',
        type: 'Penyerahan Titipan Obat Melalui Posyandu Pesisir',
        actor: 'Kader Posyandu',
        result: 'Stok obat tersambung 30 hari',
      },
    ],
    outcomeHistory: [
      {
        date: '2026-02-10',
        parameter: 'Tekanan Darah Sistolik/Diastolik',
        value: '162/100 mmHg',
        status: 'ANOMALI',
      },
      {
        date: '2026-05-15',
        parameter: 'Tekanan Darah Kontrol',
        value: '154/94 mmHg',
        status: 'MEMBAIK',
      },
      {
        date: '2026-07-15',
        parameter: 'Tekanan Darah Siklus II',
        value: '158/96 mmHg',
        status: 'BELUM_TERKONTROL',
      },
    ],
    predictiveSignals: [
      {
        type: 'Risiko Putus Kontrol (PA-01)',
        level: 'HIGH',
        keyFactor: 'Tantangan transportasi perahu motor saat musim gelombang tinggi',
        generatedAt: '2026-08-24T06:00:00Z',
      },
      {
        type: 'Prioritas Pencegahan Lanjut (PA-07)',
        level: 'MEDIUM',
        keyFactor: 'Fluktuasi tekanan darah sistolik > 150 mmHg',
        generatedAt: '2026-08-24T06:00:00Z',
      },
    ],
  },
  'CIT-8208-0045': {
    citizenId: 'CIT-8208-0045',
    citizenName: 'Wa Ode Fatimah',
    nikMasked: '8208024412******',
    desaName: 'Desa Gela',
    kecamatanName: 'Taliabu Utara',
    asOf: '2026-08-25T08:00:00Z',
    dataCompleteness: 'LENGKAP',
    twinVersion: 'v2.0-composite',
    staleStatus: false,
    observedState: {
      screeningCount: 2,
      lastSystolic: 146,
      lastDiastolic: 90,
      lastBloodSugar: 210,
      lastHbA1c: 7.9,
      confirmedDiagnoses: ['Diabetes Melitus Tipe 2 (E11)', 'Hipertensi Derajat I (I10)'],
      lastAttendedDate: '2026-08-02',
      medicationDispensesCount: 3,
      latestOutcomeStatus: 'BELUM_TERKONTROL',
    },
    careState: {
      crsCategory: 'RED',
      activeCareTasksCount: 1,
      lastOutreachStage: 'KONTAK_TELEPON_PUSKESMAS',
      nextFollowUpDue: '2026-08-30',
      monitoringCycleNumber: 2,
      controlStatus: 'BELUM_TERKONTROL',
    },
    longitudinalFactors: [
      {
        date: '2026-03-15',
        event: 'Skrining CKG Posyandu Gela',
        impact: 'GDS 240 mg/dL & TD 150/92 mmHg',
        source: 'POSYANDU',
      },
      {
        date: '2026-04-05',
        event: 'Inisiasi Terapi Metformin 500mg di Puskesmas Gela',
        impact: 'Perlu evaluasi berkala fungsi ginjal dan gula darah',
        source: 'FASKES',
      },
    ],
    interventionHistory: [
      {
        id: 'INT-03',
        date: '2026-04-08',
        type: 'Konseling Nutrisi DM & Senam Kebugaran Lansia',
        actor: 'Nutrisionis Puskesmas Gela',
        result: 'Pasien memahami pembatasan konsumsi karbohidrat olahan',
      },
    ],
    outcomeHistory: [
      {
        date: '2026-03-15',
        parameter: 'Gula Darah Sewaktu (GDS)',
        value: '240 mg/dL',
        status: 'ANOMALI',
      },
      {
        date: '2026-08-02',
        parameter: 'Gula Darah Puasa (GDP)',
        value: '185 mg/dL',
        status: 'MEMBAIK',
      },
    ],
    predictiveSignals: [
      {
        type: 'Risiko Putus Kontrol (PA-01)',
        level: 'HIGH',
        keyFactor: 'Lansia tinggal sendiri dengan riwayat efek samping batuk pada ACEI',
        generatedAt: '2026-08-24T06:00:00Z',
      },
    ],
  },
};

export const digitalTwinService = {
  getDigitalTwin(citizenId: string): CitizenHealthTwin {
    if (initialTwins[citizenId]) {
      return initialTwins[citizenId];
    }

    // Default fallback twin for any registered citizen
    return {
      citizenId,
      citizenName: 'Warga Terdaftar',
      nikMasked: '820801******0001',
      desaName: 'Desa Bobong',
      kecamatanName: 'Taliabu Barat',
      asOf: new Date().toISOString(),
      dataCompleteness: 'PARSIAL',
      twinVersion: 'v2.0-composite',
      staleStatus: false,
      observedState: {
        screeningCount: 1,
        lastSystolic: 130,
        lastDiastolic: 85,
        confirmedDiagnoses: ['Observasi Tekanan Darah'],
        medicationDispensesCount: 1,
        latestOutcomeStatus: 'PERLU_KONFIRMASI',
      },
      careState: {
        crsCategory: 'YELLOW',
        activeCareTasksCount: 1,
        monitoringCycleNumber: 1,
        controlStatus: 'PERLU_KONFIRMASI',
      },
      longitudinalFactors: [
        {
          date: '2026-08-01',
          event: 'Pemeriksaan Skrining Terjadwal',
          impact: 'Data tercatat di sistem registry CKG',
          source: 'POSYANDU',
        },
      ],
      interventionHistory: [],
      outcomeHistory: [
        {
          date: '2026-08-01',
          parameter: 'Tekanan Darah Skrining',
          value: '130/85 mmHg',
          status: 'NORMAL_TINGGI',
        },
      ],
      predictiveSignals: [
        {
          type: 'Risiko Putus Kontrol (PA-01)',
          level: 'LOW',
          keyFactor: 'Akses faskes lancar dan kepatuhan awal baik',
          generatedAt: new Date().toISOString(),
        },
      ],
    };
  },

  getAllTwins(): CitizenHealthTwin[] {
    return Object.values(initialTwins);
  },
};
