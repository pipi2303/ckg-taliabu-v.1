import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  HeartPulse,
  Flame,
  Sparkles,
  Info,
} from 'lucide-react';

interface RiskStratum {
  name: string;
  categoryCode: string;
  count: number;
  percentage: number;
  color: string;
  textColor: string;
  description: string;
  actionGuideline: string;
}

const RISK_STRATA: RiskStratum[] = [
  {
    name: 'Risiko Rendah / Sehat (S1/S2)',
    categoryCode: 'GREEN',
    count: 1140,
    percentage: 59.4,
    color: '#10B981',
    textColor: 'text-emerald-800',
    description: 'Tensi normal (<120/80), GDS <140 mg/dL, IMT optimal (18.5-24.9)',
    actionGuideline: 'Edukasi PHBS dan skrining rutin berkala 1 tahun sekali.',
  },
  {
    name: 'Risiko Sedang / Pra-Hipertensi (S3)',
    categoryCode: 'YELLOW',
    count: 485,
    percentage: 25.3,
    color: '#F59E0B',
    textColor: 'text-amber-800',
    description: 'Tensi 120-139/80-89, Prediabetes GDS 140-199, atau Overweight',
    actionGuideline: 'Konseling gaya hidup sehat dan pemantauan ulang 3-6 bulan.',
  },
  {
    name: 'Risiko Tinggi / Hipertensi Tk. 2 (S4)',
    categoryCode: 'RED',
    count: 245,
    percentage: 12.8,
    color: '#E11D48',
    textColor: 'text-rose-800',
    description: 'Tensi >=140/90, GDS >=200, atau Kolesterol/Asam Urat tinggi',
    actionGuideline: 'Rujukan ke Dokter Puskesmas untuk evaluasi farmakoterapi.',
  },
  {
    name: 'Temuan Kritis / Krisis Hipertensi (S5)',
    categoryCode: 'DARK_RED',
    count: 50,
    percentage: 2.6,
    color: '#7F1D1D',
    textColor: 'text-red-950',
    description: 'Tensi >=180/110, GDS >=300 mg/dL, atau red flag klinis',
    actionGuideline: 'Eskalasi darurat segera ke IGD Puskesmas/RSUD Bobong.',
  },
];

// 3x3 Heatmap Matrix of Blood Pressure vs Blood Glucose
interface ComorbidityCell {
  bpLevel: 'Normal' | 'Pra-Hipertensi' | 'Hipertensi';
  glucoseLevel: 'Normal' | 'Prediabetes' | 'Diabetes';
  count: number;
  riskClass: 'low' | 'medium' | 'high' | 'critical';
}

const COMORBIDITY_MATRIX: ComorbidityCell[] = [
  { bpLevel: 'Normal', glucoseLevel: 'Normal', count: 980, riskClass: 'low' },
  { bpLevel: 'Normal', glucoseLevel: 'Prediabetes', count: 110, riskClass: 'medium' },
  { bpLevel: 'Normal', glucoseLevel: 'Diabetes', count: 50, riskClass: 'high' },
  { bpLevel: 'Pra-Hipertensi', glucoseLevel: 'Normal', count: 240, riskClass: 'medium' },
  { bpLevel: 'Pra-Hipertensi', glucoseLevel: 'Prediabetes', count: 185, riskClass: 'medium' },
  { bpLevel: 'Pra-Hipertensi', glucoseLevel: 'Diabetes', count: 60, riskClass: 'high' },
  { bpLevel: 'Hipertensi', glucoseLevel: 'Normal', count: 120, riskClass: 'high' },
  { bpLevel: 'Hipertensi', glucoseLevel: 'Prediabetes', count: 95, riskClass: 'high' },
  { bpLevel: 'Hipertensi', glucoseLevel: 'Diabetes', count: 80, riskClass: 'critical' },
];

