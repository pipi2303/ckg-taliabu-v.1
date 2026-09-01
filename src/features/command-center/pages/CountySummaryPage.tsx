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
import { ImpactLevelAnalyticsCharts } from '../components/ImpactLevelAnalyticsCharts';
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
      addToast('Laporan PDF Eksekutif Dinas Kesehatan berhasil diunduh', 'success');
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
        <p className="text-xs">Memuat ringkasan populasi Dinas Kesehatan Pulau Taliabu...</p>
      </div>
    );
  }

  const largestDropStage = cascade.stages.find((s) => s.isLargestDrop);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" />
            PUSAT INFORMASI DINAS KESEHATAN
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Ringkasan Capaian Dinas Kesehatan</h1>
            <DocBadge code="SCR-DNK-B01" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Ringkasan cakupan pemeriksaan Cek Kesehatan Gratis (CKG), kunjungan kontrol pasien di Puskesmas, dan kendala akses pelayanan warga.
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
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Activity className="w-4 h-4 text-teal-700" />
            CKG Impact Index
          </div>
          <button
            onClick={() => onNavigate?.('dinkes-impact-index')}
            className="text-xs text-teal-700 hover:text-teal-800 font-medium transition flex items-center gap-1"
          >
            <span>Lihat Detail Metrik & Formula</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recharts Analytics Charts for Level 1, 2, and 3 (Bar, Area, Composed, Cohort) */}
        <ImpactLevelAnalyticsCharts impact={impact} onNavigate={onNavigate} />
      </div>

      {/* 3. Cascade Funnel Overview & Largest Drop Point */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-700" />
                Ringkasan Kaskade Tindak Lanjut
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">Perjalanan warga dari temuan awal hingga tata laksana</p>
            </div>
            <button
              onClick={() => onNavigate?.('dinkes-kaskade')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold transition flex items-center gap-1 cursor-pointer"
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
                    <span className="font-semibold text-stone-700">{stg.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black">{stg.count.toLocaleString('id-ID')}</span>
                      <span className="text-[11px] text-stone-500">({pctOfFirst}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stg.isLargestDrop ? 'bg-rose-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.max(4, pctOfFirst)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Awaiting & Exits Badge */}
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                {cascade.awaitingConfirmationCount} Menunggu Konfirmasi Klinis
              </span>
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                {cascade.exits.totalExits} Kasus Keluar (LTFU/Refused)
              </span>
            </div>
            <div className="text-[11px] text-stone-600 font-medium">
              Sinyal Penutupan Manual: <strong className="text-amber-800">{cascade.manualTaskClosureRatio}%</strong>
            </div>
          </div>
        </div>

        {/* Largest Drop Focus Card & Top Actionable Insights */}
        <div className="space-y-4">
          {/* Largest Drop Card */}
          {largestDropStage && (
            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                Titik Penyusutan Terbesar (Drop-Off)
              </div>
              <div>
                <h4 className="text-base font-bold text-black">{largestDropStage.label}</h4>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  Terjadi penyusutan sebanyak <strong className="text-black font-bold">{largestDropStage.shrinkageCount?.toLocaleString('id-ID')} warga</strong> ({largestDropStage.shrinkagePercentage}% drop dari tahap sebelumnya).
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('dinkes-gap')}
                className="w-full py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Analisis Gap Tahap Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Reported Barrier */}
          <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pola Kendala Utama
              </div>
              <button
                onClick={() => onNavigate?.('dinkes-penyebab-kendala')}
                className="text-[11px] text-teal-700 font-semibold hover:underline cursor-pointer"
              >
                Semua Kendala
              </button>
            </div>

            <div className="space-y-2">
              {barriers.slice(0, 3).map((b) => (
                <div key={b.causeCode} className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-800 font-medium truncate max-w-[170px]">{b.causeLabel}</span>
                  <span className="font-bold text-stone-900 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[11px]">
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
          className="p-4 rounded-xl bg-[#faf9f6] border border-teal-300 hover:border-teal-600 text-left transition group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-teal-100 text-teal-800 w-fit mb-3 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-black group-hover:text-teal-800 transition flex items-center gap-1">
            Proyeksi AI 6-Bulan
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[9px] font-bold">AI</span>
          </h4>
          <p className="text-[11px] text-stone-600 mt-1">Forecasting kebutuhan obat kronis & risiko drop-out cuaca laut.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-wilayah')}
          className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200 hover:border-teal-600 text-left transition group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 w-fit mb-3 group-hover:scale-105 transition">
            <MapPin className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-black group-hover:text-teal-800 transition">Analisis Wilayah</h4>
          <p className="text-[11px] text-stone-600 mt-1">Peta & matriks sebaran kecamatan dengan proteksi sel kecil.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-kinerja-pkm')}
          className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200 hover:border-sky-600 text-left transition group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 w-fit mb-3 group-hover:scale-105 transition">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-black group-hover:text-sky-800 transition">Kinerja Puskesmas</h4>
          <p className="text-[11px] text-stone-600 mt-1">Perbandingan kontekstual berbobot kondisi geografis tanpa peringkat tunggal.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-intervensi-populasi')}
          className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200 hover:border-emerald-600 text-left transition group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3 group-hover:scale-105 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-black group-hover:text-emerald-800 transition">Intervensi Populasi</h4>
          <p className="text-[11px] text-stone-600 mt-1">Kelola program intervensi berbasis metrik masalah di lapangan.</p>
        </button>

        <button
          onClick={() => onNavigate?.('dinkes-kualitas-data')}
          className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200 hover:border-indigo-600 text-left transition group shadow-xs cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 w-fit mb-3 group-hover:scale-105 transition">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-black group-hover:text-indigo-800 transition">Kualitas & Integrasi</h4>
          <p className="text-[11px] text-stone-600 mt-1">Status watermark faskes, antrean sync offline kader, dan audit data.</p>
        </button>
      </div>
    </div>
  );
};
