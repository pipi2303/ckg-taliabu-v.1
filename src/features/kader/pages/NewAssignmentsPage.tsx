import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  ShieldAlert,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { kaderStorageRepo } from '../../../repositories/kaderStorageRepo';
import { localQueueService } from '../../../services/localQueueService';
import { FieldWorkPackage, KaderAssignmentPayload, KaderAssignmentResponse } from '../../../types';

interface NewAssignmentsPageProps {
  activePackage: FieldWorkPackage | null;
  onRefresh: () => void;
}

export const NewAssignmentsPage: React.FC<NewAssignmentsPageProps> = ({
  activePackage,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [rejectedTaskId, setRejectedTaskId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Di luar rute kunjungan hari ini');
  const [otherReasonText, setOtherReasonText] = useState('');

  // Simulated new assignments (tasks arrived after package was downloaded)
  const existingResponses = kaderStorageRepo.getAssignmentResponses();
  const respondedTaskIds = new Set(existingResponses.map((r) => r.taskId));

  const sampleNewTasks: KaderAssignmentPayload[] = [
    {
      taskId: 'task-new-101',
      citizenId: 'cit-new-01',
      citizenName: 'Bapak Ruslan Taher',
      age: 58,
      sex: 'L' as const,
      villageName: activePackage?.villageName || 'Desa Bobong',
      addressText: 'Dusun III RT 05 dekat pelabuhan perahu',
      actionText: 'Kunjungan tindak lanjut skrining tensi ulang sebelum 30 Agustus 2026',
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      facilityName: 'Puskesmas Bobong',
      urgentOperationalFlag: true,
      serverPriorityOrder: 1,
      routeNote: 'Rumah cat hijau dekat tambatan perahu nelayan',
      dusunOrHamlet: 'Dusun III',
    },
    {
      taskId: 'task-new-102',
      citizenId: 'cit-new-02',
      citizenName: 'Ibu Maryam Hasan',
      age: 49,
      sex: 'P' as const,
      villageName: activePackage?.villageName || 'Desa Bobong',
      addressText: 'Dusun I RT 02 samping masjid lama',
      actionText: 'Pendampingan jadwal kontrol gula darah rutin Puskesmas',
      dueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      facilityName: 'Puskesmas Bobong',
      urgentOperationalFlag: false,
      serverPriorityOrder: 2,
      dusunOrHamlet: 'Dusun I',
    },
  ].filter((t) => !respondedTaskIds.has(t.taskId));

  const handleAcceptTask = (task: KaderAssignmentPayload) => {
    if (!currentUser) return;

    const response: KaderAssignmentResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId: task.taskId,
      userId: currentUser.id,
      citizenId: task.citizenId,
      citizenName: task.citizenName,
      response: 'ACCEPTED',
      respondedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    };

    kaderStorageRepo.saveAssignmentResponse(response);
    localQueueService.enqueue(currentUser.id, 'ASSIGNMENT_RESPONSE', response, 'HIGH');

    // Add to active package assignments
    if (activePackage) {
      const updatedAssignments = [task, ...activePackage.assignments];
      kaderStorageRepo.setActivePackage({
        ...activePackage,
        assignmentCount: updatedAssignments.length,
        assignments: updatedAssignments,
      });
    }

    toast.success('Penugasan Diterima', `${task.citizenName} ditambahkan ke daftar kunjungan.`);
    onRefresh();
  };

  const handleOpenRejectModal = (taskId: string) => {
    setRejectedTaskId(taskId);
    setRejectReason('Di luar rute kunjungan hari ini');
    setOtherReasonText('');
  };

  const handleConfirmReject = () => {
    if (!currentUser || !rejectedTaskId) return;

    const finalReason = rejectReason === 'Lainnya' ? otherReasonText : rejectReason;
    const task = sampleNewTasks.find((t) => t.taskId === rejectedTaskId);

    const response: KaderAssignmentResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId: rejectedTaskId,
      userId: currentUser.id,
      citizenId: task?.citizenId || '',
      citizenName: task?.citizenName || '',
      response: 'REJECTED',
      rejectionReason: finalReason,
      respondedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    };

    kaderStorageRepo.saveAssignmentResponse(response);
    localQueueService.enqueue(currentUser.id, 'ASSIGNMENT_RESPONSE', response, 'HIGH');

    setRejectedTaskId(null);
    toast.info('Penugasan Ditolak', 'Tugas dikembalikan ke antrean Puskesmas untuk penugasan ulang.');
    onRefresh();
  };

  return (
    <div className="p-3.5 space-y-3 pb-24">
      {/* Header Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#EBF7F2] text-[#2E7D5B]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black">Penugasan Baru dari Puskesmas</h3>
            <p className="text-[11px] text-[#60716D]">
              Penugasan ini tidak otomatis merusak rute kunjungan Anda.
            </p>
          </div>
        </div>
      </div>

      {sampleNewTasks.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#D8E5E2] space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#2E7D5B] mx-auto" />
          <h4 className="text-sm font-bold text-black">Semua Tugas Telah Ditanggapi</h4>
          <p className="text-xs text-[#60716D]">
            Tidak ada penugasan baru yang menunggu konfirmasi saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sampleNewTasks.map((task) => (
            <div
              key={task.taskId}
              className="p-4 bg-white rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                {task.urgentOperationalFlag ? (
                  <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-300" />
                    TINDAKAN SEGERA
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#60716D]">
                    Prioritas #{task.serverPriorityOrder}
                  </span>
                )}
                <span className="text-[10px] text-[#2E7D5B] font-semibold">Tugas Baru</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-black">{task.citizenName}</h4>
                <div className="flex items-center gap-1.5 text-xs text-[#60716D] mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />
                  <span>{task.addressText}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-xs text-[#334643]">
                <p className="font-semibold text-black">{task.actionText}</p>
                <div className="flex items-center gap-1 text-[11px] text-[#60716D] mt-1">
                  <Clock className="w-3 h-3 text-[#2E7D5B]" />
                  <span>
                    Batas Waktu:{' '}
                    {new Date(task.dueAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              </div>

              {/* Accept / Reject Buttons (min 48px touch targets) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleOpenRejectModal(task.taskId)}
                  className="min-h-[48px] bg-white border border-[#D8E5E2] text-[#60716D] hover:text-red-700 hover:border-red-300 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak</span>
                </button>

                <button
                  onClick={() => handleAcceptTask(task)}
                  className="min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Terima Tugas</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectedTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setRejectedTaskId(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl z-10 space-y-4 border border-[#D8E5E2]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black">Alasan Penolakan Tugas</h3>
              <button
                onClick={() => setRejectedTaskId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#60716D]">
              Penolakan tidak mempengaruhi peringkat kinerja Anda. Tugas akan ditata ulang oleh tim Puskesmas.
            </p>

            <div className="space-y-2">
              {[
                'Di luar rute kunjungan hari ini',
                'Batasan waktu / kapasitas penuh',
                'Kendala transportasi perahu antar pulau',
                'Lainnya',
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRejectReason(r)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs cursor-pointer ${
                    rejectReason === r
                      ? 'bg-[#EBF7F2] border-[#2E7D5B] font-bold text-black'
                      : 'bg-white border-[#D8E5E2] text-[#334643]'
                  }`}
                >
                  {r}
                </button>
              ))}

              {rejectReason === 'Lainnya' && (
                <textarea
                  rows={2}
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Tuliskan alasan penolakan..."
                  className="w-full p-2.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectedTaskId(null)}
                className="flex-1 min-h-[44px] border border-[#D8E5E2] text-[#334643] rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 min-h-[44px] bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
