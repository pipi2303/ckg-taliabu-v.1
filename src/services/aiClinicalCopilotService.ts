import { aiRepository } from '../repositories/aiRepository';
import { AIClinicalRecommendation, AIApprovalStatus, RoleId } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const aiClinicalCopilotService = {
  async getAllRecommendations(): Promise<AIClinicalRecommendation[]> {
    return aiRepository.getClinicalRecommendations();
  },

  async getRecommendationById(id: string): Promise<AIClinicalRecommendation | undefined> {
    return aiRepository.getClinicalRecommendationById(id);
  },

  async reviewRecommendation(params: {
    id: string;
    newStatus: AIApprovalStatus;
    doctorUserId: string;
    doctorName: string;
    doctorRole: string;
    notes?: string;
  }): Promise<AIClinicalRecommendation> {
    const updated = await aiRepository.updateClinicalRecommendationReview(
      params.id,
      params.newStatus,
      params.doctorName,
      params.notes
    );

    // Audit log for clinical decision accountability
    await auditRepo.log({
      actorUserId: params.doctorUserId,
      actorName: params.doctorName,
      actorRole: (params.doctorRole || 'DOCTOR') as RoleId,
      action: 'UPDATE',
      entityType: 'CLINICAL_ENCOUNTER',
      entityId: params.id,
      targetLabel: `AI Copilot Review: ${updated.patientName}`,
      description: `Rekomendasi terapi AI diubah statusnya menjadi ${params.newStatus} oleh ${params.doctorName}`,
      details: {
        diagnosis: updated.suggestedWorkingDiagnosis.diagnosisName,
        status: params.newStatus,
        notes: params.notes || 'Tanpa catatan tambahan',
      },
    });

    return updated;
  },

  async generateOnDemandAssistance(patientData: {
    citizenId: string;
    name: string;
    age: number;
    gender: string;
    systolic: number;
    diastolic: number;
    bloodSugar?: number;
    hba1c?: number;
    comorbidities: string[];
  }): Promise<AIClinicalRecommendation> {
    // Generate intelligent evidence-based recommendation following Kemenkes CKG Protocol
    const isStage2HT = patientData.systolic >= 160 || patientData.diastolic >= 100;
    const isStage1HT = patientData.systolic >= 140 || patientData.diastolic >= 90;
    const isDMT2 = (patientData.bloodSugar && patientData.bloodSugar >= 200) || (patientData.hba1c && patientData.hba1c >= 6.5);

    let icdCode = 'I10';
    let diagName = 'Hipertensi Primer Derajat 1';
    let stage = 'Derajat 1 (140-159 / 90-99 mmHg)';

    if (isStage2HT && isDMT2) {
      icdCode = 'I10 & E11.9';
      diagName = 'Hipertensi Primer Derajat 2 + Diabetes Melitus Tipe 2';
      stage = 'Risiko Kardiovaskular Sangat Tinggi (Komorbid Diabetes)';
    } else if (isStage2HT) {
      icdCode = 'I10';
      diagName = 'Hipertensi Primer Derajat 2';
      stage = 'Derajat 2 (≥ 160/100 mmHg)';
    } else if (isDMT2) {
      icdCode = 'E11.9';
      diagName = 'Diabetes Melitus Tipe 2';
      stage = 'Gula Darah Sewaktu ≥ 200 mg/dL';
    }

    const newRec: AIClinicalRecommendation = {
      id: `REC-CLI-${Date.now().toString().slice(-4)}`,
      citizenId: patientData.citizenId,
      patientName: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      observedFindings: {
        systolic: patientData.systolic,
        diastolic: patientData.diastolic,
        randomBloodSugar: patientData.bloodSugar,
        hba1c: patientData.hba1c,
        smokingStatus: false,
        comorbidities: patientData.comorbidities,
      },
      suggestedWorkingDiagnosis: {
        icd10Code: icdCode,
        diagnosisName: diagName,
        stageOrGrade: stage,
        confidencePercent: 93,
      },
      guidelineEvidence: {
        sourceGuideline: 'PMK No. 5 Tahun 2014 & Protokol Tata Laksana CKG Kemenkes RI 2026',
        referenceSection: 'Standar Terapi Hipertensi dan Diabetes FKTP Bagian 3 & 4',
        rationaleExplanation: `Pasien berusia ${patientData.age} tahun dengan temuan TD ${patientData.systolic}/${patientData.diastolic} mmHg dan profil komorbid ${patientData.comorbidities.join(', ') || 'primer'} memenuhi kriteria inisiasi terapi lini pertama FKTP.`,
      },
      recommendedTherapy: [
        {
          firstLineDrug: isDMT2 ? 'Metformin HCl 500 mg' : 'Amlodipine Tablet 5 mg',
          initialDose: isDMT2 ? '500 mg' : '5 mg',
          frequency: isDMT2 ? '2 x 1 tablet sesudah makan' : '1 x 1 tablet malam hari',
          specialInstructions: 'Lakukan evaluasi ulang tekanan darah dan toleransi obat dalam 14-28 hari.',
        },
      ],
      safetyAlerts: [
        {
          type: 'INFO',
          severity: 'INFO',
          message: 'Pastikan kepatuhan minum obat dipantau melalui aplikasi Sahabat Warga atau kunjungan Kader Pustu.',
        },
      ],
      lifestylePrescription: [
        'Diet rendah garam (< 2g Natrium / hari)',
        'Aktivitas fisik teratur minimal 150 menit / minggu',
        'Cukupi kebutuhan cairan dan hindari stres berkepanjangan',
      ],
      humanReviewStatus: 'PENDING_REVIEW',
    };

    return newRec;
  },
};
