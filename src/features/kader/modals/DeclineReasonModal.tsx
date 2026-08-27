import React, { useState } from 'react';
import { X, CheckSquare, Square, AlertCircle, Check } from 'lucide-react';
import { DeclineDelayReason } from '../../../types';

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReasons: DeclineDelayReason[];
  initialNotes?: string;
  onSave: (reasons: DeclineDelayReason[], notes?: string) => void;
}

const REASON_OPTIONS: { key: DeclineDelayReason; label: string }[] = [
  { key: 'DISTANCE_TRANSPORT', label: 'Jarak Jauh / Kendala Transportasi / Perahu' },
  { key: 'WORK_SCHEDULE', label: 'Jadwal Kerja / Melaut / Berkebun' },
  { key: 'FEELS_HEALTHY', label: 'Merasa Badan Masih Sehat' },
  { key: 'NO_COMPANION', label: 'Tidak Ada yang Mengantar / Menemani' },
  { key: 'FEAR_SHAME', label: 'Takut / Cemas / Malu Mengetahui Hasil' },
  { key: 'SERVICE_COST', label: 'Khawatir Biaya Tambahan' },
  { key: 'UNAWARE', label: 'Belum Mengetahui Pentingnya Kontrol' },
  { key: 'MEDICATION_SIDE_EFFECT', label: 'Keluhan Efek Samping Obat Sebelumnya' },
  { key: 'MEDICATION_UNAVAILABLE', label: 'Obat Habis / Fasilitas Jauh' },
  { key: 'FORGOT', label: 'Lupa Tanggal Jadwal Kontrol' },
  { key: 'OTHER', label: 'Alasan Lainnya (Wajib Dituliskan)' },
];

export const DeclineReasonModal: React.FC<DeclineReasonModalProps> = ({
  isOpen,
  onClose,
  selectedReasons,
  initialNotes,
  onSave,
}) => {
  const [reasons, setReasons] = useState<DeclineDelayReason[]>(selectedReasons || []);
  const [notes, setNotes] = useState<string>(initialNotes || '');

  if (!isOpen) return null;

  const toggleReason = (key: DeclineDelayReason) => {
    let next: DeclineDelayReason[];
    if (reasons.includes(key)) {
      next = reasons.filter((r) => r !== key);
    } else {
      next = [...reasons, key];
    }
    setReasons(next);
    // Autosave immediately on change
    onSave(next, notes);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onSave(reasons, val);
  };

  const handleFinish = () => {
    onSave(reasons, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleFinish} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#D8E5E2] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold">Alasan Menolak / Menunda (C02)</h3>
            <p className="text-[10px] text-slate-300">Pilih satu atau beberapa faktor kendala</p>
          </div>
          <button
            onClick={handleFinish}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pilot Disclaimer Banner */}
        <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 text-[10px] text-amber-900 flex items-center gap-1.5 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Daftar alasan menunggu validasi lapangan (UX-OI-03).</span>
        </div>

        {/* Body list with min 48px touch targets */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1 text-xs">
          {REASON_OPTIONS.map((opt) => {
            const isSelected = reasons.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleReason(opt.key)}
                className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF7F2] border-[#2E7D5B] text-black font-semibold'
                    : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-[#2E7D5B] shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-[#60716D] shrink-0" />
                )}
                <span className="text-xs leading-tight">{opt.label}</span>
              </button>
            );
          })}

          {/* Notes if OTHER is selected or for extra context */}
          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-black mb-1">
              Catatan Tambahan {reasons.includes('OTHER') ? '(Wajib)' : '(Opsional)'}:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Tuliskan keterangan kendala warga..."
              className="w-full p-2.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-1 focus:ring-[#00201C] outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#F8FBFA] border-t border-[#D8E5E2] shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-[#2E7D5B] font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Tersimpan di perangkat
          </span>
          <button
            onClick={handleFinish}
            className="min-h-[44px] px-5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
