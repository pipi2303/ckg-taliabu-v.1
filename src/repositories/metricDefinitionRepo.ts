import { MetricDefinition } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const metricDefinitionRepo = {
  async getAll(): Promise<MetricDefinition[]> {
    await simulateNetworkDelay();
    return rawStorage.getMetricDefinitions();
  },

  async getByCode(code: string): Promise<MetricDefinition | undefined> {
    await simulateNetworkDelay();
    const list = rawStorage.getMetricDefinitions();
    return list.find((m) => m.metricCode === code);
  },
};
