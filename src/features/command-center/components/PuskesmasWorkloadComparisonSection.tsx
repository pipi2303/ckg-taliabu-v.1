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
      className="p-4 sm:p-5 md:p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4"
    >
      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                Grafik Komparasi Beban Skrining, Warga Ditangani & Kesenjangan Kasus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                8 Puskesmas
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Evaluasi mendalam disparitas beban kerja sasaran, realisasi tata laksana, dan sisa defisit kesenjangan kasus antar faskes.
            </p>
          </div>
        </div>

        {/* Filter Controls: Rentang Waktu & Mode Grafik */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-600 px-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-500" />
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRange === opt.key
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-black hover:bg-stone-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-600 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-stone-500" />
              Tipe:
            </span>
            <button
              type="button"
              onClick={() => setChartMode('STACKED_BAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === 'STACKED_BAR'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-100'
              }`}
              title="Stacked Bar: Warga Ditangani + Kesenjangan Kasus"
            >
              Stacked + Trend
            </button>
            <button
              type="button"
              onClick={() => setChartMode('GROUPED_BAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === 'GROUPED_BAR'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-100'
              }`}
              title="Grouped Bar: Tiga Batang Berdampingan"
            >
              Grouped Bar
            </button>
            <button
              type="button"
              onClick={() => setChartMode('DUMBBELL_GAP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === 'DUMBBELL_GAP'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-100'
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
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Buka Grafik Tren Bulanan (Line Chart)"
            >
              <TrendingDown className="w-3.5 h-3.5 rotate-180 text-teal-700" />
              <span>Detail Tren Bulanan (Line Chart)</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stat Mini Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center justify-between">
            <span>Beban Skrining Sasaran</span>
            <span className="text-[9px] text-stone-500 font-mono">100% Sasaran</span>
          </p>
          <p className="text-lg font-extrabold text-black font-mono mt-0.5">
            {summaryMetrics.totalScreened.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-stone-500 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
            <span>Warga Berhasil Ditangani</span>
            <span className="text-[9px] text-emerald-800 font-mono">{summaryMetrics.avgAchievementRate}% Capaian</span>
          </p>
          <p className="text-lg font-extrabold text-emerald-950 font-mono mt-0.5">
            {summaryMetrics.totalAttended.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-emerald-800 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center justify-between">
            <span>Total Kesenjangan (Gap)</span>
            <span className="text-[9px] text-amber-800 font-mono">{summaryMetrics.avgGapRate}% Defisit</span>
          </p>
          <p className="text-lg font-extrabold text-amber-950 font-mono mt-0.5">
            {summaryMetrics.totalGap.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-amber-800 ml-1">Jiwa</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center justify-between">
            <span>Prioritas Intervensi</span>
            <span className="text-[9px] text-rose-800 font-mono">{summaryMetrics.highGapCount} Faskes</span>
          </p>
          <p className="text-lg font-extrabold text-rose-950 font-mono mt-0.5">
            {summaryMetrics.highGapCount} / {processedData.length}
            <span className="text-xs font-normal text-rose-800 ml-1">Puskesmas</span>
          </p>
        </div>
      </div>

      {/* Secondary Controls: Geo Filter, Sort Option & Interactive Legend Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs">
        {/* Left: Geo & Sort Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Geo Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-stone-600 font-medium">Wilayah:</span>
            <select
              value={geoFilter}
              onChange={(e) => setGeoFilter(e.target.value as GeoFilter)}
              className="bg-stone-50 border border-stone-300 text-black rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-700 outline-hidden cursor-pointer font-semibold"
            >
              <option value="ALL">Semua Faskes ({facilities.length})</option>
              <option value="MAINLAND">Daratan Utama</option>
              <option value="REMOTE">Pesisir & Terluar</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-stone-600 font-medium">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-stone-50 border border-stone-300 text-black rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-700 outline-hidden cursor-pointer font-semibold"
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
          <span className="text-[11px] text-stone-600 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-stone-500" />
            Legenda Interaktif:
          </span>

          {/* Series 1: Beban Skrining (Sasaran) */}
          <button
            type="button"
            onClick={() => toggleSeries('screened')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.screened
                ? 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100 shadow-2xs'
                : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Beban Skrining Sasaran"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.screened ? 'bg-sky-600' : 'bg-stone-400'}`} />
            <span>Beban Skrining</span>
            {activeSeries.screened ? <Eye className="w-3 h-3 text-sky-700" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
          </button>

          {/* Series 2: Warga Ditangani */}
          <button
            type="button"
            onClick={() => toggleSeries('attended')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.attended
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Warga Berhasil Ditangani"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.attended ? 'bg-emerald-600' : 'bg-stone-400'}`} />
            <span>Warga Ditangani</span>
            {activeSeries.attended ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
          </button>

          {/* Series 3: Kesenjangan Kasus (Gap) */}
          <button
            type="button"
            onClick={() => toggleSeries('gap')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              activeSeries.gap
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs'
                : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
            }`}
            title="Klik untuk menyembunyikan / menampilkan Kesenjangan Kasus"
          >
            <span className={`w-2.5 h-2.5 rounded-xs ${activeSeries.gap ? 'bg-amber-600' : 'bg-stone-400'}`} />
            <span>Kesenjangan Kasus</span>
            {activeSeries.gap ? <Eye className="w-3 h-3 text-amber-700" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
          </button>

          {/* Series 4: Rasio Capaian % (Hanya untuk Stacked Mode) */}
          {chartMode === 'STACKED_BAR' && (
            <button
              type="button"
              onClick={() => toggleSeries('rate')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                activeSeries.rate
                  ? 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100 shadow-2xs'
                  : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
              }`}
              title="Klik untuk menyembunyikan / menampilkan Garis Tren Capaian %"
            >
              <span className={`w-2.5 h-1 rounded-full ${activeSeries.rate ? 'bg-teal-700' : 'bg-stone-400'}`} />
              <span>Rasio %</span>
              {activeSeries.rate ? <Eye className="w-3 h-3 text-teal-700" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
            </button>
          )}

          {!allSeriesActive && (
            <button
              type="button"
              onClick={resetSeries}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-stone-700 hover:text-black bg-stone-100 border border-stone-300 transition cursor-pointer"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#44403c', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#78716c', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Jumlah Warga (Jiwa)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#78716c', fontSize: 10 },
                }}
              />
              {activeSeries.rate && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#0f766e', fontSize: 9.5, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
              )}

              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xl text-xs space-y-2 z-50 text-black min-w-[240px]">
                        <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-1.5">
                          <div>
                            <p className="font-bold text-black">{data.fullName}</p>
                            <p className="text-[10px] text-stone-500 font-medium">Kec. {data.kecamatan}</p>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              data.isRemote
                                ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                                : 'bg-teal-50 text-teal-900 border border-teal-200'
                            }`}
                          >
                            {data.geoLabel}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] pt-0.5">
                          <p className="text-sky-900 flex justify-between gap-4 font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-sky-600" />
                              Beban Skrining Sasaran:
                            </span>
                            <span className="font-bold font-mono text-black">{data.screened.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <p className="text-emerald-900 flex justify-between gap-4 font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-emerald-600" />
                              Warga Berhasil Ditangani:
                            </span>
                            <span className="font-bold font-mono text-black">{data.attended.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <p className="text-amber-900 flex justify-between gap-4 font-medium">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-xs bg-amber-600" />
                              Sisa Kesenjangan Kasus (Gap):
                            </span>
                            <span className="font-bold font-mono text-black">{data.gap.toLocaleString('id-ID')} Jiwa</span>
                          </p>
                          <div className="border-t border-stone-200 pt-1.5 flex justify-between items-center text-teal-900 font-medium">
                            <span>Tingkat Capaian Penanganan:</span>
                            <span className="font-bold font-mono text-sm">{data.achievementRate}%</span>
                          </div>
                        </div>

                        {data.isPriorityIntervention && (
                          <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-800 flex items-center gap-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-700" />
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
                  fill="#059669"
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
                  fill="#d97706"
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
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0f766e', strokeWidth: 1.5, stroke: '#faf9f6' }}
                  activeDot={{ r: 6, fill: '#115e59' }}
                />
              )}

              {activeSeries.rate && (
                <ReferenceLine
                  yAxisId="right"
                  y={50}
                  stroke="#e11d48"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: 'Standar Target SPM 50%',
                    position: 'insideTopRight',
                    fill: '#e11d48',
                    fontSize: 9.5,
                    fontWeight: 700,
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#44403c', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: '#78716c', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: 'Jumlah Warga (Jiwa)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#78716c', fontSize: 10 },
                }}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xl text-xs space-y-1.5 text-black min-w-[220px]">
                        <p className="font-bold border-b border-stone-200 pb-1 flex justify-between items-center">
                          <span>{data.fullName}</span>
                          <span className="text-[10px] text-teal-800 font-bold">{data.achievementRate}% Selesai</span>
                        </p>
                        <div className="space-y-1 text-[11px] pt-0.5">
                          <p className="text-sky-900 flex justify-between gap-3 font-medium">
                            <span>• Beban Skrining:</span>
                            <span className="font-bold font-mono text-black">{data.screened}</span>
                          </p>
                          <p className="text-emerald-900 flex justify-between gap-3 font-medium">
                            <span>• Warga Ditangani:</span>
                            <span className="font-bold font-mono text-black">{data.attended}</span>
                          </p>
                          <p className="text-amber-900 flex justify-between gap-3 font-medium">
                            <span>• Kesenjangan Kasus:</span>
                            <span className="font-bold font-mono text-black">{data.gap}</span>
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
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
              )}
              {activeSeries.gap && (
                <Bar
                  dataKey="gap"
                  name="Kesenjangan Kasus"
                  fill="#d97706"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#78716c', fontSize: 10 }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#44403c', fontSize: 10.5, fontWeight: 600 }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
                width={85}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xl text-xs space-y-1.5 text-black min-w-[220px]">
                        <p className="font-bold border-b border-stone-200 pb-1">{data.fullName}</p>
                        <div className="space-y-1 text-[11px] pt-0.5">
                          <p className="text-emerald-900 flex justify-between gap-4 font-medium">
                            <span>🟢 Realisasi Ditangani:</span>
                            <span className="font-mono font-bold text-black">{data.attended} Jiwa</span>
                          </p>
                          <p className="text-sky-900 flex justify-between gap-4 font-medium">
                            <span>🔵 Beban Sasaran:</span>
                            <span className="font-mono font-bold text-black">{data.screened} Jiwa</span>
                          </p>
                          <p className="text-amber-900 border-t border-stone-200 pt-1 flex justify-between gap-4 font-bold">
                            <span>🔴 Selisih Kesenjangan:</span>
                            <span className="font-mono font-bold text-black">{data.gap} Jiwa ({data.gapRate}%)</span>
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
                fill="#f5f5f4"
                stroke="#d6d3d1"
                barSize={10}
                radius={[0, 4, 4, 0]}
              />

              {activeSeries.attended && (
                <Scatter
                  dataKey="attended"
                  name="Warga Ditangani"
                  fill="#059669"
                  shape="circle"
                />
              )}

              {activeSeries.screened && (
                <Scatter
                  dataKey="screened"
                  name="Beban Sasaran"
                  fill="#0284c7"
                  shape="circle"
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Action Footer & Strategic Note */}
      <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-600">
          <HelpCircle className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>
            <strong className="text-black font-bold">Petunjuk Operasional:</strong> Gunakan legenda di atas untuk menyembunyikan/menampilkan metrik, atau beralih rentang waktu (7 Hari / 30 Hari / Kuartal / Tahun) untuk evaluasi tren.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-stone-600 font-medium">Standar SPM Dinkes:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-mono font-bold text-[10px] border border-emerald-200">
            ≥50% Selesai
          </span>
        </div>
      </div>
    </div>
  );
};
