import {
  AIModelDefinition,
  ModelTrainingSnapshot,
  ModelPrediction,
  ModelFeatureDefinition,
  PopulationForecast,
  CitizenHealthTwin,
  ScenarioSimulation,
  LearnedPopulationCluster,
  AdherenceIntelligenceResult,
  ModelPerformanceSnapshot,
  ModelFairnessFinding,
  ModelPredictionFeedback,
  AIIntelligenceMode,
} from '../types';

// Global AI Intelligence Mode (Default: SHADOW)
let currentAIIntelligenceMode: AIIntelligenceMode = 'SHADOW';
let generativeInsightCopilotEnabled: boolean = false;

// Initial Model Definitions (5 Core Governed Models)
const initialModels: AIModelDefinition[] = [
  {
    id: 'MDL-DROPOUT-01',
    modelCode: 'PA-01',
    modelName: 'Predictive Dropout Forecaster (Taliabu Archipelago Ensemble)',
    purpose: 'DROPOUT_RISK',
    version: 'v2.4-shadow',
    lifecycleStatus: 'SHADOW',
    trainingPeriodStart: '2024-01-01',
    trainingPeriodEnd: '2025-12-31',
    trainingPopulationDescription: 'Data historis kohort PTM 8 Puskesmas di Kabupaten Pulau Taliabu (n=3.420 warga terdaftar).',
    intendedUse: 'Mengidentifikasi warga dengan probabilitas tinggi tidak hadir pada jadwal kontrol berikutnya untuk meningkatkan atensi operasional faskes dan kader.',
    prohibitedUses: [
      'Menetapkan diagnosis klinis',
      'Mengurangi jumlah upaya penjangkauan atau layanan kesehatan',
      'Mengubah kategori risiko klinis CRS secara sepihak',
      'Menutup atau membatalkan Care Task'
    ],
    knownLimitations: [
      'Akurasi menurun pada desa terluar dengan keterlambatan sinkronisasi data kader > 14 hari',
      'Tidak memperhitungkan faktor cuaca badai mendadak jika data BMKG belum terintegrasi'
    ],
    minimumDataRequirements: [
      'Minimal 2 riwayat skrining/kunjungan terdahulu',
      'Status jarak tempuh geografis faskes terverifikasi'
    ],
    reviewDueAt: '2026-12-31',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'MDL-PREVENTION-07',
    modelCode: 'PA-07',
    modelName: 'Prevention Priority & Trajectory Engine',
    purpose: 'PREVENTION_PRIORITY',
    version: 'v1.8-shadow',
    lifecycleStatus: 'SHADOW',
    trainingPeriodStart: '2024-06-01',
    trainingPeriodEnd: '2025-12-31',
    trainingPopulationDescription: 'Populasi skrining CKG usia produktif & lansia di wilayah pesisir barat dan utara.',
    intendedUse: 'Mendeteksi pergeseran pola longitudinal tekanan darah/glukosa darah yang memerlukan edukasi preventif lebih intensif.',
    prohibitedUses: [
      'Menyatakan pasien pasti akan sakit tertentu kepada warga',
      'Merujuk atau meresepkan obat tanpa konfirmasi dokter',
      'Menggantikan stratifikasi risiko deterministik CRS'
    ],
    knownLimitations: [
      'Perlu data pemeriksaan berkala minimal 3 siklus untuk stabilitas pola'
    ],
    minimumDataRequirements: ['Minimal 2 observasi tensi/gula darah dalam 6 bulan'],
    reviewDueAt: '2026-11-30',
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'MDL-BURDEN-08',
    modelCode: 'PA-08',
    modelName: 'Population Health Burden & Medication Demand Predictor',
    purpose: 'POPULATION_BURDEN',
    version: 'v3.1-active',
    lifecycleStatus: 'ACTIVE',
    trainingPeriodStart: '2023-01-01',
    trainingPeriodEnd: '2025-12-31',
    trainingPopulationDescription: 'Data agregat pemakaian obat dan kunjungan kontrol 8 Puskesmas Taliabu.',
    intendedUse: 'Memberikan sinyal estimasi beban layanan kontrol dan proyeksi kebutuhan buffer stock obat hipertensi & diabetes bagi Dinas Kesehatan.',
    prohibitedUses: [
      'Menjadi target kinerja individu petugas kesehatan',
      'Melakukan pemotongan anggaran atau pengadaan obat otomatis tanpa persetujuan PPK/Dinkes',
      'Menghentikan layanan di faskes terpencil'
    ],
    knownLimitations: [
      'Proyeksi berbasis musim gelombang laut (Desember-Februari) memerlukan penyesuaian kalender nelayan lokal'
    ],
    minimumDataRequirements: ['Data agregat konsumsi obat dan kunjungan minimal 12 bulan'],
    reviewDueAt: '2026-10-15',
    activatedAt: '2026-03-01T09:00:00Z',
    activatedByUserId: 'usr-kadinkes-01',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'MDL-CLUSTER-10',
    modelCode: 'PA-10',
    modelName: 'Learned Population Pattern Clustering',
    purpose: 'LEARNED_CLUSTER',
    version: 'v1.2-shadow',
    lifecycleStatus: 'SHADOW',
    trainingPeriodStart: '2024-01-01',
    trainingPeriodEnd: '2025-12-31',
    trainingPopulationDescription: 'Klasterisasi pola kepatuhan, demografi dan kendala akses geografis di 71 desa.',
    intendedUse: 'Mengelompokkan pola populasi untuk membantu perumusan intervensi kesehatan masyarakat tingkat kecamatan.',
    prohibitedUses: [
      'Menetapkan diagnosis individu',
      'Menggantikan Klaster Deterministik CRS-CKG (MVP 3)',
      'Menampilkan klaster sel kecil yang berisiko membuka identitas warga'
    ],
    knownLimitations: [
      'Sensitif terhadap kesenjangan pencatatan laporan kader antar pulau'
    ],
    minimumDataRequirements: ['Data agregat tingkat desa > 20 responden'],
    reviewDueAt: '2026-12-15',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'MDL-ADHERENCE-05',
    modelCode: 'PRD-5/N-A',
    modelName: 'Multi-Source Medication Adherence Intelligence',
    purpose: 'ADHERENCE_PATTERN',
    version: 'v2.0-shadow',
    lifecycleStatus: 'SHADOW',
    trainingPeriodStart: '2024-01-01',
    trainingPeriodEnd: '2025-12-31',
    trainingPopulationDescription: 'Kombinasi data resep farmasi, asesmen perawat, laporan kader, dan respon mandiri warga.',
    intendedUse: 'Sintesis indikasi kepatuhan minum obat dan klasifikasi kendala sistemik (misal stok obat kosong) vs faktor personal.',
    prohibitedUses: [
      'Mengubah dosis, jenis, atau menghentikan terapi obat secara otomatis',
      'Menyalahkan pasien atas ketidakpatuhan ketika obat di faskes habis (MEDICATION_UNAVAILABLE)',
      'Mengurangi jadwal kunjungan pemantauan'
    ],
    knownLimitations: [
      'Pelaporan mandiri warga bersifat subjektif dan diverifikasi ulang saat kontrol faskes'
    ],
    minimumDataRequirements: ['Minimal 1 catatan pemberian obat dan 1 siklus monitoring'],
    reviewDueAt: '2026-11-15',
    createdAt: '2026-02-15T08:00:00Z',
  }
];

