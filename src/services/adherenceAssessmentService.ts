import { adherenceAssessmentRepo } from '../repositories/adherenceAssessmentRepo';
import { auditRepo } from '../repositories/auditRepo';
import { nonAdherenceCauseService } from './nonAdherenceCauseService';
import { adherenceInterventionService } from './adherenceInterventionService';
import {
  AdherenceAssessment,
  AdherenceLevel,
  AdherenceEvidenceStrength,
  NonAdherenceCause,
  User,
  ExtendedBarrierCause,
  CauseProvenance,
} from '../types';

export const adherenceAssessmentService = {
  async getByCycleId(cycleId: string): Promise<AdherenceAssessment | null> {
    return adherenceAssessmentRepo.getByCycleId(cycleId);
  },

  async getByCitizenId(citizenId: string): Promise<AdherenceAssessment[]> {
    return adherenceAssessmentRepo.getByCitizenId(citizenId);
  },

  async recordAssessment(params: {
    cycleId: string;
    citizenId: string;
    citizenName: string;
    facilityId: string;
    facilityName: string;
    adherenceLevel: AdherenceLevel;
    evidenceStrength: AdherenceEvidenceStrength;
    assessorUser: User;
    systemContextFlags?: string[];
    notes?: string;
    causes?: Array<{
      causeCode: ExtendedBarrierCause;
      reportedVia: CauseProvenance;
      clinicalNotes?: string;
    }>;
  }): Promise<{ assessment: AdherenceAssessment; interventionNotes: string[] }> {
    const formattedCauses: NonAdherenceCause[] = (params.causes || []).map((c) =>
      nonAdherenceCauseService.createCauseEntity({
        causeCode: c.causeCode,
        reportedVia: c.reportedVia,
        reportedByUserName: params.assessorUser.name,
        clinicalNotes: c.clinicalNotes,
        cycleId: params.cycleId,
        citizenId: params.citizenId,
      })
    );

    const assessment = await adherenceAssessmentRepo.create({
      cycleId: params.cycleId,
      citizenId: params.citizenId,
      citizenName: params.citizenName,
      adherenceLevel: params.adherenceLevel,
      evidenceStrength: params.evidenceStrength,
      assessedByUserId: params.assessorUser.id,
      assessedByUserName: params.assessorUser.name,
      systemContextFlags: params.systemContextFlags || [],
      notes: params.notes,
      causes: formattedCauses,
    });

    // Deterministic intervention routing
    let interventionNotes: string[] = [];
    if (formattedCauses.length > 0) {
      const routingResult = await adherenceInterventionService.routeCausesToInterventions({
        citizenId: params.citizenId,
        citizenName: params.citizenName,
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        cycleId: params.cycleId,
        causes: formattedCauses,
        assessorUser: params.assessorUser,
      });
      interventionNotes = routingResult.notes;
    }

    // Audit Logging
    await auditRepo.log({
      action: 'CREATE',
      entityType: 'CARE_TASK',
      entityId: assessment.id,
      targetLabel: `Penilaian Kepatuhan Siklus (${params.citizenName})`,
      details: {
        cycleId: params.cycleId,
        adherenceLevel: params.adherenceLevel,
        causesCount: formattedCauses.length,
        systemContextFlags: params.systemContextFlags,
      },
      userId: params.assessorUser.id,
      userName: params.assessorUser.name,
    });

    return { assessment, interventionNotes };
  },
};
