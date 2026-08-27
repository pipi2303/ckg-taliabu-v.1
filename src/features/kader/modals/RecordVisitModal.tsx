import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldAlert,
  Home,
  UserX,
  MapPinOff,
  Clock,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { fieldVisitService } from '../../../services/fieldVisitService';
import {
  DeclineDelayReason,
  FieldVisit,
  FieldVisitOutcome,
  KaderAssignmentPayload,
} from '../../../types';
import { DeclineReasonModal } from './DeclineReasonModal';
import { AssistSchedulingModal } from './AssistSchedulingModal';
import { UrgentObservationModal } from './UrgentObservationModal';

interface RecordVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: KaderAssignmentPayload;
  onVisitSaved: (visit: FieldVisit) => void;
}

export const RecordVisitModal: React.FC<RecordVisitModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onVisitSaved,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [currentVisit, setCurrentVisit] = useState<FieldVisit | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<FieldVisitOutcome | null>(null);
  const [declineReasons, setDeclineReasons] = useState<DeclineDelayReason[]>([]);
  const [notes, setNotes] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Submodals
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'MOVED_AWAY' | 'DECEASED' | null>(null);

  useEffect(() => {
    if (isOpen && assignment) {
      const existing = fieldVisitService.getLocalVisitForTask(assignment.taskId);
      if (existing) {
        setCurrentVisit(existing);
        setSelectedOutcome(existing.outcome);
        setDeclineReasons(existing.declineReasons || []);
        setNotes(existing.notes || '');
        setLastSavedTime(existing.deviceRecordedAt);
      } else {
        setSelectedOutcome(null);
        setDeclineReasons([]);
        setNotes('');
        setLastSavedTime(null);
      }
    }
  }, [isOpen, assignment]);

  if (!isOpen) return null;

  // Immediate autosave handler
  const triggerAutoSave = (
    outcome: FieldVisitOutcome,
    reasons: DeclineDelayReason[] = declineReasons,
    noteText: string = notes
  ) => {
    if (!currentUser) return;

    const visit = fieldVisitService.recordVisit({
      packageId: `pkg-${currentUser.id}`,
      taskId: assignment.taskId,
      citizenId: assignment.citizenId,
      citizenName: assignment.citizenName,
      userId: currentUser.id,
      userName: currentUser.name,
      outcome,
      declineReasons: reasons,
      notes: noteText,
    });

    setCurrentVisit(visit);
    setSelectedOutcome(outcome);
    setLastSavedTime(visit.deviceRecordedAt);
    onVisitSaved(visit);
  };

  const handleOutcomeSelect = (outcome: FieldVisitOutcome) => {
    // 1-step explicit confirmation for high-consequence states
    if (outcome === 'MOVED_AWAY' || outcome === 'DECEASED') {
      setConfirmationType(outcome);
      return;
    }

    triggerAutoSave(outcome);

    if (outcome === 'DECLINED' || outcome === 'POSTPONED') {
      setIsDeclineModalOpen(true);
    }
  };

  const handleConfirmConsequence = () => {
    if (!confirmationType) return;
    triggerAutoSave(confirmationType);
    setConfirmationType(null);
    toast.info('Status Tersimpan', `Catatan kunjungan (${confirmationType}) telah disimpan di gawai.`);
  };

  const handleDeclineReasonsSave = (reasons: DeclineDelayReason[], noteText?: string) => {
    setDeclineReasons(reasons);
    if (noteText !== undefined) setNotes(noteText);
    if (selectedOutcome) {
      triggerAutoSave(selectedOutcome, reasons, noteText || notes);
    }
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (selectedOutcome) {
      triggerAutoSave(selectedOutcome, declineReasons, val);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop - Clicking outside closes safely (autosave keeps work!) */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

        {/* Modal Sheet */}
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#D8E5E2] max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold">Catat Hasil Kunjungan (C01)</h3>
              <p className="text-[10px] text-slate-300 truncate max-w-[240px]">
                {assignment.citizenName} — {assignment.villageName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Autosave Status Banner */}
          <div className="bg-[#EBF7F2] px-3.5 py-1.5 border-b border-[#D8E5E2] text-xs flex items-center justify-between shrink-0">
            <span className="text-[11px] font-semibold text-[#2E7D5B] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {selectedOutcome ? 'Tersimpan di perangkat' : 'Pilih hasil kunjungan'}
            </span>
            <span className="text-[10px] text-[#60716D]">
              {lastSavedTime
                ? new Date(lastSavedTime).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Luring siap'}
            </span>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
            {/* Operational Action Info (S2 Only - No S3/S4) */}
            <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <p className="text-[10px] font-bold text-[#60716D] uppercase">Tindakan Lapangan</p>
              <p className="text-xs font-semibold text-black mt-0.5">{assignment.actionText}</p>
              <p className="text-[11px] text-[#60716D] mt-1">{assignment.addressText}</p>
            </div>

            {/* Large 48px Touch Outcome Buttons */}
            <div>
              <label className="block text-[11px] font-bold text-black mb-1.5">
                Pilih Hasil Kunjungan:
              </label>

              <div className="space-y-1.5">
                {/* 1. Ditemui & Bersedia */}
                <button
                  type="button"
                  onClick={() => handleOutcomeSelect('AGREED_TO_ATTEND')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedOutcome === 'AGREED_TO_ATTEND'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        selectedOutcome === 'AGREED_TO_ATTEND' ? 'text-emerald-700' : 'text-[#60716D]'
                      }`}
                    />
                    <span className="text-xs">Ditemui & Bersedia Hadir</span>
                  </div>
                  {selectedOutcome === 'AGREED_TO_ATTEND' && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      Aktif
                    </span>
                  )}
                </button>

                {/* 2. Menunda */}
                <button
                  type="button"
                  onClick={() => handleOutcomeSelect('POSTPONED')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedOutcome === 'POSTPONED'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-2xs'
                      : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock
                      className={`w-5 h-5 ${
                        selectedOutcome === 'POSTPONED' ? 'text-amber-700' : 'text-[#60716D]'
                      }`}
                    />
                    <div>
                      <span className="text-xs">Menunda Kunjungan</span>
                      {declineReasons.length > 0 && selectedOutcome === 'POSTPONED' && (
                        <p className="text-[10px] text-amber-800 font-normal">
                          {declineReasons.length} kendala dicatat
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold underline">
                    {declineReasons.length > 0 ? 'Ubah Alasan' : 'Pilih Alasan'}
                  </span>
                </button>

                {/* 3. Menolak */}
                <button
                  type="button"
                  onClick={() => handleOutcomeSelect('DECLINED')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedOutcome === 'DECLINED'
                      ? 'bg-red-50 border-red-600 text-red-950 font-bold shadow-2xs'
                      : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserX
                      className={`w-5 h-5 ${
                        selectedOutcome === 'DECLINED' ? 'text-red-700' : 'text-[#60716D]'
                      }`}
                    />
                    <div>
                      <span className="text-xs">Menolak Pemeriksaan</span>
                      {declineReasons.length > 0 && selectedOutcome === 'DECLINED' && (
                        <p className="text-[10px] text-red-800 font-normal">
                          {declineReasons.length} alasan dicatat
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-red-800 font-semibold underline">
                    {declineReasons.length > 0 ? 'Ubah Alasan' : 'Pilih Alasan'}
                  </span>
                </button>

                {/* 4. Tidak di Rumah */}
                <button
                  type="button"
                  onClick={() => handleOutcomeSelect('NOT_AT_HOME')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedOutcome === 'NOT_AT_HOME'
                      ? 'bg-slate-100 border-slate-700 text-slate-900 font-bold shadow-2xs'
                      : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-5 h-5 text-[#60716D]" />
                    <span className="text-xs">Tidak Ada di Rumah</span>
                  </div>
                </button>

                {/* 5. Alamat Tidak Ditemukan */}
                <button
                  type="button"
                  onClick={() => handleOutcomeSelect('ADDRESS_NOT_FOUND')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedOutcome === 'ADDRESS_NOT_FOUND'
                      ? 'bg-slate-100 border-slate-700 text-slate-900 font-bold shadow-2xs'
                      : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPinOff className="w-5 h-5 text-[#60716D]" />
                    <span className="text-xs">Alamat Tidak Ditemukan</span>
                  </div>
                </button>

                {/* Consequential items: Pindah / Meninggal */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOutcomeSelect('MOVED_AWAY')}
                    className={`min-h-[44px] p-2 rounded-xl border text-center text-xs cursor-pointer ${
                      selectedOutcome === 'MOVED_AWAY'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white border-[#D8E5E2] text-[#60716D] hover:bg-[#F8FBFA]'
                    }`}
                  >
                    Pindah Domisili
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOutcomeSelect('DECEASED')}
                    className={`min-h-[44px] p-2 rounded-xl border text-center text-xs cursor-pointer ${
                      selectedOutcome === 'DECEASED'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white border-[#D8E5E2] text-[#60716D] hover:bg-[#F8FBFA]'
                    }`}
                  >
                    Warga Meninggal
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions: Bantu Jadwalkan & Eskalasi Mendesak */}
            <div className="pt-2 border-t border-[#D8E5E2] space-y-2">
              <label className="block text-[11px] font-bold text-black">Aksi Pendukung:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="min-h-[44px] p-2 bg-[#E1F5FE] text-black border border-[#00201C]/20 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#D8E5E2] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-black" />
                  <span>Bantu Jadwal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrgentModalOpen(true)}
                  className="min-h-[44px] p-2 bg-red-50 text-red-800 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Kondisi Mendesak</span>
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-black mb-1">
                Catatan Kunjungan (Opsional):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Catatan tambahan lokasi / respon warga..."
                className="w-full p-2.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-1 focus:ring-[#00201C] outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-[#F8FBFA] border-t border-[#D8E5E2] shrink-0 flex items-center justify-between">
            <span className="text-[11px] text-[#60716D]">
              Otomatis tersimpan di perangkat
            </span>
            <button
              onClick={onClose}
              className="min-h-[44px] px-6 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Consequential Actions (MOVED / DECEASED) */}
      {confirmationType && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setConfirmationType(null)}
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl z-10 space-y-4 border border-[#D8E5E2]">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Konfirmasi Informasi</span>
            </div>
            <p className="text-xs text-[#334643] leading-relaxed">
              Pastikan informasi <strong>{confirmationType === 'MOVED_AWAY' ? 'Pindah Domisili' : 'Warga Meninggal'}</strong> untuk <strong>{assignment.citizenName}</strong> telah terkonfirmasi dengan benar di lapangan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmationType(null)}
                className="flex-1 min-h-[44px] border border-[#D8E5E2] text-[#334643] rounded-xl font-semibold text-xs cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmConsequence}
                className="flex-1 min-h-[44px] bg-[#00201C] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodals */}
      {isDeclineModalOpen && (
        <DeclineReasonModal
          isOpen={isDeclineModalOpen}
          onClose={() => setIsDeclineModalOpen(false)}
          selectedReasons={declineReasons}
          initialNotes={notes}
          onSave={handleDeclineReasonsSave}
        />
      )}

      {isScheduleModalOpen && (
        <AssistSchedulingModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          assignment={assignment}
          onScheduled={() => {}}
        />
      )}

      {isUrgentModalOpen && (
        <UrgentObservationModal
          isOpen={isUrgentModalOpen}
          onClose={() => setIsUrgentModalOpen(false)}
          assignment={assignment}
          onEscalated={() => {}}
        />
      )}
    </>
  );
};
