import React, { useState } from 'react';
import {
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Eye,
  Check,
  Activity,
} from 'lucide-react';
import { modelGovernanceRepo } from '../../../repositories/modelGovernanceRepo';
import { predictiveDropoutService } from '../../../services/predictiveDropoutService';
import { ModelPrediction, PredictionLevel } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const PredictiveDropoutPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedPrediction, setSelectedPrediction] = useState<ModelPrediction | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<'AGREE' | 'DISAGREE' | 'UNCERTAIN'>('AGREE');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState<string | null>(null);

  const globalMode = modelGovernanceRepo.getAIIntelligenceMode();
  const modelDef = modelGovernanceRepo.getModelById('PA-01');
  const predictions = modelGovernanceRepo.getAllPredictions().filter((p) => p.predictionType === 'DROPOUT_RISK');

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      p.citizenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || p.predictionLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleOpenFeedback = (pred: ModelPrediction) => {
    setSelectedPrediction(pred);
    setFeedbackReason('');
    setFeedbackType('AGREE');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrediction || !user) return;

    predictiveDropoutService.submitStaffFeedback({
      predictionId: selectedPrediction.id,
      citizenId: selectedPrediction.citizenId,
      userId: user.id,
      userName: user.name,
      userRole: user.roleId,
      facilityName: user.facilityName || 'Puskesmas',
      feedback: feedbackType,
      reason: feedbackReason || 'Penilaian kesesuaian kondisi riil lapangan',
    });

    setShowFeedbackModal(false);
    setFeedbackSuccessToast(`Umpan balik klinis/lapangan untuk ${selectedPrediction.citizenId} berhasil dicatat.`);
    setTimeout(() => setFeedbackSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#00201C] text-white p-6 rounded-2xl border border-teal-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              PREDICTIVE INTELLIGENCE (PA-01)
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Prediksi Risiko Putus Perawatan & Kontinuitas Kontrol
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
              Model ensemble kontekstual wilayah kepulauan Pulau Taliabu yang mengidentifikasi probabilitas keterlambatan
              kontrol berikutnya untuk memprioritaskan dukungan kader dan faskes, tanpa mengurangi hak layanan klinis.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-300">Mode Sistem:</span>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  globalMode === 'GOVERNED_ACTIVE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-950 text-amber-300 border-amber-500/50'
                }`}
              >
                {globalMode === 'GOVERNED_ACTIVE' ? 'GOVERNED ACTIVE' : 'SHADOW MODE'}
              </span>
            </div>
            <div className="text-[11px] text-stone-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              Model Code: <strong className="text-white">PA-01 ({modelDef?.version || 'v2.4'})</strong>
            </div>
          </div>
        </div>
      </div>

      {feedbackSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {feedbackSuccessToast}
        </div>
      )}

      {/* Safety & Anti-Slop Principle Callout */}
      <div className="p-4 bg-[#faf9f6] border border-stone-200/90 rounded-xl text-xs space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-teal-900">
          <Info className="w-4 h-4 text-teal-700" />
          Prinsip Keselamatan & Etika AI (Governance Guardrail PA-01)
        </div>
        <p className="text-stone-600 leading-relaxed">
          1. <strong>Tanpa Degradasi Layanan:</strong> Prediksi risiko rendah (<span className="text-emerald-800 font-bold">LOW</span>) memberikan kontribusi prioritas +0 (tidak pernah mengurangi kontak wajib penjangkauan atau menutup CareTask).<br />
          2. <strong>Koreksi Faktor Manusia:</strong> Dokter atau Tenaga Faskes dapat menandai ketidaksesuaian prediksi tanpa mengubah rekam medis riil warga.<br />
          3. <strong>Bukan Diagnosis:</strong> Skor ini semata-mata estimasi kesinambungan operasional faskes terhadap jadwal kontrol.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#faf9f6] p-3.5 rounded-xl border border-stone-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Cari ID Warga / No Prediksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-black placeholder-stone-400 focus:outline-none focus:border-teal-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-600 font-medium">Tingkat Risiko:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-teal-700 cursor-pointer"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="HIGH">Risiko Tinggi (HIGH)</option>
            <option value="MEDIUM">Risiko Sedang (MEDIUM)</option>
            <option value="LOW">Risiko Rendah (LOW)</option>
            <option value="NOT_PREDICTABLE">Data Belum Cukup (NOT_PREDICTABLE)</option>
          </select>
        </div>
      </div>

      {/* Predictions Worklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPredictions.map((pred) => {
          const isHigh = pred.predictionLevel === 'HIGH';
          const isMedium = pred.predictionLevel === 'MEDIUM';
          const isLow = pred.predictionLevel === 'LOW';
          const isUnpredictable = pred.predictionLevel === 'NOT_PREDICTABLE';

          return (
            <div
              key={pred.id}
              className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-5 space-y-4 shadow-xs hover:border-stone-300 transition"
            >
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-black">{pred.citizenId}</span>
                    <span className="text-[10px] text-stone-500 font-medium">({pred.id})</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3 h-3 text-stone-400" />
                    Model: {pred.modelVersion} • Snapshot: {pred.featureSnapshotId}
                  </div>
                </div>

                <div>
                  {isHigh && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                      HIGH DROPOUT RISK
                    </span>
                  )}
                  {isMedium && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-700" />
                      MEDIUM RISK
                    </span>
                  )}
                  {isLow && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      LOW RISK
                    </span>
                  )}
                  {isUnpredictable && (
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      NOT PREDICTABLE
                    </span>
                  )}
                </div>
              </div>

              {/* Explainable Factors (Top 3) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                  Faktor Penjelas Utama (Explainability Engine)
                </div>
                <div className="space-y-1.5">
                  {pred.topFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-stone-800 font-bold">
                        <span>{factor.displayLabel}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            factor.contributionDirection === 'INCREASES'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : factor.contributionDirection === 'DECREASES'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {factor.contributionDirection === 'INCREASES'
                            ? '▲ Meningkatkan Risiko'
                            : factor.contributionDirection === 'DECREASES'
                            ? '▼ Menurunkan Risiko'
                            : '• Netral'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{factor.explanationText}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncertainty Interval & Model Mode */}
              {pred.uncertainty && (
                <div className="flex items-center justify-between text-[11px] text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
                  <span>Rentang Keyakinan: <strong className="text-black font-bold">{pred.uncertainty.confidenceInterval}</strong></span>
                  <span>Entropy Skor: <strong className="text-black font-bold">{pred.uncertainty.entropyScore}</strong></span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  onClick={() => handleOpenFeedback(pred)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-stone-300 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                  Beri Umpan Balik Lapangan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Feedback Modal */}
      {showFeedbackModal && selectedPrediction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf9f6] border border-stone-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-black">
                <MessageSquare className="w-4 h-4 text-teal-700" />
                Umpan Balik Tenaga Faskes (PA-09 Loop)
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-stone-400 hover:text-black text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1 shadow-2xs">
                <div className="text-stone-600 font-medium">ID Warga: <strong className="text-black font-mono">{selectedPrediction.citizenId}</strong></div>
                <div className="text-stone-600 font-medium">Prediksi Model Saat Ini: <strong className="text-teal-800 font-bold">{selectedPrediction.predictionLevel}</strong></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-800 font-bold">Penilaian Klinisi / Petugas:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('AGREE')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition ${
                      feedbackType === 'AGREE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Sesuai Lapangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType('DISAGREE')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition ${
                      feedbackType === 'DISAGREE'
                        ? 'bg-rose-50 border-rose-500 text-rose-900'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Tidak Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType('UNCERTAIN')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition ${
                      feedbackType === 'UNCERTAIN'
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Perlu Verifikasi
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-800 font-bold">Alasan Kontekstual Lapangan (misal: kendala perahu, pindah ke kebun, stok obat kosong):</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder="Jelaskan kondisi riil warga yang diamati kader/faskes..."
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-black placeholder-stone-400 focus:outline-none focus:border-teal-700 text-xs font-medium"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 shadow-2xs">
                <strong>Catatan Tata Kelola:</strong> Umpan balik ini masuk ke antrean audit evaluasi drift model dan tidak mengubah status rekam medis warga secara sepihak.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer font-bold border border-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg cursor-pointer font-bold shadow-xs"
                >
                  Kirim Umpan Balik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
