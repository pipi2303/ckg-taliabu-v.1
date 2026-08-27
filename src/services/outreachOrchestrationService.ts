import { ContactAttempt, ContactOutcome, DeclineDelayReason, OutreachChannel } from '../types';
import { rawStorage } from '../repositories/storage';
import { contactAttemptRepo } from '../repositories/contactAttemptRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { auditRepo } from '../repositories/auditRepo';

export interface SimulatedMessagePayload {
  recipientName: string;
  recipientPhone: string;
  facilityName: string;
  channel: OutreachChannel;
  templateCode: string;
  messageText: string;
  actionUrl: string;
  isAutomated: boolean;
  stepNumber: number;
}

export const outreachOrchestrationService = {
  /**
   * Generates next simulated message payload for a CareTask.
   * Strictly enforces:
   * - Max 2 automated messages.
   * - Critical findings bypass gradual automated ladder to Immediate Human Action.
   * - No valid phone number bypasses digital ladder to FIELD_VISIT.
   * - No clinical measurements, diagnosis, or risk colors in message payload.
   */
  async prepareNextOutreach(taskId: string): Promise<{
    canAutomate: boolean;
    reason?: string;
    payload?: SimulatedMessagePayload;
    suggestedChannel: OutreachChannel;
  }> {
    const task = await careTaskRepo.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    const citizen = rawStorage.getCitizens().find((c) => c.id === task.citizenId);
    const existingAttempts = await contactAttemptRepo.getByTaskId(taskId);
    const automatedCount = existingAttempts.filter((a) => a.channel === 'WHATSAPP' || a.channel === 'SMS').length;

    // Hard Rule 41: Critical finding must NOT go through ordinary gradual reminder ladder.
    if (task.isCritical) {
      return {
        canAutomate: false,
        reason: 'Temuan Kritis: Memerlukan tindakan dan kontak manusia langsung (Telepon / Rujukan Segera). Ladder bertahap dilewati.',
        suggestedChannel: 'PHONE',
      };
    }

    // Hard Rule 40: If citizen has no valid phone number, skip automated message ladder.
    if (!task.citizenPhone && !citizen?.phonePrimary) {
      return {
        canAutomate: false,
        reason: 'Nomor kontak tidak tersedia. Sistem mengarahkan otomatis ke Kunjungan Lapangan Kader.',
        suggestedChannel: 'KADER_VISIT',
      };
    }

    // Hard Rule 39: No more than TWO automated messages before moving to human outreach.
    if (automatedCount >= 2) {
      return {
        canAutomate: false,
        reason: 'Batas maksimal 2 pesan otomatis telah tercapai. Intervensi dialihkan ke Kontak Petugas / Telepon.',
        suggestedChannel: 'PHONE',
      };
    }

    const stepNumber = automatedCount + 1;
    const phone = task.citizenPhone || citizen?.phonePrimary || '';
    const facilityName = task.facilityName || 'Puskesmas Bobong';
    const actionUrl = `https://taliabu.smartcare.id/c/${task.id.toLowerCase()}`;

    // S2 Privacy Safe message text
    let messageText = '';
    if (stepNumber === 1) {
      messageText = `Halo ${task.citizenName}, Puskesmas ${facilityName} mengundang Anda untuk melakukan tindak lanjut skrining kesehatan. Mohon konfirmasi kesediaan atau pilih jadwal kunjungan Anda melalui tautan berikut: ${actionUrl}.`;
    } else {
      messageText = `Halo ${task.citizenName}, kami dari Puskesmas ${facilityName} ingin mengingatkan kembali terkait konsultasi tindak lanjut Anda. Hubungi kami atau konfirmasi melalui: ${actionUrl}.`;
    }

    return {
      canAutomate: true,
      suggestedChannel: 'WHATSAPP',
      payload: {
        recipientName: task.citizenName || 'Warga',
        recipientPhone: phone,
        facilityName,
        channel: 'WHATSAPP',
        templateCode: stepNumber === 1 ? 'TMPL_INVITE_FOLLOWUP_01' : 'TMPL_REMINDER_FOLLOWUP_02',
        messageText,
        actionUrl,
        isAutomated: true,
        stepNumber,
      },
    };
  },

  /**
   * Executes simulated sending of digital outreach (WhatsApp / SMS).
   */
  async sendSimulatedMessage(
    taskId: string,
    payload: SimulatedMessagePayload,
    actor?: { id: string; name: string }
  ): Promise<ContactAttempt> {
    const task = await careTaskRepo.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    const attempt = await contactAttemptRepo.create(
      {
        taskId,
        citizenId: task.citizenId,
        citizenName: task.citizenName,
        channel: payload.channel,
        ladderStep: payload.stepNumber,
        outcome: 'NO_ANSWER', // Initial state upon delivery until response
        deliveryFailed: false,
        deliveryStatus: 'DELIVERED',
        messageContent: payload.messageText,
        notes: `Simulasi pesan ${payload.channel} terkirim ke ${payload.recipientPhone}`,
      },
      actor
    );

    // Update task status to IN_PROGRESS
    if (task.status === 'OPEN') {
      await careTaskRepo.update(taskId, { status: 'IN_PROGRESS' });
    }

    return attempt;
  },

  /**
   * Records a manual phone contact result from staff or doctor.
   */
  async recordPhoneOutcome(
    taskId: string,
    outcome: ContactOutcome,
    declineReason?: DeclineDelayReason,
    notes?: string,
    actor?: { id: string; name: string }
  ): Promise<ContactAttempt> {
    const task = await careTaskRepo.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    const existingAttempts = await contactAttemptRepo.getByTaskId(taskId);
    const stepNumber = existingAttempts.length + 1;

    const attempt = await contactAttemptRepo.create(
      {
        taskId,
        citizenId: task.citizenId,
        citizenName: task.citizenName,
        channel: 'PHONE',
        ladderStep: stepNumber,
        outcome,
        declineReason,
        deliveryFailed: false,
        deliveryStatus: 'DELIVERED',
        notes: notes || `Hasil kontak telepon: ${outcome}`,
      },
      actor
    );

    return attempt;
  },

  /**
   * Simulates Citizen response via confirmation link or SMS reply.
   */
  async handleCitizenResponse(
    taskId: string,
    responseType: 'AGREE' | 'DECLINE' | 'POSTPONE' | 'OPT_OUT' | 'FREE_TEXT',
    reason?: DeclineDelayReason,
    freeText?: string
  ): Promise<ContactAttempt> {
    const task = await careTaskRepo.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    let outcome: ContactOutcome = 'CONNECTED_AGREED';
    let notes = '';
    let flaggedForReview = false;

    if (responseType === 'AGREE') {
      outcome = 'CONNECTED_AGREED';
      notes = 'Warga merespon melalui tautan: Menyatakan Bersedia hadir.';
    } else if (responseType === 'DECLINE') {
      outcome = 'CONNECTED_DECLINED';
      notes = `Warga merespon melalui tautan: Menolak (${reason || 'OTHER'}).`;
    } else if (responseType === 'POSTPONE') {
      outcome = 'CONNECTED_POSTPONED';
      notes = `Warga merespon melalui tautan: Memohon penundaan/jadwal ulang (${reason || 'OTHER'}).`;
    } else if (responseType === 'OPT_OUT') {
      outcome = 'CONNECTED_DECLINED';
      notes = 'Warga memilih opsi Berhenti Pesan Digital (Opt-out digital messages). Kaskade care tetap aktif pada jalur tatap muka.';
    } else if (responseType === 'FREE_TEXT') {
      outcome = 'CONNECTED_POSTPONED';
      flaggedForReview = true;
      notes = `Pesan teks bebas masuk: "${freeText}". Ditandai: Perlu Dibaca Petugas.`;
    }

    const attempt = await contactAttemptRepo.create({
      taskId,
      citizenId: task.citizenId,
      citizenName: task.citizenName,
      channel: 'WHATSAPP',
      ladderStep: (task.contactAttemptsCount || 0) + 1,
      outcome,
      declineReason: reason,
      deliveryFailed: false,
      freeTextResponse: freeText,
      flaggedForReview,
      notes,
    });

    return attempt;
  },
};
