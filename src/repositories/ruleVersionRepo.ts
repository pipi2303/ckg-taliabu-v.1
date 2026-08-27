import { RuleVersion, RuleVersionStatus } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const ruleVersionRepo = {
  async getRuleVersions(options?: { status?: RuleVersionStatus | 'ALL'; search?: string }): Promise<RuleVersion[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getRuleVersions();

    if (options?.status && options.status !== 'ALL') {
      list = list.filter((r) => r.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.version.toLowerCase().includes(q) ||
          r.sourceDocument.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getRuleVersionById(id: string): Promise<RuleVersion | undefined> {
    const list = rawStorage.getRuleVersions();
    return list.find((r) => r.id === id);
  },

  async createDraft(data: {
    version: string;
    sourceDocument: string;
    effectiveDate: string;
    notes: string;
    rulesCount: number;
  }): Promise<RuleVersion> {
    await simulateNetworkDelay();
    const list = rawStorage.getRuleVersions();

    if (list.some((r) => r.version.toLowerCase() === data.version.toLowerCase())) {
      throw new Error(`Nomor versi "${data.version}" sudah pernah dibuat.`);
    }

    const newVersion: RuleVersion = {
      id: `rv-${Date.now()}`,
      version: data.version,
      status: 'DRAFT',
      sourceDocument: data.sourceDocument,
      effectiveDate: data.effectiveDate,
      notes: data.notes,
      rulesCount: data.rulesCount,
      checksum: Math.random().toString(36).substring(2, 12),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setRuleVersions([newVersion, ...list]);
    return newVersion;
  },

  async submitReview(id: string): Promise<RuleVersion> {
    await simulateNetworkDelay();
    const list = rawStorage.getRuleVersions();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Versi aturan tidak ditemukan');
    if (list[index].status !== 'DRAFT') throw new Error('Hanya draft yang dapat diajukan untuk review');

    const updated: RuleVersion = {
      ...list[index],
      status: 'REVIEW',
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setRuleVersions([...list]);
    return updated;
  },

  async approve(id: string, approverName: string): Promise<RuleVersion> {
    await simulateNetworkDelay();
    const list = rawStorage.getRuleVersions();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Versi aturan tidak ditemukan');
    if (list[index].status !== 'REVIEW') throw new Error('Versi harus berada pada status REVIEW sebelum disetujui');

    const updated: RuleVersion = {
      ...list[index],
      status: 'APPROVED',
      approvedBy: approverName,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setRuleVersions([...list]);
    return updated;
  },

  async publish(id: string, publisherName: string): Promise<RuleVersion> {
    await simulateNetworkDelay();
    let list = rawStorage.getRuleVersions();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Versi aturan tidak ditemukan');
    if (list[index].status !== 'APPROVED' && list[index].status !== 'DRAFT') {
      throw new Error('Versi harus telah disetujui sebelum dipublikasikan');
    }

    // Set previously PUBLISHED version to RETIRED
    list = list.map((r) => {
      if (r.status === 'PUBLISHED') {
        return {
          ...r,
          status: 'RETIRED' as RuleVersionStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    const published: RuleVersion = {
      ...list[index],
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      publishedBy: publisherName,
      updatedAt: new Date().toISOString(),
    };
    list[index] = published;
    rawStorage.setRuleVersions([...list]);
    return published;
  },
};
