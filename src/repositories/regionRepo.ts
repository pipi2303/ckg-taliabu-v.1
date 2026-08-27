import { Desa, Kecamatan, Status } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const regionRepo = {
  async getKecamatanList(options?: { status?: Status; search?: string }): Promise<Kecamatan[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getKecamatan();
    if (options?.status) {
      list = list.filter((k) => k.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((k) => k.name.toLowerCase().includes(q) || k.code.toLowerCase().includes(q));
    }
    return list;
  },

  async getKecamatanById(id: string): Promise<Kecamatan | undefined> {
    const list = rawStorage.getKecamatan();
    return list.find((k) => k.id === id);
  },

  async createKecamatan(data: { code: string; name: string }): Promise<Kecamatan> {
    await simulateNetworkDelay();
    const list = rawStorage.getKecamatan();
    const newKec: Kecamatan = {
      id: `kec-${Date.now()}`,
      code: data.code,
      name: data.name,
      villageCount: 0,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setKecamatan([...list, newKec]);
    return newKec;
  },

  async updateKecamatan(id: string, updates: Partial<Kecamatan>): Promise<Kecamatan> {
    await simulateNetworkDelay();
    const list = rawStorage.getKecamatan();
    const index = list.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Kecamatan tidak ditemukan');
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setKecamatan([...list]);
    return updated;
  },

  async toggleKecamatanStatus(id: string, status: Status): Promise<Kecamatan> {
    return this.updateKecamatan(id, { status });
  },

  async getDesaList(options?: { kecamatanId?: string; status?: Status; search?: string }): Promise<Desa[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getDesa();
    if (options?.kecamatanId) {
      list = list.filter((d) => d.kecamatanId === options.kecamatanId);
    }
    if (options?.status) {
      list = list.filter((d) => d.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.kecamatanName.toLowerCase().includes(q) ||
          d.puskesmasName.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getDesaById(id: string): Promise<Desa | undefined> {
    const list = rawStorage.getDesa();
    return list.find((d) => d.id === id);
  },

  async createDesa(data: {
    code: string;
    name: string;
    kecamatanId: string;
    kecamatanName: string;
    puskesmasId: string;
    puskesmasName: string;
  }): Promise<Desa> {
    await simulateNetworkDelay();
    const list = rawStorage.getDesa();
    const newDesa: Desa = {
      id: `des-${Date.now()}`,
      code: data.code,
      name: data.name,
      kecamatanId: data.kecamatanId,
      kecamatanName: data.kecamatanName,
      puskesmasId: data.puskesmasId,
      puskesmasName: data.puskesmasName,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setDesa([...list, newDesa]);

    // Update villageCount in Kecamatan
    const kecList = rawStorage.getKecamatan();
    const kecIdx = kecList.findIndex((k) => k.id === data.kecamatanId);
    if (kecIdx !== -1) {
      kecList[kecIdx] = {
        ...kecList[kecIdx],
        villageCount: (kecList[kecIdx].villageCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      rawStorage.setKecamatan([...kecList]);
    }

    return newDesa;
  },

  async updateDesa(id: string, updates: Partial<Desa>): Promise<Desa> {
    await simulateNetworkDelay();
    const list = rawStorage.getDesa();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Desa tidak ditemukan');
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setDesa([...list]);
    return updated;
  },

  async toggleDesaStatus(id: string, status: Status): Promise<Desa> {
    return this.updateDesa(id, { status });
  },
};
