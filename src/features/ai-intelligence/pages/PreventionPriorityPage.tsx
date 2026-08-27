import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Heart,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Info,
  Calendar,
  Compass,
} from 'lucide-react';
import { modelGovernanceRepo } from '../../../repositories/modelGovernanceRepo';

export const PreventionPriorityPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  const model = modelGovernanceRepo.getModelById('PA-07');
  const predictions = [
    {
      id: 'PREV-CIT-8208-0012',
      citizenId: 'CIT-8208-0012',
      citizenName: 'Baharudin Ode',
      desaName: 'Desa Pancado',
      level: 'MEDIUM',
      trajectorySignal: 'Fluktuasi tekanan darah sistolik rata-rata 154 mmHg dalam 3 bulan terakhir.',
      recommendedPreventiveSupport: 'Edukasi diet rendah garam dan pemantauan mandiri tensimeter posyandu.',
      dataPointsCount: 3,
      generatedAt: '2026-08-24T06:00:00Z',
    },
    {
      id: 'PREV-CIT-8208-0045',
      citizenId: 'CIT-8208-0045',
      citizenName: 'Wa Ode Fatimah',
      desaName: 'Desa Gela',
      level: 'HIGH',
      trajectorySignal: 'Kombinasi kenaikan profil glukosa darah puasa dan IMT kategori obesitas I.',
      recommendedPreventiveSupport: 'Konseling nutrisi intensif dan pendampingan senam prolanis lansia.',
      dataPointsCount: 4,
      generatedAt: '2026-08-24T06:00:00Z',
    },
    {
      id: 'PREV-CIT-8208-0105',
      citizenId: 'CIT-8208-0105',
      citizenName: 'Hasanudin S.',
      desaName: 'Desa Bobong',
      level: 'LOW',
      trajectorySignal: 'Tekanan darah stabil dalam rentang normal terkontrol (120/80 mmHg).',
      recommendedPreventiveSupport: 'Pemeliharaan gaya hidup sehat dan skrining berkala tahunan.',
      dataPointsCount: 5,
      generatedAt: '2026-08-24T06:00:00Z',
    },
  ];

  const filtered = predictions.filter((p) => {
    const matchesSearch =
      p.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.citizenId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || p.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-teal-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              PREVENTION TRAJECTORY INTELLIGENCE (PA-07)
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Prioritas Pencegahan Lanjut & Pemodelan Trajektori
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Dukungan keputusan internal petugas kesehatan untuk mendeteksi pergeseran pola metabolik/kardiovaskular longitudinal
              dan memprioritaskan edukasi preventif lebih dini sebelum terjadi komplikasi.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-teal-500/50 rounded-xl text-teal-300 text-xs font-bold shrink-0">
            <Lock className="w-4 h-4" />
            Internal Decision Support Only
          </div>
        </div>
      </div>

      {/* Non-Labeling Principle Callout */}
      <div className="p-4 bg-slate-900/90 border border-teal-900/60 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          Prinsip Etika Non-Diagnostik & Perlindungan Warga
        </div>
        <p className="text-slate-400 leading-relaxed">
          Skor model PA-07 <strong>TIDAK PERNAH</strong> ditampilkan kepada warga dalam bentuk label fatalistik (seperti "Anda pasti terkena diabetes").
          Data ini hanya digunakan sebagai panduan internal dokter & perawat dalam menyusun rencana promosi kesehatan dan konseling pola hidup.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama Warga / NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Prioritas Pencegahan:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="HIGH">Prioritas Tinggi (HIGH)</option>
            <option value="MEDIUM">Prioritas Sedang (MEDIUM)</option>
            <option value="LOW">Pemeliharaan Rutin (LOW)</option>
          </select>
        </div>
      </div>

      {/* Worklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{item.citizenName}</h3>
                  <div className="text-[11px] text-slate-400">{item.desaName} • {item.citizenId}</div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    item.level === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : item.level === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {item.level}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Sinyal Trajektori:</div>
                <p className="text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
                  {item.trajectorySignal}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-[11px] text-teal-400 font-semibold uppercase">Saran Pendampingan Faskes:</div>
                <p className="text-slate-300 bg-teal-950/40 p-2.5 rounded-xl border border-teal-800/40 leading-relaxed">
                  {item.recommendedPreventiveSupport}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Data Riwayat: {item.dataPointsCount} Observasi</span>
              <span>Model: PA-07 v1.8</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
