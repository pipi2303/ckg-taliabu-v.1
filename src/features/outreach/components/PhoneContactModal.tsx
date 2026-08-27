import React, { useEffect, useState } from 'react';
import { X, PhoneCall, AlertTriangle, ShieldAlert, CheckCircle2, PhoneOff } from 'lucide-react';
import { CareTask, ContactOutcome, DeclineDelayReason } from '../../../types';
import { outreachOrchestrationService } from '../../../services/outreachOrchestrationService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface PhoneContactModalProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DECLINE_REASON_OPTIONS: { value: DeclineDelayReason; label: string }[] = [
  { value: 'DISTANCE_TRANSPORT', label: 'Jarak & Transportasi Antar Pulau / Desa Sulit' },
  { value: 'WORK_SCHEDULE', label: 'Jadwal Kerja / Sedang Melaut / Bertani' },
  { value: 'FEELS_HEALTHY', label: 'Merasa Sudah Sehat / Tidak Ada Gejala' },
  { value: 'NO_COMPANION', label: 'Tidak Ada Pendamping / Keluarga yang Mengantar' },
  { value: 'FEAR_SHAME', label: 'Takut / Cemas dengan Prosedur Medis' },
  { value: 'SERVICE_COST', label: 'Kekhawatiran Biaya Tambahan' },
  { value: 'MEDICATION_SIDE_EFFECT', label: 'Efek Samping Obat Sebelumnya' },
  { value: 'MEDICATION_UNAVAILABLE', label: 'Obat Pernah Kosong' },
  { value: 'FORGOT', label: 'Lupa Tanggal / Jadwal Layanan' },
  { value: 'UNAWARE', label: 'Belum Mengetahui Urgensi Tindak Lanjut' },
  { value: 'OTHER', label: 'Alasan Lainnya (Wajib Catatan)' },
];

export const PhoneContactModal: React.FC<PhoneContactModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [outcome, setOutcome] = useState<ContactOutcome>('CONNECTED_AGREED');
  const [declineReason, setDeclineReason] = useState<DeclineDelayReason>('DISTANCE_TRANSPORT');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      setOutcome('CONNECTED_AGREED');
      setDeclineReason('DISTANCE_TRANSPORT');
      setNotes('');
      setError(null);
    }
  }, [isOpen, task]);

  // ESC Key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const requiresReason = outcome === 'CONNECTED_DECLINED' || outcome === 'CONNECTED_POSTPONED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (requiresReason && declineReason === 'OTHER' && (!notes || notes.trim().length < 5)) {
      setError('Catatan penjelasan wajib diisi minimal 5 karakter untuk opsi Alasan Lainnya.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await outreachOrchestrationService.recordPhoneOutcome(
        task.id,
        outcome,
        requiresReason ? declineReason : undefined,
        notes,
        { id: currentUser.id, name: currentUser.name }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan hasil telepon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Catat Hasil Telepon Warga</h3>
              <p className="text-xs text-slate-300">
                {task.citizenName} · {task.citizenPhone || 'Tanpa No. Telp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Outcome Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-2">
              Hasil Panggilan Telepon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setOutcome('CONNECTED_AGREED')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'CONNECTED_AGREED'
                    ? 'border-[#00201C] bg-[#E1F5FE] font-bold text-black ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tersambung — Bersedia</span>
              </div>

              <div
                onClick={() => setOutcome('CONNECTED_POSTPONED')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'CONNECTED_POSTPONED'
                    ? 'border-[#00201C] bg-[#FFFACD] font-bold text-black ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tersambung — Menunda</span>
              </div>

              <div
                onClick={() => setOutcome('CONNECTED_DECLINED')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'CONNECTED_DECLINED'
                    ? 'border-red-600 bg-red-50 font-bold text-red-900 ring-1 ring-red-600'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <PhoneOff className="w-4 h-4 text-red-600 shrink-0" />
                <span>Tersambung — Menolak</span>
              </div>

              <div
                onClick={() => setOutcome('NO_ANSWER')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'NO_ANSWER'
                    ? 'border-[#00201C] bg-slate-100 font-bold text-slate-900 ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <PhoneOff className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Tidak Terjawab</span>
              </div>

              <div
                onClick={() => setOutcome('NUMBER_INACTIVE')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'NUMBER_INACTIVE'
                    ? 'border-amber-600 bg-amber-50 font-bold text-amber-900 ring-1 ring-amber-600'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <PhoneOff className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Nomor Tidak Aktif</span>
              </div>

              <div
                onClick={() => setOutcome('WRONG_PERSON')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  outcome === 'WRONG_PERSON'
                    ? 'border-amber-600 bg-amber-50 font-bold text-amber-900 ring-1 ring-amber-600'
                    : 'border-[#D8E5E2] bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <PhoneOff className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Salah Sambung</span>
              </div>
            </div>
          </div>

          {/* Decline/Delay Reason Selection */}
          {requiresReason && (
            <div className="space-y-2 p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <label className="block text-xs font-bold text-black">
                Alasan Penolakan / Penundaan <span className="text-red-600">*</span>
              </label>
              <select
                value={declineReason}
                onChange={(e: any) => setDeclineReason(e.target.value)}
                className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
              >
                {DECLINE_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-amber-800 italic">
                * Catatan: Daftar alasan masih memerlukan validasi lapangan secara berkala.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Catatan Panggilan {declineReason === 'OTHER' && requiresReason && <span className="text-red-600">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan rincian kesepakatan jadwal atau catatan penting dari komunikasi telepon..."
              rows={3}
              className="w-full text-xs p-2.5 border border-[#D8E5E2] rounded-xl focus:outline-none focus:border-[#00201C]"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Hasil Telepon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
