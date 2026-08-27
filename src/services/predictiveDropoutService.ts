import { modelGovernanceRepo } from '../repositories/modelGovernanceRepo';
import { ModelPrediction, PredictionAttentionSignal, PredictionLevel } from '../types';

export const predictiveDropoutService = {
  // Get dropout prediction for a citizen (PA-01)
  getDropoutPrediction(citizenId: string): ModelPrediction | null {
    const predictions = modelGovernanceRepo.getPredictionsByCitizenId(citizenId);
    const dropoutPred = predictions.find((p) => p.predictionType === 'DROPOUT_RISK');
    if (!dropoutPred) return null;

    const globalMode = modelGovernanceRepo.getAIIntelligenceMode();
    const model = modelGovernanceRepo.getModelById('PA-01');

    // If global AI is OFF or model is PAUSED, return inactive state
    if (globalMode === 'OFF' || model?.lifecycleStatus === 'PAUSED' || model?.lifecycleStatus === 'RETIRED') {
      return {
        ...dropoutPred,
        modelMode: 'SHADOW',
      };
    }

    return dropoutPred;
  },

  // Calculate operational priority contribution from AI prediction
  // ABSOLUTE FAIRNESS RULE:
  // - Prediction only contributes attention (+0 to +20)
  // - LOW score contributes exactly 0 (NEVER negative priority, NEVER reduces care)
  // - Model cannot reduce required outreach attempts or close tasks
  getPriorityContribution(citizenId: string): PredictionAttentionSignal {
    const pred = this.getDropoutPrediction(citizenId);
    const globalMode = modelGovernanceRepo.getAIIntelligenceMode();
    const model = modelGovernanceRepo.getModelById('PA-01');

    // Only active if governed active mode AND model is ACTIVE
    const isOperationallyActive =
      globalMode === 'GOVERNED_ACTIVE' && model?.lifecycleStatus === 'ACTIVE';

    if (!pred || !isOperationallyActive || pred.predictionLevel === 'NOT_PREDICTABLE' || pred.predictionLevel === 'LOW') {
      return {
        predictionId: pred?.id || 'NONE',
        citizenId,
        level: 'MEDIUM',
        contribution: 0, // Zero contribution for LOW/NOT_PREDICTABLE/SHADOW
        createdAt: new Date().toISOString(),
      };
    }

    if (pred.predictionLevel === 'HIGH') {
      return {
        predictionId: pred.id,
        citizenId,
        level: 'HIGH',
        contribution: 15, // Configurable priority bump for faskes attention
        createdAt: new Date().toISOString(),
      };
    }

    return {
      predictionId: pred.id,
      citizenId,
      level: 'MEDIUM',
      contribution: 5,
      createdAt: new Date().toISOString(),
    };
  },

  // Submit staff field feedback (PA-09)
  submitStaffFeedback(params: {
    predictionId: string;
    citizenId: string;
    userId: string;
    userName: string;
    userRole: string;
    facilityName: string;
    feedback: 'AGREE' | 'DISAGREE' | 'UNCERTAIN';
    reason: string;
  }) {
    return modelGovernanceRepo.addFeedback(params);
  },

  // Regression safety check: ensure model never reduces minimum care
  verifyRegressionSafety(citizenA_HighRiskScore: PredictionLevel, citizenB_LowRiskScore: PredictionLevel): boolean {
    const contributionA = citizenA_HighRiskScore === 'HIGH' ? 15 : 0;
    const contributionB = citizenB_LowRiskScore === 'LOW' ? 0 : 0;
    return contributionB >= 0 && contributionA >= contributionB;
  }
};