export const AdminRiskStratificationMatrix: React.FC = () => {
  const [selectedStratum, setSelectedStratum] = useState<RiskStratum | null>(RISK_STRATA[2]);

  const totalCitizens = RISK_STRATA.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-black tracking-tight">
                Distribusi Stratifikasi Risiko & Matriks Komorbiditas Klinis (CRS)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pemetaan proporsi risiko populasi warga berdasarkan standar protokol Kemenkes RI 2026
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-mono font-bold text-slate-700">
            Total {totalCitizens} Hasil Skrining
          </span>
        </div>
      </div>

      {/* 2-Column Layout: Donut Chart & Comorbidity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recharts Donut Stratification */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="w-full h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_STRATA}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  onClick={(entry) => setSelectedStratum(entry as unknown as RiskStratum)}
                  cursor="pointer"
                >
                  {RISK_STRATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={selectedStratum?.categoryCode === entry.categoryCode ? '#000000' : '#FFFFFF'}
                      strokeWidth={selectedStratum?.categoryCode === entry.categoryCode ? 2.5 : 1.5}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RiskStratum;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
                          <p className="font-bold text-emerald-400">{data.name}</p>
                          <p className="font-mono font-black text-sm">{data.count} Warga ({data.percentage}%)</p>
                          <p className="text-[10px] text-slate-300 mt-1 max-w-[200px]">{data.description}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-gray-500">Skrining</span>
              <span className="text-xl font-black font-mono text-slate-900">{totalCitizens}</span>
              <span className="text-[10px] text-teal-700 font-semibold">Warga</span>
            </div>
          </div>

          {/* Clickable Legend Pills */}
          <div className="space-y-1.5">
            {RISK_STRATA.map((stratum) => {
              const isSelected = selectedStratum?.categoryCode === stratum.categoryCode;
              return (
                <button
                  key={stratum.categoryCode}
                  type="button"
                  onClick={() => setSelectedStratum(stratum)}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stratum.color }}
                    />
                    <span className="text-gray-900 truncate">{stratum.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-bold text-slate-900">{stratum.count}</span>
                    <span className="text-[10px] text-gray-500">({stratum.percentage}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Comorbidity Matrix (Heatmap) */}
        <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Matriks Komorbiditas: Tekanan Darah &times; Gula Darah
              </span>
              <span className="text-[10px] text-gray-500">Kluster Risiko Multi-Faktor</span>
            </div>

            {/* 3x3 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-2 text-left text-[11px] font-bold text-gray-500">Tensi \ Gula</th>
                    <th className="p-2 text-[11px] font-bold text-emerald-800 bg-emerald-50/50 rounded-t-lg">
                      GDS Normal
                    </th>
                    <th className="p-2 text-[11px] font-bold text-amber-800 bg-amber-50/50 rounded-t-lg">
                      Prediabetes
                    </th>
                    <th className="p-2 text-[11px] font-bold text-rose-800 bg-rose-50/50 rounded-t-lg">
                      Diabetes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2 text-left font-bold text-emerald-800 bg-emerald-50/30">Tensi Normal</td>
                    <td className="p-2.5 bg-emerald-50 text-emerald-900 font-mono font-bold">980</td>
                    <td className="p-2.5 bg-amber-50 text-amber-900 font-mono font-semibold">110</td>
                    <td className="p-2.5 bg-rose-50 text-rose-900 font-mono font-semibold">50</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-amber-800 bg-amber-50/30">Pra-Hipertensi</td>
                    <td className="p-2.5 bg-amber-50 text-amber-900 font-mono font-semibold">240</td>
                    <td className="p-2.5 bg-amber-100 text-amber-950 font-mono font-bold">185</td>
                    <td className="p-2.5 bg-rose-100 text-rose-950 font-mono font-bold">60</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-rose-800 bg-rose-50/30">Hipertensi Tk.2</td>
                    <td className="p-2.5 bg-rose-50 text-rose-900 font-mono font-semibold">120</td>
                    <td className="p-2.5 bg-rose-100 text-rose-950 font-mono font-bold">95</td>
                    <td className="p-2.5 bg-red-800 text-white font-mono font-black rounded-lg shadow-2xs">
                      80 <span className="text-[9px] block font-normal text-rose-200">Ganda Kritis</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Category Action Card */}
          {selectedStratum && (
            <div className="p-3 bg-[#F8FBFA] rounded-xl border border-teal-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedStratum.color }}
                  />
                  Panduan Tindak Lanjut {selectedStratum.name}:
                </span>
                <span className="font-mono font-bold text-teal-800">{selectedStratum.count} Warga</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                <strong>Kriteria:</strong> {selectedStratum.description}
              </p>
              <p className="text-[11px] text-teal-900 font-medium pt-0.5">
                <strong>Protokol Faskes:</strong> {selectedStratum.actionGuideline}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
