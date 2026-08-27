import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Shield,
  Activity,
  FileCheck2,
  History,
  Lock,
  Edit3,
  Map,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Appointment,
  CareTask,
  Citizen,
  CitizenAreaHistory,
  CitizenIdentifier,
  ContactAttempt,
  Observation,
  RiskClassification,
  ScreeningResult,
  ScreeningSession,
} from '../../../types';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ClinicalRiskBadge } from '../../../components/common/ClinicalRiskBadge';
import { useModal } from '../../../context/ModalContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { screeningRepo } from '../../../repositories/screeningRepo';
import { classificationRepo } from '../../../repositories/classificationRepo';
import { classificationService } from '../../../services/classificationService';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { appointmentRepo } from '../../../repositories/appointmentRepo';
import { contactAttemptRepo } from '../../../repositories/contactAttemptRepo';
import { rawStorage } from '../../../repositories/storage';
import { auditService } from '../../../services/auditService';
import { AreaChangeModal } from './AreaChangeModal';
import { DataCorrectionModal } from './DataCorrectionModal';
import { ClinicianOverrideModal } from '../../risk/components/ClinicianOverrideModal';
import { StratificationDetailModal } from '../../risk/components/StratificationDetailModal';

interface CitizenDetailDrawerProps {
  citizenId: string;
  onClose: () => void;
  onRefresh: () => void;
}

type TabType =
  | 'OVERVIEW'
  | 'RISIKO'
  | 'CARE_TASK'
  | 'IDENTITAS'
  | 'CKG'
  | 'PENGUKURAN'
  | 'SUMBER_DATA'
  | 'RIWAYAT_WILAYAH'
  | 'AUDIT';

