import {
  ClinicalEncounter,
  HospitalReferral,
  ProlanisEnrollment,
  ReferralStatus,
  ReferralReplyChannel,
  ClosedLoopResolutionAudit,
  CareTask,
} from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';
import { careTaskRepo } from './careTaskRepo';

export interface EncounterFilterParams {
  search?: string;
  facilityId?: string;
  encounterType?: string;
  citizenId?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  hasReferral?: boolean;
  hasProlanis?: boolean;
}

export const clinicalRepo = {
  async getAllEncounters(params: EncounterFilterParams = {}): Promise<ClinicalEncounter[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getClinicalEncounters();

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.citizenName.toLowerCase().includes(q) ||
          e.citizenNik.includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.primaryDiagnosis.code.toLowerCase().includes(q) ||
          e.primaryDiagnosis.name.toLowerCase().includes(q) ||
          e.examinerName.toLowerCase().includes(q)
      );
    }

    if (params.facilityId && params.facilityId !== 'ALL') {
      list = list.filter((e) => e.facilityId === params.facilityId);
    }

    if (params.encounterType && params.encounterType !== 'ALL') {
      list = list.filter((e) => e.encounterType === params.encounterType);
    }

    if (params.citizenId) {
      list = list.filter((e) => e.citizenId === params.citizenId);
    }

    if (params.severity && params.severity !== 'ALL') {
      list = list.filter((e) => e.clinicalSeverity === params.severity);
    }

    if (params.hasReferral !== undefined) {
      list = list.filter((e) => e.referredToHospital === params.hasReferral);
    }

    if (params.hasProlanis !== undefined) {
      list = list.filter((e) => e.enrolledInProlanis === params.hasProlanis);
    }

    return list.sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());
  },

  async getEncounterById(id: string): Promise<ClinicalEncounter | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getClinicalEncounters();
    return list.find((e) => e.id === id) || null;
  },

  async getEncountersByCitizenId(citizenId: string): Promise<ClinicalEncounter[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getClinicalEncounters();
    return list.filter((e) => e.citizenId === citizenId);
  },

  async createEncounter(
    data: Omit<ClinicalEncounter, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string }
  ): Promise<ClinicalEncounter> {
    await simulateNetworkDelay();
    const list = rawStorage.getClinicalEncounters();
    const now = new Date().toISOString();
    const id = `ENC-${Date.now().toString(36).toUpperCase()}`;

    let hospitalReferralId = data.hospitalReferralId;
    let prolanisEnrollmentId = data.prolanisEnrollmentId;

    // 1. If hospital referral is checked and details exist, create Referral record
    if (data.referredToHospital && data.referralDetails) {
      const newReferral: HospitalReferral = {
        id: `REF-${Date.now().toString(36).toUpperCase()}`,
        referralLetterNumber: data.referralDetails.referralLetterNumber || `440/RUJ-${data.facilityId}/${Date.now().toString().slice(-4)}`,
        citizenId: data.citizenId,
        citizenName: data.citizenName,
        citizenNik: data.citizenNik,
        citizenPhone: data.citizenPhone,
        citizenAddress: data.villageName,
        originFacilityId: data.facilityId,
        originFacilityName: data.facilityName,
        targetHospitalId: 'FASKES-RSUD-01',
        targetHospitalName: data.referralDetails.targetHospital || 'RSUD Bobong Kabupaten Pulau Taliabu',
        specialty: data.referralDetails.specialty,
        urgency: data.referralDetails.urgency,
        primaryDiagnosis: data.primaryDiagnosis,
        secondaryDiagnoses: data.secondaryDiagnoses,
        clinicalAnamnesis: `${data.chiefComplaint}. ${data.historyOfPresentIllness}`,
        vitalSignsSummary: `TD: ${data.systolicBp}/${data.diastolicBp} mmHg, N: ${data.heartRate}x/m, RR: ${data.respiratoryRate}x/m, IMT: ${data.bmi}`,
        labFindingsSummary: `GDP: ${data.fastingBloodGlucose || '-'}, HbA1c: ${data.hba1c || '-'}, Kol: ${data.totalCholesterol || '-'}, EKG: ${data.ecgFinding || 'NORMAL'}`,
        initialTherapyGiven: data.prescriptions.map((p) => `${p.drugName} ${p.dosage} (${p.frequency})`).join(', ') || 'Terapi simtomatik',
        reasonForReferral: data.clinicalAssessmentSummary || 'Pemeriksaan penunjang diagnostik spesialis & tata laksana lanjut',
        doctorName: data.examinerName,
        doctorSip: data.examinerSip,
        status: 'SENT',
        issuedAt: now,
        scheduledConsultDate: data.nextControlDate,
        taskId: data.taskId,
        encounterId: id,
        createdAt: now,
        updatedAt: now,
      };

      const referrals = rawStorage.getHospitalReferrals();
      referrals.unshift(newReferral);
      rawStorage.setHospitalReferrals(referrals);
      hospitalReferralId = newReferral.id;

      await auditRepo.log({
        action: 'CREATE_HOSPITAL_REFERRAL',
        entityType: 'HOSPITAL_REFERRAL',
        entityId: newReferral.id,
        targetLabel: `Rujukan ${newReferral.citizenName} ke ${newReferral.targetHospitalName}`,
        citizenId: data.citizenId,
        facilityId: data.facilityId,
        facilityName: data.facilityName,
        details: { specialty: newReferral.specialty, urgency: newReferral.urgency },
        userId: actor.id,
        userName: actor.name,
      });
    }

    // 2. If Prolanis Enrollment is requested, create/update Prolanis record
    if (data.enrolledInProlanis && data.prolanisProgramType) {
      const enrollments = rawStorage.getProlanisEnrollments();
      const existing = enrollments.find((p) => p.citizenId === data.citizenId);

      if (existing) {
        existing.lastControlDate = data.encounterDate.split('T')[0];
        existing.monthlyVisitsCount += 1;
        existing.updatedAt = now;
        rawStorage.setProlanisEnrollments([...enrollments]);
        prolanisEnrollmentId = existing.id;
      } else {
        const newProlanis: ProlanisEnrollment = {
          id: `PROL-${Date.now().toString(36).toUpperCase()}`,
          citizenId: data.citizenId,
          citizenName: data.citizenName,
          citizenNik: data.citizenNik,
          citizenPhone: data.citizenPhone,
          villageName: data.villageName || 'Desa Binaan',
          facilityId: data.facilityId,
          facilityName: data.facilityName,
          programType: data.prolanisProgramType,
          prolanisCardNumber: `PRB-${data.prolanisProgramType === 'PROLANIS_HT' ? 'HT' : 'DM'}-8208-${Date.now().toString().slice(-4)}`,
          enrolledAt: now,
          enrolledByUserName: actor.name,
          baselineSystolicBp: data.systolicBp,
          baselineDiastolicBp: data.diastolicBp,
          baselineFastingBloodGlucose: data.fastingBloodGlucose,
          baselineHba1c: data.hba1c,
          targetSystolicBp: 130,
          targetDiastolicBp: 80,
          targetFastingGlucose: 120,
          lastControlDate: data.encounterDate.split('T')[0],
          nextScheduledControlDate: data.nextControlDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          adherenceRatePercent: 100,
          status: 'ACTIVE',
          monthlyVisitsCount: 1,
          notes: 'Pendaftaran otomatis melalui Rekam Medis CKG',
          createdAt: now,
          updatedAt: now,
        };
        enrollments.unshift(newProlanis);
        rawStorage.setProlanisEnrollments(enrollments);
        prolanisEnrollmentId = newProlanis.id;

        await auditRepo.log({
          action: 'ENROLL_PROLANIS',
          entityType: 'PROLANIS_ENROLLMENT',
          entityId: newProlanis.id,
          targetLabel: `Enrollment Prolanis ${newProlanis.citizenName}`,
          citizenId: data.citizenId,
          facilityId: data.facilityId,
          facilityName: data.facilityName,
          details: { programType: newProlanis.programType, cardNumber: newProlanis.prolanisCardNumber },
          userId: actor.id,
          userName: actor.name,
        });
      }
    }

    const newEncounter: ClinicalEncounter = {
      ...data,
      id,
      hospitalReferralId,
      prolanisEnrollmentId,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newEncounter);
    rawStorage.setClinicalEncounters(list);

    // 3. Automated Closed-Loop Care Task Resolution
    if (data.taskId) {
      try {
        await careTaskRepo.close(
          data.taskId,
          {
            closureType: 'EVIDENCE_BASED',
            evidenceType: 'CLINICAL_RECORD',
            evidenceRefId: id,
          },
          actor
        );
      } catch (err) {
        console.warn('Could not auto-close task:', err);
      }
    }

    // 4. Audit Trail Entry
    await auditRepo.log({
      action: 'CREATE_CLINICAL_ENCOUNTER',
      entityType: 'CLINICAL_ENCOUNTER',
      entityId: id,
      targetLabel: `Pemeriksaan Klinis CKG: ${data.citizenName} (${data.primaryDiagnosis.code})`,
      citizenId: data.citizenId,
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      details: {
        diagnosis: data.primaryDiagnosis,
        severity: data.clinicalSeverity,
        examinerSip: data.examinerSip,
        prescriptionsCount: data.prescriptions.length,
        referred: data.referredToHospital,
        prolanis: data.enrolledInProlanis,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return newEncounter;
  },

  async updateEncounter(
    id: string,
    updates: Partial<ClinicalEncounter>,
    actor: { id: string; name: string }
  ): Promise<ClinicalEncounter> {
    await simulateNetworkDelay();
    const list = rawStorage.getClinicalEncounters();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Catatan klinis tidak ditemukan');

    const updated: ClinicalEncounter = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setClinicalEncounters([...list]);

    await auditRepo.log({
      action: 'UPDATE_CLINICAL_ENCOUNTER',
      entityType: 'CLINICAL_ENCOUNTER',
      entityId: id,
      targetLabel: `Update Rekam Medis: ${updated.citizenName}`,
      citizenId: updated.citizenId,
      facilityId: updated.facilityId,
      facilityName: updated.facilityName,
      details: { updates },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  // Referral Sub-system
  async getReferrals(filter?: { status?: string; specialty?: string; facilityId?: string; search?: string }): Promise<HospitalReferral[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getHospitalReferrals();

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.citizenName.toLowerCase().includes(q) ||
          r.citizenNik.includes(q) ||
          r.referralLetterNumber.toLowerCase().includes(q) ||
          r.primaryDiagnosis.name.toLowerCase().includes(q)
      );
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status);
    }

    if (filter?.specialty && filter.specialty !== 'ALL') {
      list = list.filter((r) => r.specialty === filter.specialty);
    }

    if (filter?.facilityId && filter.facilityId !== 'ALL') {
      list = list.filter((r) => r.originFacilityId === filter.facilityId);
    }

    return list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  },

  async updateReferralStatus(
    id: string,
    status: ReferralStatus,
    responseNote?: string,
    actor?: { id: string; name: string },
    replyChannel?: ReferralReplyChannel
  ): Promise<HospitalReferral> {
    await simulateNetworkDelay();
    const list = rawStorage.getHospitalReferrals();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Rujukan tidak ditemukan');

    const updated: HospitalReferral = {
      ...list[index],
      status,
      rsudResponseNote: responseNote || list[index].rsudResponseNote,
      replyChannel: replyChannel || list[index].replyChannel,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'CONSULTED') {
      updated.rsudConsultedAt = new Date().toISOString();
      updated.rsudConsultantName = 'dr. Spesialis RSUD Bobong';
    }

    list[index] = updated;
    rawStorage.setHospitalReferrals([...list]);

    if (actor) {
      await auditRepo.log({
        action: 'UPDATE_REFERRAL_STATUS',
        entityType: 'HOSPITAL_REFERRAL',
        entityId: id,
        targetLabel: `Status Rujukan ${updated.referralLetterNumber} -> ${status}`,
        citizenId: updated.citizenId,
        facilityId: updated.originFacilityId,
        facilityName: updated.originFacilityName,
        details: { status, responseNote, replyChannel: updated.replyChannel },
        userId: actor.id,
        userName: actor.name,
      });
    }

    return updated;
  },

  // Prolanis Sub-system
  async getProlanisEnrollments(filter?: { programType?: string; status?: string; facilityId?: string; search?: string }): Promise<ProlanisEnrollment[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getProlanisEnrollments();

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.citizenName.toLowerCase().includes(q) ||
          p.citizenNik.includes(q) ||
          p.prolanisCardNumber.toLowerCase().includes(q)
      );
    }

    if (filter?.programType && filter.programType !== 'ALL') {
      list = list.filter((p) => p.programType === filter.programType);
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((p) => p.status === filter.status);
    }

    if (filter?.facilityId && filter.facilityId !== 'ALL') {
      list = list.filter((p) => p.facilityId === filter.facilityId);
    }

    return list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
  },

  // Closed-Loop Analytics Pipeline
  async getClosedLoopAnalytics(facilityId?: string) {
    await simulateNetworkDelay();
    const encounters = rawStorage.getClinicalEncounters();
    const careTasks = rawStorage.getCareTasks();
    const referrals = rawStorage.getHospitalReferrals();
    const prolanis = rawStorage.getProlanisEnrollments();

    const filteredEncounters = facilityId && facilityId !== 'ALL'
      ? encounters.filter((e) => e.facilityId === facilityId)
      : encounters;

    const filteredTasks = facilityId && facilityId !== 'ALL'
      ? careTasks.filter((t) => t.facilityId === facilityId)
      : careTasks;

    const filteredReferrals = facilityId && facilityId !== 'ALL'
      ? referrals.filter((r) => r.originFacilityId === facilityId)
      : referrals;

    const filteredProlanis = facilityId && facilityId !== 'ALL'
      ? prolanis.filter((p) => p.facilityId === facilityId)
      : prolanis;

    const totalTasks = filteredTasks.length;
    const closedTasks = filteredTasks.filter((t) => t.status === 'CLOSED').length;
    const resolvedThroughClinic = filteredEncounters.length;
    const activeReferralsCount = filteredReferrals.filter((r) => r.status === 'SENT' || r.status === 'RECEIVED_BY_RSUD').length;
    const totalProlanisActive = filteredProlanis.filter((p) => p.status === 'ACTIVE').length;

    // Disease Breakdown
    const hypertensionCount = filteredEncounters.filter(
      (e) => e.primaryDiagnosis.code.startsWith('I10') || e.primaryDiagnosis.code.startsWith('I11')
    ).length;

    const diabetesCount = filteredEncounters.filter(
      (e) => e.primaryDiagnosis.code.startsWith('E11')
    ).length;

    const dyslipidemiaCount = filteredEncounters.filter(
      (e) => e.primaryDiagnosis.code.startsWith('E78') || e.secondaryDiagnoses.some((s) => s.code.startsWith('E78'))
    ).length;

    return {
      totalTasks,
      closedTasks,
      resolvedThroughClinic,
      activeReferralsCount,
      totalProlanisActive,
      resolutionRatePercent: totalTasks > 0 ? Math.round((closedTasks / totalTasks) * 100) : 0,
      hypertensionCount,
      diabetesCount,
      dyslipidemiaCount,
      recentEncounters: filteredEncounters.slice(0, 5),
    };
  },
};
