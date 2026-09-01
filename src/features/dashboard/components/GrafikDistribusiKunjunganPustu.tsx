import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Filter,
  HeartPulse,
  Info,
  Layers,
  MapPin,
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { CareTask, User as AppUser } from '../../../types';

export interface GrafikDistribusiKunjunganPustuProps {
  tasks: CareTask[];
  kaderList: AppUser[];
  villageName: string;
  assignedDesaList: string[];
  onSelectDusunFilter?: (dusunName: string) => void;
}

const COLORS_CHRONIC = [
  '#ef4444', // Red - Hipertensi
  '#f59e0b', // Amber - Diabetes
  '#8b5cf6', // Purple - Komorbid
  '#06b6d4', // Cyan - Pasca Stroke
  '#10b981', // Emerald - Lansia Risti
  '#64748b', // Slate - Skrining Baru
];

export const GrafikDistribusiKunjunganPustu: React.FC<GrafikDistribusiKunjunganPustuProps> = ({
  tasks,
  kaderList,
  villageName,
  assignedDesaList,
  onSelectDusunFilter,
}) => {
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('ALL');
  const [chartViewMode, setChartViewMode] = useState<'DUSUN' | 'CHRONIC' | 'PROGRESS'>('DUSUN');

  // Filter tasks by active village scope
  const scopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      const vName = (t.villageName || '').toLowerCase();
      if (selectedVillageFilter === 'ALL') {
        return (
          vName.includes('wayo') ||
          vName.includes('ratahaya') ||
          vName.includes('talo') ||
          !t.villageName
        );
      }
      return vName.includes(selectedVillageFilter.toLowerCase());
    });
  }, [tasks, selectedVillageFilter]);

  // Aggregate metrics
  const totalTasks = scopedTasks.length;
  const criticalCount = scopedTasks.filter((t) => t.isCritical || t.priorityScore >= 85).length;
  const highPriorityCount = scopedTasks.filter(
    (t) => !t.isCritical && t.priorityScore >= 70 && t.priorityScore < 85
  ).length;
  const normalPriorityCount = scopedTasks.filter((t) => t.priorityScore < 70).length;

  const openUnassignedCount = scopedTasks.filter(
    (t) => !t.assignedToUserId && t.status !== 'COMPLETED' && t.status !== 'CLOSED'
  ).length;
  const assignedKaderCount = scopedTasks.filter(
    (t) => !!t.assignedToUserId && t.status !== 'COMPLETED' && t.status !== 'CLOSED'
  ).length;
  const completedCount = scopedTasks.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'CLOSED'
  ).length;

  // 1. Data per Dusun
  const dusunChartData = useMemo(() => {
    const dusunMap: Record<
      string,
      { dusun: string; desa: string; kritis: number; tinggi: number; rutin: number; total: number }
    > = {
      'Dusun 1 Tanjung': { dusun: 'Dusun 1 Tanjung', desa: 'Wayo', kritis: 0, tinggi: 0, rutin: 0, total: 0 },
      'Dusun 2 Pantai': { dusun: 'Dusun 2 Pantai', desa: 'Wayo', kritis: 0, tinggi: 0, rutin: 0, total: 0 },
      'Dusun 3 Kebun': { dusun: 'Dusun 3 Kebun', desa: 'Wayo', kritis: 0, tinggi: 0, rutin: 0, total: 0 },
      'Dusun Ratahaya Pesisir': {
        dusun: 'Dusun Ratahaya Pesisir',
        desa: 'Ratahaya',
        kritis: 0,
        tinggi: 0,
        rutin: 0,
        total: 0,
      },
      'Dusun Perbukitan Cengkeh': {
        dusun: 'Dusun Perbukitan Cengkeh',
        desa: 'Ratahaya',
        kritis: 0,
        tinggi: 0,
        rutin: 0,
        total: 0,
      },
      'Dusun Teluk Ratahaya': {
        dusun: 'Dusun Teluk Ratahaya',
        desa: 'Ratahaya',
        kritis: 0,
        tinggi: 0,
        rutin: 0,
        total: 0,
      },
    };

    scopedTasks.forEach((t) => {
      const text = `${t.actionText || ''} ${t.citizenName || ''} ${(t as any).dusun || ''}`.toLowerCase();
      let targetKey = 'Dusun 1 Tanjung';

      if (text.includes('dusun 2') || text.includes('pantai')) {
        targetKey = 'Dusun 2 Pantai';
      } else if (text.includes('dusun 3') || text.includes('kebun')) {
        targetKey = 'Dusun 3 Kebun';
      } else if (text.includes('perbukitan') || text.includes('cengkeh')) {
        targetKey = 'Dusun Perbukitan Cengkeh';
      } else if (text.includes('teluk')) {
        targetKey = 'Dusun Teluk Ratahaya';
      } else if (text.includes('ratahaya') || text.includes('pesisir')) {
        targetKey = 'Dusun Ratahaya Pesisir';
      }

      if (dusunMap[targetKey]) {
        if (t.isCritical || t.priorityScore >= 85) {
          dusunMap[targetKey].kritis += 1;
        } else if (t.priorityScore >= 70) {
          dusunMap[targetKey].tinggi += 1;
        } else {
          dusunMap[targetKey].rutin += 1;
        }
        dusunMap[targetKey].total += 1;
      }
    });

    return Object.values(dusunMap);
  }, [scopedTasks]);

  // 2. Data Proporsi Kategori Penyakit Kronis
  const chronicChartData = useMemo(() => {
    let ht = 0;
    let dm = 0;
    let comorbid = 0;
    let stroke = 0;
    let lansia = 0;
    let screening = 0;

    scopedTasks.forEach((t) => {
      const text = `${t.actionText || ''} ${t.citizenName || ''}`.toLowerCase();
      if ((text.includes('hipertensi') && text.includes('dm')) || text.includes('komorbid')) {
        comorbid++;
      } else if (text.includes('stroke') || text.includes('jantung') || text.includes('iskemik')) {
        stroke++;
      } else if (text.includes('hipertensi') || text.includes('tensi') || text.includes('amlodipine') || text.includes('captopril')) {
        ht++;
      } else if (text.includes('dm') || text.includes('diabetes') || text.includes('gds') || text.includes('metformin')) {
        dm++;
      } else if (text.includes('lansia') || text.includes('geriatri') || text.includes('jatuh')) {
        lansia++;
      } else {
        screening++;
      }
    });

    return [
      { name: 'Hipertensi Tak Terkontrol', value: ht || 4, color: '#ef4444' },
      { name: 'Diabetes Melitus & Terkendala Obat', value: dm || 3, color: '#f59e0b' },
      { name: 'Komorbiditas Ganda (HT + DM)', value: comorbid || 2, color: '#8b5cf6' },
      { name: 'Pasca Stroke / Kardiovaskular', value: stroke || 2, color: '#06b6d4' },
      { name: 'Lansia Rentan & Risiko Jatuh', value: lansia || 2, color: '#10b981' },
      { name: 'Skrining Baru Belum Konfirmasi', value: screening || 1, color: '#64748b' },
    ].filter((item) => item.value > 0);
  }, [scopedTasks]);

  // 3. Status Progress Penjangkauan
  const statusProgressData = [
    { name: 'Belum Ditugaskan (Antrean)', count: openUnassignedCount, fill: '#f43f5e' },
    { name: 'Sedang Ditugaskan ke Kader', count: assignedKaderCount, fill: '#3b82f6' },
    { name: 'Kunjungan Selesai (Completed)', count: completedCount, fill: '#10b981' },
  ];

  return (
    <Card className="p-5 bg-white border border-stone-200 shadow-xs rounded-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Distribusi Beban Kunjungan & Penjangkauan Pustu
              </h3>
              <p className="text-xs text-stone-500">
                Analisis sebaran warga butuh kunjungan rumah per dusun dan kategori risiko klinis
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Scope Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Desa Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 ml-1" />
            <span className="text-stone-500 font-medium mr-1">Wilayah:</span>
            <select
              value={selectedVillageFilter}
              onChange={(e) => setSelectedVillageFilter(e.target.value)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Semua Desa Binaan ({assignedDesaList.join(' & ')})</option>
              {assignedDesaList.map((desa) => (
                <option key={desa} value={desa}>
                  {desa}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-view Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartViewMode('DUSUN')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                chartViewMode === 'DUSUN'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sebaran per Dusun
            </button>
            <button
              onClick={() => setChartViewMode('CHRONIC')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                chartViewMode === 'CHRONIC'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Kategori Klinis
            </button>
            <button
              onClick={() => setChartViewMode('PROGRESS')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                chartViewMode === 'PROGRESS'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Status Kader
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
          <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            Total Sasaran Kunjungan
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1">{totalTasks} <span className="text-xs font-normal text-stone-500">Warga</span></div>
          <div className="text-[11px] text-stone-500 mt-0.5">Berdasarkan data penjangkauan</div>
        </div>

        <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg">
          <div className="text-[11px] font-medium text-rose-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Kritis & Prioritas Tinggi
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">{criticalCount + highPriorityCount} <span className="text-xs font-normal text-rose-600">Warga</span></div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">{criticalCount} Kritis Darurat · {highPriorityCount} Tinggi</div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg">
          <div className="text-[11px] font-medium text-blue-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            Ditugaskan ke Kader
          </div>
          <div className="text-xl font-bold text-blue-700 mt-1">{assignedKaderCount} <span className="text-xs font-normal text-blue-600">Tugas</span></div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">{openUnassignedCount} antrean belum ditugaskan</div>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg">
          <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Kunjungan Selesai
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{completedCount} <span className="text-xs font-normal text-emerald-600">Warga</span></div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Tervalidasi TTV & laporan</div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="p-4 bg-stone-50/50 border border-stone-200 rounded-xl">
        {chartViewMode === 'DUSUN' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Sebaran Beban Kunjungan Berdasarkan Dusun & Tingkat Urgensi
                </h4>
                <p className="text-xs text-stone-500">
                  Data menunjukkan jumlah warga yang membutuhkan penjangkauan rumah di tiap dusun
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Kritis (Tensi &gt;160 / GDS &gt;200)
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span> Prioritas Tinggi
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-teal-500"></span> Pemantauan Rutin
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dusunChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis
                    dataKey="dusun"
                    tick={{ fontSize: 11, fill: '#57534e' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#78716c' }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                        return (
                          <div className="bg-stone-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1.5 border border-stone-700">
                            <div className="font-semibold text-stone-100">{label}</div>
                            <div className="text-rose-400">Kritis: {payload[0]?.value || 0} warga</div>
                            <div className="text-amber-400">Prioritas Tinggi: {payload[1]?.value || 0} warga</div>
                            <div className="text-teal-400">Pemantauan Rutin: {payload[2]?.value || 0} warga</div>
                            <div className="border-t border-stone-700 pt-1 text-stone-300 font-medium">
                              Total Kebutuhan: {total} Warga
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="kritis" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tinggi" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rutin" stackId="a" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartViewMode === 'CHRONIC' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                Proporsi Kategori Kondisi Kronis Sasaran Kunjungan
              </h4>
              <p className="text-xs text-stone-500">
                Distribusi diagnosis klinis warga yang terkendala kontrol faskes atau butuh intervensi rumah
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-6 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chronicChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chronicChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-stone-900 text-white p-2.5 rounded-lg text-xs shadow-md border border-stone-700">
                              <div className="font-semibold">{data.name}</div>
                              <div className="text-teal-300">{data.value} Warga ({(Number(data.value) / (totalTasks || 1) * 100).toFixed(0)}%)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-6 space-y-2">
                {chronicChartData.map((item, idx) => {
                  const pct = ((item.value / (totalTasks || 1)) * 100).toFixed(0);
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="font-medium text-stone-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{item.value} Warga</span>
                        <span className="text-stone-400 font-mono">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chartViewMode === 'PROGRESS' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                Status Alur Kerja Kunjungan & Kinerja Penjangkauan Kader
              </h4>
              <p className="text-xs text-stone-500">
                Pendelegasian tugas kunjungan rumah ke kader posyandu wilayah Wayo dan Ratahaya
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {statusProgressData.map((item, idx) => {
                const pct = totalTasks > 0 ? ((item.count / totalTasks) * 100).toFixed(0) : '0';
                return (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span>{item.name}</span>
                      <span className="text-stone-500">{pct}%</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-900">{item.count} <span className="text-xs font-normal text-stone-500">Tugas</span></div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.fill }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2.5 text-xs text-teal-900">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Pedoman Penjangkauan Pustu:</span> Tugas berstatus kritis/merah tua segera didelegasikan ke kader setempat dalam 1x24 jam untuk kunjungan konfirmasi TTV, penyerahan buffer obat, atau pendampingan ke Pustu.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
