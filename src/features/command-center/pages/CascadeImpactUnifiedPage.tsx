import React, { useState } from 'react';
import { Layers, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { CascadePage } from './CascadePage';
import { ImpactIndexPage } from './ImpactIndexPage';

interface CascadeImpactUnifiedPageProps {
  initialTab?: 'kaskade' | 'impact';
}

export const CascadeImpactUnifiedPage: React.FC<CascadeImpactUnifiedPageProps> = ({
  initialTab = 'kaskade',
}) => {
  const [activeTab, setActiveTab] = useState<'kaskade' | 'impact'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 shrink-0">
                Pusat Komando Eksekutif
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Modul Terpadu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Kaskade Layanan &amp; CKG Impact Index
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Evaluasi komprehensif alur penurunan pasien (skrining ke terkontrol) dan skor efektivitas klinis Level 1 s.d 3 di seluruh wilayah Kabupaten Pulau Taliabu.">
                Evaluasi komprehensif alur penurunan pasien (skrining ke terkontrol) dan skor efektivitas klinis Level 1 s.d 3 di seluruh wilayah Kabupaten Pulau Taliabu.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('kaskade')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kaskade'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Rel Kaskade & Drop-off
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'impact'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              CKG Impact Index (Level 1-3)
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'kaskade' ? <CascadePage /> : <ImpactIndexPage />}
      </div>
    </div>
  );
};
