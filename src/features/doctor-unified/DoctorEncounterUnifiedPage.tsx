import React, { useState } from 'react';
import { Stethoscope, Sparkles, ListTodo, HeartPulse } from 'lucide-react';
import { ClinicalFollowUpPage } from '../clinical/pages/ClinicalFollowUpPage';
import { DailyPriorityQueuePage } from '../care-task/pages/DailyPriorityQueuePage';
import { CareTaskListPage } from '../care-task/pages/CareTaskListPage';

interface DoctorEncounterUnifiedPageProps {
  initialTab?: 'poli' | 'prioritas' | 'care-task';
  currentUser?: any;
}

export const DoctorEncounterUnifiedPage: React.FC<DoctorEncounterUnifiedPageProps> = ({
  initialTab = 'poli',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'poli' | 'prioritas' | 'care-task'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <HeartPulse className="w-3.5 h-3.5" />
                Pelayanan Poli Harian (Point-of-Care)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Puskesmas FKTP
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Antrean &amp; Pelayanan Poli Hari Ini
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Pusat layanan klinis terpadu dokter di meja poli: pencatatan pemeriksaan rekam medis & resep, antrean prioritas kasus merah, dan tenggat waktu tindakan SLA.">
                Pusat layanan klinis terpadu dokter di meja poli: pencatatan pemeriksaan rekam medis &amp; resep, antrean prioritas kasus merah, dan tenggat waktu tindakan SLA.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('poli')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'poli'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              Pemeriksaan & Resep Poli
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
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Antrean Prioritas Merah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('care-task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'care-task'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Care Task & SLA
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'poli' && <ClinicalFollowUpPage />}
        {activeTab === 'prioritas' && <DailyPriorityQueuePage />}
        {activeTab === 'care-task' && <CareTaskListPage />}
      </div>
    </div>
  );
};
