import React, { useState } from 'react';
import {
  X,
  Building2,
  Ship,
  MapPin,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { PuskesmasMonthlyTrendChart } from './PuskesmasMonthlyTrendChart';
import { FacilityPerformanceSummary } from '../../../types';

interface PuskesmasDetailTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFacilityId?: string;
  facilities: FacilityPerformanceSummary[];
}

export const PuskesmasDetailTrendModal: React.FC<PuskesmasDetailTrendModalProps> = ({
  isOpen,
  onClose,
  initialFacilityId,
  facilities,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialFacilityId || facilities[0]?.facilityId || 'faskes-1'
  );

  // Sync if initialFacilityId changes when opened
  React.useEffect(() => {
    if (initialFacilityId) {
      setSelectedId(initialFacilityId);
    }
  }, [initialFacilityId]);

  if (!isOpen) return null;

  const currentFacility =
    facilities.find((f) => f.facilityId === selectedId) ||
    facilities[0] || {
      facilityId: 'faskes-1',
      facilityName: 'Puskesmas Bobong',
      kecamatanName: 'Taliabu Barat',
      isRemoteIsland: false,
      accessibilityContext: 'Ibu kota kabupaten. Akses jalan darat utama tersedia.',
      screenedCount: 310,
      eligibleFollowUpCount: 142,
      attendedFollowUpCount: 88,
      continuityRate: 62.0,
      manualClosureCount: 8,
      manualClosureRatio: 9.1,
      dataCompleteness: 'COMPLETE' as const,
      pendingKaderSyncCount: 0,
      topBarriers: [],
      notes: [],
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8EFEB] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EBF7F2] dark:bg-teal-950/40 text-[#2E7D5B] dark:text-teal-400 border border-[#BBE5D4] dark:border-teal-800 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#102521] dark:text-white tracking-tight">
                  Evaluasi Detail & Tren Longitudinal Puskesmas
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F8FBFA] dark:bg-slate-800 text-[#00201C] dark:text-teal-300 border border-[#D8E5E2] dark:border-slate-700">
                  Tahun 2026
                </span>
              </div>
              <p className="text-xs text-[#60716D] dark:text-slate-400">
                Pilih faskes untuk mengamati fluktuasi kinerja bulanan, beban kerja, dan kepatuhan standar SPM secara presisi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Quick Puskesmas Switcher Dropdown inside Modal */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#60716D] dark:text-slate-400 font-medium hidden sm:inline">Puskesmas:</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 text-[#102521] dark:text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-[#00201C] outline-hidden cursor-pointer shadow-2xs"
              >
                {facilities.map((f) => (
                  <option key={f.facilityId} value={f.facilityId}>
                    {f.facilityName} ({f.kecamatanName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#60716D] hover:text-[#102521] dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-[#F8FBFA] dark:hover:bg-slate-800 transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Facility Profile Context Card */}
          <div className="p-4 rounded-xl bg-[#F8FBFA] dark:bg-slate-800/80 border border-[#D8E5E2] dark:border-slate-700 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#102521] dark:text-white">{currentFacility.facilityName}</span>
                <span className="text-[#60716D] dark:text-slate-400 font-medium">({currentFacility.kecamatanName})</span>
                {currentFacility.isRemoteIsland && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Ship className="w-3 h-3" />
                    Pesisir / Terisolir
                  </span>
                )}
              </div>
              <p className="text-[#60716D] dark:text-slate-400 text-xs">{currentFacility.accessibilityContext}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-700 text-center px-3">
                <p className="text-[10px] text-[#60716D] dark:text-slate-400">Total Skrining</p>
                <p className="font-mono font-bold text-sky-700 dark:text-sky-400 text-sm">{currentFacility.screenedCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-700 text-center px-3">
                <p className="text-[10px] text-[#60716D] dark:text-slate-400">Warga Ditangani</p>
                <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{currentFacility.attendedFollowUpCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-700 text-center px-3">
                <p className="text-[10px] text-[#60716D] dark:text-slate-400">Kontinuitas Layanan</p>
                <p className="font-mono font-bold text-[#00201C] dark:text-teal-300 text-sm">{currentFacility.continuityRate}%</p>
              </div>
            </div>
          </div>

          {/* Main Trend Line Chart Component */}
          <PuskesmasMonthlyTrendChart
            facilityId={currentFacility.facilityId}
            facilityName={currentFacility.facilityName}
            kecamatanName={currentFacility.kecamatanName}
            isRemoteIsland={currentFacility.isRemoteIsland}
          />
        </div>
      </div>
    </div>
  );
};
