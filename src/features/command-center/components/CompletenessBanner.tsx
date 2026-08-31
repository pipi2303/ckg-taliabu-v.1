import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, WifiOff, Info, RefreshCw } from 'lucide-react';
import { CountyCompletenessSummary } from '../../../services/populationQualificationService';

interface CompletenessBannerProps {
  completeness: CountyCompletenessSummary;
  onRefresh?: () => void;
}

export const CompletenessBanner: React.FC<CompletenessBannerProps> = ({ completeness, onRefresh }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isPartial = completeness.overallStatus === 'PARTIAL';
  const isComplete = completeness.overallStatus === 'COMPLETE';

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRotating(true);
      onRefresh();
      setTimeout(() => setIsRotating(false), 600);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border mb-6 transition-all ${
        isPartial
          ? 'bg-amber-50 border-amber-300 text-amber-950'
          : isComplete
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-slate-800/80 border-slate-700 text-slate-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {isPartial ? (
            <div className="p-2 bg-amber-200 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-emerald-200 text-emerald-800 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-black">Status Kelengkapan Data Dinas Kesehatan:</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isPartial
                    ? 'bg-amber-200 text-amber-900 border border-amber-400'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                }`}
              >
                {completeness.reportingRatioText}
              </span>
              <span className="text-xs text-gray-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Cut-off: {new Date(completeness.dataCutoffAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })} WIT
              </span>
            </div>

            <div className="mt-1.5 text-xs space-y-1 text-gray-800">
              {completeness.missingFacilities.length > 0 && (
                <p className="flex items-center gap-1.5 text-amber-900 font-medium">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  Belum mencakup: {completeness.missingFacilities.join(', ')} (Tidak diimputasi angka nol).
                </p>
              )}
              {completeness.totalPendingKaderSync > 0 && (
                <p className="flex items-center gap-1.5 text-gray-800">
                  <Info className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                  Terdapat {completeness.totalPendingKaderSync} catatan kunjungan kader tersimpan di perangkat offline desa (belum sync server, tidak dihitung sebagai kegagalan).
                </p>
              )}
            </div>
          </div>
        </div>

        {onRefresh && (
          <div className="relative flex items-center self-start md:self-center shrink-0">
            <button
              onClick={handleRefresh}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              aria-label="Segarkan Status"
              title="Segarkan Status"
              className="p-2.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 hover:text-teal-700 border border-slate-300 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-teal-600' : 'transition-transform duration-300 hover:rotate-45'}`} />
            </button>

            {/* Custom Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 top-full mt-1.5 z-30 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900/95 backdrop-blur-sm rounded-md shadow-lg whitespace-nowrap pointer-events-none border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150">
                Segarkan Status
                <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900/95 border-t border-l border-slate-700/80 rotate-45" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
