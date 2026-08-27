import { rawStorage as storage } from './storage';

export interface CitizenSession {
  citizenId: string;
  phone: string;
  token: string;
  loginAt: string;
  expiresAt: string;
}

export const citizenSessionRepo = {
  getCurrentSession: async (): Promise<CitizenSession | null> => {
    const raw = storage.getCitizenCurrentSession();
    if (!raw) return null;
    return raw as CitizenSession;
  },

  setSession: async (session: CitizenSession | null): Promise<void> => {
    storage.setCitizenCurrentSession(session);
  },

  clearSession: async (): Promise<void> => {
    storage.setCitizenCurrentSession(null);
  },
};
