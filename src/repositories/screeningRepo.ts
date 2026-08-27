import {
  Observation,
  ScreeningResult,
  ScreeningSession,
} from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const screeningRepo = {
  async getAllSessions(): Promise<ScreeningSession[]> {
    await simulateNetworkDelay();
    return rawStorage.getScreeningSessions();
  },

  async getAllResults(): Promise<ScreeningResult[]> {
    await simulateNetworkDelay();
    return rawStorage.getScreeningResults();
  },

  async getSessionsByCitizenId(citizenId: string): Promise<ScreeningSession[]> {
    await simulateNetworkDelay();
    return rawStorage
      .getScreeningSessions()
      .filter((s) => s.citizenId === citizenId)
      .sort((a, b) => new Date(b.screenedAt).getTime() - new Date(a.screenedAt).getTime());
  },

  async getResultsBySessionId(sessionId: string): Promise<ScreeningResult[]> {
    await simulateNetworkDelay();
    return rawStorage
      .getScreeningResults()
      .filter((r) => r.sessionId === sessionId)
      .sort((a, b) => a.sequenceInSession - b.sequenceInSession);
  },

  async getResultsByCitizenId(citizenId: string): Promise<ScreeningResult[]> {
    await simulateNetworkDelay();
    return rawStorage
      .getScreeningResults()
      .filter((r) => r.citizenId === citizenId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  },

  async getObservationsByCitizenId(citizenId: string): Promise<Observation[]> {
    await simulateNetworkDelay();
    return rawStorage
      .getObservations()
      .filter((o) => o.citizenId === citizenId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  },

  async createSessionWithResults(
    sessionData: Omit<ScreeningSession, 'id' | 'ingestedAt'>,
    resultsData: Omit<ScreeningResult, 'id' | 'sessionId'>[]
  ): Promise<{ session: ScreeningSession; results: ScreeningResult[] }> {
    await simulateNetworkDelay();
    const sessions = rawStorage.getScreeningSessions();
    const results = rawStorage.getScreeningResults();

    const sessionId = `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const session: ScreeningSession = {
      ...sessionData,
      id: sessionId,
      ingestedAt: now,
    };

    const newResults: ScreeningResult[] = resultsData.map((r, idx) => ({
      ...r,
      id: `RES-${sessionId}-${idx + 1}`,
      sessionId,
      citizenId: sessionData.citizenId,
      sequenceInSession: idx + 1,
    }));

    rawStorage.setScreeningSessions([session, ...sessions]);
    rawStorage.setScreeningResults([...newResults, ...results]);

    return { session, results: newResults };
  },
};
