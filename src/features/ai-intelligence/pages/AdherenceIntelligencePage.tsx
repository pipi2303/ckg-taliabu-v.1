import React, { useState } from 'react';
import {
  HeartHandshake,
  Pill,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { adherenceIntelligenceService } from '../../../services/adherenceIntelligenceService';
import { AdherenceIntelligenceResult } from '../../../types';

export const AdherenceIntelligencePage: React.FC = () => {
  const allInsights = adherenceIntelligenceService.getAllAdherenceInsights();
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(allInsights[0]?.citizenId || 'CIT-8208-0012');

  const activeInsight = adherenceIntelligenceService.getAdherenceIntelligence(selectedCitizenId) || allInsights[0];
  const effectivenessPatterns = adherenceIntelligenceService.getInterventionEffectivenessPatterns();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-teal-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              <Pill className="w-4 h-4" />
              MEDICATION ADHERENCE INTELLIGENCE (PRD-5 / N-A)
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sintesis Multidimensi Kepatuhan Minum Obat & Efektivitas Intervensi
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Konsolidasi data bukti multi-sumber (rekam farmasi, asesmen perawat faskes, laporan kader posyandu, respon mandiri warga)
              untuk memetakan kendala kepatuhan serta memisahkan faktor struktural sistemik dari perilaku pasien.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Pilih Warga:</span>
            <select
              value={selectedCitizenId}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="px-3 py-2 bg-slate-900/90 border border-teal-500/60 rounded-xl text-xs font-bold text-teal-300 focus:outline-none"
            >
              {allInsights.map((ins) => (
                <option key={ins.citizenId} value={ins.citizenId}>
                  {ins.citizenName} ({ins.citizenId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Safety Guardrail Notice: AI Never Prescribes or Modifies Dosages */}
      <div className="p-4 bg-slate-900/90 border border-rose-900/60 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-rose-300">
          <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
          Batasan Mutlak Klinis AI (Zero Auto-Prescription)
        </div>
        <p className="text-slate-400 leading-relaxed">
          Sistem AI <strong>DILARANG KERAS</strong> mengubah jenis obat, menaikkan/menurunkan dosis, atau menghentikan terapi secara mandiri.
          Ketika kendala teridentifikasi sebagai <code>MEDICATION_UNAVAILABLE</code> (stok obat kosong di faskes), sistem mencatat hal tersebut
          sebagai tanggung jawab logistik faskes/Dinkes, bukan kelalaian pasien.
        </p>
      </div>

      {/* Main Grid: Multi-source Evidence & Cause Taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Citizen Adherence Synthesis */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{activeInsight.citizenName}</h2>
                <span className="font-mono text-xs text-slate-400">({activeInsight.citizenId})</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Siklus Pemantauan: {activeInsight.cycleId}</div>
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                  activeInsight.level === 'REGULAR'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : activeInsight.level === 'PARTIAL'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-rose-950 text-rose-300 border-rose-700'
                }`}
              >
                {activeInsight.level === 'REGULAR' ? 'PATUH RUTIN' : activeInsight.level === 'PARTIAL' ? 'PATUH PARSIAL' : 'TIDAK TERATUR'}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Kekuatan Bukti: <strong>{activeInsight.evidenceStrength}</strong></div>
            </div>
          </div>

          {/* Multi-Source Evidence List */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider">Bukti Multi-Sumber (Multi-Source Evidence):</h3>
            <div className="space-y-2">
              {activeInsight.evidenceSources.map((src, idx) => (
                <div key={idx} className="p-3 bg-slate-800/70 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-slate-200 font-semibold">
                    <span className="text-teal-300 font-mono text-[11px]">[{src.sourceType}]</span>
                    <span className="text-[10px] text-slate-400">{src.reportedAt.split('T')[0]}</span>
                  </div>
                  <div className="text-white font-medium">{src.status}</div>
                  {src.notes && <p className="text-[11px] text-slate-400">{src.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Root Causes & Systemic Factors */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider">Taksonomi Kendala Kepatuhan:</h3>
            <div className="flex flex-wrap gap-2">
              {activeInsight.dominantCauses.map((cause, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200"
                >
                  • {cause.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            {activeInsight.systemFactorsIdentified.length > 0 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-200 space-y-1 mt-2">
                <div className="font-bold text-[11px] uppercase">Faktor Sistemik Teridentifikasi (Tanggung Jawab Faskes):</div>
                <div className="text-xs">{activeInsight.systemFactorsIdentified.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Population Intervention Effectiveness Patterns */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Pola Efektivitas Intervensi (Sebelum vs Sesudah)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Perbandingan tren retensi pengobatan berdasarkan jenis intervensi yang diterapkan (Bahasa Deskriptif Non-Kausal).
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {effectivenessPatterns.map((pat, idx) => (
              <div key={idx} className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{pat.interventionType}</span>
                  <span className="text-[10px] text-slate-400 font-mono">n = {pat.sampleSize} kasus</span>
                </div>
                <div className="text-[11px] text-teal-300 font-medium">Kategori Kendala: {pat.causeCategory}</div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-slate-800 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Sebelum Intervensi:</div>
                    <div className="text-base font-bold text-slate-300">{pat.retentionBefore}%</div>
                  </div>
                  <div className="p-2 bg-emerald-950/60 border border-emerald-700/60 rounded-lg text-center">
                    <div className="text-[10px] text-emerald-300 uppercase">Sesudah Intervensi:</div>
                    <div className="text-base font-bold text-emerald-400">{pat.retentionAfter}%</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{pat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
