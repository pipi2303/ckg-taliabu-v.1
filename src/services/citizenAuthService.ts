import { citizenRepo } from '../repositories/citizenRepo';
import { screeningRepo } from '../repositories/screeningRepo';
import { consentRepo } from '../repositories/consentRepo';
import { auditRepo } from '../repositories/auditRepo';
import { citizenSessionRepo, CitizenSession } from '../repositories/citizenSessionRepo';
import { Citizen } from '../types';

export interface CitizenAuthResult {
  success: boolean;
  citizen?: Citizen;
  session?: CitizenSession;
  requiresConsent?: boolean;
  consentVersion?: string;
  hasCkgData?: boolean;
  isUnderAge?: boolean;
  isDeceased?: boolean;
  isMismatch?: boolean;
  message: string;
}

export const citizenAuthService = {
  /**
   * Authenticate phone number against Registry and return citizen session
   */
  async loginWithVerifiedPhone(phone: string): Promise<CitizenAuthResult> {
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    const citizens = await citizenRepo.getAll();

    // Match phone
    const matched = citizens.find(
      (c) => c.phonePrimary && c.phonePrimary.replace(/[-\s]/g, '') === cleanPhone
    );

    if (!matched) {
      return {
        success: false,
        isMismatch: true,
        message: 'Nomor ini belum sesuai dengan data CKG Anda. Silakan hubungi Puskesmas terdekat.',
      };
    }

    // Deceased guard
    if (matched.vitalStatus === 'DECEASED') {
      return {
        success: false,
        isDeceased: true,
        message: 'Status data kependudukan tercatat tidak aktif. Silakan verifikasi melalui Puskesmas.',
      };
    }

    // Underage guard (18 years)
    const birthYear = new Date(matched.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age < 18) {
      return {
        success: false,
        isUnderAge: true,
        message: 'Akses pendampingan mandiri memerlukan pendampingan orang tua atau wali terverifikasi.',
      };
    }

    // Check CKG data availability
    const sessions = await screeningRepo.getSessionsByCitizenId(matched.id);
    const hasCkgData = sessions.length > 0;

    // Check consent
    const activeConsent = await consentRepo.getByCitizenId(matched.id);

    // Create session (24 hour session for low-cognitive friction)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const token = `CTZ-TOK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const session: CitizenSession = {
      citizenId: matched.id,
      phone: cleanPhone,
      token,
      loginAt: now.toISOString(),
      expiresAt,
    };

    await citizenSessionRepo.setSession(session);

    // Audit log
    await auditRepo.log({
      action: 'LOGIN',
      entityType: 'CITIZEN',
      entityId: matched.id,
      targetLabel: matched.fullName,
      description: `Warga masuk ke Citizen Companion App via nomor telepon ${cleanPhone}`,
      userId: matched.id,
      userName: matched.fullName,
    });

    return {
      success: true,
      citizen: matched,
      session,
      requiresConsent: !activeConsent,
      consentVersion: activeConsent?.consentTextVersion || 'v1.0-2026',
      hasCkgData,
      message: 'Berhasil masuk ke aplikasi pendamping CKG.',
    };
  },

  /**
   * Fast check for active citizen session
   */
  async getCurrentCitizen(): Promise<Citizen | null> {
    const session = await citizenSessionRepo.getCurrentSession();
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await citizenSessionRepo.clearSession();
      return null;
    }

    const citizen = await citizenRepo.getById(session.citizenId);
    return citizen || null;
  },

  /**
   * Log out citizen
   */
  async logout(): Promise<void> {
    const session = await citizenSessionRepo.getCurrentSession();
    if (session) {
      await auditRepo.log({
        action: 'LOGOUT',
        entityType: 'CITIZEN',
        entityId: session.citizenId,
        targetLabel: 'Warga',
        description: 'Warga keluar dari Citizen Companion App',
        userId: session.citizenId,
        userName: 'Warga',
      });
    }
    await citizenSessionRepo.clearSession();
  },
};
