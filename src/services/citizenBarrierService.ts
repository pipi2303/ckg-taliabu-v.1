import { citizenBarrierRepo } from '../repositories/citizenBarrierRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { auditRepo } from '../repositories/auditRepo';
import { SharedBarrierReason, CitizenBarrierReport } from '../types';

export const citizenBarrierService = {
  /**
   * Reports a follow-up barrier without terminating the CareTask
   */
  async reportBarrier(params: {
    citizenId: string;
    taskId?: string;
    appointmentId?: string;
    barriers: SharedBarrierReason[];
    notes?: string;
  }): Promise<{ success: boolean; report?: CitizenBarrierReport; message: string }> {
    const citizen = await citizenRepo.getById(params.citizenId);
    if (!citizen) return { success: false, message: 'Warga tidak ditemukan.' };

    const report: CitizenBarrierReport = {
      id: `BAR-${Date.now()}`,
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      facilityId: citizen.facilityId,
      facilityName: citizen.facilityName,
      taskId: params.taskId,
      appointmentId: params.appointmentId,
      barriers: params.barriers,
      notes: params.notes,
      reportedAt: new Date().toISOString(),
      status: 'RECEIVED_BY_PUSKESMAS',
    };

    await citizenBarrierRepo.create(report);

    // If associated with a task, keep task open but update timestamp & notes
    if (params.taskId) {
      const task = await careTaskRepo.getById(params.taskId);
      if (task) {
        task.updatedAt = new Date().toISOString();
      }
    }

    await auditRepo.log({
      action: 'UPDATE',
      entityType: 'CARE_TASK',
      entityId: params.taskId || citizen.id,
      details: {
        type: 'CITIZEN_BARRIER_REPORTED',
        barriers: params.barriers,
      },
      userId: citizen.id,
      userName: citizen.fullName,
    });

    return {
      success: true,
      report,
      message: 'Kendala Anda sudah diterima oleh Puskesmas. Petugas akan membantu mencari solusi terbaik bersama Anda.',
    };
  },

  /**
   * Fetches barrier reports for a citizen
   */
  async getCitizenBarriers(citizenId: string): Promise<CitizenBarrierReport[]> {
    return citizenBarrierRepo.getByCitizenId(citizenId);
  },
};
