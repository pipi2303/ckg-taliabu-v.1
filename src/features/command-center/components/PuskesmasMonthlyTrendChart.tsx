import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Table as TableIcon,
  LineChart as LineChartIcon,
  FileText,
} from 'lucide-react';
import {
  facilityMonthlyTrendService,
  PuskesmasTrendProfile,
  PuskesmasMonthlyDataPoint,
} from '../../../services/facilityMonthlyTrendService';

interface PuskesmasMonthlyTrendChartProps {
  facilityId: string;
  facilityName: string;
  kecamatanName: string;
  isRemoteIsland?: boolean;
  compact?: boolean;
  onExportCsv?: () => void;
}

type TrendMetricFocus =
  | 'CONTINUITY_SPM'        // Capaian Kontinuitas % vs Standar SPM (50%)
  | 'WORKLOAD_VS_ATTENDED'  // Beban Skrining vs Warga Ditangani
  | 'GAP_VS_SLA'            // Kesenjangan Kasus vs Waktu Tanggap SLA
  | 'ALL_METRICS';          // Kombo Multi-Line

type MonthRangeFilter = 'ALL_YTD' | 'LAST_6M' | 'SEMESTER_1';

interface LineToggles {
  continuity: boolean;
  screened: boolean;
  attended: boolean;
  gap: boolean;
  sla: boolean;
  dataQuality: boolean;
  spmReference: boolean;
}

