import { ConsentChannel, ConsentRecord, ConsentScope, ConsentStatus, User } from '../types';
import { consentRepo } from '../repositories/consentRepo';
import { auditRepo } from '../repositories/auditRepo';

export const consentService = {
  async getConsents(options?: { status?: ConsentStatus | 'ALL'; channel?: string; search?: string }): Promise<ConsentRecord[]> {
    return consentRepo.getConsents(options);
  },

  async createConsent(
    actor: User,
    data: {
      citizenId: string;
      citizenName: string;
      citizenNik: string;
      consentTextVersion: string;
      channel: ConsentChannel;
      scope: ConsentScope;
      notes?: string;
    },
  ): Promise<ConsentRecord> {
    const newConsent = await consentRepo.createConsent({
      ...data,
      assistedByUserId: actor.id,
      assistedByUserName: actor.name,
      status: 'ACTIVE',
    });

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'CONSENT_RECORD',
      entityId: newConsent.id,
      citizenId: newConsent.citizenId,
      targetLabel: `Persetujuan CKG: ${newConsent.citizenName} (${newConsent.scope})`,
      facilityId: actor.facilityId,
      facilityName: actor.facilityName,
      purposeCode: 'CONSENT_CAPTURE',
      details: { channel: newConsent.channel, version: newConsent.consentTextVersion },
    });

    return newConsent;
  },

  async revokeConsent(actor: User, id: string, reason: string): Promise<ConsentRecord> {
    const revoked = await consentRepo.revokeConsent(id, reason);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'REVOKE',
      entityType: 'CONSENT_RECORD',
      entityId: revoked.id,
      citizenId: revoked.citizenId,
      targetLabel: `Pencabutan Persetujuan: ${revoked.citizenName}`,
      facilityId: actor.facilityId,
      facilityName: actor.facilityName,
      purposeCode: 'CONSENT_REVOCATION',
      details: { reason, revokedAt: revoked.revokedAt },
    });

    return revoked;
  },
};
