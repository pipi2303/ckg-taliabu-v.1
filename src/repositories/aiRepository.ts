import {
  AIPopulationForecast,
  AIDropoutPrediction,
  AIClinicalRecommendation,
  AIAdaptiveNudge,
  AIRouteOptimization,
  AIGovernanceConfig,
} from '../types';
import { simulateNetworkDelay } from './storage';

// Initial Mock Datasets for Pulau Taliabu AI Decision Intelligence
const initialForecasts: AIPopulationForecast[] = [
  {
    id: 'FC-TALIABU-2026-H2',
    generatedAt: '2026-08-24T06:30:00Z',
    facilityId: 'ALL',
    facilityName: 'Seluruh Faskes Kabupaten Pulau Taliabu',
    kecamatanName: 'Seluruh Kecamatan (8 Wilayah Puskesmas)',
    forecastMonths: [
      {
        monthLabel: 'Sep 2026',
        screenedProjected: 950,
        abnormalRiskProjected: 380,
        dropoutEstimated: 42,
        controlledProjected: 180,
        medicationDemand: {
          amlodipine10mgUnits: 2800,
          metformin500mgUnits: 3100,
          captopril25mgUnits: 1400,
        },
        maritimeRiskFactor: 0.35,
        seasonalWeatherNote: 'Akhir musim gelombang timur, pelayaran perahu motor berangsur normal.',
      },
      {
        monthLabel: 'Okt 2026',
        screenedProjected: 1100,
        abnormalRiskProjected: 440,
        dropoutEstimated: 35,
        controlledProjected: 220,
        medicationDemand: {
          amlodipine10mgUnits: 3200,
          metformin500mgUnits: 3500,
          captopril25mgUnits: 1600,
        },
        maritimeRiskFactor: 0.2,
        seasonalWeatherNote: 'Kondisi laut tenang (Pancaroba), aksesibilitas rujukan pulau optimal.',
      },
      {
        monthLabel: 'Nov 2026',
        screenedProjected: 1250,
        abnormalRiskProjected: 490,
        dropoutEstimated: 38,
        controlledProjected: 260,
        medicationDemand: {
          amlodipine10mgUnits: 3600,
          metformin500mgUnits: 3900,
          captopril25mgUnits: 1800,
        },
        maritimeRiskFactor: 0.25,
        seasonalWeatherNote: 'Cuaca stabil, disarankan distribusi logistik obat 3 bulan ke Pustu terpencil.',
      },
      {
        monthLabel: 'Des 2026',
        screenedProjected: 1050,
        abnormalRiskProjected: 410,
        dropoutEstimated: 52,
        controlledProjected: 240,
        medicationDemand: {
          amlodipine10mgUnits: 3400,
          metformin500mgUnits: 3600,
          captopril25mgUnits: 1700,
        },
        maritimeRiskFactor: 0.65,
        seasonalWeatherNote: 'Mulai musim angin barat laut (gelombang tinggi pesisir utara/Gela).',
      },
      {
        monthLabel: 'Jan 2027',
        screenedProjected: 900,
        abnormalRiskProjected: 360,
        dropoutEstimated: 58,
        controlledProjected: 210,
        medicationDemand: {
          amlodipine10mgUnits: 3300,
          metformin500mgUnits: 3400,
          captopril25mgUnits: 1650,
        },
        maritimeRiskFactor: 0.8,
        seasonalWeatherNote: 'Puncak musim barat. Risiko keterlambatan rujukan via laut mencapai 45%.',
      },
      {
        monthLabel: 'Feb 2027',
        screenedProjected: 920,
        abnormalRiskProjected: 370,
        dropoutEstimated: 50,
        controlledProjected: 230,
        medicationDemand: {
          amlodipine10mgUnits: 3200,
          metformin500mgUnits: 3300,
          captopril25mgUnits: 1600,
        },
        maritimeRiskFactor: 0.7,
        seasonalWeatherNote: 'Gelombang laut moderat-tinggi di perairan Taliabu Barat dan Selatan.',
      },
    ],
    keyRiskDrivers: [
      'Musim Gelombang Barat (Des-Feb) menaikkan risiko drop-out kontrol hingga 38% di desa pulau terluar (Lede & Jorjoga)',
      'Kebutuhan buffer stock Amlodipin & Metformin perlu dinaikkan +25% sebelum bulan Desember',
      'Kader posyandu membutuhkan pasokan alat tensimeter digital baterai cadangan di area non-PLN',
    ],
    recommendedStockActions: [
      'Lakukan pengadaan buffer stock obat kronis Dinkes pada bulan Oktober 2026',
      'Kirim paket obat 3-bulanan bagi pasien stabil di Pustu yang hanya bisa diakses perahu motor',
      'Koordinasikan pos rujukan darurat dengan kapal patroli Polairud/Dishub saat cuaca buruk',
    ],
    modelMetadata: {
      modelName: 'Gemini 3.7 Population Burden Forecaster (Taliabu Island Ensemble)',
      modelVersion: 'v2.4-maritime',
      confidenceScore: 0.88,
      trainingDataCutoff: '2026-08-23T23:59:00Z',
      isSimulationData: true,
    },
  },
];

