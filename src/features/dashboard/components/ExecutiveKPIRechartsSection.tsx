import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Users,
  CheckCircle2,
  TrendingDown,
  Building2,
  AlertTriangle,
  HeartPulse,
  BarChart3,
  AreaChart as AreaChartIcon,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Tooltip as UiTooltip } from '../../../components/common/Tooltip';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { FacilityPerformanceSummary, CascadeAggregation } from '../../../types';
import { facilityPerformanceService } from '../../../services/facilityPerformanceService';
import { impactIndexService } from '../../../services/impactIndexService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { rawStorage, subscribeToStorage } from '../../../repositories/storage';

export interface MonthlyExecutiveKPIData {
  monthKey: string;
  monthLabel: string;
  totalScreened: number;
  totalHandled: number;
  controlledHealthCount: number;
  referralGapCount: number;
  riskReductionRate: number; // %
  controlledHealthRate: number; // %
  facilitiesMeetingTarget: number; // out of 8
  // Risk stratification stacked counts
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
}

export interface PuskesmasKPIBarData {
  facilityId: string;
  facilityName: string;
  shortName: string;
  kecamatanName: string;
  isRemoteIsland: boolean;
  totalScreened: number;
  totalHandled: number;
  referralGap: number;
  continuityRate: number; // %
  controlledRate: number; // %
  riskReductionRate: number; // %
  targetScreening: number;
  isMeetingTarget: boolean;
}

interface ExecutiveKPIRechartsSectionProps {
  onNavigate?: (navId: string) => void;
  theme?: 'light' | 'dark';
  title?: string;
  subtitle?: string;
  docBadgeCode?: string;
}

