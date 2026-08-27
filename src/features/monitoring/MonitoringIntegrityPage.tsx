import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, Activity, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { monitoringIntegrityService, IntegrityAuditReport } from '../../services/monitoringIntegrityService';
import { monitoringCycleService } from '../../services/monitoringCycleService';
import { MonitoringGapItem, User } from '../../types';

interface MonitoringIntegrityPageProps {
  currentUser: User;
}

export const MonitoringIntegrityPage: React.FC<MonitoringIntegrityPageProps> = ({ currentUser }) => {
  const [report, setReport] = useState<IntegrityAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resolvingGapId, setResolvingGapId] = useState<string | null>(null);

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const data = await monitoringIntegrityService.checkIntegrity();
      setReport(data);
    } catch (err) {
      console.error('Failed to run integrity audit', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveGap = async (gap: MonitoringGapItem) => {
    setResolvingGapId(gap.citizenId);
    try {
      // Create new cycle to close gap
      await monitoringCycleService.startInitialCycleFromEncounter('ENC-2026-0001', currentUser);
      showToast(`Kesenjangan pemantauan untuk ${gap.citizenName} berhasil dipulihkan dengan siklus baru.`);
      loadAudit();
    } catch (err: any) {
      showToast(`Gagal memulihkan: ${err.message}`);
    } finally {
      setResolvingGapId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00201C] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-900/40">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Integritas Sistem & Jaminan Kontinuitas</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black font-display">Audit Integritas Pemantauan Klinis</h1>
              <DocBadge code="SCR-PKM-F07" size="sm" />
            </div>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Memastikan seluruh warga dalam perawatan hipertensi dan diabetes di Pulau Taliabu terpantau aktif dalam alur tindak lanjut berkesinambungan.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAudit} disabled={isLoading} className="border-teal-700 text-teal-100 hover:bg-teal-900">
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Jalankan Ulang Audit</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-4 border-stone-200 bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Pasien Dalam Terapi</p>
          <p className="text-2xl font-black text-black mt-1">{report?.totalOnTreatmentCitizens || 0}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Total kohort aktif</p>
        </Card>

        <Card className="p-4 border-teal-200 bg-teal-50/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Siklus Aktif</p>
          <p className="text-2xl font-black text-teal-950 mt-1">{report?.activeCycleCount || 0}</p>
          <p className="text-[10px] text-teal-700 mt-0.5">Berjalan sesuai jadwal</p>
        </Card>

        <Card className="p-4 border-sky-200 bg-[#E1F5FE]/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Perawatan FKRTL (RSUD)</p>
          <p className="text-2xl font-black text-sky-950 mt-1">{report?.fkrtlContinuingCount || 0}</p>
          <p className="text-[10px] text-sky-700 mt-0.5">Rujukan spesialis aktif</p>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Penjangkauan Kader</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{report?.outreachReengagementCount || 0}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Re-engagement Outreach</p>
        </Card>

        <Card className={`p-4 border-2 ${
          (report?.gapCount || 0) === 0 ? 'border-emerald-500 bg-emerald-50/40' : 'border-rose-500 bg-rose-50/40'
        }`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center justify-between">
            <span>Perlu Pemulihan Siklus</span>
            <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-mono border">Target: 0</span>
          </p>
          <p className={`text-2xl font-black mt-1 ${(report?.gapCount || 0) === 0 ? 'text-emerald-800' : 'text-rose-900'}`}>
            {report?.gapCount || 0}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {(report?.gapCount || 0) === 0 ? 'Integritas 100% Tercapai' : 'Wajib segera ditindaklanjuti'}
          </p>
        </Card>
      </div>

      {/* Overlapping Cycles Warnings */}
      {report?.overlappingCycleAlerts && report.overlappingCycleAlerts.length > 0 && (
        <Card className="p-5 border-amber-300 bg-amber-50/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Peringatan Siklus Tumpang Tindih (Overlapping Cycles Detected)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Sistem mendeteksi adanya siklus ganda aktif bersamaan pada warga berikut. Sesuai tata kelola, data tidak dihapus diam-diam, namun disatukan menjadi siklus tunggal dengan nomor siklus tertinggi.
          </p>
          <div className="space-y-2">
            {report.overlappingCycleAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-white border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">{alert.citizenName}</span>
                  <span className="text-stone-500 ml-2 font-mono">({alert.cycleIds.join(', ')})</span>
                  <p className="text-amber-900 mt-0.5">{alert.notice}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Rekonsiliasi Siklus
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* List */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-700" />
            <h3 className="font-bold text-stone-900 text-sm">Daftar Warga Memerlukan Penyesuaian Pemantauan</h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">{report?.gaps.length || 0} kasus memerlukan intervensi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/60 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3 px-4">Warga & Faskes</th>
                <th className="py-3 px-3">Riwayat Klinis Terakhir</th>
                <th className="py-3 px-3">Penyebab Kesenjangan</th>
                <th className="py-3 px-3">Rekomendasi Tindakan</th>
                <th className="py-3 px-4 text-right">Pemulihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">Menjalankan audit integritas data...</td>
                </tr>
              ) : (report?.gaps.length || 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-emerald-800 font-semibold bg-emerald-50/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    Sempurna! Seluruh pasien terpantau aktif dan berkesinambungan.
                  </td>
                </tr>
              ) : (
                report?.gaps.map((gap, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{gap.citizenName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">NIK: {gap.citizenNik}</div>
                      <div className="text-[11px] text-stone-600">{gap.villageName} • {gap.facilityName}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-800">{gap.lastClinicalEvent}</div>
                      <div className="text-[10px] text-stone-500">Siklus terakhir: #{gap.lastCycleNumber || 1}</div>
                    </td>

                    <td className="py-3 px-3 text-rose-900 font-medium">
                      <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 leading-snug">
                        {gap.gapReason}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-stone-700">
                      <div className="leading-snug">{gap.recommendedAction}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs"
                        disabled={resolvingGapId === gap.citizenId}
                        onClick={() => handleResolveGap(gap)}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${resolvingGapId === gap.citizenId ? 'animate-spin' : ''}`} />
                        <span>Pulihkan Siklus</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
