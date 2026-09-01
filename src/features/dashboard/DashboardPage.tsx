import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  FileCheck2,
  History,
  RefreshCw,
  UserPlus,
  PlusCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertCircle,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ActionIconButton } from '../../components/common/ActionIconButton';
import { Tooltip } from '../../components/common/Tooltip';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { rawStorage, subscribeToStorage } from '../../repositories/storage';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { permissionService } from '../../services/permissionService';
import { AuditEvent } from '../../types';
import { ExecutiveDinkesDashboardView } from './components/ExecutiveDinkesDashboardView';
import { DashboardPustuPage } from './DashboardPustuPage';
import { AdminScreeningAreaGrowthChart } from './components/AdminScreeningAreaGrowthChart';
import { AdminFollowupAnalytics } from './components/AdminFollowupAnalytics';

interface DashboardPageProps {
  onNavigate: (navId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { isOffline, networkMode } = useNetwork();
  const roleId = currentUser?.roleId || 'ADMIN_DINKES';
  const can = (navId: string) => permissionService.isNavAllowed(roleId, navId);
  // Shared props for dashboard stat-cards: only clickable/navigable when the
  // current role actually has that menu — otherwise it's a plain info card,
  // not a dead link masquerading as one.
  const cardProps = (navId: string) => ({
    onClick: can(navId) ? () => onNavigate(navId) : undefined,
    className: `bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs transition-all group ${
      can(navId) ? 'hover:border-[#00201C] cursor-pointer' : ''
    }`,
  });
  const rowProps = (navId: string) => ({
    onClick: can(navId) ? () => onNavigate(navId) : undefined,
    className: `p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] flex items-center justify-between ${
      can(navId) ? 'hover:bg-[#F0F5F4] cursor-pointer' : ''
    }`,
  });

  const [stats, setStats] = useState({
    activeUsers: 0,
    kaderCount: 0,
    totalFacilities: 0,
    puskesmasCount: 0,
    villageCount: 0,
    kecamatanCount: 0,
    activeConsents: 0,
    activeRuleVersion: 'v1.1.0-CKG-TALIABU-2026',
    pendingSync: 0,
    totalCitizens: 0,
    totalSessions: 0,
    completeSessions: 0,
    openDqIssues: 0,
    totalClassifications: 0,
    criticalCount: 0,
    highRiskCount: 0,
    totalCareTasks: 0,
    activeCareTasks: 0,
    criticalCareTasks: 0,
    todayAppointments: 0,
    dropoutCandidates: 0,
    recentAudits: [] as AuditEvent[],
  });

  const loadDashboardData = () => {
    const users = rawStorage.getUsers();
    const facilities = rawStorage.getFacilities();
    const desa = rawStorage.getDesa();
    const kecamatan = rawStorage.getKecamatan();
    const consents = rawStorage.getConsents();
    const ruleVersions = rawStorage.getRuleVersions();
    const syncQueue = rawStorage.getSyncQueue();
    const audits = rawStorage.getAuditLogs();
    const citizens = rawStorage.getCitizens().filter((c) => !c.mergedIntoId);
    const sessions = rawStorage.getScreeningSessions();
    const dqIssues = rawStorage.getDataQualityIssues().filter((i) => i.status === 'OPEN');
    const classifications = rawStorage.getRiskClassifications().filter((c) => !c.supersededById);
    const careTasks = rawStorage.getCareTasks();
    const appointments = rawStorage.getAppointments();
    const dropouts = rawStorage.getDropoutCandidates();

    const activeRule = ruleVersions.find((r) => r.status === 'PUBLISHED')?.version || 'v1.1.0-CKG-TALIABU-2026';

    const todayStr = new Date().toISOString().split('T')[0];

    setStats({
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      kaderCount: users.filter((u) => u.roleId === 'KADER' && u.status === 'ACTIVE').length,
      totalFacilities: facilities.filter((f) => f.status === 'ACTIVE').length,
      puskesmasCount: facilities.filter((f) => f.type === 'PUSKESMAS' && f.status === 'ACTIVE').length,
      villageCount: desa.filter((d) => d.status === 'ACTIVE').length,
      kecamatanCount: kecamatan.filter((k) => k.status === 'ACTIVE').length,
      activeConsents: consents.filter((c) => c.status === 'ACTIVE').length,
      activeRuleVersion: activeRule,
      pendingSync: syncQueue.filter((s) => s.syncStatus === 'PENDING').length,
      totalCitizens: citizens.length,
      totalSessions: sessions.length,
      completeSessions: sessions.filter((s) => s.isComplete).length,
      openDqIssues: dqIssues.length,
      totalClassifications: classifications.length,
      criticalCount: classifications.filter((c) => c.isCritical || c.finalCategory === 'DARK_RED').length,
      highRiskCount: classifications.filter((c) => c.finalCategory === 'RED' || c.finalCategory === 'DARK_RED').length,
      totalCareTasks: careTasks.length,
      activeCareTasks: careTasks.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length,
      criticalCareTasks: careTasks.filter((t) => t.isCritical && t.status !== 'CLOSED' && t.status !== 'CANCELLED').length,
      todayAppointments: appointments.filter((a) => a.scheduledDate === todayStr && a.status !== 'CANCELLED').length,
      dropoutCandidates: dropouts.length,
      recentAudits: audits.slice(0, 6),
    });
  };

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = subscribeToStorage(loadDashboardData);
    return unsubscribe;
  }, []);

  // For Kepala Dinas Kesehatan, render the dedicated Executive Management Dashboard
  if (currentUser?.roleId === 'KEPALA_DINAS') {
    return (
      <div data-tour="dashboard-overview-area" className="space-y-6">
        <ExecutiveDinkesDashboardView onNavigate={onNavigate} />
      </div>
    );
  }

  // For Petugas Pustu, render the dedicated village-level Pustu Dashboard
  if (currentUser?.roleId === 'PUSTU') {
    return <DashboardPustuPage onNavigate={onNavigate} currentUser={currentUser} />;
  }

  const isPosyanduOrKader = roleId === 'POSYANDU' || roleId === 'KADER';

  return (
    <div data-tour="dashboard-overview-area" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#003B33] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Sistem Aktif
            </span>
            <span className="text-xs text-slate-300">Kabupaten Pulau Taliabu</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang, {currentUser?.name}
            </h2>
            <DocBadge code="SCR-PKM-A01" size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {isPosyanduOrKader
              ? 'Pusat informasi pemeriksaan Cek Kesehatan Gratis (CKG), daftar tindak lanjut warga, dan pemantauan kesehatan di wilayah Anda.'
              : 'Pusat informasi pemeriksaan Cek Kesehatan Gratis (CKG), tindak lanjut kesehatan warga, dan koordinasi layanan terpadu Pulau Taliabu.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
          {can('prioritas-harian') && (
            <ActionIconButton
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('prioritas-harian')}
              icon={<Activity className="w-4 h-4 text-slate-900" />}
              tooltip="Buka Prioritas Tindak Lanjut & Antrean Harian Warga (SCR-PKM-B01)"
              tooltipPosition="bottom"
            />
          )}
          {can('clinical-followup') && (
            <ActionIconButton
              variant="outline"
              size="sm"
              onClick={() => onNavigate('clinical-followup')}
              icon={<ClipboardList className="w-4 h-4 text-emerald-300" />}
              tooltip="Buka Antrean Pemeriksaan & Validasi Klinis Dokter (SCR-DOC-A01)"
              tooltipPosition="bottom"
              className="text-white bg-white/10 hover:bg-white/20 border-white/20"
            />
          )}
          {can('dinkes-ringkasan') && (
            <ActionIconButton
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dinkes-ringkasan')}
              icon={<Sparkles className="w-4 h-4 text-teal-300" />}
              tooltip="Buka Dashboard Eksekutif & Ringkasan Dinas Kesehatan (SCR-DNK-A01)"
              tooltipPosition="bottom"
              className="text-teal-200 bg-teal-500/20 hover:bg-teal-500/30 border-teal-400/40 font-bold"
            />
          )}
        </div>
      </div>

      {/* Highlights: Tindak Lanjut & Kunjungan Warga */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
            Tindak Lanjut & Pendampingan Warga
          </h3>
          <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Pelayanan Siap
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            {...cardProps('prioritas-harian')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Tugas Sedang Berjalan</span>
              <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.activeCareTasks}</p>
            <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">Dari {stats.totalCareTasks} Total Tugas Pendampingan</p>
          </div>

          <div
            {...cardProps('prioritas-harian')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Butuh Penanganan Cepat</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-700 group-hover:bg-red-700 group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-700 tracking-tight">{stats.criticalCareTasks}</p>
            <p className="text-[11px] text-red-700 font-medium mt-1">Kondisi darurat / prioritas utama</p>
          </div>

          <div
            {...cardProps('jadwal-kuota')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Jadwal Periksa Hari Ini</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-800 tracking-tight">{stats.todayAppointments}</p>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Warga dijadwalkan ke Puskesmas</p>
          </div>

          <div
            {...cardProps('kandidat-putus')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Warga Perlu Diingatkan</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight">{stats.dropoutCandidates}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Belum datang kontrol ulang</p>
          </div>
        </div>

        {/* Dedicated Follow-up & SLA Aging Analytics */}
        <div className="mt-4">
          <AdminFollowupAnalytics onNavigate={onNavigate} />
        </div>
      </div>

      {/* Highlights: Data Warga & Pemeriksaan CKG */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
            Data Warga & Pemeriksaan CKG
          </h3>
          <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pendataan Lancar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            {...cardProps('registry')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Total Warga Terdata</span>
              <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.totalCitizens}</p>
            <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">Berdasarkan NIK & Domisili</p>
          </div>

          <div
            {...cardProps('registry')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Pemeriksaan CKG Selesai</span>
              <div className="p-2 rounded-lg bg-[#E1F5FE] text-[#397B94] group-hover:bg-[#397B94] group-hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.totalSessions}</p>
            <p className="text-[11px] text-[#397B94] font-medium mt-1">
              {stats.completeSessions} Pemeriksaan Lengkap
            </p>
          </div>

          <div
            {...cardProps('data-quality')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Data Perlu Dilengkapi</span>
              <div className="p-2 rounded-lg bg-[#FFFACD] text-[#C99720] group-hover:bg-[#C99720] group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#C99720] tracking-tight">{stats.openDqIssues}</p>
            <p className="text-[11px] text-[#C99720] font-medium mt-1">NIK belum lengkap / tercatat ganda</p>
          </div>

          <div
            {...cardProps('ingestion-monitor')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Status Pengiriman Data</span>
              <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2E7D5B] tracking-tight">Lancar</p>
            <p className="text-[11px] text-[#60716D] font-medium mt-1">Tersimpan aman di sistem</p>
          </div>
        </div>

        {/* Dedicated Screening Area Growth Chart */}
        <div className="mt-4">
          <AdminScreeningAreaGrowthChart />
        </div>
      </div>

      {/* Section 1: Fasilitas & Wilayah Kerja */}
      {currentUser?.roleId !== 'ADMIN_DINKES' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
              Informasi Wilayah & Petugas
            </h3>
            <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Wilayah Binaan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div {...cardProps('pengguna')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Petugas Aktif</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.activeUsers}</p>
              <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">
                Termasuk {stats.kaderCount} Kader Desa
              </p>
            </div>

            <div {...cardProps('faskes')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Tempat Pelayanan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.totalFacilities}</p>
              <p className="text-[11px] text-[#60716D] mt-1">{stats.puskesmasCount} Puskesmas, Pustu & Posyandu</p>
            </div>

            <div {...cardProps('wilayah')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Kecamatan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.kecamatanCount}</p>
              <p className="text-[11px] text-[#60716D] mt-1">Kecamatan di Pulau Taliabu</p>
            </div>

            <div {...cardProps('wilayah')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Desa / Kelurahan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.villageCount}</p>
              <p className="text-[11px] text-[#60716D] mt-1">Desa Binaan Posyandu</p>
            </div>

            <div {...cardProps('pengguna')} className={`${cardProps('pengguna').className} col-span-2 sm:col-span-1`}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Kader Lapangan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.kaderCount}</p>
              <p className="text-[11px] text-[#397B94] font-medium mt-1">Siap mendampingi warga</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Keamanan Data & Sambungan Jaringan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D5B]" />
                <h4 className="text-sm font-bold text-black">Kerahasiaan & Izin Warga</h4>
              </div>
              <span className="text-[11px] font-semibold text-[#397B94] bg-[#E1F5FE] px-2 py-0.5 rounded">
                Privasi Terjaga
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div {...rowProps('versi-aturan')}>
                <div>
                  <p className="font-semibold text-black">Pedoman Pemeriksaan Resmi</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">{stats.activeRuleVersion}</p>
                </div>
                <Badge variant="published" size="sm">
                  Aktif
                </Badge>
              </div>

              <div {...rowProps('persetujuan')}>
                <div>
                  <p className="font-semibold text-black">Surat Izin Pemeriksaan Warga</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Izin tindak lanjut kesehatan</p>
                </div>
                <span className="text-sm font-bold text-black">{stats.activeConsents} Surat</span>
              </div>

              <div className="p-3 bg-[#FFFACD]/40 rounded-lg border border-[#F5EC9C] text-[#8C6407]">
                <p className="font-semibold">Privasi Data Warga Terlindungi</p>
                <p className="text-[11px] mt-0.5 text-[#6D4C04]">
                  Petugas posyandu dan kader hanya melihat data kontak dan jadwal pendampingan, menjaga kerahasiaan rekam medis warga.
                </p>
              </div>
            </div>
          </div>

          {can('versi-aturan') && (
            <div className="pt-4 mt-2 border-t border-[#D8E5E2]">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigate('versi-aturan')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lihat Pedoman Pemeriksaan
              </Button>
            </div>
          )}
        </Card>

        {/* System & Sync Infrastructure Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#397B94]" />
                <h4 className="text-sm font-bold text-black">Kondisi Jaringan & Pengiriman Data</h4>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D5B] bg-[#EBF7F2] px-2 py-0.5 rounded">
                Sistem Siap
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black">Koneksi Internet Saat Ini</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Kondisi jaringan di lokasi</p>
                </div>
                <Badge variant={isOffline ? 'warning' : 'active'} size="sm">
                  {networkMode === 'ONLINE' ? 'Terhubung (Online)' : networkMode === 'SLOW' ? 'Sinyal Lemah' : 'Tanpa Internet (Offline)'}
                </Badge>
              </div>

              <div {...rowProps('sinkronisasi')}>
                <div>
                  <p className="font-semibold text-black">Data Menunggu Terkirim</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Tersimpan di perangkat saat offline</p>
                </div>
                <span className="text-sm font-bold text-black">{stats.pendingSync} Data</span>
              </div>

              <div className="p-3 bg-[#E1F5FE] rounded-lg border border-[#BDE3F5] text-[#1E5D75]">
                <p className="font-semibold">Bisa Digunakan Tanpa Sinyal</p>
                <p className="text-[11px] mt-0.5 text-[#334643]">
                  Aplikasi tetap bisa dipakai mencatat di desa terpencil meski tidak ada jaringan internet.
                </p>
              </div>
            </div>
          </div>

          {can('sinkronisasi') && (
            <div className="pt-4 mt-2 border-t border-[#D8E5E2]">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigate('sinkronisasi')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Kirim Data Sekarang
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions Panel — only rendered if at least one action is actually reachable */}
        {(can('registry') || can('data-quality') || can('pengguna') || can('faskes')) && (
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-black" />
                <h4 className="text-sm font-bold text-black">Menu Cepat</h4>
              </div>

              <div className="space-y-2">
                {can('registry') && (
                  <button
                    onClick={() => onNavigate('registry')}
                    className="w-full text-left p-3 rounded-lg border border-[#D8E5E2] hover:border-[#00201C] hover:bg-[#F8FBFA] transition-all flex items-center justify-between text-xs font-semibold text-black group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardList className="w-4 h-4 text-[#2E7D5B]" />
                      <span>Cari & Lihat Data Warga</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#60716D] group-hover:text-black" />
                  </button>
                )}

                {can('data-quality') && (
                  <button
                    onClick={() => onNavigate('data-quality')}
                    className="w-full text-left p-3 rounded-lg border border-[#D8E5E2] hover:border-[#00201C] hover:bg-[#F8FBFA] transition-all flex items-center justify-between text-xs font-semibold text-black group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#C99720]" />
                      <span>Perbaiki Data Warga ({stats.openDqIssues})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#60716D] group-hover:text-black" />
                  </button>
                )}

                {can('pengguna') && (
                  <button
                    onClick={() => onNavigate('pengguna')}
                    className="w-full text-left p-3 rounded-lg border border-[#D8E5E2] hover:border-[#00201C] hover:bg-[#F8FBFA] transition-all flex items-center justify-between text-xs font-semibold text-black group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4 text-[#397B94]" />
                      <span>Tambah Akun Petugas / Kader</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#60716D] group-hover:text-black" />
                  </button>
                )}

                {can('faskes') && (
                  <button
                    onClick={() => onNavigate('faskes')}
                    className="w-full text-left p-3 rounded-lg border border-[#D8E5E2] hover:border-[#00201C] hover:bg-[#F8FBFA] transition-all flex items-center justify-between text-xs font-semibold text-black group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-black" />
                      <span>Daftar Posyandu & Puskesmas</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#60716D] group-hover:text-black" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 mt-4 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-[11px] text-[#60716D]">
              Semua pencatatan dan perubahan data tersimpan aman di dalam sistem.
            </div>
          </Card>
        )}
      </div>

      {/* Section 3: Recent Audit Trail Feed */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-black" />
            <div>
              <h4 className="text-sm font-bold text-black">Riwayat Aktivitas Terbaru</h4>
              <p className="text-xs text-[#60716D]">Catatan kegiatan petugas dan kader yang baru saja dilakukan</p>
            </div>
          </div>
          {can('audit-log') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('audit-log')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lihat Semua Riwayat
            </Button>
          )}
        </div>

        <div className="divide-y divide-[#E8EFEB]">
          {stats.recentAudits.map((event) => (
            <div key={event.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#2E7D5B] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-black truncate">
                    {event.targetLabel || `${event.action} ${event.entityType}`}
                  </p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">
                    Oleh: <strong className="text-black">{event.actorName}</strong> ({event.actorRole})
                    {event.facilityName ? ` • ${event.facilityName}` : ''}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge variant={getStatusBadgeVariant(event.action)} size="sm">
                  {event.action}
                </Badge>
                <p className="text-[10px] text-[#AAB8B4] mt-1">
                  {new Date(event.occurredAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