export const ExecutiveKPIRechartsSection: React.FC<ExecutiveKPIRechartsSectionProps> = ({
  onNavigate,
  theme = 'light',
  title,
  subtitle,
  docBadgeCode,
}) => {
  const isDark = theme === 'dark';
  // State for Visualization Type: 'COMBINED' | 'BAR_CHART' | 'AREA_CHART'
  const [chartType, setChartType] = useState<'COMBINED' | 'BAR_CHART' | 'AREA_CHART'>('COMBINED');

  // State for Bar Sub-View: 'VOLUME' (Warga Diperiksa vs Ditangani vs Gap) | 'RATES' (% Terkontrol vs % Penurunan Risiko)
  const [barMetricMode, setBarMetricMode] = useState<'VOLUME' | 'RATES'>('VOLUME');

  // State for Area Sub-View: 'PROGRESSION' (Tren 6 KPI) | 'RISK_STACK' (Stratifikasi Risiko Berkurang)
  const [areaMetricMode, setAreaMetricMode] = useState<'PROGRESSION' | 'RISK_STACK'>('PROGRESSION');

  // Filter Region Type: 'ALL' | 'MAINLAND' | 'REMOTE'
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'MAINLAND' | 'REMOTE'>('ALL');

  // Time Range: '3M' | '6M' | '12M'
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M'>('6M');

  // Metric Focus Highlighting (null or 1 of the 6 KPIs)
  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  // Layer Visibility Toggles
  const [visibleLayers, setVisibleLayers] = useState({
    screened: true,
    handled: true,
    controlled: true,
    gap: true,
    target: true,
  });

  // Dynamic Data States
  const [facilities, setFacilities] = useState<FacilityPerformanceSummary[]>([]);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [impactSummary, setImpactSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [storageTick, setStorageTick] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setStorageTick((prev) => prev + 1);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadData();
  }, [storageTick]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [facSummaries, cascadeData, impactData] = await Promise.all([
        facilityPerformanceService.getFacilitySummaries(),
        populationCascadeService.getCascadeAggregation(),
        impactIndexService.getImpactIndex(),
      ]);
      setFacilities(facSummaries);
      setCascade(cascadeData);
      setImpactSummary(impactData);
    } catch (err) {
      console.error('Failed loading KPI Recharts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // 1. Process 8 Puskesmas Bar Chart Dataset
  const puskesmasBarData: PuskesmasKPIBarData[] = useMemo(() => {
    const defaultFacs: PuskesmasKPIBarData[] = [
      {
        facilityId: 'faskes-1',
        facilityName: 'Puskesmas Bobong',
        shortName: 'PKM Bobong',
        kecamatanName: 'Taliabu Barat',
        isRemoteIsland: false,
        totalScreened: 310,
        totalHandled: 238,
        referralGap: 72,
        continuityRate: 62.0,
        controlledRate: 76.5,
        riskReductionRate: 22.4,
        targetScreening: 300,
        isMeetingTarget: true,
      },
      {
        facilityId: 'faskes-2',
        facilityName: 'Puskesmas Lede',
        shortName: 'PKM Lede',
        kecamatanName: 'Lede',
        isRemoteIsland: false,
        totalScreened: 145,
        totalHandled: 98,
        referralGap: 47,
        continuityRate: 57.4,
        controlledRate: 72.0,
        riskReductionRate: 19.8,
        targetScreening: 140,
        isMeetingTarget: true,
      },
      {
        facilityId: 'faskes-3',
        facilityName: 'Puskesmas Nggele',
        shortName: 'PKM Nggele',
        kecamatanName: 'Taliabu Barat Laut',
        isRemoteIsland: true,
        totalScreened: 98,
        totalHandled: 65,
        referralGap: 33,
        continuityRate: 52.2,
        controlledRate: 70.4,
        riskReductionRate: 17.5,
        targetScreening: 95,
        isMeetingTarget: true,
      },
      {
        facilityId: 'faskes-4',
        facilityName: 'Puskesmas Pencado',
        shortName: 'PKM Pencado',
        kecamatanName: 'Taliabu Selatan',
        isRemoteIsland: true,
        totalScreened: 85,
        totalHandled: 42,
        referralGap: 43,
        continuityRate: 39.0,
        controlledRate: 61.2,
        riskReductionRate: 12.0,
        targetScreening: 90,
        isMeetingTarget: false,
      },
      {
        facilityId: 'faskes-5',
        facilityName: 'Puskesmas Samuya',
        shortName: 'PKM Samuya',
        kecamatanName: 'Taliabu Timur',
        isRemoteIsland: true,
        totalScreened: 64,
        totalHandled: 39,
        referralGap: 25,
        continuityRate: 48.4,
        controlledRate: 68.0,
        riskReductionRate: 15.6,
        targetScreening: 60,
        isMeetingTarget: true,
      },
      {
        facilityId: 'faskes-6',
        facilityName: 'Puskesmas Losseng',
        shortName: 'PKM Losseng',
        kecamatanName: 'Taliabu Timur Selatan',
        isRemoteIsland: true,
        totalScreened: 45,
        totalHandled: 20,
        referralGap: 25,
        continuityRate: 35.0,
        controlledRate: 58.5,
        riskReductionRate: 10.2,
        targetScreening: 60,
        isMeetingTarget: false,
      },
      {
        facilityId: 'faskes-7',
        facilityName: 'Puskesmas Gela',
        shortName: 'PKM Gela',
        kecamatanName: 'Taliabu Utara',
        isRemoteIsland: true,
        totalScreened: 120,
        totalHandled: 78,
        referralGap: 42,
        continuityRate: 50.0,
        controlledRate: 74.2,
        riskReductionRate: 18.0,
        targetScreening: 110,
        isMeetingTarget: true,
      },
      {
        facilityId: 'faskes-8_pkm',
        facilityName: 'Puskesmas Tabona',
        shortName: 'PKM Tabona',
        kecamatanName: 'Tabona',
        isRemoteIsland: true,
        totalScreened: 75,
        totalHandled: 48,
        referralGap: 27,
        continuityRate: 50.0,
        controlledRate: 71.0,
        riskReductionRate: 16.8,
        targetScreening: 70,
        isMeetingTarget: true,
      },
    ];

    if (facilities.length === 0) {
      return defaultFacs;
    }

    return defaultFacs.map((df) => {
      const live = facilities.find((f) => f.facilityId === df.facilityId);
      if (!live) return df;

      const scr = live.screenedCount > 0 ? live.screenedCount : df.totalScreened;
      const attended = live.attendedFollowUpCount > 0 ? live.attendedFollowUpCount : Math.round(scr * 0.65);
      const gap = Math.max(0, scr - attended);
      const contRate = live.continuityRate > 0 ? live.continuityRate : df.continuityRate;

      return {
        ...df,
        facilityName: live.facilityName,
        kecamatanName: live.kecamatanName,
        isRemoteIsland: live.isRemoteIsland,
        totalScreened: scr,
        totalHandled: attended,
        referralGap: gap,
        continuityRate: contRate,
        isMeetingTarget: contRate >= 50 && scr >= df.targetScreening * 0.9,
      };
    });
  }, [facilities]);

  // Filtered Puskesmas Data based on Region selection
  const filteredPuskesmasData = useMemo(() => {
    if (regionFilter === 'MAINLAND') {
      return puskesmasBarData.filter((p) => !p.isRemoteIsland);
    }
    if (regionFilter === 'REMOTE') {
      return puskesmasBarData.filter((p) => p.isRemoteIsland);
    }
    return puskesmasBarData;
  }, [puskesmasBarData, regionFilter]);

  // 2. Process Longitudinal Monthly Area Chart Dataset (12 Months, filtered by timeRange)
  const fullMonthlyData: MonthlyExecutiveKPIData[] = [
    {
      monthKey: '2025-09',
      monthLabel: 'Sep 2025',
      totalScreened: 320,
      totalHandled: 165,
      controlledHealthCount: 110,
      referralGapCount: 155,
      riskReductionRate: 9.8,
      controlledHealthRate: 66.6,
      facilitiesMeetingTarget: 3,
      lowRiskCount: 160,
      moderateRiskCount: 95,
      highRiskCount: 52,
      criticalRiskCount: 13,
    },
    {
      monthKey: '2025-10',
      monthLabel: 'Okt 2025',
      totalScreened: 440,
      totalHandled: 245,
      controlledHealthCount: 170,
      referralGapCount: 195,
      riskReductionRate: 11.5,
      controlledHealthRate: 69.3,
      facilitiesMeetingTarget: 4,
      lowRiskCount: 225,
      moderateRiskCount: 125,
      highRiskCount: 72,
      criticalRiskCount: 18,
    },
    {
      monthKey: '2025-11',
      monthLabel: 'Nov 2025',
      totalScreened: 580,
      totalHandled: 340,
      controlledHealthCount: 240,
      referralGapCount: 240,
      riskReductionRate: 13.2,
      controlledHealthRate: 70.5,
      facilitiesMeetingTarget: 4,
      lowRiskCount: 300,
      moderateRiskCount: 165,
      highRiskCount: 92,
      criticalRiskCount: 23,
    },
    {
      monthKey: '2025-12',
      monthLabel: 'Des 2025',
      totalScreened: 710,
      totalHandled: 435,
      controlledHealthCount: 310,
      referralGapCount: 275,
      riskReductionRate: 14.8,
      controlledHealthRate: 71.2,
      facilitiesMeetingTarget: 5,
      lowRiskCount: 380,
      moderateRiskCount: 200,
      highRiskCount: 105,
      criticalRiskCount: 25,
    },
    {
      monthKey: '2026-01',
      monthLabel: 'Jan 2026',
      totalScreened: 840,
      totalHandled: 525,
      controlledHealthCount: 380,
      referralGapCount: 315,
      riskReductionRate: 16.0,
      controlledHealthRate: 72.3,
      facilitiesMeetingTarget: 5,
      lowRiskCount: 460,
      moderateRiskCount: 235,
      highRiskCount: 118,
      criticalRiskCount: 27,
    },
    {
      monthKey: '2026-02',
      monthLabel: 'Feb 2026',
      totalScreened: 942,
      totalHandled: 605,
      controlledHealthCount: 440,
      referralGapCount: 337,
      riskReductionRate: 17.1,
      controlledHealthRate: 72.7,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 525,
      moderateRiskCount: 260,
      highRiskCount: 128,
      criticalRiskCount: 29,
    },
    {
      monthKey: '2026-03',
      monthLabel: 'Mar 2026',
      totalScreened: 1020,
      totalHandled: 665,
      controlledHealthCount: 485,
      referralGapCount: 355,
      riskReductionRate: 17.5,
      controlledHealthRate: 72.9,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 575,
      moderateRiskCount: 280,
      highRiskCount: 135,
      criticalRiskCount: 30,
    },
    {
      monthKey: '2026-04',
      monthLabel: 'Apr 2026',
      totalScreened: 1090,
      totalHandled: 715,
      controlledHealthCount: 525,
      referralGapCount: 375,
      riskReductionRate: 18.0,
      controlledHealthRate: 73.4,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 620,
      moderateRiskCount: 295,
      highRiskCount: 144,
      criticalRiskCount: 31,
    },
    {
      monthKey: '2026-05',
      monthLabel: 'Mei 2026',
      totalScreened: 1140,
      totalHandled: 755,
      controlledHealthCount: 558,
      referralGapCount: 385,
      riskReductionRate: 18.2,
      controlledHealthRate: 73.9,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 655,
      moderateRiskCount: 308,
      highRiskCount: 146,
      criticalRiskCount: 31,
    },
    {
      monthKey: '2026-06',
      monthLabel: 'Jun 2026',
      totalScreened: 1185,
      totalHandled: 785,
      controlledHealthCount: 580,
      referralGapCount: 400,
      riskReductionRate: 18.3,
      controlledHealthRate: 73.8,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 685,
      moderateRiskCount: 318,
      highRiskCount: 151,
      criticalRiskCount: 31,
    },
    {
      monthKey: '2026-07',
      monthLabel: 'Jul 2026',
      totalScreened: 1220,
      totalHandled: 810,
      controlledHealthCount: 605,
      referralGapCount: 410,
      riskReductionRate: 18.4,
      controlledHealthRate: 74.6,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 710,
      moderateRiskCount: 325,
      highRiskCount: 153,
      criticalRiskCount: 32,
    },
    {
      monthKey: '2026-08',
      monthLabel: 'Agu 2026',
      totalScreened: 1250,
      totalHandled: 842,
      controlledHealthCount: 628,
      referralGapCount: 408,
      riskReductionRate: 18.4,
      controlledHealthRate: 74.5,
      facilitiesMeetingTarget: 6,
      lowRiskCount: 735,
      moderateRiskCount: 330,
      highRiskCount: 154,
      criticalRiskCount: 31,
    },
  ];

  const filteredMonthlyData = useMemo(() => {
    const sliceCount = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
    return fullMonthlyData.slice(-sliceCount);
  }, [timeRange]);

  // Overall Aggregates for the 6 KPIs
  const currentTotalScreened = puskesmasBarData.reduce((acc, curr) => acc + curr.totalScreened, 0);
  const currentTotalHandled = puskesmasBarData.reduce((acc, curr) => acc + curr.totalHandled, 0);
  const currentTotalGap = puskesmasBarData.reduce((acc, curr) => acc + curr.referralGap, 0);
  const currentRiskReduction = -18.4;
  const currentMeetingTarget = puskesmasBarData.filter((p) => p.isMeetingTarget).length;
  const currentControlledRate = 72.4;

  // Custom Chart Tooltips with Luxury High Contrast Design
  const renderBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const pkm = puskesmasBarData.find((p) => p.shortName === label || p.facilityName === label);

    return (
      <div className="bg-slate-950/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 min-w-[240px]">
        <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-emerald-400 text-sm">{pkm?.facilityName || label}</p>
            <p className="text-[10px] text-slate-400">
              Kecamatan {pkm?.kecamatanName} • {pkm?.isRemoteIsland ? 'Wilayah Maritim Terluar' : 'Daratan Utama'}
            </p>
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              pkm?.isMeetingTarget
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {pkm?.isMeetingTarget ? 'Capai Target' : 'Di Bawah Target'}
          </span>
        </div>

        {barMetricMode === 'VOLUME' ? (
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex items-center justify-between gap-3 text-slate-200">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#00332D] border border-emerald-400 inline-block" /> Total Diperiksa:
              </span>
              <span className="font-bold text-white">{pkm?.totalScreened || 0} Warga</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-emerald-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Sudah Ditangani:
              </span>
              <span className="font-bold">{pkm?.totalHandled || 0} Warga ({pkm?.continuityRate}%)</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-amber-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> Kesenjangan Rujukan:
              </span>
              <span className="font-bold">{pkm?.referralGap || 0} Kasus</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-indigo-300 border-t border-slate-800 pt-1 mt-1">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> Target Sasaran SPM:
              </span>
              <span>{pkm?.targetScreening || 0} Warga</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex items-center justify-between gap-3 text-emerald-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Kesehatan Terkontrol:
              </span>
              <span className="font-bold">{pkm?.controlledRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sky-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" /> Penurunan Risiko:
              </span>
              <span className="font-bold">-{pkm?.riskReductionRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-300 border-t border-slate-800 pt-1 mt-1">
              <span className="text-slate-400 font-sans">Tingkat Kontinuitas:</span>
              <span className="font-bold text-teal-300">{pkm?.continuityRate}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = filteredMonthlyData.find((d) => d.monthLabel === label || d.monthKey === label);

    return (
      <div className="bg-slate-950/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 min-w-[260px]">
        <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <p className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Periode {label}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            {dataPoint?.facilitiesMeetingTarget} / 8 PKM Capai Target
          </span>
        </div>

        {areaMetricMode === 'PROGRESSION' ? (
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Total Diperiksa:
              </span>
              <span className="font-bold text-white">{dataPoint?.totalScreened.toLocaleString('id-ID')} Warga</span>
            </div>
            <div className="flex items-center justify-between text-teal-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2 h-2 rounded-full bg-teal-400" /> Sudah Ditangani:
              </span>
              <span className="font-bold">{dataPoint?.totalHandled.toLocaleString('id-ID')} Warga</span>
            </div>
            <div className="flex items-center justify-between text-sky-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Kondisi Terkontrol:
              </span>
              <span className="font-bold">{dataPoint?.controlledHealthCount.toLocaleString('id-ID')} ({dataPoint?.controlledHealthRate}%)</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Kesenjangan Rujukan:
              </span>
              <span className="font-bold">{dataPoint?.referralGapCount.toLocaleString('id-ID')} Kasus</span>
            </div>
            <div className="flex items-center justify-between text-indigo-300 border-t border-slate-800 pt-1 mt-1">
              <span className="text-slate-400 font-sans">Reduksi Risiko Akut:</span>
              <span className="font-bold">-{dataPoint?.riskReductionRate}%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 font-mono">
            <p className="text-[10px] text-slate-400 font-sans mb-1">Stratifikasi Beban Risiko Populasi:</p>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5 font-sans">Risiko Rendah / Terkendali:</span>
              <span className="font-bold">{dataPoint?.lowRiskCount}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5 font-sans">Risiko Sedang:</span>
              <span className="font-bold">{dataPoint?.moderateRiskCount}</span>
            </div>
            <div className="flex items-center justify-between text-orange-400">
              <span className="flex items-center gap-1.5 font-sans">Risiko Tinggi:</span>
              <span className="font-bold">{dataPoint?.highRiskCount}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400 border-t border-slate-800 pt-1 mt-1">
              <span className="flex items-center gap-1.5 font-sans">Risiko Kritis:</span>
              <span className="font-bold">{dataPoint?.criticalRiskCount}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`p-5 rounded-2xl border shadow-xs space-y-5 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-white'
          : 'bg-white border-[#D8E5E2] text-black'
      }`}
    >
      {/* 1. Header with Mode Selectors & Filters */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-[#D8E5E2]'
        }`}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isDark
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'bg-teal-50 text-teal-800 border border-teal-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              {isDark ? 'Visualisasi Metrik Recharts Command Center' : 'Visualisasi Eksekutif Recharts'}
            </span>
            <DocBadge code={docBadgeCode || (isDark ? 'SCR-DNK-A03-VIS' : 'KPI-DNK-VIS01')} size="sm" />
          </div>
          <h2 className={`text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
            {title || 'Visualisasi Grafik Batang & Grafik Area 6 KPI Strategis Dinas Kesehatan'}
          </h2>
          <p className={`text-xs leading-relaxed max-w-4xl ${isDark ? 'text-slate-400' : 'text-[#60716D]'}`}>
            {subtitle ||
              'Instrumen analitik terpadu untuk Kepala Dinas Kesehatan: memantau cakupan skrining CKG, kontinuitas penanganan, efektivitas reduksi risiko, pencapaian target 8 Puskesmas, mitigasi kesenjangan rujukan maritim, serta status kesehatan terkontrol.'}
          </p>
        </div>

        {/* Global Controls & Chart Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Chart View Switcher */}
          <div
            className={`flex rounded-xl p-1 border text-xs font-semibold ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-[#F0F5F4] border-[#D8E5E2]'
            }`}
          >
            <UiTooltip content="Tampilkan Grafik Batang (Komparasi 8 Puskesmas) & Grafik Area (Tren Waktu) Berdampingan" position="bottom">
              <button
                type="button"
                onClick={() => setChartType('COMBINED')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartType === 'COMBINED'
                    ? isDark
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-[#00201C] text-white shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semua Grafik</span>
              </button>
            </UiTooltip>
            <UiTooltip content="Fokus Tampilan Grafik Batang: Komparasi Kinerja & Target 8 Puskesmas" position="bottom">
              <button
                type="button"
                onClick={() => setChartType('BAR_CHART')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartType === 'BAR_CHART'
                    ? isDark
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-[#00201C] text-white shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grafik Batang</span>
              </button>
            </UiTooltip>
            <UiTooltip content="Fokus Tampilan Grafik Area: Tren Pertumbuhan Longitudinal 6 KPI" position="bottom">
              <button
                type="button"
                onClick={() => setChartType('AREA_CHART')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartType === 'AREA_CHART'
                    ? isDark
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-[#00201C] text-white shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                <AreaChartIcon className="w-3.5 h-3.5" />
                <span>Grafik Area</span>
              </button>
            </UiTooltip>
          </div>

          <ActionIconButton
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            icon={<RefreshCw className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />}
            tooltip="Segarkan kalkulasi data grafik dari seluruh repository faskes"
            tooltipPosition="bottom"
          />
        </div>
      </div>

      {/* 2. Interactive 6 KPI Metric Summary Cards (Filter / Focus Buttons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Warga Diperiksa */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'screened' ? null : 'screened')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'screened'
              ? 'bg-teal-950 text-white border-teal-500 shadow-md ring-2 ring-teal-500'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-teal-500 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-teal-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'screened' ? 'text-teal-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              1. Total Diperiksa
            </span>
            <Users className={`w-3.5 h-3.5 ${highlightedMetric === 'screened' ? 'text-teal-300' : isDark ? 'text-teal-400' : 'text-teal-700'}`} />
          </div>
          <p className="text-xl font-extrabold tracking-tight font-mono">{currentTotalScreened.toLocaleString('id-ID')}</p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'screened' ? 'text-teal-200' : isDark ? 'text-teal-400' : 'text-teal-700 font-medium'}`}>
            Cakupan 8 Kecamatan
          </p>
        </div>

        {/* KPI 2: Warga Sudah Ditangani */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'handled' ? null : 'handled')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'handled'
              ? 'bg-emerald-950 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-emerald-500 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-emerald-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'handled' ? 'text-emerald-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              2. Sudah Ditangani
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${highlightedMetric === 'handled' ? 'text-emerald-300' : isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
          </div>
          <p className="text-xl font-extrabold tracking-tight font-mono">{currentTotalHandled.toLocaleString('id-ID')}</p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'handled' ? 'text-emerald-200' : isDark ? 'text-emerald-400' : 'text-emerald-700 font-medium'}`}>
            {Math.round((currentTotalHandled / currentTotalScreened) * 100)}% Kontinuitas
          </p>
        </div>

        {/* KPI 3: Penurunan Risiko Sakit */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'risk_reduction' ? null : 'risk_reduction')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'risk_reduction'
              ? 'bg-sky-950 text-white border-sky-500 shadow-md ring-2 ring-sky-500'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-sky-500 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-sky-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'risk_reduction' ? 'text-sky-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              3. Penurunan Risiko
            </span>
            <TrendingDown className={`w-3.5 h-3.5 ${highlightedMetric === 'risk_reduction' ? 'text-sky-300' : isDark ? 'text-sky-400' : 'text-sky-700'}`} />
          </div>
          <p className={`text-xl font-extrabold tracking-tight font-mono ${highlightedMetric === 'risk_reduction' ? 'text-sky-300' : isDark ? 'text-sky-400' : 'text-sky-800'}`}>
            {currentRiskReduction}%
          </p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'risk_reduction' ? 'text-sky-200' : isDark ? 'text-sky-400' : 'text-sky-700 font-medium'}`}>
            Reduksi Kasus Akut
          </p>
        </div>

        {/* KPI 4: Puskesmas Capai Target */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'target' ? null : 'target')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'target'
              ? 'bg-indigo-950 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-indigo-500 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-indigo-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'target' ? 'text-indigo-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              4. Capai Target
            </span>
            <Building2 className={`w-3.5 h-3.5 ${highlightedMetric === 'target' ? 'text-indigo-300' : isDark ? 'text-indigo-400' : 'text-indigo-700'}`} />
          </div>
          <p className="text-xl font-extrabold tracking-tight font-mono">{currentMeetingTarget} / 8</p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'target' ? 'text-indigo-200' : isDark ? 'text-indigo-400' : 'text-indigo-700 font-medium'}`}>
            75% Faskes Memenuhi SPM
          </p>
        </div>

        {/* KPI 5: Kesenjangan Rujukan */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'gap' ? null : 'gap')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'gap'
              ? 'bg-amber-950 text-white border-amber-500 shadow-md ring-2 ring-amber-500'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-amber-500 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-amber-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'gap' ? 'text-amber-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              5. Kesenjangan Rujukan
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${highlightedMetric === 'gap' ? 'text-amber-300' : isDark ? 'text-amber-400' : 'text-amber-700'}`} />
          </div>
          <p className={`text-xl font-extrabold tracking-tight font-mono ${highlightedMetric === 'gap' ? 'text-amber-300' : isDark ? 'text-amber-400' : 'text-amber-800'}`}>
            {currentTotalGap} Kasus
          </p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'gap' ? 'text-amber-200' : isDark ? 'text-amber-400' : 'text-amber-700 font-medium'}`}>
            32.6% Tertunda Maritim
          </p>
        </div>

        {/* KPI 6: Kondisi Kesehatan Terkontrol */}
        <div
          onClick={() => setHighlightedMetric(highlightedMetric === 'controlled' ? null : 'controlled')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            highlightedMetric === 'controlled'
              ? 'bg-emerald-950 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400'
              : isDark
              ? 'bg-slate-800/60 border-slate-700/70 hover:border-emerald-400 text-white'
              : 'bg-[#F8FBFA] border-[#D8E5E2] hover:border-emerald-700 text-black'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                highlightedMetric === 'controlled' ? 'text-emerald-300' : isDark ? 'text-slate-400' : 'text-[#60716D]'
              }`}
            >
              6. Terkontrol
            </span>
            <HeartPulse className={`w-3.5 h-3.5 ${highlightedMetric === 'controlled' ? 'text-emerald-300' : isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
          </div>
          <p className={`text-xl font-extrabold tracking-tight font-mono ${isDark ? 'text-emerald-400' : 'text-[#2E7D5B]'}`}>
            {currentControlledRate}%
          </p>
          <p className={`text-[10px] mt-0.5 ${highlightedMetric === 'controlled' ? 'text-emerald-200' : isDark ? 'text-emerald-400' : 'text-emerald-700 font-medium'}`}>
            Tensi & Gula Darah Aman
          </p>
        </div>
      </div>

      {/* 3. Charts Area Grid (Responsive Layout) */}
      <div className={`grid gap-6 ${chartType === 'COMBINED' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {/* ========================================================================= */}
        {/* A. GRAFIK BATANG (BAR CHART RECHARTS) — KOMPARASI 8 PUSKESMAS & TARGET   */}
        {/* ========================================================================= */}
        {(chartType === 'COMBINED' || chartType === 'BAR_CHART') && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FAFDFB] border-[#D8E5E2]'
            }`}
          >
            {/* Bar Chart Header Controls */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-[#D8E5E2]'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-[#00201C]'}`} />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Grafik Batang: Komparasi Kinerja 8 Puskesmas & Capaian Target
                  </h3>
                </div>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#60716D]'}`}>
                  Perbandingan Warga Diperiksa, Warga Sudah Ditangani, Kesenjangan Rujukan, dan Standar Target SPM Faskes.
                </p>
              </div>

              {/* Bar Metric Mode Switcher */}
              <div className="flex items-center gap-1.5">
                <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setBarMetricMode('VOLUME')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      barMetricMode === 'VOLUME'
                        ? isDark
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-[#00201C] text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Volume (Warga)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarMetricMode('RATES')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      barMetricMode === 'RATES'
                        ? isDark
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-[#00201C] text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Rasio Kualitas (%)
                  </button>
                </div>

                {/* Region Filter */}
                <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setRegionFilter('ALL')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      regionFilter === 'ALL'
                        ? 'bg-teal-700 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegionFilter('REMOTE')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      regionFilter === 'REMOTE'
                        ? 'bg-teal-700 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Maritim
                  </button>
                </div>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredPuskesmasData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                  barGap={3}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748B' }}
                    unit={barMetricMode === 'VOLUME' ? '' : '%'}
                    domain={barMetricMode === 'VOLUME' ? [0, 'auto'] : [0, 100]}
                  />
                  <RechartsTooltip content={renderBarTooltip} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10, color: isDark ? '#cbd5e1' : '#334155' }}
                  />

                  {barMetricMode === 'VOLUME' ? (
                    <>
                      {/* Bar 1: Total Warga Diperiksa */}
                      {visibleLayers.screened && (
                        <Bar
                          dataKey="totalScreened"
                          name="Total Warga Diperiksa"
                          fill={isDark ? '#14b8a6' : '#00201C'}
                          radius={[4, 4, 0, 0]}
                        />
                      )}

                      {/* Bar 2: Warga Sudah Ditangani */}
                      {visibleLayers.handled && (
                        <Bar
                          dataKey="totalHandled"
                          name="Warga Sudah Ditangani"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      )}

                      {/* Bar 3: Kesenjangan Rujukan */}
                      {visibleLayers.gap && (
                        <Bar
                          dataKey="referralGap"
                          name="Kesenjangan Rujukan"
                          fill="#F59E0B"
                          radius={[4, 4, 0, 0]}
                        />
                      )}

                      {/* Reference line for target SPM */}
                      {visibleLayers.target && (
                        <ReferenceLine
                          y={100}
                          stroke="#818cf8"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Target SPM Rata-Rata (100 Sasaran)',
                            fill: isDark ? '#a5b4fc' : '#4F46E5',
                            fontSize: 10,
                            position: 'top',
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* Rate 1: % Kondisi Terkontrol */}
                      <Bar
                        dataKey="controlledRate"
                        name="% Kondisi Kesehatan Terkontrol"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                      />

                      {/* Rate 2: % Penurunan Risiko */}
                      <Bar
                        dataKey="riskReductionRate"
                        name="% Efektivitas Penurunan Risiko"
                        fill="#0284C7"
                        radius={[4, 4, 0, 0]}
                      />

                      {/* Rate 3: % Kontinuitas */}
                      <Bar
                        dataKey="continuityRate"
                        name="% Kontinuitas Tindak Lanjut"
                        fill="#0D9488"
                        radius={[4, 4, 0, 0]}
                      />

                      {/* Reference Standard Line */}
                      <ReferenceLine
                        y={50}
                        stroke="#E11D48"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Batas Minimum SPM (50%)',
                          fill: '#E11D48',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart Quick Insights Footer */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-[#D8E5E2] text-[#334643]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">
                  <strong>6 dari 8 Puskesmas (75%)</strong> telah mencapai target kontinuitas &gt;50%. Prioritas intervensi logistik maritim diarahkan ke <strong>PKM Pencado & PKM Losseng</strong>.
                </span>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('dinkes-kinerja-pkm')}
                  className={`font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer ${
                    isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-800 hover:text-teal-950'
                  }`}
                >
                  Detail 8 Faskes <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* B. GRAFIK AREA (AREA CHART RECHARTS) — TREN LONGITUDINAL 6 BULAN (6 KPI) */}
        {/* ========================================================================= */}
        {(chartType === 'COMBINED' || chartType === 'AREA_CHART') && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FAFDFB] border-[#D8E5E2]'
            }`}
          >
            {/* Area Chart Header Controls */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-[#D8E5E2]'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <AreaChartIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Grafik Area: Tren Pertumbuhan & Mitigasi Risiko Longitudinal
                  </h3>
                </div>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#60716D]'}`}>
                  Dinamika akumulasi skrining, stabilisasi outcome warga terkontrol, dan penurunan gap rujukan.
                </p>
              </div>

              {/* Area Controls */}
              <div className="flex items-center gap-1.5">
                {/* Metric Mode */}
                <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setAreaMetricMode('PROGRESSION')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      areaMetricMode === 'PROGRESSION'
                        ? 'bg-teal-800 text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Tren 6 KPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setAreaMetricMode('RISK_STACK')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      areaMetricMode === 'RISK_STACK'
                        ? 'bg-teal-800 text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Stratifikasi Risiko
                  </button>
                </div>

                {/* Time Range Selector */}
                <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setTimeRange('3M')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === '3M'
                        ? isDark
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    3 Bln
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('6M')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === '6M'
                        ? isDark
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    6 Bln
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('12M')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === '12M'
                        ? isDark
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    1 Thn
                  </button>
                </div>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredMonthlyData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                >
                  <defs>
                    {/* Gradient Screened */}
                    <linearGradient id="areaScreened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? '#14b8a6' : '#00201C'} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={isDark ? '#14b8a6' : '#00201C'} stopOpacity={0.05} />
                    </linearGradient>
                    {/* Gradient Handled */}
                    <linearGradient id="areaHandled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                    {/* Gradient Controlled */}
                    <linearGradient id="areaControlled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.05} />
                    </linearGradient>
                    {/* Gradient Gap */}
                    <linearGradient id="areaGap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                    </linearGradient>

                    {/* Stacked Risk Gradients */}
                    <linearGradient id="riskLow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="riskMod" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="riskHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="riskCrit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748B' }}
                    unit={areaMetricMode === 'RISK_STACK' ? '' : ''}
                  />
                  <RechartsTooltip content={renderAreaTooltip} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10, color: isDark ? '#cbd5e1' : '#334155' }}
                  />

                  {areaMetricMode === 'PROGRESSION' ? (
                    <>
                      {/* Area 1: Total Screened */}
                      <Area
                        type="monotone"
                        dataKey="totalScreened"
                        name="Total Warga Diperiksa"
                        stroke={isDark ? '#14b8a6' : '#00201C'}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaScreened)"
                      />

                      {/* Area 2: Handled Citizens */}
                      <Area
                        type="monotone"
                        dataKey="totalHandled"
                        name="Warga Sudah Ditangani"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaHandled)"
                      />

                      {/* Area 3: Controlled Health Status */}
                      <Area
                        type="monotone"
                        dataKey="controlledHealthCount"
                        name="Kondisi Terkontrol (Tensi & Gula Darah)"
                        stroke="#0284C7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#areaControlled)"
                      />

                      {/* Area 4: Referral Gap */}
                      <Area
                        type="monotone"
                        dataKey="referralGapCount"
                        name="Kesenjangan Rujukan & Tertunda"
                        stroke="#F59E0B"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        fillOpacity={1}
                        fill="url(#areaGap)"
                      />
                    </>
                  ) : (
                    <>
                      {/* Stacked Risk Layers */}
                      <Area
                        type="monotone"
                        stackId="1"
                        dataKey="lowRiskCount"
                        name="Risiko Rendah / Terkendali"
                        stroke="#10B981"
                        fill="url(#riskLow)"
                      />
                      <Area
                        type="monotone"
                        stackId="1"
                        dataKey="moderateRiskCount"
                        name="Risiko Sedang"
                        stroke="#F59E0B"
                        fill="url(#riskMod)"
                      />
                      <Area
                        type="monotone"
                        stackId="1"
                        dataKey="highRiskCount"
                        name="Risiko Tinggi"
                        stroke="#EA580C"
                        fill="url(#riskHigh)"
                      />
                      <Area
                        type="monotone"
                        stackId="1"
                        dataKey="criticalRiskCount"
                        name="Risiko Kritis"
                        stroke="#E11D48"
                        fill="url(#riskCrit)"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart Quick Insights Footer */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-[#D8E5E2] text-[#334643]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="font-medium">
                  Tren efektivitas outcome terkontrol meningkat signifikan dari <strong>66.6% (Sep 2025)</strong> ke <strong>74.5% (Agu 2026)</strong> seiring penguatan kunjungan kader door-to-door.
                </span>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('tren-outcome')}
                  className={`font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer ${
                    isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-800 hover:text-teal-950'
                  }`}
                >
                  Detail Outcome <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
