import React, { useState } from 'react';
import { MapPin, AlertTriangle, Compass } from 'lucide-react';
import { AreaAnalysisPage } from './AreaAnalysisPage';
import { FollowUpGapPage } from './FollowUpGapPage';

interface AreaDisparityUnifiedPageProps {
  initialTab?: 'wilayah' | 'disparitas';
}

export const AreaDisparityUnifiedPage: React.FC<AreaDisparityUnifiedPageProps> = ({
  initialTab = 'wilayah',
}) => {
  const [activeTab, setActiveTab] = useState<'wilayah' | 'disparitas'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 shrink-0">
                Evaluasi Wilayah &amp; Geografis
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Modul Terpadu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Analisis Wilayah &amp; Disparitas Akses
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Pemetaan spasial sebaran risiko kardiometabolik di 8 kecamatan & 71 desa, serta deteksi dini kesenjangan tindak lanjut rujukan maritim antar-wilayah.">
                Pemetaan spasial sebaran risiko kardiometabolik di 8 kecamatan &amp; 71 desa, serta deteksi dini kesenjangan tindak lanjut rujukan maritim antar-wilayah.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('wilayah')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'wilayah'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Peta Risiko & Sebaran Wilayah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('disparitas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'disparitas'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Kesenjangan & Disparitas Akses
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'wilayah' ? <AreaAnalysisPage /> : <FollowUpGapPage />}
      </div>
    </div>
  );
};
