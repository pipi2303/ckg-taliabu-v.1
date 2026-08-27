import { modelGovernanceRepo } from '../repositories/modelGovernanceRepo';
import { ModelFairnessFinding } from '../types';

export const modelFairnessService = {
  getFairnessFindings(): ModelFairnessFinding[] {
    return modelGovernanceRepo.getFairnessFindings();
  },

  checkModelFairnessStatus(modelId: string): {
    status: 'FAIR' | 'REVIEW_NEEDED' | 'CRITICAL_BIAS';
    findings: ModelFairnessFinding[];
    requiresAutoPause: boolean;
  } {
    const findings = modelGovernanceRepo.getFairnessFindings().filter(
      (f) => f.modelId === modelId || f.modelId.includes(modelId)
    );

    const unresolvedSignificant = findings.filter(
      (f) => f.severity === 'SIGNIFICANT' && !f.resolvedAt
    );

    const overdueReview = findings.filter(
      (f) => f.remediationDueAt && new Date(f.remediationDueAt).getTime() < Date.now() && !f.resolvedAt
    );

    const requiresAutoPause = unresolvedSignificant.length > 0 || overdueReview.length > 0;

    return {
      status: requiresAutoPause ? 'CRITICAL_BIAS' : (findings.length > 0 ? 'REVIEW_NEEDED' : 'FAIR'),
      findings,
      requiresAutoPause,
    };
  },

  resolveFinding(findingId: string, actor: { userId: string; userName: string }, notes: string) {
    const findings = modelGovernanceRepo.getFairnessFindings();
    const target = findings.find((f) => f.id === findingId);
    if (target) {
      target.resolvedAt = new Date().toISOString();
      target.resolutionNotes = `Diselesaikan oleh ${actor.userName}: ${notes}`;
    }
    return target;
  },

  getKecamatanFairnessMatrix() {
    return [
      { kecamatan: 'Taliabu Barat (Bobong)', sample: 850, accuracy: '89%', falsePositiveRate: '8%', disparity: 'NORMAL' },
      { kecamatan: 'Taliabu Barat Daya (Pancado)', sample: 420, accuracy: '86%', falsePositiveRate: '11%', disparity: 'NORMAL' },
      { kecamatan: 'Taliabu Selatan (Losseng)', sample: 390, accuracy: '85%', falsePositiveRate: '12%', disparity: 'NORMAL' },
      { kecamatan: 'Taliabu Timur (Samuya)', sample: 310, accuracy: '84%', falsePositiveRate: '14%', disparity: 'NORMAL' },
      { kecamatan: 'Taliabu Timur Selatan (Sofan)', sample: 280, accuracy: '83%', falsePositiveRate: '13%', disparity: 'NORMAL' },
      { kecamatan: 'Taliabu Utara (Gela)', sample: 480, accuracy: '78%', falsePositiveRate: '22%', disparity: 'REVIEW_DISPARITY' },
      { kecamatan: 'Lede (Langganu)', sample: 360, accuracy: '79%', falsePositiveRate: '20%', disparity: 'REVIEW_DISPARITY' },
      { kecamatan: 'Tabona (Kataga)', sample: 330, accuracy: '85%', falsePositiveRate: '10%', disparity: 'NORMAL' },
    ];
  }
};
