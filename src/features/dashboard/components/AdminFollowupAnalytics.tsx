import React, { useState } from 'react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
  Users,
  ShieldCheck,
  Building2,
  Flame,
  Sparkles,
  BarChart3,
} from 'lucide-react';

interface FunnelStep {
  stepNumber: number;
  label: string;
  count: number;
  conversionPercent: number;
  description: string;
  colorClass: string;
}

const FUNNEL_STEPS: FunnelStep[] = [
  {
    stepNumber: 1,
    label: 'Skrining Berisiko Terdeteksi',
    count: 1250,
    conversionPercent: 100,
    description: 'Warga dengan klasifikasi Hipertensi, DM, Obesitas atau Temuan Kritis',
    colorClass: 'bg-rose-500',
  },
  {
    stepNumber: 2,
    label: 'Care Task Pendampingan Terbit',
    count: 1195,
    conversionPercent: 95.6,
    description: 'Tugas otomatis terbit ke dashboard Posyandu & Faskes pengampu',
    colorClass: 'bg-orange-500',
  },
  {
    stepNumber: 3,
    label: 'Kunjungan Kader Terjadwal / Selesai',
    count: 1080,
    conversionPercent: 86.4,
    description: 'Kader melakukan edukasi door-to-door dan pendampingan warga',
    colorClass: 'bg-amber-500',
  },
  {
    stepNumber: 4,
    label: 'Konfirmasi Faskes / Dokter FKTP',
    count: 940,
    conversionPercent: 75.2,
    description: 'Pemeriksaan lanjutan di Poli Puskesmas & diagnosis definitif',
    colorClass: 'bg-teal-600',
  },
  {
    stepNumber: 5,
    label: 'Terapi Berjalan & Outcome Terkontrol',
    count: 810,
    conversionPercent: 64.8,
    description: 'Warga patuh minum obat (Amlodipine/Metformin) dan tekanan darah stabil',
    colorClass: 'bg-emerald-600',
  },
];

interface PuskesmasSlaData {
  name: string;
  onTrack: number; // < 7 hari
  warning: number; // 7-14 hari
  overdue: number; // > 14 hari
  totalActive: number;
  complianceRate: number;
}

const PUSKESMAS_SLA_DATA: PuskesmasSlaData[] = [
  { name: 'Bobong', onTrack: 65, warning: 12, overdue: 4, totalActive: 81, complianceRate: 95.1 },
  { name: 'Lede', onTrack: 34, warning: 8, overdue: 3, totalActive: 45, complianceRate: 93.3 },
  { name: 'Gela', onTrack: 28, warning: 6, overdue: 2, totalActive: 36, complianceRate: 94.4 },
  { name: 'Wayaloar', onTrack: 25, warning: 7, overdue: 5, totalActive: 37, complianceRate: 86.5 },
  { name: 'Samuya', onTrack: 20, warning: 5, overdue: 2, totalActive: 27, complianceRate: 92.6 },
  { name: 'Tabona', onTrack: 18, warning: 6, overdue: 4, totalActive: 28, complianceRate: 85.7 },
  { name: 'Jorjoga', onTrack: 22, warning: 5, overdue: 3, totalActive: 30, complianceRate: 90.0 },
  { name: 'Pencado', onTrack: 16, warning: 4, overdue: 2, totalActive: 22, complianceRate: 90.9 },
];

