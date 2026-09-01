import { RoleDefinition, RoleId, SensitivityLevel, User } from '../types';
import { INITIAL_ROLES, PERMISSION_MATRIX_DATA } from '../mock/initialData';

export const SENSITIVITY_ORDER: Record<SensitivityLevel, number> = {
  S0: 0,
  S1: 1,
  S2: 2,
  S3: 3,
  S4: 4,
};

export const SENSITIVITY_DESCRIPTIONS: Record<SensitivityLevel, { label: string; description: string; color: string }> = {
  S0: {
    label: 'S0 - Publik Internal',
    description: 'Data referensi wilayah, faskes, kode layanan, dan daftar peran standar.',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  S1: {
    label: 'S1 - Identitas Warga',
    description: 'NIK, Nama lengkap, Nomor HP, Alamat domisili, dan data demografis dasar.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  S2: {
    label: 'S2 - Data Operasional',
    description: 'Jadwal kunjungan rumah, status follow-up, penugasan kader, dan ringkasan tugas outreach.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  S3: {
    label: 'S3 - Data Klinis Rutin',
    description: 'Tekanan darah, gula darah sewaktu/puasa, IMT, lingkar perut, kategori risiko CKG (Merah/Kuning/Hijau).',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  S4: {
    label: 'S4 - Klinis Sangat Rahasia',
    description: 'Diagnosa spesifik dokter, hasil rujukan RSUD, obat-obatan, data kesehatan jiwa, dan riwayat infeksi menular.',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

/**
 * Explicit definition and registered navigation permissions for Direktur RSUD (DIR_RSUD).
 * Conforms to Executive-first, Aggregate-first, Exception-driven governance (§2 Gap Closure).
 */
export const DIR_RSUD_ROLE_ID: RoleId = 'DIR_RSUD';
export const DIR_RSUD_ROLE_NAME = 'Direktur RSUD';

export const DIR_RSUD_ROLE_DEFINITION: RoleDefinition = {
  id: 'DIR_RSUD',
  name: 'Direktur RSUD',
  category: 'RSUD',
  description: 'Executive-first, aggregate-first, exception-driven: memantau performa rujukan CKG ke RSUD, kesiapan layanan, mutu, dan integrasi secara agregat. Tidak memiliki kewenangan klinis (diagnosis, terapi, resep) dan tidak mengubah RiskClassification/CareTask/LTFU/outcome klinis milik Puskesmas.',
  dataCeiling: 'S3',
  canManageUsers: false,
  canManageFacilities: false,
  canManageRegions: false,
  canViewAudit: true,
  canManageRuleVersions: false,
  canAccessClinicalData: false,
  isPredefined: true,
};

export const DIR_RSUD_NAVIGATION_PERMISSIONS: readonly string[] = [
  'rsud-executive',
  'rsud-referral-network',
  'rsud-service-readiness',
  'rsud-quality-governance',
  'rsud-data-integration',
  'rsud-governance',
  'dinkes-ringkasan',
];

/**
 * Consolidated master list of all registered system roles including Direktur RSUD.
 */
export const ALL_REGISTERED_ROLES: RoleDefinition[] = [
  ...INITIAL_ROLES.filter((r) => r.id !== 'DIR_RSUD'),
  DIR_RSUD_ROLE_DEFINITION,
];

/**
 * Normalizes role ID strings to handle alias variations during role switching and routing.
 * e.g., 'Dir. RSUD', 'dir_rsud', 'rsud', 'Direktur RSUD' -> 'DIR_RSUD'.
 */
export function normalizeRoleId(roleId: string | RoleId): RoleId {
  if (!roleId) return 'ADMIN_DINKES';
  const clean = roleId.trim().toUpperCase().replace(/[\.\s\-]/g, '_');
  if (
    clean === 'DIR_RSUD' ||
    clean === 'DIR_RSUD_' ||
    clean === 'DIREKTUR_RSUD' ||
    clean === 'DIR_RUMAH_SAKIT' ||
    clean === 'RSUD' ||
    clean === 'DIRRSUD'
  ) {
    return 'DIR_RSUD';
  }
  if (clean === 'KEPALA_DINAS' || clean === 'KADIS' || clean === 'KADIS_DINKES') {
    return 'KEPALA_DINAS';
  }
  if (clean === 'ANALYST_DINKES' || clean === 'ANALIS' || clean === 'ANALIS_DINKES') {
    return 'ANALYST_DINKES';
  }
  if (clean === 'KEPALA_PUSKESMAS' || clean === 'KAPUS' || clean === 'KAPUS_BOBONG') {
    return 'KEPALA_PUSKESMAS';
  }
  if (clean === 'PJ_CKG' || clean === 'PJCKG') {
    return 'PJ_CKG';
  }
  if (clean === 'DOCTOR' || clean === 'DOKTER') {
    return 'DOCTOR';
  }
  if (clean === 'NURSE_MIDWIFE' || clean === 'BIDAN' || clean === 'PERAWAT') {
    return 'NURSE_MIDWIFE';
  }
  if (clean === 'PHARMACY_OFFICER' || clean === 'FARMASI') {
    return 'PHARMACY_OFFICER';
  }
  if (clean === 'KADER' || clean === 'KADER_POSYANDU') {
    return 'KADER';
  }
  if (clean === 'CITIZEN' || clean === 'WARGA') {
    return 'CITIZEN';
  }
  return roleId as RoleId;
}

export const permissionService = {
  getRoleDefinition(roleId: RoleId | string): RoleDefinition {
    const normalized = normalizeRoleId(roleId);
    if (normalized === 'DIR_RSUD') {
      return DIR_RSUD_ROLE_DEFINITION;
    }
    return ALL_REGISTERED_ROLES.find((r) => r.id === normalized) || ALL_REGISTERED_ROLES[0];
  },

  getAllRoles(): RoleDefinition[] {
    return ALL_REGISTERED_ROLES;
  },

  getPermissionMatrix() {
    return PERMISSION_MATRIX_DATA;
  },

  isRsudExecutive(roleId: RoleId | string): boolean {
    return normalizeRoleId(roleId) === 'DIR_RSUD';
  },

  // Check if role has access to specific sensitivity level
  hasSensitivityAccess(roleId: RoleId | string, requiredLevel: SensitivityLevel): boolean {
    const normalized = normalizeRoleId(roleId);
    const roleDef = this.getRoleDefinition(normalized);
    const roleCeilingRank = SENSITIVITY_ORDER[roleDef.dataCeiling];
    const requiredRank = SENSITIVITY_ORDER[requiredLevel];

    // HARD RULE: KADER CEILING IS S2. KADER CAN NEVER ACCESS S3 OR S4.
    if (normalized === 'KADER' && requiredRank > SENSITIVITY_ORDER.S2) {
      return false;
    }

    return roleCeilingRank >= requiredRank;
  },

  // Strip unauthorized sensitivity fields from payloads
  filterPayloadBySensitivity<T extends Record<string, any>>(data: T, roleId: RoleId, fieldSensitivityMap: Record<keyof T, SensitivityLevel>): Partial<T> {
    const filtered: Partial<T> = {};
    for (const key of Object.keys(data) as (keyof T)[]) {
      const requiredLevel = fieldSensitivityMap[key] || 'S0';
      if (this.hasSensitivityAccess(roleId, requiredLevel)) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  },

  // Check if actor can manage the target user
  canManageUser(actor: User, targetUser?: Partial<User>): { allowed: boolean; reason?: string } {
    if (actor.status !== 'ACTIVE') {
      return { allowed: false, reason: 'Akun Anda tidak aktif.' };
    }

    // Admin Dinkes has global user management
    if (actor.roleId === 'ADMIN_DINKES') {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Peran Anda tidak memiliki hak akses untuk mengelola akun pengguna.',
    };
  },

  canManageFacility(actor: User): boolean {
    return actor.status === 'ACTIVE' && actor.roleId === 'ADMIN_DINKES';
  },

  canManageRegions(actor: User): boolean {
    return actor.status === 'ACTIVE' && actor.roleId === 'ADMIN_DINKES';
  },

  canManageRuleVersions(actor: User): boolean {
    return actor.status === 'ACTIVE' && actor.roleId === 'ADMIN_DINKES';
  },

  canApproveRuleVersions(actor: User): boolean {
    return actor.status === 'ACTIVE' && (actor.roleId === 'ADMIN_DINKES' || actor.roleId === 'KEPALA_DINAS');
  },

  canViewAuditLogs(actor: User): boolean {
    if (actor.status !== 'ACTIVE') return false;
    const allowedRoles: RoleId[] = ['ADMIN_DINKES', 'KEPALA_DINAS', 'ANALYST_DINKES', 'DIR_RSUD'];
    return allowedRoles.includes(normalizeRoleId(actor.roleId));
  },

  // Check area scope containment
  isInScope(actor: User, scopeId: string): boolean {
    const normRole = normalizeRoleId(actor.roleId);
    if (normRole === 'ADMIN_DINKES' || normRole === 'KEPALA_DINAS' || normRole === 'ANALYST_DINKES' || normRole === 'DIR_RSUD') {
      return true; // Kabupaten wide (DIR_RSUD: jejaring rujukan lintas seluruh Puskesmas pengirim)
    }
    return actor.areaScopes.includes(scopeId) || actor.villageAssignment === scopeId;
  },

  // Role Navigation Access Map (Role-Based Menu Matrix)
  getAllowedNavIds(roleId: RoleId | string): string[] {
    const normalized = normalizeRoleId(roleId);
    switch (normalized) {
      case 'ADMIN_DINKES':
        // Scoped to platform administration only (master data, accounts/roles, rule
        // governance, system config) — matches this role's own description ("Akses penuh
        // administrasi sistem, master data, wilayah, faskes, akun pengguna, peran, dan tata
        // kelola platform"). Clinical/operational/analytical work belongs to the specialized
        // Dinkes/Puskesmas/clinical roles, not the system administrator account.
        return [
          'dashboard',
          'dinkes-ringkasan',
          'wilayah', 'faskes', 'layanan',
          'pengguna', 'peran', 'cakupan',
          'persetujuan', 'versi-aturan', 'audit-log',
          'sinkronisasi', 'integrasi', 'pengaturan',
          'ai-tata-kelola', 'ai-kinerja-model',
          'stratifikasi',
          'data-quality', 'duplicate-review', 'import-ckg', 'ingestion-monitor', 'import-history', 'source-mapping',
          'future-facility', 'future-ai',
        ];

      case 'KEPALA_DINAS':
        return [
          'dashboard',
          'dinkes-ringkasan', 'dinkes-impact-index', 'dinkes-kaskade', 'dinkes-wilayah', 'dinkes-gap', 'dinkes-kinerja-pkm', 'dinkes-penyebab-kendala', 'dinkes-intervensi-populasi', 'dinkes-perbandingan-periode', 'dinkes-laporan',
          'ai-scenario-lab',
          'stratifikasi',
          'wilayah', 'faskes',
        ];

      case 'ANALYST_DINKES':
        return [
          'dinkes-ringkasan', 'dinkes-impact-index', 'dinkes-kaskade', 'dinkes-wilayah', 'dinkes-gap', 'dinkes-kinerja-pkm', 'dinkes-penyebab-kendala', 'dinkes-intervensi-populasi', 'dinkes-perbandingan-periode', 'dinkes-laporan',
          'ai-tata-kelola', 'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-scenario-lab', 'ai-klaster-populasi', 'ai-kepatuhan-obat', 'ai-kinerja-model', 'ai-prioritas-pencegahan', 'ai-rute-maritim', 'future-ai',
          'kohort-kondisi', 'tren-outcome',
          'stratifikasi',
          'wilayah', 'faskes', 'future-facility', 'layanan',
        ];

      case 'KEPALA_PUSKESMAS':
        // Scoped to Puskesmas clinical leadership & operations (priorities, tasks, clinical follow-ups,
        // cadre field dispatching, scheduling, patient monitoring, cohort tracking, clinical AI, and facility readiness).
        // Irrelevant administrative items (master data faskes, catalog layanan, data cleansing, cadre mobile app, admin configs) are removed.
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'penugasan-lapangan', 'jadwal-kuota', 'kandidat-putus', 'beban-kerja',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-nudge-budaya', 'ai-rute-maritim',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'integritas-monitoring', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry',
          'stratifikasi',
          'future-facility',
        ];

      case 'PJ_CKG':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'penugasan-lapangan', 'jadwal-kuota', 'kandidat-putus', 'beban-kerja',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-nudge-budaya', 'ai-rute-maritim',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'integritas-monitoring', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry', 'duplicate-review', 'import-ckg', 'ingestion-monitor', 'import-history',
          'stratifikasi',
          'future-facility',
          'sinkronisasi',
        ];

      case 'DOCTOR':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'care-task', 'clinical-followup', 'jadwal-kuota', 'kandidat-putus',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-clinical-copilot', 'ai-nudge-budaya',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry',
          'stratifikasi',
          'sinkronisasi',
        ];

      case 'NURSE_MIDWIFE':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'jadwal-kuota', 'kandidat-putus',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-nudge-budaya', 'ai-rute-maritim',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'kepatuhan-kendala', 'risiko-putus',
          'registry',
          'stratifikasi',
          'sinkronisasi',
        ];

      case 'PHARMACY_OFFICER':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'care-task', 'clinical-followup', 'jadwal-kuota',
          'ai-kepatuhan-obat', 'ai-proyeksi-beban',
          'pemantauan-aktif', 'kontrol-harian',
          'future-facility',
          'sinkronisasi',
        ];

      case 'KADER':
        // 'prioritas-harian' (Plafon S4) and 'outreach' were removed: KaderAppShell is fully
        // self-contained and never references these nav ids internally, but a Kader can reach
        // the desktop Sidebar via the "Portal" switch button — where these would render the
        // unscoped, facility-wide DailyPriorityQueuePage/OutreachQueuePage (no per-kader
        // filtering), violating the hard S2 ceiling enforced elsewhere in this file.
        // 'citizen-app' is strictly reserved for CITIZEN role only.
        return [
          'kader-app',
          'dinkes-ringkasan',
          'penugasan-lapangan',
          'ai-nudge-budaya',
          'ai-rute-maritim',
          'sinkronisasi',
        ];

      case 'PUSTU':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'outreach', 'penugasan-lapangan', 'kader-app',
          'ai-nudge-budaya', 'ai-rute-maritim',
          'sinkronisasi',
        ];

      case 'POSYANDU':
        return [
          'dashboard',
          'dinkes-ringkasan',
          'prioritas-harian', 'outreach', 'penugasan-lapangan', 'kader-app',
          'sinkronisasi',
        ];

      case 'CITIZEN':
        return [
          'citizen-app',
          'dinkes-ringkasan',
        ];

      case 'DIR_RSUD':
        // Explicit registered navigation permissions for Direktur RSUD
        return [...DIR_RSUD_NAVIGATION_PERMISSIONS];

      default:
        return ['dashboard', 'prioritas-harian'];
    }
  },

  isNavAllowed(roleId: RoleId | string, navId: string): boolean {
    const allowed = this.getAllowedNavIds(roleId);
    return allowed.includes(navId);
  },

  getDefaultNavForRole(roleId: RoleId | string): string {
    const normalized = normalizeRoleId(roleId);
    switch (normalized) {
      case 'CITIZEN':
        return 'citizen-app';
      case 'KADER':
        return 'kader-app';
      case 'DOCTOR':
      case 'NURSE_MIDWIFE':
      case 'PUSTU':
      case 'PJ_CKG':
        return 'prioritas-harian';
      case 'PHARMACY_OFFICER':
        return 'care-task';
      case 'KEPALA_DINAS':
        return 'dashboard';
      case 'ANALYST_DINKES':
        return 'dinkes-ringkasan';
      case 'DIR_RSUD':
        return 'rsud-executive';
      case 'ADMIN_DINKES':
      case 'KEPALA_PUSKESMAS':
      default:
        return 'dashboard';
    }
  },
};
