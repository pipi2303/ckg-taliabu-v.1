import {
  SmallCellSuppressionPolicy,
  User,
  AuditEvent,
  DrilldownPurposeDefinition,
} from '../types';
import { populationCompletenessRepo } from '../repositories/populationCompletenessRepo';
import { APPROVED_DRILLDOWN_PURPOSES } from '../mock/initialPopulationData';
import { auditRepo } from '../repositories/auditRepo';

export interface SuppressionResult {
  suppressed: boolean;
  displayValue: string;
  rawValue?: number;
  reason?: string;
}

export const populationPrivacyService = {
  async getPolicy(): Promise<SmallCellSuppressionPolicy> {
    return populationCompletenessRepo.getSmallCellPolicy();
  },

  async applySmallCellSuppression(count: number, context: 'VILLAGE' | 'FACILITY' | 'COUNTY'): Promise<SuppressionResult> {
    const policy = await this.getPolicy();
    const threshold = policy.threshold || 5;

    // Apply suppression primarily to small cells at village level or small sub-groups
    if (context === 'VILLAGE' && count > 0 && count < threshold) {
      return {
        suppressed: true,
        displayValue: '< 5 (Disembunyikan)',
        reason: 'Angka disembunyikan untuk melindungi privasi warga di wilayah kepulauan berpenduduk sedikit (DS-OI-06).',
      };
    }

    return {
      suppressed: false,
      displayValue: count.toLocaleString('id-ID'),
      rawValue: count,
    };
  },

  getApprovedDrilldownPurposes(userRole: string): DrilldownPurposeDefinition[] {
    return APPROVED_DRILLDOWN_PURPOSES.filter((p) => p.allowedRoles.includes(userRole as any));
  },

  async authorizeAndAuditDrilldown(params: {
    user: User;
    purposeCode: string;
    filterCriteria: Record<string, any>;
    rowCount: number;
    targetContext: string;
  }): Promise<{ authorized: boolean; reason?: string }> {
    // 1. Role Boundary: Bupati (P-BUP) is STRICTLY FORBIDDEN from accessing individual data
    if (params.user.roleId === 'BUPATI') {
      await auditRepo.log({
        actorUserId: params.user.id,
        actorName: params.user.name,
        actorRole: params.user.roleId,
        action: 'ACCESS_DENIED',
        entityType: 'CITIZEN',
        entityId: 'ALL',
        targetLabel: 'Penelusuran Individual Ditolak (Bupati)',
        description: 'Akses drilldown individual ditolak sesuai batas kewenangan P-BUP (hanya ringkasan agregat).',
        details: { rejectionReason: 'BUPATI_S0_CEILING' },
      });
      return {
        authorized: false,
        reason: 'Peran Bupati (P-BUP) tidak memiliki izin melihat data identitas individual warga. Hanya ringkasan agregat yang disediakan.',
      };
    }

    // 2. Purpose validation
    const validPurposes = this.getApprovedDrilldownPurposes(params.user.roleId);
    const purpose = validPurposes.find((p) => p.code === params.purposeCode);
    if (!purpose) {
      await auditRepo.log({
        actorUserId: params.user.id,
        actorName: params.user.name,
        actorRole: params.user.roleId,
        action: 'ACCESS_DENIED',
        entityType: 'CITIZEN',
        entityId: 'ALL',
        targetLabel: 'Penelusuran Tanpa Tujuan Sah',
        description: `Upaya penelusuran dengan purpose '${params.purposeCode}' tidak diizinkan untuk peran ${params.user.roleId}.`,
        details: { purposeCode: params.purposeCode, roleId: params.user.roleId },
      });
      return {
        authorized: false,
        reason: 'Tujuan penelusuran tidak sah atau tidak diizinkan untuk peran Anda.',
      };
    }

    // 3. Audit trail creation
    await auditRepo.log({
      actorUserId: params.user.id,
      actorName: params.user.name,
      actorRole: params.user.roleId,
      action: 'DRILLDOWN',
      entityType: 'CITIZEN',
      entityId: 'POPULATION_DRILLDOWN',
      targetLabel: `Penelusuran Agregat: ${params.targetContext}`,
      description: `Tujuan: ${purpose.label} | Baris: ${params.rowCount}`,
      details: {
        purposeCode: purpose.code,
        purposeLabel: purpose.label,
        rowCount: params.rowCount,
        filterCriteria: params.filterCriteria,
      },
    });

    return { authorized: true };
  },

  sanitizeForHeadOfRegion<T extends Record<string, any>>(data: T[]): Partial<T>[] {
    // Remove NIK, full names, phone numbers, individual addresses, and raw clinical values
    return data.map((item) => {
      const sanitized = { ...item };
      delete sanitized.nik;
      delete sanitized.nikPrimary;
      delete sanitized.fullName;
      delete sanitized.phone;
      delete sanitized.address;
      delete sanitized.systolicBp;
      delete sanitized.diastolicBp;
      delete sanitized.bloodGlucose;
      return sanitized;
    });
  },
};
