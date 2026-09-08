import React, { useState } from 'react';
import { Calendar, Activity, Clock, TrendingUp, HeartHandshake } from 'lucide-react';
import { TodayControlsPage } from '../monitoring/TodayControlsPage';
import { ActiveMonitoringPage } from '../monitoring/ActiveMonitoringPage';
import { AwaitingEvaluationPage } from '../monitoring/AwaitingEvaluationPage';
import { OutcomeTrendsPage } from '../cohorts/OutcomeTrendsPage';

interface DoctorMonitoringUnifiedPageProps {
  initialTab?: 'kontrol' | 'pemantauan' | 'evaluasi' | 'tren';
  currentUser?: any;
}

export const DoctorMonitoringUnifiedPage: React.FC<DoctorMonitoringUnifiedPageProps> = ({
  initialTab = 'kontrol',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'kontrol' | 'pemantauan' | 'evaluasi' | 'tren'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <HeartHandshake className="w-3.5 h-3.5" />
                Pemantauan Kontinuitas Perawatan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Siklus 30/90 Hari
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Siklus Pemantauan &amp; Evaluasi Terapi
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Jadwal kontrol rutin harian, siklus berkala pemantauan pasien berjalan, evaluasi status terkendali/rujukan, serta analisis tren perbaikan tensi dan gula darah.">
                Jadwal kontrol rutin harian, siklus berkala pemantauan pasien berjalan, evaluasi status terkendali/rujukan, serta analisis tren perbaikan tensi dan gula darah.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('kontrol')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kontrol'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Kontrol Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pemantauan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pemantauan'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Siklus Pemantauan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evaluasi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'evaluasi'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Evaluasi Terkendali
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tren')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tren'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Perkembangan Terapi
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'kontrol' && <TodayControlsPage currentUser={currentUser} />}
        {activeTab === 'pemantauan' && <ActiveMonitoringPage currentUser={currentUser} />}
        {activeTab === 'evaluasi' && <AwaitingEvaluationPage currentUser={currentUser} />}
        {activeTab === 'tren' && <OutcomeTrendsPage currentUser={currentUser} />}
      </div>
    </div>
  );
};
