import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Calendar,
  Clock,
  ClipboardList,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  FileEdit,
} from 'lucide-react';
import { KaderAssignmentPayload, FieldVisit } from '../../../types';
import { fieldVisitService } from '../../../services/fieldVisitService';
import { RecordVisitModal } from './RecordVisitModal';
import { AssistSchedulingModal } from './AssistSchedulingModal';
import { UrgentObservationModal } from './UrgentObservationModal';

interface KaderCitizenCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: KaderAssignmentPayload;
  onUpdate?: () => void;
}

export const KaderCitizenCardModal: React.FC<KaderCitizenCardModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onUpdate,
}) => {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);

  if (!isOpen) return null;

  const currentVisit = fieldVisitService.getLocalVisitForTask(assignment.taskId);

  const formatDueDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

        {/* Modal Card */}
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#D8E5E2] max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {(assignment.citizenName || 'W').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold truncate max-w-[200px]">{assignment.citizenName}</h3>
                <p className="text-[10px] text-slate-300">
                  {assignment.age ? `${assignment.age} Tahun • ` : ''}
                  {assignment.sex ? (assignment.sex === 'L' ? 'Laki-laki' : 'Perempuan') : ''} •{' '}
                  {assignment.villageName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Operational Urgency Flag (NO CLINICAL RISK COLOR) */}
          {assignment.urgentOperationalFlag && (
            <div className="bg-red-800 text-white px-3.5 py-1.5 text-xs font-bold flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" /> TINDAKAN SEGERA
              </span>
              <span className="text-[10px] bg-red-950/80 px-2 py-0.5 rounded font-mono">
                Prioritas #{assignment.serverPriorityOrder}
              </span>
            </div>
          )}

          {/* Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs text-[#334643]">
            {/* Action Text */}
            <div className="p-3 bg-[#EBF7F2] rounded-xl border border-[#D8E5E2] space-y-1">
              <p className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider">
                Tindakan Lapangan Kader
              </p>
              <p className="text-xs font-bold text-black leading-snug">{assignment.actionText}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#60716D] pt-1">
                <Clock className="w-3 h-3 text-[#2E7D5B]" />
                <span>Batas Waktu: <strong>{formatDueDate(assignment.dueAt)}</strong></span>
              </div>
            </div>

            {/* Address & Route Note */}
            <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#60716D] uppercase font-bold">Alamat / Dusun</p>
                  <p className="text-xs font-semibold text-black">{assignment.addressText}</p>
                </div>
              </div>
              {assignment.routeNote && (
                <div className="mt-1 pt-1.5 border-t border-[#D8E5E2] text-[11px] text-[#60716D] bg-white p-2 rounded-lg">
                  <span className="font-semibold text-black">Petunjuk Rute:</span> {assignment.routeNote}
                </div>
              )}
            </div>

            {/* Facility & Service Hours */}
            <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                <p className="text-xs font-bold text-black">{assignment.facilityName}</p>
              </div>
              {assignment.serviceDays && (
                <p className="text-[11px] text-[#60716D] pl-6">
                  Jadwal: {assignment.serviceDays.join(' • ')}
                </p>
              )}
            </div>

            {/* Recorded Visit Status on Device */}
            {currentVisit && (
              <div className="p-3 bg-[#FFFACD] rounded-xl border border-yellow-300 text-black space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Hasil Tercatat di Gawai
                  </span>
                  <span className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded border border-yellow-400">
                    {currentVisit.outcome}
                  </span>
                </div>
                {currentVisit.notes && (
                  <p className="text-[11px] text-amber-950 mt-1 italic">"{currentVisit.notes}"</p>
                )}
              </div>
            )}

            {/* Standard Citizen Question Guidance (Hard Requirement) */}
            <div className="p-3 bg-[#E1F5FE] rounded-xl border border-[#00201C]/20 text-[11px] text-black space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-black" />
                <span>Jika Warga Bertanya Hasil Pemeriksaan:</span>
              </div>
              <p className="italic text-[#334643] leading-relaxed">
                "Untuk penjelasan hasil pemeriksaan lengkap, silakan konfirmasi langsung dengan tenaga kesehatan di Puskesmas."
              </p>
            </div>
          </div>

          {/* Primary Action Footer */}
          <div className="p-3.5 bg-[#F8FBFA] border-t border-[#D8E5E2] shrink-0 space-y-2">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="w-full min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <FileEdit className="w-4 h-4 text-emerald-400" />
              <span>{currentVisit ? 'Ubah Hasil Kunjungan' : 'Catat Hasil Kunjungan'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="min-h-[44px] p-2 bg-white text-black border border-[#D8E5E2] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F8FBFA] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#2E7D5B]" />
                <span>Bantu Jadwal</span>
              </button>

              <button
                onClick={() => setIsUrgentModalOpen(true)}
                className="min-h-[44px] p-2 bg-red-50 text-red-800 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Kondisi Mendesak</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submodals */}
      {isRecordModalOpen && (
        <RecordVisitModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            if (onUpdate) onUpdate();
          }}
          assignment={assignment}
          onVisitSaved={() => {
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {isScheduleModalOpen && (
        <AssistSchedulingModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            if (onUpdate) onUpdate();
          }}
          assignment={assignment}
          onScheduled={() => {
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {isUrgentModalOpen && (
        <UrgentObservationModal
          isOpen={isUrgentModalOpen}
          onClose={() => {
            setIsUrgentModalOpen(false);
            if (onUpdate) onUpdate();
          }}
          assignment={assignment}
          onEscalated={() => {
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
};
