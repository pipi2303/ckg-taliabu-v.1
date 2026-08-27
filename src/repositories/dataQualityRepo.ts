import { DataQualityIssue, DataQualityProblemType, DataQualityStatus } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export interface DataQualityFilterParams {
  status?: DataQualityStatus | 'ALL';
  problemType?: DataQualityProblemType | 'ALL';
  facilityId?: string;
  search?: string;
}

export const dataQualityRepo = {
  async query(params: DataQualityFilterParams = {}): Promise<DataQualityIssue[]> {
    await simulateNetworkDelay();
    let items = rawStorage.getDataQualityIssues();

    if (params.status && params.status !== 'ALL') {
      items = items.filter((i) => i.status === params.status);
    }

    if (params.problemType && params.problemType !== 'ALL') {
      items = items.filter((i) => i.problemType === params.problemType);
    }

    if (params.facilityId && params.facilityId !== 'ALL') {
      items = items.filter((i) => i.facilityId === params.facilityId);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.citizenName.toLowerCase().includes(q) ||
          (i.identifierValue || '').toLowerCase().includes(q) ||
          i.problemDescription.toLowerCase().includes(q) ||
          (i.facilityName || '').toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<DataQualityIssue | null> {
    await simulateNetworkDelay();
    const items = rawStorage.getDataQualityIssues();
    return items.find((i) => i.id === id) || null;
  },

  async resolve(
    id: string,
    action: 'MATCH_EXISTING' | 'CREATE_NEW' | 'MARK_OUTSIDE_AREA' | 'REJECT',
    notes: string,
    user: { id: string; name: string },
    matchedCitizenId?: string
  ): Promise<DataQualityIssue> {
    await simulateNetworkDelay();
    const items = rawStorage.getDataQualityIssues();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Data Bermasalah tidak ditemukan');

    const issue = items[index];
    const now = new Date().toISOString();

    const updated: DataQualityIssue = {
      ...issue,
      status: action === 'REJECT' ? 'REJECTED' : 'RESOLVED',
      resolvedAt: now,
      resolvedByUserId: user.id,
      resolvedByUserName: user.name,
      resolutionNotes: notes,
      matchedCitizenId,
    };

    items[index] = updated;
    rawStorage.setDataQualityIssues([...items]);
    return updated;
  },

  async addIssue(issue: Omit<DataQualityIssue, 'id' | 'createdAt' | 'status'>): Promise<DataQualityIssue> {
    await simulateNetworkDelay();
    const items = rawStorage.getDataQualityIssues();
    const id = `DQI-${String(items.length + 1).padStart(3, '0')}`;
    const newIssue: DataQualityIssue = {
      ...issue,
      id,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    rawStorage.setDataQualityIssues([newIssue, ...items]);
    return newIssue;
  },

  async getStats() {
    await simulateNetworkDelay();
    const items = rawStorage.getDataQualityIssues();
    const openItems = items.filter((i) => i.status === 'OPEN');
    return {
      totalOpen: openItems.length,
      identityConflict: openItems.filter((i) => i.problemType === 'SAME_NIK_DIFFERENT_NAME' || i.problemType === 'IDENTITY_AMBIGUOUS').length,
      invalidNik: openItems.filter((i) => i.problemType === 'INVALID_NIK').length,
      missingData: openItems.filter((i) => i.problemType === 'MISSING_BIRTH_DATE' || i.problemType === 'MISSING_UNIT').length,
      areaConflict: openItems.filter((i) => i.problemType === 'OUTSIDE_WORK_AREA' || i.problemType === 'INVALID_VILLAGE').length,
      duplicateCandidate: openItems.filter((i) => i.problemType === 'DUPLICATE_CANDIDATE').length,
      resolvedToday: items.filter((i) => i.status === 'RESOLVED' && i.resolvedAt && new Date(i.resolvedAt).toDateString() === new Date().toDateString()).length,
    };
  },
};
