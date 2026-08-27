import { PopulationAttentionSignal } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const populationAttentionRepo = {
  async getAll(): Promise<PopulationAttentionSignal[]> {
    await simulateNetworkDelay();
    return rawStorage.getPopulationAttentions();
  },

  async create(data: Omit<PopulationAttentionSignal, 'id' | 'createdAt' | 'status'>): Promise<PopulationAttentionSignal> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationAttentions();
    const newSignal: PopulationAttentionSignal = {
      ...data,
      id: `att-sig-${Date.now().toString().slice(-4)}`,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    rawStorage.setPopulationAttentions([newSignal, ...list]);
    return newSignal;
  },

  async updateStatus(id: string, status: 'SENT' | 'ACKNOWLEDGED' | 'RESOLVED'): Promise<PopulationAttentionSignal> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationAttentions();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Sinyal perhatian ${id} tidak ditemukan.`);
    }
    const updated: PopulationAttentionSignal = {
      ...list[index],
      status,
    };
    const nextList = [...list];
    nextList[index] = updated;
    rawStorage.setPopulationAttentions(nextList);
    return updated;
  },
};
