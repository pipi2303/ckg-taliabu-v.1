import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  MapPin,
  Users,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Target,
  Activity,
  Layers,
  Megaphone,
  Home,
  Ambulance,
  HeartHandshake,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Filter,
  ArrowRight,
  Lock,
  Info,
  FileSearch,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { DrilldownModal } from '../components/DrilldownModal';
import { PuskesmasWorkloadComparisonSection } from '../components/PuskesmasWorkloadComparisonSection';
import { PuskesmasDetailTrendModal } from '../components/PuskesmasDetailTrendModal';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { facilityPerformanceService } from '../../../services/facilityPerformanceService';
import { impactIndexService, ImpactIndexSummary } from '../../../services/impactIndexService';
import { classificationRepo } from '../../../repositories/classificationRepo';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import {
  commandCenterOverviewService,
  DiseaseRiskRankingItem,
  RiskFactorChip,
  KecamatanRiskProfile,
  ActionPriorityItem,
  AlertInsightItem,
  GapCategorySummary,
} from '../../../services/commandCenterOverviewService';
import { CascadeAggregation, FacilityPerformanceSummary } from '../../../types';
import { ExecutiveKPIRechartsSection } from '../../dashboard/components/ExecutiveKPIRechartsSection';

interface CommandCenterOverviewPageProps {
  onNavigate?: (navId: string) => void;
}

const RISK_LEVEL_META: Record<
  KecamatanRiskProfile['riskLevel'],
  { label: string; dot: string; badge: string }
