import { ModelPerformanceSnapshot } from '../types';

const defaultSnapshots: ModelPerformanceSnapshot[] = [
  {
    id: 'SNAP-PERF-01',
    modelId: 'MDL-DROPOUT-01',
    modelVersion: 'v2.4-shadow',
    evaluationPeriodStart: '2026-06-01',
    evaluationPeriodEnd: '2026-08-20',
    sampleSize: 1240,
    metrics: {
      accuracy: 0.86,
      precision: 0.82,
      recall: 0.89,
      brierScore: 0.11,
      aucRoc: 0.91,
      unscorableRate: 0.04, // 4% NOT_PREDICTABLE rate (acceptable)
    },
    inputDriftDetected: false,
    performanceDegradationDetected: false,
    createdAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'SNAP-PERF-02',
    modelId: 'MDL-BURDEN-08',
    modelVersion: 'v3.1-active',
    evaluationPeriodStart: '2026-05-01',
    evaluationPeriodEnd: '2026-08-01',
    sampleSize: 3420,
    metrics: {
      accuracy: 0.90,
      precision: 0.88,
      recall: 0.92,
      brierScore: 0.08,
      aucRoc: 0.94,
      unscorableRate: 0.01,
    },
    inputDriftDetected: false,
    performanceDegradationDetected: false,
    createdAt: '2026-08-15T08:00:00Z',
  },
];

export const modelPerformanceService = {
  getLatestPerformance(modelId: string): ModelPerformanceSnapshot | undefined {
    return defaultSnapshots.find((s) => s.modelId === modelId || s.modelId.includes(modelId));
  },

  getAllSnapshots(): ModelPerformanceSnapshot[] {
    return [...defaultSnapshots];
  },
};
