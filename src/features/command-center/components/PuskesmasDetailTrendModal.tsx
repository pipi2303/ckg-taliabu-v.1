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
      <div className="bg-[#faf9f6] border border-stone-300 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">
                  Evaluasi Detail & Tren Longitudinal Puskesmas
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-teal-800 border border-stone-200">
                  Tahun 2026
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Pilih faskes untuk mengamati fluktuasi kinerja bulanan, beban kerja, dan kepatuhan standar SPM secara presisi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Quick Puskesmas Switcher Dropdown inside Modal */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-medium hidden sm:inline">Puskesmas:</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-white border border-stone-300 text-stone-900 rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-hidden cursor-pointer shadow-2xs"
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
              className="p-2 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Facility Profile Context Card */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-black">{currentFacility.facilityName}</span>
                <span className="text-stone-500 font-medium">({currentFacility.kecamatanName})</span>
                {currentFacility.isRemoteIsland && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <Ship className="w-3 h-3" />
                    Pesisir / Terisolir
                  </span>
                )}
              </div>
              <p className="text-stone-600 text-xs">{currentFacility.accessibilityContext}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-xl bg-[#faf9f6] border border-stone-200 text-center px-3">
                <p className="text-[10px] text-stone-500">Total Skrining</p>
                <p className="font-mono font-bold text-sky-700 text-sm">{currentFacility.screenedCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#faf9f6] border border-stone-200 text-center px-3">
                <p className="text-[10px] text-stone-500">Warga Ditangani</p>
                <p className="font-mono font-bold text-emerald-700 text-sm">{currentFacility.attendedFollowUpCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#faf9f6] border border-stone-200 text-center px-3">
                <p className="text-[10px] text-stone-500">Kontinuitas Layanan</p>
                <p className="font-mono font-bold text-teal-700 text-sm">{currentFacility.continuityRate}%</p>
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
