import React, { useState } from 'react';
import { Users, PhoneCall, MapPin, CheckCircle2 } from 'lucide-react';
import { FieldAssignmentPage } from '../assignment/pages/FieldAssignmentPage';
import { OutreachQueuePage } from '../outreach/pages/OutreachQueuePage';

interface PustuKaderCoordinationUnifiedPageProps {
  initialTab?: 'penugasan' | 'outreach';
  currentUser?: any;
}

export const PustuKaderCoordinationUnifiedPage: React.FC<PustuKaderCoordinationUnifiedPageProps> = ({
  initialTab = 'penugasan',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'penugasan' | 'outreach'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Kader &amp; Kunjungan Lapangan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                Pustu &amp; Posyandu
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Koordinasi Kader &amp; Kunjungan Lapangan
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Pendelegasian tugas kunjungan rumah ke kader Posyandu desa dan dokumentasi tindak lanjut penjangkauan (outreach) langsung ke warga.">
                Pendelegasian tugas kunjungan rumah ke kader Posyandu desa dan dokumentasi tindak lanjut penjangkauan (outreach) langsung ke warga.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('penugasan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'penugasan'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              Penugasan Kunjungan Kader
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outreach')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'outreach'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-300" />
              Catatan Menghubungi Warga (Outreach)
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tab Content */}
      <div className="transition-all duration-150">
        {activeTab === 'penugasan' && <FieldAssignmentPage />}
        {activeTab === 'outreach' && <OutreachQueuePage />}
      </div>
    </div>
  );
};
