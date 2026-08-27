import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Users,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Building2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { CareTask, Village } from '../../../types';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { rawStorage } from '../../../repositories/storage';
import { Button } from '../../../components/common/Button';
import { DocBadge } from '../../../components/common/DocBadge';
import { TaskAssignmentModal } from '../../care-task/components/TaskAssignmentModal';
import { KaderPayloadPreviewModal } from '../components/KaderPayloadPreviewModal';

export const FieldAssignmentPage: React.FC = () => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allTasks = await careTaskRepo.getAll();
      const activeFieldTasks = allTasks.filter(
        (t) =>
          (t.taskType === 'FIELD_VISIT' || t.taskType === 'OUTREACH_CONTACT' || t.taskType === 'SCHEDULE_VISIT') &&
          (t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
      );
      setTasks(activeFieldTasks);
      setVillages(rawStorage.getDesa());
    } catch (err) {
      console.error('Failed to load field tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedVillageId !== 'ALL' && t.villageId !== selectedVillageId) return false;
    return true;
  });

  // Group by village for island transport efficiency
  const groupedByVillage = villages.map((v) => {
    const vTasks = tasks.filter((t) => t.villageId === v.id);
    return {
      village: v,
      tasks: vTasks,
      unassignedCount: vTasks.filter((t) => !t.assignedToUserId).length,
    };
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">Penugasan Lapangan (Kader & Pustu)</h1>
                <DocBadge code="SCR-PKM-B02" size="xs" />
              </div>
              <p className="text-xs text-[#60716D]">
                Alokasi tugas penjangkauan berbasis klaster desa untuk mengatasi kendala transportasi antar pulau di Taliabu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Village Cluster Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedVillageId('ALL')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedVillageId === 'ALL'
              ? 'border-[#00201C] bg-[#00201C] text-white shadow-xs'
              : 'border-[#D8E5E2] bg-white text-black hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Seluruh Wilayah</span>
          <div className="text-lg font-extrabold mt-0.5">{tasks.length} Kasus</div>
        </div>

        {groupedByVillage.map(({ village, tasks: vTasks, unassignedCount }) => (
          <div
            key={village.id}
            onClick={() => setSelectedVillageId(village.id)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedVillageId === village.id
                ? 'border-[#00201C] bg-[#00201C] text-white shadow-xs'
                : 'border-[#D8E5E2] bg-white text-black hover:border-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75 truncate">
              {village.name}
            </span>
            <div className="text-lg font-extrabold mt-0.5 flex items-center justify-between">
              <span>{vTasks.length}</span>
              {unassignedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    selectedVillageId === village.id ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {unassignedCount} Belum
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Field Tasks List */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-xs">
            Daftar Tugas Lapangan ({filteredTasks.length} Kasus)
          </div>
          <span className="text-xs text-slate-300">Target Pelaksana: Kader Posyandu & Pustu</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#60716D]">Memuat tugas lapangan...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#60716D]">
            Tidak ada tugas lapangan pada wilayah yang dipilih.
          </div>
        ) : (
          <div className="divide-y divide-[#D8E5E2]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 transition-colors hover:bg-[#F8FBFA] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-black">{task.citizenName}</span>
                    <span className="text-xs text-[#60716D]">· {task.villageName}</span>
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {task.id}
                    </span>
                    {task.isCritical && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                        KRITIS
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#334643] leading-relaxed">{task.actionText}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#60716D]">
                    <span>Batas: <strong>{new Date(task.dueAt).toLocaleDateString('id-ID')}</strong></span>
                    <span>
                      Kader PIC:{' '}
                      <strong className={task.assignedToUserName ? 'text-black' : 'text-amber-700'}>
                        {task.assignedToUserName || 'Belum Ditugaskan'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsPreviewModalOpen(true);
                    }}
                    leftIcon={<Smartphone className="w-3.5 h-3.5" />}
                  >
                    Pratinjau S2 Kader
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsAssignModalOpen(true);
                    }}
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  >
                    {task.assignedToUserId ? 'Alihkan' : 'Tugaskan Kader'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskAssignmentModal
        task={selectedTask}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadData}
      />

      <KaderPayloadPreviewModal
        task={selectedTask}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
};
