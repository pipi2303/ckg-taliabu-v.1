import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HeartPulse,
  Info,
  Layers,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Trash2,
  Truck,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { CareTask, User as AppUser, Citizen } from '../../../types';
import { rawStorage } from '../../../repositories/storage';

export interface DaftarTugasPustuProps {
  tasks: CareTask[];
  kaderList: AppUser[];
  villageName: string;
  assignedDesaList: string[];
  onTaskUpdated?: () => void;
  onNavigate?: (navId: string) => void;
  onQuickCheckIn?: (task: CareTask) => void;
}

export type AgeGroupFilter = 'ALL' | 'ELDERLY' | 'PRE_ELDERLY' | 'PRODUCTIVE';
export type ChronicConditionFilter =
  | 'ALL'
  | 'HYPERTENSION'
  | 'DIABETES'
  | 'COMORBID'
  | 'CARDIO_STROKE'
  | 'SUSPECT_NEW';
export type GroupByOption = 'NONE' | 'AGE_GROUP' | 'CHRONIC_CONDITION' | 'VILLAGE_DUSUN';

export const DaftarTugasPustu: React.FC<DaftarTugasPustuProps> = ({
  tasks,
  kaderList,
  villageName,
  assignedDesaList,
  onTaskUpdated,
  onNavigate,
  onQuickCheckIn,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED'>('ALL');
  
  // New Enhanced Filters
  const [ageGroupFilter, setAgeGroupFilter] = useState<AgeGroupFilter>('ALL');
  const [chronicConditionFilter, setChronicConditionFilter] = useState<ChronicConditionFilter>('ALL');
  const [groupBy, setGroupBy] = useState<GroupByOption>('NONE');

  // Modal State
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<CareTask | null>(null);
  const [selectedKaderId, setSelectedKaderId] = useState<string>('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [selectedTaskForComplete, setSelectedTaskForComplete] = useState<CareTask | null>(null);
  const [completeFindingNote, setCompleteFindingNote] = useState('');
  const [completeTtvBp, setCompleteTtvBp] = useState('130/85');
  const [completeTtvGds, setCompleteTtvGds] = useState('135');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to extract demographic and condition metadata for a task
  const getTaskMetadata = (task: CareTask) => {
    const rawReason = ((task as any).reason || (task as any).problem || task.actionText || '').toLowerCase();
    const rawTitle = ((task as any).title || task.actionText || '').toLowerCase();
    const rawAction = (task.actionText || '').toLowerCase();
    const notes = ((task as any).notes || (task as any).cancelReason || '').toLowerCase();
    const textCombined = `${rawReason} ${rawTitle} ${rawAction} ${notes}`;

    // Estimated Age & Age Group
    let estimatedAge = 58; // default adult
    if (textCombined.includes('lansia') || textCombined.includes('64 thn') || textCombined.includes('68 thn') || textCombined.includes('73 thn') || textCombined.includes('61 thn') || textCombined.includes('65 thn') || textCombined.includes('70 thn') || task.priorityScore >= 85) {
      estimatedAge = 66;
    } else if (textCombined.includes('pra-lansia') || textCombined.includes('51 thn') || textCombined.includes('57 thn') || textCombined.includes('55 thn')) {
      estimatedAge = 54;
    } else if (textCombined.includes('produktif') || textCombined.includes('46 thn') || textCombined.includes('35 thn') || textCombined.includes('40 thn')) {
      estimatedAge = 42;
    }

    let ageGroup: 'ELDERLY' | 'PRE_ELDERLY' | 'PRODUCTIVE' = 'PRE_ELDERLY';
    let ageGroupLabel = 'Pra-Lansia (45-59 Thn)';
    if (estimatedAge >= 60) {
      ageGroup = 'ELDERLY';
      ageGroupLabel = 'Lansia Rentan (≥60 Thn)';
    } else if (estimatedAge < 45) {
      ageGroup = 'PRODUCTIVE';
      ageGroupLabel = 'Usia Produktif (<45 Thn)';
    }

    // Chronic Condition Category
    let conditionCategory: 'COMORBID' | 'HYPERTENSION' | 'DIABETES' | 'CARDIO_STROKE' | 'SUSPECT_NEW' = 'HYPERTENSION';
    let conditionLabel = 'Hipertensi';

    if (
      (textCombined.includes('komorbid') || (textCombined.includes('hipertensi') && textCombined.includes('diabetes')) || textCombined.includes('ht + dm') || textCombined.includes('gula darah dan tensi'))
    ) {
      conditionCategory = 'COMORBID';
      conditionLabel = 'Komorbiditas Ganda (Hipertensi + DM)';
    } else if (textCombined.includes('stroke') || textCombined.includes('jantung') || textCombined.includes('kardiovaskular')) {
      conditionCategory = 'CARDIO_STROKE';
      conditionLabel = 'Pasca Stroke / Risiko Kardiovaskular';
    } else if (textCombined.includes('diabetes') || textCombined.includes('dm') || textCombined.includes('gds') || textCombined.includes('gula darah')) {
      conditionCategory = 'DIABETES';
      conditionLabel = 'Diabetes Melitus (DM)';
    } else if (textCombined.includes('suspek') || textCombined.includes('skrining baru') || textCombined.includes('konfirmasi')) {
      conditionCategory = 'SUSPECT_NEW';
      conditionLabel = 'Skrining Baru Belum Terkonfirmasi';
    } else {
      conditionCategory = 'HYPERTENSION';
      conditionLabel = 'Hipertensi Primer / Tidak Terkontrol';
    }

    const isVulnerableElderly = ageGroup === 'ELDERLY' && (task.isCritical || task.priorityScore >= 75 || conditionCategory === 'COMORBID');

    return {
      estimatedAge,
      ageGroup,
      ageGroupLabel,
      conditionCategory,
      conditionLabel,
      isVulnerableElderly,
    };
  };

  // Filter Tasks for Pustu Village Scope
  const villageScopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Check village match
      const taskVillage = (t.villageName || '').toLowerCase();
      const matchesScope =
        assignedDesaList.some((desa) => taskVillage.includes(desa.toLowerCase())) ||
        taskVillage.includes(villageName.toLowerCase()) ||
        !t.villageName;
      return matchesScope;
    });
  }, [tasks, assignedDesaList, villageName]);

  // Filtered Tasks with age & chronic filters
  const filteredTasks = useMemo(() => {
    return villageScopedTasks.filter((task) => {
      const meta = getTaskMetadata(task);

      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (task.citizenName || '').toLowerCase().includes(q) ||
        (task.citizenNik || '').includes(q) ||
        ((task as any).title || task.actionText || '').toLowerCase().includes(q) ||
        ((task as any).reason || '').toLowerCase().includes(q) ||
        (task.villageName || '').toLowerCase().includes(q) ||
        meta.conditionLabel.toLowerCase().includes(q) ||
        meta.ageGroupLabel.toLowerCase().includes(q);

      // Village Filter
      const matchVillage =
        selectedVillage === 'ALL' ||
        (task.villageName || '').toLowerCase().includes(selectedVillage.toLowerCase());

      // Urgency Filter
      const isCritical = task.isCritical || task.priorityScore >= 80;
      const isHigh = task.priorityScore >= 60 && task.priorityScore < 80;
      const isMedium = task.priorityScore < 60 && !task.isCritical;

      const matchUrgency =
        urgencyFilter === 'ALL' ||
        (urgencyFilter === 'CRITICAL' && isCritical) ||
        (urgencyFilter === 'HIGH' && isHigh) ||
        (urgencyFilter === 'MEDIUM' && isMedium);

      // Status Filter
      const isDone = task.status === 'CLOSED' || task.status === 'CANCELLED';
      const isAssigned = !!task.assignedToUserId && !isDone;
      const isUnassigned = !task.assignedToUserId && !isDone;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNASSIGNED' && isUnassigned) ||
        (statusFilter === 'ASSIGNED' && isAssigned) ||
        (statusFilter === 'COMPLETED' && isDone);

      // Age Group Filter
      const matchAge =
        ageGroupFilter === 'ALL' ||
        (ageGroupFilter === 'ELDERLY' && meta.ageGroup === 'ELDERLY') ||
        (ageGroupFilter === 'PRE_ELDERLY' && meta.ageGroup === 'PRE_ELDERLY') ||
        (ageGroupFilter === 'PRODUCTIVE' && meta.ageGroup === 'PRODUCTIVE');

      // Chronic Condition Filter
      const matchChronic =
        chronicConditionFilter === 'ALL' ||
        (chronicConditionFilter === 'HYPERTENSION' && meta.conditionCategory === 'HYPERTENSION') ||
        (chronicConditionFilter === 'DIABETES' && meta.conditionCategory === 'DIABETES') ||
        (chronicConditionFilter === 'COMORBID' && meta.conditionCategory === 'COMORBID') ||
        (chronicConditionFilter === 'CARDIO_STROKE' && meta.conditionCategory === 'CARDIO_STROKE') ||
        (chronicConditionFilter === 'SUSPECT_NEW' && meta.conditionCategory === 'SUSPECT_NEW');

      return matchSearch && matchVillage && matchUrgency && matchStatus && matchAge && matchChronic;
    });
  }, [
    villageScopedTasks,
    searchQuery,
    selectedVillage,
    urgencyFilter,
    statusFilter,
    ageGroupFilter,
    chronicConditionFilter,
  ]);

  // Grouped Tasks Data Structure
  const groupedTaskSections = useMemo(() => {
    if (groupBy === 'NONE') {
      return [{ key: 'all', title: 'Semua Antrean Kunjungan', tasks: filteredTasks }];
    }

    if (groupBy === 'AGE_GROUP') {
      const groups: Record<string, { title: string; badge: string; tasks: CareTask[] }> = {
        ELDERLY: { title: '🧓 Lansia Rentan (≥ 60 Tahun)', badge: 'Prioritas Tertinggi', tasks: [] },
        PRE_ELDERLY: { title: '🧑 Pra-Lansia (45 - 59 Tahun)', badge: 'Pemantauan Rutin', tasks: [] },
        PRODUCTIVE: { title: '👤 Usia Produktif (< 45 Tahun)', badge: 'Skrining & Edukasi', tasks: [] },
      };

      filteredTasks.forEach((t) => {
        const meta = getTaskMetadata(t);
        groups[meta.ageGroup]?.tasks.push(t);
      });

      return Object.entries(groups)
        .filter(([_, g]) => g.tasks.length > 0)
        .map(([k, g]) => ({ key: k, title: g.title, badge: g.badge, tasks: g.tasks }));
    }

    if (groupBy === 'CHRONIC_CONDITION') {
      const groups: Record<string, { title: string; badge: string; tasks: CareTask[] }> = {
        COMORBID: { title: '🟣 Komorbiditas Ganda (Hipertensi + DM)', badge: 'Risiko Komplikasi Berat', tasks: [] },
        HYPERTENSION: { title: '🔴 Hipertensi Primer / Tidak Terkontrol', badge: 'Evaluasi Tensi & Obat', tasks: [] },
        DIABETES: { title: '🟠 Diabetes Melitus (GDS Tinggi)', badge: 'Evaluasi Kepatuhan Diet & Obat', tasks: [] },
        CARDIO_STROKE: { title: '🫀 Riwayat Pasca Stroke / Kardiovaskular', badge: 'Pemantauan Mobilitas', tasks: [] },
        SUSPECT_NEW: { title: '🟡 Skrining Baru Belum Terkonfirmasi', badge: 'Pemeriksaan Diagnostik Pustu', tasks: [] },
      };

      filteredTasks.forEach((t) => {
        const meta = getTaskMetadata(t);
        groups[meta.conditionCategory]?.tasks.push(t);
      });

      return Object.entries(groups)
        .filter(([_, g]) => g.tasks.length > 0)
        .map(([k, g]) => ({ key: k, title: g.title, badge: g.badge, tasks: g.tasks }));
    }

    if (groupBy === 'VILLAGE_DUSUN') {
      const groups: Record<string, { title: string; badge: string; tasks: CareTask[] }> = {};

      filteredTasks.forEach((t) => {
        const v = t.villageName || villageName;
        if (!groups[v]) {
          groups[v] = { title: `📍 Wilayah ${v}`, badge: 'Cakupan Desa', tasks: [] };
        }
        groups[v].tasks.push(t);
      });

      return Object.entries(groups).map(([k, g]) => ({
        key: k,
        title: g.title,
        badge: g.badge,
        tasks: g.tasks,
      }));
    }

    return [{ key: 'all', title: 'Semua Antrean Kunjungan', tasks: filteredTasks }];
  }, [filteredTasks, groupBy, villageName]);

  // Statistics
  const totalCount = villageScopedTasks.length;
  const criticalCount = villageScopedTasks.filter((t) => (t.isCritical || t.priorityScore >= 80) && t.status !== 'CLOSED').length;
  const unassignedCount = villageScopedTasks.filter((t) => !t.assignedToUserId && t.status !== 'CLOSED').length;
  const assignedCount = villageScopedTasks.filter((t) => !!t.assignedToUserId && t.status !== 'CLOSED').length;
  const completedCount = villageScopedTasks.filter((t) => t.status === 'CLOSED').length;

  // Elderly Vulnerable Count
  const elderlyVulnerableCount = villageScopedTasks.filter((t) => {
    const meta = getTaskMetadata(t);
    return meta.isVulnerableElderly && t.status !== 'CLOSED';
  }).length;

  // Handle Assign to Kader
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForAssign || !selectedKaderId) return;

    const targetKader = kaderList.find((k) => k.id === selectedKaderId);
    const updatedTasks = tasks.map((t) => {
      if (t.id === selectedTaskForAssign.id) {
        return {
          ...t,
          status: 'ASSIGNED' as const,
          assignedToUserId: targetKader?.id,
          assignedToUserName: targetKader?.name,
          notes: assignNote
            ? `${t.notes || ''} [Instruksi Pustu: ${assignNote}]`
            : t.notes,
        };
      }
      return t;
    });

    rawStorage.setCareTasks(updatedTasks);
    setIsAssignModalOpen(false);
    setSelectedTaskForAssign(null);
    setAssignNote('');
    showToast(`Tugas kunjungan untuk ${selectedTaskForAssign.citizenName} berhasil ditugaskan ke kader ${targetKader?.name || 'Desa'}.`);
    onTaskUpdated?.();
  };

  // Handle Complete Task
  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForComplete) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === selectedTaskForComplete.id) {
        return {
          ...t,
          status: 'CLOSED' as const,
          notes: `${t.notes || ''} [Selesai dikunjungi oleh Pustu/Kader pada ${new Date().toLocaleDateString('id-ID')}. Temuan: ${completeFindingNote || 'Kondisi stabil, obat rutin diserahkan.'} | TTV: TD ${completeTtvBp} mmHg, GDS ${completeTtvGds} mg/dL]`,
        };
      }
      return t;
    });

    rawStorage.setCareTasks(updatedTasks);
    setIsCompleteModalOpen(false);
    setSelectedTaskForComplete(null);
    setCompleteFindingNote('');
    showToast(`Tugas penjangkauan untuk ${selectedTaskForComplete.citizenName} telah ditandai SELESAI.`);
    onTaskUpdated?.();
  };

  return (
    <div className="space-y-4" data-testid="daftar-tugas-pustu-component">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00201C] text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <span>Daftar Antrean Tugas Kunjungan & Penjangkauan Pustu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {filteredTasks.length} Sasaran
                </span>
              </h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                Daftar warga sasaran di <strong>{villageName} & sekitarnya</strong> dengan prioritas khusus bagi lansia rentan dan penyakit kronis.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setUrgencyFilter('ALL');
              setAgeGroupFilter('ALL');
              setChronicConditionFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              statusFilter === 'ALL' && urgencyFilter === 'ALL' && ageGroupFilter === 'ALL' && chronicConditionFilter === 'ALL'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-[#F8FBFA] text-slate-700 border-[#D8E5E2] hover:bg-slate-100'
            }`}
          >
            Semua ({totalCount})
          </button>

          {/* Quick Elderly Vulnerable Button */}
          <button
            onClick={() => {
              setAgeGroupFilter('ELDERLY');
              setUrgencyFilter('CRITICAL');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              ageGroupFilter === 'ELDERLY' && urgencyFilter === 'CRITICAL'
                ? 'bg-purple-800 text-white border-purple-800 shadow-2xs'
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            🧓 Lansia Rentan ({elderlyVulnerableCount})
          </button>

          <button
            onClick={() => {
              setUrgencyFilter('CRITICAL');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              urgencyFilter === 'CRITICAL' && ageGroupFilter === 'ALL'
                ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            🚨 Kritis ({criticalCount})
          </button>

          <button
            onClick={() => {
              setStatusFilter('UNASSIGNED');
              setUrgencyFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'UNASSIGNED'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Belum Diplot ({unassignedCount})
          </button>

          <button
            onClick={() => {
              setStatusFilter('COMPLETED');
              setUrgencyFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Selesai ({completedCount})
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-[#F8FBFA] p-3.5 rounded-xl border border-[#D8E5E2] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            Filter Lanjutan & Pengelompokan Sasaran Rentan
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedVillage('ALL');
              setUrgencyFilter('ALL');
              setStatusFilter('ALL');
              setAgeGroupFilter('ALL');
              setChronicConditionFilter('ALL');
              setGroupBy('NONE');
            }}
            className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* 1. Search Query */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIK, komorbid, obat..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* 2. Filter Kategori Usia */}
          <div>
            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value as AgeGroupFilter)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="ALL">Semua Kelompok Usia</option>
              <option value="ELDERLY">🧓 Lansia Rentan (≥ 60 Thn)</option>
              <option value="PRE_ELDERLY">🧑 Pra-Lansia (45 - 59 Thn)</option>
              <option value="PRODUCTIVE">👤 Usia Produktif (&lt; 45 Thn)</option>
            </select>
          </div>

          {/* 3. Filter Kondisi Kronis */}
          <div>
            <select
              value={chronicConditionFilter}
              onChange={(e) => setChronicConditionFilter(e.target.value as ChronicConditionFilter)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="ALL">Semua Kondisi Kronis</option>
              <option value="COMORBID">🟣 Komorbid Ganda (HT + DM)</option>
              <option value="HYPERTENSION">🔴 Hipertensi Berat / Drop-out</option>
              <option value="DIABETES">🟠 Diabetes Melitus (DM)</option>
              <option value="CARDIO_STROKE">🫀 Pasca Stroke / Kardio</option>
              <option value="SUSPECT_NEW">🟡 Skrining Suspek Baru</option>
            </select>
          </div>

          {/* 4. Filter Desa */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Desa Binaan</option>
              {assignedDesaList.map((desa) => (
                <option key={desa} value={desa}>
                  {desa}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Group By (Pengelompokan) */}
          <div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
              className="w-full px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="NONE">Tanpa Pengelompokan</option>
              <option value="AGE_GROUP">🗂️ Kelompokkan: Usia Rentan</option>
              <option value="CHRONIC_CONDITION">🩺 Kelompokkan: Penyakit Kronis</option>
              <option value="VILLAGE_DUSUN">📍 Kelompokkan: Desa & Dusun</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Queue List Sections (Grouped or Flat) */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D8E5E2] p-10 text-center text-[#60716D] space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
            <h4 className="text-sm font-bold text-black">Tidak Ada Antrean Tugas Sesuai Kriteria</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan warga sasaran yang cocok dengan kombinasi filter usia, penyakit kronis, dan status saat ini.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedVillage('ALL');
                setUrgencyFilter('ALL');
                setStatusFilter('ALL');
                setAgeGroupFilter('ALL');
                setChronicConditionFilter('ALL');
                setGroupBy('NONE');
              }}
              className="text-xs mt-2"
            >
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          groupedTaskSections.map((section) => (
            <div key={section.key} className="space-y-2">
              {/* Group Header if grouped */}
              {groupBy !== 'NONE' && (
                <div className="flex items-center justify-between bg-[#00201C] text-white px-4 py-2.5 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs sm:text-sm tracking-wide">{section.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-emerald-200 text-[10px] font-bold">
                      {section.tasks.length} Warga
                    </span>
                  </div>
                  {section.badge && (
                    <span className="text-[10px] font-semibold text-slate-300 hidden sm:inline">
                      {section.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Task Items inside this section */}
              <div className="bg-white rounded-xl border border-[#D8E5E2] overflow-hidden shadow-2xs divide-y divide-[#D8E5E2]">
                {section.tasks.map((task, index) => {
                  const meta = getTaskMetadata(task);
                  const isCritical = task.isCritical || task.priorityScore >= 80;
                  const isHigh = task.priorityScore >= 60 && task.priorityScore < 80;
                  const isCompleted = task.status === 'CLOSED';
                  const isAssigned = !!task.assignedToUserId && !isCompleted;
                  const isUnassigned = !task.assignedToUserId && !isCompleted;

                  // Priority badge
                  const priorityBadge = isCritical ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      KRITIS ({task.priorityScore})
                    </span>
                  ) : isHigh ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                      TINGGI ({task.priorityScore})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      RUTIN ({task.priorityScore})
                    </span>
                  );

                  return (
                    <div
                      key={task.id || index}
                      className={`p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        meta.isVulnerableElderly && !isCompleted
                          ? 'bg-purple-50/40 hover:bg-purple-50/70 border-l-4 border-l-purple-700'
                          : isCritical && !isCompleted
                          ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-600'
                          : isCompleted
                          ? 'bg-emerald-50/20 hover:bg-emerald-50/40 opacity-80'
                          : 'hover:bg-[#F8FBFA] border-l-4 border-l-emerald-600'
                      }`}
                    >
                      {/* Left Column: Citizen Details & Health Case */}
                      <div className="space-y-2 min-w-0 flex-1">
                        {/* Top Row: Antrean Number, Name, Age, NIK, Village, Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#00201C] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm text-black hover:underline cursor-pointer">
                            {task.citizenName || 'Warga Sasaran'}
                          </span>

                          {/* Age & Demographic Tag */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              meta.ageGroup === 'ELDERLY'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : meta.ageGroup === 'PRE_ELDERLY'
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {meta.estimatedAge} Thn ({meta.ageGroupLabel.split(' ')[0]})
                          </span>

                          <span className="text-xs font-mono text-[#60716D]">
                            NIK: {task.citizenNik || '8207...'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-700" />
                            {task.villageName || villageName}
                          </span>
                          {priorityBadge}

                          {/* Vulnerable Elderly Highlight Banner */}
                          {meta.isVulnerableElderly && !isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-700 text-white font-bold text-[9px] flex items-center gap-1 shadow-2xs">
                              ⚠️ LANSIA PRIORITAS KHUSUS
                            </span>
                          )}

                          {/* Status indicator */}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Selesai Dikunjungi
                            </span>
                          )}
                          {isAssigned && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              Kader: {task.assignedToUserName}
                            </span>
                          )}
                          {isUnassigned && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-700" />
                              Belum Ada Kader
                            </span>
                          )}
                        </div>

                        {/* Chronic Condition Banner & Action Plan */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              meta.conditionCategory === 'COMORBID'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : meta.conditionCategory === 'HYPERTENSION'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : meta.conditionCategory === 'DIABETES'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {meta.conditionLabel}
                          </span>
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            {(task as any).title || task.actionText || 'Kunjungan Rumah Pemantauan Hipertensi / Diabetes'}
                          </span>
                        </div>

                        {/* Problem Description & Reason */}
                        <p className="text-xs text-[#60716D] leading-relaxed">
                          {(task as any).reason ||
                            (task as any).problem ||
                            task.completionCriteria ||
                            'Pasien memiliki tekanan darah tinggi dan belum melakukan evaluasi kontrol berkala dalam 30 hari terakhir. Diperlukan pengecekan kepatuhan obat dan pemantauan keluhan fisik.'}
                        </p>

                        {/* Metadata strip: Deadline, Target Activity, Notes */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Batas Waktu: <strong>{(task as any).dueDate || task.dueAt || '3 Hari Kerja'}</strong></span>
                          </div>

                          {(task as any).category && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-slate-400" />
                              <span>Kategori: <strong>{(task as any).category}</strong></span>
                            </div>
                          )}

                          {(task as any).notes && (
                            <div className="text-slate-500 italic truncate max-w-md">
                              Catatan: {(task as any).notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Interactive Action Controls */}
                      <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#D8E5E2]">
                        {/* Action 1: WhatsApp Warga */}
                        {task.citizenPhone && (
                          <a
                            href={`https://wa.me/${task.citizenPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Warga</span>
                          </a>
                        )}

                        {/* Action 2: Tugaskan ke Kader Posyandu */}
                        {!isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTaskForAssign(task);
                              setSelectedKaderId(task.assignedToUserId || kaderList[0]?.id || '');
                              setIsAssignModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                            <span>{isAssigned ? 'Ganti Kader' : 'Tugaskan Kader'}</span>
                          </Button>
                        )}

                        {/* Action 3: Selesaikan Kunjungan / Catat Temuan */}
                        {!isCompleted && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedTaskForComplete(task);
                              setIsCompleteModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Catat Selesai</span>
                          </Button>
                        )}

                        {/* Action 4: Tandai Ulang / Buka Kembali bila Completed */}
                        {isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedTasks = tasks.map((t) => {
                                if (t.id === task.id) {
                                  return { ...t, status: 'OPEN' as const };
                                }
                                return t;
                              });
                              rawStorage.setCareTasks(updatedTasks);
                              showToast(`Tugas untuk ${task.citizenName} dibuka kembali.`);
                              onTaskUpdated?.();
                            }}
                            className="text-[11px] text-slate-500 hover:text-black cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            <span>Buka Kembali Tugas</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: ASSIGN TASK TO KADER */}
      {isAssignModalOpen && selectedTaskForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Tugaskan Penjangkauan ke Kader</h3>
                  <p className="text-[11px] text-[#60716D]">{selectedTaskForAssign.citizenName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">{(selectedTaskForAssign as any).title || selectedTaskForAssign.actionText || 'Kunjungan Lapangan'}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{(selectedTaskForAssign as any).reason || (selectedTaskForAssign as any).problem || selectedTaskForAssign.completionCriteria || 'Pemantauan berkala kondisi kesehatan warga'}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Kader Posyandu *</label>
                <select
                  required
                  value={selectedKaderId}
                  onChange={(e) => setSelectedKaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  {kaderList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.villageAssignmentName || villageName}) - HP: {k.phone || '-'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instruksi Khusus dari Petugas Pustu</label>
                <textarea
                  rows={3}
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Contoh: Tolong datangi rumah bapak/ibu di Dusun 1, cek apakah ada keluhan pusing, ingatkan minum obat dan ajak kontrol ke Pustu..."
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-700 hover:bg-blue-600 text-white"
                >
                  Kirim Tugas ke Kader
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPLETE TASK & LOG FINDINGS */}
      {isCompleteModalOpen && selectedTaskForComplete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Catat Hasil Kunjungan & Selesaikan</h3>
                  <p className="text-[11px] text-[#60716D]">{selectedTaskForComplete.citizenName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hasil Tensi / TD (mmHg)</label>
                  <input
                    type="text"
                    value={completeTtvBp}
                    onChange={(e) => setCompleteTtvBp(e.target.value)}
                    placeholder="130/85"
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hasil Gula Darah / GDS</label>
                  <input
                    type="number"
                    value={completeTtvGds}
                    onChange={(e) => setCompleteTtvGds(e.target.value)}
                    placeholder="135"
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temuan Kunjungan Lapangan & Solusi</label>
                <textarea
                  rows={3}
                  required
                  value={completeFindingNote}
                  onChange={(e) => setCompleteFindingNote(e.target.value)}
                  placeholder="Contoh: Telah dikunjungi ke rumah di Dusun 2. Pasien dalam kondisi baik, obat Amlodipine diserahkan untuk 30 hari ke depan, diedukasi kurangi konsumsi ikan asin..."
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCompleteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  Simpan & Tandai Selesai
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
