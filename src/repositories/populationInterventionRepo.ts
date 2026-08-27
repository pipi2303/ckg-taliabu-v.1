import { PopulationIntervention } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const populationInterventionRepo = {
  async getAll(): Promise<PopulationIntervention[]> {
    await simulateNetworkDelay();
    return rawStorage.getPopulationInterventions();
  },

  async getById(id: string): Promise<PopulationIntervention | undefined> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationInterventions();
    return list.find((item) => item.id === id);
  },

  async create(data: Omit<PopulationIntervention, 'id' | 'createdAt' | 'progressNotes'>): Promise<PopulationIntervention> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationInterventions();
    const newIntervention: PopulationIntervention = {
      ...data,
      id: `int-pop-${Date.now().toString().slice(-4)}`,
      progressNotes: [],
      createdAt: new Date().toISOString(),
    };
    rawStorage.setPopulationInterventions([newIntervention, ...list]);
    return newIntervention;
  },

  async update(id: string, updates: Partial<PopulationIntervention>): Promise<PopulationIntervention> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationInterventions();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Intervensi ${id} tidak ditemukan.`);
    }
    const updated = {
      ...list[index],
      ...updates,
    };
    const nextList = [...list];
    nextList[index] = updated;
    rawStorage.setPopulationInterventions(nextList);
    return updated;
  },

  async addProgressNote(id: string, noteText: string, authorName: string): Promise<PopulationIntervention> {
    await simulateNetworkDelay();
    const list = rawStorage.getPopulationInterventions();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Intervensi ${id} tidak ditemukan.`);
    }
    const existing = list[index];
    const newNote = {
      id: `pnote-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      authorName,
      note: noteText,
    };
    const updated: PopulationIntervention = {
      ...existing,
      progressNotes: [newNote, ...existing.progressNotes],
    };
    const nextList = [...list];
    nextList[index] = updated;
    rawStorage.setPopulationInterventions(nextList);
    return updated;
  },
};