export const CitizenDetailDrawer: React.FC<CitizenDetailDrawerProps> = ({
  citizenId,
  onClose,
  onRefresh,
}) => {
  const { currentUser, isAuthorizedForLevel } = useAuth();
  const { openModal } = useModal();
  const { addToast } = useToast();

  const [citizen, setCitizen] = useState<(Citizen & { identifiers: CitizenIdentifier[] }) | null>(null);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [areaHistories, setAreaHistories] = useState<CitizenAreaHistory[]>([]);
  const [currentClassification, setCurrentClassification] = useState<RiskClassification | undefined>(undefined);
  const [classificationHistory, setClassificationHistory] = useState<RiskClassification[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contactAttempts, setContactAttempts] = useState<ContactAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [isNikMasked, setIsNikMasked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadCitizenData = async () => {
    setIsLoading(true);
    try {
      const data = await citizenRepo.getById(citizenId);
      if (data) {
        setCitizen(data);
        const [cSessions, cResults, cObservations, cAreaHistories, cRiskData, cTasks, cApts, cAtts] = await Promise.all([
          screeningRepo.getSessionsByCitizenId(citizenId),
          screeningRepo.getResultsByCitizenId(citizenId),
          screeningRepo.getObservationsByCitizenId(citizenId),
          citizenRepo.getAreaHistory(citizenId),
          classificationRepo.getByCitizenId(citizenId),
          careTaskRepo.getByCitizenId(citizenId),
          appointmentRepo.getByCitizenId(citizenId),
          contactAttemptRepo.getByCitizenId(citizenId),
        ]);
        setSessions(cSessions);
        setResults(cResults);
        setObservations(cObservations);
        setAreaHistories(cAreaHistories);
        setCurrentClassification(cRiskData.current);
        setClassificationHistory(cRiskData.history);
        setCareTasks(cTasks);
        setAppointments(cApts);
        setContactAttempts(cAtts);
        if (cSessions.length > 0) {
          setExpandedSessionId(cSessions[0].id);
        }

        // Log audit for viewing citizen profile
        if (currentUser) {
          await auditService.log(currentUser, 'VIEW', 'CITIZEN', {
            targetLabel: data.fullName,
            citizenId: data.id,
            purposeCode: 'PATIENT_LONGITUDINAL_LOOKUP',
            facilityId: data.facilityId,
            facilityName: data.facilityName,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load citizen data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!currentUser || !citizen) return;
    setIsEvaluating(true);
    try {
      await classificationService.evaluateCitizen(citizen.id, currentUser);
      addToast(
        'Evaluasi Risiko Selesai',
        'success',
        `Klasifikasi risiko untuk ${citizen.fullName} berhasil dievaluasi ulang.`
      );
      await loadCitizenData();
      onRefresh();
    } catch (err: any) {
      console.error('Evaluation error:', err);
      addToast(
        'Evaluasi Gagal',
        'error',
        err.message || 'Gagal mengevaluasi risiko warga.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    loadCitizenData();
  }, [citizenId]);

  if (isLoading || !citizen) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-white shadow-2xl border-l border-[#D8E5E2] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#00201C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#60716D]">Memuat profil longitudinal warga...</p>
        </div>
      </div>
    );
  }

  const primaryNik = citizen.identifiers.find((i) => i.identifierType === 'NIK')?.identifierValue || '—';
  const displayNik = isNikMasked && primaryNik.length >= 10
    ? `${primaryNik.slice(0, 4)}********${primaryNik.slice(-4)}`
    : primaryNik;

  const age = citizen.birthDate
    ? new Date().getFullYear() - new Date(citizen.birthDate).getFullYear()
    : '—';

  const consents = rawStorage.getConsents().filter((c) => c.citizenId === citizen.id || c.citizenNik === primaryNik);
  const activeConsent = consents.find((c) => c.status === 'ACTIVE');

  const auditEvents = rawStorage.getAuditLogs().filter((a) => a.citizenId === citizen.id);

  const handleOpenAreaChange = () => {
    openModal({
      title: 'Konfirmasi Perpindahan Wilayah',
      subtitle: `Warga: ${citizen.fullName} (${citizen.id})`,
      size: 'md',
      content: ({ closeModal }) => (
        <AreaChangeModal
          citizen={citizen}
          closeModal={closeModal}
          onSuccess={() => {
            loadCitizenData();
            onRefresh();
          }}
        />
      ),
    });
  };

  const handleOpenDataCorrection = () => {
    openModal({
      title: 'Catat Koreksi Data Lokal',
      subtitle: `Warga: ${citizen.fullName} (${citizen.id})`,
      size: 'md',
      content: ({ closeModal }) => (
        <DataCorrectionModal
          citizen={citizen}
          closeModal={closeModal}
          onSuccess={() => {
            loadCitizenData();
            onRefresh();
          }}
        />
      ),
    });
  };

  const handleFutureTabClick = (title: string, phase: string = 'Tahap Lanjut') => {
    openModal({
      title: `${title}`,
      subtitle: 'Fitur Tahap Berikutnya (Roadmap Terencana)',
      size: 'sm',
      content: ({ closeModal }) => (
        <div className="space-y-3">
          <div className="p-3 bg-[#E1F5FE] border border-[#BDE3F5] rounded-xl text-xs text-black flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#397B94] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tersedia pada {phase}</p>
              <p className="text-[11px] text-[#334643] mt-0.5">
                Modul ini memerlukan engine stratifikasi risiko atau orkestrasi tugas tindak lanjut.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={closeModal}>
              Saya Mengerti
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] flex justify-end">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#D8E5E2] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between border-b border-[#00332D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">{citizen.fullName}</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#00332D] text-emerald-300 rounded">
                  {citizen.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {citizen.sex === 'MALE' ? 'Laki-laki' : 'Perempuan'} • {age} tahun • Desa {citizen.villageName || '—'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#002D27] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#D8E5E2] bg-[#F8FBFA] overflow-x-auto text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('RISIKO')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RISIKO'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Risiko & Rekomendasi</span>
            {currentClassification && (
              <span className="text-[10px] px-1.5 py-0.2 bg-[#00201C] text-white rounded font-mono">
                {currentClassification.finalCategory}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('IDENTITAS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'IDENTITAS'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Identitas
          </button>
          <button
            onClick={() => setActiveTab('CKG')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CKG'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Sesi CKG
            <span className="text-[10px] px-1.5 py-0.2 bg-[#2E7D5B] text-white rounded-full">
              {sessions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('PENGUKURAN')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PENGUKURAN'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Riwayat Pengukuran
          </button>
          <button
            onClick={() => setActiveTab('SUMBER_DATA')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'SUMBER_DATA'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Sumber Data
          </button>
          <button
            onClick={() => setActiveTab('RIWAYAT_WILAYAH')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'RIWAYAT_WILAYAH'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Riwayat Wilayah
          </button>
          <button
            onClick={() => setActiveTab('CARE_TASK')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CARE_TASK'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            <span>Tugas & Janji Temu</span>
            {careTasks.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-[#2E7D5B] text-white rounded-full">
                {careTasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'AUDIT'
                ? 'bg-[#00201C] text-white shadow-2xs'
                : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
            }`}
          >
            Audit
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                  <span className="text-[10px] font-bold text-[#60716D] uppercase block">Nomor NIK</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xs font-bold text-black">{displayNik}</span>
                    {isAuthorizedForLevel('S1') && (
                      <button
                        onClick={() => setIsNikMasked(!isNikMasked)}
                        className="text-[#60716D] hover:text-black p-0.5 cursor-pointer"
                        title={isNikMasked ? 'Buka masking NIK' : 'Tutup NIK'}
                      >
                        {isNikMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                  <span className="text-[10px] font-bold text-[#60716D] uppercase block">Wilayah Faskes</span>
                  <p className="text-xs font-bold text-black mt-1 truncate">{citizen.facilityName || '—'}</p>
                  <p className="text-[11px] text-[#60716D]">Desa {citizen.villageName || '—'}</p>
                </div>

                <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                  <span className="text-[10px] font-bold text-[#60716D] uppercase block">Total Skrining CKG</span>
                  <p className="text-sm font-bold text-[#2E7D5B] mt-1">{sessions.length} Sesi Terdaftar</p>
                  <p className="text-[11px] text-[#60716D]">
                    {sessions[0]
                      ? `Terakhir: ${new Date(sessions[0].screenedAt).toLocaleDateString('id-ID')}`
                      : 'Belum ada skrining'}
                  </p>
                </div>
              </div>

              {/* Consent & Data Freshness Status */}
              <div className="p-4 bg-[#E1F5FE] rounded-xl border border-[#BDE3F5] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#397B94]" />
                    <h4 className="text-xs font-bold text-black">Dasar Pemrosesan & Persetujuan (Consent)</h4>
                  </div>
                  <Badge variant={activeConsent ? 'success' : 'neutral'} size="sm">
                    {activeConsent ? 'Persetujuan Aktif' : 'Dasar Hukum Programatik'}
                  </Badge>
                </div>
                <p className="text-xs text-[#334643]">
                  Warga memenuhi kriteria pemrosesan data tindak lanjut skrining kesehatan masyarakat terpadu.
                </p>
              </div>

              {/* Latest CKG Summary Snapshot */}
              {sessions.length > 0 ? (
                <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2">
                    <span className="text-xs font-bold text-black">Ringkasan Pemeriksaan Terakhir</span>
                    <Badge variant={sessions[0].isComplete ? 'success' : 'warning'} size="sm">
                      {sessions[0].isComplete ? 'Lengkap (Complete)' : 'Sebagian (Incomplete)'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="text-[10px] text-[#60716D] block">Tekanan Darah</span>
                      <span className="font-bold text-black text-sm">
                        {results.find((r) => r.sessionId === sessions[0].id && r.measureCode === 'BP_SYSTOLIC')?.valueNumeric || '—'} /{' '}
                        {results.find((r) => r.sessionId === sessions[0].id && r.measureCode === 'BP_DIASTOLIC')?.valueNumeric || '—'}
                      </span>
                      <span className="text-[10px] text-[#60716D] block">mmHg</span>
                    </div>

                    <div className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="text-[10px] text-[#60716D] block">Gula Darah Sewaktu</span>
                      <span className="font-bold text-black text-sm">
                        {results.find((r) => r.sessionId === sessions[0].id && r.measureCode === 'RANDOM_GLUCOSE')?.valueNumeric || '—'}
                      </span>
                      <span className="text-[10px] text-[#60716D] block">mg/dL</span>
                    </div>

                    <div className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="text-[10px] text-[#60716D] block">IMT (Indeks Massa Tubuh)</span>
                      <span className="font-bold text-black text-sm">
                        {results.find((r) => r.sessionId === sessions[0].id && r.measureCode === 'BMI')?.valueNumeric || '—'}
                      </span>
                      <span className="text-[10px] text-[#60716D] block">kg/m²</span>
                    </div>

                    <div className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="text-[10px] text-[#60716D] block">Lingkar Perut</span>
                      <span className="font-bold text-black text-sm">
                        {results.find((r) => r.sessionId === sessions[0].id && r.measureCode === 'WAIST_CIRCUMFERENCE')?.valueNumeric || '—'}
                      </span>
                      <span className="text-[10px] text-[#60716D] block">cm</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#60716D] italic">
                    Sumber data: {sessions[0].sourceSystem} • Tanggal Skrining:{' '}
                    {new Date(sessions[0].screenedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-center">
                  <p className="text-xs text-[#60716D]">Belum ada data pemeriksaan skrining CKG untuk warga ini.</p>
                </div>
              )}

              {/* Risk Stratification Snapshot in Overview */}
              <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#2E7D5B]" />
                    <span className="text-xs font-bold text-black">Stratifikasi Risiko Klinis</span>
                  </div>
                  {currentClassification ? (
                    <ClinicalRiskBadge
                      category={currentClassification.finalCategory}
                      stage={currentClassification.classificationStage}
                      isCritical={currentClassification.isCritical}
                      size="sm"
                      showStage
                    />
                  ) : (
                    <Badge variant="neutral" size="sm">Belum Dievaluasi</Badge>
                  )}
                </div>

                {currentClassification ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-[#F8FBFA] p-2.5 rounded-lg border border-[#D8E5E2]">
                      <span className="text-[#60716D]">Kluster Multimorbiditas:</span>
                      <span className="font-bold text-black">
                        {currentClassification.clusterLabel || 'Faktor Tunggal / Tidak Ada'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F8FBFA] p-2.5 rounded-lg border border-[#D8E5E2]">
                      <span className="text-[#60716D]">Skor Prioritas Operasional:</span>
                      <span className="font-mono font-bold text-sm text-black">
                        {currentClassification.priorityScore} / 100
                      </span>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setActiveTab('RISIKO')}
                        className="text-[#2E7D5B] font-semibold"
                      >
                        Buka Tab Risiko Lengkap →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs text-center text-[#60716D]">
                    Warga ini belum memiliki stratifikasi risiko terdaftar.
                  </div>
                )}
              </div>

              {/* Action Buttons for Authorized Roles */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDataCorrection}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Catat Koreksi Lokal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAreaChange}
                  leftIcon={<Map className="w-3.5 h-3.5" />}
                >
                  Pindah Wilayah
                </Button>
              </div>
            </div>
          )}

          {/* TAB: RISIKO & REKOMENDASI */}
          {activeTab === 'RISIKO' && (
            <div className="space-y-5">
              {/* Header Action Bar */}
              <div className="flex items-center justify-between p-3.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                    Engine Klasifikasi Aktif
                  </span>
                  <p className="text-xs font-bold text-black mt-0.5">
                    CRS-CKG v0.9 (Deterministik)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="text-xs"
                  >
                    {isEvaluating ? 'Mengevaluasi...' : 'Evaluasi Ulang'}
                  </Button>

                  {currentClassification && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        openModal({
                          title: 'Jejak Keputusan Stratifikasi Risiko & NBA',
                          subtitle: `${citizen.fullName} • ${citizen.id}`,
                          size: 'lg',
                          content: ({ closeModal }) => (
                            <StratificationDetailModal
                              classification={currentClassification}
                              closeModal={closeModal}
                              onRefresh={loadCitizenData}
                            />
                          ),
                        });
                      }}
                      className="text-xs bg-[#00201C] text-white"
                    >
                      Jejak & Audit Teknis
                    </Button>
                  )}
                </div>
              </div>

              {currentClassification ? (
                <div className="space-y-4">
                  {/* Current Active Stratification Card */}
                  <div className="p-4 bg-white border border-[#D8E5E2] rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E5E2] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                          Klasifikasi Terkini
                        </span>
                        <div className="mt-1">
                          <ClinicalRiskBadge
                            category={currentClassification.finalCategory}
                            stage={currentClassification.classificationStage}
                            isCritical={currentClassification.isCritical}
                            size="md"
                            showStage
                          />
                        </div>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                          Skor Prioritas Operasional
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                          <span className="text-lg font-bold font-mono text-black">
                            {currentClassification.priorityScore}
                          </span>
                          <span className="text-xs text-[#60716D]">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Override Banner if present */}
                    {currentClassification.overriddenByUserName && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-amber-900">
                          Keputusan Override Dokter: {currentClassification.overriddenByUserName}
                        </p>
                        <p className="text-[11px] text-amber-800 italic">
                          "{currentClassification.overrideReason}"
                        </p>
                      </div>
                    )}

                    {/* 5 Domains Evaluation Grid */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-black uppercase tracking-wider block">
                        Hasil Evaluasi 5 Domain Klinis:
                      </span>
                      <div className="space-y-2">
                        {currentClassification.domainResults.map((dom) => (
                          <div
                            key={dom.domain}
                            className="p-3 rounded-xl border border-[#D8E5E2] bg-[#F8FBFA] flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="px-2 py-0.5 bg-[#00201C] text-white font-mono font-bold rounded text-[11px]">
                                {dom.domain}
                              </span>
                              <div>
                                <span className="font-bold text-black block">
                                  {dom.domainName}
                                </span>
                                <p className="text-[11px] text-[#60716D] mt-0.5">
                                  {dom.reason}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {dom.category ? (
                                <ClinicalRiskBadge category={dom.category} size="xs" />
                              ) : dom.status === 'NOT_EVALUATED_OPEN_RULE' ? (
                                <Badge variant="neutral" size="sm">
                                  Open ({dom.openIssueCode})
                                </Badge>
                              ) : (
                                <Badge variant="neutral" size="sm">
                                  Data Kurang
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Best Actions (NBA) */}
                  <div className="p-4 bg-white border border-[#D8E5E2] rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2">
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                        Rekomendasi Tindakan (Next-Best-Action)
                      </h4>
                      <span className="text-[10px] text-[#60716D]">
                        {currentClassification.nextBestActions.length} Rekomendasi
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#E1F5FE]/50 border border-[#BDE3F5] rounded-xl text-[11px] text-black">
                      Rekomendasi tindakan belum menjadi penugasan. Alur penugasan (CareTask) akan dibentuk pada modul Care Orchestration.
                    </div>

                    <div className="space-y-2">
                      {currentClassification.nextBestActions.map((nba, idx) => (
                        <div
                          key={nba.id || idx}
                          className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-black">{nba.actionType}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-[#D8E5E2] rounded text-[#60716D]">
                              {nba.sourceRuleCode}
                            </span>
                          </div>
                          <p className="text-[#334643] text-[11px]">{nba.actionText}</p>
                          <div className="flex items-center gap-3 text-[10px] text-[#60716D] pt-1">
                            <span>Peran Rekomendasi: <strong className="text-black">{nba.suggestedRole}</strong></span>
                            {nba.intervalValue && (
                              <span>Interval: <strong className="text-black">{nba.intervalValue} {nba.intervalUnit}</strong></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Longitudinal History */}
                  {classificationHistory.length > 1 && (
                    <div className="p-4 bg-[#F8FBFA] border border-[#D8E5E2] rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                        Riwayat Stratifikasi Warga ({classificationHistory.length})
                      </h4>
                      <div className="space-y-1.5">
                        {classificationHistory.map((hist) => (
                          <div
                            key={hist.id}
                            className="p-2.5 bg-white rounded-xl border border-[#D8E5E2] flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <ClinicalRiskBadge category={hist.finalCategory} size="xs" />
                                {hist.supersededById && (
                                  <Badge variant="neutral" size="sm">Tergantikan</Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-[#60716D] mt-0.5 block">
                                {new Date(hist.createdAt).toLocaleString('id-ID')} • {hist.ruleVersion}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-black">
                              Skor: {hist.priorityScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-[#F8FBFA] rounded-2xl border border-[#D8E5E2] text-center space-y-3">
                  <Activity className="w-8 h-8 mx-auto text-slate-400" />
                  <div>
                    <p className="font-bold text-xs text-black">
                      Belum Ada Klasifikasi Risiko untuk Warga Ini
                    </p>
                    <p className="text-[11px] text-[#60716D] mt-0.5">
                      Jalankan evaluasi aturan CRS-CKG v0.9 untuk membentuk klasifikasi risiko dan rekomendasi tindakan.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="bg-[#00201C] text-white mx-auto"
                  >
                    {isEvaluating ? 'Mengevaluasi...' : 'Jalankan Evaluasi Sekarang'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IDENTITAS */}
          {activeTab === 'IDENTITAS' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                <h4 className="text-xs font-bold text-black border-b border-[#D8E5E2] pb-2">
                  Data Kependudukan (S1 Identity)
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Nama Lengkap</span>
                    <span className="font-bold text-black">{citizen.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Tanggal Lahir / Usia</span>
                    <span className="font-semibold text-black">
                      {citizen.birthDate} ({age} tahun)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Jenis Kelamin</span>
                    <span className="font-semibold text-black">
                      {citizen.sex === 'MALE' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Status Vital</span>
                    <Badge variant={citizen.vitalStatus === 'ALIVE' ? 'success' : 'danger'} size="sm">
                      {citizen.vitalStatus === 'ALIVE' ? 'Hidup' : 'Meninggal'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Nomor Telepon Primer</span>
                    <span className="font-mono text-black">{citizen.phonePrimary || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Alamat Domisili</span>
                    <span className="text-black">{citizen.addressText || `Desa ${citizen.villageName}`}</span>
                  </div>
                </div>
              </div>

              {/* Identifiers List */}
              <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                <h4 className="text-xs font-bold text-black border-b border-[#D8E5E2] pb-2">
                  Daftar Identifikator Eksternal
                </h4>

                <div className="space-y-2">
                  {citizen.identifiers.map((ident) => (
                    <div
                      key={ident.id}
                      className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-black">{ident.identifierValue}</span>
                        <span className="text-[11px] text-[#60716D] block">
                          Tipe: {ident.identifierType} • Sumber: {ident.sourceSystem}
                        </span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        VALID
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SESI CKG */}
          {activeTab === 'CKG' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black">Riwayat Sesi Skrining CKG ({sessions.length})</h4>
              </div>

              <div className="space-y-3">
                {sessions.map((ses) => {
                  const isExpanded = expandedSessionId === ses.id;
                  const sessionResults = results.filter((r) => r.sessionId === ses.id);

                  return (
                    <div
                      key={ses.id}
                      className="bg-white rounded-xl border border-[#D8E5E2] overflow-hidden shadow-2xs"
                    >
                      <div
                        onClick={() => setExpandedSessionId(isExpanded ? null : ses.id)}
                        className="p-3.5 bg-[#F8FBFA] hover:bg-[#F0F5F4] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-black">
                              {new Date(ses.screenedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            <Badge variant="neutral" size="sm">
                              {ses.venueType}
                            </Badge>
                            <Badge variant={ses.isComplete ? 'success' : 'warning'} size="sm">
                              {ses.isComplete ? 'Lengkap' : 'Belum Lengkap'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#60716D]">
                            {ses.facilityName || 'Faskes'} • Sumber: {ses.sourceSystem} (ID: {ses.sourceRecordId || ses.id})
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#60716D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#60716D]" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-[#D8E5E2] space-y-3">
                          <span className="text-xs font-bold text-[#60716D] uppercase">Hasil Pengukuran Sesi</span>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-[#D8E5E2] text-left text-[11px] text-[#60716D]">
                                  <th className="pb-1.5">Parameter Pemeriksaan</th>
                                  <th className="pb-1.5 text-right">Nilai Hasil</th>
                                  <th className="pb-1.5">Satuan</th>
                                  <th className="pb-1.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#D8E5E2]/60">
                                {sessionResults.map((res) => (
                                  <tr key={res.id}>
                                    <td className="py-2 font-medium text-black">{res.measureName || res.measureCode}</td>
                                    <td className="py-2 text-right font-mono font-bold text-black">
                                      {res.valueNumeric ?? res.valueCode ?? '—'}
                                    </td>
                                    <td className="py-2 text-[#60716D] pl-2">{res.unit || '—'}</td>
                                    <td className="py-2 text-center">
                                      {res.isAnomalous ? (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-[#FFFACD] text-[#C99720] rounded font-bold">
                                          Anomali
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-[#2E7D5B] font-semibold">Normal</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RIWAYAT PENGUKURAN */}
          {activeTab === 'PENGUKURAN' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2">
                  <h4 className="text-xs font-bold text-black">Tabel Riwayat Longitudinal Seluruh Pengukuran</h4>
                  <span className="text-[11px] text-[#60716D]">Total: {results.length} Catatan</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#D8E5E2] text-left text-[11px] text-[#60716D]">
                        <th className="pb-2">Tanggal</th>
                        <th className="pb-2">Parameter</th>
                        <th className="pb-2 text-right">Nilai</th>
                        <th className="pb-2">Satuan</th>
                        <th className="pb-2">Sumber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8E5E2]/60">
                      {results.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2 font-mono text-[11px] text-[#60716D]">
                            {new Date(r.measuredAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-2 font-medium text-black">{r.measureName || r.measureCode}</td>
                          <td className="py-2 text-right font-mono font-bold text-black">
                            {r.valueNumeric ?? r.valueCode}
                          </td>
                          <td className="py-2 text-[#60716D] pl-2">{r.unit || '—'}</td>
                          <td className="py-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#E1F5FE] text-black rounded border border-[#BDE3F5]">
                              {r.sourceSystem}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUMBER DATA */}
          {activeTab === 'SUMBER_DATA' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
                <h4 className="text-xs font-bold text-black border-b border-[#D8E5E2] pb-2">
                  Asal Usul Data (Data Provenance & Lineage)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                    <span className="text-[10px] font-bold text-[#60716D] uppercase block">Sistem Sumber Primer</span>
                    <p className="font-bold text-black mt-0.5">SSI / ASIK Kemenkes RI (Simulasi Integrasi)</p>
                    <p className="text-[11px] text-[#60716D] mt-1">
                      Catatan ini merupakan salinan operasional yang disinkronkan untuk kebutuhan orkestrasi tindak lanjut intervensi di Kabupaten Pulau Taliabu.
                    </p>
                  </div>

                  <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                    <span className="text-[10px] font-bold text-[#60716D] uppercase block">Waktu Pembuatan & Update</span>
                    <p className="text-xs text-black mt-0.5">
                      Dibuat pada: {new Date(citizen.createdAt).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-black">
                      Terakhir diperbarui: {new Date(citizen.updatedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RIWAYAT WILAYAH */}
          {activeTab === 'RIWAYAT_WILAYAH' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black">Riwayat Kepemilikan & Wilayah Kerja</h4>
                <Button variant="outline" size="sm" onClick={handleOpenAreaChange}>
                  + Pindah Wilayah
                </Button>
              </div>

              <div className="space-y-2">
                {areaHistories.map((ah) => (
                  <div key={ah.id} className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">
                        Desa {ah.villageName} ({ah.facilityName})
                      </span>
                      <Badge variant={ah.validTo ? 'neutral' : 'success'} size="sm">
                        {ah.validTo ? 'Riwayat Lampau' : 'Wilayah Aktif'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#60716D]">
                      Periode: {new Date(ah.validFrom).toLocaleDateString('id-ID')} s/d{' '}
                      {ah.validTo ? new Date(ah.validTo).toLocaleDateString('id-ID') : 'Sekarang'}
                    </p>
                    {ah.changeReason && (
                      <p className="text-xs text-black bg-[#F8FBFA] p-2 rounded border border-[#D8E5E2] mt-1">
                        <strong>Alasan:</strong> {ah.changeReason}
                      </p>
                    )}
                    {ah.confirmedByUserName && (
                      <p className="text-[10px] text-[#60716D]">Dikonfirmasi oleh: {ah.confirmedByUserName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CARE TASK & APPOINTMENTS */}
          {activeTab === 'CARE_TASK' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-black">Daftar Tugas Tindak Lanjut (Care Tasks)</h4>
                <span className="text-xs text-[#60716D] font-medium">{careTasks.length} Tugas Tercatat</span>
              </div>

              {careTasks.length === 0 ? (
                <div className="p-6 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-center text-xs text-[#60716D]">
                  Belum ada Care Task aktif atau riwayat tindak lanjut untuk warga ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {careTasks.map((t) => (
                    <div key={t.id} className="p-4 bg-white rounded-xl border border-[#D8E5E2] space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-black bg-[#E1F5FE] px-2 py-0.5 rounded">
                            {t.id}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              t.status === 'CLOSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'CANCELLED'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.status}
                          </span>
                          {t.isCritical && (
                            <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                              KRITIS
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#60716D]">
                          Batas: <strong>{new Date(t.dueAt).toLocaleDateString('id-ID')}</strong>
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-black leading-relaxed">{t.actionText}</p>

                      <div className="pt-2 border-t border-[#D8E5E2] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#60716D]">
                        <span>Tipe: <strong className="text-black">{t.taskType}</strong></span>
                        <span>
                          Petugas:{' '}
                          <strong className={t.assignedToUserName ? 'text-black' : 'text-amber-700'}>
                            {t.assignedToUserName || 'Belum Ditugaskan'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Appointments Section */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-black mb-2.5">Riwayat Janji Temu Terjadwal</h4>
                {appointments.length === 0 ? (
                  <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-center text-xs text-[#60716D]">
                    Belum ada janji temu tercatat.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-3 bg-white rounded-xl border border-[#D8E5E2] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-black">{apt.serviceType}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#60716D]">
                          Tanggal: <strong>{apt.scheduledDate}</strong> ({apt.scheduledTime}) · {apt.facilityName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outreach Contact Attempts Section */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-black mb-2.5">Kronologi Kontak Outreach</h4>
                {contactAttempts.length === 0 ? (
                  <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-center text-xs text-[#60716D]">
                    Belum ada riwayat kontak tercatat.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactAttempts.map((att) => (
                      <div key={att.id} className="p-3 bg-white rounded-xl border border-[#D8E5E2] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-black">{att.channel}</span>
                          <span className="text-[11px] text-[#60716D]">
                            {new Date(att.attemptedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#334643]">
                          Hasil: <strong>{att.outcome}</strong> {att.notes && `— ${att.notes}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-black">Jejak Audit Akses & Perubahan Data Warga</h4>
              <div className="space-y-2">
                {auditEvents.length > 0 ? (
                  auditEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-white rounded-xl border border-[#D8E5E2] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">{evt.action}</span>
                        <span className="font-mono text-[10px] text-[#60716D]">
                          {new Date(evt.occurredAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#60716D]">
                        Oleh: <strong>{evt.actorName}</strong> ({evt.actorRole}) • Tujuan: {evt.purposeCode || 'Akses Profil'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#60716D] p-4 bg-[#F8FBFA] rounded-xl text-center">
                    Belum ada riwayat audit spesifik untuk warga ini.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#F8FBFA] border-t border-[#D8E5E2] flex items-center justify-between">
          <span className="text-xs text-[#60716D]">Profil Longitudinal CKG • Kabupaten Pulau Taliabu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
