import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  BarChart3,
  AreaChart as AreaChartIcon,
  PieChart as PieChartIcon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Ship,
  Info,
  Download,
  Filter,
  Maximize2,
  Clock,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { ImpactIndexSummary } from '../../../services/impactIndexService';
import { DocBadge } from '../../../components/common/DocBadge';

interface ImpactLevelAnalyticsChartsProps {
  impact: ImpactIndexSummary;
  onNavigate?: (navId: string) => void;
}

// 8 Puskesmas Benchmark Data
const PUSKESMAS_DATA = [
  {
    id: 'faskes-1',
    name: 'Puskesmas Bobong',
    shortName: 'Bobong',
    kecamatan: 'Taliabu Barat',
    isRemote: false,
    targetPopulation: 420,
    screenedL1: 310,
    coverageRateL1: 73.8,
    eligibleRisk: 142,
    attendedL2: 88,
    gapL2: 54,
    continuityRateL2: 62.0,
    cohortL3: 96,
    greenRisk: 168,
    yellowRisk: 78,
    redRisk: 52,
    criticalRisk: 12,
    radarL1: 74,
    radarL2: 62,
    radarSpeed: 82,
    radarL3Prep: 70,
    radarPharma: 85,
  },
  {
    id: 'faskes-2',
    name: 'Puskesmas Samuya',
    shortName: 'Samuya',
    kecamatan: 'Taliabu Timur',
    isRemote: false,
    targetPopulation: 170,
    screenedL1: 125,
    coverageRateL1: 73.5,
    eligibleRisk: 60,
    attendedL2: 42,
    gapL2: 18,
    continuityRateL2: 70.0,
    cohortL3: 45,
    greenRisk: 65,
    yellowRisk: 34,
    redRisk: 21,
    criticalRisk: 5,
    radarL1: 74,
    radarL2: 70,
    radarSpeed: 78,
    radarL3Prep: 68,
    radarPharma: 80,
  },
  {
    id: 'faskes-3',
    name: 'Puskesmas Lede',
    shortName: 'Lede',
    kecamatan: 'Lede',
    isRemote: false,
    targetPopulation: 140,
    screenedL1: 98,
    coverageRateL1: 70.0,
    eligibleRisk: 48,
    attendedL2: 31,
    gapL2: 17,
    continuityRateL2: 64.6,
    cohortL3: 34,
    greenRisk: 50,
    yellowRisk: 28,
    redRisk: 16,
    criticalRisk: 4,
    radarL1: 70,
    radarL2: 65,
    radarSpeed: 75,
    radarL3Prep: 64,
    radarPharma: 78,
  },
  {
    id: 'faskes-4',
    name: 'Puskesmas Gela',
    shortName: 'Gela',
    kecamatan: 'Taliabu Barat Laut',
    isRemote: true,
    targetPopulation: 130,
    screenedL1: 85,
    coverageRateL1: 65.4,
    eligibleRisk: 44,
    attendedL2: 26,
    gapL2: 18,
    continuityRateL2: 59.1,
    cohortL3: 28,
    greenRisk: 41,
    yellowRisk: 25,
    redRisk: 15,
    criticalRisk: 4,
    radarL1: 65,
    radarL2: 59,
    radarSpeed: 64,
    radarL3Prep: 58,
    radarPharma: 68,
  },
  {
    id: 'faskes-5',
    name: 'Puskesmas Tabona',
    shortName: 'Tabona',
    kecamatan: 'Tabona',
    isRemote: false,
    targetPopulation: 110,
    screenedL1: 72,
    coverageRateL1: 65.5,
    eligibleRisk: 38,
    attendedL2: 24,
    gapL2: 14,
    continuityRateL2: 63.2,
    cohortL3: 26,
    greenRisk: 34,
    yellowRisk: 21,
    redRisk: 14,
    criticalRisk: 3,
    radarL1: 66,
    radarL2: 63,
    radarSpeed: 72,
    radarL3Prep: 62,
    radarPharma: 74,
  },
  {
    id: 'faskes-6',
    name: 'Puskesmas Jorjona',
    shortName: 'Jorjona',
    kecamatan: 'Taliabu Selatan',
    isRemote: true,
    targetPopulation: 105,
    screenedL1: 68,
    coverageRateL1: 64.8,
    eligibleRisk: 35,
    attendedL2: 21,
    gapL2: 14,
    continuityRateL2: 60.0,
    cohortL3: 22,
    greenRisk: 33,
    yellowRisk: 20,
    redRisk: 12,
    criticalRisk: 3,
    radarL1: 65,
    radarL2: 60,
    radarSpeed: 68,
    radarL3Prep: 55,
    radarPharma: 70,
  },
  {
    id: 'faskes-7',
    name: 'Puskesmas Losseng',
    shortName: 'Losseng',
    kecamatan: 'Taliabu Timur Selatan',
    isRemote: true,
    targetPopulation: 95,
    screenedL1: 65,
    coverageRateL1: 68.4,
    eligibleRisk: 36,
    attendedL2: 20,
    gapL2: 16,
    continuityRateL2: 55.6,
    cohortL3: 20,
    greenRisk: 29,
    yellowRisk: 22,
    redRisk: 11,
    criticalRisk: 3,
    radarL1: 68,
    radarL2: 56,
    radarSpeed: 62,
    radarL3Prep: 52,
    radarPharma: 65,
  },
  {
    id: 'faskes-8',
    name: 'Puskesmas Pancado',
    shortName: 'Pancado',
    kecamatan: 'Taliabu Utara',
    isRemote: true,
    targetPopulation: 80,
    screenedL1: 55,
    coverageRateL1: 68.8,
    eligibleRisk: 34,
    attendedL2: 16,
    gapL2: 18,
    continuityRateL2: 47.1,
    cohortL3: 17,
    greenRisk: 21,
    yellowRisk: 19,
    redRisk: 11,
    criticalRisk: 4,
    radarL1: 69,
    radarL2: 47,
    radarSpeed: 58,
    radarL3Prep: 48,
    radarPharma: 60,
  },
];

