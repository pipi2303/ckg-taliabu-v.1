import { MetricDefinition } from '../types';
import { metricDefinitionRepo } from '../repositories/metricDefinitionRepo';

export const populationMetricDefinitionService = {
  async getAllDefinitions(): Promise<MetricDefinition[]> {
    return metricDefinitionRepo.getAll();
  },

  async getDefinition(metricCode: string): Promise<MetricDefinition | undefined> {
    return metricDefinitionRepo.getByCode(metricCode);
  },
};
