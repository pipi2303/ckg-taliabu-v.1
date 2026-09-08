import React, { useState } from 'react';
import { HeartPulse, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { CareTaskListPage } from '../care-task/pages/CareTaskListPage';
import { DailyPriorityQueuePage } from '../care-task/pages/DailyPriorityQueuePage';

interface PustuDailyEncounterUnifiedPageProps {
  initialTab?: 'care-task' | 'prioritas';
  currentUser?: any;
}

export const PustuDailyEncounterUnifiedPage: React.FC<PustuDailyEncounterUnifiedPageProps> = ({
  initialTab = 'care-task',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'care-task' | 'prioritas'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                Pelayanan Harian Pustu
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Puskesmas Pembantu (Desa)
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Antrean &amp; Tugas Harian Pustu
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Pusat tindak lanjut harian petugas desa: jadwal batas waktu pelayanan (Care Task SLA) dan antrean prioritas warga berisiko tinggi.">
                Pusat tindak lanjut harian petugas desa: jadwal batas waktu pelayanan (Care Task SLA) dan antrean prioritas warga berisiko tinggi.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('care-task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'care-task'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Care Task & Batas Waktu Tindakan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prioritas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prioritas'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              Antrean Prioritas Warga Berisiko
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tab Content */}
      <div className="transition-all duration-150">
        {activeTab === 'care-task' && <CareTaskListPage />}
        {activeTab === 'prioritas' && <DailyPriorityQueuePage />}
      </div>
    </div>
  );
};
