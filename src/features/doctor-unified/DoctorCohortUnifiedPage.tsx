import React, { useState } from 'react';
import { ClipboardList, Layers, Activity, Users } from 'lucide-react';
import { RegistryPage } from '../registry/pages/RegistryPage';
import { ConditionCohortsPage } from '../cohorts/ConditionCohortsPage';
import { StratificationRegistryView } from '../risk/StratificationRegistryView';

interface DoctorCohortUnifiedPageProps {
  initialTab?: 'registry' | 'kohort' | 'stratifikasi';
  currentUser?: any;
  onNavigate: (tab: string) => void;
}

export const DoctorCohortUnifiedPage: React.FC<DoctorCohortUnifiedPageProps> = ({
  initialTab = 'registry',
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'kohort' | 'stratifikasi'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" />
                Rekam Jejak Kohort &amp; Kontrol
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Longitudinal Care
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Registri Pasien &amp; Kohort PTM
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Basis data master warga binaan CKG, kelompok kohort penyakit kronis (Hipertensi & Diabetes Melitus), dan penentuan kategori stratifikasi risiko Kemenkes RI.">
                Basis data master warga binaan CKG, kelompok kohort penyakit kronis (Hipertensi &amp; Diabetes Melitus), dan penentuan kategori stratifikasi risiko Kemenkes RI.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('registry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registry'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Master Data Warga (Registry)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kohort')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kohort'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Kelompok Penyakit HT/DM
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stratifikasi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stratifikasi'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Kategori Risiko Kemenkes
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'registry' && <RegistryPage onNavigate={onNavigate} />}
        {activeTab === 'kohort' && <ConditionCohortsPage currentUser={currentUser} />}
        {activeTab === 'stratifikasi' && <StratificationRegistryView />}
      </div>
    </div>
  );
};
