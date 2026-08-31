import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  UserCheck,
  Calendar,
  Phone,
  Send,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Filter,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';
import { CareTask } from '../../../types';
import { priorityQueueService, PriorityQueueItem, PriorityQueueSummary } from '../../../services/priorityQueueService';
import { careTaskService } from '../../../services/careTaskService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { CareTaskDetailDrawer } from '../components/CareTaskDetailDrawer';
import { TaskAssignmentModal } from '../components/TaskAssignmentModal';
import { TaskClosureModal } from '../components/TaskClosureModal';
import { DigitalOutreachModal } from '../../outreach/components/DigitalOutreachModal';
import { PhoneContactModal } from '../../outreach/components/PhoneContactModal';
import { CreateAppointmentModal } from '../../appointments/components/CreateAppointmentModal';
import { DocBadge } from '../../../components/common/DocBadge';

export const DailyPriorityQueuePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [queueItems, setQueueItems] = useState<PriorityQueueItem[]>([]);
  const [summary, setSummary] = useState<PriorityQueueSummary | null>(null);
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isReassign, setIsReassign] = useState<boolean>(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState<boolean>(false);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);

  // Why Prioritized Modal / Tooltip
  const [activeWhyItem, setActiveWhyItem] = useState<PriorityQueueItem | null>(null);

  useEffect(() => {
    loadQueue();
  }, [currentUser]);

  const loadQueue = () => {
    const facilityId =
      currentUser?.roleId === 'DINKES_ADMIN' || currentUser?.roleId === 'SUPER_ADMIN'
        ? undefined
        : currentUser?.facilityId;
    const res = priorityQueueService.getDailyQueue(facilityId, 25);
    setQueueItems(res.items);
    setSummary(res.summary);
  };

  const handleOpenTask = (task: CareTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">Prioritas Tugas Hari Ini</h1>
                <DocBadge code="SCR-PKM-B01" size="xs" />
              </div>
              <p className="text-xs text-[#60716D]">
                Daftar warga yang perlu segera ditindaklanjuti berdasarkan tingkat keparahan risiko kesehatan di wilayah kerja Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan Antrean
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-[#60716D] uppercase">Tugas Hari Ini</span>
            <div className="text-2xl font-extrabold text-black">
              {summary.todayTasksCount}{' '}
              <span className="text-xs text-[#60716D] font-normal">/ {summary.totalActiveTasks} aktif</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Temuan Kritis
            </span>
            <div className="text-2xl font-extrabold text-red-700">{summary.criticalCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Lewat Batas
            </span>
            <div className="text-2xl font-extrabold text-amber-700">{summary.overdueCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-[#60716D] uppercase">Belum Ditugaskan</span>
            <div className="text-2xl font-extrabold text-black">{summary.unassignedCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-[#60716D] uppercase">Konfirmasi Klinis</span>
            <div className="text-2xl font-extrabold text-black">{summary.awaitingConfirmationCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Janji Temu Hari Ini
            </span>
            <div className="text-2xl font-extrabold text-emerald-800">{summary.todayAppointmentsCount}</div>
          </div>
        </div>
      )}

      {/* Notice Banner */}
      <div className="p-4 bg-[#F0F5F4] rounded-xl border border-[#D8E5E2] flex items-center justify-between text-xs text-[#334643]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-black shrink-0" />
          <span>
            Menampilkan <strong>{queueItems.length} tugas prioritas utama</strong> dari {summary?.totalActiveTasks || 0} total tugas aktif. Urutan diprioritaskan berdasarkan Temuan Kritis &gt; Skor Prioritas &gt; Lama Tunggu.
          </span>
        </div>
      </div>

      {/* Priority Queue List */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-sm">Daftar Tugas Teratas (Daily Active Queue)</div>
          <span className="text-xs text-slate-300">Kapasitas Kerja Harian: 25 Kasus</span>
        </div>

        {queueItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#60716D]">
            Tidak ada tugas aktif dalam antrean prioritas saat ini.
          </div>
        ) : (
          <div className="divide-y divide-[#D8E5E2]">
            {queueItems.map(({ task, rank, whyPrioritized }) => {
              return (
                <div
                  key={task.id}
                  className={`p-4 transition-colors hover:bg-[#F8FBFA] flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    task.isCritical ? 'bg-red-50/50' : ''
                  }`}
                >
                  {/* Left: Rank, Citizen Info & Action */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        rank <= 3
                          ? 'bg-[#00201C] text-white ring-2 ring-emerald-400'
                          : 'bg-[#F0F5F4] text-black'
                      }`}
                    >
                      {rank}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-black hover:underline cursor-pointer" onClick={() => handleOpenTask(task)}>
                          {task.citizenName}
                        </span>
                        <span className="text-xs text-[#60716D]">· {task.villageName || 'Desa Taliabu'}</span>

                        {task.isCritical && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> TEMUAN KRITIS
                          </span>
                        )}

                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {task.id}
                        </span>

                        {/* Why Prioritized trigger */}
                        <button
                          onClick={() => setActiveWhyItem({ task, rank, whyPrioritized })}
                          className="text-[11px] text-black font-semibold flex items-center gap-0.5 hover:underline bg-[#E1F5FE] px-2 py-0.5 rounded"
                        >
                          <HelpCircle className="w-3 h-3 text-black" />
                          Mengapa #{rank}?
                        </button>
                      </div>

                      {/* Action description */}
                      <p className="text-xs text-[#334643] font-medium leading-relaxed">
                        {task.actionText}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#60716D]">
                        <span>Tipe: <strong className="text-black">{task.taskType}</strong></span>
                        <span>
                          Batas: <strong>{new Date(task.dueAt).toLocaleDateString('id-ID')}</strong>
                        </span>
                        <span>
                          Petugas:{' '}
                          <strong className={task.assignedToUserName ? 'text-black' : 'text-amber-700'}>
                            {task.assignedToUserName || 'Belum Ditugaskan'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDigitalModalOpen(true);
                      }}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Pesan
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsPhoneModalOpen(true);
                      }}
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                    >
                      Telepon
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsAppointmentModalOpen(true);
                      }}
                      leftIcon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Jadwal
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenTask(task)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Rincian
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* "Mengapa diprioritaskan?" Modal / Dialog */}
      {activeWhyItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setActiveWhyItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D8E5E2] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Transparansi Urutan Prioritas #{activeWhyItem.rank}</span>
              </div>
              <button
                onClick={() => setActiveWhyItem(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <h4 className="font-bold text-sm text-black">{activeWhyItem.task.citizenName}</h4>
                <p className="text-[11px] text-[#60716D] font-mono">Tugas #{activeWhyItem.task.id}</p>
              </div>

              <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2">
                <div className="font-semibold text-black">Alasan Posisi Antrean:</div>
                <p className="text-xs text-[#334643] leading-relaxed">{activeWhyItem.whyPrioritized.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[#60716D] block">Skor Prioritas CRS:</span>
                  <strong className="text-black text-xs">{activeWhyItem.whyPrioritized.priorityScore}/100</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[#60716D] block">Hari Sejak Temuan:</span>
                  <strong className="text-black text-xs">{activeWhyItem.whyPrioritized.daysSinceFinding} Hari</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[#60716D] block">Status Batas Waktu:</span>
                  <strong className="text-black text-xs">{activeWhyItem.whyPrioritized.dueStatus}</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[#60716D] block">Aturan CRS:</span>
                  <strong className="text-black text-xs">{activeWhyItem.whyPrioritized.sourceRule}</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setActiveWhyItem(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <CareTaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAssign={(t, isRe) => {
          setSelectedTask(t);
          setIsReassign(isRe);
          setIsAssignModalOpen(true);
        }}
        onSendDigital={(t) => {
          setSelectedTask(t);
          setIsDigitalModalOpen(true);
        }}
        onRecordPhone={(t) => {
          setSelectedTask(t);
          setIsPhoneModalOpen(true);
        }}
        onCreateAppointment={(t) => {
          setSelectedTask(t);
          setIsAppointmentModalOpen(true);
        }}
        onCloseTask={(t) => {
          setSelectedTask(t);
          setIsClosureModalOpen(true);
        }}
      />

      <TaskAssignmentModal
        task={selectedTask}
        isReassign={isReassign}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadQueue}
      />

      <TaskClosureModal
        task={selectedTask}
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onSuccess={loadQueue}
      />

      <DigitalOutreachModal
        task={selectedTask}
        isOpen={isDigitalModalOpen}
        onClose={() => setIsDigitalModalOpen(false)}
        onSuccess={loadQueue}
      />

      <PhoneContactModal
        task={selectedTask}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={loadQueue}
      />

      <CreateAppointmentModal
        task={selectedTask}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={loadQueue}
      />
    </div>
  );
};
