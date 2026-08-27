import React, { useState, useEffect } from 'react';
import {
  CareTask,
  ClinicalEncounter,
  HospitalReferral,
  ProlanisEnrollment,
  ReferralStatus,
  ReferralReplyChannel,
} from '../../../types';
import { clinicalRepo, EncounterFilterParams } from '../../../repositories/clinicalRepo';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { useAuth } from '../../../context/AuthContext';
import { ClinicalEncounterModal } from '../components/ClinicalEncounterModal';
import { HospitalReferralDetailModal } from '../components/HospitalReferralDetailModal';
import {
  Stethoscope,
  Activity,
  Building2,
  ShieldCheck,
  FileCheck,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Pill,
  Heart,
  ExternalLink,
  ChevronRight,
  BarChart3,
  RefreshCw,
  X,
} from 'lucide-react';
import { formatDateTime } from '../../../utils/date';
import { DocBadge } from '../../../components/common/DocBadge';

export const ClinicalFollowUpPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ENCOUNTERS' | 'REFERRALS' | 'PROLANIS' | 'ANALYTICS'>('QUEUE');
  
  // Data States
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
  const [referrals, setReferrals] = useState<HospitalReferral[]>([]);
  const [prolanisList, setProlanisList] = useState<ProlanisEnrollment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Modals
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  const [selectedTaskForEncounter, setSelectedTaskForEncounter] = useState<CareTask | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<HospitalReferral | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedEncounterDetail, setSelectedEncounterDetail] = useState<ClinicalEncounter | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, encountersData, referralsData, prolanisData, analyticsData] = await Promise.all([
        careTaskRepo.query({ status: 'ALL' }),
        clinicalRepo.getAllEncounters(),
        clinicalRepo.getReferrals(),
        clinicalRepo.getProlanisEnrollments(),
        clinicalRepo.getClosedLoopAnalytics(facilityFilter !== 'ALL' ? facilityFilter : undefined),
      ]);

      setCareTasks(tasksData);
      setEncounters(encountersData);
      setReferrals(referralsData);
      setProlanisList(prolanisData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading clinical data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [facilityFilter]);

  // Tasks in queue for clinical consultation
  const consultationQueue = careTasks.filter(
    (t) =>
      (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') &&
      (t.taskType === 'CLINICAL_CONFIRMATION' ||
        t.taskType === 'TREATMENT_INITIATION' ||
        t.taskType === 'MONITORING_CONTROL' ||
        t.isCritical ||
        t.priorityScore >= 70)
  );

  const filteredQueue = consultationQueue.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.citizenName?.toLowerCase().includes(q) ||
        t.citizenNik?.includes(q) ||
        t.actionText.toLowerCase().includes(q)
      );
    }
    if (facilityFilter !== 'ALL' && t.facilityId !== facilityFilter) return false;
    return true;
  });

  const filteredEncounters = encounters.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.citizenName.toLowerCase().includes(q) ||
        e.citizenNik.includes(q) ||
        e.primaryDiagnosis.code.toLowerCase().includes(q) ||
        e.primaryDiagnosis.name.toLowerCase().includes(q)
      );
    }
    if (facilityFilter !== 'ALL' && e.facilityId !== facilityFilter) return false;
    if (severityFilter !== 'ALL' && e.clinicalSeverity !== severityFilter) return false;
    return true;
  });

  const handleStartConsultation = (task: CareTask) => {
    setSelectedTaskForEncounter(task);
    setIsEncounterModalOpen(true);
  };

  const handleSaveEncounter = async (data: Omit<ClinicalEncounter, 'id' | 'createdAt' | 'updatedAt'>) => {
    await clinicalRepo.createEncounter(data, {
      id: currentUser?.id || 'usr-dr-01',
      name: currentUser?.name || 'Dokter Pemeriksa',
    });
    await loadData();
  };

  const handleUpdateReferralStatus = async (status: ReferralStatus, notes?: string, replyChannel?: ReferralReplyChannel) => {
    if (!selectedReferral) return;
    await clinicalRepo.updateReferralStatus(
      selectedReferral.id,
      status,
      notes,
      {
        id: currentUser?.id || 'usr-dr-01',
        name: currentUser?.name || 'Dokter Faskes',
      },
      replyChannel
    );
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Layanan Klinis & Closed-Loop CKG</h1>
                <DocBadge code="SCR-PKM-D01" size="xs" />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  MODUL KLINIS AKTIF
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  S3/S4 Security Tier
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Konfirmasi diagnostik FKTP, Peresepan Obat Terpadu, Registri Prolanis BPJS & Rujukan RSUD Bobong Pulau Taliabu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedTaskForEncounter(null);
              setIsEncounterModalOpen(true);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Rekam Medis CKG Baru</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Antrean Konfirmasi Klinis</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{consultationQueue.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Memerlukan validasi dokter</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Kasus Selesai (Closed-Loop)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{analytics.resolvedThroughClinic}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Terkonfirmasi & terapi dimulai</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Rujukan RSUD Bobong</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{referrals.length}</p>
            <p className="text-[11px] text-blue-600 mt-0.5">{analytics.activeReferralsCount} aktif dalam pemantauan</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Peserta Prolanis Aktif</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-800">{analytics.totalProlanisActive}</p>
            <p className="text-[11px] text-teal-600 mt-0.5">Hipertensi & DM terintegrasi</p>
          </div>
        </div>
      )}

      {/* Main Tabs Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-2 pt-2 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'QUEUE'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrean Konsultasi & Konfirmasi ({consultationQueue.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ENCOUNTERS')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ENCOUNTERS'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rekam Medis & Riwayat Klinis ({encounters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REFERRALS')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'REFERRALS'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sistem Rujukan RSUD Bobong ({referrals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PROLANIS')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'PROLANIS'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Registri Prolanis BPJS ({prolanisList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ANALYTICS'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Closed-Loop Resolution Audit</span>
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama warga, NIK, diagnosis ICD-10..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Faskes:</span>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="p-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="ALL">Semua Faskes (Pulau Taliabu)</option>
                <option value="FASKES-PKM-01">Puskesmas Bobong</option>
                <option value="FASKES-PKM-02">Puskesmas Lede</option>
                <option value="FASKES-PKM-03">Puskesmas Nggele</option>
                <option value="FASKES-PKM-04">Puskesmas Gela</option>
                <option value="FASKES-PKM-05">Puskesmas Samuya</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 1: CONSULTATION QUEUE */}
        {activeTab === 'QUEUE' && (
          <div className="p-4">
            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">Semua Antrean Konfirmasi Selesai</p>
                <p className="text-xs text-slate-500 mt-1">Tidak ada tugas skrining CKG yang tertunda pemeriksaan dokter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQueue.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">{task.id}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{task.citizenName}</h3>
                          <p className="text-xs text-slate-500">
                            NIK: <span className="font-mono">{task.citizenNik}</span> &bull; {task.villageName}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {task.isCritical ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">
                              KRITIS / TRIAGE S4
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800">
                              Prioritas Score: {task.priorityScore || 50}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-medium">{task.facilityName}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700">
                        <span className="font-semibold text-slate-900 block mb-0.5">Tindakan Klinis Direkomendasikan:</span>
                        {task.actionText}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Tenggat Waktu: {formatDateTime(task.dueAt)}</span>
                        <span>&bull;</span>
                        <span>Petugas Penjangkau: {task.assignedToUserName || 'Kader Lapangan'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-700">
                        {task.status === 'ASSIGNED' ? 'Tugas Aktif Terjadwal' : 'Menunggu Konsultasi Dokter'}
                      </span>
                      <button
                        onClick={() => handleStartConsultation(task)}
                        className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Mulai Konsultasi Dokter</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENCOUNTERS REGISTRY */}
        {activeTab === 'ENCOUNTERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Waktu & Faskes</th>
                  <th className="p-3">Identitas Pasien</th>
                  <th className="p-3">Tanda Vital / TTV</th>
                  <th className="p-3">Diagnosis Utama (ICD-10)</th>
                  <th className="p-3">Terapi & Resep</th>
                  <th className="p-3">Status Resolusi</th>
                  <th className="p-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEncounters.map((enc) => (
                  <tr key={enc.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{formatDateTime(enc.encounterDate)}</p>
                      <p className="text-[11px] text-slate-500">{enc.facilityName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{enc.examinerName}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{enc.citizenName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{enc.citizenNik}</p>
                      <p className="text-[10px] text-slate-400">{enc.villageName}</p>
                    </td>
                    <td className="p-3 font-mono">
                      <p className="font-semibold text-slate-800">TD: {enc.systolicBp}/{enc.diastolicBp} mmHg</p>
                      <p className="text-[11px] text-slate-500">N: {enc.heartRate}x | IMT: {enc.bmi}</p>
                      {enc.fastingBloodGlucose && (
                        <p className="text-[11px] text-teal-700">GDP: {enc.fastingBloodGlucose} mg/dL</p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 font-bold rounded bg-slate-100 text-slate-800 text-[10px] font-mono">
                        {enc.primaryDiagnosis.code}
                      </span>
                      <p className="font-medium text-slate-900 mt-1">{enc.primaryDiagnosis.name}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{enc.prescriptions.length} jenis obat</p>
                      <p className="text-[11px] text-slate-500">
                        {enc.prescriptions.map((p) => p.drugName).slice(0, 2).join(', ')}
                      </p>
                    </td>
                    <td className="p-3">
                      {enc.enrolledInProlanis && (
                        <span className="inline-block mb-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-100 text-teal-800">
                          Prolanis BPJS
                        </span>
                      )}
                      {enc.referredToHospital && (
                        <span className="inline-block mb-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">
                          Dirujuk ke RSUD
                        </span>
                      )}
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {enc.resolutionOutcome.replace(/_/g, ' ')}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedEncounterDetail(enc)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REFERRALS TO RSUD BOBONG */}
        {activeTab === 'REFERRALS' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{ref.referralLetterNumber}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{ref.citizenName}</h3>
                        <p className="text-xs text-slate-500">Asal: {ref.originFacilityName}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {ref.specialty.replace('SPESIALIS_', 'Spesialis ')}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs">
                      <p className="font-semibold text-slate-800">
                        Diagnosis: [{ref.primaryDiagnosis.code}] {ref.primaryDiagnosis.name}
                      </p>
                      <p className="text-slate-600 mt-1">{ref.reasonForReferral}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Dokter: {ref.doctorName}</span>
                      <span className="font-semibold text-teal-700">Status: {ref.status}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      RSUD: {ref.targetHospitalName}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedReferral(ref);
                        setIsReferralModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buka Surat Rujukan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROLANIS REGISTRY */}
        {activeTab === 'PROLANIS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">No. Kartu Prolanis</th>
                  <th className="p-3">Nama Warga</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Baseline vs Target</th>
                  <th className="p-3">Jadwal Kontrol Berikutnya</th>
                  <th className="p-3">Kepatuhan (%)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prolanisList.map((prol) => (
                  <tr key={prol.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-semibold text-slate-800">
                      {prol.prolanisCardNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{prol.citizenName}</p>
                      <p className="text-[11px] text-slate-500">{prol.villageName} &bull; {prol.facilityName}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 font-semibold rounded bg-teal-100 text-teal-800 text-[10px]">
                        {prol.programType === 'PROLANIS_HT' ? 'Hipertensi (HT)' : 'Diabetes Melitus (DM)'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {prol.baselineSystolicBp && (
                        <p>TD: {prol.baselineSystolicBp}/{prol.baselineDiastolicBp} &rarr; Target &lt; {prol.targetSystolicBp}/{prol.targetDiastolicBp}</p>
                      )}
                      {prol.baselineFastingBloodGlucose && (
                        <p>GDP: {prol.baselineFastingBloodGlucose} &rarr; Target &lt; {prol.targetFastingGlucose}</p>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {prol.nextScheduledControlDate}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${prol.adherenceRatePercent}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-emerald-700">{prol.adherenceRatePercent}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                        {prol.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: CLOSED LOOP ANALYTICS */}
        {activeTab === 'ANALYTICS' && analytics && (
          <div className="p-6 space-y-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Tingkat Resolusi Kasus CKG</span>
                <p className="text-3xl font-extrabold text-teal-900 mt-2">{analytics.resolutionRatePercent}%</p>
                <p className="text-xs text-teal-700 mt-1">
                  {analytics.closedTasks} dari total {analytics.totalTasks} tugas penjangkauan telah ditutup definitif.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Distribusi Hipertensi Terkonfirmasi</span>
                <p className="text-3xl font-extrabold text-blue-900 mt-2">{analytics.hypertensionCount} Kasus</p>
                <p className="text-xs text-blue-700 mt-1">
                  Inisiasi terapi antihipertensi terstandar FKTP.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Distribusi Diabetes Melitus</span>
                <p className="text-3xl font-extrabold text-purple-900 mt-2">{analytics.diabetesCount} Kasus</p>
                <p className="text-xs text-purple-700 mt-1">
                  Terintegrasi pemantauan GDP & HbA1c terpadu.
                </p>
              </div>
            </div>

            {/* End to End Pipeline Visual */}
            <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400">
                Alur Integrasi Layanan CKG (End-to-End Closed Loop Pipeline)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Langkah 1</span>
                  <p className="font-bold text-white mt-1">Skrining CKG Posyandu</p>
                  <p className="text-slate-400 text-[11px] mt-1">Deteksi faktor risiko awal TD & Gula Darah</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Langkah 2</span>
                  <p className="font-bold text-white mt-1">Stratifikasi Risiko AI</p>
                  <p className="text-slate-400 text-[11px] mt-1">Klasifikasi Juknis & Next-Best Action</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Langkah 3</span>
                  <p className="font-bold text-white mt-1">Penjangkauan Kader</p>
                  <p className="text-slate-400 text-[11px] mt-1">Offline PWA & Jadwal Kunjungan Rumah</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/50 bg-teal-950/40">
                  <span className="text-teal-400 text-[10px] block">Langkah 4 (Layanan Klinis)</span>
                  <p className="font-bold text-white mt-1">Konsultasi Dokter FKTP</p>
                  <p className="text-slate-300 text-[11px] mt-1">Lab konfirmasi, EKG & Peresepan Obat</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-emerald-500/50 bg-emerald-950/40">
                  <span className="text-emerald-400 text-[10px] block">Langkah 5 (Rencana Terapi)</span>
                  <p className="font-bold text-white mt-1">Closed-Loop & Prolanis</p>
                  <p className="text-slate-300 text-[11px] mt-1">Penyelesaian tugas & kohort kronis aktif</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Encounter Form Modal */}
      <ClinicalEncounterModal
        isOpen={isEncounterModalOpen}
        onClose={() => {
          setIsEncounterModalOpen(false);
          setSelectedTaskForEncounter(null);
        }}
        task={selectedTaskForEncounter}
        onSave={handleSaveEncounter}
        currentUserId={currentUser?.id || 'usr-dr-01'}
        currentUserName={currentUser?.name || 'dr. Dokter Pemeriksa'}
      />

      {/* Hospital Referral Print & Feedback Modal */}
      {selectedReferral && (
        <HospitalReferralDetailModal
          referral={selectedReferral}
          isOpen={isReferralModalOpen}
          onClose={() => {
            setIsReferralModalOpen(false);
            setSelectedReferral(null);
          }}
          onStatusUpdate={handleUpdateReferralStatus}
        />
      )}

      {/* Encounter Detail Drawer/Modal */}
      {selectedEncounterDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Resume Rekam Medis: {selectedEncounterDetail.citizenName}
                </h3>
                <p className="text-slate-500">ID: {selectedEncounterDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedEncounterDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Diagnosis Utama:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  [{selectedEncounterDetail.primaryDiagnosis.code}] {selectedEncounterDetail.primaryDiagnosis.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="font-semibold text-slate-600">Tanda Vital:</span>
                  <p className="font-mono mt-1">TD: {selectedEncounterDetail.systolicBp}/{selectedEncounterDetail.diastolicBp} mmHg</p>
                  <p className="font-mono">Nadi: {selectedEncounterDetail.heartRate}x/m</p>
                  <p className="font-mono">IMT: {selectedEncounterDetail.bmi} kg/m²</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border">
                  <span className="font-semibold text-slate-600">Pemeriksaan Lab:</span>
                  <p className="font-mono mt-1">GDP: {selectedEncounterDetail.fastingBloodGlucose || '-'} mg/dL</p>
                  <p className="font-mono">HbA1c: {selectedEncounterDetail.hba1c || '-'}%</p>
                  <p className="font-mono">Kolesterol: {selectedEncounterDetail.totalCholesterol || '-'} mg/dL</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Resep Obat yang Diberikan:</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-800">
                  {selectedEncounterDetail.prescriptions.map((p, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{p.drugName} {p.dosage}</span> - {p.frequency} ({p.quantity} tablet)
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-teal-50 rounded border border-teal-200 text-teal-900">
                <span className="font-semibold block">Catatan Resolusi Closed Loop:</span>
                <p className="mt-1">{selectedEncounterDetail.closedLoopNotes}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedEncounterDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
