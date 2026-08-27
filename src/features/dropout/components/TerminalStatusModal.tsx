import React, { useEffect, useState } from 'react';
import { X, UserX, AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { DropoutCandidate } from '../../../types';
import { dropoutCandidateService } from '../../../services/dropoutCandidateService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface TerminalStatusModalProps {
  candidate: DropoutCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TerminalStatusModal: React.FC<TerminalStatusModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<'LOST_TO_FOLLOWUP' | 'REFUSED' | 'MOVED' | 'DECEASED'>(
    'LOST_TO_FOLLOWUP'
  );
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && candidate) {
      setSelectedStatus('LOST_TO_FOLLOWUP');
      setReason('');
      setError(null);
    }
  }, [isOpen, candidate]);

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

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!reason || reason.trim().length < 10) {
      setError('Alasan penetapan status terminal wajib diisi minimal 10 karakter untuk pertanggungjawaban audit.');
      return;
    }

    if (selectedStatus === 'LOST_TO_FOLLOWUP' && !candidate.hasHumanContactAttempt) {
      setError(
        'Penetapan Putus Perawatan (LTFU) DITOLAK: Wajib terdapat minimal 1 (satu) kali upaya kontak manusia langsung (Telepon / Kunjungan Kader). Pesan otomatis saja tidak mencukupi.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await dropoutCandidateService.setTerminalStatus(candidate.id, selectedStatus, reason, {
        id: currentUser.id,
        name: currentUser.name,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menetapkan status terminal.');
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
            <div className="p-2 rounded-lg bg-red-500/20 text-red-300">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Penetapan Status Terminal Kaskade</h3>
              <p className="text-xs text-slate-300">
                {candidate.citizenName} · {candidate.villageName || 'Desa Taliabu'}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Outreach History & Human Proof Banner */}
          <div className="p-3.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-black">
              <span>Ringkasan Upaya Outreach</span>
              <span className="text-[#60716D] font-normal">{candidate.contactAttemptsCount} kali upaya</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#60716D]">
              <div>Pola Alasan: <strong className="text-black">{candidate.reasonPattern}</strong></div>
              <div>Janji Temu Missed: <strong className="text-black">{candidate.missedAppointmentsCount} kali</strong></div>
            </div>

            <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
              <span className="text-[#60716D]">Bukti Kontak Manusia:</span>
              {candidate.hasHumanContactAttempt ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi (Telepon / Kunjungan)
                </span>
              ) : (
                <span className="text-red-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Belum Ada (Hanya Digital)
                </span>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-2">
              Pilih Status Terminal
            </label>
            <div className="space-y-2">
              <div
                onClick={() => setSelectedStatus('LOST_TO_FOLLOWUP')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'LOST_TO_FOLLOWUP'
                    ? 'border-red-600 bg-red-50 ring-1 ring-red-600'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-red-950 flex items-center justify-between">
                  <span>LOST_TO_FOLLOWUP (Putus Perawatan)</span>
                  <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-semibold">
                    Wajib Kontak Manusia
                  </span>
                </div>
                <p className="text-[11px] text-red-800 mt-0.5">
                  Semua jalur outreach & panggilan telepon telah dicoba namun warga tidak dapat dijangkau.
                </p>
              </div>

              <div
                onClick={() => setSelectedStatus('REFUSED')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'REFUSED'
                    ? 'border-[#00201C] bg-[#FFFACD] ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-black">REFUSED (Menolak Layanan)</div>
                <p className="text-[11px] text-[#60716D] mt-0.5">
                  Warga menyatakan penolakan definitif terhadap intervensi tindak lanjut CKG.
                </p>
              </div>

              <div
                onClick={() => setSelectedStatus('MOVED')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'MOVED'
                    ? 'border-[#00201C] bg-[#E1F5FE] ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-black">MOVED (Pindah Domisili Luar Taliabu)</div>
                <p className="text-[11px] text-[#60716D] mt-0.5">
                  Warga telah pindah tempat tinggal secara permanen ke luar kabupaten.
                </p>
              </div>

              <div
                onClick={() => setSelectedStatus('DECEASED')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'DECEASED'
                    ? 'border-slate-800 bg-slate-100 ring-1 ring-slate-800'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">DECEASED (Meninggal Dunia)</div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Warga terkonfirmasi meninggal dunia (vitalStatus diperbarui).
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Alasan Penetapan Status <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Berikan alasan terperinci dan kronologi upaya outreach yang telah dilakukan..."
              rows={3}
              className="w-full text-xs p-2.5 border border-[#D8E5E2] rounded-xl focus:outline-none focus:border-[#00201C]"
              required
            />
          </div>

          {/* Hard Rule 95 & 94 Disclaimer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-1">
            <p>
              <strong>Tata Kelola:</strong> Warga LTFU <em>tetap tercatat</em> dalam penyebut populasi sasaran skrining daerah (tidak dihapus).
            </p>
            <p className="text-slate-500">
              Jika warga kembali aktif di kemudian hari, status dapat direaktivasi melalui tombol "Aktifkan Kembali ke Kaskade".
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
