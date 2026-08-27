import { citizenHelpRequestRepo } from '../repositories/citizenHelpRequestRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { auditRepo } from '../repositories/auditRepo';
import { CitizenHelpRequest } from '../types';
import { SAFETY_MESSAGES } from './citizenCopyDictionary';

const EMERGENCY_KEYWORDS = [
  'sesak',
  'nyeri dada',
  'jantung',
  'pingsan',
  'tidak sadar',
  'kejang',
  'lumpuh',
  'stroke',
  'muntah darah',
  'pendarahan',
  'darurat',
];

export const citizenHelpService = {
  /**
   * Deterministic keyword screening for urgent symptoms (NO LLM TRIAGE)
   */
  screenForEmergency(text?: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  },

  /**
   * Submits an operational help request
   */
  async submitHelpRequest(params: {
    citizenId: string;
    preferredChannel: 'PHONE' | 'MESSAGE' | 'KADER';
    category: CitizenHelpRequest['category'];
    citizenMessage?: string;
  }): Promise<{
    success: boolean;
    helpRequest?: CitizenHelpRequest;
    isEmergencyWarning: boolean;
    message: string;
    warningText?: string;
  }> {
    const citizen = await citizenRepo.getById(params.citizenId);
    if (!citizen) return { success: false, isEmergencyWarning: false, message: 'Warga tidak ditemukan.' };

    const isEmergency = this.screenForEmergency(params.citizenMessage);

    const helpRequest: CitizenHelpRequest = {
      id: `HELP-${Date.now()}`,
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      citizenPhone: citizen.phonePrimary || '-',
      facilityId: citizen.facilityId,
      facilityName: citizen.facilityName || 'Puskesmas Bobong',
      preferredChannel: params.preferredChannel,
      category: params.category,
      citizenMessage: params.citizenMessage,
      urgencyScreened: true,
      isEmergencyWarningShown: isEmergency,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    };

    await citizenHelpRequestRepo.create(helpRequest);

    await auditRepo.log({
      action: 'CREATE',
      entityType: 'CARE_TASK',
      entityId: helpRequest.id,
      details: {
        type: 'CITIZEN_HELP_REQUEST',
        channel: params.preferredChannel,
        category: params.category,
      },
      userId: citizen.id,
      userName: citizen.fullName,
    });

    return {
      success: true,
      helpRequest,
      isEmergencyWarning: isEmergency,
      message:
        'Permintaan bantuan Anda telah dikirim ke petugas Puskesmas. Petugas akan menghubungi sesuai jalur yang Anda pilih.',
      warningText: isEmergency ? SAFETY_MESSAGES.EMERGENCY_BODY : undefined,
    };
  },

  /**
   * Fetches help requests for a citizen
   */
  async getCitizenHelpRequests(citizenId: string): Promise<CitizenHelpRequest[]> {
    return citizenHelpRequestRepo.getByCitizenId(citizenId);
  },

  /**
   * For Puskesmas staff: acknowledge or resolve help request
   */
  async resolveHelpRequest(
    id: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED',
    actor: { id: string; name: string },
    notes?: string
  ): Promise<CitizenHelpRequest | null> {
    return citizenHelpRequestRepo.updateStatus(id, status, actor.name, notes);
  },
};