// Longitudinal Monthly Trend (Jan - Aug 2026)
const MONTHLY_TREND_DATA = [
  {
    month: 'Jan 26',
    screenedL1Cumulative: 110,
    screenedMonthly: 110,
    attendedL2Cumulative: 28,
    gapCumulative: 15,
    continuityRateL2: 65.1,
    activeCohortL3: 22,
    coverageRateL1: 8.8,
  },
  {
    month: 'Feb 26',
    screenedL1Cumulative: 225,
    screenedMonthly: 115,
    attendedL2Cumulative: 62,
    gapCumulative: 34,
    continuityRateL2: 64.6,
    activeCohortL3: 54,
    coverageRateL1: 18.0,
  },
  {
    month: 'Mar 26',
    screenedL1Cumulative: 360,
    screenedMonthly: 135,
    attendedL2Cumulative: 104,
    gapCumulative: 58,
    continuityRateL2: 64.2,
    activeCohortL3: 92,
    coverageRateL1: 28.8,
  },
  {
    month: 'Apr 26',
    screenedL1Cumulative: 505,
    screenedMonthly: 145,
    attendedL2Cumulative: 148,
    gapCumulative: 82,
    continuityRateL2: 64.3,
    activeCohortL3: 135,
    coverageRateL1: 40.4,
  },
  {
    month: 'Mei 26',
    screenedL1Cumulative: 640,
    screenedMonthly: 135,
    attendedL2Cumulative: 190,
    gapCumulative: 108,
    continuityRateL2: 63.8,
    activeCohortL3: 182,
    coverageRateL1: 51.2,
  },
  {
    month: 'Jun 26',
    screenedL1Cumulative: 745,
    screenedMonthly: 105,
    attendedL2Cumulative: 224,
    gapCumulative: 132,
    continuityRateL2: 62.9,
    activeCohortL3: 226,
    coverageRateL1: 59.6,
  },
  {
    month: 'Jul 26',
    screenedL1Cumulative: 820,
    screenedMonthly: 75,
    attendedL2Cumulative: 248,
    gapCumulative: 152,
    continuityRateL2: 62.0,
    activeCohortL3: 260,
    coverageRateL1: 65.6,
  },
  {
    month: 'Agu 26',
    screenedL1Cumulative: 878,
    screenedMonthly: 58,
    attendedL2Cumulative: 268,
    gapCumulative: 169,
    continuityRateL2: 61.3,
    activeCohortL3: 290,
    coverageRateL1: 70.2,
  },
];

