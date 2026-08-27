import { Appointment, AppointmentStatus, WaitlistEntry } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { serviceQuotaRepo } from './serviceQuotaRepo';
import { auditRepo } from './auditRepo';

export interface AppointmentFilterParams {
  search?: string;
  facilityId?: string;
  serviceType?: string;
  status?: 'ALL' | AppointmentStatus;
  date?: string;
  fromDate?: string;
  toDate?: string;
}

export const appointmentRepo = {
  async getAll(): Promise<Appointment[]> {
    await simulateNetworkDelay();
    return rawStorage.getAppointments();
  },

  async getById(id: string): Promise<Appointment | null> {
    await simulateNetworkDelay();
    const apts = rawStorage.getAppointments();
    return apts.find((a) => a.id === id) || null;
  },

  async getByCitizenId(citizenId: string): Promise<Appointment[]> {
    await simulateNetworkDelay();
    const apts = rawStorage.getAppointments();
    return apts
      .filter((a) => a.citizenId === citizenId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  },

  async query(params: AppointmentFilterParams = {}): Promise<Appointment[]> {
    await simulateNetworkDelay();
    let apts = rawStorage.getAppointments();

    if (params.search) {
      const q = params.search.toLowerCase();
      apts = apts.filter(
        (a) =>
          a.citizenName?.toLowerCase().includes(q) ||
          a.citizenNik?.includes(q) ||
          a.citizenPhone?.includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (params.facilityId) {
      apts = apts.filter((a) => a.facilityId === params.facilityId);
    }

    if (params.serviceType) {
      apts = apts.filter((a) => a.serviceType === params.serviceType);
    }

    if (params.status && params.status !== 'ALL') {
      apts = apts.filter((a) => a.status === params.status);
    }

    if (params.date) {
      apts = apts.filter((a) => a.scheduledDate === params.date);
    }

    if (params.fromDate) {
      apts = apts.filter((a) => a.scheduledDate >= params.fromDate!);
    }

    if (params.toDate) {
      apts = apts.filter((a) => a.scheduledDate <= params.toDate!);
    }

    return apts.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  },

  async create(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>,
    actor: { id: string; name: string }
  ): Promise<Appointment> {
    await simulateNetworkDelay();
    
    // Check Quota
    const quota = await serviceQuotaRepo.getByFacilityAndDate(
      appointment.facilityId,
      appointment.scheduledDate,
      appointment.serviceType
    );

    if (!quota) {
      throw new Error(
        `Tidak ditemukan kuota layanan untuk faskes pada tanggal ${appointment.scheduledDate}. Harap atur kuota terlebih dahulu.`
      );
    }

    if (quota.bookedCount >= quota.capacity) {
      throw new Error(
        `Slot jadwal pada tanggal ${appointment.scheduledDate} sudah penuh (${quota.capacity}/${quota.capacity}). Silakan pilih tanggal alternatif atau masukkan ke Daftar Tunggu.`
      );
    }

    // Increment booked count
    await serviceQuotaRepo.incrementBooked(quota.id);

    const apts = rawStorage.getAppointments();
    const id = `APT-${new Date().getFullYear()}-${String(apts.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newAppointment: Appointment = {
      ...appointment,
      id,
      status: 'CONFIRMED',
      createdAt: now,
      updatedAt: now,
    };

    apts.unshift(newAppointment);
    rawStorage.setAppointments(apts);

    // If associated with a CareTask, update task appointmentId and status
    if (appointment.taskId) {
      const tasks = rawStorage.getCareTasks();
      const taskIdx = tasks.findIndex((t) => t.id === appointment.taskId);
      if (taskIdx !== -1) {
        tasks[taskIdx].appointmentId = id;
        if (tasks[taskIdx].status === 'OPEN') {
          tasks[taskIdx].status = 'IN_PROGRESS';
        }
        tasks[taskIdx].updatedAt = now;
        rawStorage.setCareTasks(tasks);
      }
    }

    await auditRepo.log({
      action: 'CREATE_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        citizenId: appointment.citizenId,
        facilityId: appointment.facilityId,
        scheduledDate: appointment.scheduledDate,
        serviceType: appointment.serviceType,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return newAppointment;
  },

  async reschedule(
    id: string,
    newDate: string,
    newTime: string | undefined,
    reason: string,
    actor: { id: string; name: string }
  ): Promise<Appointment> {
    await simulateNetworkDelay();
    const apt = await this.getById(id);
    if (!apt) throw new Error('Janji temu tidak ditemukan.');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan penjadwalan ulang wajib diisi minimal 5 karakter.');
    }

    // Check new quota
    const newQuota = await serviceQuotaRepo.getByFacilityAndDate(apt.facilityId, newDate, apt.serviceType);
    if (!newQuota) {
      throw new Error(`Tidak tersedia kuota layanan pada tanggal ${newDate}.`);
    }
    if (newQuota.bookedCount >= newQuota.capacity) {
      throw new Error(`Slot jadwal pada tanggal baru (${newDate}) sudah penuh.`);
    }

    // Decrement old quota
    const oldQuota = await serviceQuotaRepo.getByFacilityAndDate(apt.facilityId, apt.scheduledDate, apt.serviceType);
    if (oldQuota) {
      await serviceQuotaRepo.decrementBooked(oldQuota.id);
    }

    // Increment new quota
    await serviceQuotaRepo.incrementBooked(newQuota.id);

    const apts = rawStorage.getAppointments();
    const idx = apts.findIndex((a) => a.id === id);
    const updated: Appointment = {
      ...apts[idx],
      scheduledDate: newDate,
      scheduledTime: newTime || apts[idx].scheduledTime,
      rescheduleReason: reason,
      updatedAt: new Date().toISOString(),
    };

    apts[idx] = updated;
    rawStorage.setAppointments(apts);

    await auditRepo.log({
      action: 'RESCHEDULE_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        oldDate: apt.scheduledDate,
        newDate,
        reason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  async cancel(
    id: string,
    reason: string,
    actor: { id: string; name: string }
  ): Promise<Appointment> {
    await simulateNetworkDelay();
    const apt = await this.getById(id);
    if (!apt) throw new Error('Janji temu tidak ditemukan.');
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan pembatalan janji temu wajib diisi.');
    }

    // Decrement quota to free slot
    const quota = await serviceQuotaRepo.getByFacilityAndDate(apt.facilityId, apt.scheduledDate, apt.serviceType);
    if (quota) {
      await serviceQuotaRepo.decrementBooked(quota.id);
    }

    const apts = rawStorage.getAppointments();
    const idx = apts.findIndex((a) => a.id === id);
    const updated: Appointment = {
      ...apts[idx],
      status: 'CANCELLED',
      cancelReason: reason,
      updatedAt: new Date().toISOString(),
    };

    apts[idx] = updated;
    rawStorage.setAppointments(apts);

    await auditRepo.log({
      action: 'CANCEL_APPOINTMENT',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        scheduledDate: apt.scheduledDate,
        cancelReason: reason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return updated;
  },

  // Priority Waitlist support
  async getWaitlist(facilityId?: string): Promise<WaitlistEntry[]> {
    await simulateNetworkDelay();
    let wl = rawStorage.getWaitlist();
    if (facilityId) {
      wl = wl.filter((w) => w.facilityId === facilityId);
    }
    // Sort by Critical -> Priority Score -> CreatedAt
    return wl.sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1;
      if (!a.isCritical && b.isCritical) return 1;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },

  async addToWaitlist(
    entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'status'>,
    actor: { id: string; name: string }
  ): Promise<WaitlistEntry> {
    await simulateNetworkDelay();
    const wl = rawStorage.getWaitlist();
    const id = `WAIT-${Date.now().toString(36).toUpperCase()}`;

    const newEntry: WaitlistEntry = {
      ...entry,
      id,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
    };

    wl.push(newEntry);
    rawStorage.setWaitlist(wl);

    await auditRepo.log({
      action: 'CREATE',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: {
        action: 'ADD_TO_WAITLIST',
        citizenName: entry.citizenName,
        requestedDate: entry.requestedDate,
        priorityScore: entry.priorityScore,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return newEntry;
  },
};
