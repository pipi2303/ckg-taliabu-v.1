import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  HeartHandshake,
  Ship,
  Briefcase,
  Package,
  Clock,
  Shield,
  Filter,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationBarrierService } from '../../../services/populationBarrierService';
import { PopulationBarrierSummary } from '../../../types';

export const BarrierDistributionPage: React.FC = () => {
  const { user } = useAuth();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [barriers, setBarriers] = useState<PopulationBarrierSummary[]>([]);
  const [totalAssessments, setTotalAssessments] = useState<number>(0);
  const [insightNotes, setInsightNotes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, bData] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        populationBarrierService.getBarrierSummary(),
      ]);
      setCompleteness(compData);
      setBarriers(bData.summaries);
      setTotalAssessments(bData.totalAssessments);
      setInsightNotes(bData.insightNotes);
    } catch (err) {
      console.error('Failed to load barriers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBarriers =
    selectedCategory === 'ALL'
      ? barriers
      : barriers.filter((b) => b.category === selectedCategory);

  if (isLoading || !completeness) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat data agregat kendala warga...</p>
      </div>
    );
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'COMMUNITY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">Faktor Warga & Lingkungan</span>;
      case 'SYSTEM_SUPPLY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">Faktor Pasokan & Faskes</span>;
      case 'CLINICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">Faktor Klinis & Terapi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            POPULATION BARRIER INSIGHTS
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Distribusi Penyebab & Kendala Warga</h1>
            <DocBadge code="SCR-DNK-B07" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Agregasi taksonomi kendala terstandar dari Kader Lapangan, Aplikasi Sahabat Warga, dan Asesmen Kepatuhan Puskesmas.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Kategori Kendala</option>
              <option value="COMMUNITY" className="bg-slate-900">Faktor Warga & Lingkungan</option>
              <option value="SYSTEM_SUPPLY" className="bg-slate-900">Faktor Pasokan & Faskes</option>
              <option value="CLINICAL" className="bg-slate-900">Faktor Klinis</option>
            </select>
          </div>
        </div>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Non-Causal Epistemological Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-white uppercase tracking-wider">
            Pedoman Interpretasi Non-Kausalitas
          </span>
          <p className="text-slate-300 leading-relaxed">
            Data kendala di bawah merupakan <strong>frekuensi laporan deskriptif</strong> yang disampaikan warga dan kader. Satu warga dapat memiliki lebih dari 1 kendala bersamaan. Data ini ditujukan untuk memandu perumusan intervensi kebijakan publik (seperti pengadaan kapal jemputan atau penguatan buffer stok obat), bukan untuk menyatakan hubungan sebab-akibat deterministik tunggal.
          </p>
        </div>
      </div>

      {/* Barrier Distribution List */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Frekuensi Kendala Terlaporkan ({totalAssessments} Total Asesmen)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Persentase dihitung terhadap total laporan kendala valid yang terkumpul.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredBarriers.map((barrier, idx) => (
            <div
              key={barrier.causeCode}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 font-mono w-5">0{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{barrier.causeLabel}</span>
                      {getCategoryBadge(barrier.category)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Dilaporkan di: {barrier.reportingFacilities.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-base font-black text-white">{barrier.reportedCount}</span>
                    <span className="text-xs text-slate-400 ml-1">laporan</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                    {barrier.percentage}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, Math.max(4, barrier.percentage * 2))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Insights */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Catatan Sintesis Dinkes</h3>
        <div className="space-y-2">
          {insightNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-teal-400 shrink-0 mt-0.5">•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
