import { rawStorage as storage } from './storage';
import { CitizenOfflineCacheData } from '../types';

export const citizenLocalCacheRepo = {
  getCache: async (citizenId: string): Promise<CitizenOfflineCacheData | null> => {
    return storage.getCitizenOfflineCache(citizenId);
  },

  saveCache: async (citizenId: string, data: CitizenOfflineCacheData): Promise<void> => {
    storage.setCitizenOfflineCache(citizenId, data);
  },
};
