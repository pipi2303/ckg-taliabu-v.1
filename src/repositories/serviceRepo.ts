import { HealthService, Status } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const serviceRepo = {
  async getServices(options?: { status?: Status; category?: string; search?: string }): Promise<HealthService[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getServices();

    if (options?.status) {
      list = list.filter((s) => s.status === options.status);
    }
    if (options?.category && options.category !== 'ALL') {
      list = list.filter((s) => s.category === options.category);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.targetDemographic.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async createService(data: Omit<HealthService, 'id' | 'updatedAt'>): Promise<HealthService> {
    await simulateNetworkDelay();
    const list = rawStorage.getServices();
    const newService: HealthService = {
      ...data,
      id: `srv-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setServices([...list, newService]);
    return newService;
  },

  async updateService(id: string, updates: Partial<HealthService>): Promise<HealthService> {
    await simulateNetworkDelay();
    const list = rawStorage.getServices();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Layanan tidak ditemukan');
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setServices([...list]);
    return updated;
  },

  async toggleStatus(id: string, status: Status): Promise<HealthService> {
    return this.updateService(id, { status });
  },
};