export const AdminFollowupAnalytics: React.FC<{ onNavigate?: (navId: string) => void }> = ({
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'FUNNEL' | 'SLA_AGING'>('FUNNEL');
  const [slaChartMode, setSlaChartMode] = useState<'STACKED' | 'DUMBBELL'>('STACKED');

  const totalOverdue = PUSKESMAS_SLA_DATA.reduce((acc, p) => acc + p.overdue, 0);
  const totalWarning = PUSKESMAS_SLA_DATA.reduce((acc, p) => acc + p.warning, 0);
  const totalOnTrack = PUSKESMAS_SLA_DATA.reduce((acc, p) => acc + p.onTrack, 0);
  const averageCompliance = Math.round(
    PUSKESMAS_SLA_DATA.reduce((acc, p) => acc + p.complianceRate, 0) / PUSKESMAS_SLA_DATA.length
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-black tracking-tight">
                Tata Kelola Tindak Lanjut: Funnel Konversi Rujukan & Monitoring SLA
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pengawasan alur dari deteksi risiko, pendampingan kader, konfirmasi nakes, hingga kepatuhan SLA lintas faskes
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('FUNNEL')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'FUNNEL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Funnel Konversi Alur
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SLA_AGING')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'SLA_AGING'
                ? 'bg-purple-800 text-white shadow-2xs'
                : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            Distribusi SLA Aging
          </button>
        </div>
      </div>

      {activeTab === 'FUNNEL' ? (
        <div className="space-y-4">
          {/* Funnel Visual Stack */}
          <div className="space-y-2.5">
            {FUNNEL_STEPS.map((step, idx) => {
              const widthPct = Math.max(35, step.conversionPercent);
              return (
                <div key={step.stepNumber} className="relative">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono">
                        {step.stepNumber}
                      </span>
                      <span className="text-black">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-800 font-extrabold">{step.count} Warga</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {step.conversionPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Gradient */}
                  <div className="w-full bg-gray-100 rounded-lg h-5 overflow-hidden p-0.5 border border-gray-200/80">
                    <div
                      className={`h-full rounded-md ${step.colorClass} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="text-[10px] text-white font-bold tracking-wider">
                        {step.conversionPercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-1 pl-7">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Retention & Bottleneck Insight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-[#F0FDF4] rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Konversi Akhir
              </span>
              <span className="text-xl font-black font-mono text-emerald-800 mt-1 block">64.8%</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                810 dari 1,250 warga berisiko berhasil mencapai kepatuhan terapi terkontrol.
              </p>
            </div>

            <div className="p-3 bg-[#FFFBEB] rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Bottleneck Terbesar (Tahap 3 &rarr; 4)
              </span>
              <span className="text-xl font-black font-mono text-amber-800 mt-1 block">11.2% Drop-off</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                140 warga telah dikunjungi kader namun tertunda datang ke poli faskes (butuh penjadwalan ulang).
              </p>
            </div>

            <div className="p-3 bg-[#F5F3FF] rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Efisiensi Care Task
              </span>
              <span className="text-xl font-black font-mono text-purple-900 mt-1 block">95.6%</span>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Hanya 4.4% tugas yang membutuhkan intervensi manual supervisor dinkes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary SLA badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">Ringkasan SLA & Kepatuhan Antar Puskesmas</span>
            <div className="flex items-center gap-1 bg-[#F0F5F4] p-0.5 rounded-lg border border-[#D8E5E2] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSlaChartMode('STACKED')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  slaChartMode === 'STACKED'
                    ? 'bg-[#00201C] text-white shadow-2xs'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                Stacked SLA Status
              </button>
              <button
                type="button"
                onClick={() => setSlaChartMode('DUMBBELL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  slaChartMode === 'DUMBBELL'
                    ? 'bg-[#00201C] text-white shadow-2xs'
                    : 'text-[#60716D] hover:text-black'
                }`}
              >
                Dumbbell Kepatuhan vs Target
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">On-Track (&lt; 7 Hari)</span>
              <p className="text-xl font-black font-mono text-emerald-800 mt-0.5">{totalOnTrack} Kasus</p>
              <span className="text-[10px] text-emerald-700">Pelayanan tepat waktu</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Peringatan (7–14 Hari)</span>
              <p className="text-xl font-black font-mono text-amber-800 mt-0.5">{totalWarning} Kasus</p>
              <span className="text-[10px] text-amber-700">Mendekati batas SLA</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Overdue (&gt; 14 Hari)</span>
              <p className="text-xl font-black font-mono text-rose-700 mt-0.5">{totalOverdue} Kasus</p>
              <span className="text-[10px] text-rose-700">Butuh eskalasi cepat</span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Kepatuhan Rata-rata</span>
              <p className="text-xl font-black font-mono text-purple-900 mt-0.5">{averageCompliance}%</p>
              <span className="text-[10px] text-purple-700">Standar Dinkes (&gt;85%)</span>
            </div>
          </div>

          {/* Recharts Chart Area (Stacked vs Dumbbell) */}
          <div className="w-full h-72 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {slaChartMode === 'STACKED' ? (
                <BarChart data={PUSKESMAS_SLA_DATA} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    label={{
                      value: 'Jumlah Kasus Aktif',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#64748B', fontSize: 10, textAnchor: 'middle' },
                      offset: 10,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PuskesmasSlaData;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <div className="font-bold border-b border-slate-700 pb-1 flex justify-between gap-4">
                              <span>Puskesmas {data.name}</span>
                              <span className="text-emerald-400 font-mono">{data.complianceRate}% Patuh</span>
                            </div>
                            <div className="text-[11px] pt-1 space-y-0.5">
                              <div className="text-emerald-300 flex justify-between gap-3">
                                <span>On-track (&lt;7 hr):</span>
                                <span className="font-bold">{data.onTrack}</span>
                              </div>
                              <div className="text-amber-300 flex justify-between gap-3">
                                <span>Warning (7-14 hr):</span>
                                <span className="font-bold">{data.warning}</span>
                              </div>
                              <div className="text-rose-300 flex justify-between gap-3">
                                <span>Overdue (&gt;14 hr):</span>
                                <span className="font-bold">{data.overdue}</span>
                              </div>
                              <div className="text-slate-300 border-t border-slate-700 pt-1 font-semibold flex justify-between gap-3">
                                <span>Total Tugas:</span>
                                <span className="font-bold">{data.totalActive}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
                  <Bar
                    dataKey="onTrack"
                    name="On-Track (< 7 Hari)"
                    stackId="sla"
                    fill="#10B981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="warning"
                    name="Mendekati Tenggat (7–14 Hari)"
                    stackId="sla"
                    fill="#F59E0B"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="overdue"
                    name="Overdue SLA (> 14 Hari)"
                    stackId="sla"
                    fill="#E11D48"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <ComposedChart
                  data={PUSKESMAS_SLA_DATA.map((p) => ({
                    ...p,
                    targetSla: 85,
                  }))}
                  layout="vertical"
                  margin={{ top: 8, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#334643', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-bold border-b border-slate-700 pb-1">Puskesmas {data.name}</p>
                            <div className="text-[11px] pt-1 space-y-1">
                              <p className="text-emerald-400 flex justify-between gap-4">
                                <span>🟢 Kepatuhan Aktual:</span>
                                <span className="font-bold font-mono">{data.complianceRate}%</span>
                              </p>
                              <p className="text-sky-400 flex justify-between gap-4">
                                <span>🔵 Standar Target SPM:</span>
                                <span className="font-bold font-mono">85%</span>
                              </p>
                              <p className="text-teal-200 border-t border-slate-700 pt-0.5 flex justify-between gap-4">
                                <span>Margin Kepatuhan:</span>
                                <span className="font-bold font-mono">{data.complianceRate >= 85 ? `+${(data.complianceRate - 85).toFixed(1)}%` : `-${(85 - data.complianceRate).toFixed(1)}%`}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar
                    dataKey="targetSla"
                    name="Rentang Standar SLA"
                    fill="#F1F5F9"
                    stroke="#CBD5E1"
                    barSize={10}
                    radius={[0, 4, 4, 0]}
                  />
                  <Scatter
                    dataKey="complianceRate"
                    name="Kepatuhan Nyata (%)"
                    fill="#10B981"
                    shape="circle"
                  />
                  <Scatter
                    dataKey="targetSla"
                    name="Target Dinkes (85%)"
                    fill="#3B82F6"
                    shape="circle"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
