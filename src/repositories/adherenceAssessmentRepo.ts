import { rawStorage, simulateNetworkDelay } from './storage';
import { AdherenceAssessment, NonAdherenceCause } from '../types';

export const adherenceAssessmentRepo = {
  async getAll(): Promise<AdherenceAssessment[]> {
    await simulateNetworkDelay();
    return rawStorage.getAdherenceAssessments();
  },

  async getById(id: string): Promise<AdherenceAssessment | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getAdherenceAssessments();
    return list.find((a) => a.id === id) || null;
  },

  async getByCycleId(cycleId: string): Promise<AdherenceAssessment | null> {
    await simulateNetworkDelay();
    const list = rawStorage.getAdherenceAssessments();
    return list.find((a) => a.cycleId === cycleId) || null;
  },

  async getByCitizenId(citizenId: string): Promise<AdherenceAssessment[]> {
    await simulateNetworkDelay();
    const list = rawStorage.getAdherenceAssessments();
    return list
      .filter((a) => a.citizenId === citizenId)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
  },

  async create(
    assessment: Omit<AdherenceAssessment, 'id' | 'assessedAt'>
  ): Promise<AdherenceAssessment> {
    await simulateNetworkDelay();
    const list = rawStorage.getAdherenceAssessments();
    const now = new Date().toISOString();
    const newAssessment: AdherenceAssessment = {
      ...assessment,
      id: `ADH-2026-${String(list.length + 1).padStart(4, '0')}`,
      assessedAt: now,
      causes: (assessment.causes || []).map((c, idx) => ({
        ...c,
        id: c.id || `cause-${Date.now()}-${idx}`,
        assessmentId: `ADH-2026-${String(list.length + 1).padStart(4, '0')}`,
        createdAt: c.createdAt || now,
      })),
    };
    rawStorage.setAdherenceAssessments([newAssessment, ...list]);
    return newAssessment;
  },

  async addCauses(assessmentId: string, causes: Omit<NonAdherenceCause, 'id' | 'assessmentId' | 'createdAt'>[]): Promise<AdherenceAssessment> {
    await simulateNetworkDelay();
    const list = rawStorage.getAdherenceAssessments();
    const index = list.findIndex((a) => a.id === assessmentId);
    if (index === -1) {
      throw new Error(`Adherence assessment ${assessmentId} not found.`);
    }
    const now = new Date().toISOString();
    const newCauses: NonAdherenceCause[] = causes.map((c, idx) => ({
      ...c,
      id: `cause-${Date.now()}-${idx}`,
      assessmentId,
      createdAt: now,
    }));
    const updated: AdherenceAssessment = {
      ...list[index],
      causes: [...list[index].causes, ...newCauses],
    };
    list[index] = updated;
    rawStorage.setAdherenceAssessments([...list]);
    return updated;
  },
};
