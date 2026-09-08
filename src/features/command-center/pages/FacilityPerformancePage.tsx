import React, { useState, useEffect } from 'react';
import {
  Building2,
  Info,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  WifiOff,
  Ship,
  Sparkles,
  FileSpreadsheet,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { PuskesmasWorkloadComparisonSection } from '../components/PuskesmasWorkloadComparisonSection';
import { PuskesmasMonthlyTrendChart } from '../components/PuskesmasMonthlyTrendChart';
import { PuskesmasDetailTrendModal } from '../components/PuskesmasDetailTrendModal';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { facilityPerformanceService } from '../../../services/facilityPerformanceService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { FacilityPerformanceSummary } from '../../../types';
import { ChevronDown, ChevronUp, LineChart as LineChartIcon, Maximize2 } from 'lucide-react';

export const FacilityPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [facilities, setFacilities] = useState<FacilityPerformanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [expandedFacilityTrendId, setExpandedFacilityTrendId] = useState<string | null>(null);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState<boolean>(false);
  const [modalFacilityId, setModalFacilityId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, facData] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        facilityPerformanceService.getFacilitySummaries(),
      ]);
      setCompleteness(compData);
      setFacilities(facData);
    } catch (err) {
      console.error('Failed to load facility performance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(user);
      addToast('Tabel Kinerja 8 Puskesmas (.xlsx) berhasil diunduh', 'success');
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

  if (isLoading || !completeness) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat evaluasi kinerja puskesmas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            CONTEXTUAL HEALTH CENTER MONITORING
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Kinerja & Kapasitas Puskesmas</h1>
            <DocBadge code="SCR-DNK-B05" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Perbandingan multi-dimensi berimbang dengan mempertimbangkan tantangan geografis kepulauan, rasio penutupan manual, dan integritas kelengkapan data (tanpa pemeringkatan tunggal).
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600/50 transition flex items-center gap-2 cursor-pointer self-start md:self-center disabled:opacity-50"
        >
          {isExportingExcel ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          )}
          <span>{isExportingExcel ? 'Menyusun Excel...' : 'Ekspor Tabel Puskesmas (.xlsx)'}</span>
        </button>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Komparasi Grafik Beban Skrining, Warga Ditangani & Kesenjangan Kasus */}
      <PuskesmasWorkloadComparisonSection
        facilities={facilities}
        onFacilityClick={(fId) => {
          setModalFacilityId(fId);
          setIsTrendModalOpen(true);
        }}
      />

      {/* Non-Leaderboard Philosophy Note */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-white uppercase tracking-wider">
            Prinsip Evaluasi Kontekstual (Anti-Leaderboard)
          </span>
          <p className="text-slate-300 leading-relaxed">
            Puskesmas di Pulau Taliabu memiliki profil medan yang sangat bervariasi (mulai dari pusat kota Bobong hingga pesisir terisolir Pancado dan Gela). Dashboard ini sengaja tidak menggunakan sistem peringkat/ranking tunggal yang tidak adil, melainkan menampilkan metrik capaian berdampingan dengan konteks aksesibilitas, rasio penutupan tugas manual, dan catatan integritas data.
          </p>
        </div>
      </div>

      {/* Facilities Cards Grid with Longitudinal Trend Line Chart */}
      <div className="space-y-4">
        {facilities.map((fac) => {
          const isNotReporting = fac.dataCompleteness === 'PARTIAL' && fac.screenedCount === 0;
          const isStale = fac.dataCompleteness === 'STALE';
          const isHighManual = fac.manualClosureRatio > 25;
          const isTrendExpanded = expandedFacilityTrendId === fac.facilityId;

          return (
            <div
              key={fac.facilityId}
              className={`p-5 rounded-2xl bg-[#FAF9F6] border transition shadow-sm space-y-4 ${
                isNotReporting
                  ? 'border-amber-300 bg-amber-50/60'
                  : isStale
                  ? 'border-amber-300/80 bg-amber-50/40'
                  : 'border-[#D8E5E2] hover:border-teal-600/40'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{fac.facilityName}</h3>
                      <span className="text-xs text-slate-500 font-medium">({fac.kecamatanName})</span>
                      {fac.isRemoteIsland && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                          <Ship className="w-3 h-3" />
                          Pesisir / Kepulauan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{fac.accessibilityContext}</p>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {isNotReporting ? (
                    <span className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1.5">
                      <WifiOff className="w-3.5 h-3.5" />
                      Belum Melapor Bulan Ini
                    </span>
                  ) : isStale ? (
                    <span className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Data Terlambat (Stale)
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pelaporan Lengkap
                    </span>
                  )}

                  {/* Toggle Inline Line Chart Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFacilityTrendId(isTrendExpanded ? null : fac.facilityId)
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isTrendExpanded
                        ? 'bg-teal-700 text-white border-teal-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-teal-800 border-slate-200'
                    }`}
                    title="Buka / Tutup Tren Bulanan"
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                    <span>{isTrendExpanded ? 'Tutup Tren' : 'Tren Bulanan'}</span>
                    {isTrendExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Open Modal Fullscreen Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalFacilityId(fac.facilityId);
                      setIsTrendModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs"
                    title="Buka Modal Analisis Lengkap"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#D8E5E2]">
                <div className="p-3 rounded-xl bg-white border border-[#E2ECE9] shadow-2xs">
                  <div className="text-[11px] text-slate-500 mb-1">Skrining Selesai</div>
                  <div className="text-lg font-bold text-slate-900">
                    {isNotReporting ? '—' : fac.screenedCount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2ECE9] shadow-2xs">
                  <div className="text-[11px] text-slate-500 mb-1">Temuan Berisiko (Eligible)</div>
                  <div className="text-lg font-bold text-slate-900">
                    {isNotReporting ? '—' : fac.eligibleFollowUpCount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2ECE9] shadow-2xs">
                  <div className="text-[11px] text-slate-500 mb-1">Hadir Tindak Lanjut</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {isNotReporting ? '—' : `${fac.attendedFollowUpCount} (${fac.continuityRate}%)`}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border shadow-2xs ${
                    isHighManual
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-white border-[#E2ECE9] text-slate-900'
                  }`}
                >
                  <div className="text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                    <span>Penutupan Tugas Manual</span>
                    {isHighManual && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                  </div>
                  <div className="text-lg font-bold">
                    {isNotReporting ? '—' : `${fac.manualClosureRatio}% (${fac.manualClosureCount} kasus)`}
                  </div>
                </div>
              </div>

              {/* Expandable Longitudinal Trend Line Chart Component */}
              {isTrendExpanded && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <PuskesmasMonthlyTrendChart
                    facilityId={fac.facilityId}
                    facilityName={fac.facilityName}
                    kecamatanName={fac.kecamatanName}
                    isRemoteIsland={fac.isRemoteIsland}
                  />
                </div>
              )}

              {/* Notes & Special Alerts */}
              {fac.notes.length > 0 && (
                <div className="pt-2 text-xs space-y-1">
                  {fac.notes.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600">
                      <span className="text-teal-600">•</span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 18 Pending Offline Syncs Highlight */}
              {fac.pendingKaderSyncCount > 0 && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>
                    Terdapat <strong>{fac.pendingKaderSyncCount} catatan kunjungan kader</strong> tersimpan di HP/tablet kader desa terpencil yang belum terunggah ke server (tidak dihitung sebagai kasus mangkir).
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Puskesmas Detail Trend Modal */}
      <PuskesmasDetailTrendModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        initialFacilityId={modalFacilityId}
        facilities={facilities}
      />
    </div>
  );
};
