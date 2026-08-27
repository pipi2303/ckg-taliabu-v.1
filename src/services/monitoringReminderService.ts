import { MonitoringCycle, Citizen } from '../types';
import { citizenResponseService } from './citizenResponseService';

export interface MonitoringReminderPayload {
  recipientName: string;
  recipientPhone: string;
  facilityName: string;
  plannedDateFormatted: string;
  messageText: string;
  channel: 'WHATSAPP' | 'SMS' | 'ASSISTED_KADER';
  responseTokenId?: string;
  responseUrl?: string;
}

export const monitoringReminderService = {
  /**
   * Generates a privacy-safe reminder message text.
   * Invariant: Never exposes diagnosis, clinical numbers, drug names, or risk categories.
   */
  buildReminderMessage(params: {
    citizen: Citizen;
    cycle: MonitoringCycle;
    includeMedicationCarryNotice?: boolean;
    tokenString?: string;
  }): MonitoringReminderPayload {
    const { citizen, cycle, includeMedicationCarryNotice = true, tokenString } = params;

    const baseNotice = `Halo Bapak/Ibu ${citizen.fullName}, jadwal kontrol kesehatan rutin Anda di ${cycle.facilityName} direncanakan pada tanggal ${cycle.plannedControlAt}.`;

    const prepNotice = includeMedicationCarryNotice
      ? '\n\nCatatan: Jika masih terdapat persediaan obat dari kunjungan sebelumnya, mohon dapat dibawa saat datang kontrol.'
      : '';

    const linkNotice = tokenString
      ? `\n\nKonfirmasi kehadiran Anda dengan mudah melalui tautan:\nhttps://ckg.taliabukab.go.id/c/${tokenString}`
      : '\n\nSilakan datang ke loket faskes dengan membawa kartu identitas.';

    const messageText = `${baseNotice}${prepNotice}${linkNotice}`;

    return {
      recipientName: citizen.fullName,
      recipientPhone: citizen.phonePrimary || '-',
      facilityName: cycle.facilityName,
      plannedDateFormatted: cycle.plannedControlAt,
      messageText,
      channel: 'WHATSAPP',
      responseTokenId: tokenString,
      responseUrl: tokenString ? `https://ckg.taliabukab.go.id/c/${tokenString}` : undefined,
    };
  },

  /**
   * Generates and dispatches a monitoring reminder token
   */
  async sendMonitoringReminder(
    citizen: Citizen,
    cycle: MonitoringCycle
  ): Promise<MonitoringReminderPayload> {
    // Generate citizen response token
    const token = await citizenResponseService.generateToken({
      citizenId: citizen.id,
      taskId: cycle.taskId,
      appointmentId: cycle.appointmentId,
      purpose: 'CONFIRM_ATTENDANCE',
    });

    const payload = this.buildReminderMessage({
      citizen,
      cycle,
      includeMedicationCarryNotice: true,
      tokenString: token.id,
    });

    return payload;
  },
};
