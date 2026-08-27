import { ConsentRecord, ConsentStatus } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const consentRepo = {
  async getConsents(options?: { status?: ConsentStatus | 'ALL'; channel?: string; search?: string }): Promise<ConsentRecord[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getConsents();

    if (options?.status && options.status !== 'ALL') {
      list = list.filter((c) => c.status === options.status);
    }
    if (options?.channel && options.channel !== 'ALL') {
      list = list.filter((c) => c.channel === options.channel);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.citizenName.toLowerCase().includes(q) ||
          c.citizenNik.includes(q) ||
          (c.assistedByUserName && c.assistedByUserName.toLowerCase().includes(q)) ||
          c.scope.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getByCitizenId(citizenId: string): Promise<ConsentRecord | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getConsents();
    return list.find((c) => c.citizenId === citizenId && c.status === 'ACTIVE') || null;
  },

  async create(data: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    await simulateNetworkDelay();
    const list = rawStorage.getConsents();
    const newConsent: ConsentRecord = {
      ...data,
      id: `cst-${Date.now()}`,
    };
    rawStorage.setConsents([newConsent, ...list]);
    return newConsent;
  },

  async createConsent(data: Omit<ConsentRecord, 'id' | 'grantedAt'>): Promise<ConsentRecord> {
    await simulateNetworkDelay();
    const list = rawStorage.getConsents();
    const newConsent: ConsentRecord = {
      ...data,
      id: `cst-${Date.now()}`,
      grantedAt: new Date().toISOString(),
    };
    rawStorage.setConsents([newConsent, ...list]);
    return newConsent;
  },

  async revokeConsent(id: string, notes?: string): Promise<ConsentRecord> {
    await simulateNetworkDelay();
    const list = rawStorage.getConsents();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Catatan persetujuan tidak ditemukan');

    const updated: ConsentRecord = {
      ...list[index],
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      notes: notes || list[index].notes,
    };
    list[index] = updated;
    rawStorage.setConsents([...list]);
    return updated;
  },
};
