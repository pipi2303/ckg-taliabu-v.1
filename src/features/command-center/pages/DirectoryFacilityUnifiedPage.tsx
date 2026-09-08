import React, { useState } from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { FacilityPage } from '../../organization/FacilityPage';
import { WilayahPage } from '../../organization/WilayahPage';
import { StratificationRegistryView } from '../../risk/StratificationRegistryView';

interface DirectoryFacilityUnifiedPageProps {
  initialTab?: 'faskes' | 'wilayah' | 'stratifikasi';
}

export const DirectoryFacilityUnifiedPage: React.FC<DirectoryFacilityUnifiedPageProps> = ({
  initialTab = 'faskes',
}) => {
  const [activeTab, setActiveTab] = useState<'faskes' | 'wilayah' | 'stratifikasi'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 shrink-0">
                Data Referensi &amp; Jejaring
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Modul Terpadu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Direktori Wilayah, Faskes &amp; Standar Risiko
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Informasi terpusat jejaring faskes rujukan RSUD, profil geografis 8 kecamatan & desa binaan, serta pedoman stratifikasi risiko kardiometabolik Kemenkes RI.">
                Informasi terpusat jejaring faskes rujukan RSUD, profil geografis 8 kecamatan &amp; desa binaan, serta pedoman stratifikasi risiko kardiometabolik Kemenkes RI.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('faskes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'faskes'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Jejaring Faskes & RSUD
            </button>
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
              Profil 8 Kecamatan & Desa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stratifikasi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stratifikasi'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Kategori Risiko Kemenkes
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'faskes' && <FacilityPage />}
        {activeTab === 'wilayah' && <WilayahPage />}
        {activeTab === 'stratifikasi' && <StratificationRegistryView />}
      </div>
    </div>
  );
};
