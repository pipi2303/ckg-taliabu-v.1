import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { TourProvider, useTour } from './context/TourContext';
import { OnboardingTour, OnboardingWelcomeBanner } from './components/tour/OnboardingTour';
import { LoginPage } from './features/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { permissionService } from './services/permissionService';

// Feature Views - Overview & Core
import { DashboardPage } from './features/dashboard/DashboardPage';
import { WilayahPage } from './features/organization/WilayahPage';
import { FacilityPage } from './features/organization/FacilityPage';
import { FacilityLogisticsPage } from './features/organization/pages/FacilityLogisticsPage';
import { ServicePage } from './features/organization/ServicePage';
import { UsersPage } from './features/users/UsersPage';
import { RolesPage } from './features/roles/RolesPage';
import { CakupanWilayahPage } from './features/organization/CakupanWilayahPage';
import { ConsentPage } from './features/consent/ConsentPage';
import { RuleVersionPage } from './features/governance/RuleVersionPage';
import { AuditLogPage } from './features/audit/AuditLogPage';
import { SyncPage } from './features/sync/SyncPage';
import { IntegrasiPage } from './features/system/IntegrasiPage';
import { SettingsPage } from './features/settings/SettingsPage';

// MVP 2 Feature Views
import { RegistryPage } from './features/registry/pages/RegistryPage';
import { DataQualityPage } from './features/data-quality/pages/DataQualityPage';
import { DuplicateReviewPage } from './features/duplicate/pages/DuplicateReviewPage';
import { ImportCkgPage } from './features/ingestion/pages/ImportCkgPage';
import { IngestionMonitorPage } from './features/ingestion/pages/IngestionMonitorPage';
import { ImportHistoryPage } from './features/ingestion/pages/ImportHistoryPage';
import { SourceMappingPage } from './features/ingestion/pages/SourceMappingPage';

// MVP 3 Feature Views
import { StratificationRegistryView } from './features/risk/StratificationRegistryView';

// MVP 4 Feature Views (Care Orchestration & Outreach)
import { DailyPriorityQueuePage } from './features/care-task/pages/DailyPriorityQueuePage';
import { CareTaskListPage } from './features/care-task/pages/CareTaskListPage';
import { OutreachQueuePage } from './features/outreach/pages/OutreachQueuePage';
import { FieldAssignmentPage } from './features/assignment/pages/FieldAssignmentPage';
import { AppointmentSchedulePage } from './features/appointments/pages/AppointmentSchedulePage';
import { DropoutCandidatePage } from './features/dropout/pages/DropoutCandidatePage';
import { WorkloadOverviewPage } from './features/workload/pages/WorkloadOverviewPage';
import { OutreachConfigPage } from './features/outreach/pages/OutreachConfigPage';

// MVP 5 Feature Views (Kader Field App - Offline-First PWA)
import { KaderAppShell } from './features/kader/KaderAppShell';

// MVP 6 Feature Views (Clinical Follow-Up & Closed-Loop Resolution)
import { ClinicalFollowUpPage } from './features/clinical/pages/ClinicalFollowUpPage';

// MVP 7 Feature Views (Citizen Companion App - Sahabat Warga)
import { CitizenCompanionView } from './features/citizen/CitizenCompanionView';

// MVP 8 Feature Views (Outcome Monitoring & Control Status)
import { ActiveMonitoringPage } from './features/monitoring/ActiveMonitoringPage';
import { TodayControlsPage } from './features/monitoring/TodayControlsPage';
import { AwaitingEvaluationPage } from './features/monitoring/AwaitingEvaluationPage';
import { MonitoringIntegrityPage } from './features/monitoring/MonitoringIntegrityPage';
import { AdherenceManagementPage } from './features/adherence/AdherenceManagementPage';
import { ConditionCohortsPage } from './features/cohorts/ConditionCohortsPage';
import { OutcomeTrendsPage } from './features/cohorts/OutcomeTrendsPage';
import { DropoutMonitoringPage } from './features/dropout/DropoutMonitoringPage';