const initialDropoutPredictions: AIDropoutPrediction[] = [
  {
    citizenId: 'CIT-8208-0012',
    citizenName: 'Baharudin Ode',
    nikMasked: '8208010405******',
    facilityName: 'Puskesmas Pancado',
    desaName: 'Desa Pancado (Pesisir)',
    riskScorePercent: 88,
    riskTier: 'HIGH_PREDICTED_DROPOUT',
    topPredictiveFactors: [
      { factor: 'Ketergantungan transportasi perahu motor tempel saat gelombang tinggi', impactWeight: 0.42, category: 'GEOGRAPHY' },
      { factor: 'Pernah melewatkan 2 jadwal kontrol obat berturut-turut', impactWeight: 0.28, category: 'ADHERENCE_HISTORY' },
      { factor: 'Keluhan pusing berkurang sehingga merasa sudah sembuh', impactWeight: 0.18, category: 'SOCIO_ECONOMIC' },
    ],
    recommendedPreventiveActions: [
      'Kunjungan rumah kader terdekat sebelum stok obat habis (H-3)',
      'Pemberian edukasi pentingnya terapi seumur hidup walau tanpa gejala',
      'Titip pasokan obat di bidan desa / Pustu Pancado',
    ],
    aiConfidence: 'HIGH',
    lastAssessedAt: '2026-08-24T04:15:00Z',
  },
  {
    citizenId: 'CIT-8208-0045',
    citizenName: 'Wa Ode Fatimah',
    nikMasked: '8208024412******',
    facilityName: 'Puskesmas Gela',
    desaName: 'Desa Gela',
    riskScorePercent: 74,
    riskTier: 'HIGH_PREDICTED_DROPOUT',
    topPredictiveFactors: [
      { factor: 'Riwayat efek samping batuk kering pada obat Captopril', impactWeight: 0.38, category: 'CLINICAL_BURDEN' },
      { factor: 'Tinggal sendiri tanpa pendamping minum obat (lansia)', impactWeight: 0.32, category: 'SOCIO_ECONOMIC' },
    ],
    recommendedPreventiveActions: [
      'Konsultasi dokter FKTP untuk pertimbangan alih terapi ke Amlodipin / ARB',
      'Penetapan kader pendamping minum obat (PMO) dari tetangga terdekat',
    ],
    aiConfidence: 'HIGH',
    lastAssessedAt: '2026-08-24T05:00:00Z',
  },
  {
    citizenId: 'CIT-8208-0089',
    citizenName: 'Hasanuddin Sula',
    nikMasked: '8208031508******',
    facilityName: 'Puskesmas Bobong',
    desaName: 'Desa Wayaloar',
    riskScorePercent: 58,
    riskTier: 'MODERATE_PREDICTED_DROPOUT',
    topPredictiveFactors: [
      { factor: 'Jadwal kerja melaut tidak menentu (nelayan musiman)', impactWeight: 0.45, category: 'SOCIO_ECONOMIC' },
      { factor: 'Lupa jadwal kontrol saat berada di laut', impactWeight: 0.35, category: 'ADHERENCE_HISTORY' },
    ],
    recommendedPreventiveActions: [
      'Pemberian paket obat bekal melaut 30 hari + wadah obat kedap air',
      'Pengingat SMS otomatis Sahabat Warga sebelum jadwal melaut',
    ],
    aiConfidence: 'MODERATE',
    lastAssessedAt: '2026-08-24T05:30:00Z',
  },
];

