import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitCompare,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';

export const PeriodComparisonPage: React.FC = () => {
  const { user } = useAuth();
  const [periodA, setPeriodA] = useState<string>('JUL_2026');
  const [periodB, setPeriodB] = useState<string>('AUG_2026');

  // Comparison dataset
  const comparisons = [
    {
      metricName: 'Level 1: Cakupan Skrining (Coverage)',
      code: 'IMPACT_LVL_1_COVERAGE',
      periodAVal: '4.2%',
      periodANum: 520,
      periodADenom: 12500,
      periodBVal: '6.7%',
      periodBNum: 842,
      periodBDenom: 12500,
      diffPctPoint: '+2.5 pp',
      absDiff: '+322 warga',
      denominatorChanged: false,
      definitionChanged: false,
      notes: 'Penambahan skrining aktif melalui posko CKG terpadu di 3 kecamatan.',
    },
    {
      metricName: 'Level 2: Kontinuitas Tindak Lanjut (Continuity)',
      code: 'IMPACT_LVL_2_CONTINUITY',
      periodAVal: '38.4%',
      periodANum: 98,
      periodADenom: 255,
      periodBVal: '52.8%',
      periodBNum: 210,
      periodBDenom: 398,
      diffPctPoint: '+14.4 pp',
      absDiff: '+112 warga',
      denominatorChanged: true,
      definitionChanged: false,
      notes: 'Penyebut bertambah karena jumlah skrining bulan Agustus menemukan lebih banyak kasus berisiko.',
    },
    {
      metricName: 'Level 3: Status Terkendali (Outcome)',
      code: 'IMPACT_LVL_3_OUTCOME',
      periodAVal: 'Belum dinilai',
      periodBVal: 'Belum dinilai',
      diffPctPoint: '—',
      absDiff: '—',
      denominatorChanged: false,
      definitionChanged: false,
      isLocked: true,
      notes: 'Menunggu pengesahan kriteria klinis CR-OC (Governance Lock OI-08).',
    },
    {
      metricName: 'Proporsi Penutupan Tugas Manual',
      code: 'CASCADE_MANUAL_CLOSURE_RATIO',
      periodAVal: '24.1%',
      periodANum: 36,
      periodADenom: 149,
      periodBVal: '18.0%',
      periodBNum: 48,
      periodBDenom: 266,
      diffPctPoint: '-6.1 pp (Membaik)',
      absDiff: '+12 kasus',
      denominatorChanged: true,
      definitionChanged: false,
      notes: 'Penurunan rasio penutupan manual mencerminkan perbaikan input encounter langsung oleh dokter/perawat FKTP.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            LONGITUDINAL POPULATION EVALUATION
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Perbandingan Antar-Periode</h1>
            <DocBadge code="SCR-DNK-B09" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Evaluasi pergeseran capaian antar-bulan dengan deteksi perubahan penyebut (denominator drift) dan versi definisi.
          </p>
        </div>

        {/* Period Selectors */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={periodA}
              onChange={(e) => setPeriodA(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="JUL_2026" className="bg-slate-900">Juli 2026</option>
              <option value="JUN_2026" className="bg-slate-900">Juni 2026</option>
            </select>
          </div>

          <span className="text-slate-500 font-bold">vs</span>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={periodB}
              onChange={(e) => setPeriodB(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="AUG_2026" className="bg-slate-900">Agustus 2026 (Aktif)</option>
              <option value="JUL_2026" className="bg-slate-900">Juli 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Denominator Shift Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-white uppercase tracking-wider">
            Kewaspadaan Perubahan Penyebut (Denominator Drift)
          </span>
          <p className="text-slate-300 leading-relaxed">
            Peningkatan persentase capaian dapat terjadi akibat peningkatan kinerja riil maupun perubahan jumlah sasaran yang teridentifikasi. Setiap baris di bawah menampilkan angka absolut pembilang dan penyebut secara eksplisit untuk mencegah kesalahan penafsiran.
          </p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 font-mono">0{idx + 1}</span>
                <h3 className="text-sm font-bold text-white">{item.metricName}</h3>
              </div>

              {item.denominatorChanged && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 self-start md:self-auto">
                  <AlertTriangle className="w-3 h-3" />
                  Penyebut Mengalami Perubahan
                </span>
              )}
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Periode A: Juli 2026</div>
                <div className="text-xl font-black text-white">{item.periodAVal}</div>
                {item.periodANum !== undefined && item.periodADenom !== undefined && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({item.periodANum.toLocaleString('id-ID')} / {item.periodADenom.toLocaleString('id-ID')} sasaran)
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">Periode B: Agustus 2026</div>
                <div className="text-xl font-black text-emerald-400">{item.periodBVal}</div>
                {item.periodBNum !== undefined && item.periodBDenom !== undefined && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({item.periodBNum.toLocaleString('id-ID')} / {item.periodBDenom.toLocaleString('id-ID')} sasaran)
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-center">
                <div className="text-[11px] text-slate-400 mb-1">Pergeseran Capaian</div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-teal-300">{item.diffPctPoint}</span>
                  <span className="text-xs text-slate-400 font-medium">({item.absDiff})</span>
                </div>
              </div>
            </div>

            {/* Qualitative Notes */}
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <span className="text-teal-400">•</span>
              <span>{item.notes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
