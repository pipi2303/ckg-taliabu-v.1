import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Send, UserCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { dropoutMonitoringService, DropoutRiskAssessment } from '../../services/dropoutMonitoringService';
import { User } from '../../types';

interface DropoutMonitoringPageProps {
  currentUser: User;
}

export const DropoutMonitoringPage: React.FC<DropoutMonitoringPageProps> = ({ currentUser }) => {
  const [assessments, setAssessments] = useState<DropoutRiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingCycleId, setProcessingCycleId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await dropoutMonitoringService.scanCyclesForDropoutRisk();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to scan dropout risk', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateOutreach = async (item: DropoutRiskAssessment) => {
    setProcessingCycleId(item.cycleId);
    try {
      await dropoutMonitoringService.flagDropoutAndCreateOutreach(item.cycleId, currentUser);
      showToast(`Task penjangkauan ulang re-engagement (Skor ${item.recommendedPriorityScore}) berhasil dialirkan ke antrean penjangkauan.`);
      loadData();
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    } finally {
      setProcessingCycleId(null);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-900/80 rounded-full text-xs font-semibold text-rose-200 mb-2 border border-rose-700/40">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Deteksi Dini & Mitigasi Dropout Perawatan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display">Risiko Putus Perawatan & Re-engagement</h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Mendeteksi warga yang terlewat jadwal kontrol (&gt;14 hari) atau persediaan obat telah habis, dan mengalirkannya ke kaskade penjangkauan ulang dengan prioritas operasional tinggi.
        </p>
      </div>

      {/* Invariant Guidance */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Ketentuan Mutlak (Hard Governance Invariant):</p>
          <p className="mt-0.5 leading-relaxed">
            Sistem <strong>dilarang secara otomatis</strong> mengubah status pasien menjadi <em>LOST_TO_FOLLOWUP</em> (Putus Kontak Permanen). Klasifikasi tersebut mewajibkan verifikasi penjangkauan manusia (Kader/Perawat) dan persetujuan penanggung jawab wilayah.
          </p>
        </div>
      </div>

      {/* Risk List */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm">
            Daftar Kasus Berisiko Putus Perawatan ({assessments.length} Kasus)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3 px-4">Warga & Faskes</th>
                <th className="py-3 px-3">Kondisi</th>
                <th className="py-3 px-3">Jadwal Kontrol Terlewat</th>
                <th className="py-3 px-3">Estimasi Stok Obat (OI-07)</th>
                <th className="py-3 px-3">Alasan Risiko</th>
                <th className="py-3 px-4 text-right">Tindakan Re-engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">Memindai risiko putus perawatan...</td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-emerald-800 font-semibold bg-emerald-50/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    Tidak ada pasien yang terlewat kontrol melebihi batas toleransi.
                  </td>
                </tr>
              ) : (
                assessments.map((item) => (
                  <tr key={item.cycleId} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.citizenName}</div>
                      <div className="text-[11px] text-stone-500">{item.facilityName}</div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-stone-800">
                      {item.condition}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-stone-800 font-medium">{item.plannedControlAt}</div>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-1 inline-block">
                        Terlewat {item.daysOverdue} Hari
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {item.estimatedRunoutDate ? (
                        <div>
                          <div className="text-stone-800 font-mono text-[11px]">{item.estimatedRunoutDate}</div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.isRunoutPassed ? 'bg-rose-100 text-rose-900' : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {item.isRunoutPassed ? 'Habis (Est.)' : 'Mencukupi'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Belum ada estimasi</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-stone-700 max-w-xs">
                      {item.reason}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs"
                        disabled={processingCycleId === item.cycleId}
                        onClick={() => handleCreateOutreach(item)}
                      >
                        <Send className={`w-3.5 h-3.5 mr-1 ${processingCycleId === item.cycleId ? 'animate-spin' : ''}`} />
                        <span>Alirkan ke Penjangkauan</span>
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
