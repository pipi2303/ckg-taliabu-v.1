import { citizenResponseRepo } from '../repositories/citizenResponseRepo';
import { appointmentRepo } from '../repositories/appointmentRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { citizenBarrierRepo } from '../repositories/citizenBarrierRepo';
import { auditRepo } from '../repositories/auditRepo';
import { SharedBarrierReason, CitizenResponseToken } from '../types';

export type AttendanceResponseChoice = 'ATTENDING' | 'RESCHEDULE_NEEDED' | 'CANNOT_ATTEND';

export const citizenResponseService = {
  /**
   * Generates a single-purpose secure response token for reminder messages (SMS / WhatsApp link)
   */
  async generateToken(params: {
    citizenId: string;
    taskId?: string;
    appointmentId?: string;
    purpose: CitizenResponseToken['purpose'];
  }): Promise<CitizenResponseToken> {
    const token: CitizenResponseToken = {
      id: `TKN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      citizenId: params.citizenId,
      taskId: params.taskId,
      appointmentId: params.appointmentId,
      purpose: params.purpose,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    await citizenResponseRepo.createToken(token);
    return token;
  },

  /**
   * Validates a token
   */
  async validateToken(tokenId: string): Promise<CitizenResponseToken | null> {
    const token = await citizenResponseRepo.getTokenById(tokenId);
    if (!token) return null;
    if (token.consumedAt) return null;
    if (new Date(token.expiresAt).getTime() < Date.now()) return null;
    return token;
  },

  /**
   * Responds to an attendance reminder (Unified entry point for both in-app and web-token channels)
   */
  async submitAttendanceResponse(params: {
    citizenId: string;
    appointmentId?: string;
    taskId?: string;
    tokenId?: string;
    responseChoice: AttendanceResponseChoice;
    barrierReason?: SharedBarrierReason;
    barrierNote?: string;
    channel: 'APP' | 'MESSAGE_LINK';
  }): Promise<{ success: boolean; message: string }> {
    // If token provided, consume it
    if (params.tokenId) {
      await citizenResponseRepo.consumeToken(params.tokenId);
    }

    if (params.appointmentId) {
      const apt = await appointmentRepo.getById(params.appointmentId);
      if (apt) {
        if (params.responseChoice === 'ATTENDING') {
          apt.status = 'CONFIRMED';
          await auditRepo.log({
            action: 'UPDATE',
            entityType: 'APPOINTMENT',
            entityId: apt.id,
            details: {
              response: 'ATTENDING',
              channel: params.channel,
            },
            userId: params.citizenId,
            userName: apt.citizenName,
          });
        }
      }
    }

    // If barrier reported
    if (params.responseChoice === 'CANNOT_ATTEND' && params.barrierReason) {
      await citizenBarrierRepo.create({
        id: `BAR-${Date.now()}`,
        citizenId: params.citizenId,
        taskId: params.taskId,
        appointmentId: params.appointmentId,
        barriers: [params.barrierReason],
        notes: `Tanggapan pengingat: ${params.barrierNote || '-'} (Channel: ${params.channel})`,
        reportedAt: new Date().toISOString(),
        status: 'RECEIVED_BY_PUSKESMAS',
      });
    }

    // If taskId exists, ensure task state is synchronized
    if (params.taskId) {
      const task = await careTaskRepo.getById(params.taskId);
      if (task) {
        task.updatedAt = new Date().toISOString();
      }
    }

    const messageMap: Record<AttendanceResponseChoice, string> = {
      ATTENDING: 'Terima kasih atas konfirmasinya. Jadwal kehadiran Anda telah kami catat.',
      RESCHEDULE_NEEDED: 'Permintaan ubah jadwal Anda telah kami terima. Silakan pilih jadwal pengganti.',
      CANNOT_ATTEND: 'Terima kasih telah memberitahu kami. Puskesmas akan mendampingi penyesuaian jadwal Anda.',
    };

    return {
      success: true,
      message: messageMap[params.responseChoice],
    };
  },
};
