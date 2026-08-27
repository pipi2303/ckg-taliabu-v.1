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
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { facilityPerformanceService } from '../../../services/facilityPerformanceService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { FacilityPerformanceSummary } from '../../../types';

export const FacilityPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [facilities, setFacilities] = useState<FacilityPerformanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

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

      {/* Facilities Cards Grid */}
      <div className="space-y-4">
        {facilities.map((fac) => {
          const isNotReporting = fac.dataCompleteness === 'PARTIAL' && fac.screenedCount === 0;
          const isStale = fac.dataCompleteness === 'STALE';
          const isHighManual = fac.manualClosureRatio > 25;

          return (
            <div
              key={fac.facilityId}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition shadow-lg space-y-4 ${
                isNotReporting
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : isStale
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{fac.facilityName}</h3>
                      <span className="text-xs text-slate-400 font-medium">({fac.kecamatanName})</span>
                      {fac.isRemoteIsland && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700 flex items-center gap-1">
                          <Ship className="w-3 h-3" />
                          Pesisir / Kepulauan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{fac.accessibilityContext}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-end md:self-center">
                  {isNotReporting ? (
                    <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1.5">
                      <WifiOff className="w-3.5 h-3.5" />
                      Belum Melapor Bulan Ini
                    </span>
                  ) : isStale ? (
                    <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Data Terlambat (Stale)
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pelaporan Lengkap
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">Skrining Selesai</div>
                  <div className="text-lg font-bold text-white">
                    {isNotReporting ? '—' : fac.screenedCount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">Temuan Berisiko (Eligible)</div>
                  <div className="text-lg font-bold text-white">
                    {isNotReporting ? '—' : fac.eligibleFollowUpCount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">Hadir Tindak Lanjut</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {isNotReporting ? '—' : `${fac.attendedFollowUpCount} (${fac.continuityRate}%)`}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isHighManual
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-slate-800/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <span>Penutupan Tugas Manual</span>
                    {isHighManual && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  </div>
                  <div className="text-lg font-bold">
                    {isNotReporting ? '—' : `${fac.manualClosureRatio}% (${fac.manualClosureCount} kasus)`}
                  </div>
                </div>
              </div>

              {/* Notes & Special Alerts */}
              {fac.notes.length > 0 && (
                <div className="pt-2 text-xs space-y-1">
                  {fac.notes.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400">
                      <span className="text-teal-400">•</span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 18 Pending Offline Syncs Highlight */}
              {fac.pendingKaderSyncCount > 0 && (
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    Terdapat <strong>{fac.pendingKaderSyncCount} catatan kunjungan kader</strong> tersimpan di HP/tablet kader desa terpencil yang belum terunggah ke server (tidak dihitung sebagai kasus mangkir).
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
