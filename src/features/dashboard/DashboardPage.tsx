import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  FileCheck2,
  GitBranch,
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
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { rawStorage, subscribeToStorage } from '../../repositories/storage';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { permissionService } from '../../services/permissionService';
import { AuditEvent } from '../../types';
import { ExecutiveDinkesDashboardView } from './components/ExecutiveDinkesDashboardView';

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

  return (
    <div data-tour="dashboard-overview-area" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#003B33] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Sistem Operasional Aktif
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
            Sistem Manajemen Master Data, Akses Keamanan Terpadu, Ingestion CKG, Stratifikasi Risiko Deterministik, Orkestrasi Care Task & Penjangkauan Aktif Pulau Taliabu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {can('prioritas-harian') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('prioritas-harian')}
              leftIcon={<Activity className="w-4 h-4" />}
            >
              Prioritas Hari Ini
            </Button>
          )}
          {can('clinical-followup') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('clinical-followup')}
              className="text-white bg-white/10 hover:bg-white/20 border-white/20"
              leftIcon={<ClipboardList className="w-4 h-4" />}
            >
              Layanan Klinis
            </Button>
          )}
          {can('dinkes-command-center') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dinkes-command-center')}
              className="text-teal-200 bg-teal-500/20 hover:bg-teal-500/30 border-teal-400/40 font-bold"
              leftIcon={<Sparkles className="w-4 h-4 text-teal-300" />}
            >
              Command Center
            </Button>
          )}
        </div>
      </div>

      {/* Highlights: Care Task Orchestration & Outreach */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
            Care Task Orchestration & Active Outreach
          </h3>
          <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Engine Kaskade Siap
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            {...cardProps('prioritas-harian')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Tugas Aktif</span>
              <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.activeCareTasks}</p>
            <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">Dari {stats.totalCareTasks} Total Care Tasks</p>
          </div>

          <div
            {...cardProps('prioritas-harian')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Tugas Kritis Terbuka</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-700 group-hover:bg-red-700 group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-700 tracking-tight">{stats.criticalCareTasks}</p>
            <p className="text-[11px] text-red-700 font-medium mt-1">Bypass Kaskade Otomatis</p>
          </div>

          <div
            {...cardProps('jadwal-kuota')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Janji Temu Hari Ini</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-800 tracking-tight">{stats.todayAppointments}</p>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Anti-Overbooking Proteksi</p>
          </div>

          <div
            {...cardProps('kandidat-putus')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Kandidat Putus</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700 tracking-tight">{stats.dropoutCandidates}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Wajib Kontak Manusia (R-91)</p>
          </div>
        </div>
      </div>

      {/* Highlights: Stratifikasi Risiko & Next-Best-Action */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
            Stratifikasi Risiko & Next-Best-Action
          </h3>
          <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Engine CRS v0.9 Siap
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            {...cardProps('stratifikasi')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Terkategori Risiko</span>
              <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.totalClassifications}</p>
            <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">Append-only Record</p>
          </div>

          <div
            {...cardProps('stratifikasi')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Temuan Kritis</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-700 group-hover:bg-red-700 group-hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-700 tracking-tight">{stats.criticalCount}</p>
            <p className="text-[11px] text-red-700 font-medium mt-1">Perlu Penanganan Cepat</p>
          </div>

          <div
            {...cardProps('stratifikasi')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Risiko Merah / Tinggi</span>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700 group-hover:bg-orange-700 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-700 tracking-tight">{stats.highRiskCount}</p>
            <p className="text-[11px] text-orange-700 font-medium mt-1">FKTP & Rujukan FKRTL</p>
          </div>

          <div
            {...cardProps('stratifikasi')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Tata Kelola Aturan</span>
              <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                <GitBranch className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2E7D5B] tracking-tight">CRS v0.9</p>
            <p className="text-[11px] text-[#60716D] font-medium mt-1">Deterministik 5-Domain</p>
          </div>
        </div>
      </div>

      {/* Highlights: Registry & Ingestion Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
            Registry CKG & Ingestion Pipeline
          </h3>
          <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Berjalan Normal
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            {...cardProps('registry')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Warga Terdaftar</span>
              <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] group-hover:bg-[#2E7D5B] group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.totalCitizens}</p>
            <p className="text-[11px] text-[#2E7D5B] font-medium mt-1">Master Patient Index</p>
          </div>

          <div
            {...cardProps('registry')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Sesi Skrining CKG</span>
              <div className="p-2 rounded-lg bg-[#E1F5FE] text-[#397B94] group-hover:bg-[#397B94] group-hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-black tracking-tight">{stats.totalSessions}</p>
            <p className="text-[11px] text-[#397B94] font-medium mt-1">
              {stats.completeSessions} Lengkap
            </p>
          </div>

          <div
            {...cardProps('data-quality')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Antrean Masalah Data</span>
              <div className="p-2 rounded-lg bg-[#FFFACD] text-[#C99720] group-hover:bg-[#C99720] group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#C99720] tracking-tight">{stats.openDqIssues}</p>
            <p className="text-[11px] text-[#C99720] font-medium mt-1">Perlu Keputusan PJ CKG</p>
          </div>

          <div
            {...cardProps('ingestion-monitor')}
          >
            <div className="flex items-center justify-between text-[#60716D] mb-2">
              <span className="text-xs font-semibold">Ingestion & Watermark</span>
              <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2E7D5B] tracking-tight">Aktif</p>
            <p className="text-[11px] text-[#60716D] font-medium mt-1">Sinkronisasi Terjadwal</p>
          </div>
        </div>
      </div>

      {/* Section 1: Platform Configuration & Master Data Stats (Hidden for ADMIN_DINKES) */}
      {currentUser?.roleId !== 'ADMIN_DINKES' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#60716D]">
              Konfigurasi Platform & Master Data
            </h3>
            <span className="text-xs text-[#2E7D5B] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Struktur Wilayah Aktif
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div {...cardProps('pengguna')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Pengguna Aktif</span>
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
                <span className="text-xs font-semibold">Fasilitas Kesehatan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.totalFacilities}</p>
              <p className="text-[11px] text-[#60716D] mt-1">{stats.puskesmasCount} Puskesmas + Pustu & Posyandu</p>
            </div>

            <div {...cardProps('wilayah')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Kecamatan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.kecamatanCount}</p>
              <p className="text-[11px] text-[#60716D] mt-1">Kecamatan se-Kabupaten</p>
            </div>

            <div {...cardProps('wilayah')}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Desa / Kelurahan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.villageCount}</p>
              <p className="text-[11px] text-[#60716D] mt-1">Desa Binaan & Posyandu</p>
            </div>

            <div {...cardProps('pengguna')} className={`${cardProps('pengguna').className} col-span-2 sm:col-span-1`}>
              <div className="flex items-center justify-between text-[#60716D] mb-2">
                <span className="text-xs font-semibold">Kader Lapangan</span>
                <div className="p-2 rounded-lg bg-[#F0F5F4] text-black group-hover:bg-[#00201C] group-hover:text-white transition-colors">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-black tracking-tight">{stats.kaderCount}</p>
              <p className="text-[11px] text-[#397B94] font-medium mt-1">Plafon Plafond S2 Terpasang</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Governance & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D5B]" />
                <h4 className="text-sm font-bold text-black">Tata Kelola & Kepatuhan</h4>
              </div>
              <span className="text-[11px] font-semibold text-[#397B94] bg-[#E1F5FE] px-2 py-0.5 rounded">
                Governance
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div {...rowProps('versi-aturan')}>
                <div>
                  <p className="font-semibold text-black">Versi Aturan Klinis Aktif</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">{stats.activeRuleVersion}</p>
                </div>
                <Badge variant="published" size="sm">
                  Aktif
                </Badge>
              </div>

              <div {...rowProps('persetujuan')}>
                <div>
                  <p className="font-semibold text-black">Rekaman Persetujuan Warga</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Consent foundation aktif</p>
                </div>
                <span className="text-sm font-bold text-black">{stats.activeConsents} Dokumen</span>
              </div>

              <div className="p-3 bg-[#FFFACD]/40 rounded-lg border border-[#F5EC9C] text-[#8C6407]">
                <p className="font-semibold">Batas Plafon Data Kader (S2 Ceiling)</p>
                <p className="text-[11px] mt-0.5 text-[#6D4C04]">
                  Terkonfigurasi aman: Kader tidak menerima data tensi, gula, atau diagnosa medis dari server.
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
                Kelola Versi Aturan Klinis
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
                <h4 className="text-sm font-bold text-black">Infrastruktur Sinkronisasi</h4>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D5B] bg-[#EBF7F2] px-2 py-0.5 rounded">
                Sistem Siap
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black">Status Jaringan Saat Ini</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Mode operasional</p>
                </div>
                <Badge variant={isOffline ? 'warning' : 'active'} size="sm">
                  {networkMode === 'ONLINE' ? 'Daring (Online)' : networkMode === 'SLOW' ? 'Jaringan Lambat' : 'Luring (Offline)'}
                </Badge>
              </div>

              <div {...rowProps('sinkronisasi')}>
                <div>
                  <p className="font-semibold text-black">Antrian Luring Idempotency</p>
                  <p className="text-[11px] text-[#60716D] mt-0.5">Menunggu sinkronisasi</p>
                </div>
                <span className="text-sm font-bold text-black">{stats.pendingSync} Item</span>
              </div>

              <div className="p-3 bg-[#E1F5FE] rounded-lg border border-[#BDE3F5] text-[#1E5D75]">
                <p className="font-semibold">Kesiapan SATUSEHAT & Integrasi</p>
                <p className="text-[11px] mt-0.5 text-[#334643]">
                  Bridge metadata faskes terstandarisasi dengan kode Kemenkes RI.
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
                Pusat Sinkronisasi
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
                <h4 className="text-sm font-bold text-black">Aksi Cepat</h4>
              </div>

              <div className="space-y-2">
                {can('registry') && (
                  <button
                    onClick={() => onNavigate('registry')}
                    className="w-full text-left p-3 rounded-lg border border-[#D8E5E2] hover:border-[#00201C] hover:bg-[#F8FBFA] transition-all flex items-center justify-between text-xs font-semibold text-black group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardList className="w-4 h-4 text-[#2E7D5B]" />
                      <span>Cari & Lihat Kartu Warga (Registry)</span>
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
                      <span>Tinjau Antrean Masalah ({stats.openDqIssues})</span>
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
                      <span>Tambah Akun Pengguna / Kader</span>
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
                      <span>Kelola Fasilitas Kesehatan</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#60716D] group-hover:text-black" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 mt-4 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-[11px] text-[#60716D]">
              Setiap aksi modifikasi master data dan pengguna secara otomatis dicatat dalam Jejak Audit permanen.
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
              <h4 className="text-sm font-bold text-black">Aktivitas & Jejak Audit Terbaru</h4>
              <p className="text-xs text-[#60716D]">Rekaman peristiwa append-only sistem secara waktu-nyata</p>
            </div>
          </div>
          {can('audit-log') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('audit-log')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lihat Semua Audit
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
