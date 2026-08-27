import { rawStorage as storage } from './storage';
import { CitizenResponseToken, CitizenOtpChallenge } from '../types';

export const citizenResponseRepo = {
  // Token handlers
  getTokens: async (): Promise<CitizenResponseToken[]> => {
    return storage.getCitizenResponseTokens();
  },

  getTokenById: async (id: string): Promise<CitizenResponseToken | null> => {
    const tokens = storage.getCitizenResponseTokens();
    return tokens.find((t) => t.id === id) || null;
  },

  createToken: async (token: CitizenResponseToken): Promise<void> => {
    const tokens = storage.getCitizenResponseTokens();
    tokens.push(token);
    storage.setCitizenResponseTokens(tokens);
  },

  consumeToken: async (id: string): Promise<boolean> => {
    const tokens = storage.getCitizenResponseTokens();
    const token = tokens.find((t) => t.id === id);
    if (!token || token.consumedAt) return false;
    token.consumedAt = new Date().toISOString();
    storage.setCitizenResponseTokens(tokens);
    return true;
  },

  // OTP Challenges
  getOtpChallenges: async (): Promise<CitizenOtpChallenge[]> => {
    return storage.getCitizenOtpChallenges();
  },

  createOtpChallenge: async (challenge: CitizenOtpChallenge): Promise<void> => {
    const challenges = storage.getCitizenOtpChallenges();
    challenges.unshift(challenge);
    storage.setCitizenOtpChallenges(challenges);
  },

  updateOtpChallenge: async (challenge: CitizenOtpChallenge): Promise<void> => {
    const challenges = storage.getCitizenOtpChallenges();
    const idx = challenges.findIndex((c) => c.id === challenge.id);
    if (idx >= 0) {
      challenges[idx] = challenge;
      storage.setCitizenOtpChallenges(challenges);
    }
  },
};
