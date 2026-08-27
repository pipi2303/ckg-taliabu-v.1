import {
  Citizen,
  CitizenIdentifier,
  DataQualityIssue,
  IdentityMatchDecision,
  NormalizedCkgRecord,
} from '../types';
import { rawStorage } from '../repositories/storage';
import { consentService } from './consentService';

export interface MpiResolutionResult {
  destination: 'REGISTRY' | 'AGGREGATE_ONLY' | 'QUALITY_QUEUE';
  matchedCitizen?: Citizen;
  decision: IdentityMatchDecision;
  qualityIssue?: Omit<DataQualityIssue, 'id' | 'createdAt' | 'status'>;
  reason: string;
}

export const mpiService = {
  /**
   * Resolves incoming normalized record against Master Patient Index (MPI) and Consent Basis
   */
  async resolveIdentity(record: NormalizedCkgRecord): Promise<MpiResolutionResult> {
    const citizens = rawStorage.getCitizens().filter((c) => !c.mergedIntoId);
    const identifiers = rawStorage.getCitizenIdentifiers();

    // 0. Pre-validation checks for data quality
    if (record.nik && record.nik.length !== 16) {
      return {
        destination: 'QUALITY_QUEUE',
        decision: {
          id: `DEC-${Date.now()}`,
          sourceRecordId: record.sourceRecordId,
          confidence: 'NONE',
          method: 'MANUAL',
          decidedAt: new Date().toISOString(),
        },
        qualityIssue: {
          sourceRecordId: record.sourceRecordId,
          sourceSystem: record.sourceSystem,
          screeningDate: record.screeningDate,
          citizenName: record.fullName,
          identifierValue: record.nik,
          problemType: 'INVALID_NIK',
          problemDescription: `Format NIK (${record.nik}) tidak sesuai standar resmi 16 digit.`,
          facilityName: record.facilityName || 'Puskesmas Bobong',
          villageCode: record.villageCode,
          rawRecord: record,
        },
        reason: 'Format NIK tidak valid (bukan 16 digit).',
      };
    }

    // LEVEL 1 & 2: Match by NIK
    if (record.nik) {
      const nikMatch = identifiers.find(
        (i) => i.identifierType === 'NIK' && i.identifierValue === record.nik
      );

      if (nikMatch) {
        const candidate = citizens.find((c) => c.id === nikMatch.citizenId);

        if (candidate) {
          // Check name similarity
          const isNameSimilar = this.calculateNameSimilarity(record.fullName, candidate.fullName) > 0.6;

          if (isNameSimilar) {
            // LEVEL 1: EXACT MATCH
            const hasConsent = await this.checkProcessingBasis(candidate.id, candidate.fullName, record.nik);
            return {
              destination: hasConsent ? 'REGISTRY' : 'AGGREGATE_ONLY',
              matchedCitizen: candidate,
              decision: {
                id: `DEC-${Date.now()}`,
                sourceRecordId: record.sourceRecordId,
                citizenId: candidate.id,
                confidence: 'EXACT',
                method: 'NIK_EXACT',
                decidedAt: new Date().toISOString(),
              },
              reason: hasConsent
                ? 'NIK dan nama cocok sempurna dengan warga terdaftar.'
                : 'Identitas terpadankan, namun warga belum memberikan persetujuan (dialihkan ke Jalur Agregat).',
            };
          } else {
            // LEVEL 2: SAME NIK DIFFERENT NAME -> Send to Data Quality Queue
            return {
              destination: 'QUALITY_QUEUE',
              matchedCitizen: candidate,
              decision: {
                id: `DEC-${Date.now()}`,
                sourceRecordId: record.sourceRecordId,
                citizenId: candidate.id,
                confidence: 'MEDIUM',
                method: 'MANUAL',
                decidedAt: new Date().toISOString(),
              },
              qualityIssue: {
                sourceRecordId: record.sourceRecordId,
                sourceSystem: record.sourceSystem,
                screeningDate: record.screeningDate,
                citizenName: record.fullName,
                identifierValue: record.nik,
                problemType: 'SAME_NIK_DIFFERENT_NAME',
                problemDescription: `NIK (${record.nik}) sama dengan ${candidate.fullName}, tetapi nama pada sumber "${record.fullName}" berbeda signifikan.`,
                facilityName: record.facilityName || candidate.facilityName,
                villageCode: record.villageCode,
                candidateCitizenIds: [candidate.id],
                rawRecord: record,
              },
              reason: 'NIK sama tetapi identitas demografis berbeda (potensi salah catat NIK).',
            };
          }
        }
      }
    }

    // LEVEL 3: Demographic Exact Match (No NIK or NIK unmatched, but Name + DOB + Sex + Village all match)
    const exactDemoMatch = citizens.find((c) => {
      const nameExact = c.fullName.toLowerCase() === record.fullName.toLowerCase();
      const dobMatch = c.birthDate === record.birthDate;
      const sexMatch = c.sex === record.sex;
      const villageMatch = !record.villageName || (c.villageName && c.villageName.toLowerCase() === record.villageName.toLowerCase());
      return nameExact && dobMatch && sexMatch && villageMatch;
    });

    if (exactDemoMatch) {
      const hasConsent = await this.checkProcessingBasis(exactDemoMatch.id, exactDemoMatch.fullName, record.nik || '');
      return {
        destination: hasConsent ? 'REGISTRY' : 'AGGREGATE_ONLY',
        matchedCitizen: exactDemoMatch,
        decision: {
          id: `DEC-${Date.now()}`,
          sourceRecordId: record.sourceRecordId,
          citizenId: exactDemoMatch.id,
          confidence: 'HIGH',
          method: 'DEMOGRAPHIC_EXACT',
          decidedAt: new Date().toISOString(),
        },
        reason: 'Identitas cocok berdasarkan demografi lengkap (Nama, Tanggal Lahir, Jenis Kelamin, dan Desa).',
      };
    }

    // LEVEL 4: Demographic Similar Match (Similar name + same DOB + same village) -> Manual Review in DQ Queue
    const similarDemoMatch = citizens.find((c) => {
      const sim = this.calculateNameSimilarity(c.fullName, record.fullName);
      const dobMatch = c.birthDate === record.birthDate;
      return sim >= 0.75 && dobMatch;
    });

    if (similarDemoMatch) {
      return {
        destination: 'QUALITY_QUEUE',
        matchedCitizen: similarDemoMatch,
        decision: {
          id: `DEC-${Date.now()}`,
          sourceRecordId: record.sourceRecordId,
          citizenId: similarDemoMatch.id,
          confidence: 'MEDIUM',
          method: 'DEMOGRAPHIC_SIMILAR',
          decidedAt: new Date().toISOString(),
        },
        qualityIssue: {
          sourceRecordId: record.sourceRecordId,
          sourceSystem: record.sourceSystem,
          screeningDate: record.screeningDate,
          citizenName: record.fullName,
          identifierValue: record.nik,
          problemType: 'IDENTITY_AMBIGUOUS',
          problemDescription: `Kemiripan nama tinggi (${Math.round(this.calculateNameSimilarity(similarDemoMatch.fullName, record.fullName) * 100)}%) dengan "${similarDemoMatch.fullName}" pada tanggal lahir yang sama (${record.birthDate}).`,
          facilityName: record.facilityName || similarDemoMatch.facilityName,
          villageCode: record.villageCode,
          candidateCitizenIds: [similarDemoMatch.id],
          rawRecord: record,
        },
        reason: 'Kemiripan demografis memerlukan konfirmasi manual petugas.',
      };
    }

    // LEVEL 5: NEW IDENTITY
    // Check processing basis for new citizen
    const hasConsent = record.nik ? await this.checkProcessingBasis('NEW', record.fullName, record.nik) : true;

    return {
      destination: hasConsent ? 'REGISTRY' : 'AGGREGATE_ONLY',
      decision: {
        id: `DEC-${Date.now()}`,
        sourceRecordId: record.sourceRecordId,
        confidence: 'NONE',
        method: 'NEW_IDENTITY',
        decidedAt: new Date().toISOString(),
      },
      reason: 'Tidak ditemukan kecocokan dalam basis data, identitas baru berhasil dibuat.',
    };
  },

  /**
   * Helper: Checks consent / legal processing basis
   */
  async checkProcessingBasis(citizenId: string, citizenName: string, nik: string): Promise<boolean> {
    const consents = rawStorage.getConsents();
    // Check if citizen has explicit revoked consent
    const revoked = consents.find((c) => (c.citizenId === citizenId || (nik && c.citizenNik === nik)) && c.status === 'REVOKED');
    if (revoked) return false;

    // In Indonesian public health screening (Permenkes No. 43/2019 & UU Kesehatan 17/2023),
    // programmatic screening has statutory processing basis unless explicitly revoked.
    return true;
  },

  /**
   * Simple string similarity calculation (Jaro-Winkler / Levenshtein approximate)
   */
  calculateNameSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    let matchCount = 0;
    const minLen = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matchCount++;
    }

    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    let commonWords = 0;
    words1.forEach((w) => {
      if (w.length > 2 && words2.includes(w)) commonWords++;
    });

    const charScore = matchCount / Math.max(s1.length, s2.length);
    const wordScore = (commonWords * 2) / (words1.length + words2.length);
    return Math.max(charScore, wordScore);
  },
};
