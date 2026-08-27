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

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
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

  // Page titles and breadcrumbs map
  const pageMeta: Record<string, { title: string; breadcrumbs: string[] }> = {
    dashboard: { title: 'Ringkasan Platform CKG', breadcrumbs: ['Beranda', 'Dashboard'] },
    'prioritas-harian': { title: 'Prioritas Hari Ini (Daily Active Queue)', breadcrumbs: ['Care Orchestration', 'Prioritas Hari Ini'] },
    'care-task': { title: 'Care Task Registry & Eskalasi', breadcrumbs: ['Care Orchestration', 'Care Task Registry'] },
    'clinical-followup': { title: 'Layanan Klinis & Closed-Loop CKG', breadcrumbs: ['Care Orchestration', 'Layanan Klinis FKTP'] },
    outreach: { title: 'Kaskade Penjangkauan & Kontak Warga', breadcrumbs: ['Care Orchestration', 'Kaskade Outreach'] },
    'penugasan-lapangan': { title: 'Alokasi Penugasan Kader & Lapangan', breadcrumbs: ['Care Orchestration', 'Penugasan Kader'] },
    'kader-app': { title: 'Kader Field App (Offline PWA)', breadcrumbs: ['Field Operations', 'Kader Field App'] },
    'citizen-app': { title: 'Citizen Companion App — Sahabat Warga', breadcrumbs: ['Citizen Engagement', 'Sahabat Warga'] },
    // Pemantauan & Outcome Meta
    'pemantauan-aktif': { title: 'Pemantauan Aktif & Status Hasil Kontrol', breadcrumbs: ['Pemantauan & Outcome', 'Pemantauan Aktif'] },
    'kontrol-harian': { title: 'Antrean Kontrol Hari Ini', breadcrumbs: ['Pemantauan & Outcome', 'Kontrol Hari Ini'] },
    'menunggu-evaluasi': { title: 'Status & Antrean Evaluasi Hasil Kontrol', breadcrumbs: ['Pemantauan & Outcome', 'Menunggu Evaluasi'] },
    'integritas-monitoring': { title: 'Audit Integritas & Pemantauan Berkelanjutan', breadcrumbs: ['Pemantauan & Outcome', 'Integritas Sistem'] },
    'kepatuhan-kendala': { title: 'Tata Kelola Kepatuhan & Mitigasi Kendala', breadcrumbs: ['Pemantauan & Outcome', 'Kepatuhan & Kendala'] },
    'kohort-kondisi': { title: 'Kohort Kondisi Kronis & Evaluasi Agregat', breadcrumbs: ['Pemantauan & Outcome', 'Kohort Kondisi'] },
    'tren-outcome': { title: 'Tren Longitudinal Hasil Kontrol & Terapi', breadcrumbs: ['Pemantauan & Outcome', 'Tren Longitudinal'] },
    'risiko-putus': { title: 'Risiko Putus Perawatan & Re-engagement', breadcrumbs: ['Pemantauan & Outcome', 'Risiko Putus Perawatan'] },
    // Dinkes Command Center Meta
    'dinkes-command-center': { title: 'Command Center untuk Pimpinan Daerah', breadcrumbs: ['Dinkes Command Center', 'Command Center Eksekutif'] },
    'dinkes-ringkasan': { title: 'Ringkasan Eksekutif Kabupaten', breadcrumbs: ['Dinkes Command Center', 'Ringkasan Kabupaten'] },
    'dinkes-impact-index': { title: 'CKG Impact Index (Coverage, Continuity, Outcome)', breadcrumbs: ['Dinkes Command Center', 'Impact Index'] },
    'dinkes-kaskade': { title: 'Kaskade Tindak Lanjut & Drop-Off Kaskade', breadcrumbs: ['Dinkes Command Center', 'Kaskade Tindak Lanjut'] },
    'dinkes-wilayah': { title: 'Analisis Wilayah & Sebaran Beban (Kecamatan / Desa)', breadcrumbs: ['Dinkes Command Center', 'Analisis Wilayah'] },
    'dinkes-gap': { title: 'Disparitas Tindak Lanjut (Akses Warga vs Kapasitas Faskes)', breadcrumbs: ['Dinkes Command Center', 'Disparitas Tindak Lanjut'] },
    'dinkes-kinerja-pkm': { title: 'Kinerja & Kapasitas Kontekstual Puskesmas', breadcrumbs: ['Dinkes Command Center', 'Kinerja Puskesmas'] },
    'dinkes-penyebab-kendala': { title: 'Distribusi Penyebab & Kendala Terlaporkan', breadcrumbs: ['Dinkes Command Center', 'Penyebab & Kendala'] },
    'dinkes-intervensi-populasi': { title: 'Intervensi Populasi & Program Dinkes', breadcrumbs: ['Dinkes Command Center', 'Intervensi Populasi'] },
    'dinkes-perbandingan-periode': { title: 'Perbandingan Longitudinal Antar-Periode', breadcrumbs: ['Dinkes Command Center', 'Perbandingan Periode'] },
    'dinkes-kualitas-data': { title: 'Kualitas Data, Sinkronisasi & Integrasi Wilayah', breadcrumbs: ['Dinkes Command Center', 'Kualitas & Integrasi'] },
    'dinkes-kepala-daerah': { title: 'Tampilan Eksekutif Kepala Daerah (Bupati)', breadcrumbs: ['Dinkes Command Center', 'Tampilan Kepala Daerah'] },
    'dinkes-laporan': { title: 'Laporan Resmi & Generator Dokumen Eksekutif', breadcrumbs: ['Dinkes Command Center', 'Laporan & Ekspor'] },
    'dinkes-audit-drilldown': { title: 'Jejak Audit Penelusuran Data (Drilldown Log)', breadcrumbs: ['Dinkes Command Center', 'Audit Penelusuran'] },
    // MVP 10 Meta (Advanced AI Intelligence)
    'ai-tata-kelola': { title: 'Tata Kelola & Telemetri Keamanan Model AI', breadcrumbs: ['Advanced AI Layer', 'Tata Kelola & Safety AI'] },
    'ai-prediksi-dropout': { title: 'Prediksi Risiko Putus Berobat (PA-01)', breadcrumbs: ['Advanced AI Layer', 'Prediksi Putus Berobat'] },
    'ai-digital-twin': { title: 'Digital Twin & Profil Longitudinal Warga', breadcrumbs: ['Advanced AI Layer', 'Digital Twin Warga'] },
    'ai-proyeksi-beban': { title: 'Proyeksi Beban Penyakit & Kebutuhan Obat 6-Bulan (PA-08)', breadcrumbs: ['Advanced AI Layer', 'Proyeksi Beban & Obat'] },
    'ai-scenario-lab': { title: 'Laboratorium Simulasi Skenario Kebijakan Dinkes', breadcrumbs: ['Advanced AI Layer', 'Simulasi Skenario'] },
    'ai-klaster-populasi': { title: 'Klaster Pola Populasi & Kendala Akses (PA-10)', breadcrumbs: ['Advanced AI Layer', 'Klaster Populasi'] },
    'ai-kepatuhan-obat': { title: 'Sintesis Kepatuhan Obat & Efektivitas Intervensi (PRD-5)', breadcrumbs: ['Advanced AI Layer', 'Kepatuhan Obat'] },
    'ai-kinerja-model': { title: 'Kinerja, Deteksi Drift & Uji Keadilan AI', breadcrumbs: ['Advanced AI Layer', 'Kinerja & Keadilan AI'] },
    'ai-prioritas-pencegahan': { title: 'Prioritas Pencegahan Lanjut & Trajektori (PA-07)', breadcrumbs: ['Advanced AI Layer', 'Prioritas Pencegahan'] },
    'ai-clinical-copilot': { title: 'Clinical Decision Copilot & Keamanan Resep', breadcrumbs: ['Advanced AI Layer', 'Clinical Copilot'] },
    'ai-nudge-budaya': { title: 'Generator Edukasi & Nudge Budaya Warga', breadcrumbs: ['Advanced AI Layer', 'Nudge Budaya'] },
    'ai-rute-maritim': { title: 'Optimasi Rute Maritim & Beban Kerja Kader', breadcrumbs: ['Advanced AI Layer', 'Optimasi Rute Maritim'] },
    'future-ai': { title: 'Advanced AI Assistant — Tren PTM Wilayah', breadcrumbs: ['Advanced AI Layer', 'Tren PTM Wilayah'] },
    'jadwal-kuota': { title: 'Jadwal Janji Temu & Kuota Layanan', breadcrumbs: ['Care Orchestration', 'Jadwal & Kuota'] },
    'kandidat-putus': { title: 'Telaah Kandidat Putus Perawatan', breadcrumbs: ['Care Orchestration', 'Kandidat Putus'] },
    'beban-kerja': { title: 'Distribusi Beban Kerja Petugas & Kader', breadcrumbs: ['Care Orchestration', 'Beban Kerja Tim'] },
    'outreach-config': { title: 'Konfigurasi Jenjang & Pesan Kaskade', breadcrumbs: ['Care Orchestration', 'Konfigurasi Jenjang'] },
    registry: { title: 'Registry CKG — Wilayah Kerja', breadcrumbs: ['Registry & Ingestion', 'Registry CKG'] },
    'data-quality': { title: 'Antrean Data Bermasalah', breadcrumbs: ['Registry & Ingestion', 'Antrean Masalah'] },
    'duplicate-review': { title: 'Peninjauan Duplikat Identitas', breadcrumbs: ['Registry & Ingestion', 'Peninjauan Duplikat'] },
    'import-ckg': { title: 'Import Data Skrining CKG', breadcrumbs: ['Registry & Ingestion', 'Import Data CKG'] },
    'ingestion-monitor': { title: 'Ingestion & Watermark Monitor', breadcrumbs: ['Registry & Ingestion', 'Ingestion Monitor'] },
    'import-history': { title: 'Riwayat Import File CKG', breadcrumbs: ['Registry & Ingestion', 'Riwayat Import'] },
    'source-mapping': { title: 'Pemetaan Kolom Sumber (Source Mapping)', breadcrumbs: ['Registry & Ingestion', 'Pemetaan Kolom'] },
    stratifikasi: { title: 'Stratifikasi Risiko & Prioritas Triage', breadcrumbs: ['Stratifikasi & Prioritas', 'Stratifikasi & Triage'] },
    wilayah: { title: 'Master Wilayah (Kecamatan & Desa)', breadcrumbs: ['Organization', 'Wilayah'] },
    faskes: { title: 'Fasilitas Kesehatan', breadcrumbs: ['Organization', 'Fasilitas Kesehatan'] },
    'future-facility': { title: 'Alokasi Logistik Faskes', breadcrumbs: ['Organization', 'Alokasi Logistik Faskes'] },
    layanan: { title: 'Katalog Layanan & Intervensi', breadcrumbs: ['Organization', 'Layanan'] },
    pengguna: { title: 'Manajemen Pengguna', breadcrumbs: ['Access Management', 'Pengguna'] },
    peran: { title: 'Peran & Hak Akses Pengguna', breadcrumbs: ['Access Management', 'Peran & Hak Akses'] },
    cakupan: { title: 'Hierarki Cakupan Wilayah', breadcrumbs: ['Access Management', 'Cakupan Wilayah'] },
    persetujuan: { title: 'Tata Kelola Persetujuan (Consent)', breadcrumbs: ['Governance', 'Persetujuan'] },
    'versi-aturan': { title: 'Tata Kelola Versi Aturan Klinis', breadcrumbs: ['Governance', 'Versi Aturan'] },
    'audit-log': { title: 'Jejak Audit Append-Only', breadcrumbs: ['Governance', 'Jejak Audit'] },
    sinkronisasi: { title: 'Pusat Sinkronisasi & Antrian Luring', breadcrumbs: ['System', 'Sinkronisasi'] },
    integrasi: { title: 'Konektivitas & Integrasi', breadcrumbs: ['System', 'Integrasi'] },
    pengaturan: { title: 'Pengaturan Platform', breadcrumbs: ['System', 'Pengaturan'] },
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
        return <CitizenCompanionView />;
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
