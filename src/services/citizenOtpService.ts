import { citizenResponseRepo } from '../repositories/citizenResponseRepo';
import { CitizenOtpChallenge } from '../types';

export interface SendOtpResult {
  success: boolean;
  challengeId?: string;
  mockOtpCode?: string; // For simulation UI
  message: string;
  isRateLimited?: boolean;
}

export interface VerifyOtpResult {
  success: boolean;
  phone?: string;
  message: string;
}

export const citizenOtpService = {
  /**
   * Generates and registers an OTP challenge for phone login
   */
  async requestOtp(phone: string): Promise<SendOtpResult> {
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      return {
        success: false,
        message: 'Nomor telepon tidak valid. Masukkan nomor yang terdaftar di Puskesmas.',
      };
    }

    const challenges = await citizenResponseRepo.getOtpChallenges();
    const existingActive = challenges.find(
      (c) => c.phone === cleanPhone && c.status === 'PENDING' && new Date(c.expiresAt).getTime() > Date.now()
    );

    // Generate a 6-digit mock OTP
    const mockCode = '123456';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 mins

    const newChallenge: CitizenOtpChallenge = {
      id: `OTP-${Date.now()}`,
      phone: cleanPhone,
      code: mockCode,
      createdAt: now.toISOString(),
      expiresAt,
      attemptCount: 0,
      status: 'PENDING',
    };

    if (existingActive) {
      existingActive.code = mockCode;
      existingActive.expiresAt = expiresAt;
      await citizenResponseRepo.updateOtpChallenge(existingActive);
      return {
        success: true,
        challengeId: existingActive.id,
        mockOtpCode: mockCode,
        message: 'Kode OTP telah dikirim ulang (Simulasi: 123456)',
      };
    }

    await citizenResponseRepo.createOtpChallenge(newChallenge);

    return {
      success: true,
      challengeId: newChallenge.id,
      mockOtpCode: mockCode,
      message: 'Kode OTP 6 digit berhasil dibuat (Simulasi: 123456)',
    };
  },

  /**
   * Verifies the OTP challenge code
   */
  async verifyOtp(challengeId: string, enteredCode: string): Promise<VerifyOtpResult> {
    const challenges = await citizenResponseRepo.getOtpChallenges();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) {
      return {
        success: false,
        message: 'Permintaan OTP tidak ditemukan. Silakan minta kode baru.',
      };
    }

    if (challenge.status === 'BLOCKED' || challenge.attemptCount >= 5) {
      return {
        success: false,
        message: 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.',
      };
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      challenge.status = 'EXPIRED';
      await citizenResponseRepo.updateOtpChallenge(challenge);
      return {
        success: false,
        message: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.',
      };
    }

    if (challenge.code !== enteredCode.trim() && enteredCode.trim() !== '123456') {
      challenge.attemptCount += 1;
      if (challenge.attemptCount >= 5) challenge.status = 'BLOCKED';
      await citizenResponseRepo.updateOtpChallenge(challenge);
      return {
        success: false,
        message: `Kode OTP salah (Percobaan ${challenge.attemptCount}/5).`,
      };
    }

    challenge.status = 'VERIFIED';
    challenge.verifiedAt = new Date().toISOString();
    await citizenResponseRepo.updateOtpChallenge(challenge);

    return {
      success: true,
      phone: challenge.phone,
      message: 'Verifikasi nomor telepon berhasil.',
    };
  },
};
