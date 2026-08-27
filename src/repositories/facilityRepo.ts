import { FacilityType, HealthFacility, Status } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const facilityRepo = {
  async getAll(): Promise<HealthFacility[]> {
    return this.getFacilities();
  },

  async getById(id: string): Promise<HealthFacility | undefined> {
    return this.getFacilityById(id);
  },

  async getFacilities(options?: {
    type?: FacilityType | 'ALL';
    status?: Status;
    kecamatanId?: string;
    search?: string;
  }): Promise<HealthFacility[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getFacilities();

    if (options?.type && options.type !== 'ALL') {
      list = list.filter((f) => f.type === options.type);
    }
    if (options?.status) {
      list = list.filter((f) => f.status === options.status);
    }
    if (options?.kecamatanId) {
      list = list.filter((f) => f.kecamatanId === options.kecamatanId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.kecamatanName.toLowerCase().includes(q) ||
          f.desaName.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getFacilityById(id: string): Promise<HealthFacility | undefined> {
    const list = rawStorage.getFacilities();
    return list.find((f) => f.id === id);
  },

  async createFacility(data: Omit<HealthFacility, 'id' | 'status' | 'updatedAt' | 'connectedFacilitiesCount' | 'activeUsersCount'>): Promise<HealthFacility> {
    await simulateNetworkDelay();
    const list = rawStorage.getFacilities();
    const newFacility: HealthFacility = {
      ...data,
      id: `faskes-${Date.now()}`,
      status: 'ACTIVE',
      connectedFacilitiesCount: 0,
      activeUsersCount: 0,
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setFacilities([...list, newFacility]);
    return newFacility;
  },

  async updateFacility(id: string, updates: Partial<HealthFacility>): Promise<HealthFacility> {
    await simulateNetworkDelay();
    const list = rawStorage.getFacilities();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Fasilitas kesehatan tidak ditemukan');
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setFacilities([...list]);
    return updated;
  },

  async toggleStatus(id: string, status: Status): Promise<HealthFacility> {
    return this.updateFacility(id, { status });
  },
};