// Initial Governed Features
const initialFeatures: ModelFeatureDefinition[] = [
  {
    featureCode: 'FEAT-MISSED-VISITS-CNT',
    label: 'Frekuensi Kunjungan Kontrol Terlewat (12 Bulan)',
    dataSource: 'MonitoringCycle & Appointment Records',
    sensitivityLevel: 'OPERATIONAL',
    approvedForModels: ['PA-01', 'PA-07', 'PRD-5/N-A'],
    purposeJustification: 'Prediktor utama kontinuitas perawatan jangka panjang.',
    enabled: true,
    introducedAt: '2026-01-01T00:00:00Z'
  },
  {
    featureCode: 'FEAT-TRAVEL-BARRIER-SCORE',
    label: 'Indeks Kesulitan Akses Transportasi / Maritim',
    dataSource: 'Master Data Wilayah & Geografis Desa Taliabu',
    sensitivityLevel: 'OPERATIONAL',
    approvedForModels: ['PA-01', 'PA-08', 'PA-10'],
    purposeJustification: 'Menilai faktor kendala jarak tempuh dan ombak laut terhadap kehadiran kontrol.',
    enabled: true,
    introducedAt: '2026-01-01T00:00:00Z'
  },
  {
    featureCode: 'FEAT-MED-STOCKOUT-HISTORY',
    label: 'Riwayat Obat Tidak Terlayani Akibat Stok Kosong',
    dataSource: 'Pharmacy Dispense Records',
    sensitivityLevel: 'OPERATIONAL',
    approvedForModels: ['PRD-5/N-A', 'PA-08'],
    purposeJustification: 'Memisahkan kendala struktural faskes dari perilaku kepatuhan pasien.',
    enabled: true,
    introducedAt: '2026-01-01T00:00:00Z'
  },
  {
    featureCode: 'FEAT-OUTREACH-ATTEMPTS-CNT',
    label: 'Jumlah Upaya Kontak Outreach yang Diperlukan',
    dataSource: 'Outreach Attempt Logs',
    sensitivityLevel: 'OPERATIONAL',
    approvedForModels: ['PA-01', 'PRD-5/N-A'],
    purposeJustification: 'Mengidentifikasi kebutuhan pendampingan kader yang lebih intensif.',
    enabled: true,
    introducedAt: '2026-01-01T00:00:00Z'
  }
];

