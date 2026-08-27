import { RoleId, SensitivityLevel, User } from '../types';
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

export const permissionService = {
  getRoleDefinition(roleId: RoleId) {
    return INITIAL_ROLES.find((r) => r.id === roleId) || INITIAL_ROLES[0];
  },

  getAllRoles() {
    return INITIAL_ROLES;
  },

  getPermissionMatrix() {
    return PERMISSION_MATRIX_DATA;
  },

  // Check if role has access to specific sensitivity level
  hasSensitivityAccess(roleId: RoleId, requiredLevel: SensitivityLevel): boolean {
    const roleDef = this.getRoleDefinition(roleId);
    const roleCeilingRank = SENSITIVITY_ORDER[roleDef.dataCeiling];
    const requiredRank = SENSITIVITY_ORDER[requiredLevel];

    // HARD RULE: KADER CEILING IS S2. KADER CAN NEVER ACCESS S3 OR S4.
    if (roleId === 'KADER' && requiredRank > SENSITIVITY_ORDER.S2) {
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

    // Kepala Puskesmas can only manage users in their own Puskesmas / network
    if (actor.roleId === 'KEPALA_PUSKESMAS') {
      if (!targetUser) return { allowed: true };

      // Cannot assign or manage Dinkes roles
      const restrictedRoles: RoleId[] = ['ADMIN_DINKES', 'KEPALA_DINAS', 'ANALYST_DINKES', 'AUDITOR'];
      if (targetUser.roleId && restrictedRoles.includes(targetUser.roleId)) {
        return {
          allowed: false,
          reason: 'Kepala Puskesmas tidak memiliki wewenang untuk mengelola akun tingkat Dinas Kesehatan.',
        };
      }

      // Must be within same facility or area scope
      if (targetUser.facilityId && targetUser.facilityId !== actor.facilityId) {
        return {
          allowed: false,
          reason: 'Anda hanya dapat mengelola staf dan kader di bawah fasilitas Puskesmas Anda.',
        };
      }

      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Peran Anda tidak memiliki hak akses untuk mengelola pengguna.',
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
    const allowedRoles: RoleId[] = ['ADMIN_DINKES', 'KEPALA_DINAS', 'ANALYST_DINKES', 'KEPALA_PUSKESMAS', 'AUDITOR'];
    return allowedRoles.includes(actor.roleId);
  },

  // Check area scope containment
  isInScope(actor: User, scopeId: string): boolean {
    if (actor.roleId === 'ADMIN_DINKES' || actor.roleId === 'KEPALA_DINAS' || actor.roleId === 'ANALYST_DINKES' || actor.roleId === 'AUDITOR') {
      return true; // Kabupaten wide
    }
    return actor.areaScopes.includes(scopeId) || actor.villageAssignment === scopeId;
  },

  // Role Navigation Access Map (Role-Based Menu Matrix)
  getAllowedNavIds(roleId: RoleId): string[] {
    switch (roleId) {
      case 'ADMIN_DINKES':
        return [
          'dashboard',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'penugasan-lapangan', 'kader-app', 'citizen-app', 'jadwal-kuota', 'kandidat-putus', 'beban-kerja', 'outreach-config',
          'ai-tata-kelola', 'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-scenario-lab', 'ai-klaster-populasi', 'ai-kepatuhan-obat', 'ai-kinerja-model', 'ai-prioritas-pencegahan', 'ai-clinical-copilot', 'ai-nudge-budaya', 'ai-rute-maritim',
          'dinkes-command-center', 'dinkes-ringkasan', 'dinkes-impact-index', 'dinkes-kaskade', 'dinkes-wilayah', 'dinkes-gap', 'dinkes-kinerja-pkm', 'dinkes-penyebab-kendala', 'dinkes-intervensi-populasi', 'dinkes-perbandingan-periode', 'dinkes-kualitas-data', 'dinkes-kepala-daerah', 'dinkes-laporan', 'dinkes-audit-drilldown',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'integritas-monitoring', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry', 'data-quality', 'duplicate-review', 'import-ckg', 'ingestion-monitor', 'import-history', 'source-mapping',
          'stratifikasi',
          'wilayah', 'faskes', 'layanan',
          'pengguna', 'peran', 'cakupan',
          'persetujuan', 'versi-aturan', 'audit-log',
          'sinkronisasi', 'integrasi', 'pengaturan',
          'future-facility', 'future-monitoring', 'future-ai',
        ];

      case 'KEPALA_DINAS':
        return [
          'dashboard',
          'dinkes-command-center', 'dinkes-ringkasan', 'dinkes-impact-index', 'dinkes-kaskade', 'dinkes-wilayah', 'dinkes-gap', 'dinkes-kinerja-pkm', 'dinkes-penyebab-kendala', 'dinkes-intervensi-populasi', 'dinkes-perbandingan-periode', 'dinkes-kualitas-data', 'dinkes-kepala-daerah', 'dinkes-laporan', 'dinkes-audit-drilldown',
          'pemantauan-aktif', 'integritas-monitoring', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'stratifikasi',
          'wilayah', 'faskes', 'layanan',
          'future-monitoring',
        ];

      case 'ANALYST_DINKES':
        return [
          'dashboard',
          'dinkes-command-center', 'dinkes-ringkasan', 'dinkes-impact-index', 'dinkes-kaskade', 'dinkes-wilayah', 'dinkes-gap', 'dinkes-kinerja-pkm', 'dinkes-penyebab-kendala', 'dinkes-intervensi-populasi', 'dinkes-perbandingan-periode', 'dinkes-kualitas-data', 'dinkes-laporan', 'dinkes-audit-drilldown',
          'ai-tata-kelola', 'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-scenario-lab', 'ai-klaster-populasi', 'ai-kepatuhan-obat', 'ai-kinerja-model', 'ai-prioritas-pencegahan',
          'pemantauan-aktif', 'integritas-monitoring', 'kohort-kondisi', 'tren-outcome',
          'data-quality', 'duplicate-review', 'import-ckg', 'ingestion-monitor', 'import-history', 'source-mapping',
          'stratifikasi',
          'wilayah', 'faskes', 'layanan',
          'persetujuan', 'versi-aturan', 'audit-log',
          'integrasi',
          'future-monitoring', 'future-ai',
        ];

      case 'BUPATI':
        return [
          'dinkes-kepala-daerah',
          'dinkes-command-center',
          'dinkes-ringkasan',
          'dinkes-impact-index',
          'dinkes-kaskade',
          'dinkes-wilayah',
          'dinkes-perbandingan-periode',
          'dinkes-laporan',
          'ai-scenario-lab',
          'ai-proyeksi-beban',
          'wilayah',
          'faskes',
        ];

      case 'KEPALA_PUSKESMAS':
        return [
          'dashboard',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'penugasan-lapangan', 'kader-app', 'jadwal-kuota', 'kandidat-putus', 'beban-kerja', 'outreach-config',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-nudge-budaya', 'ai-rute-maritim',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'integritas-monitoring', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry', 'data-quality',
          'stratifikasi',
          'faskes', 'layanan',
          'pengguna', 'cakupan',
          'persetujuan', 'audit-log',
          'sinkronisasi',
        ];

      case 'AUDITOR':
        return [
          'dashboard',
          'ai-tata-kelola', 'ai-kinerja-model',
          'integritas-monitoring',
          'dinkes-ringkasan', 'dinkes-audit-drilldown',
          'registry', 'data-quality', 'duplicate-review',
          'persetujuan', 'versi-aturan', 'audit-log',
          'future-monitoring', 'future-ai',
        ];

      case 'PJ_CKG':
        return [
          'dashboard',
          'prioritas-harian', 'care-task', 'clinical-followup', 'outreach', 'penugasan-lapangan', 'kader-app', 'citizen-app', 'jadwal-kuota', 'kandidat-putus', 'beban-kerja', 'outreach-config',
          'ai-prediksi-dropout', 'ai-digital-twin', 'ai-proyeksi-beban', 'ai-kepatuhan-obat', 'ai-prioritas-pencegahan', 'ai-nudge-budaya', 'ai-rute-maritim',
          'pemantauan-aktif', 'kontrol-harian', 'menunggu-evaluasi', 'integritas-monitoring', 'kepatuhan-kendala', 'kohort-kondisi', 'tren-outcome', 'risiko-putus',
          'registry', 'data-quality', 'duplicate-review', 'import-ckg', 'ingestion-monitor', 'import-history',
          'stratifikasi',
          'persetujuan',
          'sinkronisasi',
        ];

      case 'DOCTOR':
        return [
          'dashboard',
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
          'care-task', 'clinical-followup', 'jadwal-kuota',
          'ai-kepatuhan-obat', 'ai-proyeksi-beban',
          'pemantauan-aktif', 'kontrol-harian',
          'sinkronisasi',
        ];

      case 'KADER':
        return [
          'kader-app',
          'prioritas-harian',
          'penugasan-lapangan',
          'outreach',
          'citizen-app',
          'ai-nudge-budaya',
          'ai-rute-maritim',
          'sinkronisasi',
        ];

      case 'PUSTU':
        return [
          'dashboard',
          'prioritas-harian', 'outreach', 'penugasan-lapangan', 'kader-app',
          'ai-nudge-budaya', 'ai-rute-maritim',
          'sinkronisasi',
        ];

      case 'POSYANDU':
        return [
          'dashboard',
          'prioritas-harian', 'outreach', 'penugasan-lapangan', 'kader-app',
          'sinkronisasi',
        ];

      case 'CITIZEN':
        return [
          'citizen-app',
        ];

      case 'AUDITOR':
        return [
          'dashboard',
          'audit-log',
          'dinkes-audit-drilldown',
          'dinkes-ringkasan',
          'dinkes-kualitas-data',
          'dinkes-laporan',
          'integritas-monitoring',
          'ai-tata-kelola',
          'versi-aturan',
          'persetujuan',
          'peran',
        ];

      default:
        return ['dashboard', 'prioritas-harian'];
    }
  },

  isNavAllowed(roleId: RoleId, navId: string): boolean {
    const allowed = this.getAllowedNavIds(roleId);
    return allowed.includes(navId);
  },

  getDefaultNavForRole(roleId: RoleId): string {
    switch (roleId) {
      case 'BUPATI':
        return 'dinkes-kepala-daerah';
      case 'CITIZEN':
        return 'citizen-app';
      case 'KADER':
        return 'kader-app';
      case 'AUDITOR':
        return 'audit-log';
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
      case 'ADMIN_DINKES':
      case 'KEPALA_PUSKESMAS':
      default:
        return 'dashboard';
    }
  },
};
