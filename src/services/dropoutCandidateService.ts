import { CascadeStatus, ContactAttempt, DropoutCandidate } from '../types';
import { rawStorage } from '../repositories/storage';
import { auditRepo } from '../repositories/auditRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';

export const dropoutCandidateService = {
  /**
   * Evaluates active citizens and identifies candidates for dropout review (rule-based).
   */
  async getCandidates(facilityId?: string): Promise<DropoutCandidate[]> {
    const candidates = rawStorage.getDropoutCandidates();
    if (facilityId) {
      return candidates.filter((c) => c.facilityId === facilityId);
    }
    return candidates;
  },

  /**
   * Sets human-confirmed terminal status (LTFU, REFUSED, MOVED, DECEASED).
   * Strictly enforces: At least ONE human contact attempt is required before LTFU can be selected!
   */
  async setTerminalStatus(
    candidateId: string,
    status: 'LOST_TO_FOLLOWUP' | 'REFUSED' | 'MOVED' | 'DECEASED',
    reason: string,
    actor: { id: string; name: string }
  ): Promise<DropoutCandidate> {
    if (!reason || reason.trim().length < 10) {
      throw new Error('Alasan penetapan status terminal wajib diisi minimal 10 karakter untuk audit klinis.');
    }

    const candidates = rawStorage.getDropoutCandidates();
    const idx = candidates.findIndex((c) => c.id === candidateId);
    if (idx === -1) throw new Error('Kandidat tidak ditemukan.');

    const candidate = candidates[idx];

    // Enforce Rule 91: At least ONE human contact attempt before LTFU
    if (status === 'LOST_TO_FOLLOWUP' && !candidate.hasHumanContactAttempt) {
      throw new Error(
        'Penetapan Putus Perawatan (LTFU) DITOLAK: Wajib terdapat minimal 1 (satu) kali upaya kontak manusia langsung (Telepon / Kunjungan Kader). Pesan otomatis saja tidak mencukupi.'
      );
    }

    candidate.cascadeStatus = status;
    rawStorage.setDropoutCandidates(candidates);

    // Cancel related active task if open
    if (candidate.currentTaskId) {
      try {
        await careTaskRepo.cancel(
          candidate.currentTaskId,
          `Status warga ditetapkan menjadi ${status} (${reason})`,
          actor
        );
      } catch (err) {
        console.error('Error cancelling task upon terminal status:', err);
      }
    }

    await auditRepo.log({
      action: 'SET_LTFU',
      entityType: 'CITIZEN',
      entityId: candidate.citizenId,
      details: {
        candidateId,
        newCascadeStatus: status,
        reason,
        hasHumanContactAttempt: candidate.hasHumanContactAttempt,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return candidate;
  },

  /**
   * Reversibility Rule 94: If citizen returns later, restore to active cascade.
   */
  async reactivateToCascade(
    candidateId: string,
    reason: string,
    actor: { id: string; name: string }
  ): Promise<DropoutCandidate> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan reaktivasi ke kaskade wajib diisi.');
    }

    const candidates = rawStorage.getDropoutCandidates();
    const idx = candidates.findIndex((c) => c.id === candidateId);
    if (idx === -1) throw new Error('Kandidat tidak ditemukan.');

    const candidate = candidates[idx];
    const previousStatus = candidate.cascadeStatus;
    candidate.cascadeStatus = 'QUEUED';
    rawStorage.setDropoutCandidates(candidates);

    await auditRepo.log({
      action: 'REVERSE_LTFU',
      entityType: 'CITIZEN',
      entityId: candidate.citizenId,
      details: {
        candidateId,
        previousStatus,
        newStatus: 'QUEUED',
        reason,
      },
      userId: actor.id,
      userName: actor.name,
    });

    return candidate;
  },
};
