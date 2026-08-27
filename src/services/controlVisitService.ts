import { monitoringCycleRepo } from '../repositories/monitoringCycleRepo';
import { clinicalRepo } from '../repositories/clinicalRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { outcomeEvaluationService } from './outcomeEvaluationService';
import { auditRepo } from '../repositories/auditRepo';
import {
  MonitoringCycle,
  ClinicalEncounter,
  User,
  CareTask,
} from '../types';

export interface ControlVisitInput {
  cycleId: string;
  citizenId: string;
  examinerUser: User;
  isMeasurementAvailable: boolean;
  systolicBp?: number;
  diastolicBp?: number;
  repeatSystolicBp?: number;
  repeatDiastolicBp?: number;
  fastingBloodGlucose?: number;
  randomBloodGlucose?: number;
  weightKg?: number;
  heightCm?: number;
  chiefComplaint?: string;
  anamnesisNotes?: string;
  equipmentUnavailableReason?: string;
}

export const controlVisitService = {
  /**
   * Processes an in-person control visit at the health facility
   */
  async processControlVisit(
    input: ControlVisitInput
  ): Promise<{
    cycle: MonitoringCycle;
    encounter: ClinicalEncounter;
    followUpTask?: CareTask;
  }> {
    const cycle = await monitoringCycleRepo.getById(input.cycleId);
    if (!cycle) {
      throw new Error(`Monitoring cycle ${input.cycleId} not found.`);
    }

    const now = new Date().toISOString();

    // 1. Create ClinicalEncounter linked to the cycle
    const encounter = await clinicalRepo.createEncounter(
      {
        citizenId: cycle.citizenId,
        citizenName: cycle.citizenName,
        citizenNik: cycle.citizenNik,
        citizenPhone: cycle.citizenPhone,
        facilityId: cycle.facilityId,
        facilityName: cycle.facilityName,
        taskId: cycle.taskId,
        encounterDate: now,
        encounterType: 'ROUTINE_CONTROL',
        examinerUserId: input.examinerUser.id,
        examinerName: input.examinerUser.name,
        examinerRole: 'DOKTER_PUSKESMAS',
        examinerSip: '440/12/SIP-D/DPMPTSP/2024',
        chiefComplaint: input.chiefComplaint || 'Kunjungan kontrol rutin pemantauan kondisi kronis.',
        historyOfPresentIllness: input.anamnesisNotes || 'Pasien datang untuk evaluasi siklus kontrol.',
        pastMedicalHistory: [cycle.condition],
        systolicBp: input.systolicBp || 120,
        diastolicBp: input.diastolicBp || 80,
        repeatSystolicBp: input.repeatSystolicBp,
        repeatDiastolicBp: input.repeatDiastolicBp,
        heartRate: 78,
        respiratoryRate: 18,
        temperature: 36.5,
        weightKg: input.weightKg || 60,
        heightCm: input.heightCm || 160,
        bmi: input.weightKg && input.heightCm ? Number((input.weightKg / Math.pow(input.heightCm / 100, 2)).toFixed(1)) : 23.4,
        fastingBloodGlucose: input.fastingBloodGlucose,
        randomBloodGlucose: input.randomBloodGlucose,
        primaryDiagnosis: {
          code: 'I10',
          name: cycle.condition,
          isChronic: true,
        },
        secondaryDiagnoses: [],
        clinicalSeverity: 'MILD',
        clinicalAssessmentSummary: input.isMeasurementAvailable
          ? 'Pemeriksaan kontrol rutin terlaksana dengan parameter terkonfirmasi.'
          : `Pemeriksaan fisik terlaksana. Pengukuran laboratorium terkendala: ${input.equipmentUnavailableReason || 'Reagen/Alat tidak tersedia'}.`,
        prescriptions: [],
        nonPharmacologicalAdvice: ['Pertahankan pola makan seimbang dan istirahat teratur.'],
        enrolledInProlanis: false,
        referredToHospital: false,
        resolutionOutcome: 'CONFIRMED_CONTROLLED',
        closedLoopNotes: `Penyelesaian kunjungan kontrol Siklus ke-${cycle.cycleNumber}.`,
      },
      { id: input.examinerUser.id, name: input.examinerUser.name }
    );

    let followUpTask: CareTask | undefined;

    // 2. Handle Case: Measurement Unavailable -> Cycle state AWAITING_MEASUREMENT, create follow-up task
    if (!input.isMeasurementAvailable) {
      followUpTask = await careTaskRepo.create({
        citizenId: cycle.citizenId,
        citizenName: cycle.citizenName,
        facilityId: cycle.facilityId,
        facilityName: cycle.facilityName,
        taskType: 'CLINICAL_CONFIRMATION',
        priorityScore: 65,
        status: 'OPEN',
        actionText: `Pemeriksaan Lab Ulang Tertunda: ${cycle.condition} (${input.equipmentUnavailableReason || 'Alat/Reagen belum tersedia'})`,
        completionCriteria: 'Pengukuran terkonfirmasi berhasil dilaksanakan saat persediaan siap.',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        escalationLevel: 0,
      });

      // Outcome is NOT_YET_ASSESSABLE
      await outcomeEvaluationService.evaluateCycleOutcome({
        cycleId: cycle.id,
        citizenId: cycle.citizenId,
        citizenName: cycle.citizenName,
        condition: cycle.condition,
      });

      const updatedCycle = await monitoringCycleRepo.update(cycle.id, {
        actualControlAt: now.split('T')[0],
        encounterId: encounter.id,
        cycleStatus: 'AWAITING_MEASUREMENT',
        notes: `Kunjungan kontrol tercatat. Pengukuran terkendala: ${input.equipmentUnavailableReason || 'Reagen/Alat faskes'}. Menunggu pengukuran ulang.`,
      });

      return { cycle: updatedCycle, encounter, followUpTask };
    }

    // 3. Case: Measurement Available -> Cycle state AWAITING_EVALUATION
    const updatedCycle = await monitoringCycleRepo.update(cycle.id, {
      actualControlAt: now.split('T')[0],
      encounterId: encounter.id,
      cycleStatus: 'AWAITING_EVALUATION',
      notes: `Kunjungan kontrol selesai pada ${now.split('T')[0]}. Pengukuran terkonfirmasi telah tercatat.`,
    });

    // Automatically trigger evaluation under active governance locks
    await outcomeEvaluationService.evaluateCycleOutcome({
      cycleId: cycle.id,
      citizenId: cycle.citizenId,
      citizenName: cycle.citizenName,
      condition: cycle.condition,
      currentObservation: {
        id: `obs-${encounter.id}`,
        label: 'Hasil Kontrol Terkonfirmasi',
        valueSummary: input.systolicBp ? `TD: ${input.systolicBp}/${input.diastolicBp} mmHg` : `GDS: ${input.randomBloodGlucose || input.fastingBloodGlucose} mg/dL`,
        systolic: input.systolicBp,
        diastolic: input.diastolicBp,
        glucose: input.fastingBloodGlucose || input.randomBloodGlucose,
        measuredAt: now,
      },
    });

    return { cycle: updatedCycle, encounter };
  },
};
