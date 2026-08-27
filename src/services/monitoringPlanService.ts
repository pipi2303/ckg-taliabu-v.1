import { ClinicalEncounter, DiagnosisItem } from '../types';

export interface MonitoringPlanDefinition {
  condition: string;
  intervalSourceRule: string;
  defaultIntervalDays: number;
  requiredParameters: string[];
  clinicalGuidanceNote: string;
}

export const monitoringPlanService = {
  /**
   * Derives condition-specific parameters and interval rules from encounter/diagnosis
   */
  getPlanForCondition(primaryDiagnosis?: DiagnosisItem, encounter?: ClinicalEncounter): MonitoringPlanDefinition {
    const diagCode = primaryDiagnosis?.code || '';
    const diagName = (primaryDiagnosis?.name || '').toLowerCase();

    // 1. Hypertension (I10 - I15)
    if (diagCode.startsWith('I1') || diagName.includes('hipertensi')) {
      return {
        condition: primaryDiagnosis?.name || 'Hipertensi Derajat 1 (I10)',
        intervalSourceRule: 'CR-IV-01 (Interval 30 Hari Kontrol Rutin Hipertensi Puskesmas)',
        defaultIntervalDays: 30,
        requiredParameters: [
          'Tekanan Darah Ulang Terkonfirmasi (CR-KF-01)',
          'Penilaian Kepatuhan Minum Obat Antihipertensi',
          'Evaluasi Efek Samping & Gaya Hidup Rendah Garam',
        ],
        clinicalGuidanceNote:
          'Kontrol rutin bulanan di Puskesmas/Pustu. Pastikan pengukuran tensi dilakukan setelah istirahat 5 menit.',
      };
    }

    // 2. Diabetes Mellitus (E11, E10, E14)
    if (diagCode.startsWith('E1') || diagName.includes('diabetes') || diagName.includes('gula')) {
      return {
        condition: primaryDiagnosis?.name || 'Diabetes Mellitus Tipe 2 (E11)',
        intervalSourceRule: 'CR-IV-02 (Interval 30 Hari Kontrol Rutin DM Puskesmas)',
        defaultIntervalDays: 30,
        requiredParameters: [
          'GDP / GDS Ulang Terkonfirmasi (CR-KF-02)',
          'Penilaian Kepatuhan OAD (Metformin / Glibenklamid)',
          'Pemeriksaan Kaki & Tanda Hipoglikemia',
        ],
        clinicalGuidanceNote:
          'Edukasi puasa 8-10 jam jika dijadwalkan GDP. Ingatkan membawa bekal obat dan sarapan setelah tes darah.',
      };
    }

    // 3. Pre-diabetes / Lifestyle intervention (CR-GZ-11)
    if (diagName.includes('prediabetes') || diagName.includes('obesitas') || diagName.includes('sindrom metabolik')) {
      return {
        condition: primaryDiagnosis?.name || 'Prediabetes / Modifikasi Gaya Hidup',
        intervalSourceRule: 'CR-IV-04 (Interval 60 Hari Evaluasi Non-Farmakologis CR-GZ-11)',
        defaultIntervalDays: 60,
        requiredParameters: [
          'Evaluasi Berat Badan & IMT',
          'GDS / GDP Ulang Konfirmasi',
          'Kepatuhan Intervensi Diet & Aktivitas Fisik (CR-GZ-11)',
        ],
        clinicalGuidanceNote:
          'Pemantauan keberhasilan intervensi non-farmakologis (nutrisi dan aktivitas fisik terstruktur).',
      };
    }

    // 4. Default Chronic Disease Monitoring
    return {
      condition: primaryDiagnosis?.name || 'Kondisi Kronis Dalam Pemantauan',
      intervalSourceRule: 'CR-IV-01 (Interval Standar 30 Hari FKTP)',
      defaultIntervalDays: 30,
      requiredParameters: [
        'Pemeriksaan Fisik & Tanda Vital Ulang',
        'Penilaian Kepatuhan Terapi & Keluhan',
      ],
      clinicalGuidanceNote: 'Kontrol berkala sesuai instruksi dokter penanggung jawab pelayanan.',
    };
  },

  /**
   * Calculates next planned control date based on interval rule or custom doctor preference
   */
  calculatePlannedDate(baseDate: Date, intervalDays: number): string {
    const nextDate = new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
  },
};
