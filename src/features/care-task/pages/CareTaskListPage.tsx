import React, { useEffect, useState } from 'react';
import {
  ListTodo,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle,
  Building2,
  MapPin,
  RefreshCw,
  PlusCircle,
  ArrowUpDown,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { CareTask, HealthFacility, TaskStatus, TaskType, Village } from '../../../types';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { rawStorage } from '../../../repositories/storage';
import { careTaskService, OrchestrationGapItem } from '../../../services/careTaskService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import { Tooltip } from '../../../components/common/Tooltip';
import { CareTaskDetailDrawer } from '../components/CareTaskDetailDrawer';
import { TaskAssignmentModal } from '../components/TaskAssignmentModal';
import { TaskClosureModal } from '../components/TaskClosureModal';
import { DigitalOutreachModal } from '../../outreach/components/DigitalOutreachModal';
import { PhoneContactModal } from '../../outreach/components/PhoneContactModal';
import { CreateAppointmentModal } from '../../appointments/components/CreateAppointmentModal';
import { DocBadge } from '../../../components/common/DocBadge';

export const CareTaskListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'ALL' | TaskType>('ALL');
  const [facilityFilter, setFacilityFilter] = useState<string>('');
  const [villageFilter, setVillageFilter] = useState<string>('');
  const [dueStatusFilter, setDueStatusFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TIME'>('ALL');
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [unassignedOnly, setUnassignedOnly] = useState<boolean>(false);

  // Orchestration Gap Invariant Checker
  const [gaps, setGaps] = useState<OrchestrationGapItem[]>([]);
  const [isFixingGaps, setIsFixingGaps] = useState<boolean>(false);

  // Selected item & Modals
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isReassign, setIsReassign] = useState<boolean>(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState<boolean>(false);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadTasks();
    checkGaps();
  }, [
    search,
    statusFilter,
    taskTypeFilter,
    facilityFilter,
    villageFilter,
    dueStatusFilter,
    criticalOnly,
    unassignedOnly,
  ]);

  const loadReferenceData = async () => {
    const facs = await facilityRepo.getAll();
    setFacilities(facs);
    setVillages(rawStorage.getDesa());
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await careTaskRepo.query({
        search: search || undefined,
        facilityId: facilityFilter || undefined,
        villageId: villageFilter || undefined,
        status: statusFilter,
        taskType: taskTypeFilter,
        dueStatus: dueStatusFilter,
        isCritical: criticalOnly ? true : undefined,
        unassignedOnly,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load care tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGaps = async () => {
    try {
      const foundGaps = await careTaskService.checkOrchestrationGaps(facilityFilter || undefined);
      setGaps(foundGaps);
    } catch (err) {
      console.error('Failed to check gaps:', err);
    }
  };

  const handleFixAllGaps = async () => {
    if (!currentUser || gaps.length === 0) return;
    setIsFixingGaps(true);
    try {
      for (const gap of gaps) {
        await careTaskService.generateTasksForCitizen(gap.citizenId, {
          id: currentUser.id,
          name: currentUser.name,
        });
      }
      await loadTasks();
      await checkGaps();
    } catch (err) {
      console.error('Failed to orchestrate tasks for gaps:', err);
    } finally {
      setIsFixingGaps(false);
    }
  };

  const handleOpenTask = (task: CareTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <ListTodo className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">Care Task Registry</h1>
                <DocBadge code="SCR-PKM-B05" size="xs" />
              </div>
              <p className="text-xs text-[#60716D]">
                Daftar lengkap tugas tindak lanjut aktif, tereskalasi, dan terverifikasi di seluruh faskes Pulau Taliabu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ActionIconButton
            variant="outline"
            size="sm"
            onClick={() => {
              loadTasks();
              checkGaps();
            }}
            icon={<RefreshCw className="w-4 h-4 text-[#00201C]" />}
            tooltip="Segarkan & Sinkronisasi Daftar Care Task"
            tooltipPosition="bottom"
          />
        </div>
      </div>

      {/* Orchestration Invariant Banner */}
      {gaps.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                Integritas Kaskade CKG: Ditemukan {gaps.length} Warga Risiko Tinggi/Kritis Tanpa Tugas Aktif
              </span>
              <p className="text-amber-800 mt-0.5">
                Setiap warga berisiko Oranye/Merah/Kritis wajib memiliki CareTask aktif atau status terminal kaskade yang sah.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleFixAllGaps}
            disabled={isFixingGaps}
            className="bg-amber-900 hover:bg-amber-950 text-white shrink-0"
          >
            {isFixingGaps ? 'Memproses...' : 'Buat CareTask Otomatis'}
          </Button>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] space-y-4 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 border-b border-[#D8E5E2] pb-4">
          {[
            { label: 'Semua Status', value: 'ALL' },
            { label: 'Terbuka (Open)', value: 'OPEN' },
            { label: 'Ditugaskan (Assigned)', value: 'ASSIGNED' },
            { label: 'Dalam Proses (In Progress)', value: 'IN_PROGRESS' },
            { label: 'Selesai (Closed)', value: 'CLOSED' },
            { label: 'Dibatalkan (Cancelled)', value: 'CANCELLED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#00201C] text-white shadow-xs'
                  : 'bg-[#F0F5F4] text-[#60716D] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Detailed Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#60716D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari warga, NIK, tugas, ID..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#D8E5E2] rounded-xl focus:outline-none focus:border-[#00201C]"
            />
          </div>

          {/* Facility Filter */}
          <div>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-xl bg-white"
            >
              <option value="">Semua Puskesmas</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-xl bg-white"
            >
              <option value="">Semua Desa</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type Filter */}
          <div>
            <select
              value={taskTypeFilter}
              onChange={(e) => setTaskTypeFilter(e.target.value as any)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-xl bg-white"
            >
              <option value="ALL">Semua Jenis Tindakan</option>
              <option value="CLINICAL_CONFIRMATION">Konfirmasi Klinis</option>
              <option value="SCHEDULE_VISIT">Penjadwalan Kunjungan</option>
              <option value="OUTREACH_CONTACT">Outreach Kontak</option>
              <option value="FIELD_VISIT">Kunjungan Lapangan Kader</option>
              <option value="TREATMENT_INITIATION">Inisiasi Pengobatan</option>
              <option value="REFERRAL_CHASE">Pendampingan Rujukan</option>
            </select>
          </div>
        </div>

        {/* Checkbox Quick Flags */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#334643] pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={criticalOnly}
              onChange={(e) => setCriticalOnly(e.target.checked)}
              className="rounded border-[#D8E5E2] text-black"
            />
            <span className="text-red-700 font-bold">Hanya Temuan Kritis</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={(e) => setUnassignedOnly(e.target.checked)}
              className="rounded border-[#D8E5E2] text-black"
            />
            <span>Hanya Belum Ditugaskan</span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[#60716D]">Status Batas:</span>
            <select
              value={dueStatusFilter}
              onChange={(e) => setDueStatusFilter(e.target.value as any)}
              className="text-xs p-1 border border-[#D8E5E2] rounded-lg bg-white"
            >
              <option value="ALL">Semua Batas Waktu</option>
              <option value="OVERDUE">Terlambat (Overdue)</option>
              <option value="DUE_SOON">Mendekati Batas (≤48 Jam)</option>
              <option value="ON_TIME">Tepat Waktu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-xs">Menampilkan {tasks.length} Care Task</div>
          <span className="text-xs text-slate-300">Kabupaten Pulau Taliabu</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#60716D]">Memuat data tugas...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#60716D]">
            Tidak ada tugas yang sesuai dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[#60716D] uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3.5">ID & Warga</th>
                  <th className="p-3.5">Tindakan Care Task</th>
                  <th className="p-3.5">Wilayah & Faskes</th>
                  <th className="p-3.5">Batas Waktu</th>
                  <th className="p-3.5">Petugas PIC</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E5E2]">
                {tasks.map((task) => {
                  const now = new Date();
                  const dueTime = new Date(task.dueAt).getTime();
                  const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
                  const isOverdue = diffHours < 0 && task.status !== 'CLOSED' && task.status !== 'CANCELLED';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#F0F5F4] transition-colors cursor-pointer ${
                        task.isCritical ? 'bg-red-50/40' : ''
                      }`}
                      onClick={() => handleOpenTask(task)}
                    >
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-xs text-black">{task.citizenName}</div>
                        <div className="flex items-center gap-1 text-[11px] text-[#60716D] font-mono">
                          <span>{task.id}</span>
                          {task.isCritical && (
                            <span className="text-[10px] bg-red-600 text-white font-bold px-1 rounded">KRITIS</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-xs text-black line-clamp-1">{task.actionText}</div>
                        <div className="text-[11px] text-[#60716D]">
                          {task.taskType} · Skor {task.priorityScore}/100
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-black font-medium">{task.villageName || 'Desa Taliabu'}</div>
                        <div className="text-[11px] text-[#60716D]">{task.facilityName}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-xs text-black">
                          {new Date(task.dueAt).toLocaleDateString('id-ID')}
                        </div>
                        {isOverdue ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                            Lewat Batas
                          </span>
                        ) : task.dueShiftedReason ? (
                          <span className="text-[10px] text-amber-800 italic">Diselaraskan</span>
                        ) : null}
                      </td>

                      <td className="p-3.5">
                        {task.assignedToUserName ? (
                          <div>
                            <div className="font-semibold text-black">{task.assignedToUserName}</div>
                            <div className="text-[10px] text-[#60716D]">{task.assignedToRole}</div>
                          </div>
                        ) : (
                          <span className="text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded text-[10px]">
                            Belum Ditugaskan
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            task.status === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionIconButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsAssignModalOpen(true);
                              setIsReassign(!!task.assignedToUserId);
                            }}
                            icon={<UserCheck className="w-3.5 h-3.5 text-[#00201C]" />}
                            tooltip={task.assignedToUserId ? 'Alihkan Petugas / Kader Pendamping' : 'Tugaskan Petugas / Kader Pendamping'}
                            tooltipPosition="left"
                          />
                          <ActionIconButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenTask(task)}
                            icon={<Eye className="w-3.5 h-3.5 text-white" />}
                            tooltip="Buka Rincian & Protokol Intervensi Tugas"
                            tooltipPosition="left"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
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
        onSuccess={() => {
          loadTasks();
          checkGaps();
        }}
      />

      <TaskClosureModal
        task={selectedTask}
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onSuccess={() => {
          loadTasks();
          checkGaps();
        }}
      />

      <DigitalOutreachModal
        task={selectedTask}
        isOpen={isDigitalModalOpen}
        onClose={() => setIsDigitalModalOpen(false)}
        onSuccess={loadTasks}
      />

      <PhoneContactModal
        task={selectedTask}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={loadTasks}
      />

      <CreateAppointmentModal
        task={selectedTask}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={loadTasks}
      />
    </div>
  );
};