// Initial Model Predictions (With Explainable Factors)
const initialPredictions: ModelPrediction[] = [
  {
    id: 'PRED-CIT-8208-0012',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    citizenId: 'CIT-8208-0012',
    predictionType: 'DROPOUT_RISK',
    predictionLevel: 'HIGH',
    generatedAt: '2026-08-24T06:00:00Z',
    featureSnapshotId: 'SNAP-2026-08-24-001',
    topFactors: [
      {
        featureCode: 'FEAT-TRAVEL-BARRIER-SCORE',
        displayLabel: 'Aksesibilitas Perahu Motor & Cuaca Gelombang',
        contributionDirection: 'INCREASES',
        explanationText: 'Tinggal di desa pesisir terpencil dengan ketergantungan perahu nelayan saat cuaca buruk.'
      },
      {
        featureCode: 'FEAT-MISSED-VISITS-CNT',
        displayLabel: 'Riwayat 2 Kali Terlambat Kontrol Berturut-turut',
        contributionDirection: 'INCREASES',
        explanationText: 'Pernah melewatkan jadwal pengambilan obat kronis pada 2 bulan terakhir.'
      },
      {
        featureCode: 'FEAT-OUTREACH-ATTEMPTS-CNT',
        displayLabel: 'Memerlukan Kontak Berulang Kader',
        contributionDirection: 'INCREASES',
        explanationText: 'Respons penjangkauan memerlukan lebih dari 3 kali kontak oleh kader desa.'
      }
    ],
    uncertainty: {
      confidenceInterval: '78% - 94%',
      entropyScore: 0.12,
      dataQualityPenalty: 0.05
    },
    modelMode: 'SHADOW'
  },
  {
    id: 'PRED-CIT-8208-0045',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    citizenId: 'CIT-8208-0045',
    predictionType: 'DROPOUT_RISK',
    predictionLevel: 'HIGH',
    generatedAt: '2026-08-24T06:00:00Z',
    featureSnapshotId: 'SNAP-2026-08-24-002',
    topFactors: [
      {
        featureCode: 'FEAT-MED-SIDE-EFFECTS',
        displayLabel: 'Riwayat Keluhan Efek Samping Obat',
        contributionDirection: 'INCREASES',
        explanationText: 'Keluhan batuk saat mengonsumsi antihipertensi sebelumnya memerlukan evaluasi dokter.'
      },
      {
        featureCode: 'FEAT-LIVING-ALONE',
        displayLabel: 'Lansia Tanpa Pendamping Minum Obat (PMO)',
        contributionDirection: 'INCREASES',
        explanationText: 'Tinggal sendiri sehingga memerlukan pengingat rutin dari kader posyandu.'
      }
    ],
    uncertainty: {
      confidenceInterval: '65% - 82%',
      entropyScore: 0.18
    },
    modelMode: 'SHADOW'
  },
  {
    id: 'PRED-CIT-8208-0078',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    citizenId: 'CIT-8208-0078',
    predictionType: 'DROPOUT_RISK',
    predictionLevel: 'MEDIUM',
    generatedAt: '2026-08-24T06:00:00Z',
    featureSnapshotId: 'SNAP-2026-08-24-003',
    topFactors: [
      {
        featureCode: 'FEAT-OCCUPATION-SEASONAL',
        displayLabel: 'Pekerjaan Musiman Melaut / Berkebun',
        contributionDirection: 'INCREASES',
        explanationText: 'Sering berada di luar desa selama 1-2 minggu saat musim panen cengkeh.'
      },
      {
        featureCode: 'FEAT-GOOD-CITIZEN-APP-USE',
        displayLabel: 'Aktif Membaca Pengingat di Aplikasi Sahabat',
        contributionDirection: 'DECREASES',
        explanationText: 'Rutin merespons pesan WhatsApp pengingat dari Puskesmas.'
      }
    ],
    uncertainty: {
      confidenceInterval: '40% - 60%',
      entropyScore: 0.25
    },
    modelMode: 'SHADOW'
  },
  {
    id: 'PRED-CIT-8208-0105',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    citizenId: 'CIT-8208-0105',
    predictionType: 'DROPOUT_RISK',
    predictionLevel: 'LOW',
    generatedAt: '2026-08-24T06:00:00Z',
    featureSnapshotId: 'SNAP-2026-08-24-004',
    topFactors: [
      {
        featureCode: 'FEAT-PROXIMITY-PUSKESMAS',
        displayLabel: 'Jarak Dekat ke Faskes (< 1 km)',
        contributionDirection: 'DECREASES',
        explanationText: 'Domisili dekat dengan Puskesmas Bobong memudahkan kontrol mandiri.'
      },
      {
        featureCode: 'FEAT-PERFECT-ATTENDANCE',
        displayLabel: 'Kehadiran Kontrol 100% Tepat Waktu',
        contributionDirection: 'DECREASES',
        explanationText: 'Selalu hadir kontrol sebelum stok obat habis dalam 6 siklus terakhir.'
      }
    ],
    uncertainty: {
      confidenceInterval: '5% - 15%',
      entropyScore: 0.05
    },
    modelMode: 'SHADOW'
  },
  {
    id: 'PRED-CIT-8208-NEW-01',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    citizenId: 'CIT-8208-9999',
    predictionType: 'DROPOUT_RISK',
    predictionLevel: 'NOT_PREDICTABLE',
    generatedAt: '2026-08-24T06:00:00Z',
    featureSnapshotId: 'SNAP-2026-08-24-005',
    topFactors: [
      {
        featureCode: 'FEAT-INSUFFICIENT-HISTORY',
        displayLabel: 'Riwayat Belum Mencukupi',
        contributionDirection: 'NEUTRAL',
        explanationText: 'Warga baru terdaftar skrining pertama. Data longitudinal belum memenuhi syarat minimum model.'
      }
    ],
    modelMode: 'SHADOW'
  }
];

