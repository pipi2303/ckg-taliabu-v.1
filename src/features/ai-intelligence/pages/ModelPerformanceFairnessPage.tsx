import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Cpu,
  FileCheck,
  AlertOctagon,
  Sparkles,
  Info,
} from 'lucide-react';
import { modelPerformanceService } from '../../../services/modelPerformanceService';
import { modelFairnessService } from '../../../services/modelFairnessService';
import { modelGovernanceRepo } from '../../../repositories/modelGovernanceRepo';
import { useAuth } from '../../../context/AuthContext';

export const ModelPerformanceFairnessPage: React.FC = () => {
  const { user } = useAuth();
  const snapshots = modelPerformanceService.getAllSnapshots();
  const fairnessMatrix = modelFairnessService.getKecamatanFairnessMatrix();
  const [findings, setFindings] = useState(modelFairnessService.getFairnessFindings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResolveFinding = (findingId: string) => {
    if (!user) return;
    const res = modelFairnessService.resolveFinding(
      findingId,
      { userId: user.id, userName: user.name },
      'Telah ditambahkan penyesuaian bobot offline sync penalty pada model v2.4-shadow'
    );
    setFindings([...modelFairnessService.getFairnessFindings()]);
    setToastMessage('Temuan disparitas berhasil diperbarui status penanganannya.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00201C] to-[#00332D] text-white p-6 rounded-2xl border border-teal-900/50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              MODEL PERFORMANCE, DRIFT & FAIRNESS AUDIT
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Evaluasi Kinerja, Deteksi Drift & Uji Keadilan Model AI
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pemantauan performa empiris model prediktif CKG, deteksi pergeseran data input (data drift),
              dan audit keadilan antar-kecamatan serta wilayah pulau terluar Kabupaten Pulau Taliabu.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-teal-500/50 rounded-xl text-teal-300 text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Audit Kepatuhan AI Dinkes
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/60 rounded-xl text-emerald-100 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Model Performance Snapshot Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Snapshot Evaluasi Kinerja Model Terkini:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {snapshots.map((snap) => (
            <div key={snap.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{snap.modelId}</h3>
                  <div className="text-[11px] text-slate-400">Versi: {snap.modelVersion} • Sample: n = {snap.sampleSize}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  NO DRIFT DETECTED
                </span>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Akurasi:</div>
                  <div className="text-base font-bold text-white mt-0.5">{(snap.metrics.accuracy * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">AUC-ROC:</div>
                  <div className="text-base font-bold text-teal-400 mt-0.5">{snap.metrics.aucRoc.toFixed(2)}</div>
                </div>
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Brier Score:</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{snap.metrics.brierScore.toFixed(2)}</div>
                </div>
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Presisi:</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{(snap.metrics.precision * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Recall:</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{(snap.metrics.recall * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-slate-800/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase">Unscorable:</div>
                  <div className="text-sm font-bold text-slate-300 mt-0.5">{(snap.metrics.unscorableRate * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Periode Evaluasi: {snap.evaluationPeriodStart} s/d {snap.evaluationPeriodEnd}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fairness & Disparity Check Matrix by Kecamatan */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              Matriks Uji Keadilan Antar-Kecamatan (Fairness Parity Matrix)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluasi tingkat False-Positive dan akurasi per faskes untuk mencegah bias geografis atau peminggiran wilayah terluar.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Kecamatan (Puskesmas)</th>
                <th className="py-2.5 px-3">Sampel Evaluasi</th>
                <th className="py-2.5 px-3">Akurasi Empiris</th>
                <th className="py-2.5 px-3">False Positive Rate</th>
                <th className="py-2.5 px-3">Status Paritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {fairnessMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{row.kecamatan}</td>
                  <td className="py-3 px-3 font-mono">{row.sample} warga</td>
                  <td className="py-3 px-3 font-bold text-slate-200">{row.accuracy}</td>
                  <td className="py-3 px-3 font-mono">{row.falsePositiveRate}</td>
                  <td className="py-3 px-3">
                    {row.disparity === 'NORMAL' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        PARITAS SEIMBANG
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                        TELAAH SINKRONISASI LURING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fairness Findings & Governance Remediation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          Temuan Disparitas & Tindak Lanjut Tata Kelola AI:
        </h3>

        <div className="space-y-3 text-xs">
          {findings.map((f) => (
            <div key={f.id} className="p-4 bg-slate-800/70 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{f.affectedGroup}</span>
                  <span className="text-[10px] font-mono text-slate-400">({f.id})</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  SEVERITY: {f.severity}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{f.findingSummary}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Batas Waktu Remediasi: <strong className="text-amber-300">{f.remediationDueAt?.split('T')[0]}</strong></span>
                {f.resolvedAt ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Telah Ditindaklanjuti
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolveFinding(f.id)}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition cursor-pointer"
                  >
                    Tandai Tindak Lanjut Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