> = {
  RENDAH: { label: 'Rendah', dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  SEDANG: { label: 'Sedang', dot: 'bg-amber-400', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  TINGGI: { label: 'Tinggi', dot: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  SANGAT_TINGGI: { label: 'Sangat Tinggi', dot: 'bg-rose-500', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  KRITIS: { label: 'Kritis', dot: 'bg-red-600', badge: 'bg-red-600/20 text-red-300 border-red-600/40' },
};

const ACTION_ICON: Record<string, React.ReactNode> = {
  OUTREACH: <Megaphone className="w-4 h-4" />,
  HOME_VISIT: <Home className="w-4 h-4" />,
  REFERRAL: <Ambulance className="w-4 h-4" />,
  FACILITY_SUPPORT: <HeartHandshake className="w-4 h-4" />,
};

const ALERT_ICON: Record<string, React.ReactNode> = {
  CRITICAL_AREAS: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  DROPOUT: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  TOP_DOMAIN: <TrendingUp className="w-4 h-4 text-sky-400" />,
  RECOMMENDATION: <Lightbulb className="w-4 h-4 text-teal-400" />,
};

export const CommandCenterOverviewPage: React.FC<CommandCenterOverviewPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [impact, setImpact] = useState<ImpactIndexSummary | null>(null);
  const [facilities, setFacilities] = useState<FacilityPerformanceSummary[]>([]);
  const [diseaseRanking, setDiseaseRanking] = useState<DiseaseRiskRankingItem[]>([]);
  const [riskChips, setRiskChips] = useState<RiskFactorChip[]>([]);
  const [kecamatanGrid, setKecamatanGrid] = useState<KecamatanRiskProfile[]>([]);
  const [actionPriorities, setActionPriorities] = useState<ActionPriorityItem[]>([]);
  const [gapSummary, setGapSummary] = useState<GapCategorySummary | null>(null);
  const [alerts, setAlerts] = useState<AlertInsightItem[]>([]);
  const [highRiskCitizenCount, setHighRiskCitizenCount] = useState<number>(0);

  const [diseaseTab, setDiseaseTab] = useState<'PRIORITY' | 'AT_RISK'>('PRIORITY');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('ALL');
  const [pkmViewMode, setPkmViewMode] = useState<'VOLUME' | 'CONTINUITY'>('VOLUME');
  const [pkmChartType, setPkmChartType] = useState<'STACKED_LINE' | 'DUMBBELL' | 'GROUPED'>('STACKED_LINE');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Governed drilldown (PC-07) — purpose-code gated + permanently audited, executive denied individual data
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(false);
  const [drilldownTitle, setDrilldownTitle] = useState<string>('');
  const [drilldownDescription, setDrilldownDescription] = useState<string>('');
  const [drilldownItems, setDrilldownItems] = useState<any[]>([]);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState<boolean>(false);
  const [selectedTrendFacilityId, setSelectedTrendFacilityId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, cascadeData, impactData, facData, diseaseData, chipsData, gridData, actionsData, gapData, classifications] =
        await Promise.all([
          populationQualificationService.getCountyCompleteness(),
          populationCascadeService.getCascadeAggregation(),
          impactIndexService.getImpactIndex(),
          facilityPerformanceService.getFacilitySummaries(),
          commandCenterOverviewService.getDiseaseRiskRanking(),
          commandCenterOverviewService.getRiskFactorChips(),
          commandCenterOverviewService.getKecamatanRiskGrid(),
          commandCenterOverviewService.getActionPriorities(),
          commandCenterOverviewService.getGapCategorySummary(),
          classificationRepo.getAll(),
        ]);

      setCompleteness(compData);
      setCascade(cascadeData);
      setImpact(impactData);
      setFacilities(facData);
      setDiseaseRanking(diseaseData);
      setRiskChips(chipsData);
      setKecamatanGrid(gridData);
      setActionPriorities(actionsData);
      setGapSummary(gapData);

      // Never smooth over incomplete data with a plausible-looking fallback number
      // (PRD-CKG 8/N §1.1) — this is a real count, including a real zero.
      const highRisk = new Set(
        classifications.filter((c) => c.finalCategory === 'RED' || c.finalCategory === 'DARK_RED' || c.isCritical).map((c) => c.citizenId)
      );
      setHighRiskCitizenCount(highRisk.size);

      // Alerts computed last since they read from several of the above services
      const alertData = await commandCenterOverviewService.getAlertInsights();
      setAlerts(alertData);
    } catch (err) {
      console.error('Failed to load command center overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isBupati = user?.roleId === 'BUPATI';

  const handleDropoutDrilldown = () => {
    setDrilldownTitle('Penelusuran: Drop-out Tindak Lanjut');
    setDrilldownDescription('Warga yang hadir di faskes namun belum tuntas menerima tata laksana (belum dalam status Dalam Tata Laksana).');
    const count = Math.max(0, (cascade?.stages[3]?.count || 0) - (cascade?.stages[5]?.count || 0));
    const sampleItems = Array.from({ length: Math.min(15, count || 3) }).map((_, i) => ({
      id: `case-dropout-${i + 1}`,
      label: `Warga ID #8208-01-00${i + 1} (Masked)`,
      subLabel: `NIK: 820801******${1000 + i}`,
      facilityName: 'Puskesmas Wilayah Terpilih',
      kecamatanName: kecamatanGrid[i % Math.max(1, kecamatanGrid.length)]?.kecamatanName || 'Taliabu Barat',
      stageOrStatus: 'Hadir, Belum Tata Laksana',
      daysStuck: (i % 6) + 2,
    }));
    setDrilldownItems(sampleItems);
    setIsDrilldownOpen(true);
  };

  const handleExportPDF = async () => {
    if (!user) return;
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(user);
      addToast('Laporan PDF Command Center berhasil diunduh', 'success');
    } catch (err) {
      addToast('Gagal menghasilkan file PDF', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(user);
      addToast('Workbook Command Center (.xlsx) berhasil diunduh', 'success');
    } catch (err) {
      addToast('Gagal menghasilkan file Excel', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading || !completeness || !cascade || !impact) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Command Center Eksekutif...</p>
      </div>
    );
  }

  const screenedCount = cascade.stages[0]?.count || 0;
  const findingCount = cascade.stages[1]?.count || 0;
  const contactedCount = cascade.stages[2]?.count || 0;
  const attendedCount = cascade.stages[3]?.count || 0;
  const onTreatmentCount = cascade.stages[5]?.count || 0;

  const criticalKecamatanCount = kecamatanGrid.filter((k) => k.riskLevel === 'KRITIS' || k.riskLevel === 'SANGAT_TINGGI').length;

  const filteredKecamatan =
    selectedKecamatanId === 'ALL' ? kecamatanGrid : kecamatanGrid.filter((k) => k.kecamatanId === selectedKecamatanId);

  // 4-stage simplified funnel (Kontak -> Tindak Lanjut -> Intervensi Selesai -> Drop-out)
  const dropoutFromFunnel = Math.max(0, attendedCount - onTreatmentCount);
  const funnelStages = [
    { label: 'Kontak', count: contactedCount, color: 'bg-teal-500' },
    { label: 'Tindak Lanjut (Hadir Faskes)', count: attendedCount, color: 'bg-sky-500' },
    { label: 'Intervensi Selesai', count: onTreatmentCount, color: 'bg-emerald-500' },
  ];
  const dropoutPct = attendedCount > 0 ? Math.round((dropoutFromFunnel / attendedCount) * 1000) / 10 : 0;

  // Donut: Penyelesaian Intervensi (of the population that needed follow-up)
  const donutBelumSelesai = Math.max(0, findingCount - attendedCount);
  const donutDalamProses = Math.max(0, attendedCount - onTreatmentCount);
  const donutSelesai = onTreatmentCount;
  const donutTotal = donutSelesai + donutDalamProses + donutBelumSelesai || 1;
  const donutSelesaiPct = Math.round((donutSelesai / donutTotal) * 1000) / 10;
  const donutProsesPct = Math.round((donutDalamProses / donutTotal) * 1000) / 10;
  const donutBelumPct = Math.round((donutBelumSelesai / donutTotal) * 1000) / 10;

  const CIRC = 2 * Math.PI * 40;
  const seg = (pct: number) => (pct / 100) * CIRC;

  const topFacilities = [...facilities].sort((a, b) => b.continuityRate - a.continuityRate).slice(0, 8);
  const maxDiseaseCount = Math.max(1, ...diseaseRanking.map((d) => (diseaseTab === 'PRIORITY' ? d.priorityCaseCount : d.atRiskCount)));

  const pkmChartData = useMemo(() => {
    return facilities.map((f) => {
      const pendingGap = Math.max(0, f.eligibleFollowUpCount - f.attendedFollowUpCount);
      const dataQuality = Math.max(0, 100 - f.manualClosureRatio);
      return {
        id: f.facilityId,
        name: f.facilityName.replace('Puskesmas ', 'PKM '),
        fullName: f.facilityName,
        kecamatan: f.kecamatanName,
        isRemote: f.isRemoteIsland,
        screened: f.screenedCount,
        attended: f.attendedFollowUpCount,
        eligible: f.eligibleFollowUpCount,
        gap: pendingGap,
        continuityRate: f.continuityRate,
        dataQuality,
        targetRate: 50,
      };
    });
  }, [facilities]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            COMMAND CENTER UNTUK PIMPINAN DAERAH
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">
              Satu Tampilan Strategis untuk Keputusan Berbasis Risiko
            </h1>
            <DocBadge code="SCR-DNK-A03" title="Command Center Eksekutif" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
            Kabupaten Pulau Taliabu · Sumber data terintegrasi: Registry CKG, Puskesmas, Rule Engine CRS v0.9. Data
            per {new Date(completeness.dataCutoffAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-700 hover:bg-teal-600 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExportingPDF ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExportingPDF ? 'Menyusun...' : 'Ekspor PDF'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExportingExcel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />}
            <span>{isExportingExcel ? 'Menyusun...' : 'Ekspor Excel'}</span>
          </button>
        </div>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* 5-Step Decision Framework Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { n: 1, label: 'WHAT', desc: 'Apa masalah kesehatan terbesar?', icon: <Search className="w-4 h-4" />, target: 'what', color: 'text-sky-700 border-sky-200 bg-sky-50/70' },
          { n: 2, label: 'WHERE', desc: 'Wilayah mana yang perlu intervensi?', icon: <MapPin className="w-4 h-4" />, target: 'where', color: 'text-emerald-700 border-emerald-200 bg-emerald-50/70' },
          { n: 3, label: 'WHO', desc: 'Kelompok mana yang paling berisiko?', icon: <Users className="w-4 h-4" />, target: 'what', color: 'text-purple-700 border-purple-200 bg-purple-50/70' },
          { n: 4, label: 'WHAT NEXT', desc: 'Tindakan apa yang diprioritaskan?', icon: <Target className="w-4 h-4" />, target: 'what-next', color: 'text-amber-700 border-amber-200 bg-amber-50/70' },
          { n: 5, label: 'DID IT WORK', desc: 'Apakah intervensi berhasil?', icon: <ShieldCheck className="w-4 h-4" />, target: 'tindak-lanjut', color: 'text-teal-700 border-teal-200 bg-teal-50/70' },
        ].map((s) => (
          <button
            key={s.n}
            onClick={() => scrollTo(s.target)}
            className={`p-3 rounded-xl border ${s.color} text-left hover:shadow-xs transition cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center text-[11px] font-bold text-stone-800 shrink-0">
                {s.n}
              </span>
              <span className={`text-xs font-extrabold tracking-wide ${s.color.split(' ')[0]}`}>{s.label}</span>
              {s.icon}
            </div>
            <p className="text-[10px] text-stone-600 mt-1 leading-snug">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Total Peserta CKG</span>
            <Users className="w-3.5 h-3.5 text-teal-700" />
          </div>
          <p className="text-xl font-bold text-stone-900 mt-1">{screenedCount.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-teal-800 mt-0.5 font-medium">8 Kecamatan Kab. Pulau Taliabu</p>
        </div>
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Populasi Berisiko</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <p className="text-xl font-bold text-stone-900 mt-1">{findingCount.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-amber-800 mt-0.5 font-medium">
            {screenedCount > 0 ? Math.round((findingCount / screenedCount) * 1000) / 10 : 0}% dari total diperiksa
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Prioritas Tinggi</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-700 mt-1">{highRiskCitizenCount.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-rose-800 mt-0.5 font-medium">Kategori Merah / Kritis</p>
        </div>
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Tindak Lanjut (Level 2)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <p className="text-xl font-bold text-stone-900 mt-1">{impact.level2Continuity.percentage ?? 0}%</p>
          <p className="text-[10px] text-sky-800 mt-0.5 font-medium">
            {(impact.level2Continuity.numerator ?? 0).toLocaleString('id-ID')} dari {(impact.level2Continuity.denominator ?? 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Outcome Terkendali (Level 3)</span>
            <Lock className="w-3.5 h-3.5 text-stone-500" />
          </div>
          <p className="text-sm font-bold text-stone-800 mt-1">Belum Dapat Dinilai</p>
          <p className="text-[10px] text-stone-500 mt-0.5">Tata Kelola OI-08 Terkunci</p>
        </div>
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
          <div className="text-[11px] text-stone-600 font-semibold flex items-center justify-between">
            <span>Kecamatan Risiko Tinggi</span>
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-orange-700 mt-1">{criticalKecamatanCount} / {kecamatanGrid.length}</p>
          <p className="text-[10px] text-orange-800 mt-0.5 font-medium">Kategori Sangat Tinggi / Kritis</p>
        </div>
      </div>

      {/* Visualisasi 6 KPI Strategis Recharts (Grafik Batang & Grafik Area) */}
      <ExecutiveKPIRechartsSection
        theme="light"
        title="Visualisasi Recharts 6 KPI Strategis Dinas Kesehatan"
        subtitle="Komparasi capaian 8 Puskesmas (Grafik Batang) dan tren longitudinal 6 bulan (Grafik Area) untuk Total Warga Diperiksa, Sudah Ditangani, Penurunan Risiko, Puskesmas Capai Target, Kesenjangan Rujukan, serta Kondisi Kesehatan Terkontrol."
        docBadgeCode="SCR-DNK-A03-RECHARTS"
        onNavigate={onNavigate}
      />

      {/* Filter Wilayah Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-teal-700" /> Filter Wilayah Fokus:
          </span>
          <select
            value={selectedKecamatanId}
            onChange={(e) => setSelectedKecamatanId(e.target.value)}
            className="bg-white border border-stone-300 text-xs text-stone-900 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer shadow-2xs font-medium"
          >
            <option value="ALL">Semua Kecamatan (8 Wilayah)</option>
            {kecamatanGrid.map((k) => (
              <option key={k.kecamatanId} value={k.kecamatanId}>
                {k.kecamatanName} ({k.puskesmasName})
              </option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-stone-600">Menyesuaikan tampilan distribusi risiko dan prioritas wilayah secara real-time.</span>
      </div>

      {/* Row 1: Peta (Where) | Penyakit & Faktor Risiko (What) | Prioritas Tindakan + Alert (What Next / Did It Work) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Peta Persebaran Risiko */}
        <div
          id="where"
          className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 scroll-mt-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                    Peta Persebaran Risiko
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Grid status risiko per kecamatan (8 Puskesmas).
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                WHERE
              </span>
            </div>

            <div className="space-y-2 max-h-[330px] overflow-y-auto pr-1">
              {filteredKecamatan.map((k) => {
                const meta = RISK_LEVEL_META[k.riskLevel];
                return (
                  <button
                    key={k.kecamatanId}
                    onClick={() => onNavigate?.('dinkes-wilayah')}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-500/50 hover:bg-stone-50 transition flex items-center justify-between text-left cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{k.kecamatanName}</p>
                        <p className="text-[10px] text-stone-600 truncate flex items-center gap-1">
                          {k.puskesmasName}
                          {k.burdenSuppressed && (
                            <span className="flex items-center gap-0.5 text-amber-700" title="Angka beban disembunyikan (DS-OI-06, populasi kecil)">
                              <Lock className="w-2.5 h-2.5" /> {k.burdenDisplayValue}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(RISK_LEVEL_META) as KecamatanRiskProfile['riskLevel'][]).map((lvl) => (
                <span key={lvl} className="flex items-center gap-1 text-[10px] text-stone-600 font-medium">
                  <span className={`w-2 h-2 rounded-full ${RISK_LEVEL_META[lvl].dot}`} />
                  {RISK_LEVEL_META[lvl].label}
                </span>
              ))}
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dinkes-wilayah')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                Analisis Wilayah <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Penyakit & Faktor Risiko Dominan */}
        <div
          id="what"
          className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 scroll-mt-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800 border border-sky-200">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                    Penyakit & Faktor Risiko
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Stratifikasi beban domain klinis aktif CRS-CKG.
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-[10px] border border-stone-300">
                <button
                  onClick={() => setDiseaseTab('PRIORITY')}
                  className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                    diseaseTab === 'PRIORITY' ? 'bg-teal-700 text-white shadow-2xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Prioritas
                </button>
                <button
                  onClick={() => setDiseaseTab('AT_RISK')}
                  className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                    diseaseTab === 'AT_RISK' ? 'bg-teal-700 text-white shadow-2xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Berisiko
                </button>
              </div>
            </div>

            {/* Horizontal Bar Visualizer */}
            <div className="space-y-2.5">
              {diseaseRanking.map((d, idx) => {
                const count = diseaseTab === 'PRIORITY' ? d.priorityCaseCount : d.atRiskCount;
                const pct = diseaseTab === 'PRIORITY' ? d.priorityCasePercentage : d.atRiskPercentage;
                const widthPct = Math.max(4, (count / maxDiseaseCount) * 100);
                return (
                  <div key={d.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-800 font-semibold flex items-center gap-1.5">
                        <span className="text-stone-500 font-mono text-[11px]">{idx + 1}.</span> {d.label}
                      </span>
                      <span className="text-stone-950 font-bold font-mono">
                        {count.toLocaleString('id-ID')} <span className="text-stone-600 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-sky-600'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk Factor Chips */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                Faktor Risiko Dominan (% Populasi Berisiko)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {riskChips.map((c) => (
                  <div key={c.code} className="p-2 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
                    <p className="text-xs font-extrabold text-teal-800">{c.percentage}%</p>
                    <p className="text-[9px] text-stone-700 truncate mt-0.5 font-medium">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <p className="text-[10px] text-stone-600 leading-relaxed flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-700" />
              Domain aktif: Hipertensi, Diabetes Melitus, Gizi/Obesitas, dan Perilaku Merokok.
            </p>
          </div>
        </div>

        {/* Card 3: Prioritas Tindakan & Sinyal Alert */}
        <div
          id="what-next"
          className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4 scroll-mt-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                    Prioritas Tindakan & Alert
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Intervensi mendesak & sinyal mitigasi dini.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                WHAT NEXT
              </span>
            </div>

            {/* Action Priorities List */}
            <div className="space-y-2">
              {actionPriorities.map((a) => {
                const target = a.code === 'REFERRAL' ? 'dinkes-gap' : a.code === 'FACILITY_SUPPORT' ? 'dinkes-kinerja-pkm' : 'dinkes-penyebab-kendala';
                return (
                  <div
                    key={a.code}
                    onClick={isBupati ? undefined : () => onNavigate?.(target)}
                    className={`w-full p-2.5 rounded-xl bg-white border border-stone-200 transition flex items-center gap-2.5 text-left shadow-2xs ${
                      isBupati ? '' : 'hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">{ACTION_ICON[a.code]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{a.label}</p>
                      <p className="text-[10px] text-stone-600 truncate">{a.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-amber-800 font-mono">{a.count}</p>
                      <p className="text-[9px] text-stone-500 font-medium">{a.unit}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Capacity vs Access Gap summary */}
            {gapSummary && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-sm font-extrabold text-stone-900 font-mono">{gapSummary.capacityGapCount}</p>
                  <p className="text-[9px] text-stone-600 font-medium">Gap Kapasitas Faskes</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-sm font-extrabold text-stone-900 font-mono">{gapSummary.citizenAccessGapCount}</p>
                  <p className="text-[9px] text-stone-600 font-medium">Gap Akses Warga</p>
                </div>
              </div>
            )}

            {/* Alerts List */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200">
              {alerts.slice(0, 2).map((al) => (
                <div
                  key={al.code}
                  className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                    al.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : al.severity === 'WARNING'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    {ALERT_ICON[al.code]}
                    <span>{al.title}</span>
                  </div>
                  <p className="text-[10px] text-stone-700 leading-relaxed">{al.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-[10px] text-stone-500">Tersinkronisasi CRS Alert Dispatcher</span>
            {onNavigate && (
              <button
                onClick={() => onNavigate('dinkes-gap')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                Atasi Gap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Tindak Lanjut & Drop-out | Kinerja 8 Puskesmas | Penyelesaian Intervensi */}
      <div id="tindak-lanjut" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 scroll-mt-4">
        {/* Card 4: Funnel Tindak Lanjut & Drop-out */}
        <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800 border border-sky-200">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                    Tindak Lanjut
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Mitigasi risiko drop-out dan kesinambungan rawat.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                DID IT WORK
              </span>
            </div>

            <div className="space-y-3">
              {funnelStages.map((s, idx) => {
                const pctOfFirst = funnelStages[0].count > 0 ? Math.round((s.count / funnelStages[0].count) * 1000) / 10 : 0;
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-700 font-medium">{s.label}</span>
                      <span className="font-bold text-stone-900 font-mono">
                        {s.count.toLocaleString('id-ID')} <span className="text-stone-500 font-normal">({idx === 0 ? 100 : pctOfFirst}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${s.color}`} style={{ width: `${idx === 0 ? 100 : Math.max(4, pctOfFirst)}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-900">Drop-out (Hadir belum tuntas)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-950 font-mono">
                    {dropoutFromFunnel.toLocaleString('id-ID')} <span className="text-rose-700 font-normal">({dropoutPct}%)</span>
                  </span>
                  {!isBupati && (
                    <button
                      onClick={handleDropoutDrilldown}
                      title="Telusuri Kasus Drop-out (Tercatat pada Jejak Audit)"
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-rose-800 border border-rose-300 transition cursor-pointer shadow-2xs"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PC-03: Menunggu Konfirmasi & Kasus Keluar (Exits) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <p className="text-[10px] font-bold uppercase tracking-wider">Menunggu Konfirmasi</p>
                <p className="text-sm font-extrabold text-amber-950 mt-0.5 font-mono">{cascade.awaitingConfirmationCount.toLocaleString('id-ID')}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Kasus Keluar (Exits)</p>
                <p className="text-sm font-extrabold text-stone-950 mt-0.5 font-mono">{cascade.exits.totalExits.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <p className="text-[10px] text-stone-500">
              Exits: {cascade.exits.lostToFollowUp} LTFU · {cascade.exits.refused} Menolak · {cascade.exits.moved} Pindah · {cascade.exits.deceased} Meninggal (Target &lt;20%)
            </p>
          </div>
        </div>

        {/* Card 5: Grafik Komparasi Beban Skrining, Warga Ditangani & Kesenjangan Kasus Per Puskesmas */}
        <div className="lg:col-span-2">
          <PuskesmasWorkloadComparisonSection
            facilities={facilities}
            onFacilityClick={(facilityId) => {
              setSelectedTrendFacilityId(facilityId);
              setIsTrendModalOpen(true);
            }}
          />
        </div>

        {/* Card 6: Penyelesaian Intervensi Donut */}
        <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                    Penyelesaian Intervensi
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Hasil tata laksana populasi berisiko.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                OUTCOME
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="14"
                    strokeDasharray={`${seg(donutSelesaiPct)} ${CIRC}`} strokeLinecap="round"
                  />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" strokeWidth="14"
                    strokeDasharray={`${seg(donutProsesPct)} ${CIRC}`}
                    strokeDashoffset={-seg(donutSelesaiPct)} strokeLinecap="round"
                  />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="14"
                    strokeDasharray={`${seg(donutBelumPct)} ${CIRC}`}
                    strokeDashoffset={-seg(donutSelesaiPct + donutProsesPct)} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-stone-950 font-mono">{donutSelesaiPct}%</span>
                  <span className="text-[9px] text-stone-600 font-semibold">Tuntas</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs flex-1 w-full">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Selesai
                  </span>
                  <span className="font-bold text-stone-950 font-mono">{donutSelesai.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-stone-400" /> Proses
                  </span>
                  <span className="font-bold text-stone-950 font-mono">{donutDalamProses.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-900 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-600" /> Belum
                  </span>
                  <span className="font-bold text-stone-950 font-mono">{donutBelumSelesai.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="text-[10px]">Populasi Perlu Intervensi: {findingCount.toLocaleString('id-ID')} Warga</span>
            {onNavigate && (
              <button onClick={() => onNavigate('tren-outcome')} className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer">
                Tren Outcome <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Governed Drilldown Modal (PC-07) */}
      <DrilldownModal
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        title={drilldownTitle}
        contextDescription={drilldownDescription}
        currentUser={user}
        items={drilldownItems}
      />

      {/* Global Puskesmas Detail Trend Modal */}
      <PuskesmasDetailTrendModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        initialFacilityId={selectedTrendFacilityId}
        facilities={facilities}
      />
    </div>
  );
};
