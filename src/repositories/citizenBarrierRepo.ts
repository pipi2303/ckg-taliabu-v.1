import { rawStorage as storage } from './storage';
import { CitizenBarrierReport } from '../types';

export const citizenBarrierRepo = {
  getAll: async (): Promise<CitizenBarrierReport[]> => {
    return storage.getCitizenBarriers();
  },

  getByCitizenId: async (citizenId: string): Promise<CitizenBarrierReport[]> => {
    const all = storage.getCitizenBarriers();
    return all.filter((b) => b.citizenId === citizenId);
  },

  getByFacilityId: async (facilityId: string): Promise<CitizenBarrierReport[]> => {
    const all = storage.getCitizenBarriers();
    return all.filter((b) => b.facilityId === facilityId);
  },

  create: async (report: CitizenBarrierReport): Promise<CitizenBarrierReport> => {
    const all = storage.getCitizenBarriers();
    all.unshift(report);
    storage.setCitizenBarriers(all);
    return report;
  },

  updateStatus: async (
    id: string,
    status: 'RECEIVED_BY_PUSKESMAS' | 'REVIEWED' | 'ACTIONED'
  ): Promise<CitizenBarrierReport | null> => {
    const all = storage.getCitizenBarriers();
    const item = all.find((b) => b.id === id);
    if (!item) return null;
    item.status = status;
    storage.setCitizenBarriers(all);
    return item;
  },
};
