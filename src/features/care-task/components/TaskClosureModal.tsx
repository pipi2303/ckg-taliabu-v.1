import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, FileCheck } from 'lucide-react';
import { CareTask } from '../../../types';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface TaskClosureModalProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskClosureModal: React.FC<TaskClosureModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [closureType, setClosureType] = useState<'EVIDENCE_BASED' | 'MANUAL'>('EVIDENCE_BASED');
  const [evidenceType, setEvidenceType] = useState<'ATTENDANCE' | 'FIELD_VISIT' | 'CLINICAL_RECORD'>('ATTENDANCE');
  const [evidenceRefId, setEvidenceRefId] = useState<string>('');
  const [manualReason, setManualReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      setClosureType(task.appointmentId ? 'EVIDENCE_BASED' : 'MANUAL');
      setEvidenceType('ATTENDANCE');
      setEvidenceRefId(task.appointmentId || '');
      setManualReason('');
      setError(null);
    }
  }, [isOpen, task]);

  // ESC key close
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (closureType === 'MANUAL' && (!manualReason || manualReason.trim().length < 10)) {
      setError('Alasan penutupan manual wajib diisi minimal 10 karakter untuk pertanggungjawaban audit.');
      return;
    }

    if (closureType === 'EVIDENCE_BASED' && !evidenceRefId) {
      setError('Nomor referensi bukti kehadiran / rekam medis wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await careTaskRepo.close(
        task.id,
        {
          closureType,
          evidenceType: closureType === 'EVIDENCE_BASED' ? evidenceType : undefined,
          evidenceRefId: closureType === 'EVIDENCE_BASED' ? evidenceRefId : undefined,
          manualReason: closureType === 'MANUAL' ? manualReason : undefined,
        },
        { id: currentUser.id, name: currentUser.name }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menutup tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose} // Outside click closes
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Click inside does not close
      >
        {/* Header */}
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Penutupan Care Task (Closure)</h3>
              <p className="text-xs text-slate-300">{task.id} · {task.citizenName}</p>
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

          {/* Action Context */}
          <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-[#60716D] uppercase">Tindakan:</span>
            <p className="text-xs text-black font-semibold">{task.actionText}</p>
            <p className="text-[11px] text-[#60716D]">
              Kriteria Penyelesaian: <em>{task.completionCriteria}</em>
            </p>
          </div>

          {/* Closure Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-2">
              Metode Penutupan Tugas
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setClosureType('EVIDENCE_BASED')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  closureType === 'EVIDENCE_BASED'
                    ? 'border-[#00201C] bg-[#E1F5FE] ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-black mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Berbasis Bukti (Evidence)
                </div>
                <p className="text-[11px] text-[#60716D]">
                  Kehadiran janji temu, rekam medis faskes, atau laporan kunjungan kader.
                </p>
              </div>

              <div
                onClick={() => setClosureType('MANUAL')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  closureType === 'MANUAL'
                    ? 'border-[#00201C] bg-[#FFFACD] ring-1 ring-[#00201C]'
                    : 'border-[#D8E5E2] bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-black mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Manual (Pengecualian)
                </div>
                <p className="text-[11px] text-[#60716D]">
                  Penyelesaian luar sistem yang memerlukan alasan audit khusus.
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Fields based on Closure Type */}
          {closureType === 'EVIDENCE_BASED' ? (
            <div className="space-y-3 p-3.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Tipe Bukti</label>
                <select
                  value={evidenceType}
                  onChange={(e: any) => setEvidenceType(e.target.value)}
                  className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
                >
                  <option value="ATTENDANCE">Kehadiran Janji Temu (Attendance)</option>
                  <option value="CLINICAL_RECORD">Pemeriksaan / Rekam Medis (Clinical Record)</option>
                  <option value="FIELD_VISIT">Laporan Pendampingan Lapangan Kader (Field Visit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  ID Referensi Bukti <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={evidenceRefId}
                  onChange={(e) => setEvidenceRefId(e.target.value)}
                  placeholder="Contoh: APT-2026-001 / RM-PKM-8821"
                  className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-black">
                Alasan Penutupan Manual <span className="text-red-600">*</span>
              </label>
              <textarea
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="Jelaskan secara substantif mengapa tugas ditutup manual tanpa verifikasi bukti sistem..."
                rows={3}
                className="w-full text-xs p-2.5 border border-[#D8E5E2] rounded-xl focus:outline-none focus:border-[#00201C]"
                required
              />
              <p className="text-[11px] text-[#60716D]">
                Penutupan manual dipantau pada indikator proporsi penutupan manual faskes Dinkes.
              </p>
            </div>
          )}

          {/* Hard Rule 148 Warning */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700">
            <strong>Ketetapan Sistem:</strong> Status "CLOSED" menandakan tindakan riil telah terlaksana. Mengirimkan pesan atau membuat penugasan tidak secara otomatis menutup tugas.
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Penutupan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
