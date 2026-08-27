import { rawStorage, simulateNetworkDelay } from './storage';
import { MonitoringCycle, MonitoringCycleStatus } from '../types';

export const monitoringCycleRepo = {
  async getAll(): Promise<MonitoringCycle[]> {
    await simulateNetworkDelay();
    return rawStorage.getMonitoringCycles();
  },

  async getById(id: string): Promise<MonitoringCycle | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    return list.find((c) => c.id === id) || null;
  },

  async getByCitizenId(citizenId: string): Promise<MonitoringCycle[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    return list
      .filter((c) => c.citizenId === citizenId)
      .sort((a, b) => b.cycleNumber - a.cycleNumber);
  },

  async getActiveCycleByCitizen(citizenId: string): Promise<MonitoringCycle | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    const active = list.find(
      (c) =>
        c.citizenId === citizenId &&
        (c.cycleStatus === 'ACTIVE' ||
          c.cycleStatus === 'AWAITING_CONTROL' ||
          c.cycleStatus === 'AWAITING_MEASUREMENT' ||
          c.cycleStatus === 'AWAITING_EVALUATION' ||
          c.cycleStatus === 'AT_RISK_DROPOUT' ||
          c.cycleStatus === 'PLANNED')
    );
    return active || null;
  },

  async getByFacility(facilityId: string): Promise<MonitoringCycle[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    return list.filter((c) => c.facilityId === facilityId);
  },

  async create(cycle: Omit<MonitoringCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringCycle> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    const now = new Date().toISOString();
    const newCycle: MonitoringCycle = {
      ...cycle,
      id: `MC-2026-${String(list.length + 1).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now,
    };
    rawStorage.setMonitoringCycles([newCycle, ...list]);
    return newCycle;
  },

  async update(id: string, updates: Partial<MonitoringCycle>): Promise<MonitoringCycle> {
    await simulateNetworkDelay();
    const list = rawStorage.getMonitoringCycles();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Monitoring cycle with id ${id} not found.`);
    }
    const updated: MonitoringCycle = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setMonitoringCycles([...list]);
    return updated;
  },

  async updateStatus(id: string, status: MonitoringCycleStatus, notes?: string): Promise<MonitoringCycle> {
    return this.update(id, {
      cycleStatus: status,
      ...(notes ? { notes } : {}),
      ...(status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
    });
  },
};
