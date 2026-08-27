import React, { useEffect, useState } from 'react';
import { X, UserCheck, AlertTriangle, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { CareTask, User } from '../../../types';
import { AssigneeOption, taskAssignmentService } from '../../../services/taskAssignmentService';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface TaskAssignmentModalProps {
  task: CareTask | null;
  isReassign?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  task,
  isReassign = false,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<AssigneeOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadCandidates();
      setSelectedUserId(task.assignedToUserId || '');
      setReason('');
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

  const loadCandidates = async () => {
    if (!task) return;
    setIsLoading(true);
    try {
      const list = await taskAssignmentService.getCandidateAssignees(task.id);
      setCandidates(list);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat kandidat penugasan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedUserId) return;

    const selectedOption = candidates.find((c) => c.user.id === selectedUserId);
    if (!selectedOption) return;

    if (isReassign && (!reason || reason.trim().length < 5)) {
      setError('Alasan pengalihan tugas wajib diisi minimal 5 karakter.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isReassign) {
        await careTaskRepo.reassign(
          task.id,
          {
            userId: selectedOption.user.id,
            userName: selectedOption.user.name,
            role: selectedOption.user.roleId,
            facilityId: selectedOption.user.facilityId,
            facilityName: selectedOption.user.facilityName,
          },
          reason,
          { id: currentUser.id, name: currentUser.name }
        );
      } else {
        await careTaskRepo.assign(
          task.id,
          {
            userId: selectedOption.user.id,
            userName: selectedOption.user.name,
            role: selectedOption.user.roleId,
            facilityId: selectedOption.user.facilityId,
            facilityName: selectedOption.user.facilityName,
          },
          { id: currentUser.id, name: currentUser.name }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menetapkan penugasan.');
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
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Click inside does not close
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <UserCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isReassign ? 'Alihkan Penugasan Tugas' : 'Penugasan Care Task'}
              </h3>
              <p className="text-xs text-slate-300">
                {task.citizenName} · {task.villageName || 'Desa Taliabu'}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Summary */}
          <div className="p-3.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-black">{task.taskType}</span>
              <span className="text-[#60716D] font-mono">{task.id}</span>
            </div>
            <p className="text-xs text-[#334643] leading-relaxed">{task.actionText}</p>
            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#60716D]">
              <span>Batas Waktu: <strong>{new Date(task.dueAt).toLocaleDateString('id-ID')}</strong></span>
              {task.dueShiftedReason && (
                <span className="text-amber-800 italic">({task.dueShiftedReason})</span>
              )}
            </div>
          </div>

          {/* Assignee Selection with Area-Scope & Workload Indicator */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-2">
              Pilih Petugas / Kader Pelaksana
            </label>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#60716D]">Memuat daftar kandidat...</div>
            ) : candidates.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Tidak ditemukan petugas atau kader yang aktif di wilayah ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {candidates.map((cand) => {
                  const isSelected = selectedUserId === cand.user.id;
                  return (
                    <div
                      key={cand.user.id}
                      onClick={() => setSelectedUserId(cand.user.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#00201C] bg-[#E1F5FE] ring-1 ring-[#00201C]'
                          : 'border-[#D8E5E2] hover:border-slate-400 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-black">{cand.user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[#F0F5F4] text-black">
                            {cand.user.roleId}
                          </span>
                          {cand.isSameVillage && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> Wilayah Sama
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#60716D]">{cand.user.facilityName || 'Faskes'}</p>
                      </div>

                      {/* Workload Indicator */}
                      <div className="text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            cand.isOverloaded
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cand.workloadLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reassignment Reason Required */}
          {isReassign && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                Alasan Pengalihan Tugas <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Petugas sebelumnya sedang bertugas posyandu luar pulau / cuti dinas..."
                rows={2}
                className="w-full text-xs p-2.5 border border-[#D8E5E2] rounded-xl focus:outline-none focus:border-[#00201C]"
                required
              />
            </div>
          )}

          {/* S2 Privacy Disclaimer for Kader */}
          <div className="p-3 bg-[#FFFACD] border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <p leading-relaxed>
              <strong>Privasi Data:</strong> Jika ditugaskan ke Kader, aplikasi lapangan hanya mengirimkan data operasional minimal (S0–S2: Nama, Alamat, Instruksi Tindakan). Nilai klinis, diagnosis, dan kategori risiko merah tidak dikirimkan ke Kader.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!selectedUserId || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : isReassign ? 'Konfirmasi Alihkan' : 'Tugaskan Petugas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
