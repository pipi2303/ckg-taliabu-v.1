import React, { useState } from 'react';
import { Sparkles, Calendar, ListTodo, Stethoscope, HeartPulse } from 'lucide-react';
import { DailyPriorityQueuePage } from '../care-task/pages/DailyPriorityQueuePage';
import { TodayControlsPage } from '../monitoring/TodayControlsPage';
import { CareTaskListPage } from '../care-task/pages/CareTaskListPage';
import { ClinicalFollowUpPage } from '../clinical/pages/ClinicalFollowUpPage';

interface DailyClinicalUnifiedPageProps {
  initialTab?: 'prioritas' | 'kontrol' | 'care-task' | 'poli';
  currentUser?: any;
}

export const DailyClinicalUnifiedPage: React.FC<DailyClinicalUnifiedPageProps> = ({
  initialTab = 'prioritas',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'prioritas' | 'kontrol' | 'care-task' | 'poli'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <HeartPulse className="w-3.5 h-3.5" />
                Supervisi Pasien &amp; Klinis
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Alur Pelayanan
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Kendali Harian &amp; Pelayanan Poli
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Kendali komando terpusat untuk kasus kritis kategori merah, jadwal kontrol rutin hari ini, tenggat waktu SLA tindakan, dan catatan pelayanan dokter poli.">
                Kendali komando terpusat untuk kasus kritis kategori merah, jadwal kontrol rutin hari ini, tenggat waktu SLA tindakan, dan catatan pelayanan dokter poli.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
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
              Prioritas Merah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kontrol')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kontrol'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Kontrol Hari Ini
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
            <button
              type="button"
              onClick={() => setActiveTab('poli')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'poli'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Pelayanan Poli
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'prioritas' && <DailyPriorityQueuePage />}
        {activeTab === 'kontrol' && <TodayControlsPage currentUser={currentUser} />}
        {activeTab === 'care-task' && <CareTaskListPage />}
        {activeTab === 'poli' && <ClinicalFollowUpPage />}
      </div>
    </div>
  );
};
