import React, { useState } from 'react';
import { UserX, AlertTriangle, HeartHandshake, ShieldAlert } from 'lucide-react';
import { DropoutCandidatePage } from '../dropout/pages/DropoutCandidatePage';
import { DropoutMonitoringPage } from '../dropout/DropoutMonitoringPage';
import { AdherenceManagementPage } from '../adherence/AdherenceManagementPage';

interface DropoutInterventionUnifiedPageProps {
  initialTab?: 'kandidat' | 'risiko' | 'kendala';
  currentUser?: any;
}

export const DropoutInterventionUnifiedPage: React.FC<DropoutInterventionUnifiedPageProps> = ({
  initialTab = 'kandidat',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'kandidat' | 'risiko' | 'kendala'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
                Pencegahan Drop-Out
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">
                Intervensi Berkelanjutan
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                Intervensi &amp; Pencegahan Drop-out Terapi
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Pusat pemantauan deteksi dini pasien menunggak kontrol, analisis hambatan kepatuhan minum obat, dan eskalasi pencegahan putus berobat.">
                Pusat pemantauan deteksi dini pasien menunggak kontrol, analisis hambatan kepatuhan minum obat, dan eskalasi pencegahan putus berobat.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('kandidat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kandidat'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              Warga Belum Kontrol
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('risiko')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'risiko'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Monitoring Risiko Putus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kendala')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kendala'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
              Kepatuhan & Kendala Obat
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'kandidat' && <DropoutCandidatePage />}
        {activeTab === 'risiko' && <DropoutMonitoringPage currentUser={currentUser} />}
        {activeTab === 'kendala' && <AdherenceManagementPage currentUser={currentUser} />}
      </div>
    </div>
  );
};
