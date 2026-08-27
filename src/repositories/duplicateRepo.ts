import { IdentityMatchCandidate, IdentityMergeHistory } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const duplicateRepo = {
  async query(status: 'ALL' | 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED' = 'ALL'): Promise<IdentityMatchCandidate[]> {
    await simulateNetworkDelay();
    let candidates = rawStorage.getDuplicateCandidates();
    if (status !== 'ALL') {
      candidates = candidates.filter((c) => c.status === status);
    }
    return candidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<IdentityMatchCandidate | null> {
    await simulateNetworkDelay();
    const candidates = rawStorage.getDuplicateCandidates();
    return candidates.find((c) => c.id === id) || null;
  },

  async getMergeHistories(): Promise<IdentityMergeHistory[]> {
    await simulateNetworkDelay();
    return rawStorage.getMergeHistories().sort((a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime());
  },

  async dismiss(id: string): Promise<void> {
    await simulateNetworkDelay();
    const candidates = rawStorage.getDuplicateCandidates();
    const index = candidates.findIndex((c) => c.id === id);
    if (index !== -1) {
      candidates[index].status = 'DISMISSED';
      rawStorage.setDuplicateCandidates([...candidates]);
    }
  },

  async markMerged(id: string): Promise<void> {
    await simulateNetworkDelay();
    const candidates = rawStorage.getDuplicateCandidates();
    const index = candidates.findIndex((c) => c.id === id);
    if (index !== -1) {
      candidates[index].status = 'MERGED';
      rawStorage.setDuplicateCandidates([...candidates]);
    }
  },
};
