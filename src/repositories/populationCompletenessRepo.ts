import { PopulationDataCompleteness, SmallCellSuppressionPolicy } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const populationCompletenessRepo = {
  async getAll(): Promise<PopulationDataCompleteness[]> {
    await simulateNetworkDelay();
    return rawStorage.getPopulationCompleteness();
  },

  async updateFacilityStatus(
    facilityId: string,
    updates: Partial<PopulationDataCompleteness>
  ): Promise<PopulationDataCompleteness> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationCompleteness();
    const index = list.findIndex((item) => item.facilityId === facilityId);
    if (index === -1) {
      throw new Error(`Facility ${facilityId} not found in completeness tracking.`);
    }
    const updated = {
      ...list[index],
      ...updates,
    };
    const nextList = [...list];
    nextList[index] = updated;
    rawStorage.setPopulationCompleteness(nextList);
    return updated;
  },

  async getSmallCellPolicy(): Promise<SmallCellSuppressionPolicy> {
    await simulateNetworkDelay();
    return rawStorage.getSmallCellPolicy();
  },

  async updateSmallCellPolicy(policy: SmallCellSuppressionPolicy): Promise<SmallCellSuppressionPolicy> {
    await simulateNetworkDelay();
    rawStorage.setSmallCellPolicy(policy);
    return policy;
  },
};