const initialClinicalRecommendations: AIClinicalRecommendation[] = [
  {
    id: 'REC-CLI-001',
    citizenId: 'CIT-8208-0012',
    patientName: 'Baharudin Ode',
    age: 56,
    gender: 'Laki-laki',
    encounterId: 'ENC-2026-08-01',
    observedFindings: {
      systolic: 168,
      diastolic: 102,
      randomBloodSugar: 142,
      bmi: 27.4,
      smokingStatus: true,
      comorbidities: ['Riwayat Merokok 20 tahun', 'Obesitas Tingkat 1'],
    },
    suggestedWorkingDiagnosis: {
      icd10Code: 'I10',
      diagnosisName: 'Hipertensi Primer Derajat 2 (Stage 2 Hypertension)',
      stageOrGrade: 'Derajat 2 (Tekanan Darah ≥ 160/100 mmHg)',
      confidencePercent: 94,
    },
    guidelineEvidence: {
      sourceGuideline: 'PMK No. 5 Tahun 2014 & Konsensus PERHI 2024 / Protokol CKG Kemenkes RI',
      referenceSection: 'Panduan Penatalaksanaan Hipertensi Primer di FKTP Bagian 4.2',
      rationaleExplanation: 'TD terukur 168/102 mmHg pada kunjungan ulang memenuhi kriteria Hipertensi Derajat 2 dengan risiko kardiovaskular tinggi karena adanya faktor risiko merokok aktif dan IMT > 27.',
    },
    recommendedTherapy: [
      {
        firstLineDrug: 'Amlodipine Tablet',
        initialDose: '5 mg - 10 mg',
        frequency: '1 x 1 tablet malam hari',
        specialInstructions: 'Evaluasi edema perifer pada pergelangan kaki setelah 2-4 minggu pemakaian.',
      },
      {
        firstLineDrug: 'Kombinasi ACEi/ARB (Alternatif Captopril 25 mg)',
        initialDose: '25 mg',
        frequency: '2 x 1/2 tablet (sebelum makan)',
        specialInstructions: 'Bila target TD < 140/90 mmHg belum tercapai dalam 4 minggu monoterapi.',
      },
    ],
    safetyAlerts: [
      {
        type: 'WARNING',
        severity: 'WARNING',
        message: 'Pasien memiliki riwayat batuk kronis ringan akibat rokok. Jika diberikan Captopril, monitor efek samping batuk kering yang dapat menurunkan kepatuhan.',
      },
      {
        type: 'INFO',
        severity: 'INFO',
        message: 'Kombinasi dua obat antihipertensi dosis rendah dianjurkan untuk mencapai target penurunan TD secara stabil.',
      },
    ],
    lifestylePrescription: [
      'Kurangi konsumsi garam harian hingga < 1 sendok teh (5 gram NaCl / hari)',
      'Konseling berhenti merokok bertahap dengan pendampingan kader desa',
      'Jalan santai/aktivitas fisik minimal 30 menit 5 kali seminggu',
    ],
    humanReviewStatus: 'APPROVED_BY_CLINICIAN',
    reviewedByDoctorName: 'dr. Andi Pratama, Sp.PD / Dokter FKTP',
    reviewedAt: '2026-08-24T06:10:00Z',
    clinicianNotes: 'Setuju dengan rekomendasi Amlodipine 5 mg monoterapi awal terlebih dahulu sebelum kombinasi.',
  },
  {
    id: 'REC-CLI-002',
    citizenId: 'CIT-8208-0045',
    patientName: 'Wa Ode Fatimah',
    age: 64,
    gender: 'Perempuan',
    encounterId: 'ENC-2026-08-02',
    observedFindings: {
      systolic: 154,
      diastolic: 92,
      fastingBloodSugar: 198,
      randomBloodSugar: 278,
      hba1c: 8.8,
      bmi: 24.1,
      smokingStatus: false,
      comorbidities: ['Diabetes Melitus Tipe 2', 'Riwayat Asam Lambung (Dispepsia)'],
    },
    suggestedWorkingDiagnosis: {
      icd10Code: 'E11.9 & I10',
      diagnosisName: 'Diabetes Melitus Tipe 2 Tidak Terkontrol + Hipertensi Derajat 1',
      stageOrGrade: 'HbA1c 8.8% (Target Lansia < 7.5%)',
      confidencePercent: 96,
    },
    guidelineEvidence: {
      sourceGuideline: 'Pedoman Pengelolaan dan Pencegahan DMT2 PERKENI 2024 & Panduan CKG FKTP',
      referenceSection: 'Bab III Penatalaksanaan Farmakologis Kombinasi Metformin',
      rationaleExplanation: 'Gula darah puasa > 126 mg/dL dan sewaktu > 200 mg/dL disertai gejala klasik memerlukan inisiasi terapi antidiabetik oral dengan proteksi organ ginjal/jantung.',
    },
    recommendedTherapy: [
      {
        firstLineDrug: 'Metformin HCl 500 mg',
        initialDose: '500 mg',
        frequency: '2 x 1 tablet (bersama/sesudah makan)',
        specialInstructions: 'Minum bersama makanan untuk meminimalkan efek samping dispepsia/mual.',
      },
      {
        firstLineDrug: 'Amlodipine 5 mg',
        initialDose: '5 mg',
        frequency: '1 x 1 tablet pagi/malam',
        specialInstructions: 'Netral terhadap metabolisme glukosa dan aman untuk fungsi ginjal lansia.',
      },
    ],
    safetyAlerts: [
      {
        type: 'RENAL_ADJUSTMENT',
        severity: 'WARNING',
        message: 'Lakukan pemeriksaan berkala serum kreatinin / eGFR sebelum menaikkan dosis Metformin di atas 1000 mg/hari pada pasien usia > 60 tahun.',
      },
      {
        type: 'INFO',
        severity: 'INFO',
        message: 'Hindari obat golongan Sulfonilurea (Glibenklamid) dosis tinggi karena risiko hipoglikemia berat pada lansia yang tinggal sendiri.',
      },
    ],
    lifestylePrescription: [
      'Pola makan porsi gizi seimbang "Isi Piringku", batasi makanan berpemanis dan sagu berlebih',
      'Pemeriksaan rutin kaki setiap hari untuk mencegah luka diabetes',
      'Kontrol berkala gula darah ke Puskesmas setiap 1 bulan sekali',
    ],
    humanReviewStatus: 'PENDING_REVIEW',
  },
];

