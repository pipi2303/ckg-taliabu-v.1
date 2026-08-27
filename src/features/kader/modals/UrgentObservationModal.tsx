import React, { useState } from 'react';
import { X, AlertTriangle, CheckSquare, Square, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { urgentEscalationService, APPROVED_DANGER_OBSERVATIONS } from '../../../services/urgentEscalationService';
import { KaderAssignmentPayload, UrgentFieldEscalation } from '../../../types';

interface UrgentObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: KaderAssignmentPayload;
  onEscalated: (esc: UrgentFieldEscalation) => void;
}

export const UrgentObservationModal: React.FC<UrgentObservationModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onEscalated,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const toggleObservation = (item: string) => {
    if (selectedObservations.includes(item)) {
      setSelectedObservations(selectedObservations.filter((o) => o !== item));
    } else {
      setSelectedObservations([...selectedObservations, item]);
    }
  };

  const handleSaveEscalation = () => {
    if (!currentUser || selectedObservations.length === 0) {
      toast.warning('Pilih Pengamatan', 'Pilih minimal satu tanda pengamatan kondisi mendesak.');
      return;
    }

    const esc = urgentEscalationService.escalateUrgent({
      taskId: assignment.taskId,
      citizenId: assignment.citizenId,
      citizenName: assignment.citizenName,
      observations: selectedObservations,
      notes,
      userId: currentUser.id,
    });

    setIsSaved(true);
    toast.warning(
      'Pengamatan Mendesak Tersimpan',
      'Catatan diberi prioritas transmisi TERTINGGI saat jaringan tersedia.'
    );
    onEscalated(esc);

    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-red-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-red-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase">Butuh Respons Segera (C04)</h3>
              <p className="text-[10px] text-red-200">Eskalasi Pengamatan Lapangan (Bukan Diagnosa)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Truthfulness Notice (Hard Requirement) */}
        <div className="bg-red-50 px-3.5 py-2.5 border-b border-red-200 text-xs text-red-900 flex items-start gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[11px] text-red-800">
              Informasi ini belum terkirim ke Puskesmas (Tersimpan di Gawai).
            </p>
            <p className="text-[10px] text-red-700 leading-tight">
              Jika warga membutuhkan pertolongan segera, arahkan atau dampingi menuju Pustu/Puskesmas terdekat sesuai panduan lapangan.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {isSaved ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-black">Eskalasi Tersimpan di Gawai!</h4>
              <p className="text-xs text-[#60716D]">
                Data telah ditempatkan di urutan teratas (HIGHEST) untuk dikirim pertama kali saat gawai mendeteksi sinyal.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-bold text-black mb-1.5">
                  Centang Tanda Pengamatan yang Ditemukan pada Warga:
                </p>
                <div className="space-y-1.5">
                  {APPROVED_DANGER_OBSERVATIONS.map((obs, idx) => {
                    const isSelected = selectedObservations.includes(obs);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleObservation(obs)}
                        className={`w-full min-h-[48px] p-2.5 rounded-xl border text-left flex items-center gap-2.5 text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-red-50 border-red-500 text-red-950 font-semibold'
                            : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-red-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-[11px] leading-tight">{obs}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black mb-1">
                  Keterangan Tambahan Kondisi di Lapangan:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Sudah didampingi keluarga ke Puskesmas..."
                  className="w-full p-2 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-1 focus:ring-red-700 outline-none"
                />
              </div>

              <button
                onClick={handleSaveEscalation}
                disabled={selectedObservations.length === 0}
                className={`w-full min-h-[48px] rounded-xl font-bold text-white text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                  selectedObservations.length > 0
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-slate-300 cursor-not-allowed text-slate-600'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Simpan Pengamatan Mendesak (Prioritas Utama)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
