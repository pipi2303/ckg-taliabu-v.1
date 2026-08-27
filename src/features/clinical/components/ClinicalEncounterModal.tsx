import React, { useState } from 'react';
import {
  CareTask,
  ClinicalEncounter,
  ClinicianRole,
  DiagnosisItem,
  EncounterType,
  PrescriptionItem,
  ProlanisProgramType,
  ReferralSpecialty,
  ReferralUrgency,
  ResolutionOutcome,
  UrineProteinLevel,
  EcgFinding,
  ClinicalSeverity,
} from '../../../types';
import {
  COMMON_ICD10_LIST,
  COMMON_MEDICATIONS,
} from '../../../mock/initialClinicalData';
import {
  X,
  Plus,
  Trash2,
  Stethoscope,
  Activity,
  Heart,
  Pill,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck,
} from 'lucide-react';

interface ClinicalEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: CareTask | null;
  citizenName?: string;
  citizenNik?: string;
  citizenId?: string;
  facilityId?: string;
  facilityName?: string;
  onSave: (data: Omit<ClinicalEncounter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  currentUserName: string;
  currentUserId: string;
}

export const ClinicalEncounterModal: React.FC<ClinicalEncounterModalProps> = ({
  isOpen,
  onClose,
  task,
  citizenName: defaultCitizenName,
  citizenNik: defaultCitizenNik,
  citizenId: defaultCitizenId,
  facilityId: defaultFacilityId,
  facilityName: defaultFacilityName,
  onSave,
  currentUserName,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<'ANAMNESIS' | 'LAB' | 'DIAGNOSIS' | 'RX' | 'CLOSED_LOOP'>('ANAMNESIS');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Identitas & Konteks
  const citizenName = task?.citizenName || defaultCitizenName || 'Pasien CKG';
  const citizenNik = task?.citizenNik || defaultCitizenNik || '';
  const citizenId = task?.citizenId || defaultCitizenId || '';
  const facilityId = task?.facilityId || defaultFacilityId || 'FASKES-PKM-01';
  const facilityName = task?.facilityName || defaultFacilityName || 'Puskesmas Bobong';

  // State Form
  const [encounterType, setEncounterType] = useState<EncounterType>('CKG_CONFIRMATORY');
  const [examinerName, setExaminerName] = useState(currentUserName || 'dr. Dokter Jaga Puskesmas');
  const [examinerRole, setExaminerRole] = useState<ClinicianRole>('DOKTER_PUSKESMAS');
  const [examinerSip, setExaminerSip] = useState('SIP.503/440/DK-PT/2026/045');

  // Anamnesis
  const [chiefComplaint, setChiefComplaint] = useState(
    task ? `Pemeriksaan lanjutan hasil CKG skrining: ${task.actionText}` : 'Pemeriksaan tensi/gula darah ulang hasil skrining CKG'
  );
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('Pasien datang memenuhi anjuran kader kesehatan untuk evaluasi tanda klinis dan konfirmasi diagnostik.');
  const [pastMedicalHistory, setPastMedicalHistory] = useState<string[]>(['Hipertensi']);
  const [currentMedicationsText, setCurrentMedicationsText] = useState('Belum rutin minum obat');
  const [allergyHistory, setAllergyHistory] = useState('Tidak ada riwayat alergi obat');
  const [smoking, setSmoking] = useState(false);
  const [highSaltDiet, setHighSaltDiet] = useState(true);
  const [sedentary, setSedentary] = useState(false);

  // Vital Signs
  const [systolicBp, setSystolicBp] = useState<number>(150);
  const [diastolicBp, setDiastolicBp] = useState<number>(95);
  const [repeatSystolicBp, setRepeatSystolicBp] = useState<number | undefined>(undefined);
  const [repeatDiastolicBp, setRepeatDiastolicBp] = useState<number | undefined>(undefined);
  const [heartRate, setHeartRate] = useState<number>(80);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [waistCircumferenceCm, setWaistCircumferenceCm] = useState<number>(88);
  const [physicalExamFindings, setPhysicalExamFindings] = useState('Keadaan umum baik, compos mentis. Cor dan Pulmo dalam batas normal. Edema ekstremitas (-).');

  // Confirmatory Lab
  const [fastingBloodGlucose, setFastingBloodGlucose] = useState<number | undefined>(undefined);
  const [randomBloodGlucose, setRandomBloodGlucose] = useState<number | undefined>(145);
  const [hba1c, setHba1c] = useState<number | undefined>(undefined);
  const [totalCholesterol, setTotalCholesterol] = useState<number | undefined>(210);
  const [triglycerides, setTriglycerides] = useState<number | undefined>(160);
  const [hdlCholesterol, setHdlCholesterol] = useState<number | undefined>(45);
  const [ldlCholesterol, setLdlCholesterol] = useState<number | undefined>(135);
  const [uricAcid, setUricAcid] = useState<number | undefined>(6.2);
  const [serumCreatinine, setSerumCreatinine] = useState<number | undefined>(0.95);
  const [egfr, setEgfr] = useState<number | undefined>(88);
  const [urineProtein, setUrineProtein] = useState<UrineProteinLevel>('NEGATIVE');
  const [ecgFinding, setEcgFinding] = useState<EcgFinding>('NORMAL');
  const [labNotes, setLabNotes] = useState('Pemeriksaan lab penunjang terkonfirmasi di laboratorium Puskesmas.');

  // Diagnoses
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<DiagnosisItem>(COMMON_ICD10_LIST[0]);
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<DiagnosisItem[]>([COMMON_ICD10_LIST[6]]);
  const [clinicalSeverity, setClinicalSeverity] = useState<ClinicalSeverity>('MODERATE');
  const [clinicalAssessmentSummary, setClinicalAssessmentSummary] = useState('Hipertensi Grade 1 disertai Dislipidemia Ringan. Indikasi terapi farmakologis dan modifikasi gaya hidup.');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-tmp-1',
      drugName: 'Amlodipine',
      dosage: '5 mg',
      frequency: '1 x 1 tablet pagi',
      route: 'ORAL',
      durationDays: 30,
      quantity: 30,
      instructions: 'Diminum pagi hari sesudah sarapan.',
    },
  ]);

  // Non-farmakologis
  const [nonPharmacologicalAdvice, setNonPharmacologicalAdvice] = useState<string[]>([
    'Diet Rendah Garam (< 1 sendok teh per hari)',
    'Aktivitas fisik sedang 30 menit 3x/minggu',
    'Kontrol ulang 30 hari lagi di Puskesmas',
  ]);

  // Prolanis & Referral
  const [enrolledInProlanis, setEnrolledInProlanis] = useState(true);
  const [prolanisProgramType, setProlanisProgramType] = useState<ProlanisProgramType>('PROLANIS_HT');
  const [referredToHospital, setReferredToHospital] = useState(false);
  const [referralSpecialty, setReferralSpecialty] = useState<ReferralSpecialty>('SPESIALIS_PENYAKIT_DALAM');
  const [referralUrgency, setReferralUrgency] = useState<ReferralUrgency>('ROUTINE');
  const [nextControlDate, setNextControlDate] = useState('2026-09-23');
  const [resolutionOutcome, setResolutionOutcome] = useState<ResolutionOutcome>('CONFIRMED_THERAPY_INITIATED');
  const [closedLoopNotes, setClosedLoopNotes] = useState('Pemeriksaan CKG selesai terkonfirmasi klinis. Kasus berhasil ditindaklanjuti dan terintegrasi dengan tata kelola penyakit kronis.');

  if (!isOpen) return null;

  // Calculate BMI
  const bmi = heightCm > 0 ? Number((weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1)) : 0;

  const handleAddMedication = (preset?: typeof COMMON_MEDICATIONS[0]) => {
    const newRx: PrescriptionItem = preset
      ? {
          id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          drugName: preset.drugName,
          dosage: preset.dosage,
          frequency: preset.frequency,
          route: preset.route,
          durationDays: preset.durationDays,
          quantity: preset.quantity,
          instructions: preset.instructions,
        }
      : {
          id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          drugName: 'Amlodipine',
          dosage: '5 mg',
          frequency: '1 x 1 tablet pagi',
          route: 'ORAL',
          durationDays: 30,
          quantity: 30,
          instructions: 'Diminum sesudah makan.',
        };
    setPrescriptions([...prescriptions, newRx]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint || !primaryDiagnosis) {
      setErrorMessage('Keluhan utama dan diagnosis primer wajib diisi.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await onSave({
        citizenId,
        citizenName,
        citizenNik,
        facilityId,
        facilityName,
        taskId: task?.id,
        encounterDate: new Date().toISOString(),
        encounterType,
        examinerUserId: currentUserId,
        examinerName,
        examinerRole,
        examinerSip,
        chiefComplaint,
        historyOfPresentIllness,
        pastMedicalHistory,
        currentMedicationsText,
        allergyHistory,
        lifestyleFactors: {
          smoking,
          highSaltDiet,
          sedentary,
          alcohol: false,
        },
        systolicBp,
        diastolicBp,
        repeatSystolicBp,
        repeatDiastolicBp,
        heartRate,
        respiratoryRate,
        temperature,
        weightKg,
        heightCm,
        bmi,
        waistCircumferenceCm,
        physicalExamFindings,
        fastingBloodGlucose,
        randomBloodGlucose,
        hba1c,
        totalCholesterol,
        triglycerides,
        hdlCholesterol,
        ldlCholesterol,
        uricAcid,
        serumCreatinine,
        egfr,
        urineProtein,
        ecgFinding,
        labNotes,
        primaryDiagnosis,
        secondaryDiagnoses,
        clinicalSeverity,
        clinicalAssessmentSummary,
        prescriptions,
        nonPharmacologicalAdvice,
        enrolledInProlanis,
        prolanisProgramType: enrolledInProlanis ? prolanisProgramType : undefined,
        referredToHospital,
        referralDetails: referredToHospital
          ? {
              targetHospital: 'RSUD Bobong Kabupaten Pulau Taliabu',
              specialty: referralSpecialty,
              urgency: referralUrgency,
              referralLetterNumber: `440/RUJ-${facilityId}/${Date.now().toString().slice(-4)}`,
            }
          : undefined,
        nextControlDate,
        resolutionOutcome,
        closedLoopNotes,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan rekam medis');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header with Doctor SIP verification badge */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-700/80 rounded-lg">
              <Stethoscope className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Rekam Medis Elektronik CKG / Konsultasi Dokter</h2>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-teal-900/80 text-teal-200 border border-teal-600/50">
                  S3/S4 Clinical Grade
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Pasien: <span className="font-semibold text-white">{citizenName}</span> &bull; NIK: <span className="font-mono">{citizenNik}</span> &bull; {facilityName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-teal-700 text-teal-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('ANAMNESIS')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'ANAMNESIS'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>1. Anamnesis & Fisik</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LAB')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'LAB'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. Lab Konfirmasi & EKG</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DIAGNOSIS')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'DIAGNOSIS'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Diagnosis ICD-10</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RX')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'RX'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>4. Resep & Edukasi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLOSED_LOOP')}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-colors ${
              activeTab === 'CLOSED_LOOP'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>5. Rujukan & Resolusi CKG</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* TAB 1: ANAMNESIS & PHYSICAL EXAM */}
          {activeTab === 'ANAMNESIS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dokter Pemeriksa</label>
                  <input
                    type="text"
                    value={examinerName}
                    onChange={(e) => setExaminerName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor SIP / STR</label>
                  <input
                    type="text"
                    value={examinerSip}
                    onChange={(e) => setExaminerSip(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pertemuan</label>
                  <select
                    value={encounterType}
                    onChange={(e) => setEncounterType(e.target.value as EncounterType)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="CKG_CONFIRMATORY">Konfirmasi Skrining CKG</option>
                    <option value="ROUTINE_CONTROL">Kontrol Rutin Hipertensi / DM</option>
                    <option value="URGENT_TRIAGE">Triage Kedaruratan / Gejala Bahaya</option>
                    <option value="POST_HOSPITAL">Pasca Rawat / Rujuk Balik RSUD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keluhan Utama & RPS *</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Keluhan utama saat pasien datang..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Anamnesis Terperinci (Riwayat Penyakit Sekarang)</label>
                <textarea
                  rows={2}
                  value={historyOfPresentIllness}
                  onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Tanda Vital */}
              <div className="border border-slate-200 rounded-lg p-4 bg-teal-50/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Pemeriksaan Tanda Vital & Antropometri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">TD Sistolik (mmHg) *</label>
                    <input
                      type="number"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(Number(e.target.value))}
                      className={`w-full text-xs p-2 border rounded font-semibold ${
                        systolicBp >= 140 ? 'border-red-400 bg-red-50 text-red-800' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">TD Diastolik (mmHg) *</label>
                    <input
                      type="number"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(Number(e.target.value))}
                      className={`w-full text-xs p-2 border rounded font-semibold ${
                        diastolicBp >= 90 ? 'border-red-400 bg-red-50 text-red-800' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">TD Ulang Sistolik</label>
                    <input
                      type="number"
                      placeholder="Jika selisih >5"
                      value={repeatSystolicBp || ''}
                      onChange={(e) => setRepeatSystolicBp(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">TD Ulang Diastolik</label>
                    <input
                      type="number"
                      placeholder="Jika selisih >5"
                      value={repeatDiastolicBp || ''}
                      onChange={(e) => setRepeatDiastolicBp(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Nadi (x/mnt)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pernapasan (x/mnt)</label>
                    <input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Berat Badan (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">IMT (Kalkulasi)</label>
                    <div className="p-2 bg-white border border-slate-300 rounded text-xs font-bold text-teal-800 text-center">
                      {bmi} kg/m²
                    </div>
                  </div>
                </div>
              </div>

              {/* Gaya Hidup & Faktor Risiko */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap gap-6 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smoking}
                    onChange={(e) => setSmoking(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Perokok Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highSaltDiet}
                    onChange={(e) => setHighSaltDiet(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Konsumsi Garam / Makanan Asin Tinggi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sedentary}
                    onChange={(e) => setSedentary(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Kurang Aktivitas Fisik (Sedentari)</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: LAB KONFIRMASI */}
          {activeTab === 'LAB' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
                <p className="font-semibold">Pemeriksaan Penunjang Laboratorium FKTP</p>
                <p className="text-[11px] text-blue-700">
                  Digunakan untuk konfirmasi diagnosis definitif CKG (Hipertensi, Diabetes Melitus, Dislipidemia, Gangguan Ginjal).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gula Darah Puasa (GDP)</label>
                  <input
                    type="number"
                    placeholder="mg/dL (Normal <100)"
                    value={fastingBloodGlucose || ''}
                    onChange={(e) => setFastingBloodGlucose(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gula Darah Sewaktu (GDS)</label>
                  <input
                    type="number"
                    placeholder="mg/dL"
                    value={randomBloodGlucose || ''}
                    onChange={(e) => setRandomBloodGlucose(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="% (Target <7.0%)"
                    value={hba1c || ''}
                    onChange={(e) => setHba1c(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kolesterol Total</label>
                  <input
                    type="number"
                    placeholder="mg/dL (Normal <200)"
                    value={totalCholesterol || ''}
                    onChange={(e) => setTotalCholesterol(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Trigliserida</label>
                  <input
                    type="number"
                    placeholder="mg/dL (<150)"
                    value={triglycerides || ''}
                    onChange={(e) => setTriglycerides(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Asam Urat</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="mg/dL"
                    value={uricAcid || ''}
                    onChange={(e) => setUricAcid(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Serum Kreatinin</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="mg/dL"
                    value={serumCreatinine || ''}
                    onChange={(e) => setSerumCreatinine(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">eGFR (mL/min/1.73m²)</label>
                  <input
                    type="number"
                    placeholder="eGFR"
                    value={egfr || ''}
                    onChange={(e) => setEgfr(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Proteinuria (Urinalisis)</label>
                  <select
                    value={urineProtein}
                    onChange={(e) => setUrineProtein(e.target.value as UrineProteinLevel)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="NEGATIVE">Negatif (-)</option>
                    <option value="TRACE">Trace (&plusmn;)</option>
                    <option value="1_PLUS">Positif 1 (+1)</option>
                    <option value="2_PLUS">Positif 2 (+2)</option>
                    <option value="3_PLUS">Positif 3 (+3)</option>
                    <option value="4_PLUS">Positif 4 (+4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interpretasi Rekam Jantung (EKG)</label>
                  <select
                    value={ecgFinding}
                    onChange={(e) => setEcgFinding(e.target.value as EcgFinding)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="NORMAL">Normal Sinus Rhythm</option>
                    <option value="LVH">Left Ventricular Hypertrophy (LVH)</option>
                    <option value="ISCHEMIA">Iskemia Miokard (ST-T Changes)</option>
                    <option value="ARRHYTHMIA">Aritmia / Gangguan Irama</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSIS ICD-10 */}
          {activeTab === 'DIAGNOSIS' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Diagnosis Utama (Primary Diagnosis ICD-10) *
                </label>
                <select
                  value={primaryDiagnosis.code}
                  onChange={(e) => {
                    const found = COMMON_ICD10_LIST.find((i) => i.code === e.target.value);
                    if (found) setPrimaryDiagnosis(found);
                  }}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500"
                >
                  {COMMON_ICD10_LIST.map((d) => (
                    <option key={d.code} value={d.code}>
                      [{d.code}] {d.name} {d.isChronic ? '(Penyakit Kronis)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Keparahan Klinis</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'] as ClinicalSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setClinicalSeverity(sev)}
                      className={`p-2 rounded text-xs font-medium border text-center transition-colors ${
                        clinicalSeverity === sev
                          ? 'bg-teal-800 text-white border-teal-800 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan Penilaian & Rencana Klinis (Clinical Assessment)
                </label>
                <textarea
                  rows={3}
                  value={clinicalAssessmentSummary}
                  onChange={(e) => setClinicalAssessmentSummary(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: RESEP & EDUKASI */}
          {activeTab === 'RX' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Daftar Resep Obat (Formularium Nasional FKTP)
                </h4>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      const drug = COMMON_MEDICATIONS.find((m) => `${m.drugName} ${m.dosage}` === e.target.value);
                      if (drug) handleAddMedication(drug);
                    }}
                    className="text-xs p-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="">+ Tambah Obat Cepat (Preset)...</option>
                    {COMMON_MEDICATIONS.map((m, idx) => (
                      <option key={idx} value={`${m.drugName} ${m.dosage}`}>
                        {m.drugName} {m.dosage} ({m.frequency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prescription Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Nama Obat & Dosis</th>
                      <th className="p-2.5">Aturan Pakai (Signa)</th>
                      <th className="p-2.5">Jumlah</th>
                      <th className="p-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-medium text-slate-900">
                          {rx.drugName} {rx.dosage}
                        </td>
                        <td className="p-2.5 text-slate-700">{rx.frequency}</td>
                        <td className="p-2.5 font-mono">{rx.quantity} tab</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(rx.id)}
                            className="p-1 text-red-500 hover:text-red-700 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edukasi Non-Farmakologis */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Edukasi & Konseling Non-Farmakologis Pasien
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {nonPharmacologicalAdvice.map((adv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLOSED LOOP & RUJUKAN */}
          {activeTab === 'CLOSED_LOOP' && (
            <div className="space-y-5">
              {/* Prolanis Enrollment Toggle */}
              <div className="p-4 border border-teal-200 bg-teal-50/40 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                    <div>
                      <span className="font-semibold text-xs text-slate-900">Pendaftaran Program Prolanis BPJS</span>
                      <p className="text-[11px] text-slate-600">Integrasikan pasien ke klub senam & pemantauan kronis bulanan.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enrolledInProlanis}
                    onChange={(e) => setEnrolledInProlanis(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                {enrolledInProlanis && (
                  <div className="pt-2 border-t border-teal-200/60 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Kategori Prolanis</label>
                      <select
                        value={prolanisProgramType}
                        onChange={(e) => setProlanisProgramType(e.target.value as ProlanisProgramType)}
                        className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                      >
                        <option value="PROLANIS_HT">Prolanis Hipertensi (HT)</option>
                        <option value="PROLANIS_DM">Prolanis Diabetes Melitus (DM)</option>
                        <option value="PROLANIS_COMBO">Prolanis Kombinasi (HT + DM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Jadwal Kontrol Berikutnya</label>
                      <input
                        type="date"
                        value={nextControlDate}
                        onChange={(e) => setNextControlDate(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rujukan RSUD Bobong Toggle */}
              <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-700" />
                    <div>
                      <span className="font-semibold text-xs text-slate-900">Rujuk ke RSUD Bobong (FKRTL)</span>
                      <p className="text-[11px] text-slate-600">Buat Surat Rujukan Resmi FKTP jika membutuhkan penanganan spesialis.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={referredToHospital}
                    onChange={(e) => setReferredToHospital(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>

                {referredToHospital && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Spesialisasi Dituju</label>
                      <select
                        value={referralSpecialty}
                        onChange={(e) => setReferralSpecialty(e.target.value as ReferralSpecialty)}
                        className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                      >
                        <option value="SPESIALIS_PENYAKIT_DALAM">Spesialis Penyakit Dalam (Sp.PD)</option>
                        <option value="SPESIALIS_JANTUNG">Spesialis Jantung & Pembuluh Darah (Sp.JP)</option>
                        <option value="SPESIALIS_MATA">Spesialis Mata (Sp.M)</option>
                        <option value="SPESIALIS_SARAF">Spesialis Saraf (Sp.N)</option>
                        <option value="SPESIALIS_BEDAH">Spesialis Bedah (Sp.B)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Tingkat Urgensi Rujukan</label>
                      <select
                        value={referralUrgency}
                        onChange={(e) => setReferralUrgency(e.target.value as ReferralUrgency)}
                        className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                      >
                        <option value="ROUTINE">Rutin (Poliklinik Rawat Jalan)</option>
                        <option value="URGENT_24H">Urgent (Dalam 24 Jam)</option>
                        <option value="EMERGENCY_IMMEDIATE">CITO / Kedaruratan IGD Segera</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Resolusi Closed Loop */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Hasil Resolusi Closed-Loop Care Task
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Outcome Resolusi</label>
                    <select
                      value={resolutionOutcome}
                      onChange={(e) => setResolutionOutcome(e.target.value as ResolutionOutcome)}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                    >
                      <option value="CONFIRMED_THERAPY_INITIATED">Terkonfirmasi & Terapi Dimulai (Closed)</option>
                      <option value="CONFIRMED_CONTROLLED">Terkonfirmasi Terkendali (Closed)</option>
                      <option value="REFERRED_TO_SPECIALIST">Dirujuk ke RSUD Bobong (Referred)</option>
                      <option value="FALSE_POSITIVE_NORMAL">Hasil Skrining False Positive / Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Closed-Loop Audit</label>
                    <input
                      type="text"
                      value={closedLoopNotes}
                      onChange={(e) => setClosedLoopNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              {activeTab !== 'ANAMNESIS' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'LAB') setActiveTab('ANAMNESIS');
                    if (activeTab === 'DIAGNOSIS') setActiveTab('LAB');
                    if (activeTab === 'RX') setActiveTab('DIAGNOSIS');
                    if (activeTab === 'CLOSED_LOOP') setActiveTab('RX');
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Kembali
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTab !== 'CLOSED_LOOP' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'ANAMNESIS') setActiveTab('LAB');
                    else if (activeTab === 'LAB') setActiveTab('DIAGNOSIS');
                    else if (activeTab === 'DIAGNOSIS') setActiveTab('RX');
                    else if (activeTab === 'RX') setActiveTab('CLOSED_LOOP');
                  }}
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-medium hover:bg-teal-800 transition-colors"
                >
                  Lanjut &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Rekam Medis & Selesaikan Tugas CKG'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