// MVP 9 Feature Views (Population Health Command Center & Executive Decision Layer)
import { CommandCenterOverviewPage } from './features/command-center/pages/CommandCenterOverviewPage';
import { CountySummaryPage } from './features/command-center/pages/CountySummaryPage';
import { ImpactIndexPage } from './features/command-center/pages/ImpactIndexPage';
import { CascadePage } from './features/command-center/pages/CascadePage';
import { AreaAnalysisPage } from './features/command-center/pages/AreaAnalysisPage';
import { FollowUpGapPage } from './features/command-center/pages/FollowUpGapPage';
import { FacilityPerformancePage } from './features/command-center/pages/FacilityPerformancePage';
import { BarrierDistributionPage } from './features/command-center/pages/BarrierDistributionPage';
import { PopulationInterventionPage } from './features/command-center/pages/PopulationInterventionPage';
import { PeriodComparisonPage } from './features/command-center/pages/PeriodComparisonPage';
import { DataQualityIntegrasiPage } from './features/command-center/pages/DataQualityIntegrasiPage';
import { ExecutiveSummaryPage } from './features/command-center/pages/ExecutiveSummaryPage';
import { ReportExportPage } from './features/command-center/pages/ReportExportPage';
import { DrilldownAuditLogPage } from './features/command-center/pages/DrilldownAuditLogPage';

// MVP 10 Feature Views (Advanced AI Layer & Decision Intelligence)
import { PopulationForecastPage } from './features/ai-intelligence/pages/PopulationForecastPage';
import { ClinicalCopilotPage } from './features/ai-intelligence/pages/ClinicalCopilotPage';
import { AdaptiveNudgePage } from './features/ai-intelligence/pages/AdaptiveNudgePage';
import { RouteOptimizerPage } from './features/ai-intelligence/pages/RouteOptimizerPage';
import { AIGovernanceAuditPage } from './features/ai-intelligence/pages/AIGovernanceAuditPage';
import { PredictiveDropoutPage } from './features/ai-intelligence/pages/PredictiveDropoutPage';
import { DigitalTwinPage } from './features/ai-intelligence/pages/DigitalTwinPage';
import { ScenarioLabPage } from './features/ai-intelligence/pages/ScenarioLabPage';
import { LearnedClusterPage } from './features/ai-intelligence/pages/LearnedClusterPage';
import { AdherenceIntelligencePage } from './features/ai-intelligence/pages/AdherenceIntelligencePage';
import { ModelPerformanceFairnessPage } from './features/ai-intelligence/pages/ModelPerformanceFairnessPage';
import { PreventionPriorityPage } from './features/ai-intelligence/pages/PreventionPriorityPage';
import { RegionalPtmForecastPage } from './features/ai-intelligence/pages/RegionalPtmForecastPage';