// Initial Fairness Findings
const initialFairnessFindings: ModelFairnessFinding[] = [
  {
    id: 'FIND-FAIR-01',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    comparisonDimension: 'GEOGRAPHY_ISLAND',
    affectedGroup: 'Desa Kepulauan Terluar (Kec. Taliabu Utara & Lede)',
    findingSummary: 'Tingkat false-positive prediksi putus perawatan lebih tinggi 14% di pulau terluar akibat keterlambatan sinkronisasi data kader luring, bukan karena ketidakhadiran nyata pasien.',
    severity: 'REVIEW',
    detectedAt: '2026-08-10T10:00:00Z',
    remediationDueAt: '2026-09-30T00:00:00Z',
    resolutionNotes: 'Sedang disiapkan penyesuaian bobot penalti waktu sinkronisasi pada data luring.'
  }
];

// Initial Staff Model Feedback (PA-09)
const initialFeedbacks: ModelPredictionFeedback[] = [
  {
    id: 'FB-01',
    predictionId: 'PRED-CIT-8208-0012',
    citizenId: 'CIT-8208-0012',
    userId: 'usr-dr-rizky',
    userName: 'dr. Rizky Pratama',
    userRole: 'DOCTOR',
    facilityName: 'Puskesmas Pancado',
    feedback: 'AGREE',
    reason: 'Pasien memang sempat terhalang ombak laut tinggi saat jadwal kontrol bulan Juli.',
    createdAt: '2026-08-24T09:30:00Z'
  },
  {
    id: 'FB-02',
    predictionId: 'PRED-CIT-8208-0045',
    citizenId: 'CIT-8208-0045',
    userId: 'usr-nurse-dewi',
    userName: 'Dewi Lestari, S.Kep',
    userRole: 'NURSE_MIDWIFE',
    facilityName: 'Puskesmas Gela',
    feedback: 'AGREE',
    reason: 'Kader desa sudah kami tugaskan mendampingi lansia untuk jadwal kontrol minggu depan.',
    createdAt: '2026-08-24T10:15:00Z'
  }
];

