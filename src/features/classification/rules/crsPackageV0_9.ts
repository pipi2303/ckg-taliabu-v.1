import { ClinicalOpenIssue, ClinicalRulePackage } from '../../../types';

/**
 * CRS-CKG v0.9 has eight open issues (PRD-CKG 2/N §1.3). Only OI-01 through OI-06 impact
 * this module's rule package directly — OI-07 (dasar obat gratis 15 hari) and OI-08 (kriteria
 * terkendali) are explicitly scoped to PRD-CKG 5/N and 6/N respectively ("Tidak berdampak pada
 * modul ini" / "Berdampak pada PRD-CKG 6/N, bukan modul ini") and are already governed
 * independently by medicationRunoutService and controlStatusEngine — they are intentionally
 * NOT duplicated here.
 */
export const OPEN_ISSUES_V0_9: ClinicalOpenIssue[] = [
  {
    code: 'OI-01',
    domain: 'LP',
    title: 'Ambang Profil Lipid Belum Terverifikasi',
    description:
      'Ambang batas klinis untuk fraksi profil lipid (Kolesterol Total, LDL, HDL, Trigliserida) pada CRS-CKG v0.9 masih dalam tahap telaah klinis Komite Medis Dinkes Pulau Taliabu dan belum disetujui untuk penentuan klasifikasi mandiri. Domain lipid tidak dievaluasi; ambang tidak boleh ditebak dari pedoman lain.',
    status: 'OPEN',
    affectedRules: ['CR-LP-01'],
  },
  {
    code: 'OI-02',
    domain: 'GZ',
    title: 'Kriteria ORCD (Rujukan Lanjut Obesitas) Belum Ditetapkan',
    description:
      'Kriteria Obesity-Related Comorbidity/Disease (ORCD) yang menentukan kapan obesitas dirujuk lanjut belum disahkan. Tindak lanjut obesitas untuk sementara berhenti pada modifikasi gaya hidup (konseling); percabangan rujukan lanjut tidak aktif sampai OI-02 ditutup.',
    status: 'OPEN',
    affectedRules: ['CR-GZ-04', 'CR-GZ-05'],
  },
  {
    code: 'OI-03',
    domain: 'GD',
    title: 'Definisi Risiko Tinggi Prediabetes Belum Final',
    description:
      'Protokol pembedaan tindak lanjut antara prediabetes murni dan prediabetes dengan risiko kardiovaskular tinggi (rencana CR-GD-13/CR-GD-14) masih menunggu validasi pedoman teknis regional; kedua percabangan untuk sementara digabung ke CR-GD-02.',
    status: 'OPEN',
    affectedRules: ['CR-GD-02'],
  },
  {
    code: 'OI-04',
    domain: 'GD',
    title: 'Kriteria Remisi Memerlukan Data di Luar CKG',
    description:
      'Penetapan status remisi (mis. remisi Diabetes Melitus) memerlukan data longitudinal (HbA1c, GD2JPP berkala) di luar paket data CKG. Status remisi tidak pernah ditetapkan otomatis oleh mesin aturan selama OI-04 terbuka.',
    status: 'OPEN',
    affectedRules: [],
  },
  {
    code: 'OI-05',
    domain: 'GZ',
    title: 'Celah Rentang IMT pada Nilai Tepat 30,0',
    description:
      'Juknis mendefinisikan Obesitas Tingkat I sebagai IMT 25,0-29,9 kg/m² dan Obesitas Tingkat II sebagai "> 30", sehingga nilai IMT tepat 30,0 tidak tercakup keduanya. Nilai tepat 30,0 (tanpa obesitas sentral independen) masuk antrean tinjauan klinis dan tidak diklasifikasikan otomatis selama OI-05 terbuka.',
    status: 'OPEN',
    affectedRules: ['CR-GZ-04', 'CR-GZ-05'],
  },
  {
    code: 'OI-06',
    domain: 'BP',
    title: 'Skrining Geriatri (≥60 Tahun) di Luar Cakupan MVP',
    description:
      'Protokol skrining dan ambang batas khusus kelompok usia lanjut (≥60 tahun) — termasuk penyesuaian ambang tekanan darah dan gula darah — belum ditetapkan pada CRS-CKG v0.9. Kelompok usia ini dievaluasi memakai ambang dewasa umum sampai OI-06 ditutup; ini bukan kesalahan penghitungan usia, melainkan batas cakupan MVP yang disengaja.',
    status: 'OPEN',
    affectedRules: [],
  },
];

