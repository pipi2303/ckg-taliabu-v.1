import { rawStorage as storage } from './storage';
import { CitizenHelpRequest } from '../types';

export const citizenHelpRequestRepo = {
  getAll: async (): Promise<CitizenHelpRequest[]> => {
    return storage.getCitizenHelpRequests();
  },

  getByCitizenId: async (citizenId: string): Promise<CitizenHelpRequest[]> => {
    const all = storage.getCitizenHelpRequests();
    return all.filter((r) => r.citizenId === citizenId);
  },

  getByFacilityId: async (facilityId: string): Promise<CitizenHelpRequest[]> => {
    const all = storage.getCitizenHelpRequests();
    return all.filter((r) => r.facilityId === facilityId);
  },

  create: async (req: CitizenHelpRequest): Promise<CitizenHelpRequest> => {
    const all = storage.getCitizenHelpRequests();
    all.unshift(req);
    storage.setCitizenHelpRequests(all);
    return req;
  },

  updateStatus: async (
    id: string,
    status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED',
    resolvedByUserName?: string,
    resolutionNotes?: string
  ): Promise<CitizenHelpRequest | null> => {
    const all = storage.getCitizenHelpRequests();
    const item = all.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    if (resolvedByUserName) item.resolvedByUserName = resolvedByUserName;
    if (resolutionNotes) item.resolutionNotes = resolutionNotes;
    storage.setCitizenHelpRequests(all);
    return item;
  },
};
