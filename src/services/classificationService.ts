import {
  ClassificationBatch,
  RiskClassification,
  RiskCluster,
  TriggeredRule,
  User,
} from '../types';
import { citizenRepo } from '../repositories/citizenRepo';
import { screeningRepo } from '../repositories/screeningRepo';
import { classificationRepo, OverrideClassificationInput } from '../repositories/classificationRepo';
import { priorityWeightRepo } from '../repositories/priorityWeightRepo';
import { clinicalRuleEngine } from '../features/classification/engine/clinicalRuleEngine';
import { CRS_CKG_V0_9 } from '../features/classification/rules/crsPackageV0_9';
import { auditService } from './auditService';

export const classificationService = {
  async evaluateCitizen(
    citizenId: string,
    actor: User
  ): Promise<{
    classification: RiskClassification;
    triggeredRules: TriggeredRule[];
    cluster?: RiskCluster;
  }> {
    const citizen = await citizenRepo.getById(citizenId);
    if (!citizen) {
      throw new Error(`Data warga dengan ID ${citizenId} tidak ditemukan.`);
    }

    const [sessions, results, observations, activeWeights] = await Promise.all([
      screeningRepo.getSessionsByCitizenId(citizenId),
      screeningRepo.getResultsByCitizenId(citizenId),
      screeningRepo.getObservationsByCitizenId(citizenId),
      priorityWeightRepo.getActive(),
    ]);

    const latestSession = sessions.sort(
      (a, b) => new Date(b.screenedAt).getTime() - new Date(a.screenedAt).getTime()
    )[0];

    const evalResult = clinicalRuleEngine.evaluateCitizen(
      citizen,
      latestSession,
      results,
      observations,
      CRS_CKG_V0_9,
      activeWeights
    );

    // Save classification append-only
    await classificationRepo.create(evalResult.classification);

    // Audit single evaluation
    await auditService.log(actor, 'CREATE', 'RISK_CLASSIFICATION', {
      targetId: evalResult.classification.id,
      targetLabel: `Evaluasi Risiko - ${citizen.fullName}`,
      citizenId: citizen.id,
      purposeCode: 'INDIVIDUAL_RISK_STRATIFICATION',
      details: {
        finalCategory: evalResult.classification.finalCategory,
        isCritical: evalResult.classification.isCritical,
        priorityScore: evalResult.classification.priorityScore,
        ruleVersion: evalResult.classification.ruleVersion,
      },
    });

    return evalResult;
  },

  async runBatch(
    facilityId: string | undefined,
    actor: User,
    onProgress?: (progress: number, total: number) => void
  ): Promise<ClassificationBatch> {
    const allCitizens = await citizenRepo.getAll();
    const targetCitizens = facilityId
      ? allCitizens.filter((c) => c.facilityId === facilityId)
      : allCitizens;

    const activeWeights = await priorityWeightRepo.getActive();
    const batchId = `BATCH-${Date.now()}`;

    const batch: ClassificationBatch = {
      id: batchId,
      ruleVersion: CRS_CKG_V0_9.version,
      startedAt: new Date().toISOString(),
      total: targetCitizens.length,
      completed: 0,
      awaitingConfirmationCount: 0,
      undeterminedCount: 0,
      criticalCount: 0,
      failed: 0,
      status: 'RUNNING',
    };

    const classifications: RiskClassification[] = [];
    const triggeredRules: TriggeredRule[] = [];
    const clusters: RiskCluster[] = [];

    for (let i = 0; i < targetCitizens.length; i++) {
      const citizen = targetCitizens[i];
      try {
        const [sessions, results, observations] = await Promise.all([
          screeningRepo.getSessionsByCitizenId(citizen.id),
          screeningRepo.getResultsByCitizenId(citizen.id),
          screeningRepo.getObservationsByCitizenId(citizen.id),
        ]);

        const latestSession = sessions.sort(
          (a, b) => new Date(b.screenedAt).getTime() - new Date(a.screenedAt).getTime()
        )[0];

        const evalResult = clinicalRuleEngine.evaluateCitizen(
          citizen,
          latestSession,
          results,
          observations,
          CRS_CKG_V0_9,
          activeWeights
        );

        classifications.push(evalResult.classification);
        triggeredRules.push(...evalResult.triggeredRules);
        if (evalResult.cluster) clusters.push(evalResult.cluster);

        batch.completed++;
        if (evalResult.classification.classificationStage === 'SCREENING') {
          batch.awaitingConfirmationCount++;
        }
        if (evalResult.classification.finalCategory === 'UNDETERMINED') {
          batch.undeterminedCount++;
        }
        if (evalResult.classification.isCritical) {
          batch.criticalCount++;
        }
      } catch (err) {
        console.error(`Failed to evaluate citizen ${citizen.id}:`, err);
        batch.failed++;
      }

      if (onProgress) {
        onProgress(i + 1, targetCitizens.length);
      }
    }

    batch.completedAt = new Date().toISOString();
    batch.status = batch.failed === 0 ? 'SUCCESS' : 'PARTIAL_FAILED';

    await classificationRepo.saveBatch(batch, classifications, triggeredRules, clusters, actor);
    return batch;
  },

  async override(
    classificationId: string,
    input: OverrideClassificationInput
  ): Promise<RiskClassification> {
    return classificationRepo.override(classificationId, input);
  },
};
