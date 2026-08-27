import { rawStorage, simulateNetworkDelay } from './storage';
import { OutcomeEvaluation } from '../types';

export const outcomeEvaluationRepo = {
  async getAll(): Promise<OutcomeEvaluation[]> {
    await simulateNetworkDelay();
    return rawStorage.getOutcomeEvaluations();
  },

  async getById(id: string): Promise<OutcomeEvaluation | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    return list.find((o) => o.id === id) || null;
  },

  async getByCycleId(cycleId: string): Promise<OutcomeEvaluation | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    // Return latest non-superseded evaluation
    return list.find((o) => o.cycleId === cycleId && !o.supersededById) || null;
  },

  async getHistoryByCycleId(cycleId: string): Promise<OutcomeEvaluation[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    return list
      .filter((o) => o.cycleId === cycleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getByCitizenId(citizenId: string): Promise<OutcomeEvaluation[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    return list
      .filter((o) => o.citizenId === citizenId && !o.supersededById)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(
    outcome: Omit<OutcomeEvaluation, 'id' | 'createdAt'>
  ): Promise<OutcomeEvaluation> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    const now = new Date().toISOString();
    const newOutcome: OutcomeEvaluation = {
      ...outcome,
      id: `OUT-2026-${String(list.length + 1).padStart(4, '0')}`,
      createdAt: now,
    };
    rawStorage.setOutcomeEvaluations([newOutcome, ...list]);
    return newOutcome;
  },

  /**
   * Immutability enforcement:
   * When an evaluation is amended or manually determined, supersede the previous one rather than deleting.
   */
  async supersede(
    oldId: string,
    newEvaluationData: Omit<OutcomeEvaluation, 'id' | 'createdAt'>
  ): Promise<OutcomeEvaluation> {
    await simulateNetworkDelay();
    const list = rawStorage.getOutcomeEvaluations();
    const oldIndex = list.findIndex((o) => o.id === oldId);
    const now = new Date().toISOString();
    const newId = `OUT-2026-${String(list.length + 1).padStart(4, '0')}`;

    const newOutcome: OutcomeEvaluation = {
      ...newEvaluationData,
      id: newId,
      createdAt: now,
    };

    if (oldIndex !== -1) {
      list[oldIndex] = {
        ...list[oldIndex],
        supersededById: newId,
      };
    }

    rawStorage.setOutcomeEvaluations([newOutcome, ...list]);
    return newOutcome;
  },
};
