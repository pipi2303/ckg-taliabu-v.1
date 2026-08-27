import {
  AuditAction,
  ClassificationBatch,
  ClinicalRiskCategory,
  RiskClassification,
  RiskCluster,
  TriggeredRule,
  User,
} from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditService } from '../services/auditService';

export interface OverrideClassificationInput {
  newCategory: ClinicalRiskCategory;
  reason: string;
  notes?: string;
  actor: User;
}

export const classificationRepo = {
  async getAll(includeSuperseded = false): Promise<RiskClassification[]> {
    await simulateNetworkDelay();
    const all = rawStorage.getRiskClassifications();
    if (includeSuperseded) return all;
    return all.filter((c) => !c.supersededById);
  },

  async getById(id: string): Promise<RiskClassification | undefined> {
    await simulateNetworkDelay();
    return rawStorage.getRiskClassifications().find((c) => c.id === id);
  },

  async getByCitizenId(citizenId: string): Promise<{
    current?: RiskClassification;
    history: RiskClassification[];
  }> {
    await simulateNetworkDelay();
    const all = rawStorage
      .getRiskClassifications()
      .filter((c) => c.citizenId === citizenId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const current = all.find((c) => !c.supersededById) || all[0];
    return {
      current,
      history: all,
    };
  },

  async create(classification: RiskClassification): Promise<RiskClassification> {
    await simulateNetworkDelay();
    const existing = rawStorage.getRiskClassifications();
    rawStorage.setRiskClassifications([classification, ...existing]);
    return classification;
  },

  async supersede(
    oldId: string,
    newClassification: RiskClassification
  ): Promise<RiskClassification> {
    await simulateNetworkDelay();
    const existing = rawStorage.getRiskClassifications();
    const updated = existing.map((c) => {
      if (c.id === oldId) {
        return { ...c, supersededById: newClassification.id };
      }
      return c;
    });
    rawStorage.setRiskClassifications([newClassification, ...updated]);
    return newClassification;
  },

  async override(
    classificationId: string,
    input: OverrideClassificationInput
  ): Promise<RiskClassification> {
    await simulateNetworkDelay();
    const existing = rawStorage.getRiskClassifications();
    const current = existing.find((c) => c.id === classificationId);

    if (!current) {
      throw new Error(`Klasifikasi dengan ID ${classificationId} tidak ditemukan.`);
    }

    if (!input.reason || input.reason.trim().length < 15) {
      throw new Error('Alasan klinis wajib diisi secara substantif (minimal 15 karakter).');
    }

    // Create new classification with override details (superseding old)
    const newId = `RC-OVR-${current.citizenId}-${Date.now()}`;
    const newClassification: RiskClassification = {
      ...current,
      id: newId,
      finalCategory: input.newCategory,
      overriddenByUserId: input.actor.id,
      overriddenByUserName: input.actor.name,
      overrideRole: input.actor.roleId,
      overridePreviousCategory: current.finalCategory,
      overrideReason: input.reason.trim(),
      overrideNotes: input.notes?.trim(),
      overriddenAt: new Date().toISOString(),
      supersededById: undefined,
      createdAt: new Date().toISOString(),
    };

    // Mark old classification as superseded
    const updatedList = existing.map((c) => {
      if (c.id === classificationId) {
        return { ...c, supersededById: newId };
      }
      return c;
    });

    rawStorage.setRiskClassifications([newClassification, ...updatedList]);

    // Log audit event
    const action: AuditAction =
      current.isCritical && input.newCategory !== 'DARK_RED'
        ? 'DOWNGRADE_CRITICAL'
        : 'OVERRIDE';

    await auditService.log(input.actor, action, 'RISK_CLASSIFICATION', {
      targetId: current.citizenId,
      targetLabel: current.citizenName,
      citizenId: current.citizenId,
      purposeCode: 'CLINICAL_CLASSIFICATION_OVERRIDE',
      notes: input.reason,
      details: {
        previousCategory: current.finalCategory,
        newCategory: input.newCategory,
        isCriticalDowngrade: current.isCritical && input.newCategory !== 'DARK_RED',
        notes: input.notes,
      },
    });

    return newClassification;
  },

  async saveBatch(
    batch: ClassificationBatch,
    classifications: RiskClassification[],
    triggeredRules: TriggeredRule[],
    clusters: RiskCluster[],
    actor: User
  ): Promise<void> {
    await simulateNetworkDelay();

    // 1. Append batches
    const existingBatches = rawStorage.getClassificationBatches();
    rawStorage.setClassificationBatches([batch, ...existingBatches]);

    // 2. Append classifications (marking existing for same citizen as superseded)
    const existingClassifications = rawStorage.getRiskClassifications();
    const newCitizenIds = new Set(classifications.map((c) => c.citizenId));

    const updatedExisting = existingClassifications.map((c) => {
      if (newCitizenIds.has(c.citizenId) && !c.supersededById) {
        const matchingNew = classifications.find((nc) => nc.citizenId === c.citizenId);
        if (matchingNew) {
          return { ...c, supersededById: matchingNew.id };
        }
      }
      return c;
    });

    rawStorage.setRiskClassifications([...classifications, ...updatedExisting]);

    // 3. Append triggered rules
    const existingTR = rawStorage.getTriggeredRules();
    rawStorage.setTriggeredRules([...triggeredRules, ...existingTR]);

    // 4. Append risk clusters
    const existingRC = rawStorage.getRiskClusters();
    rawStorage.setRiskClusters([...clusters, ...existingRC]);

    // 5. Audit batch execution
    await auditService.log(actor, 'EXECUTE_BATCH', 'CLASSIFICATION_BATCH', {
      targetId: batch.id,
      targetLabel: `Batch ${batch.id} (${batch.ruleVersion})`,
      purposeCode: 'MASS_CKG_RISK_STRATIFICATION',
      rowCount: classifications.length,
      details: {
        total: batch.total,
        completed: batch.completed,
        awaitingConfirmationCount: batch.awaitingConfirmationCount,
        undeterminedCount: batch.undeterminedCount,
        criticalCount: batch.criticalCount,
        ruleVersion: batch.ruleVersion,
      },
    });
  },
};
