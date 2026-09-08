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
import { DashboardPustuPage } from './features/dashboard/DashboardPustuPage';
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

// Consolidated Executive Unified Pages for Kadinkes
import { CascadeImpactUnifiedPage } from './features/command-center/pages/CascadeImpactUnifiedPage';
import { AreaDisparityUnifiedPage } from './features/command-center/pages/AreaDisparityUnifiedPage';
import { FacilityBarrierUnifiedPage } from './features/command-center/pages/FacilityBarrierUnifiedPage';
import { TrendReportUnifiedPage } from './features/command-center/pages/TrendReportUnifiedPage';
import { DirectoryFacilityUnifiedPage } from './features/command-center/pages/DirectoryFacilityUnifiedPage';

// Consolidated Manajerial Unified Pages for Kepala Puskesmas
import { PuskesmasBenchmarkUnifiedPage } from './features/puskesmas-unified/PuskesmasBenchmarkUnifiedPage';
import { StaffFieldUnifiedPage } from './features/puskesmas-unified/StaffFieldUnifiedPage';
import { DailyClinicalUnifiedPage } from './features/puskesmas-unified/DailyClinicalUnifiedPage';
import { CohortRegistryUnifiedPage } from './features/puskesmas-unified/CohortRegistryUnifiedPage';
import { DropoutInterventionUnifiedPage } from './features/puskesmas-unified/DropoutInterventionUnifiedPage';
import { AILogisticsMaritimeUnifiedPage } from './features/puskesmas-unified/AILogisticsMaritimeUnifiedPage';
import { AIClinicalPrescriptionUnifiedPage } from './features/puskesmas-unified/AIClinicalPrescriptionUnifiedPage';

// Consolidated Clinical Unified Pages for Dokter Puskesmas
import { DoctorEncounterUnifiedPage } from './features/doctor-unified/DoctorEncounterUnifiedPage';
import { DoctorCohortUnifiedPage } from './features/doctor-unified/DoctorCohortUnifiedPage';
import { DoctorMonitoringUnifiedPage } from './features/doctor-unified/DoctorMonitoringUnifiedPage';
import { DoctorDropoutUnifiedPage } from './features/doctor-unified/DoctorDropoutUnifiedPage';
import { DoctorAIIntelligenceUnifiedPage } from './features/doctor-unified/DoctorAIIntelligenceUnifiedPage';

