import { citizenLocalCacheRepo } from '../repositories/citizenLocalCacheRepo';
import { CitizenOfflineCacheData } from '../types';

export const citizenOfflineCacheService = {
  /**
   * Retrieves offline cached data with exact timestamp
   */
  async getOfflineData(citizenId: string): Promise<CitizenOfflineCacheData | null> {
    return citizenLocalCacheRepo.getCache(citizenId);
  },

  /**
   * Formats freshness timestamp for citizen UI
   */
  formatFreshnessTime(isoString?: string): string {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIT';
    } catch {
      return isoString;
    }
  },
};
