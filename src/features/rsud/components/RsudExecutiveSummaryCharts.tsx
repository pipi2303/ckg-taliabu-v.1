import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
} from 'recharts';
import {
  GitBranch,
  Clock,
  Building2,
  Activity,
  Ban,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tooltip as UiTooltip } from '../../../components/common/Tooltip';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import {
  ReferralCascadeSummary,
  SourcePuskesmasRow,
  RejectionRow,
} from '../../../services/rsudExecutiveService';
import { RsudServiceReadiness } from '../../../types';

interface SlaBucket {
  slaCode: string;
  label: string;
  targetHours: number;
  onTimeCount: number;
  breachedCount: number;
  pendingWithinTargetCount: number;
}

interface RsudExecutiveSummaryChartsProps {
  cascade: ReferralCascadeSummary | null;
  sla: {
    responseSla: SlaBucket;
    replySlaRoutine: SlaBucket;
    replySlaHighPriority: SlaBucket;
  } | null;
  sourceRows: SourcePuskesmasRow[];
  readiness: RsudServiceReadiness[];
  rejections: RejectionRow[];
  onNavigateTab?: (tabId: string) => void;
}

export const RsudExecutiveSummaryCharts: React.FC<RsudExecutiveSummaryChartsProps> = ({
  cascade,
  sla,
  sourceRows,
  readiness,
  rejections,
  onNavigateTab,
}) => {
  const [cascadeViewMode, setCascadeViewMode] = useState<'VOLUME' | 'RATE'>('VOLUME');

  // 1. Cascade Data Transform
  const cascadeChartData = React.useMemo(() => {
    if (!cascade || cascade.stages.length === 0) {
      return [
        { stage: 'Rujukan Masuk', count: 12, rate: 100, color: '#0d9488' },
        { stage: 'Diterima RSUD', count: 10, rate: 83.3, color: '#0f766e' },
        { stage: 'Terjadwal', count: 8, rate: 66.7, color: '#0369a1' },
        { stage: 'Pasien Hadir', count: 7, rate: 58.3, color: '#0284c7' },
        { stage: 'Pelayanan Selesai', count: 7, rate: 58.3, color: '#059669' },
        { stage: 'Balasan Terkirim', count: 5, rate: 41.7, color: '#d97706' },
        { stage: 'Ditinjau Puskesmas', count: 3, rate: 25.0, color: '#7c3aed' },
        { stage: 'Closed Loop', count: 3, rate: 25.0, color: '#16a34a' },
      ];
    }
    const initialCount = cascade.stages[0]?.count || 1;
    return cascade.stages.map((st, i) => {
      const colors = ['#0d9488', '#0f766e', '#0369a1', '#0284c7', '#059669', '#d97706', '#7c3aed', '#16a34a'];
      const rate = Math.round((st.count / (initialCount || 1)) * 1000) / 10;
      return {
        stage: st.label,
        count: st.count,
        rate,
        color: colors[i % colors.length],
      };
    });
  }, [cascade]);

  // 2. SLA Data Transform
  const slaChartData = React.useMemo(() => {
    if (!sla) {
      return [
        { category: 'Respons Rujukan', target: '< 48 Jam', onTime: 10, pending: 1, breached: 1, total: 12, compliance: 83.3 },
        { category: 'Balasan Rutin', target: '< 72 Jam', onTime: 4, pending: 1, breached: 1, total: 6, compliance: 66.7 },
        { category: 'Balasan Prioritas', target: '< 24 Jam', onTime: 1, pending: 0, breached: 1, total: 2, compliance: 50.0 },
      ];
    }
    const items = [
      { name: 'Respons Penerimaan', bucket: sla.responseSla, target: `< ${sla.responseSla.targetHours} Jam` },
      { name: 'Balasan Klinis Rutin', bucket: sla.replySlaRoutine, target: `< ${sla.replySlaRoutine.targetHours} Jam` },
      { name: 'Balasan Prioritas Tinggi', bucket: sla.replySlaHighPriority, target: `< ${sla.replySlaHighPriority.targetHours} Jam` },
    ];
    return items.map((it) => {
      const b = it.bucket;
      const total = b.onTimeCount + b.pendingWithinTargetCount + b.breachedCount || 1;
      const compliance = Math.round((b.onTimeCount / total) * 1000) / 10;
      return {
        category: it.name,
        target: it.target,
        onTime: b.onTimeCount,
        pending: b.pendingWithinTargetCount,
        breached: b.breachedCount,
        total,
        compliance,
      };
    });
  }, [sla]);

  // 3. Puskesmas Network Data Transform
  const puskesmasChartData = React.useMemo(() => {
    if (!sourceRows || sourceRows.length === 0) {
      return [
        { name: 'Pkm Bobong', total: 4, serviced: 3, closedLoop: 2, closedLoopRate: 50.0, overdue: 0 },
        { name: 'Pkm Lede', total: 3, serviced: 2, closedLoop: 1, closedLoopRate: 33.3, overdue: 0 },
        { name: 'Pkm Taliabu B.L.', total: 2, serviced: 1, closedLoop: 0, closedLoopRate: 0.0, overdue: 1 },
        { name: 'Pkm Tabona', total: 1, serviced: 1, closedLoop: 0, closedLoopRate: 0.0, overdue: 0 },
        { name: 'Pkm Gela', total: 1, serviced: 0, closedLoop: 0, closedLoopRate: 0.0, overdue: 0 },
        { name: 'Pkm Loseng', total: 1, serviced: 0, closedLoop: 0, closedLoopRate: 0.0, overdue: 0 },
      ];
    }
    return sourceRows.map((r) => {
      const closedLoopRate = r.total > 0 ? Math.round((r.closedLoop / r.total) * 1000) / 10 : 0;
      return {
        name: r.facilityName.replace('Puskesmas ', 'Pkm '),
        total: r.total,
        serviced: r.serviceCompleted,
        closedLoop: r.closedLoop,
        closedLoopRate,
        overdue: r.overdueCount,
      };
    });
  }, [sourceRows]);

  // 4. Service Readiness & Capacity Data Transform
  const readinessChartData = React.useMemo(() => {
    if (!readiness || readiness.length === 0) {
      return [
        { service: 'Penyakit Dalam', demand: 5, capacity: 8, utilization: 62.5, specialists: '1/1 Tersedia', status: 'READY' },
        { service: 'Kardiologi', demand: 3, capacity: 4, utilization: 75.0, specialists: '1/1 Visit', status: 'READY' },
        { service: 'Mata (Sp.M)', demand: 2, capacity: 3, utilization: 66.7, specialists: '1/1 Tersedia', status: 'READY' },
        { service: 'Anak (Sp.A)', demand: 2, capacity: 2, utilization: 100.0, specialists: '1/1 Tersedia', status: 'LIMITED' },
        { service: 'Kebidanan (Sp.OG)', demand: 2, capacity: 4, utilization: 50.0, specialists: '1/1 Tersedia', status: 'READY' },
        { service: 'Bedah Umum', demand: 1, capacity: 3, utilization: 33.3, specialists: '1/1 Tersedia', status: 'READY' },
        { service: 'Lab & Radiologi', demand: 11, capacity: 15, utilization: 73.3, specialists: '2/2 Tersedia', status: 'READY' },
      ];
    }
    return readiness.map((rd) => {
      const util = rd.utilizationPercent !== undefined
        ? rd.utilizationPercent
        : rd.capacityCount > 0
        ? Math.round((rd.demandCount / rd.capacityCount) * 1000) / 10
        : 0;
      return {
        service: rd.serviceName,
        demand: rd.demandCount,
        capacity: rd.capacityCount,
        utilization: util,
        specialists: `${rd.specialistsAvailable}/${rd.specialistsTotal} Spesialis`,
        status: rd.capabilityStatus,
      };
    });
  }, [readiness]);

  // 5. Rejection Breakdown Data Transform
  const rejectionChartData = React.useMemo(() => {
    if (!rejections || rejections.length === 0) {
      return [
        { reason: 'Kapasitas Penuh (HCU/Kamar Operasi)', count: 1, pct: 50, color: '#f43f5e' },
        { reason: 'Spesialis Cuti / Jadwal Kunjungan', count: 1, pct: 50, color: '#f59e0b' },
      ];
    }
    const total = rejections.reduce((sum, r) => sum + r.count, 0) || 1;
    const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];
    return rejections.map((r, idx) => ({
      reason: r.label,
      count: r.count,
      pct: Math.round((r.count / total) * 1000) / 10,
      color: colors[idx % colors.length],
    }));
  }, [rejections]);

  return (
    <div className="space-y-8 mt-6">
      {/* SECTION 1: KASKADE RUJUKAN MASUK RSUD */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF3F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">
                  Kaskade & Kontinuitas Rujukan Masuk RSUD
                </h3>
                <DocBadge code="SCR-RSD-B01" size="xs" />
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">
                Alur konversi pasien rujukan CKG mulai dari surat diterbitkan, diterima, pelayanan dokter spesialis, hingga umpan balik ke FKTP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCascadeViewMode('VOLUME')}
                className={`px-3 py-1 rounded-md transition ${
                  cascadeViewMode === 'VOLUME'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Volume Kasus
              </button>
              <button
                type="button"
                onClick={() => setCascadeViewMode('RATE')}
                className={`px-3 py-1 rounded-md transition ${
                  cascadeViewMode === 'RATE'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Retensi (%)
              </button>
            </div>
            {onNavigateTab && (
              <ActionIconButton
                icon={<ArrowUpRight className="w-4 h-4 text-teal-700" />}
                tooltip="Buka Analisis Detail Kaskade & Kontinuitas Rujukan (SCR-RSD-B01)"
                tooltipPosition="left"
                size="sm"
                variant="outline"
                onClick={() => onNavigateTab('cascade')}
                className="bg-teal-50 hover:bg-teal-100 border-teal-200"
              />
            )}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cascadeChartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE8" />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 11, fill: '#4A5568' }}
                angle={-15}
                textAnchor="end"
                interval={0}
                stroke="#CBD5E1"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#4A5568' }}
                stroke="#CBD5E1"
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#0d9488' }}
                stroke="#CBD5E1"
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-teal-200 shadow-lg text-xs space-y-1">
                        <p className="font-bold text-black border-b border-gray-100 pb-1">{data.stage}</p>
                        <p className="text-teal-800 font-semibold flex justify-between gap-4">
                          <span>Jumlah Pasien:</span>
                          <span className="font-bold">{data.count} Kasus</span>
                        </p>
                        <p className="text-sky-700 flex justify-between gap-4">
                          <span>Tingkat Retensi:</span>
                          <span className="font-bold">{data.rate}% dari rujukan awal</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
              />
              <Bar
                yAxisId="left"
                dataKey="count"
                name="Jumlah Pasien (Kasus)"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              >
                {cascadeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                name="Konversi / Retensi (%)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0284c7', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#EDF3F1] text-[11px]">
          <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-100">
            <span className="text-teal-700 font-medium">Rujukan Masuk Total</span>
            <p className="text-sm font-bold text-teal-950">{cascadeChartData[0]?.count || 0} Kasus</p>
          </div>
          <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-100">
            <span className="text-sky-700 font-medium">Telah Dilayani RSUD</span>
            <p className="text-sm font-bold text-sky-950">{cascadeChartData[4]?.count || 0} Kasus</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
            <span className="text-amber-700 font-medium">Menunggu Balasan Klinis</span>
            <p className="text-sm font-bold text-amber-950">
              {Math.max(0, (cascadeChartData[4]?.count || 0) - (cascadeChartData[5]?.count || 0))} Kasus
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <span className="text-emerald-700 font-medium">Closed-Loop Selesai</span>
            <p className="text-sm font-bold text-emerald-950">
              {cascadeChartData[7]?.count || 0} Kasus ({cascadeChartData[7]?.rate || 0}%)
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: KEPATUHAN WAKTU TANGGAP & SLA RUJUKAN */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF3F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">
                  Kepatuhan Standar Waktu Tanggap & SLA Balasan Klinis
                </h3>
                <DocBadge code="SCR-RSD-A02" size="xs" />
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">
                Evaluasi kecepatan respons verifikasi penerimaan rujukan dan ketepatan pengiriman resume medis ke Puskesmas
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <ActionIconButton
              icon={<ArrowUpRight className="w-4 h-4 text-blue-700" />}
              tooltip="Buka Analisis Detail Standar SLA & Kepatuhan Waktu Tanggap (SCR-RSD-A02)"
              tooltipPosition="left"
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('sla')}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Stacked Bar Chart */}
          <div className="lg:col-span-8 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={slaChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5EAE8" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#4A5568' }} stroke="#CBD5E1" />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                  width={130}
                  stroke="#CBD5E1"
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-black border-b border-gray-100 pb-1">{data.category}</p>
                          <p className="text-gray-600">Target SLA: <span className="font-semibold text-black">{data.target}</span></p>
                          <p className="text-emerald-700 font-semibold">Tepat Waktu: {data.onTime} Kasus</p>
                          <p className="text-amber-700 font-semibold">Dalam Target (Pending): {data.pending} Kasus</p>
                          <p className="text-rose-700 font-semibold">Melewati Batas (Breached): {data.breached} Kasus</p>
                          <p className="text-teal-900 font-bold pt-1 border-t border-gray-100">Kepatuhan: {data.compliance}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 11 }} />
                <Bar dataKey="onTime" name="Tepat Waktu (On-Time)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={28} />
                <Bar dataKey="pending" name="Dalam Target (Pending)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={28} />
                <Bar dataKey="breached" name="Melewati SLA (Breached)" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SLA Performance Cards */}
          <div className="lg:col-span-4 space-y-2.5">
            {slaChartData.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[#EDF3F1] bg-[#F8FAFA] flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-black">{item.category}</p>
                  <p className="text-[11px] text-gray-500">Target: {item.target}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.compliance >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : item.compliance >= 60
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {item.compliance}%
                  </span>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {item.onTime}/{item.total} Patuh
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: JEJARING RUJUKAN 8 PUSKESMAS & CLOSED-LOOP RATE */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF3F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">
                  Distribusi Asal Rujukan & Umpan Balik per Puskesmas
                </h3>
                <DocBadge code="SCR-RSD-B02" size="xs" />
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">
                Pemetaan volume rujukan masuk, jumlah pasien yang telah tertangani, dan rasio closed-loop dari 8 Puskesmas se-Kabupaten
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <ActionIconButton
              icon={<ArrowUpRight className="w-4 h-4 text-indigo-700" />}
              tooltip="Buka Analisis Jejaring Rujukan Lengkap 8 Puskesmas (SCR-RSD-B02)"
              tooltipPosition="left"
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('network')}
              className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
            />
          )}
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={puskesmasChartData} margin={{ top: 10, right: 20, left: -10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE8" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A5568' }} stroke="#CBD5E1" />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4A5568' }} stroke="#CBD5E1" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#6366f1' }}
                stroke="#CBD5E1"
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-indigo-200 shadow-lg text-xs space-y-1">
                        <p className="font-bold text-black border-b border-gray-100 pb-1">{data.name}</p>
                        <p className="text-teal-800 flex justify-between gap-4">
                          <span>Total Rujukan:</span>
                          <span className="font-bold">{data.total} Kasus</span>
                        </p>
                        <p className="text-sky-700 flex justify-between gap-4">
                          <span>Pelayanan Selesai:</span>
                          <span className="font-bold">{data.serviced} Kasus</span>
                        </p>
                        <p className="text-emerald-700 flex justify-between gap-4">
                          <span>Closed Loop Selesai:</span>
                          <span className="font-bold">{data.closedLoop} Kasus</span>
                        </p>
                        <p className="text-indigo-800 font-bold pt-1 border-t border-gray-100 flex justify-between gap-4">
                          <span>Rasio Closed-Loop:</span>
                          <span>{data.closedLoopRate}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="total" name="Total Rujukan" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar yAxisId="left" dataKey="serviced" name="Pelayanan Selesai" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar yAxisId="left" dataKey="closedLoop" name="Closed-Loop Lengkap" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="closedLoopRate"
                name="Rasio Closed Loop (%)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: KESIAPAN LAYANAN, KAPASITAS & UTILISASI POLIKLINIK/SPESIALIS */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF3F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">
                  Kapasitas, Beban Kebutuhan & Utilisasi Layanan Spesialis RSUD
                </h3>
                <DocBadge code="SCR-RSD-C01" size="xs" />
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">
                Keseimbangan antara volume rujukan masuk (demand) terhadap daya tampung poliklinik spesialis dan fasilitas penunjang
              </p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={readinessChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE8" />
              <XAxis
                dataKey="service"
                tick={{ fontSize: 11, fill: '#4A5568' }}
                angle={-10}
                textAnchor="end"
                interval={0}
                stroke="#CBD5E1"
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4A5568' }} stroke="#CBD5E1" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 120]}
                unit="%"
                tick={{ fontSize: 11, fill: '#d97706' }}
                stroke="#CBD5E1"
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-emerald-200 shadow-lg text-xs space-y-1">
                        <p className="font-bold text-black border-b border-gray-100 pb-1">{data.service}</p>
                        <p className="text-teal-800 flex justify-between gap-4">
                          <span>Permintaan Masuk:</span>
                          <span className="font-bold">{data.demand} Kasus</span>
                        </p>
                        <p className="text-sky-700 flex justify-between gap-4">
                          <span>Kapasitas Tersedia:</span>
                          <span className="font-bold">{data.capacity} Slot</span>
                        </p>
                        <p className="text-amber-800 font-bold flex justify-between gap-4">
                          <span>Tingkat Utilisasi:</span>
                          <span>{data.utilization}%</span>
                        </p>
                        <p className="text-gray-600 text-[11px] pt-1 border-t border-gray-100">
                          Kesiapan: {data.specialists} ({data.status})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="demand" name="Permintaan Rujukan (Demand)" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar yAxisId="left" dataKey="capacity" name="Kapasitas Slot (Capacity)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
                name="Tingkat Utilisasi (%)"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 5: ANALISIS PENOLAKAN & PENGALIHAN RUJUKAN */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDF3F1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black tracking-tight">
                  Analisis Penyebab Penolakan & Pengalihan Kasus Rujukan
                </h3>
                <DocBadge code="SCR-RSD-B03" size="xs" />
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">
                Identifikasi faktor struktural kendala faskes rujukan guna perbaikan tata kelola kapasitas dan jejaring rujukan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Bar Chart Reasons */}
          <div className="md:col-span-7 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rejectionChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5EAE8" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#4A5568' }} stroke="#CBD5E1" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="reason"
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                  width={190}
                  stroke="#CBD5E1"
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-rose-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-black border-b border-gray-100 pb-1">{data.reason}</p>
                          <p className="text-rose-700 font-semibold">Kasus Ditolak/Dialihkan: {data.count} Pasien</p>
                          <p className="text-gray-600">Kontribusi: {data.pct}% dari seluruh penolakan</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Kasus Ditolak / Dialihkan" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {rejectionChartData.map((entry, index) => (
                    <Cell key={`rejection-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Actionable Notes */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-950 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span>Prinsip Tata Kelola Penolakan RSUD</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-900/90">
                Penolakan rujukan di RSUD dicatat sebagai kendala kapasitas struktural faskes rujukan (bukan kesalahan warga), dan segera dikoordinasikan untuk pengalihan ke fasilitas lanjutan atau penjadwalan ulang saat dokter spesialis siap.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-black">Tindakan Mitigasi Terkini:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                <li>Koordinasi jadwal dokter spesialis tamu (Sp.JP & Sp.M) setiap bulan.</li>
                <li>Sinkronisasi kapasitas ranap & HCU harian dengan Command Center Dinkes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
