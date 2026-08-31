import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  MapPin,
  FileEdit,
  ShieldAlert,
  Download,
  AlertCircle,
  Search,
  Eye,
} from 'lucide-react';
import { FieldWorkPackage, KaderAssignmentPayload } from '../../../types';
import { fieldVisitService } from '../../../services/fieldVisitService';
import { ActionIconButton } from '../../../components/common/ActionIconButton';
import { KaderCitizenCardModal } from '../modals/KaderCitizenCardModal';
import { RecordVisitModal } from '../modals/RecordVisitModal';

interface TodayVisitListPageProps {
  activePackage: FieldWorkPackage | null;
  onOpenDownloadPackage: () => void;
  onRefresh: () => void;
}

export const TodayVisitListPage: React.FC<TodayVisitListPageProps> = ({
  activePackage,
  onOpenDownloadPackage,
  onRefresh,
}) => {
  const [selectedHamlet, setSelectedHamlet] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'PUSKESMAS' | 'MY_ROUTE'>('PUSKESMAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected assignment for modals
  const [selectedForCard, setSelectedForCard] = useState<KaderAssignmentPayload | null>(null);
  const [selectedForRecord, setSelectedForRecord] = useState<KaderAssignmentPayload | null>(null);

  const localVisits = fieldVisitService.getAllLocalVisits();
  const recordedTaskIds = useMemo(() => new Set(localVisits.map((v) => v.taskId)), [localVisits]);

  // Extract all hamlets
  const hamlets = useMemo(() => {
    if (!activePackage) return [];
    const set = new Set<string>();
    activePackage.assignments.forEach((a) => {
      if (a.dusunOrHamlet) set.add(a.dusunOrHamlet);
    });
    return Array.from(set);
  }, [activePackage]);

  // Filtered and sorted assignments
  const filteredAssignments = useMemo(() => {
    if (!activePackage) return [];
    let list = [...activePackage.assignments];

    // Filter by hamlet
    if (selectedHamlet !== 'ALL') {
      list = list.filter((a) => a.dusunOrHamlet === selectedHamlet);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) => a.citizenName.toLowerCase().includes(q) || a.addressText.toLowerCase().includes(q)
      );
    }

    // Sort mode
    if (sortMode === 'MY_ROUTE') {
      // Unrecorded first, then alphabetical by address
      list.sort((a, b) => {
        const aRecorded = recordedTaskIds.has(a.taskId);
        const bRecorded = recordedTaskIds.has(b.taskId);
        if (!aRecorded && bRecorded) return -1;
        if (aRecorded && !bRecorded) return 1;
        return a.addressText.localeCompare(b.addressText);
      });
    } else {
      // Puskesmas priority: urgent first, then serverPriorityOrder
      list.sort((a, b) => {
        if (a.urgentOperationalFlag && !b.urgentOperationalFlag) return -1;
        if (!a.urgentOperationalFlag && b.urgentOperationalFlag) return 1;
        return a.serverPriorityOrder - b.serverPriorityOrder;
      });
    }

    return list;
  }, [activePackage, selectedHamlet, sortMode, searchQuery, recordedTaskIds]);

  const totalCount = activePackage?.assignments.length || 0;
  const recordedCount = activePackage
    ? activePackage.assignments.filter((a) => recordedTaskIds.has(a.taskId)).length
    : 0;
  const remainingCount = totalCount - recordedCount;

  if (!activePackage || activePackage.assignments.length === 0) {
    return (
      <div className="p-4 space-y-4 text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#EBF7F2] text-[#2E7D5B] flex items-center justify-center mx-auto">
          <ClipboardList className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-black">Belum Ada Paket Kerja Aktif</h3>
          <p className="text-xs text-[#60716D] max-w-xs mx-auto">
            Unduh paket sasaran kunjungan warga untuk desa binaan Anda agar dapat bekerja secara luring.
          </p>
        </div>
        <button
          onClick={onOpenDownloadPackage}
          className="min-h-[48px] px-6 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Unduh Paket Kerja Sekarang</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-3 pb-24">
      {/* Kartu Ringkasan Target Harian Kader */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wide">Target Kunjungan Hari Ini</h3>
            <p className="text-[11px] text-[#60716D]">
              {remainingCount === 0
                ? '🎉 Luar biasa! Semua sasaran kunjungan hari ini sudah selesai.'
                : `Masih ada ${remainingCount} rumah warga yang perlu dikunjungi.`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-[#2E7D5B]">
              {recordedCount}<span className="text-xs font-semibold text-[#60716D]">/{totalCount}</span>
            </span>
            <p className="text-[10px] text-[#60716D]">Warga Selesai</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5E9E8] h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-[#2E7D5B] h-full rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (recordedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Status Kunjungan Singkat */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 bg-[#EBF7F2] rounded-xl text-center border border-[#2E7D5B]/20">
            <p className="text-sm font-bold text-[#2E7D5B]">{totalCount}</p>
            <p className="text-[10px] text-[#334643] font-medium">Total Sasaran</p>
          </div>
          <div className="p-2 bg-[#FFFACD] rounded-xl text-center border border-yellow-300">
            <p className="text-sm font-bold text-amber-950">{recordedCount}</p>
            <p className="text-[10px] text-amber-900 font-medium">Sudah Dicatat</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl text-center border border-slate-200">
            <p className="text-sm font-bold text-slate-800">{remainingCount}</p>
            <p className="text-[10px] text-slate-600 font-medium">Perlu Dikunjungi</p>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#60716D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama warga / alamat..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-1 focus:ring-[#00201C] outline-none"
          />
        </div>

        {/* Sort & Hamlet Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {/* Sort button */}
          <button
            onClick={() => setSortMode(sortMode === 'PUSKESMAS' ? 'MY_ROUTE' : 'PUSKESMAS')}
            className={`min-h-[40px] px-3 rounded-xl border flex items-center gap-1.5 whitespace-nowrap shrink-0 font-semibold cursor-pointer ${
              sortMode === 'MY_ROUTE'
                ? 'bg-[#00201C] text-white border-[#00201C]'
                : 'bg-white text-[#334643] border-[#D8E5E2]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortMode === 'PUSKESMAS' ? 'Prioritas Puskesmas' : 'Urutan Saya (Rute)'}</span>
          </button>

          {/* Hamlet filters */}
          <button
            onClick={() => setSelectedHamlet('ALL')}
            className={`min-h-[40px] px-3 rounded-xl border whitespace-nowrap shrink-0 font-semibold cursor-pointer ${
              selectedHamlet === 'ALL'
                ? 'bg-[#2E7D5B] text-white border-[#2E7D5B]'
                : 'bg-white text-[#60716D] border-[#D8E5E2]'
            }`}
          >
            Semua Dusun
          </button>

          {hamlets.map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHamlet(h)}
              className={`min-h-[40px] px-3 rounded-xl border whitespace-nowrap shrink-0 font-semibold cursor-pointer ${
                selectedHamlet === 'h'
                  ? 'bg-[#2E7D5B] text-white border-[#2E7D5B]'
                  : 'bg-white text-[#60716D] border-[#D8E5E2]'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Visit List (Large, Clear, High-Contrast Cards) */}
      <div className="space-y-2.5">
        {filteredAssignments.map((assignment) => {
          const isRecorded = recordedTaskIds.has(assignment.taskId);
          const localVisit = fieldVisitService.getLocalVisitForTask(assignment.taskId);

          return (
            <div
              key={assignment.taskId}
              className={`p-3.5 rounded-2xl border transition-all ${
                isRecorded
                  ? 'bg-slate-50 border-[#D8E5E2] opacity-90'
                  : assignment.urgentOperationalFlag
                  ? 'bg-white border-red-300 shadow-xs ring-1 ring-red-200'
                  : 'bg-white border-[#D8E5E2] shadow-2xs hover:border-[#00201C]'
              }`}
            >
              {/* Card Header: Operational Urgency or Priority Tag */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                {assignment.urgentOperationalFlag ? (
                  <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wide">
                    <ShieldAlert className="w-3 h-3 text-amber-300" />
                    TINDAKAN SEGERA
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#60716D]">
                    Prioritas #{assignment.serverPriorityOrder}
                  </span>
                )}

                {/* Status Badge */}
                {isRecorded ? (
                  <span className="text-[10px] font-bold bg-[#FFFACD] text-amber-950 px-2 py-0.5 rounded border border-yellow-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    Sudah Dicatat ({localVisit?.outcome === 'AGREED_TO_ATTEND' ? 'Bersedia' : localVisit?.outcome})
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#2E7D5B] bg-[#EBF7F2] px-2 py-0.5 rounded">
                    Belum Dikunjungi
                  </span>
                )}
              </div>

              {/* Citizen Details (Clickable to open Citizen Card) */}
              <div
                onClick={() => setSelectedForCard(assignment)}
                className="cursor-pointer space-y-1 group"
              >
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-bold text-black group-hover:text-[#2E7D5B] transition-colors">
                    {assignment.citizenName}
                  </h4>
                  {assignment.age && (
                    <span className="text-[11px] text-[#60716D] font-medium">{assignment.age} Thn</span>
                  )}
                </div>

                <div className="flex items-start gap-1.5 text-xs text-[#60716D]">
                  <MapPin className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0 mt-0.5" />
                  <span className="truncate">{assignment.addressText}</span>
                </div>

                {/* Operational Action Text (Pure S2 - NO DIAGNOSIS) */}
                <p className="text-xs text-[#334643] bg-[#F8FBFA] p-2 rounded-lg border border-[#D8E5E2]/80 mt-1 leading-snug">
                  {assignment.actionText}
                </p>
              </div>

              {/* Card Actions: Direct "Catat Hasil" (Zero friction requirement) */}
              <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForRecord(assignment)}
                  className={`flex-1 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    isRecorded
                      ? 'bg-white border border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                      : 'bg-[#00201C] hover:bg-[#102521] text-white'
                  }`}
                >
                  <FileEdit className={`w-4 h-4 ${isRecorded ? 'text-[#60716D]' : 'text-emerald-400'}`} />
                  <span>{isRecorded ? 'Ubah Catatan' : 'Catat Hasil'}</span>
                </button>

                <ActionIconButton
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedForCard(assignment)}
                  icon={<Eye className="w-4 h-4 text-[#00201C]" />}
                  tooltip="Buka Kartu & Rekam Riwayat Warga (SCR-KDR-C01)"
                  tooltipPosition="left"
                  className="min-h-[44px] min-w-[44px]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedForCard && (
        <KaderCitizenCardModal
          isOpen={!!selectedForCard}
          onClose={() => setSelectedForCard(null)}
          assignment={selectedForCard}
          onUpdate={onRefresh}
        />
      )}

      {selectedForRecord && (
        <RecordVisitModal
          isOpen={!!selectedForRecord}
          onClose={() => setSelectedForRecord(null)}
          assignment={selectedForRecord}
          onVisitSaved={() => onRefresh()}
        />
      )}
    </div>
  );
};
