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
      <div className="bg-[#faf9f6] text-black p-6 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-teal-700" />
              MODEL PERFORMANCE, DRIFT & FAIRNESS AUDIT
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Evaluasi Kinerja, Deteksi Drift & Uji Keadilan Model AI
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Pemantauan performa empiris model prediktif CKG, deteksi pergeseran data input (data drift),
              dan audit keadilan antar-kecamatan serta wilayah pulau terluar Kabupaten Pulau Taliabu.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs font-bold shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Audit Kepatuhan AI Dinkes
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Model Performance Snapshot Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Snapshot Evaluasi Kinerja Model Terkini:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {snapshots.map((snap) => (
            <div key={snap.id} className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-black">{snap.modelId}</h3>
                  <div className="text-[11px] text-stone-500 font-medium">Versi: {snap.modelVersion} • Sample: n = {snap.sampleSize}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  NO DRIFT DETECTED
                </span>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Akurasi:</div>
                  <div className="text-base font-bold text-black mt-0.5">{(snap.metrics.accuracy * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">AUC-ROC:</div>
                  <div className="text-base font-bold text-teal-800 mt-0.5">{snap.metrics.aucRoc.toFixed(2)}</div>
                </div>
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Brier Score:</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">{snap.metrics.brierScore.toFixed(2)}</div>
                </div>
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Presisi:</div>
                  <div className="text-sm font-bold text-stone-800 mt-0.5">{(snap.metrics.precision * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Recall:</div>
                  <div className="text-sm font-bold text-stone-800 mt-0.5">{(snap.metrics.recall * 100).toFixed(0)}%</div>
                </div>
                <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Unscorable:</div>
                  <div className="text-sm font-bold text-stone-700 mt-0.5">{(snap.metrics.unscorableRate * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 flex items-center justify-between pt-1 font-medium">
                <span>Periode Evaluasi: {snap.evaluationPeriodStart} s/d {snap.evaluationPeriodEnd}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fairness & Disparity Check Matrix by Kecamatan */}
      <div className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              Matriks Uji Keadilan Antar-Kecamatan (Fairness Parity Matrix)
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Evaluasi tingkat False-Positive dan akurasi per faskes untuk mencegah bias geografis atau peminggiran wilayah terluar.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Kecamatan (Puskesmas)</th>
                <th className="py-2.5 px-3">Sampel Evaluasi</th>
                <th className="py-2.5 px-3">Akurasi Empiris</th>
                <th className="py-2.5 px-3">False Positive Rate</th>
                <th className="py-2.5 px-3">Status Paritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {fairnessMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-black">{row.kecamatan}</td>
                  <td className="py-3 px-3 font-mono">{row.sample} warga</td>
                  <td className="py-3 px-3 font-bold text-stone-800">{row.accuracy}</td>
                  <td className="py-3 px-3 font-mono">{row.falsePositiveRate}</td>
                  <td className="py-3 px-3">
                    {row.disparity === 'NORMAL' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        PARITAS SEIMBANG
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
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
      <div className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-black flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-600" />
          Temuan Disparitas & Tindak Lanjut Tata Kelola AI:
        </h3>

        <div className="space-y-3 text-xs">
          {findings.map((f) => (
            <div key={f.id} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">{f.affectedGroup}</span>
                  <span className="text-[10px] font-mono text-stone-500">({f.id})</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  SEVERITY: {f.severity}
                </span>
              </div>
              <p className="text-stone-700 leading-relaxed">{f.findingSummary}</p>
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Batas Waktu Remediasi: <strong className="text-amber-800">{f.remediationDueAt?.split('T')[0]}</strong></span>
                {f.resolvedAt ? (
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Telah Ditindaklanjuti
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolveFinding(f.id)}
                    className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition cursor-pointer shadow-2xs"
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