export const CRS_OPEN_ISSUES = OPEN_ISSUES_V0_9;

export const CRS_CKG_V0_9: ClinicalRulePackage = {
  version: 'CRS-CKG v0.9',
  status: 'DRAFT',
  clinicalReviewStatus: 'NOT_REVIEWED',
  openIssues: OPEN_ISSUES_V0_9,
  rules: [
    // ==========================================
    // DOMAIN: BP (Blood Pressure / Tekanan Darah)
    // ==========================================
    {
      ruleCode: 'CR-BP-01',
      domain: 'BP',
      domainName: 'Tekanan Darah',
      name: 'Tekanan Darah Optimal / Normal',
      description: 'Sistolik < 120 mmHg DAN Diastolik < 80 mmHg',
      conditions: [
        { field: 'systolic', operator: 'LT', value: 120 },
        { field: 'diastolic', operator: 'LT', value: 80 },
      ],
      resultingCategory: 'GREEN',
      juknisCategory: 'NORMAL_NO_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'PERIODIC_SCREENING',
          actionText: 'Skrining kesehatan berkala 1 tahun sekali pada posyandu/faskes.',
          suggestedRole: 'Kader / PJ CKG',
          intervalValue: 12,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-BP-02',
      domain: 'BP',
      domainName: 'Tekanan Darah',
      name: 'Pre-Hipertensi',
      description: 'Sistolik 120-139 mmHg ATAU Diastolik 80-89 mmHg',
      conditions: [
        { field: 'systolic', operator: 'BETWEEN', value: 120, secondaryValue: 139 },
        { field: 'diastolic', operator: 'BETWEEN', value: 80, secondaryValue: 89 },
      ],
      resultingCategory: 'YELLOW',
      juknisCategory: 'NORMAL_WITH_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'LIFESTYLE_COUNSELING',
          actionText: 'Konseling pembatasan konsumsi garam, aktivitas fisik teratur, dan kontrol tensi ulang dalam 6 bulan.',
          suggestedRole: 'PJ CKG / Perawat',
          intervalValue: 6,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-BP-03',
      domain: 'BP',
      domainName: 'Tekanan Darah',
      name: 'Hipertensi Derajat 1',
      description: 'Sistolik 140-159 mmHg ATAU Diastolik 90-99 mmHg',
      conditions: [
        { field: 'systolic', operator: 'BETWEEN', value: 140, secondaryValue: 159 },
        { field: 'diastolic', operator: 'BETWEEN', value: 90, secondaryValue: 99 },
      ],
      resultingCategory: 'RED',
      juknisCategory: 'DISEASE_FPKTP_COMPETENCE',
      critical: false,
      requiresConfirmation: true,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'CLINICAL_CONFIRMATION',
          actionText: 'Pengukuran konfirmasi tekanan darah ulang di FKTP dan penetapan tata laksana farmakoterapi standar.',
          suggestedRole: 'Dokter / PJ CKG',
          intervalValue: 14,
          intervalUnit: 'DAYS',
        },
      ],
    },
    {
      ruleCode: 'CR-BP-04',
      domain: 'BP',
      domainName: 'Tekanan Darah',
      name: 'Hipertensi Derajat 2',
      description: 'Sistolik 160-179 mmHg ATAU Diastolik 100-119 mmHg',
      conditions: [
        { field: 'systolic', operator: 'BETWEEN', value: 160, secondaryValue: 179 },
        { field: 'diastolic', operator: 'BETWEEN', value: 100, secondaryValue: 119 },
      ],
      resultingCategory: 'DARK_RED',
      juknisCategory: 'DISEASE_FPKTP_COMPETENCE',
      critical: false,
      requiresConfirmation: true,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'FPKTP_URGENT_EVALUATION',
          actionText: 'Evaluasi klinis segera oleh dokter Puskesmas dalam waktu < 7 hari dan pertimbangan terapi kombinasi.',
          suggestedRole: 'Dokter Puskesmas',
          intervalValue: 7,
          intervalUnit: 'DAYS',
        },
      ],
    },
    {
      ruleCode: 'CR-BP-CRIT-01',
      domain: 'BP',
      domainName: 'Tekanan Darah',
      name: 'Krisis Hipertensi / Urgensi Kritis',
      description: 'Sistolik >= 180 mmHg ATAU Diastolik >= 120 mmHg',
      conditions: [
        { field: 'systolic', operator: 'GTE', value: 180 },
        { field: 'diastolic', operator: 'GTE', value: 120 },
      ],
      resultingCategory: 'DARK_RED',
      juknisCategory: 'DISEASE_REQUIRES_FKRTL',
      critical: true,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'EMERGENCY_TRIAGE',
          actionText: 'Temuan Kritis: Triage gawat darurat faskes segera (< 24 jam) untuk mencegah kerusakan target organ akut.',
          suggestedRole: 'Dokter IGD / Puskesmas',
          intervalValue: 1,
          intervalUnit: 'DAYS',
        },
      ],
    },

    // ==========================================
    // DOMAIN: GD (Gula Darah / Blood Glucose)
    // ==========================================
    {
      ruleCode: 'CR-GD-01',
      domain: 'GD',
      domainName: 'Gula Darah',
      name: 'Gula Darah Normal',
      description: 'Gula Darah Puasa (GDP) < 100 mg/dL ATAU Gula Darah Sewaktu (GDS) < 140 mg/dL',
      conditions: [
        { field: 'gdp', operator: 'LT', value: 100 },
        { field: 'gds', operator: 'LT', value: 140 },
      ],
      resultingCategory: 'GREEN',
      juknisCategory: 'NORMAL_NO_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'PERIODIC_SCREENING',
          actionText: 'Skrining kadar gula darah berkala 1 tahun sekali.',
          suggestedRole: 'Kader / PJ CKG',
          intervalValue: 12,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GD-02',
      domain: 'GD',
      domainName: 'Gula Darah',
      name: 'Pre-Diabetes (Toleransi Glukosa Terganggu)',
      description: 'GDP 100-125 mg/dL ATAU GDS 140-199 mg/dL',
      conditions: [
        { field: 'gdp', operator: 'BETWEEN', value: 100, secondaryValue: 125 },
        { field: 'gds', operator: 'BETWEEN', value: 140, secondaryValue: 199 },
      ],
      resultingCategory: 'ORANGE',
      juknisCategory: 'PRE_DISEASE',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'PREDIABETES_INTERVENTION',
          actionText: 'Konseling gizi pengendalian asupan karbohidrat sederhana, aktivitas aerobik, dan evaluasi ulang dalam 3-6 bulan.',
          suggestedRole: 'Nutrisionis / PJ CKG',
          intervalValue: 3,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GD-03',
      domain: 'GD',
      domainName: 'Gula Darah',
      name: 'Terduga Diabetes Melitus',
      description: 'GDP >= 126 mg/dL ATAU GDS 200-399 mg/dL',
      conditions: [
        { field: 'gdp', operator: 'GTE', value: 126 },
        { field: 'gds', operator: 'BETWEEN', value: 200, secondaryValue: 399 },
      ],
      resultingCategory: 'RED',
      juknisCategory: 'DISEASE_FPKTP_COMPETENCE',
      critical: false,
      requiresConfirmation: true,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'DIABETES_CONFIRMATORY_LAB',
          actionText: 'Uji konfirmasi laboratorium GDP/GD2PP atau HbA1c di Puskesmas untuk penegakan diagnosis definitif.',
          suggestedRole: 'Dokter / Petugas Lab',
          intervalValue: 14,
          intervalUnit: 'DAYS',
        },
      ],
    },
    {
      ruleCode: 'CR-GD-CRIT-01',
      domain: 'GD',
      domainName: 'Gula Darah',
      name: 'Krisis Glikemik Berat / Hipoglikemia Berat',
      description: 'GDS >= 400 mg/dL ATAU GDS < 54 mg/dL',
      conditions: [
        { field: 'gds', operator: 'GTE', value: 400 },
        { field: 'gds', operator: 'LT', value: 54 },
      ],
      resultingCategory: 'DARK_RED',
      juknisCategory: 'DISEASE_REQUIRES_FKRTL',
      critical: true,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'EMERGENCY_GLYCEMIC_PROTOCOL',
          actionText: 'Temuan Kritis: Tatalaksana kedaruratan krisis hiperglikemia (KAD/HHS) atau hipoglikemia berat segera di faskes.',
          suggestedRole: 'Dokter Puskesmas / IGD',
          intervalValue: 1,
          intervalUnit: 'DAYS',
        },
      ],
    },

    // ==========================================
    // DOMAIN: GZ (Gizi / Antropometri)
    // ==========================================
    {
      ruleCode: 'CR-GZ-01',
      domain: 'GZ',
      domainName: 'Status Gizi & Antropometri',
      name: 'Status Gizi Baik / Normal',
      description: 'IMT 18.5 - 22.9 kg/m2 dan Lingkar Perut Normal (L < 90 cm, P < 80 cm)',
      conditions: [
        { field: 'bmi', operator: 'BETWEEN', value: 18.5, secondaryValue: 22.9 },
        { field: 'waistCircumferenceMale', operator: 'LT', value: 90 },
        { field: 'waistCircumferenceFemale', operator: 'LT', value: 80 },
      ],
      resultingCategory: 'GREEN',
      juknisCategory: 'NORMAL_NO_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'HEALTH_MAINTENANCE',
          actionText: 'Pertahankan pola gizi seimbang Isi Piringku dan pantau berat badan mandiri bulanan.',
          suggestedRole: 'Kader',
          intervalValue: 12,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GZ-02',
      domain: 'GZ',
      domainName: 'Status Gizi & Antropometri',
      name: 'Gizi Kurang (Underweight)',
      description: 'IMT < 18.5 kg/m2',
      conditions: [{ field: 'bmi', operator: 'LT', value: 18.5 }],
      resultingCategory: 'YELLOW',
      juknisCategory: 'NORMAL_WITH_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'NUTRITION_SUPPORT',
          actionText: 'Skrining penyakit penyerta kronis (TB/malnutrisi) dan edukasi peningkatan asupan nutrisi padat gizi.',
          suggestedRole: 'Nutrisionis / Perawat',
          intervalValue: 3,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GZ-03',
      domain: 'GZ',
      domainName: 'Status Gizi & Antropometri',
      name: 'Kelebihan Berat Badan (Overweight)',
      description: 'IMT 23.0 - 24.9 kg/m2',
      conditions: [{ field: 'bmi', operator: 'BETWEEN', value: 23.0, secondaryValue: 24.9 }],
      resultingCategory: 'YELLOW',
      juknisCategory: 'NORMAL_WITH_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'WEIGHT_CONTROL',
          actionText: 'Edukasi defisit kalori ringan 300-500 kkal/hari dan peningkatan aktivitas fisik 150 menit/minggu.',
          suggestedRole: 'PJ CKG / Kader',
          intervalValue: 6,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GZ-04',
      domain: 'GZ',
      domainName: 'Status Gizi & Antropometri',
      name: 'Obesitas Tingkat I & Obesitas Sentral',
      description: 'IMT 25.0 - 29.9 kg/m2 ATAU Lingkar Perut Pria >= 90 cm / Wanita >= 80 cm',
      conditions: [
        { field: 'bmi', operator: 'BETWEEN', value: 25.0, secondaryValue: 29.9 },
        { field: 'waistCircumferenceMale', operator: 'GTE', value: 90 },
        { field: 'waistCircumferenceFemale', operator: 'GTE', value: 80 },
      ],
      resultingCategory: 'ORANGE',
      juknisCategory: 'PRE_DISEASE',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'OBESITY_PROGRAM',
          actionText: 'Konseling terstruktur tata laksana obesitas terpadu di FPKTP dan pemantauan faktor risiko metabolik.',
          suggestedRole: 'Nutrisionis / Dokter',
          intervalValue: 3,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-GZ-05',
      domain: 'GZ',
      domainName: 'Status Gizi & Antropometri',
      name: 'Obesitas Tingkat II (Morbid)',
      description: 'IMT >= 30.0 kg/m2',
      conditions: [{ field: 'bmi', operator: 'GTE', value: 30.0 }],
      resultingCategory: 'RED',
      juknisCategory: 'DISEASE_FPKTP_COMPETENCE',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'COMPREHENSIVE_OBESITY_CARE',
          actionText: 'Evaluasi komorbid kardiovaskular, sindrom metabolik, dan penyusunan program penurunan berat badan intensif.',
          suggestedRole: 'Dokter Puskesmas',
          intervalValue: 1,
          intervalUnit: 'MONTHS',
        },
      ],
    },

    // ==========================================
    // DOMAIN: PL (Perilaku / Gaya Hidup)
    // ==========================================
    {
      ruleCode: 'CR-PL-01',
      domain: 'PL',
      domainName: 'Perilaku & Gaya Hidup',
      name: 'Perilaku Hidup Sehat',
      description: 'Tidak merokok harian dan aktivitas fisik cukup (>= 150 menit/minggu)',
      conditions: [
        { field: 'smokingStatus', operator: 'EQ', value: 'NON_SMOKER' },
        { field: 'physicalActivity', operator: 'EQ', value: 'SUFFICIENT' },
      ],
      resultingCategory: 'GREEN',
      juknisCategory: 'NORMAL_NO_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'PROMOTIVE_MAINTENANCE',
          actionText: 'Apresiasi perilaku hidup bersih dan sehat (PHBS) dan pembiasaan aktivitas fisik rutin.',
          suggestedRole: 'Kader',
          intervalValue: 12,
          intervalUnit: 'MONTHS',
        },
      ],
    },
    {
      ruleCode: 'CR-PL-02',
      domain: 'PL',
      domainName: 'Perilaku & Gaya Hidup',
      name: 'Faktor Risiko Perilaku (Merokok / Sedenter)',
      description: 'Merokok aktif setiap hari ATAU aktivitas fisik kurang (< 150 menit/minggu)',
      conditions: [
        { field: 'smokingStatus', operator: 'EQ', value: 'DAILY_SMOKER' },
        { field: 'physicalActivity', operator: 'EQ', value: 'INSUFFICIENT' },
      ],
      resultingCategory: 'YELLOW',
      juknisCategory: 'NORMAL_WITH_RISK_FACTOR',
      critical: false,
      requiresConfirmation: false,
      status: 'ACTIVE',
      nextActions: [
        {
          actionType: 'SMOKING_CESSATION_COUNSELING',
          actionText: 'Konseling motivasi Upaya Berhenti Merokok (UBM) di Puskesmas dan edukasi bahaya paparan asap rokok pada keluarga.',
          suggestedRole: 'Kader / Petugas Promkes',
          intervalValue: 3,
          intervalUnit: 'MONTHS',
        },
      ],
    },

    // ==========================================
    // DOMAIN: LP (Profil Lipid) — OPEN ISSUE OI-01
    // ==========================================
    {
      ruleCode: 'CR-LP-01',
      domain: 'LP',
      domainName: 'Profil Lipid',
      name: 'Skrining Profil Lipid (Kolesterol Total)',
      description: 'Evaluasi kadar kolesterol total darah — Diblokir oleh Open Issue OI-01',
      conditions: [{ field: 'totalCholesterol', operator: 'GT', value: 200 }],
      resultingCategory: undefined,
      juknisCategory: undefined,
      critical: false,
      requiresConfirmation: false,
      status: 'OPEN',
      openIssueCode: 'OI-01',
      nextActions: [],
    },
  ],
};