// Donut Chart - Level 3 Clinical Cohort Readiness Distribution
const LEVEL3_COHORT_DATA = [
  { name: 'Hipertensi Terkontrol (Monitoring 90 Hari)', value: 142, color: '#0d9488' }, // teal-600
  { name: 'Diabetes Melitus Stabil (Dalam Pemantauan)', value: 92, color: '#0284c7' }, // sky-600
  { name: 'Komorbiditas Ganda (Penyesuaian Obat)', value: 36, color: '#f59e0b' }, // amber-500
  { name: 'Kendala Akses / Transportasi Laut', value: 20, color: '#f43f5e' }, // rose-500
];

export const ImpactLevelAnalyticsCharts: React.FC<ImpactLevelAnalyticsChartsProps> = ({
  impact,
  onNavigate,
}) => {
  // Chart Tabs: 'ALL' | 'BAR' | 'AREA' | 'COMPOSED' | 'COHORT'
  const [activeTab, setActiveTab] = useState<'ALL' | 'BAR' | 'AREA' | 'COMPOSED' | 'COHORT'>('ALL');

  // Geo Filter: 'ALL' | 'MAINLAND' | 'REMOTE'
  const [geoFilter, setGeoFilter] = useState<'ALL' | 'MAINLAND' | 'REMOTE'>('ALL');

  // Bar Chart Sub-Mode: 'VOLUME' | 'RISK_STACK'
  const [barSubMode, setBarSubMode] = useState<'VOLUME' | 'RISK_STACK'>('VOLUME');

  // Area Chart Sub-Mode: 'CUMULATIVE' | 'CASCADE'
  const [areaSubMode, setAreaSubMode] = useState<'CUMULATIVE' | 'CASCADE'>('CUMULATIVE');

  // Filtered Puskesmas
  const filteredFacilities = useMemo(() => {
    if (geoFilter === 'MAINLAND') return PUSKESMAS_DATA.filter((p) => !p.isRemote);
    if (geoFilter === 'REMOTE') return PUSKESMAS_DATA.filter((p) => p.isRemote);
    return PUSKESMAS_DATA;
  }, [geoFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Puskesmas',
      'Kecamatan',
      'Tipe Wilayah',
      'Sasaran Populasi',
      'Skrining Selesai (L1)',
      '% Cakupan L1',
      'Temuan Berisiko',
      'Warga Ditangani (L2)',
      'Kesenjangan Gap (L2)',
      '% Kontinuitas L2',
      'Kohort Aktif (L3)',
    ];

    const rows = filteredFacilities.map((f) => [
      `"${f.name}"`,
      `"${f.kecamatan}"`,
      f.isRemote ? 'Pesisir / Terisolir' : 'Daratan Utama',
      f.targetPopulation,
      f.screenedL1,
      `${f.coverageRateL1}%`,
      f.eligibleRisk,
      f.attendedL2,
      f.gapL2,
      `${f.continuityRateL2}%`,
      f.cohortL3,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CKG_Impact_Level_1_2_3_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Header Card - Bone White Theme */}
      <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                Visualisasi Grafik Interaktif CKG Impact Index
              </h3>
              <DocBadge code="SCR-DNK-B01" size="sm" />
            </div>
            <p className="text-xs text-stone-600">
              Analisis komprehensif <strong>Level 1 (Cakupan Skrining)</strong>, <strong>Level 2 (Kontinuitas Layanan)</strong>, dan <strong>Level 3 (Kesiapan Evaluasi Pengendalian Klinis)</strong> di 8 wilayah Puskesmas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Geo Filter Toggle */}
            <div className="flex items-center bg-stone-200/80 rounded-xl p-1 border border-stone-300/80 text-xs">
              <button
                type="button"
                onClick={() => setGeoFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  geoFilter === 'ALL' ? 'bg-teal-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Semua Wilayah (8)
              </button>
              <button
                type="button"
                onClick={() => setGeoFilter('MAINLAND')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  geoFilter === 'MAINLAND' ? 'bg-teal-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Daratan (4)
              </button>
              <button
                type="button"
                onClick={() => setGeoFilter('REMOTE')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  geoFilter === 'REMOTE' ? 'bg-teal-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Pesisir/Pulau (4)
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Unduh Data Ringkasan Level 1, 2, 3 ke CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Unduh Data</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Visualisasi (Overview Lengkap)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BAR')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BAR'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik Batang (Komparasi 8 Faskes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AREA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'AREA'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300 hover:text-stone-900'
            }`}
          >
            <AreaChartIcon className="w-3.5 h-3.5" />
            <span>Grafik Area (Tren Kumulatif Longitudinal)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPOSED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'COMPOSED'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grafik Batang + Garis SPM (Dual Axis)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COHORT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'COHORT'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300 hover:text-stone-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Grafik Donut & Kohort Level 3 (Outcome)</span>
          </button>
        </div>
      </div>

      {/* 1. GRAFIK BATANG SECTION (Bar Chart) */}
      {(activeTab === 'ALL' || activeTab === 'BAR') && (
        <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                Grafik Batang: Komparasi Capaian Level 1 & Level 2 per Puskesmas
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Membandingkan volume sasaran, skrining selesai (L1), tindak lanjut faskes (L2), dan kesenjangan kasus di tiap Puskesmas.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex items-center bg-stone-200/80 rounded-xl p-1 border border-stone-300/80 text-xs">
                <button
                  type="button"
                  onClick={() => setBarSubMode('VOLUME')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    barSubMode === 'VOLUME' ? 'bg-teal-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Beban & Gap Warga
                </button>
                <button
                  type="button"
                  onClick={() => setBarSubMode('RISK_STACK')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    barSubMode === 'RISK_STACK' ? 'bg-teal-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Stratifikasi Risiko L1
                </button>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {barSubMode === 'VOLUME' ? (
                <BarChart data={filteredFacilities} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} unit=" jiwa" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: number, name: string) => [
                      `${val.toLocaleString('id-ID')} jiwa`,
                      name,
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#334155' }}
                  />
                  <Bar dataKey="targetPopulation" name="Sasaran Registrasi (Populasi)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screenedL1" name="Level 1: Skrining Selesai" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendedL2" name="Level 2: Warga Ditangani Faskes" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gapL2" name="Kesenjangan Belum Ditangani (Gap)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={filteredFacilities} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} unit=" jiwa" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: number, name: string) => [
                      `${val.toLocaleString('id-ID')} warga`,
                      name,
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#334155' }}
                  />
                  <Bar dataKey="greenRisk" stackId="a" name="Risiko Ringan (Hijau)" fill="#10b981" />
                  <Bar dataKey="yellowRisk" stackId="a" name="Risiko Sedang (Kuning)" fill="#f59e0b" />
                  <Bar dataKey="redRisk" stackId="a" name="Risiko Tinggi (Merah)" fill="#f97316" />
                  <Bar dataKey="criticalRisk" stackId="a" name="Risiko Kritis (Merah Gelap)" fill="#be123c" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Insight Level 1 vs 2:</strong> Puskesmas Samuya mencatat kontinuitas tertinggi (70.0%), sedangkan Puskesmas Pancado di wilayah pesisir utara membutuhkan intervensi logistik maritim untuk mengatasi gap (47.1%).
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('dinkes-kinerja-pkm')}
              className="text-teal-700 hover:text-teal-800 font-bold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Detail Kinerja Faskes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. GRAFIK AREA SECTION (Area Chart) */}
      {(activeTab === 'ALL' || activeTab === 'AREA') && (
        <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <AreaChartIcon className="w-4 h-4 text-sky-700" />
                Grafik Area: Pertumbuhan Longitudinal & Jalur Kaskade Level 1 s.d 3
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Mengamati akselerasi kumulatif skrining sasaran (L1), rujukan tertangani (L2), dan kohort pemantauan kendali (L3).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-200/80 rounded-xl p-1 border border-stone-300/80 text-xs">
                <button
                  type="button"
                  onClick={() => setAreaSubMode('CUMULATIVE')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    areaSubMode === 'CUMULATIVE' ? 'bg-sky-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Kumulatif Jan-Agu 2026
                </button>
                <button
                  type="button"
                  onClick={() => setAreaSubMode('CASCADE')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    areaSubMode === 'CASCADE' ? 'bg-sky-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Transisi Kaskade Warga
                </button>
              </div>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorScreenedL1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="colorAttendedL2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="colorCohortL3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} unit=" jiwa" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: number, name: string) => [`${val.toLocaleString('id-ID')} jiwa`, name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                <Area
                  type="monotone"
                  dataKey="screenedL1Cumulative"
                  name="Level 1: Total Skrining Sasaran"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScreenedL1)"
                />
                <Area
                  type="monotone"
                  dataKey="attendedL2Cumulative"
                  name="Level 2: Warga Ditangani di Faskes"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAttendedL2)"
                />
                {areaSubMode === 'CUMULATIVE' ? (
                  <Area
                    type="monotone"
                    dataKey="activeCohortL3"
                    name="Level 3: Kohort Pemantauan Aktif"
                    stroke="#d97706"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCohortL3)"
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="gapCumulative"
                    name="Kesenjangan Kasus (Gap Menunggu)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGap)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-600 uppercase font-bold tracking-wider">Akselerasi Skrining (L1)</span>
              <p className="font-bold text-teal-800 text-sm">+768 warga diskrining sejak Jan 2026</p>
              <p className="text-[11px] text-stone-600">Rata-rata 109 warga/bulan terlayani</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-600 uppercase font-bold tracking-wider">Tindak Lanjut Faskes (L2)</span>
              <p className="font-bold text-sky-800 text-sm">268 pasien berisiko telah tertata laksana</p>
              <p className="text-[11px] text-stone-600">61.3% tingkat kontinuitas kabupaten</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-600 uppercase font-bold tracking-wider">Jalur Outcome Terkendali (L3)</span>
              <p className="font-bold text-amber-800 text-sm">290 pasien dalam kohort 90-hari</p>
              <p className="text-[11px] text-stone-600">Menunggu audit validasi CR-OC (OI-08)</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. GRAFIK KOMPOSISI DUAL AXIS SECTION (Composed Chart) */}
      {(activeTab === 'ALL' || activeTab === 'COMPOSED') && (
        <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Grafik Batang + Garis Komposisi: Volume vs Persentase Kontinuitas SPM
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Mengevaluasi apakah lonjakan volume skrining berbanding lurus dengan kepatuhan standar SPM (Standar Kemenkes ≥50% & Target Prima ≥80%).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold">
                Dual Axis: Jiwa & %
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={11} tickLine={false} unit=" jiwa" />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: number, name: string) => [
                    name.includes('%') ? `${val}%` : `${val.toLocaleString('id-ID')} jiwa`,
                    name,
                  ]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                <ReferenceLine yAxisId="right" y={50} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Target SPM Kemenkes (50%)', fill: '#b45309', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine yAxisId="right" y={80} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target Layanan Prima (80%)', fill: '#047857', fontSize: 10, position: 'insideTopRight' }} />
                <Bar yAxisId="left" dataKey="screenedMonthly" name="Volume Skrining Bulanan (L1)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="continuityRateL2"
                  name="% Kontinuitas Layanan (Level 2)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="coverageRateL1"
                  name="% Cakupan Sasaran Kumulatif (Level 1)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#0284c7' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. GRAFIK DONUT COHORT LEVEL 3 SECTION */}
      {(activeTab === 'ALL' || activeTab === 'COHORT') && (
        <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-sm space-y-4">
          <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-700" />
                Grafik Donut: Distribusi Pasien Kohort Pemantauan Level 3
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Sebaran 290 pasien dalam siklus evaluasi 90-hari menuju verifikasi terkendali CR-OC.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold self-start sm:self-center shadow-xs">
              Total 290 Jiwa Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LEVEL3_COHORT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {LEVEL3_COHORT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#0f172a',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: number, name: string) => [
                      `${val} warga (${Math.round((val / 290) * 100)}%)`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="space-y-2">
                {LEVEL3_COHORT_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-stone-800 text-[11px] font-medium">{item.name}</span>
                    </div>
                    <span className="text-stone-900 font-bold shrink-0 ml-2">{item.value} jiwa</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Tata Kelola Data Klinis (OI-08):</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Level 3 tetap berstatus <em>NOT_ASSESSABLE</em> sampai seluruh kohort menyelesaikan siklus 90-hari dan disahkan oleh komite medis demi mencegah estimasi angka fiktif.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

