import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Edit3,
  FileText,
  Sparkles,
  BookOpen,
  Pill,
  HeartPulse,
} from 'lucide-react';
import { aiClinicalCopilotService } from '../../../services/aiClinicalCopilotService';
import { AIClinicalRecommendation, AIApprovalStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const ClinicalCopilotPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIClinicalRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<AIClinicalRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await aiClinicalCopilotService.getAllRecommendations();
      setRecommendations(data);
      if (data.length > 0 && !selectedRec) {
        setSelectedRec(data[0]);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (status: AIApprovalStatus) => {
    if (!selectedRec || !user) return;
    setIsSubmitting(true);
    try {
      const updated = await aiClinicalCopilotService.reviewRecommendation({
        id: selectedRec.id,
        newStatus: status,
        doctorUserId: user.id,
        doctorName: user.name,
        doctorRole: user.roleName || user.roleId,
        notes: reviewNotes,
      });

      setSelectedRec(updated);
      setRecommendations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSuccessMessage(
        status === 'APPROVED_BY_CLINICIAN'
          ? 'Rekomendasi terapi AI berhasil disetujui oleh dokter pemeriksa.'
          : status === 'MODIFIED_BY_CLINICIAN'
          ? 'Rekomendasi AI disetujui dengan penyesuaian catatan klinisi.'
          : 'Rekomendasi AI ditolak. Silakan gunakan protokol terapi manual.'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Menyiapkan Asisten Klinis AI & Analisis Protokol Kemenkes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Human-In-The-Loop Disclaimer Banner */}
      <div className="p-4 bg-[#faf9f6] border border-emerald-300 rounded-2xl flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-emerald-900 uppercase tracking-wider">
            HUMAN-IN-THE-LOOP CLINICAL DECISION SUPPORT (PRINSIP KESELAMATAN PASIEN)
          </div>
          <p className="text-stone-600 leading-relaxed">
            Sistem AI ini bertindak sebagai alat bantu penapis klinis berbasis <em>Pedoman Praktik Klinis Dokter di FKTP (PMK No. 5/2014)</em> dan Protokol CKG 2026. Seluruh saran kerja harus ditinjau dan divalidasi oleh dokter pemeriksa sebelum diresepkan ke pasien.
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-800 font-bold uppercase tracking-wider mb-1">
          <Stethoscope className="w-4 h-4 text-teal-700" />
          CLINICAL COPILOT & PRESCRIPTION SAFETY
        </div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Asisten Keputusan Klinis & Keamanan Resep</h1>
        <p className="text-xs text-stone-600 mt-1">
          Penapisan interaksi obat (DDI), penyesuaian fungsi ginjal/usia, dan rekomendasi terapi lini pertama terstandar FKTP.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-teal-50 border border-teal-300 rounded-xl text-teal-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-700" />
          {successMessage}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Recommendation Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider px-1">
            Antrian Pasien Perlu Telaah Klinisi ({recommendations.length})
          </h3>

          <div className="space-y-2">
            {recommendations.map((rec) => {
              const isSelected = selectedRec?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRec(rec);
                    setReviewNotes(rec.clinicianNotes || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-white border-teal-700 shadow-sm ring-1 ring-teal-700'
                      : 'bg-[#faf9f6] border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-black text-xs">{rec.patientName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.humanReviewStatus === 'APPROVED_BY_CLINICIAN'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : rec.humanReviewStatus === 'MODIFIED_BY_CLINICIAN'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : rec.humanReviewStatus === 'REJECTED_BY_CLINICIAN'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {rec.humanReviewStatus === 'APPROVED_BY_CLINICIAN'
                        ? 'DISETUJUI DOKTER'
                        : rec.humanReviewStatus === 'MODIFIED_BY_CLINICIAN'
                        ? 'DISESUAIKAN'
                        : rec.humanReviewStatus === 'REJECTED_BY_CLINICIAN'
                        ? 'DITOLAK'
                        : 'MENUNGGU TELAAH'}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 space-y-0.5">
                    <div>Usia: {rec.age} th ({rec.gender})</div>
                    <div className="text-teal-800 font-semibold">TD: {rec.observedFindings.systolic}/{rec.observedFindings.diastolic} mmHg</div>
                    <div className="text-stone-700 truncate">{rec.suggestedWorkingDiagnosis.diagnosisName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Recommendation Panel & Clinical Validation (8 Cols) */}
        {selectedRec && (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Patient Summary */}
            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-black">{selectedRec.patientName}</h2>
                  <p className="text-xs text-stone-500">
                    ID Warga: {selectedRec.citizenId} • Usia: {selectedRec.age} Tahun ({selectedRec.gender})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Derajat Kepastian AI</div>
                    <div className="text-xs font-bold text-teal-800 flex items-center justify-end gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      {selectedRec.suggestedWorkingDiagnosis.confidencePercent}% Confidence
                    </div>
                  </div>
                </div>
              </div>

              {/* Observed Findings Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Tekanan Darah:</div>
                  <div className="font-bold text-black text-sm">
                    {selectedRec.observedFindings.systolic}/{selectedRec.observedFindings.diastolic} <span className="text-[10px] font-normal text-stone-500">mmHg</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs">
                  <div className="text-stone-500 text-[11px]">Gula Darah:</div>
                  <div className="font-bold text-black text-sm">
                    {selectedRec.observedFindings.randomBloodSugar || selectedRec.observedFindings.fastingBloodSugar || '-'}{' '}
                    <span className="text-[10px] font-normal text-stone-500">mg/dL</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs">
                  <div className="text-stone-500 text-[11px]">HbA1c:</div>
                  <div className="font-bold text-black text-sm">
                    {selectedRec.observedFindings.hba1c ? `${selectedRec.observedFindings.hba1c}%` : 'Belum Ada'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs">
                  <div className="text-stone-500 text-[11px]">IMT / Merokok:</div>
                  <div className="font-bold text-black text-xs">
                    {selectedRec.observedFindings.bmi || 24.0} • {selectedRec.observedFindings.smokingStatus ? 'Merokok' : 'Non-Perokok'}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Diagnosis & Guideline Grounding */}
            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-stone-200 pb-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Saran Diagnosis Kerja & Dasar Pedoman Klinis (Clinical Guideline Grounding)
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono text-xs font-bold">
                    ICD-10: {selectedRec.suggestedWorkingDiagnosis.icd10Code}
                  </span>
                  <span className="font-bold text-black text-xs">
                    {selectedRec.suggestedWorkingDiagnosis.diagnosisName}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 pl-1">
                  Klasifikasi: {selectedRec.suggestedWorkingDiagnosis.stageOrGrade}
                </div>
              </div>

              <div className="text-xs text-stone-700 space-y-1 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <div className="text-teal-800 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  Rasionalisasi Klinis:
                </div>
                <p className="leading-relaxed text-stone-700">{selectedRec.guidelineEvidence.rationaleExplanation}</p>
                <div className="text-[10px] text-stone-500 italic pt-1">
                  Sumber: {selectedRec.guidelineEvidence.sourceGuideline} ({selectedRec.guidelineEvidence.referenceSection})
                </div>
              </div>
            </div>

            {/* Recommended Pharmacotherapy & Safety Alerts */}
            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-stone-200 pb-2">
                <Pill className="w-4 h-4 text-teal-700" />
                Rekomendasi Terapi Obat Lini Pertama & Peringatan Keamanan Resep
              </div>

              {/* Safety Alerts */}
              {selectedRec.safetyAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-teal-50 border-teal-200 text-teal-900'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold uppercase tracking-wider mr-1">
                      [{alert.type}]:
                    </strong>
                    {alert.message}
                  </div>
                </div>
              ))}

              {/* Drug Prescriptions */}
              <div className="space-y-2.5">
                {selectedRec.recommendedTherapy.map((rx, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-black font-semibold">
                      <span>{rx.firstLineDrug}</span>
                      <span className="text-teal-800 font-mono text-[11px] font-bold">{rx.frequency}</span>
                    </div>
                    <div className="text-stone-700 text-[11px]">Dosis Awal: {rx.initialDose}</div>
                    <div className="text-stone-500 text-[10px] italic">Catatan: {rx.specialInstructions}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Action & Review Section */}
            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold text-black flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-teal-700" />
                  Keputusan & Catatan Dokter Pemeriksa
                </h3>
                {selectedRec.reviewedByDoctorName && (
                  <span className="text-xs text-stone-500">
                    Terakhir ditelaah oleh: <strong className="text-stone-800">{selectedRec.reviewedByDoctorName}</strong>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs text-stone-700 font-semibold mb-1.5">
                  Catatan Klinis / Penyesuaian Resep Dokter:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Tambahkan catatan khusus atau alasan modifikasi terapi..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-black placeholder-stone-400 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleReview('APPROVED_BY_CLINICIAN')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui Rekomendasi Terapi
                </button>

                <button
                  onClick={() => handleReview('MODIFIED_BY_CLINICIAN')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Setujui dengan Penyesuaian
                </button>

                <button
                  onClick={() => handleReview('REJECTED_BY_CLINICIAN')}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Rekomendasi AI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
