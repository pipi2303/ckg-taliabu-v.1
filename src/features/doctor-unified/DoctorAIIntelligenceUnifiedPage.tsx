import React, { useState } from 'react';
import { Stethoscope, Activity, Pill, MessageSquare, Brain } from 'lucide-react';
import { ClinicalCopilotPage } from '../ai-intelligence/pages/ClinicalCopilotPage';
import { DigitalTwinPage } from '../ai-intelligence/pages/DigitalTwinPage';
import { AdherenceIntelligencePage } from '../ai-intelligence/pages/AdherenceIntelligencePage';
import { AdaptiveNudgePage } from '../ai-intelligence/pages/AdaptiveNudgePage';

interface DoctorAIIntelligenceUnifiedPageProps {
  initialTab?: 'copilot' | 'digital-twin' | 'kepatuhan-obat' | 'nudge-budaya';
}

export const DoctorAIIntelligenceUnifiedPage: React.FC<DoctorAIIntelligenceUnifiedPageProps> = ({
  initialTab = 'copilot',
}) => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'digital-twin' | 'kepatuhan-obat' | 'nudge-budaya'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Brain className="w-3.5 h-3.5" />
                Asistensi Klinis Cerdas (Clinical AI)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                Decision Support FKTP
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-[#102521] dark:text-white shrink-0">
                Clinical Decision Copilot &amp; Digital Twin
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-[#60716D] dark:text-slate-400 truncate max-w-xl inline-block" title="Panduan terapi sesuai PPK Kemenkes RI, kalkulasi dosis & interaksi obat, profil longitudinal 4 kuadran Digital Twin, dan rekomendasi komunikasi budaya lokal Taliabu.">
                Panduan terapi sesuai PPK Kemenkes RI, kalkulasi dosis &amp; interaksi obat, profil longitudinal 4 kuadran Digital Twin, dan rekomendasi komunikasi budaya lokal Taliabu.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              Clinical Copilot PPK
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('digital-twin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'digital-twin'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Digital Twin Warga
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kepatuhan-obat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kepatuhan-obat'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-rose-400" />
              Efektivitas & Respon Obat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nudge-budaya')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'nudge-budaya'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              Nudge & Edukasi Budaya
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'copilot' && <ClinicalCopilotPage />}
        {activeTab === 'digital-twin' && <DigitalTwinPage />}
        {activeTab === 'kepatuhan-obat' && <AdherenceIntelligencePage />}
        {activeTab === 'nudge-budaya' && <AdaptiveNudgePage />}
      </div>
    </div>
  );
};
