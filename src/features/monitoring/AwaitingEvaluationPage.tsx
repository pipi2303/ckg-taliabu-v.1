import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Award, Stethoscope, CheckCircle2, FileQuestion, Layers } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { monitoringCycleRepo } from '../../repositories/monitoringCycleRepo';
import { outcomeEvaluationRepo } from '../../repositories/outcomeEvaluationRepo';
import { adherenceAssessmentRepo } from '../../repositories/adherenceAssessmentRepo';
import { ManualDeterminationModal } from './modals/ManualDeterminationModal';
import { ControlVisitModal } from './modals/ControlVisitModal';
import { MonitoringCycle, OutcomeEvaluation, AdherenceAssessment, User } from '../../types';

interface AwaitingEvaluationPageProps {
  currentUser: User;
}

type TabType = 'NO_MEASUREMENT' | 'EQUIPMENT_CONSTRAINED' | 'BLOCKED_OI_08' | 'AWAITING_DOCTOR' | 'COMPLETED';

export const AwaitingEvaluationPage: React.FC<AwaitingEvaluationPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('BLOCKED_OI_08');
  const [cycles, setCycles] = useState<MonitoringCycle[]>([]);
  const [evaluations, setEvaluations] = useState<OutcomeEvaluation[]>([]);
  const [adherences, setAdherences] = useState<AdherenceAssessment[]>([]);
  const [selectedCycleForManual, setSelectedCycleForManual] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForVisit, setSelectedCycleForVisit] = useState<MonitoringCycle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allCycles, allEvals, allAdhs] = await Promise.all([
        monitoringCycleRepo.getAll(),
        outcomeEvaluationRepo.getAll(),
        adherenceAssessmentRepo.getAll(),
      ]);
      setCycles(allCycles);
      setEvaluations(allEvals);
      setAdherences(allAdhs);
    } catch (err) {
      console.error('Failed to load awaiting evaluation data', err);
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

  // Groupings by tab
  const noMeasurementCycles = cycles.filter(
    (c) => !c.actualControlAt && c.cycleStatus !== 'AWAITING_MEASUREMENT' && c.cycleStatus !== 'COMPLETED'
  );

  const equipmentConstrainedCycles = cycles.filter(
    (c) => c.cycleStatus === 'AWAITING_MEASUREMENT'
  );

  const blockedOi08Cycles = cycles.filter((c) => {
    const ev = evaluations.find((e) => e.cycleId === c.id && !e.supersededById);
    return !ev?.isManualDetermination && ev?.controlStatus === 'NOT_YET_ASSESSABLE';
  });

  const awaitingDoctorCycles = cycles.filter((c) => c.cycleStatus === 'AWAITING_EVALUATION');

  const completedCycles = cycles.filter((c) => {
    const ev = evaluations.find((e) => e.cycleId === c.id && !e.supersededById);
    return ev?.isManualDetermination || c.cycleStatus === 'COMPLETED';
  });

  const getActiveTabList = () => {
    switch (activeTab) {
      case 'NO_MEASUREMENT':
        return noMeasurementCycles;
      case 'EQUIPMENT_CONSTRAINED':
        return equipmentConstrainedCycles;
      case 'BLOCKED_OI_08':
        return blockedOi08Cycles;
      case 'AWAITING_DOCTOR':
        return awaitingDoctorCycles;
      case 'COMPLETED':
        return completedCycles;
    }
  };

  const currentList = getActiveTabList();

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00201C] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 shadow-xl border border-teal-900/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Alur Evaluasi & Validasi Klinis</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black font-display">Status & Antrean Evaluasi Hasil Kontrol</h1>
          <DocBadge code="SCR-PKM-F04" size="sm" />
        </div>
        <p className="text-stone-300 text-xs mt-1 max-w-2xl">
          Menampilkan segmentasi siklus pemantauan berdasarkan ketersediaan parameter pengukuran, kunci tata kelola otomatis (OI-08), dan kebutuhan telaah manual dokter.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('BLOCKED_OI_08')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'BLOCKED_OI_08'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>Kunci Tata Kelola OI-08</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {blockedOi08Cycles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('AWAITING_DOCTOR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'AWAITING_DOCTOR'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Award className="w-4 h-4 text-teal-300" />
          <span>Menunggu Telaah Dokter</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {awaitingDoctorCycles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('EQUIPMENT_CONSTRAINED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'EQUIPMENT_CONSTRAINED'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Kendala Alat / Reagen Lab</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {equipmentConstrainedCycles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NO_MEASUREMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'NO_MEASUREMENT'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <FileQuestion className="w-4 h-4 text-stone-400" />
          <span>Belum Ada Pengukuran</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {noMeasurementCycles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'COMPLETED'
              ? 'bg-[#00201C] text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Evaluasi Selesai / Terverifikasi</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {completedCycles.length}
          </span>
        </button>
      </div>

      {/* Tab Context Banner */}
      {activeTab === 'BLOCKED_OI_08' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Penjelasan Governance Lock OI-08:</p>
            <p className="mt-0.5 leading-relaxed">
              Daftar kasus ini memiliki pengukuran klinis namun sistem tidak mengklasifikasikan status terkendali secara otomatis karena kriteria numerik CR-OC belum disahkan. Dokter penanggung jawab dapat menelaah dan menetapkan status secara manual melalui tombol di bawah.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content Table */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3.5 px-4">Warga</th>
                <th className="py-3.5 px-3">Kondisi & Siklus</th>
                <th className="py-3.5 px-3">Tanggal Kontrol</th>
                <th className="py-3.5 px-3">Hasil Evaluasi / Catatan</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">Memuat data evaluasi...</td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500">
                    Tidak ada kasus dalam kategori ini.
                  </td>
                </tr>
              ) : (
                currentList.map((c) => {
                  const ev = evaluations.find((e) => e.cycleId === c.id && !e.supersededById);

                  return (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{c.citizenName}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          NIK: {c.citizenNik ? `${c.citizenNik.substring(0, 4)}••••••••` : '••••••••••••'}
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">{c.villageName} • {c.facilityName}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-800">{c.condition}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200 mt-1 inline-block">
                          Siklus #{c.cycleNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-800">Rencana: {c.plannedControlAt}</div>
                        {c.actualControlAt && (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Hadir: {c.actualControlAt}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {ev ? (
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                                ev.controlStatus === 'CONTROLLED'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : ev.controlStatus === 'NOT_CONTROLLED'
                                  ? 'bg-stone-200 text-stone-900 border border-stone-300'
                                  : 'bg-amber-100 text-amber-950 border border-amber-300'
                              }`}
                            >
                              {ev.controlStatus === 'CONTROLLED'
                                ? 'Terkendali'
                                : ev.controlStatus === 'NOT_CONTROLLED'
                                ? 'Belum Terkendali'
                                : 'Belum Dapat Dinilai (OI-08)'}
                            </span>
                            {ev.isManualDetermination ? (
                              <p className="text-[10px] text-teal-800 font-medium mt-1">
                                Oleh: {ev.determinedManuallyBy}
                              </p>
                            ) : (
                              <p className="text-[10px] text-stone-500 mt-1">{ev.governanceNotice}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-500 italic">{c.notes || 'Belum ada evaluasi'}</p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedCycleForVisit(c)}
                          >
                            <Stethoscope className="w-3.5 h-3.5 mr-1" />
                            <span>Pemeriksaan</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedCycleForManual(c)}
                          >
                            <Award className="w-3.5 h-3.5 mr-1" />
                            <span>Penetapan Dokter</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ManualDeterminationModal
        isOpen={Boolean(selectedCycleForManual)}
        onClose={() => setSelectedCycleForManual(null)}
        cycle={selectedCycleForManual}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Penetapan manual dokter berhasil disimpan.');
        }}
      />

      <ControlVisitModal
        isOpen={Boolean(selectedCycleForVisit)}
        onClose={() => setSelectedCycleForVisit(null)}
        cycle={selectedCycleForVisit}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Pemeriksaan kontrol berhasil disimpan.');
        }}
      />
    </div>
  );
};