// Consolidated Pustu Unified Pages for Petugas Pustu (Desa)
import { PustuDailyEncounterUnifiedPage } from './features/pustu-unified/PustuDailyEncounterUnifiedPage';
import { PustuKaderCoordinationUnifiedPage } from './features/pustu-unified/PustuKaderCoordinationUnifiedPage';
import { PustuMonitoringUnifiedPage } from './features/pustu-unified/PustuMonitoringUnifiedPage';
import { PustuDropoutUnifiedPage } from './features/pustu-unified/PustuDropoutUnifiedPage';
import { PustuCohortUnifiedPage } from './features/pustu-unified/PustuCohortUnifiedPage';
import { PustuTerritoryUnifiedPage } from './features/pustu-unified/PustuTerritoryUnifiedPage';
import { PustuSupportUnifiedPage } from './features/pustu-unified/PustuSupportUnifiedPage';

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
    'prioritas-harian': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Antrean & Tugas Harian Pustu' : (currentUser?.roleId === 'DOCTOR' ? 'Antrean & Pemeriksaan Pasien Hari Ini' : 'Daftar Tugas Prioritas Hari Ini'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pelayanan Pustu', 'Antrean & Care Task'] : (currentUser?.roleId === 'DOCTOR' ? ['Pelayanan Poli', 'Antrean & Pemeriksaan'] : ['Tindak Lanjut', 'Tugas Hari Ini']) 
    },
    'care-task': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Antrean & Tugas Harian Pustu' : (currentUser?.roleId === 'DOCTOR' ? 'Antrean & Pemeriksaan Pasien Hari Ini' : 'Jadwal & Batas Waktu Pelayanan'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pelayanan Pustu', 'Care Task SLA'] : (currentUser?.roleId === 'DOCTOR' ? ['Pelayanan Poli', 'Care Task & SLA'] : ['Tindak Lanjut', 'Jadwal Pelayanan']) 
    },
    'clinical-followup': { 
      title: currentUser?.roleId === 'DOCTOR' ? 'Antrean & Pemeriksaan Pasien Hari Ini' : 'Pemeriksaan Dokter di Puskesmas', 
      breadcrumbs: currentUser?.roleId === 'DOCTOR' ? ['Pelayanan Poli', 'Pemeriksaan Dokter'] : ['Tindak Lanjut', 'Pemeriksaan Dokter'] 
    },
    outreach: { 
      title: currentUser?.roleId === 'PUSTU' ? 'Koordinasi Kader & Kunjungan Lapangan' : 'Catatan Menghubungi Warga', 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kader & Kunjungan', 'Catatan Kontak Warga'] : ['Tindak Lanjut', 'Catatan Kontak Warga'] 
    },
    'penugasan-lapangan': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Koordinasi Kader & Kunjungan Lapangan' : 'Pembagian Tugas Kunjungan Kader', 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kader & Kunjungan', 'Tugas Kunjungan Kader'] : ['Tindak Lanjut', 'Tugas Kunjungan Kader'] 
    },
    'kader-app': { title: 'Aplikasi Lapangan Kader (Bisa Tanpa Sinyal)', breadcrumbs: ['Layanan Lapangan', 'Aplikasi Kader'] },
    'citizen-app': { title: 'Aplikasi Sahabat Warga CKG', breadcrumbs: ['Layanan Warga', 'Sahabat Warga'] },
    'jadwal-kuota': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Jadwal & Kuota Layanan' : (currentUser?.roleId === 'DOCTOR' ? 'Jadwal & Kuota Layanan Poli' : 'Jadwal Pelayanan Puskesmas'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pelayanan Pustu', 'Jadwal & Kuota'] : (currentUser?.roleId === 'DOCTOR' ? ['Pelayanan Poli', 'Jadwal & Kuota'] : ['Tindak Lanjut', 'Jadwal Pelayanan']) 
    },
    'kandidat-putus': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Pencegahan Pasien Mangkir & Kendala Obat' : (currentUser?.roleId === 'DOCTOR' ? 'Pencegahan Pasien Mangkir & Drop-Out' : 'Daftar Warga Belum Kontrol Ulang'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pencegahan Mangkir', 'Warga Belum Kontrol'] : (currentUser?.roleId === 'DOCTOR' ? ['Early Warning', 'Pencegahan Mangkir'] : ['Tindak Lanjut', 'Warga Belum Kontrol']) 
    },
    'beban-kerja': { title: 'Pembagian Beban Kerja Petugas', breadcrumbs: ['Tindak Lanjut', 'Beban Kerja'] },
    'outreach-config': { title: 'Pengaturan Pesan Pengingat Warga', breadcrumbs: ['Tindak Lanjut', 'Aturan Pengingat'] },
    // Pemantauan & Outcome Meta
    'pemantauan-aktif': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Siklus Kontrol & Evaluasi Pasien' : (currentUser?.roleId === 'DOCTOR' ? 'Siklus Pemantauan & Evaluasi Terapi' : 'Pemantauan Kesehatan Pasien'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kontrol Kronis', 'Siklus Pemantauan'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Siklus Pemantauan'] : ['Pemantauan', 'Siklus Pemantauan']) 
    },
    'kontrol-harian': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Siklus Kontrol & Evaluasi Pasien' : (currentUser?.roleId === 'DOCTOR' ? 'Siklus Pemantauan & Evaluasi Terapi' : 'Daftar Warga Kontrol Hari Ini'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kontrol Kronis', 'Kontrol Hari Ini'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Kontrol Hari Ini'] : ['Pemantauan', 'Kontrol Hari Ini']) 
    },
    'menunggu-evaluasi': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Siklus Kontrol & Evaluasi Pasien' : (currentUser?.roleId === 'DOCTOR' ? 'Siklus Pemantauan & Evaluasi Terapi' : 'Evaluasi Status Kesehatan Pasien'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kontrol Kronis', 'Evaluasi Terkendali'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Evaluasi Terkendali'] : ['Pemantauan', 'Evaluasi Pasien']) 
    },
    'integritas-monitoring': { title: 'Audit Standar Pelayanan Puskesmas', breadcrumbs: ['Pemantauan', 'Audit Pelayanan'] },
    'kepatuhan-kendala': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Pencegahan Pasien Mangkir & Kendala Obat' : (currentUser?.roleId === 'DOCTOR' ? 'Pencegahan Pasien Mangkir & Drop-Out' : 'Kepatuhan Minum Obat & Kendala Warga'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pencegahan Mangkir', 'Hambatan Obat'] : (currentUser?.roleId === 'DOCTOR' ? ['Early Warning', 'Hambatan Obat'] : ['Pemantauan', 'Kepatuhan Obat']) 
    },
    'kohort-kondisi': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Registri Warga & Kohort Desa' : (currentUser?.roleId === 'DOCTOR' ? 'Registri Pasien & Kohort PTM' : 'Kelompok Pasien Berdasarkan Penyakit'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Data Warga Desa', 'Kelompok Penyakit'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Kelompok Penyakit'] : ['Pemantauan', 'Kelompok Penyakit']) 
    },
    'tren-outcome': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Siklus Kontrol & Evaluasi Pasien' : (currentUser?.roleId === 'DOCTOR' ? 'Siklus Pemantauan & Evaluasi Terapi' : 'Perkembangan Hasil Terapi & Kontrol'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Kontrol Kronis', 'Tren Hasil Terapi'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Perkembangan Terapi'] : ['Pemantauan', 'Perkembangan Terapi']) 
    },
    'risiko-putus': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Pencegahan Pasien Mangkir & Kendala Obat' : (currentUser?.roleId === 'DOCTOR' ? 'Pencegahan Pasien Mangkir & Drop-Out' : 'Peringatan Dini Pasien Berisiko Putus Obat'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pencegahan Mangkir', 'Peringatan Dini Putus'] : (currentUser?.roleId === 'DOCTOR' ? ['Early Warning', 'Peringatan Dini Putus'] : ['Pemantauan', 'Cegah Putus Obat']) 
    },
    // Dinkes Command Center Meta
    'dinkes-command-center': { title: 'Pusat Komando Dinas Kesehatan', breadcrumbs: ['Dinkes Command Center', 'Ringkasan Pimpinan'] },
    'dinkes-ringkasan': { title: 'Ringkasan Capaian Dinas Kesehatan', breadcrumbs: ['Dinkes Command Center', 'Ringkasan Wilayah'] },
    'dinkes-impact-index': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Kaskade Layanan & CKG Impact Index' : 'Indeks Keberhasilan & Dampak CKG', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Kaskade & Dampak' : 'Indeks Dampak CKG'] 
    },
    'dinkes-kaskade': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Kaskade Layanan & CKG Impact Index' : 'Alur Tindak Lanjut & Kunjungan Pasien', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Kaskade & Dampak' : 'Alur Tindak Lanjut'] 
    },
    'dinkes-wilayah': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Analisis Wilayah & Disparitas Akses' : 'Peta Beban Kesehatan per Desa & Kecamatan', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Wilayah & Disparitas' : 'Analisis Wilayah'] 
    },
    'dinkes-gap': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Analisis Wilayah & Disparitas Akses' : 'Disparitas & Kesenjangan Pelayanan Faskes', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Wilayah & Disparitas' : 'Kesenjangan Wilayah'] 
    },
    'dinkes-kinerja-pkm': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Kinerja & Kendala 8 Puskesmas' : 'Kinerja Pelayanan Seluruh Puskesmas', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Kinerja & Kendala Puskesmas' : 'Kinerja Puskesmas'] 
    },
    'dinkes-penyebab-kendala': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Kinerja & Kendala 8 Puskesmas' : 'Penyebab & Kendala Pasien Belum Kontrol', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Kinerja & Kendala Puskesmas' : 'Kendala Pasien'] 
    },
    'dinkes-intervensi-populasi': { title: 'Program & Intervensi Kesehatan Masyarakat', breadcrumbs: ['Dinkes Command Center', 'Intervensi Masyarakat'] },
    'dinkes-perbandingan-periode': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Tren Strategis & Pelaporan Eksekutif' : 'Perbandingan Capaian Antar-Bulan / Periode', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Tren & Pelaporan' : 'Perbandingan Periode'] 
    },
    'dinkes-kualitas-data': { title: 'Kualitas Data & Status Pengiriman', breadcrumbs: ['Dinkes Command Center', 'Kualitas Data'] },
    'dinkes-kepala-daerah': { title: 'Ringkasan Khusus Pimpinan Daerah', breadcrumbs: ['Dinkes Command Center', 'Laporan Pimpinan'] },
    'dinkes-laporan': { 
      title: currentUser?.roleId === 'KEPALA_DINAS' ? 'Tren Strategis & Pelaporan Eksekutif' : 'Laporan Resmi & Cetak Dokumen (PDF/Excel)', 
      breadcrumbs: ['Pusat Komando Dinkes', currentUser?.roleId === 'KEPALA_DINAS' ? 'Tren & Pelaporan' : 'Cetak Laporan'] 
    },
    'dinkes-audit-drilldown': { title: 'Penelusuran Riwayat Data', breadcrumbs: ['Dinkes Command Center', 'Penelusuran Data'] },
    // MVP 10 Meta (Advanced AI Intelligence)
    'ai-tata-kelola': { title: 'Tata Kelola & Keamanan Sistem Cerdas', breadcrumbs: ['Kecerdasan Buatan', 'Tata Kelola AI'] },
    'ai-prediksi-dropout': { 
      title: currentUser?.roleId === 'DOCTOR' ? 'Pencegahan Pasien Mangkir & Drop-Out' : 'Prediksi Pasien Berisiko Putus Berobat', 
      breadcrumbs: currentUser?.roleId === 'DOCTOR' ? ['Early Warning', 'Prediksi Mangkir AI'] : ['Kecerdasan Buatan', 'Prediksi Putus Obat'] 
    },
    'ai-digital-twin': { 
      title: currentUser?.roleId === 'DOCTOR' ? 'Clinical Copilot & Digital Twin Warga' : 'Profil Riwayat Kesehatan Terpadu Warga', 
      breadcrumbs: currentUser?.roleId === 'DOCTOR' ? ['Asistensi Klinis', 'Digital Twin Warga'] : ['Kecerdasan Buatan', 'Profil Kesehatan'] 
    },
    'ai-proyeksi-beban': { title: 'Proyeksi Kebutuhan Obat & Beban 6 Bulan', breadcrumbs: ['Kecerdasan Buatan', 'Proyeksi Obat'] },
    'ai-scenario-lab': { title: 'Simulasi Dampak Anggaran & Kebijakan', breadcrumbs: ['Kecerdasan Buatan', 'Simulasi Kebijakan'] },
    'ai-klaster-populasi': { title: 'Pengelompokan Karakteristik Warga', breadcrumbs: ['Kecerdasan Buatan', 'Klaster Warga'] },
    'ai-kepatuhan-obat': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Pencegahan Pasien Mangkir & Kendala Obat' : (currentUser?.roleId === 'DOCTOR' ? 'Clinical Copilot & Digital Twin Warga' : 'Efektivitas Obat & Kepatuhan Minum Obat'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Pencegahan Mangkir', 'Efektivitas Terapi'] : (currentUser?.roleId === 'DOCTOR' ? ['Asistensi Klinis', 'Efektivitas Obat'] : ['Kecerdasan Buatan', 'Efektivitas Terapi']) 
    },
    'ai-kinerja-model': { title: 'Uji Akurasi & Keadilan Antar-Pulau', breadcrumbs: ['Kecerdasan Buatan', 'Uji Keadilan'] },
    'ai-prioritas-pencegahan': { title: 'Prioritas Pencegahan Dini', breadcrumbs: ['Kecerdasan Buatan', 'Pencegahan Dini'] },
    'ai-clinical-copilot': { 
      title: currentUser?.roleId === 'DOCTOR' ? 'Clinical Copilot & Digital Twin Warga' : 'Asisten Pendukung Keputusan Dokter', 
      breadcrumbs: currentUser?.roleId === 'DOCTOR' ? ['Asistensi Klinis', 'Clinical Copilot & Twin'] : ['Kecerdasan Buatan', 'Asisten Dokter'] 
    },
    'ai-nudge-budaya': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Panduan Lapangan & Budaya Lokal' : (currentUser?.roleId === 'DOCTOR' ? 'Clinical Copilot & Digital Twin Warga' : 'Panduan Edukasi & Bahasa Daerah'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Dukungan Lapangan', 'Edukasi Bahasa Daerah'] : (currentUser?.roleId === 'DOCTOR' ? ['Asistensi Klinis', 'Nudge Budaya'] : ['Kecerdasan Buatan', 'Edukasi Bahasa']) 
    },
    'ai-rute-maritim': { 
      title: currentUser?.roleId === 'PUSTU' ? 'Panduan Lapangan & Budaya Lokal' : 'Optimasi Rute Puskesmas Keliling Laut', 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Dukungan Lapangan', 'Rute Pusling Laut'] : ['Kecerdasan Buatan', 'Rute Pusling Laut'] 
    },
    'future-ai': { title: 'Tren Penyakit Tidak Menular Wilayah', breadcrumbs: ['Kecerdasan Buatan', 'Tren Penyakit'] },
    registry: { 
      title: currentUser?.roleId === 'PUSTU' ? 'Registri Warga & Kohort Desa' : (currentUser?.roleId === 'DOCTOR' ? 'Registri Pasien & Kohort PTM' : 'Data Warga Wilayah Kerja (Registry)'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Data Warga Desa', 'Master Data Warga'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Master Data Warga'] : ['Data Warga', 'Data Warga']) 
    },
    'data-quality': { title: 'Perbaikan NIK & Data Belum Lengkap', breadcrumbs: ['Data Warga', 'Perbaikan Data'] },
    'duplicate-review': { title: 'Pemeriksaan & Penggabungan Data Ganda', breadcrumbs: ['Data Warga', 'Data Ganda'] },
    'import-ckg': { title: 'Unggah Berkas Pemeriksaan CKG', breadcrumbs: ['Data Warga', 'Unggah Berkas'] },
    'ingestion-monitor': { title: 'Pemantauan Data Masuk', breadcrumbs: ['Data Warga', 'Status Perekaman'] },
    'import-history': { title: 'Riwayat Unggah Berkas', breadcrumbs: ['Data Warga', 'Riwayat Berkas'] },
    'source-mapping': { title: 'Penyesuaian Kolom Excel', breadcrumbs: ['Data Warga', 'Format Kolom'] },
    stratifikasi: { 
      title: currentUser?.roleId === 'PUSTU' ? 'Registri Warga & Kohort Desa' : (currentUser?.roleId === 'KEPALA_DINAS' ? 'Direktori Wilayah, Faskes & Standar Risiko' : (currentUser?.roleId === 'DOCTOR' ? 'Registri Pasien & Kohort PTM' : 'Kategori Penilaian Risiko Kesehatan')), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Data Warga Desa', 'Kategori Risiko'] : (currentUser?.roleId === 'KEPALA_DINAS' ? ['Data Referensi', 'Direktori Faskes & Risiko'] : (currentUser?.roleId === 'DOCTOR' ? ['Kohort & Kontrol', 'Kategori Risiko Kemenkes'] : ['Data Referensi', 'Kategori Risiko'])) 
    },
    wilayah: { 
      title: currentUser?.roleId === 'PUSTU' ? 'Wilayah Binaan & Jejaring Faskes' : (currentUser?.roleId === 'KEPALA_DINAS' ? 'Direktori Wilayah, Faskes & Standar Risiko' : 'Daftar Kecamatan & Desa Binaan'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Wilayah & Faskes', 'Kecamatan & Desa'] : ['Data Referensi', currentUser?.roleId === 'KEPALA_DINAS' ? 'Direktori Faskes & Risiko' : 'Kecamatan & Desa'] 
    },
    faskes: { 
      title: currentUser?.roleId === 'PUSTU' ? 'Wilayah Binaan & Jejaring Faskes' : (currentUser?.roleId === 'KEPALA_DINAS' ? 'Direktori Wilayah, Faskes & Standar Risiko' : 'Daftar Fasilitas Pelayanan Kesehatan'), 
      breadcrumbs: currentUser?.roleId === 'PUSTU' ? ['Wilayah & Faskes', 'Faskes Jejaring'] : ['Data Referensi', currentUser?.roleId === 'KEPALA_DINAS' ? 'Direktori Faskes & Risiko' : 'Puskesmas & RS'] 
    },
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
        if (currentUser?.roleId === 'PUSTU') {
          return <DashboardPustuPage onNavigate={setActiveNav} currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <PuskesmasBenchmarkUnifiedPage initialTab="ringkasan" onNavigate={setActiveNav} />;
        }
        return <DashboardPage onNavigate={setActiveNav} />;
      case 'prioritas-harian':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDailyEncounterUnifiedPage initialTab="prioritas" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorEncounterUnifiedPage initialTab="prioritas" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DailyClinicalUnifiedPage initialTab="prioritas" currentUser={currentUser} />;
        }
        return <DailyPriorityQueuePage />;
      case 'care-task':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDailyEncounterUnifiedPage initialTab="care-task" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorEncounterUnifiedPage initialTab="care-task" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DailyClinicalUnifiedPage initialTab="care-task" currentUser={currentUser} />;
        }
        return <CareTaskListPage />;
      case 'clinical-followup':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDailyEncounterUnifiedPage initialTab="care-task" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorEncounterUnifiedPage initialTab="poli" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DailyClinicalUnifiedPage initialTab="poli" currentUser={currentUser} />;
        }
        return <ClinicalFollowUpPage />;
      case 'outreach':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuKaderCoordinationUnifiedPage initialTab="outreach" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <StaffFieldUnifiedPage initialTab="outreach" />;
        }
        return <OutreachQueuePage />;
      case 'penugasan-lapangan':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuKaderCoordinationUnifiedPage initialTab="penugasan" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <StaffFieldUnifiedPage initialTab="penugasan" />;
        }
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
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuMonitoringUnifiedPage initialTab="pemantauan" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorMonitoringUnifiedPage initialTab="pemantauan" currentUser={currentUser} />;
        }
        return <ActiveMonitoringPage currentUser={currentUser} />;
      case 'kontrol-harian':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuMonitoringUnifiedPage initialTab="kontrol" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorMonitoringUnifiedPage initialTab="kontrol" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DailyClinicalUnifiedPage initialTab="kontrol" currentUser={currentUser} />;
        }
        return <TodayControlsPage currentUser={currentUser} />;
      case 'menunggu-evaluasi':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuMonitoringUnifiedPage initialTab="evaluasi" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorMonitoringUnifiedPage initialTab="evaluasi" currentUser={currentUser} />;
        }
        return <AwaitingEvaluationPage currentUser={currentUser} />;
      case 'integritas-monitoring':
        return <MonitoringIntegrityPage currentUser={currentUser} />;
      case 'kepatuhan-kendala':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDropoutUnifiedPage initialTab="kendala" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorDropoutUnifiedPage initialTab="kendala" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DropoutInterventionUnifiedPage initialTab="kendala" currentUser={currentUser} />;
        }
        return <AdherenceManagementPage currentUser={currentUser} />;
      case 'kohort-kondisi':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuCohortUnifiedPage initialTab="kohort" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorCohortUnifiedPage initialTab="kohort" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <CohortRegistryUnifiedPage initialTab="kohort" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        return <ConditionCohortsPage currentUser={currentUser} />;
      case 'tren-outcome':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuMonitoringUnifiedPage initialTab="tren" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorMonitoringUnifiedPage initialTab="tren" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <CohortRegistryUnifiedPage initialTab="outcome" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        return <OutcomeTrendsPage currentUser={currentUser} />;
      case 'risiko-putus':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDropoutUnifiedPage initialTab="risiko" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorDropoutUnifiedPage initialTab="risiko" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DropoutInterventionUnifiedPage initialTab="risiko" currentUser={currentUser} />;
        }
        return <DropoutMonitoringPage currentUser={currentUser} />;

      // MVP 9 Routes (Dinkes Command Center)
      case 'dinkes-command-center':
        return <CommandCenterOverviewPage onNavigate={setActiveNav} />;
      case 'dinkes-ringkasan':
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <PuskesmasBenchmarkUnifiedPage initialTab="benchmark" onNavigate={setActiveNav} />;
        }
        return <CountySummaryPage onNavigate={setActiveNav} />;
      case 'dinkes-impact-index':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <CascadeImpactUnifiedPage initialTab="impact" />;
        }
        return <ImpactIndexPage />;
      case 'dinkes-kaskade':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <CascadeImpactUnifiedPage initialTab="kaskade" />;
        }
        return <CascadePage />;
      case 'dinkes-wilayah':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <AreaDisparityUnifiedPage initialTab="wilayah" />;
        }
        return <AreaAnalysisPage />;
      case 'dinkes-gap':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <AreaDisparityUnifiedPage initialTab="disparitas" />;
        }
        return <FollowUpGapPage />;
      case 'dinkes-kinerja-pkm':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <FacilityBarrierUnifiedPage initialTab="kinerja" />;
        }
        return <FacilityPerformancePage />;
      case 'dinkes-penyebab-kendala':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <FacilityBarrierUnifiedPage initialTab="kendala" />;
        }
        return <BarrierDistributionPage />;
      case 'dinkes-intervensi-populasi':
        return <PopulationInterventionPage />;
      case 'dinkes-perbandingan-periode':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <TrendReportUnifiedPage initialTab="tren" />;
        }
        return <PeriodComparisonPage />;
      case 'dinkes-kualitas-data':
        return <DataQualityIntegrasiPage />;
      case 'dinkes-kepala-daerah':
        return <ExecutiveSummaryPage onNavigate={setActiveNav} />;
      case 'dinkes-laporan':
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <TrendReportUnifiedPage initialTab="laporan" />;
        }
        return <ReportExportPage />;
      case 'dinkes-audit-drilldown':
        return <DrilldownAuditLogPage />;

      // MVP 10 Routes (Advanced AI & Decision Intelligence)
      case 'ai-tata-kelola':
        return <AIGovernanceAuditPage />;
      case 'ai-prediksi-dropout':
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorDropoutUnifiedPage initialTab="ai-dropout" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AIClinicalPrescriptionUnifiedPage initialTab="dropout" />;
        }
        return <PredictiveDropoutPage />;
      case 'ai-digital-twin':
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorAIIntelligenceUnifiedPage initialTab="digital-twin" />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AIClinicalPrescriptionUnifiedPage initialTab="digital-twin" />;
        }
        return <DigitalTwinPage />;
      case 'ai-proyeksi-beban':
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AILogisticsMaritimeUnifiedPage initialTab="proyeksi" />;
        }
        return <PopulationForecastPage />;
      case 'ai-scenario-lab':
        return <ScenarioLabPage />;
      case 'ai-klaster-populasi':
        return <LearnedClusterPage />;
      case 'ai-kepatuhan-obat':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDropoutUnifiedPage initialTab="efektivitas" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorAIIntelligenceUnifiedPage initialTab="kepatuhan-obat" />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AIClinicalPrescriptionUnifiedPage initialTab="kepatuhan" />;
        }
        return <AdherenceIntelligencePage />;
      case 'ai-kinerja-model':
        return <ModelPerformanceFairnessPage />;
      case 'ai-prioritas-pencegahan':
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AIClinicalPrescriptionUnifiedPage initialTab="prioritas" />;
        }
        return <PreventionPriorityPage />;
      case 'ai-clinical-copilot':
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorAIIntelligenceUnifiedPage initialTab="copilot" />;
        }
        return <ClinicalCopilotPage />;
      case 'ai-nudge-budaya':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuSupportUnifiedPage initialTab="nudge" />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorAIIntelligenceUnifiedPage initialTab="nudge-budaya" />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AIClinicalPrescriptionUnifiedPage initialTab="nudge" />;
        }
        return <AdaptiveNudgePage />;
      case 'ai-rute-maritim':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuSupportUnifiedPage initialTab="maritim" />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <AILogisticsMaritimeUnifiedPage initialTab="maritim" />;
        }
        return <RouteOptimizerPage />;
      case 'future-ai':
        return <RegionalPtmForecastPage />;

      case 'jadwal-kuota':
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <StaffFieldUnifiedPage initialTab="jadwal" />;
        }
        return <AppointmentSchedulePage />;
      case 'kandidat-putus':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuDropoutUnifiedPage initialTab="kandidat" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorDropoutUnifiedPage initialTab="kandidat" currentUser={currentUser} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <DropoutInterventionUnifiedPage initialTab="kandidat" currentUser={currentUser} />;
        }
        return <DropoutCandidatePage />;
      case 'beban-kerja':
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <StaffFieldUnifiedPage initialTab="beban" />;
        }
        return <WorkloadOverviewPage />;
      case 'outreach-config':
        return <OutreachConfigPage />;
      case 'registry':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuCohortUnifiedPage initialTab="registry" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorCohortUnifiedPage initialTab="registry" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <CohortRegistryUnifiedPage initialTab="registry" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
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
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuCohortUnifiedPage initialTab="stratifikasi" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <DirectoryFacilityUnifiedPage initialTab="stratifikasi" />;
        }
        if (currentUser?.roleId === 'DOCTOR') {
          return <DoctorCohortUnifiedPage initialTab="stratifikasi" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        if (currentUser?.roleId === 'KEPALA_PUSKESMAS') {
          return <CohortRegistryUnifiedPage initialTab="stratifikasi" currentUser={currentUser} onNavigate={setActiveNav} />;
        }
        return <StratificationRegistryView />;
      case 'wilayah':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuTerritoryUnifiedPage initialTab="wilayah" />;
        }
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <DirectoryFacilityUnifiedPage initialTab="wilayah" />;
        }
        return <WilayahPage />;
      case 'faskes':
        if (currentUser?.roleId === 'PUSTU') {
          return <PustuTerritoryUnifiedPage initialTab="faskes" />;
        }
        if (currentUser?.roleId === 'KEPALA_DINAS') {
          return <DirectoryFacilityUnifiedPage initialTab="faskes" />;
        }
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