const initialNudges: AIAdaptiveNudge[] = [
  {
    id: 'NDG-001',
    citizenId: 'CIT-8208-0012',
    citizenName: 'Baharudin Ode',
    targetDialect: 'MELAYU_TALIABU',
    nudgeObjective: 'PENGINGAT_MINUM_OBAT',
    generatedMessage: 'Tabea Bapa Baharudin, inga malam ini minum obat tensi e. Walau su rasa badan enteng, tensi musti dijaga biar lancar melaut besok. Salam hormat dari Kader Sitti di Posyandu Pancado.',
    empathyTone: 'Hangat, Menghormati, Kultural Pesisir',
    channel: 'WHATSAPP_KADER',
    readinessScore: 92,
    createdAt: '2026-08-24T06:00:00Z',
    status: 'SENT',
    citizenResponseNote: 'Bapa Baharudin membalas: "Iyo deng terimakasih, su minum tadi."',
  },
  {
    id: 'NDG-002',
    citizenId: 'CIT-8208-0045',
    citizenName: 'Wa Ode Fatimah',
    targetDialect: 'BAHASA_SEDERHANA_LANSIA',
    nudgeObjective: 'JADWAL_KONTROL_PUSKESMAS',
    generatedMessage: 'Selamat pagi Ibu Fatimah. Besok hari Selasa ada pemeriksaan kesehatan rutin di Puskesmas Gela. Petugas sudah siapkan obat baru yang tidak bikin batuk. Nanti ada Kader dampingi ke faskes.',
    empathyTone: 'Lembut, Memberi Solusi atas Kekhawatiran Pasien',
    channel: 'KUNJUNGAN_TATAP_MUKA',
    readinessScore: 85,
    createdAt: '2026-08-24T06:20:00Z',
    status: 'DRAFT',
  },
];

