import React, { useState } from 'react';
import { AlertTriangle, Pill, Activity, MessageSquare, Sparkles, Brain } from 'lucide-react';
import { PredictiveDropoutPage } from '../ai-intelligence/pages/PredictiveDropoutPage';
import { AdherenceIntelligencePage } from '../ai-intelligence/pages/AdherenceIntelligencePage';
import { DigitalTwinPage } from '../ai-intelligence/pages/DigitalTwinPage';
import { AdaptiveNudgePage } from '../ai-intelligence/pages/AdaptiveNudgePage';
import { PreventionPriorityPage } from '../ai-intelligence/pages/PreventionPriorityPage';

interface AIClinicalPrescriptionUnifiedPageProps {
  initialTab?: 'dropout' | 'kepatuhan' | 'digital-twin' | 'nudge' | 'prioritas';
}

export const AIClinicalPrescriptionUnifiedPage: React.FC<AIClinicalPrescriptionUnifiedPageProps> = ({
  initialTab = 'dropout',
}) => {
  const [activeTab, setActiveTab] = useState<'dropout' | 'kepatuhan' | 'digital-twin' | 'nudge' | 'prioritas'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          {/* 1-Line Text Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs leading-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00201C] dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <Brain className="w-3.5 h-3.5" />
                AI Presisi Klinis &amp; Pencegahan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                Decision Support
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                AI Presisi Klinis &amp; Nudge Budaya
              </h1>
              <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden md:inline">—</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xl inline-block" title="Integrasi kecerdasan buatan untuk estimasi risiko klinis individual, simulasi profil kardiometabolik, optimalisasi kepatuhan terapi, dan komunikasi berbudaya lokal.">
                Integrasi kecerdasan buatan untuk estimasi risiko klinis individual, simulasi profil kardiometabolik, optimalisasi kepatuhan terapi, dan komunikasi berbudaya lokal.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F0F5F4] dark:bg-slate-800 p-1.5 rounded-xl border border-[#D8E5E2] dark:border-slate-700 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('dropout')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dropout'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Prediksi Drop-Out
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kepatuhan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kepatuhan'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-rose-400" />
              Kepatuhan Obat
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
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Digital Twin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nudge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'nudge'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Nudge Budaya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prioritas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prioritas'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Prioritas Intervensi
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'dropout' && <PredictiveDropoutPage />}
        {activeTab === 'kepatuhan' && <AdherenceIntelligencePage />}
        {activeTab === 'digital-twin' && <DigitalTwinPage />}
        {activeTab === 'nudge' && <AdaptiveNudgePage />}
        {activeTab === 'prioritas' && <PreventionPriorityPage />}
      </div>
    </div>
  );
};
