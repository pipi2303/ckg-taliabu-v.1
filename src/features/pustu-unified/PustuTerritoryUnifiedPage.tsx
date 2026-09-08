import React, { useState } from 'react';
import { MapPin, Building2, Globe } from 'lucide-react';
import { WilayahPage } from '../organization/WilayahPage';
import { FacilityPage } from '../organization/FacilityPage';

interface PustuTerritoryUnifiedPageProps {
  initialTab?: 'wilayah' | 'faskes';
}

export const PustuTerritoryUnifiedPage: React.FC<PustuTerritoryUnifiedPageProps> = ({
  initialTab = 'wilayah',
}) => {
  const [activeTab, setActiveTab] = useState<'wilayah' | 'faskes'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Wilayah &amp; Jejaring Faskes
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Pustu Taliabu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Wilayah Binaan &amp; Jejaring Fasilitas
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Direktori pembagian kecamatan dan desa binaan Pustu, serta daftar fasilitas kesehatan jejaring rujukan (Puskesmas Induk & RSUD).">
                Direktori pembagian kecamatan dan desa binaan Pustu, serta daftar fasilitas kesehatan jejaring rujukan (Puskesmas Induk &amp; RSUD).
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('wilayah')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'wilayah'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Kecamatan & Desa Binaan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faskes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'faskes'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Fasilitas Kesehatan Jejaring
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tab Content */}
      <div className="transition-all duration-150">
        {activeTab === 'wilayah' && <WilayahPage />}
        {activeTab === 'faskes' && <FacilityPage />}
      </div>
    </div>
  );
};