const initialRouteOptimizations: AIRouteOptimization[] = [
  {
    id: 'RO-LEDE-20260824',
    kaderId: 'USR-KAD-001',
    kaderName: 'Nurhaliza (Kader Desa Lede)',
    desaCoverage: 'Desa Lede & Dusun Pesisir Tanjung',
    planDate: '2026-08-24',
    seaWaveCondition: 'GELOMBANG_SEDANG',
    weatherAlert: 'Angin kencang pukul 13:00-16:00. Disarankan rute pesisir dilakukan pagi hari.',
    optimizedWaypoints: [
      {
        order: 1,
        citizenId: 'CIT-8208-0089',
        citizenName: 'Hasanuddin Sula',
        dusunOrRt: 'RT 02 Dusun Nelayan',
        priorityReason: 'Stok obat hipertensi habis hari ini (Prioritas Utama)',
        estimatedTravelMinutes: 15,
        recommendedTransport: 'JALAN_KAKI',
        isUrgentCase: true,
      },
      {
        order: 2,
        citizenId: 'CIT-8208-0094',
        citizenName: 'Maryam Taher',
        dusunOrRt: 'RT 04 Pesisir Barat',
        priorityReason: 'Follow-up CKG Gula Darah Tinggi belum hadir kontrol 14 hari',
        estimatedTravelMinutes: 25,
        recommendedTransport: 'MOTOR',
        isUrgentCase: true,
      },
      {
        order: 3,
        citizenId: 'CIT-8208-0102',
        citizenName: 'La Ode Jafar',
        dusunOrRt: 'Dusun Pulau Seberang',
        priorityReason: 'Edukasi kepatuhan minum obat rutin',
        estimatedTravelMinutes: 40,
        recommendedTransport: 'PERAHU_MOTOR_TEMPEL',
        isUrgentCase: false,
      },
    ],
    totalEstimatedHours: 3.5,
    safetyAdvisory: 'Gunakan jaket pelampung saat menyeberang ke Dusun Pulau Seberang sebelum jam 12:00.',
  },
];

const initialGovernanceConfig: AIGovernanceConfig = {
  aiModelProvider: 'Google Gemini Pro / Flash SDK (Hybrid Ensemble)',
  activeModelName: 'gemini-3.7-flash (Clinical Decision Grounding v2.4)',
  isHumanInTheLoopEnforced: true,
  maxDailyInferences: 5000,
  auditRetentionDays: 365,
  allowedRolesForClinicalCopilot: ['DOCTOR', 'ADMIN_DINKES', 'KEPALA_DINAS', 'KEPALA_PUSKESMAS'],
  safetyGuardrailStrictness: 'STRICT_CLINICAL',
  disclaimerText: 'PERHATIAN: Seluruh saran diagnostik, terapi, dan prediksi AI merupakan alat bantu pendukung keputusan (clinical decision support). Tanggung jawab klinis dan penetapan resep definitif sepenuhnya berada pada dokter pemeriksa berizin.',
};

export const aiRepository = {
  async getPopulationForecasts(): Promise<AIPopulationForecast[]> {
    await simulateNetworkDelay();
    return [...initialForecasts];
  },

  async getDropoutPredictions(): Promise<AIDropoutPrediction[]> {
    await simulateNetworkDelay();
    return [...initialDropoutPredictions];
  },

  async getClinicalRecommendations(): Promise<AIClinicalRecommendation[]> {
    await simulateNetworkDelay();
    return [...initialClinicalRecommendations];
  },

  async getClinicalRecommendationById(id: string): Promise<AIClinicalRecommendation | undefined> {
    await simulateNetworkDelay();
    return initialClinicalRecommendations.find((r) => r.id === id);
  },

  async updateClinicalRecommendationReview(
    id: string,
    status: AIClinicalRecommendation['humanReviewStatus'],
    doctorName: string,
    notes?: string
  ): Promise<AIClinicalRecommendation> {
    await simulateNetworkDelay();
    const index = initialClinicalRecommendations.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Clinical recommendation ${id} not found`);
    }
    const updated: AIClinicalRecommendation = {
      ...initialClinicalRecommendations[index],
      humanReviewStatus: status,
      reviewedByDoctorName: doctorName,
      reviewedAt: new Date().toISOString(),
      clinicianNotes: notes,
    };
    initialClinicalRecommendations[index] = updated;
    return updated;
  },

  async getNudges(): Promise<AIAdaptiveNudge[]> {
    await simulateNetworkDelay();
    return [...initialNudges];
  },

  async createNudge(nudge: Omit<AIAdaptiveNudge, 'id' | 'createdAt'>): Promise<AIAdaptiveNudge> {
    await simulateNetworkDelay();
    const newNudge: AIAdaptiveNudge = {
      ...nudge,
      id: `NDG-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    initialNudges.unshift(newNudge);
    return newNudge;
  },

  async getRouteOptimizations(): Promise<AIRouteOptimization[]> {
    await simulateNetworkDelay();
    return [...initialRouteOptimizations];
  },

  async getGovernanceConfig(): Promise<AIGovernanceConfig> {
    await simulateNetworkDelay();
    return { ...initialGovernanceConfig };
  },

  async updateGovernanceConfig(config: Partial<AIGovernanceConfig>): Promise<AIGovernanceConfig> {
    await simulateNetworkDelay();
    Object.assign(initialGovernanceConfig, config);
    return { ...initialGovernanceConfig };
  },
};
