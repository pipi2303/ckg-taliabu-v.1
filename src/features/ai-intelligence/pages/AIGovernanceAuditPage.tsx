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
      <div className="bg-[#faf9f6] text-black p-6 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-teal-700" />
              AI SAFETY, MODEL REGISTRY & ETHICAL GOVERNANCE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Tata Kelola, Model Registry & Sakelar Keamanan (Kill-Switch)
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Pusat kendali etika AI Dinas Kesehatan Kabupaten Pulau Taliabu: Pengawasan siklus hidup model, Model Card resmi,
              kebijakan Human-in-the-Loop, dan sakelar penonaktifan darurat model tanpa downtime aplikasi.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs text-stone-600 font-medium">Mode Sistem Global:</span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-xs">
              <button
                onClick={() => handleChangeGlobalMode('OFF')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'OFF' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-500 hover:text-black'
                }`}
              >
                OFF
              </button>
              <button
                onClick={() => handleChangeGlobalMode('SHADOW')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'SHADOW' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-500 hover:text-black'
                }`}
              >
                SHADOW
              </button>
              <button
                onClick={() => handleChangeGlobalMode('GOVERNED_ACTIVE')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  globalMode === 'GOVERNED_ACTIVE' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-500 hover:text-black'
                }`}
              >
                GOVERNED ACTIVE
              </button>
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {successToast}
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-1">
          <div className="text-[11px] text-stone-600 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-700" /> Clinician Agreement Rate
          </div>
          <div className="text-2xl font-bold text-black">{metrics.clinicianAgreementRate}%</div>
          <div className="text-[10px] text-emerald-800 font-semibold">Kesesuaian dengan Telaah Dokter</div>
        </div>

        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-1">
          <div className="text-[11px] text-stone-600 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Total Model Terdaftar
          </div>
          <div className="text-2xl font-bold text-emerald-800">{models.length} Model</div>
          <div className="text-[10px] text-stone-500">5 Inti Governed Model</div>
        </div>

        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-1">
          <div className="text-[11px] text-stone-600 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-amber-700" /> Model Aktif / Shadow
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {models.filter((m) => m.lifecycleStatus === 'ACTIVE' || m.lifecycleStatus === 'SHADOW').length} Aktif
          </div>
          <div className="text-[10px] text-stone-500">Operasional Berizin</div>
        </div>

        <div className="p-4 rounded-xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-1">
          <div className="text-[11px] text-stone-600 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-700" /> Guardrail Level
          </div>
          <div className="text-base font-bold text-black">STRICT HUMAN-IN-LOOP</div>
          <div className="text-[10px] text-teal-800 font-semibold">Wajib Telaah Klinisi</div>
        </div>
      </div>

      {/* Model Registry Table */}
      <div className="bg-[#faf9f6] border border-stone-200/90 shadow-xs rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-700" />
              Model Registry & Lifecycle Status (Kabupaten Pulau Taliabu)
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Daftar model kecerdasan buatan terverifikasi yang tunduk pada protokol tata kelola data & etika kesehatan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-stone-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600 bg-stone-50 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Kode Model</th>
                <th className="py-2.5 px-3">Nama & Tujuan Model</th>
                <th className="py-2.5 px-3">Versi</th>
                <th className="py-2.5 px-3">Status Siklus Hidup</th>
                <th className="py-2.5 px-3">Jadwal Review</th>
                <th className="py-2.5 px-3 text-right">Aksi Tata Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {models.map((m) => {
                const isActive = m.lifecycleStatus === 'ACTIVE';
                const isShadow = m.lifecycleStatus === 'SHADOW';
                const isPaused = m.lifecycleStatus === 'PAUSED';

                return (
                  <tr key={m.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">{m.modelCode}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-black">{m.modelName}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{m.purpose}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">{m.version}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isShadow
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {m.lifecycleStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{m.reviewDueAt}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedModelForCard(m)}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition border border-stone-300"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                        Model Card
                      </button>
                      <button
                        onClick={() => setShowKillSwitchModal(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition border ${
                          isPaused
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
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
        <div className="bg-[#faf9f6] border border-stone-200/90 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="text-sm font-bold text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Generative Insight Copilot (Draf Non-Klinis)
            </h4>
            <button
              onClick={handleToggleCopilot}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                copilotEnabled
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {copilotEnabled ? 'AKTIF (DRAF)' : 'NONAKTIF (LOCKED)'}
            </button>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hanya membuat draf narasi manajemen dan ringkasan eksekutif berdasarkan metrik resmi agregat CKG.
            <strong> Dilarang keras</strong> memberikan instruksi diagnosis klinis, resep obat, atau mengubah dosis.
          </p>
        </div>

        <div className="bg-[#faf9f6] border border-stone-200/90 shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="text-sm font-bold text-black flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700" />
              Prinsip Penjelasan Dinkes (Non-Technical Summary)
            </h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Semua output AI pada sistem CKG Smart Care disajikan dalam bahasa Indonesia yang lugas, tidak mengandung istilah probabilitas membingungkan,
            dan secara transparan menyajikan 3 faktor penjelas utama serta arah kontribusinya.
          </p>
        </div>
      </div>

      {/* Model Card Modal */}
      {selectedModelForCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="font-mono text-xs text-teal-800 font-bold">{selectedModelForCard.modelCode}</span>
                <h3 className="text-base font-bold text-black">{selectedModelForCard.modelName}</h3>
              </div>
              <button
                onClick={() => setSelectedModelForCard(null)}
                className="text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="text-[11px] text-stone-700 font-bold uppercase">Tujuan Penggunaan yang Diizinkan (Intended Use):</div>
                <p className="text-stone-700 leading-relaxed">{selectedModelForCard.intendedUse}</p>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="text-[11px] text-rose-800 font-bold uppercase">Penggunaan yang DILARANG (Prohibited Uses):</div>
                <ul className="list-disc pl-4 text-rose-800 space-y-0.5">
                  {selectedModelForCard.prohibitedUses.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] text-stone-600 uppercase font-bold">Populasi Latih:</div>
                  <p className="text-stone-700 mt-1">{selectedModelForCard.trainingPopulationDescription}</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] text-stone-600 uppercase font-bold">Syarat Data Minimum:</div>
                  <ul className="list-disc pl-4 text-stone-700 mt-1">
                    {selectedModelForCard.minimumDataRequirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="text-[11px] text-amber-900 font-bold uppercase">Batasan yang Diketahui (Known Limitations):</div>
                <ul className="list-disc pl-4 text-amber-900 space-y-0.5">
                  {selectedModelForCard.knownLimitations.map((l, idx) => (
                    <li key={idx}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                onClick={() => setSelectedModelForCard(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kill-Switch Reason Modal */}
      {showKillSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-stone-200 pb-3">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Sakelar Keamanan Model ({showKillSwitchModal.modelCode})
            </div>

            <form onSubmit={handleConfirmKillSwitch} className="space-y-3 text-xs">
              <p className="text-stone-700">
                Anda akan mengubah status model <strong>{showKillSwitchModal.modelName}</strong>.
                Tindakan ini akan dicatat ke dalam Jejak Audit Dinas Kesehatan.
              </p>

              <div className="space-y-1">
                <label className="text-stone-800 font-semibold">Alasan Perubahan Status:</label>
                <textarea
                  required
                  rows={3}
                  value={killSwitchReason}
                  onChange={(e) => setKillSwitchReason(e.target.value)}
                  placeholder="Contoh: Terdeteksi disparitas tingkat false-positive di pesisir utara..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKillSwitchModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
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
