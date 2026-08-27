import React, { useEffect, useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Phone,
  MessageSquare,
  Calendar,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Send,
  UserX,
  MapPin,
  Building2,
  Info,
} from 'lucide-react';
import { Appointment, CareTask, ContactAttempt, TaskAssignment, TaskClosure } from '../../../types';
import { rawStorage } from '../../../repositories/storage';
import { contactAttemptRepo } from '../../../repositories/contactAttemptRepo';
import { Button } from '../../../components/common/Button';

interface CareTaskDetailDrawerProps {
  task: CareTask | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (task: CareTask, isReassign: boolean) => void;
  onSendDigital: (task: CareTask) => void;
  onRecordPhone: (task: CareTask) => void;
  onCreateAppointment: (task: CareTask) => void;
  onCloseTask: (task: CareTask) => void;
}

export const CareTaskDetailDrawer: React.FC<CareTaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onAssign,
  onSendDigital,
  onRecordPhone,
  onCreateAppointment,
  onCloseTask,
}) => {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [contactAttempts, setContactAttempts] = useState<ContactAttempt[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [closure, setClosure] = useState<TaskClosure | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OUTREACH' | 'ASSIGNMENT' | 'AUDIT'>('OVERVIEW');

  useEffect(() => {
    if (isOpen && task) {
      loadDetails();
      setActiveTab('OVERVIEW');
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

  const loadDetails = async () => {
    if (!task) return;
    const allAssignments = rawStorage.getTaskAssignments();
    setAssignments(allAssignments.filter((a) => a.taskId === task.id));

    const attempts = await contactAttemptRepo.getByTaskId(task.id);
    setContactAttempts(attempts);

    if (task.appointmentId) {
      const apts = rawStorage.getAppointments();
      setAppointment(apts.find((a) => a.id === task.appointmentId) || null);
    } else {
      setAppointment(null);
    }

    if (task.status === 'CLOSED') {
      const closures = rawStorage.getTaskClosures();
      setClosure(closures.find((c) => c.taskId === task.id) || null);
    } else {
      setClosure(null);
    }
  };

  if (!isOpen || !task) return null;

  const now = new Date();
  const dueTime = new Date(task.dueAt).getTime();
  const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
  const isOverdue = diffHours < 0 && task.status !== 'CLOSED' && task.status !== 'CANCELLED';
  const isDueSoon = diffHours >= 0 && diffHours <= 48 && task.status !== 'CLOSED' && task.status !== 'CANCELLED';

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#D8E5E2]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-6 bg-[#00201C] text-white flex items-start justify-between border-b border-[#003830]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                  {task.id}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    task.status === 'CLOSED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : task.status === 'CANCELLED'
                      ? 'bg-slate-500/20 text-slate-300'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {task.status}
                </span>
                {task.isCritical && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> KRITIS
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{task.citizenName}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {task.villageName || 'Desa Taliabu'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {task.facilityName}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats / Deadline Bar */}
          <div className="px-6 py-3 bg-[#F0F5F4] border-b border-[#D8E5E2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#60716D]" />
              <span className="text-[#60716D]">Batas Waktu:</span>
              <strong className="text-black">
                {new Date(task.dueAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
              {task.dueShiftedReason && (
                <span className="text-[10px] text-amber-800 italic">({task.dueShiftedReason})</span>
              )}
            </div>

            <div>
              {isOverdue ? (
                <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-200">
                  Terlambat ({Math.abs(Math.floor(diffHours / 24))} hari)
                </span>
              ) : isDueSoon ? (
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  Mendekati Batas (≤48 Jam)
                </span>
              ) : (
                <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Tepat Waktu
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 border-b border-[#D8E5E2] flex gap-4 bg-white">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'OVERVIEW'
                  ? 'border-[#00201C] text-black'
                  : 'border-transparent text-[#60716D] hover:text-black'
              }`}
            >
              Ikhtisar Tindakan
            </button>
            <button
              onClick={() => setActiveTab('OUTREACH')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'OUTREACH'
                  ? 'border-[#00201C] text-black'
                  : 'border-transparent text-[#60716D] hover:text-black'
              }`}
            >
              Riwayat Outreach ({contactAttempts.length})
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNMENT')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'ASSIGNMENT'
                  ? 'border-[#00201C] text-black'
                  : 'border-transparent text-[#60716D] hover:text-black'
              }`}
            >
              Penugasan ({assignments.length})
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-5">
                {/* Action Card */}
                <div className="p-4 rounded-xl bg-[#F8FBFA] border border-[#D8E5E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#60716D]">
                      Tipe Tugas & CRS
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-black border border-[#D8E5E2]">
                      {task.taskType}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-black leading-relaxed">{task.actionText}</p>

                  <div className="pt-2 border-t border-[#D8E5E2] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#60716D] block text-[11px]">Kategori Risiko CRS:</span>
                      <strong className="text-black">{task.riskCategory}</strong>
                    </div>
                    <div>
                      <span className="text-[#60716D] block text-[11px]">Skor Prioritas:</span>
                      <strong className="text-black">{task.priorityScore}/100</strong>
                    </div>
                    <div>
                      <span className="text-[#60716D] block text-[11px]">Aturan Sumber (Rule):</span>
                      <span className="font-mono text-black">{task.sourceRuleCode || 'CR-CRS-01'}</span>
                    </div>
                    <div>
                      <span className="text-[#60716D] block text-[11px]">Peran Disarankan:</span>
                      <span className="text-black">{task.suggestedRole || 'Dokter/Perawat'}</span>
                    </div>
                  </div>
                </div>

                {/* Completion Criteria */}
                <div className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#60716D]">
                    Kriteria Penyelesaian (Completion Criteria)
                  </span>
                  <p className="text-xs text-[#334643] leading-relaxed">{task.completionCriteria}</p>
                </div>

                {/* Current Assignee Box */}
                <div className="p-4 bg-white rounded-xl border border-[#D8E5E2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#60716D]">
                      Petugas Pelaksana Saat Ini
                    </span>
                    {task.assignedToUserId && (
                      <button
                        onClick={() => onAssign(task, true)}
                        className="text-xs text-black font-bold hover:underline"
                      >
                        Alihkan
                      </button>
                    )}
                  </div>

                  {task.assignedToUserId ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#E1F5FE] text-black">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-black">{task.assignedToUserName}</div>
                          <div className="text-[11px] text-[#60716D]">
                            {task.assignedToRole} · {task.assignedFacilityName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#60716D]">
                        Sejak {new Date(task.assignedAt || task.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                      <span className="text-amber-800 font-semibold">Tugas belum ditugaskan ke petugas/kader.</span>
                      <Button variant="primary" size="sm" onClick={() => onAssign(task, false)}>
                        Tugaskan Sekarang
                      </Button>
                    </div>
                  )}
                </div>

                {/* Appointment Info (if any) */}
                {appointment && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        Janji Temu Terjadwal ({appointment.id})
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        {appointment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-emerald-900">
                      <div>Tanggal: <strong>{appointment.scheduledDate}</strong></div>
                      <div>Waktu: <strong>{appointment.scheduledTime}</strong></div>
                      <div className="col-span-2">Layanan: {appointment.serviceType}</div>
                    </div>
                  </div>
                )}

                {/* Closure Evidence (if closed) */}
                {closure && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        Bukti Penutupan Tugas ({closure.closureType})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(closure.closedAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1">
                      {closure.closureType === 'EVIDENCE_BASED' ? (
                        <div>
                          Bukti: <strong>{closure.evidenceType}</strong> (Ref: {closure.evidenceRefId})
                        </div>
                      ) : (
                        <div>
                          Alasan Manual: <em>"{closure.manualReason}"</em>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500">
                        Ditutup oleh: {closure.closedByUserName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'OUTREACH' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#60716D]">
                    Kronologi Kontak & Kaskade
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendDigital(task)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Pesan Digital
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecordPhone(task)}
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                    >
                      Catat Telepon
                    </Button>
                  </div>
                </div>

                {contactAttempts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#60716D] bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                    Belum ada riwayat kontak tercatat untuk tugas ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contactAttempts.map((att, idx) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl border border-[#D8E5E2] bg-white space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black">{att.channel}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              Langkah {att.ladderStep}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#60716D]">
                            {new Date(att.attemptedAt).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[#60716D]">Hasil:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              att.outcome === 'CONNECTED_AGREED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.outcome === 'CONNECTED_DECLINED'
                                ? 'bg-red-100 text-red-800'
                                : att.outcome === 'CONNECTED_POSTPONED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {att.outcome}
                          </span>
                          {att.declineReason && (
                            <span className="text-[11px] text-red-700">({att.declineReason})</span>
                          )}
                        </div>

                        {att.notes && <p className="text-[#334643] text-[11px]">{att.notes}</p>}
                        {att.freeTextResponse && (
                          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                            <strong>Respon Teks:</strong> "{att.freeTextResponse}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ASSIGNMENT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#60716D]">
                    Riwayat Penugasan & Pengalihan
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(task, !!task.assignedToUserId)}
                  >
                    {task.assignedToUserId ? 'Alihkan Tugas' : 'Tugaskan Petugas'}
                  </Button>
                </div>

                {assignments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#60716D] bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                    Belum ada penugasan petugas tercatat.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-3.5 rounded-xl border border-[#D8E5E2] bg-white space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-black">{asg.assignedToUserName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              asg.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : asg.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {asg.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#60716D]">
                          Peran: {asg.assignedToRole} · Ditugaskan oleh: {asg.assignedByUserName} pada{' '}
                          {new Date(asg.assignedAt).toLocaleString('id-ID')}
                        </div>
                        {asg.reassignmentReason && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                            <strong>Alasan Pengalihan:</strong> {asg.reassignmentReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Actions Toolbar */}
          <div className="p-4 bg-[#F8FBFA] border-t border-[#D8E5E2] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendDigital(task)}
                disabled={task.status === 'CLOSED' || task.status === 'CANCELLED'}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Kirim Pesan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateAppointment(task)}
                disabled={task.status === 'CLOSED' || task.status === 'CANCELLED'}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Janji Temu
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCloseTask(task)}
                disabled={task.status === 'CLOSED' || task.status === 'CANCELLED'}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Tutup Tugas (Close)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
