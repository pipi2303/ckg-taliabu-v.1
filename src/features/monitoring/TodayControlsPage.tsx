import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, HeartHandshake, CheckCircle2, UserCheck, AlertCircle, Send } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { monitoringCycleRepo } from '../../repositories/monitoringCycleRepo';
import { adherenceAssessmentRepo } from '../../repositories/adherenceAssessmentRepo';
import { outcomeEvaluationRepo } from '../../repositories/outcomeEvaluationRepo';
import { citizenRepo } from '../../repositories/citizenRepo';
import { monitoringReminderService } from '../../services/monitoringReminderService';
import { ControlVisitModal } from './modals/ControlVisitModal';
import { AdherenceAssessmentModal } from './modals/AdherenceAssessmentModal';
import { MonitoringCycle, User, AdherenceAssessment, OutcomeEvaluation } from '../../types';

interface TodayControlsPageProps {
  currentUser: User;
}

export const TodayControlsPage: React.FC<TodayControlsPageProps> = ({ currentUser }) => {
  const [cycles, setCycles] = useState<MonitoringCycle[]>([]);
  const [adherences, setAdherences] = useState<AdherenceAssessment[]>([]);
  const [evaluations, setEvaluations] = useState<OutcomeEvaluation[]>([]);
  const [selectedCycleForVisit, setSelectedCycleForVisit] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForAdherence, setSelectedCycleForAdherence] = useState<MonitoringCycle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allCycles, allAdhs, allEvals] = await Promise.all([
        monitoringCycleRepo.getAll(),
        adherenceAssessmentRepo.getAll(),
        outcomeEvaluationRepo.getAll(),
      ]);

      // Today or within the current week for demo purposes
      const todayStr = '2026-08-24';
      const dueTodayList = allCycles.filter(
        (c) => c.plannedControlAt <= todayStr || c.actualControlAt === todayStr || c.cycleStatus === 'AWAITING_CONTROL'
      );
      setCycles(dueTodayList);
      setAdherences(allAdhs);
      setEvaluations(allEvals);
    } catch (err) {
      console.error('Failed to load today controls', err);
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

  const handleSendReminder = async (cycle: MonitoringCycle) => {
    try {
      const citizen = await citizenRepo.getById(cycle.citizenId);
      if (!citizen) throw new Error('Data warga tidak ditemukan.');
      await monitoringReminderService.sendMonitoringReminder(citizen, cycle);
      showToast(`Pengingat kehadiran berhasil dikirim ke ${citizen.fullName}.`);
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00201C] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 shadow-xl border border-teal-900/40 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Antrean Layanan Harian Faskes</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black font-display">Kontrol Hari Ini & Menjelang Jadwal</h1>
            <DocBadge code="SCR-PKM-F02" size="sm" />
          </div>
          <p className="text-stone-300 text-xs mt-1 max-w-2xl">
            Daftar warga terjadwal kontrol di Puskesmas/Pustu untuk verifikasi kehadiran, konfirmasi sisa persediaan obat, dan pemeriksaan parameter klinis terkonfirmasi.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-stone-400">Total Antrean Kontrol</p>
          <p className="text-3xl font-black text-teal-200">{cycles.length}</p>
        </div>
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-stone-500">Memuat antrean kontrol...</div>
        ) : cycles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500">
            Tidak ada jadwal kontrol jatuh tempo hari ini.
          </div>
        ) : (
          cycles.map((c) => {
            const isCompleted = c.cycleStatus === 'COMPLETED' || Boolean(c.actualControlAt);
            const adhItem = adherences.find((a) => a.cycleId === c.id);

            return (
              <Card
                key={c.id}
                className={`p-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Siklus #{c.cycleNumber}
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm mt-1">{c.citizenName}</h3>
                    <p className="text-xs text-stone-500 font-mono">
                      NIK: {c.citizenNik ? `${c.citizenNik.substring(0, 6)}••••••` : '••••••••••••'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isCompleted ? 'Sudah Hadir' : 'Menunggu Hadir'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Kondisi:</span>
                    <span className="font-semibold">{c.condition}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Rencana Kontrol:</span>
                    <span className="font-medium">{c.plannedControlAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Fasilitas:</span>
                    <span>{c.facilityName}</span>
                  </div>
                  {c.estimatedRunoutDate && (
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="text-stone-500">Est. Obat Habis:</span>
                      <span className="font-semibold text-rose-800">{c.estimatedRunoutDate}</span>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs justify-center"
                    onClick={() => setSelectedCycleForVisit(c)}
                  >
                    <Stethoscope className="w-3.5 h-3.5 mr-1" />
                    <span>Catat Pemeriksaan</span>
                  </Button>
                  <button
                    onClick={() => setSelectedCycleForAdherence(c)}
                    title="Penilaian Kepatuhan"
                    className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                  >
                    <HeartHandshake className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendReminder(c)}
                    title="Kirim Pengingat WhatsApp"
                    className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ControlVisitModal
        isOpen={Boolean(selectedCycleForVisit)}
        onClose={() => setSelectedCycleForVisit(null)}
        cycle={selectedCycleForVisit}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Kunjungan kontrol tercatat.');
        }}
      />

      <AdherenceAssessmentModal
        isOpen={Boolean(selectedCycleForAdherence)}
        onClose={() => setSelectedCycleForAdherence(null)}
        cycle={selectedCycleForAdherence}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Penilaian kepatuhan tersimpan.');
        }}
      />
    </div>
  );
};
