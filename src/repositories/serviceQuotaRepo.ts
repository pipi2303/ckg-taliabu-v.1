import { ServiceQuota } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditRepo } from './auditRepo';

export const serviceQuotaRepo = {
  async getAll(): Promise<ServiceQuota[]> {
    await simulateNetworkDelay();
    return rawStorage.getServiceQuotas();
  },

  async getByFacilityAndDate(facilityId: string, date: string, serviceType?: string): Promise<ServiceQuota | null> {
    await simulateNetworkDelay();
    const quotas = rawStorage.getServiceQuotas();
    return (
      quotas.find(
        (q) =>
          q.facilityId === facilityId &&
          q.date === date &&
          (!serviceType || q.serviceType === serviceType) &&
          q.active
      ) || null
    );
  },

  async getAvailableDates(facilityId: string, serviceType: string, fromDate?: string): Promise<ServiceQuota[]> {
    await simulateNetworkDelay();
    const quotas = rawStorage.getServiceQuotas();
    const minDate = fromDate || new Date().toISOString().split('T')[0];

    return quotas
      .filter((q) => q.facilityId === facilityId && q.serviceType === serviceType && q.active && q.date >= minDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async create(
    quota: Omit<ServiceQuota, 'id' | 'bookedCount'>,
    actor: { id: string; name: string }
  ): Promise<ServiceQuota> {
    await simulateNetworkDelay();
    const quotas = rawStorage.getServiceQuotas();
    const existing = quotas.find(
      (q) => q.facilityId === quota.facilityId && q.serviceType === quota.serviceType && q.date === quota.date
    );

    if (existing) {
      throw new Error(
        `Kuota untuk faskes dan layanan tersebut pada tanggal ${quota.date} sudah ada. Silakan perbarui kuota yang ada.`
      );
    }

    const id = `QUOTA-${quota.facilityId}-${quota.date.replace(/-/g, '')}`;
    const newQuota: ServiceQuota = {
      ...quota,
      id,
      bookedCount: 0,
    };

    quotas.push(newQuota);
    rawStorage.setServiceQuotas(quotas);

    await auditRepo.log({
      action: 'UPDATE_QUOTA',
      entityType: 'SERVICE_QUOTA',
      entityId: id,
      details: {
        facilityId: quota.facilityId,
        date: quota.date,
        capacity: quota.capacity,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return newQuota;
  },

  async updateCapacity(
    id: string,
    newCapacity: number,
    actor: { id: string; name: string }
  ): Promise<{ quota: ServiceQuota; warning?: string }> {
    await simulateNetworkDelay();
    const quotas = rawStorage.getServiceQuotas();
    const idx = quotas.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Kuota layanan tidak ditemukan.');

    const current = quotas[idx];
    let warning: string | undefined;

    if (newCapacity < current.bookedCount) {
      warning = `Peringatan: Kuota baru (${newCapacity}) lebih kecil daripada jumlah janji temu yang sudah terbentuk (${current.bookedCount}). Janji temu yang ada TIDAK dibatalkan otomatis.`;
    }

    const updated: ServiceQuota = {
      ...current,
      capacity: newCapacity,
    };

    quotas[idx] = updated;
    rawStorage.setServiceQuotas(quotas);

    await auditRepo.log({
      action: 'UPDATE_QUOTA',
      entityType: 'SERVICE_QUOTA',
      entityId: id,
      details: {
        oldCapacity: current.capacity,
        newCapacity,
        bookedCount: current.bookedCount,
        warning,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return { quota: updated, warning };
  },

  async incrementBooked(id: string): Promise<ServiceQuota> {
    const quotas = rawStorage.getServiceQuotas();
    const idx = quotas.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Kuota tidak ditemukan');

    if (quotas[idx].bookedCount >= quotas[idx].capacity) {
      throw new Error(`Kapasitas kuota untuk tanggal ${quotas[idx].date} telah penuh (${quotas[idx].capacity}/${quotas[idx].capacity}). Sistem menolak overbooking.`);
    }

    quotas[idx].bookedCount += 1;
    rawStorage.setServiceQuotas(quotas);
    return quotas[idx];
  },

  async decrementBooked(id: string): Promise<ServiceQuota> {
    const quotas = rawStorage.getServiceQuotas();
    const idx = quotas.findIndex((q) => q.id === id);
    if (idx !== -1 && quotas[idx].bookedCount > 0) {
      quotas[idx].bookedCount -= 1;
      rawStorage.setServiceQuotas(quotas);
      return quotas[idx];
    }
    return quotas[idx];
  },
};
