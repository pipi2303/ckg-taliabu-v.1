import { aiRepository } from '../repositories/aiRepository';
import { AIGovernanceConfig, RoleId } from '../types';
import { auditRepo } from '../repositories/auditRepo';

export const aiGovernanceService = {
  async getConfig(): Promise<AIGovernanceConfig> {
    return aiRepository.getGovernanceConfig();
  },

  async updateConfig(newConfig: Partial<AIGovernanceConfig>, actor: { id: string; name: string; role: string }): Promise<AIGovernanceConfig> {
    const updated = await aiRepository.updateGovernanceConfig(newConfig);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: (actor.role || 'ADMIN_DINKES') as RoleId,
      action: 'UPDATE',
      entityType: 'POPULATION_REPORT',
      entityId: 'AI-GOV-CONFIG',
      targetLabel: 'AI Safety & Governance Configuration Update',
      description: `Konfigurasi tata kelola AI diperbarui oleh ${actor.name} (${actor.role})`,
      details: newConfig,
    });

    return updated;
  },

  async getSafetyMetrics() {
    const recommendations = await aiRepository.getClinicalRecommendations();
    const approved = recommendations.filter((r) => r.humanReviewStatus === 'APPROVED_BY_CLINICIAN').length;
    const modified = recommendations.filter((r) => r.humanReviewStatus === 'MODIFIED_BY_CLINICIAN').length;
    const rejected = recommendations.filter((r) => r.humanReviewStatus === 'REJECTED_BY_CLINICIAN').length;
    const pending = recommendations.filter((r) => r.humanReviewStatus === 'PENDING_REVIEW').length;

    return {
      totalEvaluations: recommendations.length,
      approvedCount: approved,
      modifiedCount: modified,
      rejectedCount: rejected,
      pendingReviewCount: pending,
      clinicianAgreementRate: recommendations.length > 0 ? Math.round(((approved + modified) / recommendations.length) * 100) : 100,
      activeGuardrailMode: 'STRICT_HUMAN_IN_THE_LOOP',
      isOfflineFallbackActive: false,
    };
  },
};
