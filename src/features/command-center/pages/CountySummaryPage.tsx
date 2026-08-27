import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  MapPin,
  FileCheck2,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { QualifiedMetricCard } from '../components/QualifiedMetricCard';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { impactIndexService, ImpactIndexSummary } from '../../../services/impactIndexService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { populationBarrierService } from '../../../services/populationBarrierService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { CascadeAggregation, PopulationBarrierSummary } from '../../../types';

interface CountySummaryPageProps {
  onNavigate?: (navId: string) => void;
}

export const CountySummaryPage: React.FC<CountySummaryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [impact, setImpact] = useState<ImpactIndexSummary | null>(null);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [barriers, setBarriers] = useState<PopulationBarrierSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, impactData, cascadeData, barrierData] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        impactIndexService.getImpactIndex(),
        populationCascadeService.getCascadeAggregation(),
        populationBarrierService.getBarrierSummary(),
      ]);
      setCompleteness(compData);
      setImpact(impactData);
      setCascade(cascadeData);
      setBarriers(barrierData.summaries);
    } catch (err) {
      console.error('Failed to load county summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!user) return;
    setIsExportingPDF(true);
    try {
      await commandCenterExportService.exportExecutivePDF(user);
      addToast('Laporan PDF Eksekutif Bupati & Kadinkes berhasil diunduh', 'success');
    } catch (err) {
      console.error('PDF Export error:', err);
      addToast('Gagal menghasilkan file PDF', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(user);
      addToast('Workbook Excel (.xlsx) 5-Tab berhasil diunduh', 'success');
    } catch (err) {
      console.error('Excel Export error:', err);
      addToast('Gagal menghasilkan file Excel', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !completeness || !impact || !cascade) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat ringkasan populasi Kabupaten Pulau Taliabu...</p>
      </div>
    );
  }

  const largestDropStage = cascade.stages.find((s) => s.isLargestDrop);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            POPULATION HEALTH COMMAND CENTER
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Ringkasan Eksekutif Kabupaten</h1>
            <DocBadge code="SCR-DNK-B01" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Gambaran komprehensif cakupan skrining CKG, kontinuitas tindak lanjut klinis, titik penyusutan kaskade, dan distribusi kendala wilayah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-700 hover:bg-teal-600 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh Laporan Eksekutif Format PDF Resmi"
          >
            {isExportingPDF ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPDF ? 'Menyusun PDF...' : 'Ekspor PDF'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh Buku Kerja Excel (.xlsx) 5 Tab"
          >
            {isExportingExcel ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>{isExportingExcel ? 'Menyusun Excel...' : 'Ekspor Excel'}</span>
          </button>
          <button
            onClick={() => onNavigate?.('dinkes-kepala-daerah')}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Tampilan Bupati</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate?.('dinkes-laporan')}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800/60 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Pusat Laporan</span>
          </button>
        </div>
      </div>

      {/* 1. Completeness Banner */}
      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* 2. CKG Impact Index (Level 1, Level 2, Level 3) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="w-4 h-4 text-teal-400" />
            CKG Impact Index
          </div>
          <button
            onClick={() => onNavigate?.('dinkes-impact-index')}
            className="text-xs text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
          >
            <span>Lihat Detail Metrik & Formula</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QualifiedMetricCard
            metric={impact.level1Coverage}
            levelBadge="Level 1"
            canDrilldown={user?.roleId !== 'BUPATI'}
            onDrilldown={() => onNavigate?.('dinkes-wilayah')}
          />
          <QualifiedMetricCard
            metric={impact.level2Continuity}
            levelBadge="Level 2"
            canDrilldown={user?.roleId !== 'BUPATI'}
            onDrilldown={() => onNavigate?.('dinkes-gap')}
          />
          <QualifiedMetricCard metric={impact.level3Outcome} levelBadge="Level 3" />
        </div>
      </div>

      {/* 3. Cascade Funnel Overview & Largest Drop Point */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Ringkasan Kaskade Tindak Lanjut
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Perjalanan warga dari temuan awal hingga tata laksana</p>
            </div>
            <button
              onClick={() => onNavigate?.('dinkes-kaskade')}
              className="text-xs text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
            >
              <span>Buka Kaskade Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Cascade Funnel Bars */}
          <div className="space-y-3 pt-2">
            {cascade.stages.slice(0, 7).map((stg) => {
              const pctOfFirst = cascade.stages[0]?.count
                ? Math.round((stg.count / cascade.stages[0].count) * 100)
                : 0;

              return (
                <div key={stg.stageId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{stg.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{stg.count.toLocaleString('id-ID')}</span>
                      <span className="text-[11px] text-slate-400">({pctOfFirst}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stg.isLargestDrop ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(4, pctOfFirst)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Awaiting & Exits Badge */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                {cascade.awaitingConfirmationCount} Menunggu Konfirmasi Klinis
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {cascade.exits.totalExits} Kasus Keluar (LTFU/Refused)
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Sinyal Penutupan Manual: <strong className="text-amber-300">{cascade.manualTaskClosureRatio}%</strong>
            </div>
          </div>
        </div>

        {/* Largest Drop Focus Card & Top Actionable Insights */}
        <div className="space-y-4">
          {/* Largest Drop Card */}
          {largestDropStage && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                Titik Penyusutan Terbesar (Drop-Off)
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{largestDropStage.label}</h4>
                <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  Terjadi penyusutan sebanyak <strong className="text-white">{largestDropStage.shrinkageCount?.toLocaleString('id-ID')} warga</strong> ({largestDropStage.shrinkagePercentage}% drop dari tahap sebelumnya).
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('dinkes-gap')}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Analisis Gap Tahap Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Reported Barrier */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Pola Kendala Utama
              </div>
              <button
                onClick={() => onNavigate?.('dinkes-penyebab-kendala')}
                className="text-[11px] text-teal-400 hover:underline"
              >
                Semua Kendala
              </button>
            </div>

            <div className="space-y-2">
              {barriers.slice(0, 3).map((b) => (
                <div key={b.causeCode} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[170px]">{b.causeLabel}</span>
                  <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-slate-800 text-[11px]">
                    {b.reportedCount} lap ({b.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button
          onClick={() => onNavigate?.('ai-proyeksi-beban')}
          className="p-4 rounded-xl bg-gradient-to-b from-teal-950/40 to-slate-900/90 border border-teal-500/40 hover:border-teal-400 text-left transition group shadow-md"
        >
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 w-fit mb-3 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition flex items-center gap-1">
            Proyeksi AI 6-Bulan
            <span className="px-1.5 py-0.2 rounded bg-teal-900/80 text-teal-300 text-[9px]">AI Intelligence</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-1">Forecasting kebutuhan obat kronis & risiko drop-out cuaca laut.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-wilayah')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 text-left transition group"
        >
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-3 group-hover:scale-105 transition">
            <MapPin className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition">Analisis Wilayah</h4>
          <p className="text-[11px] text-slate-400 mt-1">Peta & matriks sebaran kecamatan dengan proteksi sel kecil.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-kinerja-pkm')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 text-left transition group"
        >
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 w-fit mb-3 group-hover:scale-105 transition">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white group-hover:text-sky-300 transition">Kinerja Puskesmas</h4>
          <p className="text-[11px] text-slate-400 mt-1">Perbandingan kontekstual berbobot kondisi geografis tanpa peringkat tunggal.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-intervensi-populasi')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 text-left transition group"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">Intervensi Populasi</h4>
          <p className="text-[11px] text-slate-400 mt-1">Kelola program intervensi berbasis metrik masalah di lapangan.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-kualitas-data')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 text-left transition group"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3 group-hover:scale-105 transition">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">Kualitas & Integrasi</h4>
          <p className="text-[11px] text-slate-400 mt-1">Status watermark faskes, antrean sync offline kader, dan audit data.</p>
        </button>
      </div>
    </div>
  );
};
