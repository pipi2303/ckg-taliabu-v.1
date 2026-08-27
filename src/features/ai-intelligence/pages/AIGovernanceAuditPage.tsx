import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  FileCheck,
  Lock,
  Sparkles,
  Power,
  Info,
  BookOpen,
  History,
  AlertOctagon,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { aiGovernanceService } from '../../../services/aiGovernanceService';
import { modelGovernanceRepo } from '../../../repositories/modelGovernanceRepo';
import { generativeInsightCopilotService } from '../../../services/generativeInsightCopilotService';
import { AIModelDefinition, AIGovernanceConfig, AIIntelligenceMode } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const AIGovernanceAuditPage: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIGovernanceConfig | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [models, setModels] = useState<AIModelDefinition[]>(modelGovernanceRepo.getAllModels());
  const [globalMode, setGlobalMode] = useState<AIIntelligenceMode>(modelGovernanceRepo.getAIIntelligenceMode());
  const [copilotEnabled, setCopilotEnabled] = useState<boolean>(generativeInsightCopilotService.isEnabled());
  const [selectedModelForCard, setSelectedModelForCard] = useState<AIModelDefinition | null>(null);
  const [showKillSwitchModal, setShowKillSwitchModal] = useState<AIModelDefinition | null>(null);
  const [killSwitchReason, setKillSwitchReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cfg = await aiGovernanceService.getConfig();
      const mtr = await aiGovernanceService.getSafetyMetrics();
      setConfig(cfg);
      setMetrics(mtr);
      setModels(modelGovernanceRepo.getAllModels());
      setGlobalMode(modelGovernanceRepo.getAIIntelligenceMode());
      setCopilotEnabled(generativeInsightCopilotService.isEnabled());
    } catch (err) {
      console.error('Failed to load governance config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangeGlobalMode = (mode: AIIntelligenceMode) => {
    modelGovernanceRepo.setAIIntelligenceMode(mode);
    setGlobalMode(mode);
    setSuccessToast(`Mode Kecerdasan AI Sistem diubah ke: ${mode}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleCopilot = () => {
    const next = !copilotEnabled;
    generativeInsightCopilotService.setEnabled(next);
    setCopilotEnabled(next);
    setSuccessToast(`Generative Insight Copilot: ${next ? 'DIAKTIFKAN (Draf Non-Klinis)' : 'DINONAKTIFKAN'}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmKillSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showKillSwitchModal || !user) return;

    const newStatus = showKillSwitchModal.lifecycleStatus === 'ACTIVE' || showKillSwitchModal.lifecycleStatus === 'SHADOW'
      ? 'PAUSED'
      : 'ACTIVE';

    modelGovernanceRepo.updateModelStatus(
      showKillSwitchModal.id,
      newStatus,
      { userId: user.id, userName: user.name },
      killSwitchReason || 'Tindakan mitigasi / penyesuaian tata kelola AI'
    );

    setModels(modelGovernanceRepo.getAllModels());
    setShowKillSwitchModal(null);
    setKillSwitchReason('');
    setSuccessToast(`Status model ${showKillSwitchModal.modelCode} berhasil diubah menjadi: ${newStatus}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  if (isLoading || !config || !metrics) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Tata Kelola & Model Registry AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-teal-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              AI SAFETY, MODEL REGISTRY & ETHICAL GOVERNANCE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Tata Kelola, Model Registry & Sakelar Keamanan (Kill-Switch)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pusat kendali etika AI Dinas Kesehatan Kabupaten Pulau Taliabu: Pengawasan siklus hidup model, Model Card resmi,
              kebijakan Human-in-the-Loop, dan sakelar penonaktifan darurat model tanpa downtime aplikasi.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs text-slate-300">Mode Sistem Global:</span>
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => handleChangeGlobalMode('OFF')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'OFF' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                OFF
              </button>
              <button
                onClick={() => handleChangeGlobalMode('SHADOW')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'SHADOW' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                SHADOW
              </button>
              <button
                onClick={() => handleChangeGlobalMode('GOVERNED_ACTIVE')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'GOVERNED_ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                GOVERNED ACTIVE
              </button>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/60 rounded-xl text-emerald-100 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {successToast}
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" /> Clinician Agreement Rate
          </div>
          <div className="text-2xl font-bold text-white">{metrics.clinicianAgreementRate}%</div>
          <div className="text-[10px] text-emerald-400 font-medium">Kesesuaian dengan Telaah Dokter</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Total Model Terdaftar
          </div>
          <div className="text-2xl font-bold text-emerald-400">{models.length} Model</div>
          <div className="text-[10px] text-slate-400">5 Inti Governed Model</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Model Aktif / Shadow
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {models.filter((m) => m.lifecycleStatus === 'ACTIVE' || m.lifecycleStatus === 'SHADOW').length} Aktif
          </div>
          <div className="text-[10px] text-slate-400">Operasional Berizin</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-400" /> Guardrail Level
          </div>
          <div className="text-base font-bold text-white">STRICT HUMAN-IN-LOOP</div>
          <div className="text-[10px] text-teal-300">Wajib Telaah Klinisi</div>
        </div>
      </div>

      {/* Model Registry Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Model Registry & Lifecycle Status (Kabupaten Pulau Taliabu)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar model kecerdasan buatan terverifikasi yang tunduk pada protokol tata kelola data & etika kesehatan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Kode Model</th>
                <th className="py-2.5 px-3">Nama & Tujuan Model</th>
                <th className="py-2.5 px-3">Versi</th>
                <th className="py-2.5 px-3">Status Siklus Hidup</th>
                <th className="py-2.5 px-3">Jadwal Review</th>
                <th className="py-2.5 px-3 text-right">Aksi Tata Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {models.map((m) => {
                const isActive = m.lifecycleStatus === 'ACTIVE';
                const isShadow = m.lifecycleStatus === 'SHADOW';
                const isPaused = m.lifecycleStatus === 'PAUSED';

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-teal-400">{m.modelCode}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{m.modelName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.purpose}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{m.version}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isShadow
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {m.lifecycleStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{m.reviewDueAt}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedModelForCard(m)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition border border-slate-700"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                        Model Card
                      </button>
                      <button
                        onClick={() => setShowKillSwitchModal(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition border ${
                          isPaused
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-700'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {isPaused ? 'Aktifkan' : 'Kill-Switch'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generative Copilot & Guardrail Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Generative Insight Copilot (Draf Non-Klinis)
            </h4>
            <button
              onClick={handleToggleCopilot}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                copilotEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {copilotEnabled ? 'AKTIF (DRAF)' : 'NONAKTIF (LOCKED)'}
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hanya membuat draf narasi manajemen dan ringkasan eksekutif berdasarkan metrik resmi agregat CKG.
            <strong> Dilarang keras</strong> memberikan instruksi diagnosis klinis, resep obat, atau mengubah dosis.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              Prinsip Penjelasan Dinkes (Non-Technical Summary)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Semua output AI pada sistem CKG Smart Care disajikan dalam bahasa Indonesia yang lugas, tidak mengandung istilah probabilitas membingungkan,
            dan secara transparan menyajikan 3 faktor penjelas utama serta arah kontribusinya.
          </p>
        </div>
      </div>

      {/* Model Card Modal */}
      {selectedModelForCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-teal-400">{selectedModelForCard.modelCode}</span>
                <h3 className="text-base font-bold text-white">{selectedModelForCard.modelName}</h3>
              </div>
              <button
                onClick={() => setSelectedModelForCard(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Tujuan Penggunaan yang Diizinkan (Intended Use):</div>
                <p className="text-slate-200 leading-relaxed">{selectedModelForCard.intendedUse}</p>
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl space-y-1">
                <div className="text-[11px] text-rose-300 font-semibold uppercase">Penggunaan yang DILARANG (Prohibited Uses):</div>
                <ul className="list-disc pl-4 text-rose-200 space-y-0.5">
                  {selectedModelForCard.prohibitedUses.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Populasi Latih:</div>
                  <p className="text-slate-300 mt-1">{selectedModelForCard.trainingPopulationDescription}</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Syarat Data Minimum:</div>
                  <ul className="list-disc pl-4 text-slate-300 mt-1">
                    {selectedModelForCard.minimumDataRequirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1">
                <div className="text-[11px] text-amber-300 font-semibold uppercase">Batasan yang Diketahui (Known Limitations):</div>
                <ul className="list-disc pl-4 text-amber-200 space-y-0.5">
                  {selectedModelForCard.knownLimitations.map((l, idx) => (
                    <li key={idx}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedModelForCard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kill-Switch Reason Modal */}
      {showKillSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Sakelar Keamanan Model ({showKillSwitchModal.modelCode})
            </div>

            <form onSubmit={handleConfirmKillSwitch} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Anda akan mengubah status model <strong>{showKillSwitchModal.modelName}</strong>.
                Tindakan ini akan dicatat ke dalam Jejak Audit Dinas Kesehatan.
              </p>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Alasan Perubahan Status:</label>
                <textarea
                  required
                  rows={3}
                  value={killSwitchReason}
                  onChange={(e) => setKillSwitchReason(e.target.value)}
                  placeholder="Contoh: Terdeteksi disparitas tingkat false-positive di pesisir utara..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKillSwitchModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Konfirmasi Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
