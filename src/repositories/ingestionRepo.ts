import { ImportFileHistory, IngestionRun, SourceMapping } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const ingestionRepo = {
  async getRuns(): Promise<IngestionRun[]> {
    await simulateNetworkDelay();
    return rawStorage.getIngestionRuns().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  async getLatestSuccessfulRun(): Promise<IngestionRun | null> {
    await simulateNetworkDelay();
    const runs = rawStorage.getIngestionRuns();
    const successRuns = runs
      .filter((r) => r.status === 'SUCCESS')
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return successRuns[0] || null;
  },

  async createRun(runData: Omit<IngestionRun, 'id'>): Promise<IngestionRun> {
    await simulateNetworkDelay();
    const runs = rawStorage.getIngestionRuns();
    const id = `RUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
    const newRun: IngestionRun = {
      ...runData,
      id,
    };
    rawStorage.setIngestionRuns([newRun, ...runs]);
    return newRun;
  },

  async updateRun(id: string, updates: Partial<IngestionRun>): Promise<IngestionRun> {
    await simulateNetworkDelay();
    const runs = rawStorage.getIngestionRuns();
    const index = runs.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Ingestion Run tidak ditemukan');

    const updated = {
      ...runs[index],
      ...updates,
    };
    runs[index] = updated;
    rawStorage.setIngestionRuns([...runs]);
    return updated;
  },

  async getWatermark(facilityId: string): Promise<string> {
    return rawStorage.getWatermark(facilityId);
  },

  async advanceWatermark(facilityId: string, timestamp: string): Promise<void> {
    rawStorage.setWatermark(facilityId, timestamp);
  },

  async getSourceMappings(): Promise<SourceMapping[]> {
    await simulateNetworkDelay();
    return rawStorage.getSourceMappings();
  },

  async getImportHistories(): Promise<ImportFileHistory[]> {
    await simulateNetworkDelay();
    return rawStorage.getImportHistories().sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  async addImportHistory(historyData: Omit<ImportFileHistory, 'id'>): Promise<ImportFileHistory> {
    await simulateNetworkDelay();
    const histories = rawStorage.getImportHistories();
    const id = `IMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(histories.length + 1).padStart(3, '0')}`;
    const newHist: ImportFileHistory = {
      ...historyData,
      id,
    };
    rawStorage.setImportHistories([newHist, ...histories]);
    return newHist;
  },
};
