import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  UserCheck,
  Building2,
  PieChart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { WorkloadOverview, workloadService } from '../../../services/workloadService';
import { CareTask } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { TaskAssignmentModal } from '../../care-task/components/TaskAssignmentModal';

export const WorkloadOverviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [overview, setOverview] = useState<WorkloadOverview | null>(null);
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadOverview();
  }, [currentUser]);

  const loadOverview = () => {
    const facilityId =
      currentUser?.roleId === 'DINKES_ADMIN' || currentUser?.roleId === 'SUPER_ADMIN'
        ? undefined
        : currentUser?.facilityId;
    const res = workloadService.getWorkloadOverview(facilityId);
    setOverview(res);
  };

  if (!overview) return null;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight">Beban Kerja Tim Pelaksana</h1>
              <p className="text-xs text-[#60716D]">
                Pemantauan distribusi beban tugas operasional untuk pemerataan penanganan kasus dan pencegahan bottleneck.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOverview}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* High-level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-[#60716D] uppercase">Total Tugas Aktif</span>
          <div className="text-2xl font-extrabold text-black">{overview.totalActiveTasks}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Belum Ditugaskan</span>
          <div className="text-2xl font-extrabold text-amber-700">{overview.totalUnassignedTasks}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-red-700 uppercase">Tugas Lewat Batas</span>
          <div className="text-2xl font-extrabold text-red-700">{overview.totalOverdueTasks}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Tugas Tereskalasi</span>
          <div className="text-2xl font-extrabold text-emerald-800">{overview.totalEscalatedTasks}</div>
        </div>
      </div>

      {/* Operational Balancing Notice (No Ranking Rule) */}
      <div className="p-3.5 bg-[#F0F5F4] border border-[#D8E5E2] rounded-xl text-xs text-[#334643] flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          <strong>Prinsip Keseimbangan Beban:</strong> Tampilan ini digunakan untuk rotasi penugasan operasional yang adil, bukan penilaian kinerja individu.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff / Clinicians Workload */}
        <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
            <span className="font-bold text-xs">Petugas Faskes & Klinis ({overview.staffWorkloads.length})</span>
            <span className="text-xs text-slate-300">Puskesmas</span>
          </div>

          <div className="divide-y divide-[#D8E5E2]">
            {overview.staffWorkloads.map((sw) => (
              <div key={sw.user.id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-black">{sw.user.name}</span>
                    <span className="text-[11px] text-[#60716D] block">
                      {sw.user.roleId} · {sw.user.facilityName}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                      sw.isHighWorkload
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-[#F0F5F4] text-black'
                    }`}
                  >
                    {sw.activeTasks} Tugas Aktif {sw.isHighWorkload && '(Beban Tinggi)'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#60716D]">
                  <span>Lewat Batas: <strong className="text-red-700">{sw.overdueTasks}</strong></span>
                  <span>Eskalasi: <strong className="text-amber-800">{sw.escalatedTasks}</strong></span>
                </div>

                {sw.tasks.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {sw.tasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTask(t);
                          setIsAssignModalOpen(true);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-black px-2 py-1 rounded font-mono flex items-center gap-1"
                      >
                        {t.id} <span className="text-[#60716D]">({t.taskType})</span>
                      </button>
                    ))}
                    {sw.tasks.length > 3 && (
                      <span className="text-[10px] text-[#60716D] self-center">
                        +{sw.tasks.length - 3} lainnya
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kader & Pustu Workload */}
        <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
            <span className="font-bold text-xs">Kader Posyandu & Pustu ({overview.kaderWorkloads.length})</span>
            <span className="text-xs text-slate-300">Desa & Lapangan</span>
          </div>

          <div className="divide-y divide-[#D8E5E2]">
            {overview.kaderWorkloads.map((kw) => (
              <div key={kw.user.id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-black">{kw.user.name}</span>
                    <span className="text-[11px] text-[#60716D] block">
                      {kw.user.roleId} · {kw.user.facilityName}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                      kw.isHighWorkload
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-[#F0F5F4] text-black'
                    }`}
                  >
                    {kw.activeTasks} Tugas Lapangan
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#60716D]">
                  <span>Lewat Batas: <strong className="text-red-700">{kw.overdueTasks}</strong></span>
                  <span>Eskalasi: <strong className="text-amber-800">{kw.escalatedTasks}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Village Overdue & Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Village Overdues */}
        <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
            <span className="font-bold text-xs">Distribusi Keterlambatan per Desa</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-4 space-y-3">
            {overview.villageOverdues.map((vo) => (
              <div key={vo.villageId} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">{vo.villageName}</span>
                  <span className="text-[11px] text-[#60716D]">
                    <strong className="text-red-700">{vo.overdueCount}</strong> / {vo.totalActive} aktif
                  </span>
                </div>
                <div className="w-full bg-[#F0F5F4] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{
                      width: `${vo.totalActive > 0 ? (vo.overdueCount / vo.totalActive) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Root Cause Grouping */}
        <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
            <span className="font-bold text-xs">Faktor Penyebab Keterlambatan (Akar Masalah)</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="font-medium text-black">Kendala Penyeberangan & Transportasi Pulau</span>
              <strong className="font-bold text-black">{overview.overdueReasonBreakdown.transport} Kasus</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="font-medium text-black">Warga Sedang Melaut / Di Luar Jangkauan</span>
              <strong className="font-bold text-black">{overview.overdueReasonBreakdown.unreachableCitizen} Kasus</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="font-medium text-black">Kapasitas Pelayanan / Kuota Terbatas</span>
              <strong className="font-bold text-black">{overview.overdueReasonBreakdown.capacity} Kasus</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="font-medium text-black">Tugas Belum Dialokasikan ke Petugas</span>
              <strong className="font-bold text-amber-800">{overview.overdueReasonBreakdown.unassigned} Kasus</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Reassignment Modal */}
      <TaskAssignmentModal
        task={selectedTask}
        isReassign={true}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadOverview}
      />
    </div>
  );
};