export const modelGovernanceRepo = {
  getAIIntelligenceMode(): AIIntelligenceMode {
    return currentAIIntelligenceMode;
  },

  setAIIntelligenceMode(mode: AIIntelligenceMode): void {
    currentAIIntelligenceMode = mode;
  },

  isGenerativeInsightCopilotEnabled(): boolean {
    return generativeInsightCopilotEnabled;
  },

  setGenerativeInsightCopilotEnabled(enabled: boolean): void {
    generativeInsightCopilotEnabled = enabled;
  },

  getAllModels(): AIModelDefinition[] {
    return [...initialModels];
  },

  getModelById(id: string): AIModelDefinition | undefined {
    return initialModels.find((m) => m.id === id || m.modelCode === id);
  },

  updateModelStatus(
    modelId: string,
    status: AIModelDefinition['lifecycleStatus'],
    actor: { userId: string; userName: string },
    reason?: string
  ): AIModelDefinition {
    const model = initialModels.find((m) => m.id === modelId || m.modelCode === modelId);
    if (!model) throw new Error(`Model ${modelId} tidak ditemukan.`);

    model.lifecycleStatus = status;
    if (status === 'ACTIVE') {
      model.activatedAt = new Date().toISOString();
      model.activatedByUserId = actor.userId;
      model.disabledAt = undefined;
      model.disabledByUserId = undefined;
      model.disableReason = undefined;
    } else if (status === 'PAUSED' || status === 'RETIRED') {
      model.disabledAt = new Date().toISOString();
      model.disabledByUserId = actor.userId;
      model.disableReason = reason || 'Dinonaktifkan oleh administrator';
    }
    return { ...model };
  },

  getAllFeatures(): ModelFeatureDefinition[] {
    return [...initialFeatures];
  },

  getAllPredictions(): ModelPrediction[] {
    return [...initialPredictions];
  },

  getPredictionsByCitizenId(citizenId: string): ModelPrediction[] {
    return initialPredictions.filter((p) => p.citizenId === citizenId);
  },

  getFairnessFindings(): ModelFairnessFinding[] {
    return [...initialFairnessFindings];
  },

  addFairnessFinding(finding: Omit<ModelFairnessFinding, 'id' | 'detectedAt'>): ModelFairnessFinding {
    const newFinding: ModelFairnessFinding = {
      ...finding,
      id: `FIND-FAIR-${Date.now()}`,
      detectedAt: new Date().toISOString()
    };
    initialFairnessFindings.unshift(newFinding);
    return newFinding;
  },

  getFeedbacks(): ModelPredictionFeedback[] {
    return [...initialFeedbacks];
  },

  addFeedback(feedback: Omit<ModelPredictionFeedback, 'id' | 'createdAt'>): ModelPredictionFeedback {
    const newFeedback: ModelPredictionFeedback = {
      ...feedback,
      id: `FB-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    initialFeedbacks.unshift(newFeedback);
    return newFeedback;
  }
};
