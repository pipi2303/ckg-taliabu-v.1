import { appointmentRepo } from '../repositories/appointmentRepo';
import { serviceQuotaRepo } from '../repositories/serviceQuotaRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { citizenBarrierRepo } from '../repositories/citizenBarrierRepo';
import { citizenProfileService } from './citizenProfileService';
import { SharedBarrierReason, Appointment, ServiceQuota } from '../types';

export interface AvailableSlotInfo {
  date: string;
  dayName: string;
  capacity: number;
  bookedCount: number;
  remainingSlots: number;
  isAvailable: boolean;
  timeSlots: string[];
}

export const citizenAppointmentService = {
  /**
   * Fetches real live available slots for a health facility and service
   */
  async getAvailableSlots(
    facilityId: string,
    serviceType = 'Pemeriksaan Konfirmasi CKG',
    fromDate?: string
  ): Promise<AvailableSlotInfo[]> {
    const quotas = await serviceQuotaRepo.getAvailableDates(facilityId, serviceType, fromDate);

    // If no quota found for specific service, get all quotas for facility
    let facilityQuotas = quotas;
    if (facilityQuotas.length === 0) {
      const allQuotas = await serviceQuotaRepo.getAll();
      const minDate = fromDate || new Date().toISOString().split('T')[0];
      facilityQuotas = allQuotas.filter((q) => q.facilityId === facilityId && q.date >= minDate && q.active);
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return facilityQuotas.map((q) => {
      const d = new Date(q.date);
      const dayName = isNaN(d.getTime()) ? '-' : dayNames[d.getDay()];
      const remaining = Math.max(0, q.capacity - q.bookedCount);
      return {
        date: q.date,
        dayName,
        capacity: q.capacity,
        bookedCount: q.bookedCount,
        remainingSlots: remaining,
        isAvailable: remaining > 0,
        timeSlots: ['08:30 - 10:00 WIT', '10:00 - 11:30 WIT', '11:30 - 13:00 WIT'],
      };
    });
  },

  /**
   * Books an appointment for the citizen enforcing ServiceQuota
   */
  async bookAppointment(params: {
    citizenId: string;
    taskId?: string;
    facilityId: string;
    scheduledDate: string;
    timeSlot: string;
    serviceType?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; message: string }> {
    try {
      const citizen = await citizenRepo.getById(params.citizenId);
      if (!citizen) {
        return { success: false, message: 'Data warga tidak ditemukan.' };
      }

      const task = params.taskId ? await careTaskRepo.getById(params.taskId) : null;

      const created = await appointmentRepo.create(
        {
          citizenId: citizen.id,
          citizenName: citizen.fullName,
          citizenNik: '8208************',
          citizenPhone: citizen.phonePrimary || '-',
          facilityId: params.facilityId,
          facilityName: citizen.facilityName || 'Puskesmas Bobong',
          serviceType: params.serviceType || 'Pemeriksaan Konfirmasi CKG',
          scheduledDate: params.scheduledDate,
          scheduledTime: params.timeSlot,
          source: 'CITIZEN',
          taskId: params.taskId,
          notes: 'Didaftarkan mandiri melalui Citizen Companion App',
        },
        { id: citizen.id, name: citizen.fullName }
      );

      // Refresh cache
      await citizenProfileService.getProfile(citizen.id);

      return {
        success: true,
        appointment: created,
        message: 'Jadwal kunjungan Anda berhasil dikonfirmasi.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal memilih jadwal. Silakan coba tanggal lain.',
      };
    }
  },

  /**
   * Reschedules an appointment with shared barrier reason preservation
   */
  async rescheduleAppointment(params: {
    appointmentId: string;
    citizenId: string;
    newDate: string;
    newTimeSlot: string;
    barrierReason: SharedBarrierReason;
    reasonDetail?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; message: string }> {
    try {
      const citizen = await citizenRepo.getById(params.citizenId);
      if (!citizen) return { success: false, message: 'Data warga tidak ditemukan.' };

      const existingApt = await appointmentRepo.getById(params.appointmentId);
      if (!existingApt) return { success: false, message: 'Janji temu tidak ditemukan.' };

      // Record barrier report for care orchestration signal
      await citizenBarrierRepo.create({
        id: `BAR-${Date.now()}`,
        citizenId: citizen.id,
        citizenName: citizen.fullName,
        facilityId: existingApt.facilityId,
        facilityName: existingApt.facilityName,
        taskId: existingApt.taskId,
        appointmentId: existingApt.id,
        barriers: [params.barrierReason],
        notes: `Ubah jadwal ke ${params.newDate}: ${params.reasonDetail || '-'}`,
        reportedAt: new Date().toISOString(),
        status: 'RECEIVED_BY_PUSKESMAS',
      });

      const updated = await appointmentRepo.reschedule(
        params.appointmentId,
        params.newDate,
        params.newTimeSlot,
        `Alasan: ${params.barrierReason}. ${params.reasonDetail || ''}`,
        { id: citizen.id, name: citizen.fullName }
      );

      // Refresh profile cache
      await citizenProfileService.getProfile(citizen.id);

      return {
        success: true,
        appointment: updated,
        message: 'Jadwal kunjungan berhasil diubah.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal mengubah jadwal.',
      };
    }
  },

  /**
   * Cancels an appointment safely, restores quota, records reason
   */
  async cancelAppointment(params: {
    appointmentId: string;
    citizenId: string;
    reason: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const citizen = await citizenRepo.getById(params.citizenId);
      if (!citizen) return { success: false, message: 'Data warga tidak ditemukan.' };

      await appointmentRepo.cancel(params.appointmentId, params.reason, {
        id: citizen.id,
        name: citizen.fullName,
      });

      // Refresh profile cache
      await citizenProfileService.getProfile(citizen.id);

      return {
        success: true,
        message: 'Jadwal kunjungan telah dibatalkan. Anda dapat memilih jadwal baru kapan saja.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal membatalkan jadwal.',
      };
    }
  },

  /**
   * Registers citizen to waitlist when slots are full
   */
  async registerToWaitlist(params: {
    citizenId: string;
    facilityId: string;
    preferredDate: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    const citizen = await citizenRepo.getById(params.citizenId);
    if (!citizen) return { success: false, message: 'Warga tidak ditemukan.' };

    await appointmentRepo.addToWaitlist(
      {
        citizenId: citizen.id,
        citizenName: citizen.fullName,
        facilityId: params.facilityId,
        serviceType: 'Pemeriksaan Konfirmasi CKG',
        priorityScore: 50,
        isCritical: false,
        requestedDate: params.preferredDate,
      },
      { id: citizen.id, name: citizen.fullName }
    );

    return {
      success: true,
      message: 'Permintaan Anda telah masuk ke Daftar Tunggu. Petugas Puskesmas akan menghubungi jika slot tersedia.',
    };
  },
};
