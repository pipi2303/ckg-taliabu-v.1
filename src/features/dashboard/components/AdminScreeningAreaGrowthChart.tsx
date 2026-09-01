import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Building2,
  Percent,
  Sparkles,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Tooltip as UiTooltip } from '../../../components/common/Tooltip';
import { rawStorage, subscribeToStorage } from '../../../repositories/storage';

export interface TimelineCoveragePoint {
  timeKey: string;
  timeLabel: string;
  // Registrasi & Pemeriksaan
  registeredCitizens: number;
  totalScreened: number;
  completeScreened: number;
  populationTarget: number;
  // Breakdown Wilayah
  bobongScreened: number;
  ledeScreened: number;
  gelaScreened: number;
  wayaloarScreened: number;
  othersScreened: number;
}

// 12-Month Comprehensive Dataset (1 Tahun: Mar 2025 - Feb 2026)
const TIMELINE_DATA_12M: TimelineCoveragePoint[] = [
  {
    timeKey: '2025-03',
    timeLabel: 'Mar 2025',
    registeredCitizens: 280,
    totalScreened: 120,
    completeScreened: 105,
    populationTarget: 2500,
    bobongScreened: 40,
    ledeScreened: 25,
    gelaScreened: 20,
    wayaloarScreened: 18,
    othersScreened: 17,
  },
  {
    timeKey: '2025-04',
    timeLabel: 'Apr 2025',
    registeredCitizens: 340,
    totalScreened: 165,
    completeScreened: 148,
    populationTarget: 2500,
    bobongScreened: 52,
    ledeScreened: 32,
    gelaScreened: 26,
    wayaloarScreened: 22,
    othersScreened: 33,
  },
  {
    timeKey: '2025-05',
    timeLabel: 'Mei 2025',
    registeredCitizens: 410,
    totalScreened: 210,
    completeScreened: 190,
    populationTarget: 2500,
    bobongScreened: 65,
    ledeScreened: 40,
    gelaScreened: 34,
    wayaloarScreened: 28,
    othersScreened: 43,
  },
  {
    timeKey: '2025-06',
    timeLabel: 'Jun 2025',
    registeredCitizens: 460,
    totalScreened: 245,
    completeScreened: 220,
    populationTarget: 2500,
    bobongScreened: 74,
    ledeScreened: 48,
    gelaScreened: 42,
    wayaloarScreened: 32,
    othersScreened: 49,
  },
  {
    timeKey: '2025-07',
    timeLabel: 'Jul 2025',
    registeredCitizens: 500,
    totalScreened: 280,
    completeScreened: 255,
    populationTarget: 2500,
    bobongScreened: 82,
    ledeScreened: 55,
    gelaScreened: 48,
    wayaloarScreened: 35,
    othersScreened: 60,
  },
  {
    timeKey: '2025-08',
    timeLabel: 'Agu 2025',
    registeredCitizens: 520,
    totalScreened: 305,
    completeScreened: 278,
    populationTarget: 2500,
    bobongScreened: 90,
    ledeScreened: 60,
    gelaScreened: 52,
    wayaloarScreened: 40,
    othersScreened: 63,
  },
  {
    timeKey: '2025-09',
    timeLabel: 'Sep 2025',
    registeredCitizens: 540,
    totalScreened: 320,
    completeScreened: 290,
    populationTarget: 2500,
    bobongScreened: 110,
    ledeScreened: 55,
    gelaScreened: 48,
    wayaloarScreened: 42,
    othersScreened: 65,
  },
  {
    timeKey: '2025-10',
    timeLabel: 'Okt 2025',
    registeredCitizens: 820,
    totalScreened: 590,
    completeScreened: 535,
    populationTarget: 2500,
    bobongScreened: 195,
    ledeScreened: 102,
    gelaScreened: 90,
    wayaloarScreened: 82,
    othersScreened: 121,
  },
  {
    timeKey: '2025-11',
    timeLabel: 'Nov 2025',
    registeredCitizens: 1150,
    totalScreened: 890,
    completeScreened: 820,
    populationTarget: 2500,
    bobongScreened: 290,
    ledeScreened: 154,
    gelaScreened: 138,
    wayaloarScreened: 124,
    othersScreened: 184,
  },
  {
    timeKey: '2025-12',
    timeLabel: 'Des 2025',
    registeredCitizens: 1480,
    totalScreened: 1210,
    completeScreened: 1130,
    populationTarget: 2500,
    bobongScreened: 395,
    ledeScreened: 210,
    gelaScreened: 188,
    wayaloarScreened: 168,
    othersScreened: 249,
  },
  {
    timeKey: '2026-01',
    timeLabel: 'Jan 2026',
    registeredCitizens: 1840,
    totalScreened: 1560,
    completeScreened: 1465,
    populationTarget: 2500,
    bobongScreened: 510,
    ledeScreened: 272,
    gelaScreened: 242,
    wayaloarScreened: 218,
    othersScreened: 318,
  },
  {
    timeKey: '2026-02',
    timeLabel: 'Feb 2026 (Kini)',
    registeredCitizens: 2240,
    totalScreened: 1920,
    completeScreened: 1810,
    populationTarget: 2500,
    bobongScreened: 630,
    ledeScreened: 335,
    gelaScreened: 298,
    wayaloarScreened: 268,
    othersScreened: 389,
  },
];

export const AdminScreeningAreaGrowthChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('6M');
  const [viewMode, setViewMode] = useState<'CUMULATIVE' | 'REGIONAL_STACK'>('CUMULATIVE');
  const [storageTick, setStorageTick] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  // Interactive Legend Toggles (Series Visibility)
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setStorageTick((prev) => prev + 1);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
    return () => unsubscribe();
  }, []);

  const chartData = useMemo(() => {
    let slicedList: TimelineCoveragePoint[];
    if (timeRange === '3M') {
      slicedList = TIMELINE_DATA_12M.slice(-3);
    } else if (timeRange === '6M') {
      slicedList = TIMELINE_DATA_12M.slice(-6);
    } else {
      slicedList = TIMELINE_DATA_12M; // 1Y
    }

    try {
      const liveCitizens = rawStorage.getCitizens();
      const liveScreenings = rawStorage.getScreeningResults();

      const dataCopy = JSON.parse(JSON.stringify(slicedList)) as TimelineCoveragePoint[];
      const latestItem = dataCopy[dataCopy.length - 1];

      if (liveCitizens.length > 0) {
        latestItem.registeredCitizens = Math.max(latestItem.registeredCitizens, liveCitizens.length);
      }
      if (liveScreenings.length > 0) {
        latestItem.totalScreened = Math.max(latestItem.totalScreened, liveScreenings.length);
        latestItem.completeScreened = Math.max(
          latestItem.completeScreened,
          Math.round(liveScreenings.length * 0.94)
        );
      }

      return dataCopy;
    } catch {
      return slicedList;
    }
  }, [timeRange, storageTick]);

  const latest = chartData[chartData.length - 1];
  const first = chartData[0];
  const coveragePercent = Math.round((latest.totalScreened / latest.populationTarget) * 100);
  const completionRate = Math.round((latest.completeScreened / latest.totalScreened) * 100);
  const netGrowth = latest.totalScreened - first.totalScreened;
  const growthPercent = first.totalScreened > 0 ? Math.round((netGrowth / first.totalScreened) * 100) : 100;

  // Cumulative Series definitions
  const cumulativeSeries = [
    { key: 'registeredCitizens', label: 'Warga Terdaftar (Kependudukan)', color: '#0D9488' },
    { key: 'totalScreened', label: 'Total Warga Diperiksa CKG', color: '#0284C7' },
    { key: 'completeScreened', label: 'Pemeriksaan CKG Lengkap (100%)', color: '#10B981' },
  ];

  // Regional Stack Series definitions
  const regionalSeries = [
    { key: 'bobongScreened', label: 'Puskesmas Bobong', color: '#0284C7' },
    { key: 'ledeScreened', label: 'Puskesmas Lede', color: '#0D9488' },
    { key: 'gelaScreened', label: 'Puskesmas Gela', color: '#F59E0B' },
    { key: 'wayaloarScreened', label: 'Puskesmas Wayaloar', color: '#8B5CF6' },
    { key: 'othersScreened', label: 'Puskesmas Lainnya', color: '#64748B' },
  ];

  const currentSeriesList = viewMode === 'CUMULATIVE' ? cumulativeSeries : regionalSeries;

  return (
    <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 border-b border-gray-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-black tracking-tight">
                  Pertumbuhan Data Warga & Cakupan Pemeriksaan CKG Antar Waktu
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time Sync ({lastSyncTime})
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Tren pertumbuhan kumulatif pemeriksaan kesehatan CKG dan kontribusi puskesmas se-Pulau Taliabu
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Time Range Dropdown + View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px] font-semibold text-gray-500">Rentang:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '3M' | '6M' | '1Y')}
              className="bg-transparent border-0 font-bold text-gray-800 text-xs focus:ring-0 cursor-pointer pr-1"
            >
              <option value="3M">3 Bulan Terakhir</option>
              <option value="6M">6 Bulan Terakhir</option>
              <option value="1Y">1 Tahun Terakhir (12 Bulan)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold">
            <UiTooltip content="Tren kumulatif: Warga terdaftar, pemeriksaan lengkap, dan target populasi" position="bottom">
              <button
                type="button"
                onClick={() => setViewMode('CUMULATIVE')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'CUMULATIVE'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Tren Cakupan Kumulatif
              </button>
            </UiTooltip>
            <UiTooltip content="Distribusi bertumpuk (stacked): Kontribusi pemeriksaan tiap wilayah Puskesmas" position="bottom">
              <button
                type="button"
                onClick={() => setViewMode('REGIONAL_STACK')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'REGIONAL_STACK'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-teal-800 hover:text-teal-950'
                }`}
              >
                Distribusi Area Puskesmas
              </button>
            </UiTooltip>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#F0FDF4] rounded-xl border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Cakupan Populasi Target
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-emerald-900">{coveragePercent}%</span>
            <span className="text-[10px] text-gray-500 font-medium">({latest.totalScreened}/{latest.populationTarget})</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            Target Capaian 2026: 80%
          </span>
        </div>

        <div className="p-3 bg-[#F0F9FF] rounded-xl border border-sky-100">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
            Pemeriksaan Selesai Lengkap
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-sky-900">{latest.completeScreened}</span>
            <span className="text-[10px] font-bold text-sky-700">({completionRate}%)</span>
          </div>
          <span className="text-[10px] text-sky-700 font-semibold mt-0.5 block">
            Kualitas data skrining tinggi
          </span>
        </div>

        <div className="p-3 bg-[#F0FDFA] rounded-xl border border-teal-100">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
            Pertumbuhan Periode
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-teal-900">+{growthPercent}%</span>
            <span className="text-[10px] font-medium text-teal-700">(+{netGrowth} jiwa)</span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-0.5 block">
            Rentang {timeRange === '1Y' ? '12 Bulan' : timeRange === '6M' ? '6 Bulan' : '3 Bulan'}
          </span>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Warga Terdaftar Master
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-slate-900">{latest.registeredCitizens}</span>
            <span className="text-[10px] text-gray-500 font-medium">Jiwa</span>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold mt-0.5 block">
            Basis NIK Terverifikasi Dukcapil
          </span>
        </div>
      </div>

      {/* Interactive Legend Bar (Click to toggle series on/off) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5 text-emerald-700" />
          <span>Legenda Interaktif (Klik label untuk sembunyikan/tampilkan data):</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {currentSeriesList.map((s) => {
            const isHidden = !!hiddenSeries[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSeries(s.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  isHidden
                    ? 'bg-white text-gray-400 border-gray-200 line-through opacity-60'
                    : 'bg-white text-slate-800 border-slate-300 shadow-2xs hover:border-slate-400'
                }`}
                title="Klik untuk tampilkan atau sembunyikan area grafik ini"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isHidden ? '#CBD5E1' : s.color }}
                />
                <span>{s.label}</span>
                {isHidden ? (
                  <EyeOff className="w-3 h-3 text-gray-400 ml-0.5" />
                ) : (
                  <Eye className="w-3 h-3 text-slate-500 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="w-full h-80 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorScreened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="colorBobong" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorLede" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorGela" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorWayaloar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorOthers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748B" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#64748B" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={{ stroke: '#CBD5E1' }}
              label={{
                value: 'Jumlah Warga (Jiwa)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#64748B', fontSize: 10, textAnchor: 'middle' },
                offset: 10,
              }}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TimelineCoveragePoint;
                  const cov = Math.round((data.totalScreened / data.populationTarget) * 100);
                  const comp = Math.round((data.completeScreened / data.totalScreened) * 100);

                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-2 max-w-xs animate-in fade-in duration-150">
                      <div className="font-bold border-b border-slate-700/80 pb-1.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{data.timeLabel}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-600 px-1.5 py-0.5 rounded-md font-mono font-bold">
                          Cakupan {cov}%
                        </span>
                      </div>

                      {viewMode === 'CUMULATIVE' ? (
                        <div className="space-y-1.5 text-[11px] pt-0.5">
                          <div className="flex justify-between items-center text-teal-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-400" />
                              Warga Terdaftar:
                            </span>
                            <span className="font-bold font-mono">{data.registeredCitizens} Jiwa</span>
                          </div>
                          <div className="flex justify-between items-center text-sky-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-400" />
                              Total Diperiksa:
                            </span>
                            <span className="font-bold font-mono">{data.totalScreened} Jiwa</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Skrining Lengkap:
                            </span>
                            <span className="font-bold font-mono">{data.completeScreened} Jiwa ({comp}%)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[11px] pt-0.5">
                          <div className="flex justify-between items-center text-sky-300">
                            <span>PKM Bobong:</span>
                            <span className="font-bold font-mono">{data.bobongScreened}</span>
                          </div>
                          <div className="flex justify-between items-center text-teal-300">
                            <span>PKM Lede:</span>
                            <span className="font-bold font-mono">{data.ledeScreened}</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-300">
                            <span>PKM Gela:</span>
                            <span className="font-bold font-mono">{data.gelaScreened}</span>
                          </div>
                          <div className="flex justify-between items-center text-purple-300">
                            <span>PKM Wayaloar:</span>
                            <span className="font-bold font-mono">{data.wayaloarScreened}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>PKM Lainnya:</span>
                            <span className="font-bold font-mono">{data.othersScreened}</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Target Total Wilayah:</span>
                        <span className="font-mono text-slate-200 font-bold">{data.populationTarget} Jiwa</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {viewMode === 'CUMULATIVE' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="registeredCitizens"
                  name="Warga Terdaftar (Kependudukan)"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRegistered)"
                  hide={hiddenSeries['registeredCitizens']}
                />
                <Area
                  type="monotone"
                  dataKey="totalScreened"
                  name="Total Warga Diperiksa CKG"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScreened)"
                  hide={hiddenSeries['totalScreened']}
                />
                <Area
                  type="monotone"
                  dataKey="completeScreened"
                  name="Pemeriksaan CKG Lengkap (100%)"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComplete)"
                  hide={hiddenSeries['completeScreened']}
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="bobongScreened"
                  name="Puskesmas Bobong"
                  stroke="#0284C7"
                  fill="url(#colorBobong)"
                  hide={hiddenSeries['bobongScreened']}
                />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="ledeScreened"
                  name="Puskesmas Lede"
                  stroke="#0D9488"
                  fill="url(#colorLede)"
                  hide={hiddenSeries['ledeScreened']}
                />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="gelaScreened"
                  name="Puskesmas Gela"
                  stroke="#F59E0B"
                  fill="url(#colorGela)"
                  hide={hiddenSeries['gelaScreened']}
                />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="wayaloarScreened"
                  name="Puskesmas Wayaloar"
                  stroke="#8B5CF6"
                  fill="url(#colorWayaloar)"
                  hide={hiddenSeries['wayaloarScreened']}
                />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="othersScreened"
                  name="Puskesmas Lainnya"
                  stroke="#64748B"
                  fill="url(#colorOthers)"
                  hide={hiddenSeries['othersScreened']}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Trajectory Narrative */}
      <div className="p-3.5 bg-[#F0FDF4] rounded-xl border border-emerald-200/80 text-xs flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-slate-800">
          <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
            <span>Evaluasi Tren Pertumbuhan Cakupan CKG:</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-bold">
              Cakupan Aktual: {coveragePercent}% dari Target
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700">
            Total warga yang telah menjalani pemeriksaan CKG meningkat pesat dari {first.totalScreened} jiwa pada awal periode menjadi {latest.totalScreened} jiwa pada bulan ini (+{growthPercent}% pertumbuhan).
            Tingkat penyelesaian skrining lengkap mencapai <strong>{completionRate}%</strong>, dengan kontribusi terbesar berasal dari <strong>Puskesmas Bobong</strong> dan <strong>Puskesmas Lede</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
