import React, { useState } from 'react';
import { TrendingUp, Navigation, Ship, Sparkles } from 'lucide-react';
import { PopulationForecastPage } from '../ai-intelligence/pages/PopulationForecastPage';
import { RouteOptimizerPage } from '../ai-intelligence/pages/RouteOptimizerPage';

interface AILogisticsMaritimeUnifiedPageProps {
  initialTab?: 'proyeksi' | 'maritim';
}

export const AILogisticsMaritimeUnifiedPage: React.FC<AILogisticsMaritimeUnifiedPageProps> = ({
  initialTab = 'proyeksi',
}) => {
  const [activeTab, setActiveTab] = useState<'proyeksi' | 'maritim'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Ship className="w-3.5 h-3.5" />
                AI Perencanaan &amp; Logistik
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shrink-0">
                Operasional Maritim
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                AI Logistik &amp; Operasi Maritim Puskesmas
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Pemodelan prediktif kebutuhan persediaan obat PTM jangka menengah dan efisiensi rute puskesmas keliling perahu untuk menjangkau desa pesisir terisolir.">
                Pemodelan prediktif kebutuhan persediaan obat PTM jangka menengah dan efisiensi rute puskesmas keliling perahu untuk menjangkau desa pesisir terisolir.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('proyeksi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'proyeksi'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Proyeksi Beban & Obat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('maritim')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'maritim'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              Optimasi Rute Pusling Laut
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'proyeksi' ? <PopulationForecastPage /> : <RouteOptimizerPage />}
      </div>
    </div>
  );
};