export const PuskesmasMonthlyTrendChart: React.FC<PuskesmasMonthlyTrendChartProps> = ({
  facilityId,
  facilityName,
  kecamatanName,
  isRemoteIsland = false,
  compact = false,
}) => {
  // State
  const [metricFocus, setMetricFocus] = useState<TrendMetricFocus>('CONTINUITY_SPM');
  const [rangeFilter, setRangeFilter] = useState<MonthRangeFilter>('ALL_YTD');
  const [activeTab, setActiveTab] = useState<'CHART' | 'TABLE' | 'NOTES'>('CHART');

  // Interactive Legend Line Toggles
  const [activeLines, setActiveLines] = useState<LineToggles>({
    continuity: true,
    screened: true,
    attended: true,
    gap: true,
    sla: true,
    dataQuality: true,
    spmReference: true,
  });

  const toggleLine = (key: keyof LineToggles) => {
    setActiveLines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Load trend data for this specific Puskesmas
  const trendProfile: PuskesmasTrendProfile = useMemo(() => {
    return facilityMonthlyTrendService.getMonthlyTrendByFacilityId(
      facilityId,
      facilityName,
      kecamatanName,
      isRemoteIsland
    );
  }, [facilityId, facilityName, kecamatanName, isRemoteIsland]);

  // Filter months based on range
  const displayData: PuskesmasMonthlyDataPoint[] = useMemo(() => {
    const list = [...trendProfile.monthlyHistory];
    if (rangeFilter === 'LAST_6M') {
      return list.slice(-6);
    }
    if (rangeFilter === 'SEMESTER_1') {
      return list.slice(0, 6);
    }
    return list;
  }, [trendProfile, rangeFilter]);

  // Export CSV Helper
  const handleExportCsv = () => {
    const headers = [
      'Bulan',
      'Beban Skrining (Jiwa)',
      'Warga Ditangani (Jiwa)',
      'Kesenjangan (Gap)',
      'Capaian Kontinuitas (%)',
      'Target SPM (%)',
      'SLA Rata-rata (Hari)',
      'Kualitas Data (%)',
      'Kunjungan Kader',
      'Catatan Lapangan',
    ];

    const rows = trendProfile.monthlyHistory.map((d) => [
      `"${d.monthName}"`,
      d.screenedCount,
      d.attendedCount,
      d.gapCount,
      `${d.continuityRate}%`,
      `${d.targetRateSPM}%`,
      `${d.avgSlaDays} hari`,
      `${d.dataQualityRate}%`,
      d.kaderFieldVisits,
      `"${d.notes?.replace(/"/g, '""') || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tren_Kinerja_${facilityName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestMonth = displayData[displayData.length - 1];
  const isMeetingSPM = latestMonth ? latestMonth.continuityRate >= 50 : false;

  return (
    <div
      id={`trend-chart-${facilityId}`}
      className={`rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs overflow-hidden ${
        compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5 md:p-6'
      } space-y-4`}
    >
      {/* 1. Header Bar: Faskes Identity & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shadow-xs">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-black tracking-tight flex items-center gap-2">
                <span>Tren Kinerja Bulanan:</span>
                <span className="text-teal-700">{facilityName}</span>
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                  isRemoteIsland
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                {isRemoteIsland ? 'Pesisir / Kepulauan' : 'Daratan Utama'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Kecamatan {kecamatanName} · Rekam jejak fluktuasi kontinuitas, volume penanganan & efisiensi SLA bulanan (Tahun 2026).
            </p>
          </div>
        </div>

        {/* Action Controls: View Tabs, Period Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main View Tabs (Chart / Table / Notes) */}
          <div className="flex items-center gap-0.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('CHART')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'CHART'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Tren Longitudinal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'TABLE'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Presisi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NOTES')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'NOTES'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-black hover:bg-stone-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Konteks Lapangan</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Unduh Data Riwayat Bulanan (.CSV)"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Key Insights & Fluctuation Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Capaian Terkini */}
        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>Capaian Terkini ({latestMonth?.monthShort})</span>
            {latestMonth && latestMonth.momGrowth > 0 ? (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center">
                <ArrowUpRight className="w-3 h-3" />+{latestMonth.momGrowth}% MoM
              </span>
            ) : latestMonth && latestMonth.momGrowth < 0 ? (
              <span className="text-[10px] font-bold text-rose-600 flex items-center">
                <ArrowDownRight className="w-3 h-3" />
                {latestMonth.momGrowth}% MoM
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-400 flex items-center">
                <Minus className="w-3 h-3" /> 0% MoM
              </span>
            )}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-xl font-extrabold font-mono ${
                isMeetingSPM ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {latestMonth ? `${latestMonth.continuityRate}%` : '—'}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              ({latestMonth?.attendedCount} / {latestMonth?.screenedCount} jiwa)
            </span>
          </div>
        </div>

        {/* Rata-rata Semester */}
        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
            Rata-rata Semester
          </p>
          <p className="text-xl font-extrabold text-teal-700 font-mono mt-1">
            {trendProfile.summary.avgContinuityRate}%
            <span className="text-xs font-normal text-stone-500 ml-1.5">
              {trendProfile.summary.avgContinuityRate >= 50 ? 'Memenuhi SPM' : 'Di Bawah SPM'}
            </span>
          </p>
        </div>

        {/* Rekor Puncak & Terendah */}
        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
            Bulan Puncak (Peak)
          </p>
          <p className="text-sm font-bold text-black mt-1">
            {trendProfile.summary.highestMonth.month.split(' ')[0]} :{' '}
            <span className="text-emerald-700 font-mono font-bold">
              {trendProfile.summary.highestMonth.rate}%
            </span>
          </p>
          <p className="text-[10px] text-stone-500">
            Terendah: {trendProfile.summary.lowestMonth.month.split(' ')[0]} ({trendProfile.summary.lowestMonth.rate}%)
          </p>
        </div>

        {/* Waktu Tanggap / SLA Rata-rata */}
        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
            Rata-rata Waktu Tanggap
          </p>
          <p className="text-xl font-extrabold text-indigo-700 font-mono mt-1">
            {latestMonth?.avgSlaDays}
            <span className="text-xs font-normal text-stone-500 ml-1">Hari Kerja</span>
          </p>
        </div>
      </div>

      {/* 3. Secondary Controls: Metric Selector, Period Range & Interactive Series Legend */}
      {activeTab === 'CHART' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs">
          {/* Left: Metric Focus & Period Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-stone-500 font-medium">Fokus Metrik:</span>
              <select
                value={metricFocus}
                onChange={(e) => setMetricFocus(e.target.value as TrendMetricFocus)}
                className="bg-[#faf9f6] border border-stone-300 text-stone-800 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 outline-hidden cursor-pointer"
              >
                <option value="CONTINUITY_SPM">Capaian % vs Target SPM (50%)</option>
                <option value="WORKLOAD_VS_ATTENDED">Beban Skrining vs Realisasi Ditangani</option>
                <option value="GAP_VS_SLA">Kesenjangan Kasus vs Waktu Tanggap SLA</option>
                <option value="ALL_METRICS">Semua Metrik (Multi-Line)</option>
              </select>
            </div>

            {/* Range Filter */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-stone-500 font-medium">Periode:</span>
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value as MonthRangeFilter)}
                className="bg-[#faf9f6] border border-stone-300 text-stone-800 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 outline-hidden cursor-pointer"
              >
                <option value="ALL_YTD">Tahun 2026 Berjalan (8 Bulan)</option>
                <option value="LAST_6M">6 Bulan Terakhir</option>
                <option value="SEMESTER_1">Semester I (Jan - Jun)</option>
              </select>
            </div>
          </div>

          {/* Right: Interactive Legend Series Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-stone-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-stone-500" />
              Legenda:
            </span>

            {/* Toggle Capaian % */}
            {(metricFocus === 'CONTINUITY_SPM' || metricFocus === 'ALL_METRICS') && (
              <button
                type="button"
                onClick={() => toggleLine('continuity')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  activeLines.continuity
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-stone-100 text-stone-800 border-stone-300 line-through opacity-70'
                }`}
                title="Toggle Garis Capaian Kontinuitas %"
              >
                <span className={`w-2.5 h-1 rounded-full ${activeLines.continuity ? 'bg-emerald-600' : 'bg-stone-600'}`} />
                <span>Capaian %</span>
                {activeLines.continuity ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-stone-700" />}
              </button>
            )}

            {/* Toggle Beban Sasaran */}
            {(metricFocus === 'WORKLOAD_VS_ATTENDED' || metricFocus === 'ALL_METRICS') && (
              <button
                type="button"
                onClick={() => toggleLine('screened')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  activeLines.screened
                    ? 'bg-sky-50 text-sky-900 border-sky-300'
                    : 'bg-stone-100 text-stone-800 border-stone-300 line-through opacity-70'
                }`}
                title="Toggle Garis Beban Skrining Sasaran"
              >
                <span className={`w-2.5 h-1 rounded-full ${activeLines.screened ? 'bg-sky-600' : 'bg-stone-600'}`} />
                <span>Beban Sasaran</span>
                {activeLines.screened ? <Eye className="w-3 h-3 text-sky-700" /> : <EyeOff className="w-3 h-3 text-stone-700" />}
              </button>
            )}

            {/* Toggle Warga Ditangani */}
            {(metricFocus === 'WORKLOAD_VS_ATTENDED' || metricFocus === 'ALL_METRICS') && (
              <button
                type="button"
                onClick={() => toggleLine('attended')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  activeLines.attended
                    ? 'bg-teal-50 text-teal-900 border-teal-300'
                    : 'bg-stone-100 text-stone-800 border-stone-300 line-through opacity-70'
                }`}
                title="Toggle Garis Realisasi Warga Ditangani"
              >
                <span className={`w-2.5 h-1 rounded-full ${activeLines.attended ? 'bg-teal-600' : 'bg-stone-600'}`} />
                <span>Ditangani</span>
                {activeLines.attended ? <Eye className="w-3 h-3 text-teal-700" /> : <EyeOff className="w-3 h-3 text-stone-700" />}
              </button>
            )}

            {/* Toggle Gap Kasus */}
            {(metricFocus === 'GAP_VS_SLA' || metricFocus === 'ALL_METRICS') && (
              <button
                type="button"
                onClick={() => toggleLine('gap')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  activeLines.gap
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-800 border-stone-300 line-through opacity-70'
                }`}
                title="Toggle Garis Kesenjangan Kasus (Gap)"
              >
                <span className={`w-2.5 h-1 rounded-full ${activeLines.gap ? 'bg-amber-600' : 'bg-stone-600'}`} />
                <span>Gap Kasus</span>
                {activeLines.gap ? <Eye className="w-3 h-3 text-amber-700" /> : <EyeOff className="w-3 h-3 text-stone-700" />}
              </button>
            )}

            {/* Toggle SLA Respon */}
            {(metricFocus === 'GAP_VS_SLA' || metricFocus === 'ALL_METRICS') && (
              <button
                type="button"
                onClick={() => toggleLine('sla')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  activeLines.sla
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                    : 'bg-stone-100 text-stone-800 border-stone-300 line-through opacity-70'
                }`}
                title="Toggle Garis Waktu Tanggap / SLA (Hari)"
              >
                <span className={`w-2.5 h-1 rounded-full ${activeLines.sla ? 'bg-indigo-600' : 'bg-stone-600'}`} />
                <span>SLA (Hari)</span>
                {activeLines.sla ? <Eye className="w-3 h-3 text-indigo-700" /> : <EyeOff className="w-3 h-3 text-stone-700" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Display Area: Line Chart or Precision Table or Context Notes */}
      {activeTab === 'CHART' ? (
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 15, right: 25, left: -10, bottom: 20 }}
            >
              <defs>
                <linearGradient id={`continuityGrad-${facilityId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`gapGrad-${facilityId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="monthShort"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />

              {/* Left Y-Axis */}
              <YAxis
                yAxisId="left"
                domain={metricFocus === 'CONTINUITY_SPM' ? [0, 100] : ['auto', 'auto']}
                unit={metricFocus === 'CONTINUITY_SPM' ? '%' : ''}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value:
                    metricFocus === 'CONTINUITY_SPM'
                      ? 'Capaian Kontinuitas (%)'
                      : metricFocus === 'WORKLOAD_VS_ATTENDED'
                      ? 'Jumlah Warga (Jiwa)'
                      : 'Nilai Metrik',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#64748b', fontSize: 10 },
                }}
              />

              {/* Right Y-Axis for Multi-metric or SLA */}
              {(metricFocus === 'GAP_VS_SLA' || metricFocus === 'ALL_METRICS') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 15]}
                  unit=" hr"
                  tick={{ fill: '#818cf8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
              )}

              {/* Custom High-Precision Tooltip */}
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PuskesmasMonthlyDataPoint;
                    return (
                      <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-2 z-50 text-white min-w-[260px]">
                        {/* Tooltip Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                          <div>
                            <p className="font-bold text-white text-sm">{data.monthName}</p>
                            <p className="text-[10px] text-slate-400">{facilityName}</p>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              data.continuityRate >= 50
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {data.continuityRate >= 50 ? 'SPM Tercapai' : 'Di Bawah SPM'}
                          </span>
                        </div>

                        {/* Metrics Breakdown */}
                        <div className="space-y-1.5 text-[11px] pt-0.5">
                          <div className="flex justify-between items-center text-emerald-300 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                            <span className="font-medium">Capaian Kontinuitas:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold font-mono text-sm">{data.continuityRate}%</span>
                              {data.momGrowth !== 0 && (
                                <span
                                  className={`text-[9px] font-bold ${
                                    data.momGrowth > 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  ({data.momGrowth > 0 ? `+${data.momGrowth}` : data.momGrowth}%)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                            <p className="text-sky-300 flex justify-between">
                              <span>• Beban Skrining:</span>
                              <strong className="font-mono">{data.screenedCount} Jiwa</strong>
                            </p>
                            <p className="text-teal-300 flex justify-between">
                              <span>• Ditangani:</span>
                              <strong className="font-mono">{data.attendedCount} Jiwa</strong>
                            </p>
                            <p className="text-amber-300 flex justify-between">
                              <span>• Gap Kasus:</span>
                              <strong className="font-mono">{data.gapCount} Kasus</strong>
                            </p>
                            <p className="text-indigo-300 flex justify-between">
                              <span>• SLA Respon:</span>
                              <strong className="font-mono">{data.avgSlaDays} Hari</strong>
                            </p>
                          </div>
                        </div>

                        {/* Local Notes / Weather Insight */}
                        {data.notes && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 shrink-0 text-teal-400 mt-0.5" />
                            <span>{data.notes}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* SPM Reference Line (50%) */}
              {(metricFocus === 'CONTINUITY_SPM' || metricFocus === 'ALL_METRICS') &&
                activeLines.spmReference && (
                  <ReferenceLine
                    yAxisId="left"
                    y={50}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Target SPM 50%',
                      position: 'insideTopRight',
                      fill: '#fb7185',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                )}

              {/* Area Shading for Continuity */}
              {metricFocus === 'CONTINUITY_SPM' && activeLines.continuity && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="continuityRate"
                  stroke="none"
                  fill={`url(#continuityGrad-${facilityId})`}
                />
              )}

              {/* Line 1: Continuity Rate % */}
              {(metricFocus === 'CONTINUITY_SPM' || metricFocus === 'ALL_METRICS') &&
                activeLines.continuity && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="continuityRate"
                    name="Capaian %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

              {/* Line 2: Beban Skrining Sasaran */}
              {(metricFocus === 'WORKLOAD_VS_ATTENDED' || metricFocus === 'ALL_METRICS') &&
                activeLines.screened && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="screenedCount"
                    name="Beban Sasaran"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ r: 3.5, fill: '#0284c7' }}
                  />
                )}

              {/* Line 3: Warga Ditangani */}
              {(metricFocus === 'WORKLOAD_VS_ATTENDED' || metricFocus === 'ALL_METRICS') &&
                activeLines.attended && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="attendedCount"
                    name="Warga Ditangani"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#14b8a6' }}
                  />
                )}

              {/* Line 4: Kesenjangan Kasus (Gap) */}
              {(metricFocus === 'GAP_VS_SLA' || metricFocus === 'ALL_METRICS') &&
                activeLines.gap && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="gapCount"
                    name="Gap Kasus"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                )}

              {/* Line 5: SLA Respon (Hari) */}
              {(metricFocus === 'GAP_VS_SLA' || metricFocus === 'ALL_METRICS') &&
                activeLines.sla && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgSlaDays"
                    name="Waktu SLA (Hari)"
                    stroke="#818cf8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#818cf8' }}
                  />
                )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : activeTab === 'TABLE' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Sasaran</th>
                <th className="py-2.5 px-3 text-right">Ditangani</th>
                <th className="py-2.5 px-3 text-right">Gap</th>
                <th className="py-2.5 px-3 text-right">Capaian %</th>
                <th className="py-2.5 px-3 text-right">MoM %</th>
                <th className="py-2.5 px-3 text-right">SLA (Hari)</th>
                <th className="py-2.5 px-3 text-center">Status SPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-stone-800">
              {displayData.map((d) => (
                <tr key={d.monthKey} className="hover:bg-stone-50 transition">
                  <td className="py-2 px-3 font-sans font-medium text-black">{d.monthName}</td>
                  <td className="py-2 px-3 text-right text-sky-700">{d.screenedCount}</td>
                  <td className="py-2 px-3 text-right text-emerald-700 font-bold">{d.attendedCount}</td>
                  <td className="py-2 px-3 text-right text-amber-700">{d.gapCount}</td>
                  <td className="py-2 px-3 text-right text-teal-700 font-bold">{d.continuityRate}%</td>
                  <td className="py-2 px-3 text-right">
                    {d.momGrowth > 0 ? (
                      <span className="text-emerald-700">+{d.momGrowth}%</span>
                    ) : d.momGrowth < 0 ? (
                      <span className="text-rose-600">{d.momGrowth}%</span>
                    ) : (
                      <span className="text-stone-400">0%</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-indigo-700">{d.avgSlaDays} hr</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        d.continuityRate >= 50
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {d.continuityRate >= 50 ? 'SPM' : 'Defisit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Notes & Maritime Weather Insights View */
        <div className="space-y-2">
          {displayData.map((d) => (
            <div
              key={d.monthKey}
              className="p-3 rounded-xl bg-white border border-stone-200 text-xs flex items-start justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-black flex items-center gap-2">
                  <span>{d.monthName}</span>
                  <span className="text-[10px] text-teal-700 font-mono">
                    ({d.continuityRate}% Capaian · SLA {d.avgSlaDays} hari)
                  </span>
                </p>
                <p className="text-stone-600 text-[11px] leading-relaxed">{d.notes}</p>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                  d.continuityRate >= 50
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                {d.continuityRate >= 50 ? 'Memenuhi Standar' : 'Perlu Pendampingan'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 5. Executive Strategic Summary Box */}
      <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong className="text-black font-semibold">Analisis Fluktuasi Eksekutif:</strong>{' '}
            {trendProfile.summary.fluctuationSummary}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-stone-500">Target SPM Dinkes:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] border border-emerald-300">
            &ge;50% Selesai
          </span>
        </div>
      </div>
    </div>
  );
};
