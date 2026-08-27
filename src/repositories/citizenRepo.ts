import {
  Citizen,
  CitizenAreaHistory,
  CitizenIdentifier,
  IdentityMergeHistory,
} from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export interface CitizenFilterParams {
  search?: string;
  nik?: string;
  phone?: string;
  villageId?: string;
  facilityId?: string;
  kecamatanId?: string;
  sex?: 'MALE' | 'FEMALE';
  isComplete?: boolean;
  page?: number;
  limit?: number;
}

export interface CitizenQueryResult {
  data: (Citizen & {
    identifiers: CitizenIdentifier[];
    latestScreeningDate?: string;
    totalSessionsCount: number;
    isCompleteLatest: boolean;
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const citizenRepo = {
  async getAll(): Promise<Citizen[]> {
    await simulateNetworkDelay();
    return rawStorage.getCitizens().filter((c) => !c.mergedIntoId);
  },

  async query(params: CitizenFilterParams = {}): Promise<CitizenQueryResult> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const identifiers = rawStorage.getCitizenIdentifiers();
    const sessions = rawStorage.getScreeningSessions();

    const page = params.page || 1;
    const limit = params.limit || 25;

    // Filter active (unmerged or non-deleted)
    let filtered = citizens.filter((c) => !c.mergedIntoId);

    if (params.facilityId && params.facilityId !== 'ALL') {
      filtered = filtered.filter((c) => c.facilityId === params.facilityId);
    }

    if (params.kecamatanId && params.kecamatanId !== 'ALL') {
      filtered = filtered.filter((c) => c.kecamatanId === params.kecamatanId);
    }

    if (params.villageId && params.villageId !== 'ALL') {
      filtered = filtered.filter((c) => c.villageId === params.villageId);
    }

    if (params.sex) {
      filtered = filtered.filter((c) => c.sex === params.sex);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((c) => {
        const nameMatch = c.fullName.toLowerCase().includes(q);
        const villageMatch = (c.villageName || '').toLowerCase().includes(q);
        const faskesMatch = (c.facilityName || '').toLowerCase().includes(q);
        const citizenIdMatch = c.id.toLowerCase().includes(q);
        return nameMatch || villageMatch || faskesMatch || citizenIdMatch;
      });
    }

    if (params.nik && params.nik.trim()) {
      const targetNik = params.nik.trim();
      const matchingCitizenIds = new Set(
        identifiers
          .filter((i) => i.identifierType === 'NIK' && i.identifierValue.includes(targetNik))
          .map((i) => i.citizenId)
      );
      filtered = filtered.filter((c) => matchingCitizenIds.has(c.id));
    }

    // Attach identifiers & screening summary
    const enhanced = filtered.map((c) => {
      const cIdentifiers = identifiers.filter((i) => i.citizenId === c.id);
      const cSessions = sessions.filter((s) => s.citizenId === c.id);
      const sortedSessions = [...cSessions].sort(
        (a, b) => new Date(b.screenedAt).getTime() - new Date(a.screenedAt).getTime()
      );
      const latest = sortedSessions[0];

      return {
        ...c,
        identifiers: cIdentifiers,
        latestScreeningDate: latest?.screenedAt,
        totalSessionsCount: cSessions.length,
        isCompleteLatest: latest?.isComplete ?? false,
      };
    });

    // Completeness filter if applied
    let finalData = enhanced;
    if (params.isComplete !== undefined) {
      finalData = finalData.filter((c) => c.isCompleteLatest === params.isComplete);
    }

    const total = finalData.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = finalData.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getById(id: string): Promise<(Citizen & { identifiers: CitizenIdentifier[] }) | null> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const citizen = citizens.find((c) => c.id === id);
    if (!citizen) return null;

    const identifiers = rawStorage.getCitizenIdentifiers().filter((i) => i.citizenId === id);
    return {
      ...citizen,
      identifiers,
    };
  },

  async getByIdentifier(type: 'NIK' | 'SATUSEHAT_ID', value: string): Promise<Citizen | null> {
    await simulateNetworkDelay();
    const identifiers = rawStorage.getCitizenIdentifiers();
    const match = identifiers.find((i) => i.identifierType === type && i.identifierValue === value);
    if (!match) return null;

    const citizens = rawStorage.getCitizens();
    return citizens.find((c) => c.id === match.citizenId) || null;
  },

  async getAreaHistory(citizenId: string): Promise<CitizenAreaHistory[]> {
    await simulateNetworkDelay();
    return rawStorage
      .getAreaHistories()
      .filter((h) => h.citizenId === citizenId)
      .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
  },

  async create(
    data: Omit<Citizen, 'id' | 'createdAt' | 'updatedAt'>,
    nik?: string
  ): Promise<Citizen> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const id = `CIT-8208-${String(citizens.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newCitizen: Citizen = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    rawStorage.setCitizens([newCitizen, ...citizens]);

    if (nik) {
      const identifiers = rawStorage.getCitizenIdentifiers();
      identifiers.push({
        id: `IDN-${id}`,
        citizenId: id,
        identifierType: 'NIK',
        identifierValue: nik,
        sourceSystem: 'OPERATIONAL_REGISTRY',
        validFrom: now,
      });
      rawStorage.setCitizenIdentifiers(identifiers);
    }

    return newCitizen;
  },

  async update(id: string, updates: Partial<Citizen>): Promise<Citizen> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const index = citizens.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Warga tidak ditemukan');

    const updated = {
      ...citizens[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    citizens[index] = updated;
    rawStorage.setCitizens([...citizens]);
    return updated;
  },

  async recordAreaChange(
    citizenId: string,
    newVillageId: string,
    newVillageName: string,
    newKecamatanId: string,
    newKecamatanName: string,
    newFacilityId: string,
    newFacilityName: string,
    reason: string,
    userId: string,
    userName: string
  ): Promise<Citizen> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const citizen = citizens.find((c) => c.id === citizenId);
    if (!citizen) throw new Error('Warga tidak ditemukan');

    const now = new Date().toISOString();
    const areaHistories = rawStorage.getAreaHistories();

    // Close previous active history if any
    const existingActive = areaHistories.find(
      (h) => h.citizenId === citizenId && !h.validTo
    );
    if (existingActive) {
      existingActive.validTo = now;
    }

    // Add new history
    areaHistories.push({
      id: `AH-${Date.now()}`,
      citizenId,
      villageId: newVillageId,
      villageName: newVillageName,
      facilityId: newFacilityId,
      facilityName: newFacilityName,
      validFrom: now,
      changeReason: reason,
      confirmedByUserId: userId,
      confirmedByUserName: userName,
    });
    rawStorage.setAreaHistories(areaHistories);

    // Update current citizen ownership
    return this.update(citizenId, {
      villageId: newVillageId,
      villageName: newVillageName,
      kecamatanId: newKecamatanId,
      kecamatanName: newKecamatanName,
      facilityId: newFacilityId,
      facilityName: newFacilityName,
    });
  },

  async merge(
    sourceCitizenId: string,
    targetCitizenId: string,
    reason: string,
    user: { id: string; name: string }
  ): Promise<IdentityMergeHistory> {
    await simulateNetworkDelay();
    const citizens = rawStorage.getCitizens();
    const source = citizens.find((c) => c.id === sourceCitizenId);
    const target = citizens.find((c) => c.id === targetCitizenId);

    if (!source || !target) throw new Error('Data warga untuk penggabungan tidak valid.');

    const now = new Date().toISOString();

    // 1. Mark source as merged
    source.mergedIntoId = targetCitizenId;
    source.updatedAt = now;
    rawStorage.setCitizens([...citizens]);

    // 2. Re-point screening sessions to target
    const sessions = rawStorage.getScreeningSessions();
    sessions.forEach((s) => {
      if (s.citizenId === sourceCitizenId) {
        s.citizenId = targetCitizenId;
      }
    });
    rawStorage.setScreeningSessions([...sessions]);

    // 3. Create merge history
    const mergeHistory: IdentityMergeHistory = {
      id: `MRG-${Date.now()}`,
      sourceCitizenId,
      targetCitizenId,
      sourceCitizenName: source.fullName,
      targetCitizenName: target.fullName,
      reason,
      mergedByUserId: user.id,
      mergedByUserName: user.name,
      mergedAt: now,
      isUnmerged: false,
    };

    const existingHistories = rawStorage.getMergeHistories();
    rawStorage.setMergeHistories([mergeHistory, ...existingHistories]);

    return mergeHistory;
  },

  async unmerge(
    mergeHistoryId: string,
    unmergedReason: string,
    user: { id: string; name: string }
  ): Promise<void> {
    await simulateNetworkDelay();
    const mergeHistories = rawStorage.getMergeHistories();
    const history = mergeHistories.find((h) => h.id === mergeHistoryId);
    if (!history) throw new Error('Riwayat penggabungan tidak ditemukan.');
    if (history.isUnmerged) throw new Error('Penggabungan ini telah dibatalkan sebelumnya.');

    const now = new Date().toISOString();

    // 1. Restore source citizen
    const citizens = rawStorage.getCitizens();
    const source = citizens.find((c) => c.id === history.sourceCitizenId);
    if (source) {
      delete source.mergedIntoId;
      source.updatedAt = now;
      rawStorage.setCitizens([...citizens]);
    }

    // 2. Update merge history status
    history.isUnmerged = true;
    history.unmergedAt = now;
    history.unmergedByUserId = user.id;
    history.unmergedReason = unmergedReason;
    rawStorage.setMergeHistories([...mergeHistories]);
  },
};
