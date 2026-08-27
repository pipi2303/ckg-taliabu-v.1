import React, { useState, useEffect } from 'react';
import { Layers, Activity, ShieldCheck, ArrowRight, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { cohortService } from '../../services/cohortService';
import { ConditionCohortSummary, User } from '../../types';

interface ConditionCohortsPageProps {
  currentUser: User;
}

export const ConditionCohortsPage: React.FC<ConditionCohortsPageProps> = ({ currentUser }) => {
  const [cohorts, setCohorts] = useState<ConditionCohortSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCohorts = async () => {
    setIsLoading(true);
    try {
      const data = await cohortService.getConditionCohorts();
      setCohorts(data);
    } catch (err) {
      console.error('Failed to load cohorts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-900/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Kohort Klinis Diagnosa Terkonfirmasi</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black font-display">Kohort Kondisi Kronis & Evaluasi Agregat</h1>
          <DocBadge code="SCR-PKM-F06" size="sm" />
        </div>
        <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Segmentasi kohort berbasis diagnosis terkonfirmasi tenaga medis untuk melacak kemajuan siklus, kepatuhan, dan status hasil kontrol antar kelompok penyakit.
        </p>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-stone-500">Memuat data kohort...</div>
        ) : cohorts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500">Belum ada data kohort.</div>
        ) : (
          cohorts.map((cohort) => (
            <Card key={cohort.conditionId} className="p-6 border-stone-200 bg-white space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Kohort Penyakit
                  </span>
                  <h3 className="text-lg font-black text-stone-900 mt-1">{cohort.conditionName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400">Total Pasien</p>
                  <p className="text-2xl font-black text-black">{cohort.totalInTreatment}</p>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                  <p className="text-[10px] font-bold uppercase text-teal-800">Siklus Aktif</p>
                  <p className="text-lg font-black text-teal-950 mt-0.5">{cohort.activeMonitoringCount}</p>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <p className="text-[10px] font-bold uppercase text-sky-800">Jatuh Tempo Mgg Ini</p>
                  <p className="text-lg font-black text-sky-950 mt-0.5">{cohort.dueThisWeekCount}</p>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-bold uppercase text-rose-800">Risiko Putus</p>
                  <p className="text-lg font-black text-rose-950 mt-0.5">{cohort.atRiskDropoutCount}</p>
                </div>
              </div>

              {/* Outcome Status Section */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-700">
                  <span>Status Evaluasi Outcome (CR-OC)</span>
                  <span className="text-[10px] font-normal text-stone-500">Rerata Siklus: #{cohort.averageCycleNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <p className="text-[10px] text-emerald-800 font-semibold">Terkendali</p>
                    <p className="text-sm font-bold text-emerald-950">{cohort.controlledCount}</p>
                  </div>
                  <div className="p-2 bg-stone-100 border border-stone-200 rounded-lg text-center">
                    <p className="text-[10px] text-stone-700 font-semibold">Belum Terkendali</p>
                    <p className="text-sm font-bold text-stone-900">{cohort.notControlledCount}</p>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-[10px] text-amber-800 font-semibold">Belum Dapat Dinilai</p>
                    <p className="text-sm font-bold text-amber-950">{cohort.notYetAssessableCount}</p>
                  </div>
                </div>
              </div>

              {/* Cycle Distribution Bar */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Distribusi Nomor Siklus Berjalan
                </p>
                <div className="flex items-center gap-1">
                  {Object.entries(cohort.cyclesDistribution).map(([cycleNum, count]) => (
                    <div
                      key={cycleNum}
                      className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-md text-[10px] font-semibold text-stone-700"
                    >
                      Siklus #{cycleNum}: <span className="font-bold text-stone-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
