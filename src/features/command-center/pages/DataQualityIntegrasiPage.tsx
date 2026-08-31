import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Clock,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationCompletenessRepo } from '../../../repositories/populationCompletenessRepo';
import { PopulationDataCompleteness, SmallCellSuppressionPolicy } from '../../../types';

export const DataQualityIntegrasiPage: React.FC = () => {
  const { user } = useAuth();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [facilities, setFacilities] = useState<PopulationDataCompleteness[]>([]);
  const [policy, setPolicy] = useState<SmallCellSuppressionPolicy | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [isUpdatingPolicy, setIsUpdatingPolicy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, facList, pol] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        populationCompletenessRepo.getAll(),
        populationCompletenessRepo.getSmallCellPolicy(),
      ]);
      setCompleteness(compData);
      setFacilities(facList);
      setPolicy(pol);
      setNewThreshold(pol.threshold || 5);
    } catch (err) {
      console.error('Failed to load data quality:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !policy) return;
    setIsUpdatingPolicy(true);
    try {
      await populationCompletenessRepo.updateSmallCellPolicy({
        ...policy,
        threshold: newThreshold,
      });
      loadData();
    } catch (err) {
      console.error('Failed to update small cell policy:', err);
    } finally {
      setIsUpdatingPolicy(false);
    }
  };

  if (isLoading || !completeness) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat status integrasi data & kualitas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4 text-teal-600" />
          PEMERIKSAAN KUALITAS & KEAMANAN DATA
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Kualitas Data & Integrasi Wilayah</h1>
          <DocBadge code="SCR-DNK-B11" size="sm" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Pemantauan waktu pengiriman data dari 8 Puskesmas, pengiriman data luring kader, dan perlindungan kerahasiaan identitas warga.
        </p>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Integration Status Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Status Watermark & Sinkronisasi 8 Puskesmas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Waktu terakhir data skrining/layanan diterima di server Dinkes pusat.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Periksa Konektivitas</span>
          </button>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fasilitas Kesehatan</th>
                <th className="py-2.5 px-3">Status Pelaporan</th>
                <th className="py-2.5 px-3">Watermark Terakhir</th>
                <th className="py-2.5 px-3">Kader Sync Offline</th>
                <th className="py-2.5 px-3">Antrean DQ</th>
                <th className="py-2.5 px-3">Catatan Lapangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {facilities.map((fac) => {
                const isComplete = fac.reportingStatus === 'REPORTING_COMPLETE';
                const isStale = fac.reportingStatus === 'STALE';
                const isMissing = fac.reportingStatus === 'NOT_REPORTING';

                return (
                  <tr key={fac.facilityId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{fac.facilityName}</div>
                      <div className="text-[11px] text-slate-400">{fac.kecamatanName}</div>
                    </td>
                    <td className="py-3 px-3">
                      {isComplete ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Lengkap & Aktif
                        </span>
                      ) : isStale ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Terlambat (Stale)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-fit">
                          <WifiOff className="w-3 h-3" />
                          Belum Melapor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {fac.lastIngestionAt
                        ? new Date(fac.lastIngestionAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-3">
                      {fac.pendingKaderSyncCount > 0 ? (
                        <span className="font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-[11px]">
                          {fac.pendingKaderSyncCount} tertahan
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0 (Tersinkron)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {fac.dqQueueCount > 0 ? (
                        <span className="font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]">
                          {fac.dqQueueCount} issue
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">0 bersih</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-300 max-w-xs leading-tight">
                      {fac.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Small-Cell Suppression Governance (DS-OI-06) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kebijakan Privasi Sel Kecil (Small-Cell Suppression DS-OI-06)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standar perlindungan data agregat untuk mencegah re-identifikasi warga di pulau-pulau berpenduduk sedikit.
            </p>
          </div>
        </div>

        {policy && (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status Kebijakan:</span>
              <span className="font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                {policy.status} (Disetujui Komite Tata Kelola)
              </span>
            </div>

            <p className="leading-relaxed text-slate-300">{policy.rationale}</p>

            {user?.roleId !== 'BUPATI' && (
              <form onSubmit={handleUpdatePolicy} className="pt-2 flex items-center gap-3 border-t border-slate-700/80">
                <span className="text-slate-300 font-medium">Ambang Batas Penyembunyian (Threshold n &lt;):</span>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(parseInt(e.target.value) || 5)}
                  className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-center text-white font-bold"
                />
                <button
                  type="submit"
                  disabled={isUpdatingPolicy}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition text-xs"
                >
                  {isUpdatingPolicy ? 'Menyimpan...' : 'Perbarui Ambang Batas'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