// Direktur RSUD Feature Views (RSUD Command Center)
import { RsudExecutivePage } from './features/rsud/pages/RsudExecutivePage';
import { RsudReferralNetworkPage } from './features/rsud/pages/RsudReferralNetworkPage';
import { RsudServiceReadinessPage } from './features/rsud/pages/RsudServiceReadinessPage';
import { RsudQualityGovernancePage } from './features/rsud/pages/RsudQualityGovernancePage';
import { RsudDataIntegrationPage } from './features/rsud/pages/RsudDataIntegrationPage';
import { RsudGovernancePage } from './features/rsud/pages/RsudGovernancePage';

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading, switchDemoUser } = useAuth();
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'AUTO' | 'KADER_MOBILE' | 'DESKTOP'>('AUTO');
  const { setOnNavigateCallback } = useTour();

  // Register navigation handler so tour can jump between screens
  useEffect(() => {
    setOnNavigateCallback((navId: string) => {
      setActiveNav(navId);
      // If navigating to desktop modules, ensure viewMode is DESKTOP
      if (navId !== 'kader-app') {
        setViewMode('DESKTOP');
      }
    });
  }, [setOnNavigateCallback]);

  // Auto-redirect if current activeNav is forbidden for the active user role
  useEffect(() => {
    if (currentUser) {
      const isAllowed = permissionService.isNavAllowed(currentUser.roleId, activeNav);
      if (!isAllowed) {
        setActiveNav(permissionService.getDefaultNavForRole(currentUser.roleId));
      }
    }
  }, [currentUser?.id, currentUser?.roleId, activeNav]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FBFA] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00201C] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#60716D]">Memuat Sesi CKG Smart Care...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // Kader role defaults to mobile app shell
  const isKader = currentUser.roleId === 'KADER';
  const shouldShowKaderApp =
    viewMode === 'KADER_MOBILE' ||
    (viewMode === 'AUTO' && (isKader || activeNav === 'kader-app'));

  if (shouldShowKaderApp) {
    return (
      <KaderAppShell
        onSwitchToDesktop={() => {
          setViewMode('DESKTOP');
          if (activeNav === 'kader-app') setActiveNav(permissionService.getDefaultNavForRole(currentUser.roleId));
        }}
      />
    );
  }

  // Citizen role (Rusli Usman / Warga) renders the standalone CitizenCompanionView directly
  const isCitizen = currentUser.roleId === 'CITIZEN';
  if (isCitizen || activeNav === 'citizen-app') {
    return (
      <CitizenCompanionView
        onExitToWebApp={async () => {
          if (isCitizen) {
            await switchDemoUser('usr-1');
          }
          setActiveNav('dashboard');
        }}
      />
    );
  }

  // Page titles and breadcrumbs map
  const pageMeta: Record<string, { title: string; breadcrumbs: string[] }> = {
    dashboard: { title: 'Beranda & Ringkasan Wilayah', breadcrumbs: ['Beranda', 'Ringkasan'] },
    'prioritas-harian': { title: 'Daftar Tugas Prioritas Hari Ini', breadcrumbs: ['Tindak Lanjut', 'Tugas Hari Ini'] },
    'care-task': { title: 'Jadwal & Batas Waktu Pelayanan', breadcrumbs: ['Tindak Lanjut', 'Jadwal Pelayanan'] },
    'clinical-followup': { title: 'Pemeriksaan Dokter di Puskesmas', breadcrumbs: ['Tindak Lanjut', 'Pemeriksaan Dokter'] },
    outreach: { title: 'Catatan Menghubungi Warga', breadcrumbs: ['Tindak Lanjut', 'Catatan Kontak Warga'] },
    'penugasan-lapangan': { title: 'Pembagian Tugas Kunjungan Kader', breadcrumbs: ['Tindak Lanjut', 'Tugas Kunjungan Kader'] },
    'kader-app': { title: 'Aplikasi Lapangan Kader (Bisa Tanpa Sinyal)', breadcrumbs: ['Layanan Lapangan', 'Aplikasi Kader'] },
    'citizen-app': { title: 'Aplikasi Sahabat Warga CKG', breadcrumbs: ['Layanan Warga', 'Sahabat Warga'] },
    'jadwal-kuota': { title: 'Jadwal Pelayanan Puskesmas', breadcrumbs: ['Tindak Lanjut', 'Jadwal Pelayanan'] },
    'kandidat-putus': { title: 'Daftar Warga Belum Kontrol Ulang', breadcrumbs: ['Tindak Lanjut', 'Warga Belum Kontrol'] },
    'beban-kerja': { title: 'Pembagian Beban Kerja Petugas', breadcrumbs: ['Tindak Lanjut', 'Beban Kerja'] },
    'outreach-config': { title: 'Pengaturan Pesan Pengingat Warga', breadcrumbs: ['Tindak Lanjut', 'Aturan Pengingat'] },
    // Pemantauan & Outcome Meta
    'pemantauan-aktif': { title: 'Pemantauan Kesehatan Pasien', breadcrumbs: ['Pemantauan', 'Siklus Pemantauan'] },
    'kontrol-harian': { title: 'Daftar Warga Kontrol Hari Ini', breadcrumbs: ['Pemantauan', 'Kontrol Hari Ini'] },
    'menunggu-evaluasi': { title: 'Evaluasi Status Kesehatan Pasien', breadcrumbs: ['Pemantauan', 'Evaluasi Pasien'] },
    'integritas-monitoring': { title: 'Audit Standar Pelayanan Puskesmas', breadcrumbs: ['Pemantauan', 'Audit Pelayanan'] },
    'kepatuhan-kendala': { title: 'Kepatuhan Minum Obat & Kendala Warga', breadcrumbs: ['Pemantauan', 'Kepatuhan Obat'] },
    'kohort-kondisi': { title: 'Kelompok Pasien Berdasarkan Penyakit', breadcrumbs: ['Pemantauan', 'Kelompok Penyakit'] },
    'tren-outcome': { title: 'Perkembangan Hasil Terapi & Kontrol', breadcrumbs: ['Pemantauan', 'Perkembangan Terapi'] },
    'risiko-putus': { title: 'Peringatan Dini Pasien Berisiko Putus Obat', breadcrumbs: ['Pemantauan', 'Cegah Putus Obat'] },
    // Dinkes Command Center Meta
    'dinkes-command-center': { title: 'Pusat Komando Dinas Kesehatan', breadcrumbs: ['Dinkes Command Center', 'Ringkasan Pimpinan'] },
    'dinkes-ringkasan': { title: 'Ringkasan Capaian Dinas Kesehatan', breadcrumbs: ['Dinkes Command Center', 'Ringkasan Wilayah'] },
    'dinkes-impact-index': { title: 'Indeks Keberhasilan & Dampak CKG', breadcrumbs: ['Dinkes Command Center', 'Indeks Dampak CKG'] },
    'dinkes-kaskade': { title: 'Alur Tindak Lanjut & Kunjungan Pasien', breadcrumbs: ['Dinkes Command Center', 'Alur Tindak Lanjut'] },
    'dinkes-wilayah': { title: 'Peta Beban Kesehatan per Desa & Kecamatan', breadcrumbs: ['Dinkes Command Center', 'Analisis Wilayah'] },
    'dinkes-gap': { title: 'Disparitas & Kesenjangan Pelayanan Faskes', breadcrumbs: ['Dinkes Command Center', 'Kesenjangan Wilayah'] },
    'dinkes-kinerja-pkm': { title: 'Kinerja Pelayanan Seluruh Puskesmas', breadcrumbs: ['Dinkes Command Center', 'Kinerja Puskesmas'] },
    'dinkes-penyebab-kendala': { title: 'Penyebab & Kendala Pasien Belum Kontrol', breadcrumbs: ['Dinkes Command Center', 'Kendala Pasien'] },
    'dinkes-intervensi-populasi': { title: 'Program & Intervensi Kesehatan Masyarakat', breadcrumbs: ['Dinkes Command Center', 'Intervensi Masyarakat'] },
    'dinkes-perbandingan-periode': { title: 'Perbandingan Capaian Antar-Bulan / Periode', breadcrumbs: ['Dinkes Command Center', 'Perbandingan Periode'] },
    'dinkes-kualitas-data': { title: 'Kualitas Data & Status Pengiriman', breadcrumbs: ['Dinkes Command Center', 'Kualitas Data'] },
    'dinkes-kepala-daerah': { title: 'Ringkasan Khusus Pimpinan Daerah', breadcrumbs: ['Dinkes Command Center', 'Laporan Pimpinan'] },
    'dinkes-laporan': { title: 'Laporan Resmi & Cetak Dokumen (PDF/Excel)', breadcrumbs: ['Dinkes Command Center', 'Cetak Laporan'] },
    'dinkes-audit-drilldown': { title: 'Penelusuran Riwayat Data', breadcrumbs: ['Dinkes Command Center', 'Penelusuran Data'] },
    // MVP 10 Meta (Advanced AI Intelligence)
    'ai-tata-kelola': { title: 'Tata Kelola & Keamanan Sistem Cerdas', breadcrumbs: ['Kecerdasan Buatan', 'Tata Kelola AI'] },
    'ai-prediksi-dropout': { title: 'Prediksi Pasien Berisiko Putus Berobat', breadcrumbs: ['Kecerdasan Buatan', 'Prediksi Putus Obat'] },
    'ai-digital-twin': { title: 'Profil Riwayat Kesehatan Terpadu Warga', breadcrumbs: ['Kecerdasan Buatan', 'Profil Kesehatan'] },
    'ai-proyeksi-beban': { title: 'Proyeksi Kebutuhan Obat & Beban 6 Bulan', breadcrumbs: ['Kecerdasan Buatan', 'Proyeksi Obat'] },
    'ai-scenario-lab': { title: 'Simulasi Dampak Anggaran & Kebijakan', breadcrumbs: ['Kecerdasan Buatan', 'Simulasi Kebijakan'] },
    'ai-klaster-populasi': { title: 'Pengelompokan Karakteristik Warga', breadcrumbs: ['Kecerdasan Buatan', 'Klaster Warga'] },
    'ai-kepatuhan-obat': { title: 'Efektivitas Obat & Kepatuhan Minum Obat', breadcrumbs: ['Kecerdasan Buatan', 'Efektivitas Terapi'] },
    'ai-kinerja-model': { title: 'Uji Akurasi & Keadilan Antar-Pulau', breadcrumbs: ['Kecerdasan Buatan', 'Uji Keadilan'] },
    'ai-prioritas-pencegahan': { title: 'Prioritas Pencegahan Dini', breadcrumbs: ['Kecerdasan Buatan', 'Pencegahan Dini'] },
    'ai-clinical-copilot': { title: 'Asisten Pendukung Keputusan Dokter', breadcrumbs: ['Kecerdasan Buatan', 'Asisten Dokter'] },
    'ai-nudge-budaya': { title: 'Panduan Edukasi & Bahasa Daerah', breadcrumbs: ['Kecerdasan Buatan', 'Edukasi Bahasa'] },
    'ai-rute-maritim': { title: 'Optimasi Rute Puskesmas Keliling Laut', breadcrumbs: ['Kecerdasan Buatan', 'Rute Pusling Laut'] },
    'future-ai': { title: 'Tren Penyakit Tidak Menular Wilayah', breadcrumbs: ['Kecerdasan Buatan', 'Tren Penyakit'] },
    registry: { title: 'Data Warga Wilayah Kerja (Registry)', breadcrumbs: ['Data Warga', 'Data Warga'] },
    'data-quality': { title: 'Perbaikan NIK & Data Belum Lengkap', breadcrumbs: ['Data Warga', 'Perbaikan Data'] },
    'duplicate-review': { title: 'Pemeriksaan & Penggabungan Data Ganda', breadcrumbs: ['Data Warga', 'Data Ganda'] },
    'import-ckg': { title: 'Unggah Berkas Pemeriksaan CKG', breadcrumbs: ['Data Warga', 'Unggah Berkas'] },
    'ingestion-monitor': { title: 'Pemantauan Data Masuk', breadcrumbs: ['Data Warga', 'Status Perekaman'] },
    'import-history': { title: 'Riwayat Unggah Berkas', breadcrumbs: ['Data Warga', 'Riwayat Berkas'] },
    'source-mapping': { title: 'Penyesuaian Kolom Excel', breadcrumbs: ['Data Warga', 'Format Kolom'] },
    stratifikasi: { title: 'Kategori Penilaian Risiko Kesehatan', breadcrumbs: ['Penilaian Risiko', 'Kategori Risiko'] },
    wilayah: { title: 'Daftar Kecamatan & Desa Binaan', breadcrumbs: ['Wilayah & Faskes', 'Kecamatan & Desa'] },
    faskes: { title: 'Daftar Fasilitas Pelayanan Kesehatan', breadcrumbs: ['Wilayah & Faskes', 'Puskesmas & RS'] },
    'future-facility': { title: 'Ketersediaan Obat & Tenaga Kesehatan', breadcrumbs: ['Wilayah & Faskes', 'Stok Obat'] },
    layanan: { title: 'Katalog Layanan & Prosedur Medis', breadcrumbs: ['Wilayah & Faskes', 'Layanan Medis'] },
    pengguna: { title: 'Daftar Akun Petugas & Kader', breadcrumbs: ['Akun & Hak Akses', 'Petugas & Kader'] },
    peran: { title: 'Hak Akses & Wewenang Pengguna', breadcrumbs: ['Akun & Hak Akses', 'Peran Pengguna'] },
    cakupan: { title: 'Penugasan Wilayah Kerja Petugas', breadcrumbs: ['Akun & Hak Akses', 'Wilayah Tugas'] },
    persetujuan: { title: 'Persetujuan Tindakan & Izin Warga (Consent)', breadcrumbs: ['Keamanan & Aturan', 'Persetujuan Warga'] },
    'versi-aturan': { title: 'Standar & Pedoman Klinis Kemenkes', breadcrumbs: ['Keamanan & Aturan', 'Pedoman Klinis'] },
    'audit-log': { title: 'Catatan Riwayat Kegiatan Sistem', breadcrumbs: ['Keamanan & Aturan', 'Riwayat Sistem'] },
    sinkronisasi: { title: 'Kirim Data (Sinkronisasi Offline)', breadcrumbs: ['Sistem', 'Kirim Data'] },
    integrasi: { title: 'Status Sambungan SATUSEHAT Kemenkes', breadcrumbs: ['Sistem', 'SATUSEHAT'] },
    pengaturan: { title: 'Pengaturan Sistem & Glosarium Medis', breadcrumbs: ['Sistem', 'Pengaturan & Glosarium'] },
    // RSUD Command Center Meta (Direktur RSUD)
    'rsud-executive': { title: 'Ringkasan Eksekutif RSUD', breadcrumbs: ['RSUD Command Center', 'Executive'] },
    'rsud-referral-network': { title: 'Referral Network RSUD', breadcrumbs: ['RSUD Command Center', 'Referral Network'] },
    'rsud-service-readiness': { title: 'Service Readiness RSUD', breadcrumbs: ['RSUD Command Center', 'Service Readiness'] },
    'rsud-quality-governance': { title: 'Quality & Safety RSUD', breadcrumbs: ['RSUD Command Center', 'Quality & Safety'] },
    'rsud-data-integration': { title: 'Data & Integrasi RSUD', breadcrumbs: ['RSUD Command Center', 'Data & Integrasi'] },
    'rsud-governance': { title: 'Governance & Audit RSUD', breadcrumbs: ['RSUD Command Center', 'Governance'] },
  };

  const currentMeta = pageMeta[activeNav] || { title: 'CKG Smart Care', breadcrumbs: ['Beranda'] };

  const renderActiveView = () => {
    // Security Guard: Verify user has authorization for activeNav
    if (currentUser && !permissionService.isNavAllowed(currentUser.roleId, activeNav)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Akses Dibatasi (Pembatasan Hak Akses)</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Peran akun Anda (<strong>{currentUser.roleName}</strong>) tidak memiliki hak akses untuk melihat modul <strong>{currentMeta.title}</strong>.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActiveNav(permissionService.getDefaultNavForRole(currentUser.roleId))}
              className="px-4 py-2 bg-[#00201C] text-white text-xs font-semibold rounded-lg hover:bg-[#00332D] transition shadow-xs cursor-pointer"
            >
              Kembali ke Menu Utama Anda
            </button>
          </div>
        </div>
      );
    }

    switch (activeNav) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveNav} />;
      case 'prioritas-harian':
        return <DailyPriorityQueuePage />;
      case 'care-task':
        return <CareTaskListPage />;
      case 'clinical-followup':
        return <ClinicalFollowUpPage />;
      case 'outreach':
        return <OutreachQueuePage />;
      case 'penugasan-lapangan':
        return <FieldAssignmentPage />;
      case 'citizen-app':
        return (
          <CitizenCompanionView
            onExitToWebApp={async () => {
              if (isCitizen) {
                await switchDemoUser('usr-1');
              }
              setActiveNav('dashboard');
            }}
          />
        );
      // MVP 8 Routes
      case 'pemantauan-aktif':
        return <ActiveMonitoringPage currentUser={currentUser} />;
      case 'kontrol-harian':
        return <TodayControlsPage currentUser={currentUser} />;
      case 'menunggu-evaluasi':
        return <AwaitingEvaluationPage currentUser={currentUser} />;
      case 'integritas-monitoring':
        return <MonitoringIntegrityPage currentUser={currentUser} />;
      case 'kepatuhan-kendala':
        return <AdherenceManagementPage currentUser={currentUser} />;
      case 'kohort-kondisi':
        return <ConditionCohortsPage currentUser={currentUser} />;
      case 'tren-outcome':
        return <OutcomeTrendsPage currentUser={currentUser} />;
      case 'risiko-putus':
        return <DropoutMonitoringPage currentUser={currentUser} />;

      // MVP 9 Routes (Dinkes Command Center)
      case 'dinkes-command-center':
        return <CommandCenterOverviewPage onNavigate={setActiveNav} />;
      case 'dinkes-ringkasan':
        return <CountySummaryPage onNavigate={setActiveNav} />;
      case 'dinkes-impact-index':
        return <ImpactIndexPage />;
      case 'dinkes-kaskade':
        return <CascadePage />;
      case 'dinkes-wilayah':
        return <AreaAnalysisPage />;
      case 'dinkes-gap':
        return <FollowUpGapPage />;
      case 'dinkes-kinerja-pkm':
        return <FacilityPerformancePage />;
      case 'dinkes-penyebab-kendala':
        return <BarrierDistributionPage />;
      case 'dinkes-intervensi-populasi':
        return <PopulationInterventionPage />;
      case 'dinkes-perbandingan-periode':
        return <PeriodComparisonPage />;
      case 'dinkes-kualitas-data':
        return <DataQualityIntegrasiPage />;
      case 'dinkes-kepala-daerah':
        return <ExecutiveSummaryPage onNavigate={setActiveNav} />;
      case 'dinkes-laporan':
        return <ReportExportPage />;
      case 'dinkes-audit-drilldown':
        return <DrilldownAuditLogPage />;

      // MVP 10 Routes (Advanced AI & Decision Intelligence)
      case 'ai-tata-kelola':
        return <AIGovernanceAuditPage />;
      case 'ai-prediksi-dropout':
        return <PredictiveDropoutPage />;
      case 'ai-digital-twin':
        return <DigitalTwinPage />;
      case 'ai-proyeksi-beban':
        return <PopulationForecastPage />;
      case 'ai-scenario-lab':
        return <ScenarioLabPage />;
      case 'ai-klaster-populasi':
        return <LearnedClusterPage />;
      case 'ai-kepatuhan-obat':
        return <AdherenceIntelligencePage />;
      case 'ai-kinerja-model':
        return <ModelPerformanceFairnessPage />;
      case 'ai-prioritas-pencegahan':
        return <PreventionPriorityPage />;
      case 'ai-clinical-copilot':
        return <ClinicalCopilotPage />;
      case 'ai-nudge-budaya':
        return <AdaptiveNudgePage />;
      case 'ai-rute-maritim':
        return <RouteOptimizerPage />;
      case 'future-ai':
        return <RegionalPtmForecastPage />;

      case 'jadwal-kuota':
        return <AppointmentSchedulePage />;
      case 'kandidat-putus':
        return <DropoutCandidatePage />;
      case 'beban-kerja':
        return <WorkloadOverviewPage />;
      case 'outreach-config':
        return <OutreachConfigPage />;
      case 'registry':
        return <RegistryPage onNavigate={setActiveNav} />;
      case 'data-quality':
        return <DataQualityPage />;
      case 'duplicate-review':
        return <DuplicateReviewPage />;
      case 'import-ckg':
        return <ImportCkgPage onNavigate={setActiveNav} />;
      case 'ingestion-monitor':
        return <IngestionMonitorPage />;
      case 'import-history':
        return <ImportHistoryPage onNavigate={setActiveNav} />;
      case 'source-mapping':
        return <SourceMappingPage />;
      case 'stratifikasi':
        return <StratificationRegistryView />;
      case 'wilayah':
        return <WilayahPage />;
      case 'faskes':
        return <FacilityPage />;
      case 'future-facility':
        return <FacilityLogisticsPage />;
      case 'layanan':
        return <ServicePage />;
      case 'pengguna':
        return <UsersPage />;
      case 'peran':
        return <RolesPage />;
      case 'cakupan':
        return <CakupanWilayahPage />;
      case 'persetujuan':
        return <ConsentPage />;
      case 'versi-aturan':
        return <RuleVersionPage />;
      case 'audit-log':
        return <AuditLogPage />;
      case 'sinkronisasi':
        return <SyncPage />;
      case 'integrasi':
        return <IntegrasiPage />;
      case 'pengaturan':
        return <SettingsPage />;
      // RSUD Command Center Routes (Direktur RSUD)
      case 'rsud-executive':
        return <RsudExecutivePage />;
      case 'rsud-referral-network':
        return <RsudReferralNetworkPage />;
      case 'rsud-service-readiness':
        return <RsudServiceReadinessPage />;
      case 'rsud-quality-governance':
        return <RsudQualityGovernancePage />;
      case 'rsud-data-integration':
        return <RsudDataIntegrationPage />;
      case 'rsud-governance':
        return <RsudGovernancePage />;
      default:
        return <DashboardPage onNavigate={setActiveNav} />;
    }
  };

  return (
    <>
      <AppShell
        activeNav={activeNav}
        onNavigate={setActiveNav}
        pageTitle={currentMeta.title}
        breadcrumbs={currentMeta.breadcrumbs}
      >
        {renderActiveView()}
      </AppShell>
      <OnboardingTour />
      <OnboardingWelcomeBanner />
    </>
  );
};

export function App() {
  return (
    <ToastProvider>
      <NetworkProvider>
        <AuthProvider>
          <ModalProvider>
            <TourProvider>
              <MainAppContent />
            </TourProvider>
          </ModalProvider>
        </AuthProvider>
      </NetworkProvider>
    </ToastProvider>
  );
}

export default App;
