import React, { useState, useMemo } from 'react';
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
} from 'recharts';
import {
  Building2,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowUpDown,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { FacilityPerformanceSummary } from '../../../types';

interface PuskesmasWorkloadComparisonSectionProps {
  facilities: FacilityPerformanceSummary[];
  onFacilityClick?: (facilityId: string) => void;
}

type TimeRangeOption = '7D' | '30D' | 'Q3' | 'YTD';
type ChartViewMode = 'STACKED_BAR' | 'GROUPED_BAR' | 'DUMBBELL_GAP';
type GeoFilter = 'ALL' | 'MAINLAND' | 'REMOTE';
type SortOption = 'GAP_DESC' | 'WORKLOAD_DESC' | 'CAPAIAN_DESC' | 'NAME_ASC';

interface SeriesToggleState {
  screened: boolean;
  attended: boolean;
  gap: boolean;
  rate: boolean;
}

export const PuskesmasWorkloadComparisonSection: React.FC<PuskesmasWorkloadComparisonSectionProps> = ({
  facilities,
  onFacilityClick,
}) => {
  // State Filter & Tampilan
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('Q3');
  const [chartMode, setChartMode] = useState<ChartViewMode>('STACKED_BAR');
  const [geoFilter, setGeoFilter] = useState<GeoFilter>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('GAP_DESC');

  // Interactive Legend Series Toggles
  const [activeSeries, setActiveSeries] = useState<SeriesToggleState>({
    screened: true,
    attended: true,
    gap: true,
    rate: true,
  });

  const toggleSeries = (key: keyof SeriesToggleState) => {
    setActiveSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetSeries = () => {
    setActiveSeries({
      screened: true,
      attended: true,
      gap: true,
      rate: true,
    });
  };

  // Multiplier faktor rentang waktu untuk simulasi dinamis berbasis data riil faskes
  const timeMultiplier = useMemo(() => {
    switch (timeRange) {
      case '7D':
        return 0.18; // Data 7 hari terakhir
      case '30D':
        return 0.45; // Data 30 hari terakhir
      case 'Q3':
        return 1.0;  // Data Kuartal berjalan (baseline)
      case 'YTD':
        return 2.35; // Data akumulasi Tahun Berjalan 2026
      default:
        return 1.0;
    }
  }, [timeRange]);

  // Transform & Filter Data
  const processedData = useMemo(() => {
    let list = facilities.map((f) => {
      // Skala angka sesuai multiplier waktu dengan pembulatan integer
      const rawScreened = Math.round(f.screenedCount * timeMultiplier);
      const rawAttended = Math.round(f.attendedFollowUpCount * timeMultiplier);
      const rawGap = Math.max(0, rawScreened - rawAttended);
      const achievementRate = rawScreened > 0 ? Math.round((rawAttended / rawScreened) * 1000) / 10 : 0;
      const gapRate = rawScreened > 0 ? Math.round((rawGap / rawScreened) * 1000) / 10 : 0;

      return {
        facilityId: f.facilityId,
        name: f.facilityName.replace('Puskesmas ', 'PKM '),
        fullName: f.facilityName,
        kecamatan: f.kecamatanName,
        isRemote: f.isRemoteIsland,
        geoLabel: f.isRemoteIsland ? 'Pesisir / Terluar' : 'Daratan Utama',
        screened: rawScreened,
        attended: rawAttended,
        gap: rawGap,
        achievementRate,
        gapRate,
        isPriorityIntervention: gapRate > 50 || (rawScreened > 0 && achievementRate < 45),
        targetRateSPM: 50,
      };
    });

    // Geo Filter
    if (geoFilter === 'MAINLAND') {
      list = list.filter((item) => !item.isRemote);
    } else if (geoFilter === 'REMOTE') {
      list = list.filter((item) => item.isRemote);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOption === 'GAP_DESC') return b.gap - a.gap;
      if (sortOption === 'WORKLOAD_DESC') return b.screened - a.screened;
      if (sortOption === 'CAPAIAN_DESC') return b.achievementRate - a.achievementRate;
      if (sortOption === 'NAME_ASC') return a.fullName.localeCompare(b.fullName);
      return 0;
    });

    return list;
  }, [facilities, timeMultiplier, geoFilter, sortOption]);

  // Aggregate Metrics Summary
  const summaryMetrics = useMemo(() => {
    const totalScreened = processedData.reduce((acc, curr) => acc + curr.screened, 0);
    const totalAttended = processedData.reduce((acc, curr) => acc + curr.attended, 0);
    const totalGap = processedData.reduce((acc, curr) => acc + curr.gap, 0);
    const avgAchievementRate = totalScreened > 0 ? Math.round((totalAttended / totalScreened) * 1000) / 10 : 0;
    const avgGapRate = totalScreened > 0 ? Math.round((totalGap / totalScreened) * 1000) / 10 : 0;
    const highGapCount = processedData.filter((p) => p.isPriorityIntervention).length;

    return {
      totalScreened,
      totalAttended,
      totalGap,
      avgAchievementRate,
      avgGapRate,
      highGapCount,
    };
  }, [processedData]);

  const allSeriesActive = activeSeries.screened && activeSeries.attended && activeSeries.gap && activeSeries.rate;

  return (
    <div
      id="puskesmas-comparison-section"
      className="p-4 sm:p-5 md:p-6 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md space-y-4"
    >
      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Grafik Komparasi Beban Skrining, Warga Ditangani & Kesenjangan Kasus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                8 Puskesmas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluasi mendalam disparitas beban kerja sasaran, realisasi tata laksana, dan sisa defisit kesenjangan kasus antar faskes.
            </p>
          </div>
        </div>

        {/* Filter Controls: Rentang Waktu & Mode Grafik */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Periode:
            </span>
            {(
              [
                { key: '7D', label: '7 Hari' },
                { key: '30D', label: '30 Hari' },
                { key: 'Q3', label: 'Kuartal III' },
                { key: 'YTD', label: 'Tahun 2026' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTimeRange(opt.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeRange === opt.key
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Tipe:
            </span>
            <button
              type="button"
              onClick={() => setChartMode('STACKED_BAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === 'STACKED_BAR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Stacked Bar: Warga Ditangani + Kesenjangan Kasus"
            >
              Stacked + Trend
            </button>
            <button
              type="button"
              onClick={() => setChartMode('GROUPED_BAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === 'GROUPED_BAR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Grouped Bar: Tiga Batang Berdampingan"
            >
              Grouped Bar
            </button>
            <button
              type="button"
              onClick={() => setChartMode('DUMBBELL_GAP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                chartMode === 'DUMBBELL_GAP'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Dumbbell Gap Chart: Rentang Target vs Realisasi"
            >
              Dumbbell Gap
            </button>
          </div>

          {onFacilityClick && (
            <button
              type="button"
              onClick={() => onFacilityClick('faskes-1')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Buka Grafik Tren Bulanan (Line Chart)"
            >
              <TrendingDown className="w-3.5 h-3.5 rotate-180" />
              <span>Detail Tren Bulanan (Line Chart)</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stat Mini Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
            <span>Beban Skrining Sasaran</span>
            <span className="text-[9px] text-slate-500 font-mono">100% Sasaran</span>
          </p>
          <p className="text-lg font-extrabold text-white font-mono mt-0.5">
            {summaryMetrics.totalScreened.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-400 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>Warga Berhasil Ditangani</span>
            <span className="text-[9px] text-emerald-400 font-mono">{summaryMetrics.avgAchievementRate}% Capaian</span>
          </p>
          <p className="text-lg font-extrabold text-emerald-300 font-mono mt-0.5">
            {summaryMetrics.totalAttended.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-emerald-400/80 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>Total Kesenjangan (Gap)</span>
            <span className="text-[9px] text-amber-400 font-mono">{summaryMetrics.avgGapRate}% Defisit</span>
          </p>
          <p className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">
            {summaryMetrics.totalGap.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-amber-400/80 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Prioritas Intervensi</span>
            <span className="text-[9px] text-rose-400 font-mono">{summaryMetrics.highGapCount} Faskes</span>
          </p>
          <p className="text-lg font-extrabold text-rose-300 font-mono mt-0.5">
            {summaryMetrics.highGapCount} / {processedData.length}
            <span className="text-xs font-normal text-rose-400/80 ml-1">Puskesmas</span>
          </p>
        </div>
      </div>

      {/* Secondary Controls: Geo Filter, Sort Option & Interactive Legend Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        {/* Left: Geo & Sort Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Geo Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium">Wilayah:</span>
            <select
              value={geoFilter}
              onChange={(e) => setGeoFilter(e.target.value as GeoFilter)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Faskes ({facilities.length})</option>
              <option value="MAINLAND">Daratan Utama</option>
              <option value="REMOTE">Pesisir & Terluar</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 outline-hidden cursor-pointer"
            >
              <option value="GAP_DESC">Kesenjangan Kasus Tertinggi</option>
              <option value="WORKLOAD_DESC">Beban Skrining Terbesar</option>
              <option value="CAPAIAN_DESC">Rasio Capaian Tertinggi</option>
              <option value="NAME_ASC">Nama Puskesmas (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Right: Interactive Legend Buttons (Click to toggle series) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Legenda Interaktif:
          </span>

          {/* Series 1: Beban Skrining (Sasaran) */}
          <button
            type="button"
            onClick={() => toggleSeries('screened')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.screened
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Beban Skrining Sasaran"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.screened ? 'bg-sky-400' : 'bg-slate-600'}`} />
            <span>Beban Skrining</span>
            {activeSeries.screened ? <Eye className="w-3 h-3 text-sky-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
          </button>

          {/* Series 2: Warga Ditangani */}
          <button
            type="button"
            onClick={() => toggleSeries('attended')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.attended
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Warga Berhasil Ditangani"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.attended ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span>Warga Ditangani</span>
            {activeSeries.attended ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
          </button>

          {/* Series 3: Kesenjangan Kasus (Gap) */}
          <button
            type="button"
            onClick={() => toggleSeries('gap')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.gap
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Kesenjangan Kasus"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.gap ? 'bg-amber-500' : 'bg-slate-600'}`} />
            <span>Kesenjangan Kasus</span>
            {activeSeries.gap ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
          </button>

          {/* Series 4: Rasio Capaian % (Hanya untuk Stacked Mode) */}
          {chartMode === 'STACKED_BAR' && (
            <button
              type="button"
              onClick={() => toggleSeries('rate')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                activeSeries.rate
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25'
                  : 'bg-slate-900 text-slate-500 border-slate-800 line-through opacity-60'
              }`}
              title="Klik untuk menyembunyikan / menampilkan Garis Tren Capaian %"
            >
              <span className={`w-2.5 h-1 rounded-full ${activeSeries.rate ? 'bg-teal-300' : 'bg-slate-600'}`} />
              <span>Rasio %</span>
              {activeSeries.rate ? <Eye className="w-3 h-3 text-teal-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
            </button>
          )}

          {!allSeriesActive && (
            <button
              type="button"
              onClick={resetSeries}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition cursor-pointer"
              title="Tampilkan Semua Seri"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'STACKED_BAR' ? (
            /* 1. STACKED BAR + LINE COMBO CHART */
            <ComposedChart
              data={processedData}
              margin={{ top: 12, right: activeSeries.rate ? 25 : 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Jumlah Warga (Jiwa)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#64748b', fontSize: 10 },
                }}
              />
              {activeSeries.rate && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#2dd4bf', fontSize: 9.5 }}
                  axisLine={false}
                  tickLine={false}
                />
              )}

              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-2 z-50 text-white min-w-[240px]">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                          <div>
                            <p className="font-bold text-white">{data.fullName}</p>
                            <p className="text-[10px] text-slate-400">Kec. {data.kecamatan}</p>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              data.isRemote
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {data.geoLabel}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] pt-0.5">
                          <p className="text-sky-300 flex justify-between gap-4">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-sky-400" />
                              Beban Skrining Sasaran:
                            </span>
                            <span className="font-bold font-mono">{data.screened.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <p className="text-emerald-300 flex justify-between gap-4">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-emerald-400" />
                              Warga Berhasil Ditangani:
                            </span>
                            <span className="font-bold font-mono">{data.attended.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <p className="text-amber-300 flex justify-between gap-4">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-amber-400" />
                              Sisa Kesenjangan Kasus (Gap):
                            </span>
                            <span className="font-bold font-mono">{data.gap.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-teal-300">
                            <span className="font-medium">Tingkat Capaian Penanganan:</span>
                            <span className="font-bold font-mono text-sm">{data.achievementRate}%</span>
                          </div>
                        </div>

                        {data.isPriorityIntervention && (
                          <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300 flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                            <span>Defisit &gt;50%: Perlu intervensi logistik / nakes.</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {activeSeries.attended && (
                <Bar
                  yAxisId="left"
                  dataKey="attended"
                  name="Warga Ditangani"
                  stackId="pkmStack"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={28}
                />
              )}

              {activeSeries.gap && (
                <Bar
                  yAxisId="left"
                  dataKey="gap"
                  name="Kesenjangan Kasus"
                  stackId="pkmStack"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              )}

              {activeSeries.rate && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="achievementRate"
                  name="Capaian %"
                  stroke="#2dd4bf"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#2dd4bf', strokeWidth: 1.5, stroke: '#0f172a' }}
                  activeDot={{ r: 6, fill: '#14b8a6' }}
                />
              )}

              {activeSeries.rate && (
                <ReferenceLine
                  yAxisId="right"
                  y={50}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: 'Standar Target SPM 50%',
                    position: 'insideTopRight',
                    fill: '#f43f5e',
                    fontSize: 9.5,
                    fontWeight: 600,
                  }}
                />
              )}
            </ComposedChart>
          ) : chartMode === 'GROUPED_BAR' ? (
            /* 2. GROUPED BAR CHART (3 Batang Berdampingan) */
            <BarChart
              data={processedData}
              margin={{ top: 12, right: 15, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Jumlah Warga (Jiwa)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#64748b', fontSize: 10 },
                }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-1.5 text-white min-w-[220px]">
                        <p className="font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
                          <span>{data.fullName}</span>
                          <span className="text-[10px] text-teal-400">{data.achievementRate}% Selesai</span>
                        </p>
                        <div className="space-y-1 text-[11px] pt-0.5">
                          <p className="text-sky-300 flex justify-between gap-3">
                            <span>• Beban Skrining:</span>
                            <span className="font-bold font-mono">{data.screened}</span>
                          </p>
                          <p className="text-emerald-300 flex justify-between gap-3">
                            <span>• Warga Ditangani:</span>
                            <span className="font-bold font-mono">{data.attended}</span>
                          </p>
                          <p className="text-amber-300 flex justify-between gap-3">
                            <span>• Kesenjangan Kasus:</span>
                            <span className="font-bold font-mono">{data.gap}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {activeSeries.screened && (
                <Bar
                  dataKey="screened"
                  name="Beban Skrining"
                  fill="#0284c7"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
              )}
              {activeSeries.attended && (
                <Bar
                  dataKey="attended"
                  name="Warga Ditangani"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
              )}
              {activeSeries.gap && (
                <Bar
                  dataKey="gap"
                  name="Kesenjangan Kasus"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
              )}
            </BarChart>
          ) : (
            /* 3. DUMBBELL GAP CHART (Horizontal Target vs Achievement) */
            <ComposedChart
              data={processedData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 15, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 10.5, fontWeight: 600 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                width={85}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-1.5 text-white min-w-[220px]">
                        <p className="font-bold border-b border-slate-800 pb-1">{data.fullName}</p>
                        <div className="space-y-1 text-[11px] pt-0.5">
                          <p className="text-emerald-400 flex justify-between gap-4">
                            <span>🟢 Realisasi Ditangani:</span>
                            <span className="font-mono font-bold">{data.attended} Jiwa</span>
                          </p>
                          <p className="text-sky-400 flex justify-between gap-4">
                            <span>🔵 Beban Sasaran:</span>
                            <span className="font-mono font-bold">{data.screened} Jiwa</span>
                          </p>
                          <p className="text-amber-400 border-t border-slate-800 pt-1 flex justify-between gap-4 font-semibold">
                            <span>🔴 Selisih Kesenjangan:</span>
                            <span className="font-mono font-bold">{data.gap} Jiwa ({data.gapRate}%)</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Bar Background as Gap Span */}
              <Bar
                dataKey="screened"
                name="Rentang Sasaran"
                fill="#1e293b"
                stroke="#334155"
                barSize={10}
                radius={[0, 4, 4, 0]}
              />

              {activeSeries.attended && (
                <Scatter
                  dataKey="attended"
                  name="Warga Ditangani"
                  fill="#10b981"
                  shape="circle"
                />
              )}

              {activeSeries.screened && (
                <Scatter
                  dataKey="screened"
                  name="Beban Sasaran"
                  fill="#38bdf8"
                  shape="circle"
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Action Footer & Strategic Note */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            <strong className="text-slate-200 font-semibold">Petunjuk Operasional:</strong> Gunakan legenda di atas untuk menyembunyikan/menampilkan metrik, atau beralih rentang waktu (7 Hari / 30 Hari / Kuartal / Tahun) untuk evaluasi tren.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Standar SPM Dinkes:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
            ≥50% Selesai
          </span>
        </div>
      </div>
    </div>
  );
};
