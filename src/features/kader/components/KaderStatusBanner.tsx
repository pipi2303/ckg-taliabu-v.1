import React from 'react';
import { Wifi, WifiOff, CloudUpload, Clock, AlertCircle } from 'lucide-react';
import { useNetwork } from '../../../context/NetworkContext';
import { FieldWorkPackage } from '../../../types';

interface KaderStatusBannerProps {
  activePackage: FieldWorkPackage | null;
  pendingCount: number;
  onOpenSync: () => void;
  onOpenDeviceStatus?: () => void;
}

export const KaderStatusBanner: React.FC<KaderStatusBannerProps> = ({
  activePackage,
  pendingCount,
  onOpenSync,
  onOpenDeviceStatus,
}) => {
  const { networkMode, isOffline, isSlow } = useNetwork();

  // Format absolute dates
  const formatAbsoluteDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const isExpired = activePackage ? new Date(activePackage.expiresAt).getTime() < Date.now() : false;

  return (
    <div className="bg-[#00201C] text-white px-3.5 py-2.5 shadow-xs border-b border-[#D8E5E2]/20">
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Network & Offline Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isOffline ? (
            <span className="flex items-center gap-1 bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded font-semibold text-[11px]">
              <WifiOff className="w-3 h-3 text-slate-300" />
              Luring
            </span>
          ) : isSlow ? (
            <span className="flex items-center gap-1 bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded font-semibold text-[11px]">
              <Wifi className="w-3 h-3 text-amber-300" />
              Sinyal Lemah
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-semibold text-[11px]">
              <Wifi className="w-3 h-3 text-emerald-300" />
              Daring
            </span>
          )}
        </div>

        {/* Unsynced Work Badge (Clickable) */}
        <button
          onClick={onOpenSync}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            pendingCount > 0
              ? 'bg-[#FFFACD] text-black shadow-2xs hover:bg-yellow-200'
              : 'bg-white/10 text-emerald-200 hover:bg-white/20'
          }`}
          title="Klik untuk membuka Pusat Sinkronisasi"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>{pendingCount > 0 ? `${pendingCount} belum terkirim` : 'Tersinkron'}</span>
        </button>
      </div>

      {/* Package Validity Context (Always visible) */}
      <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
        <div className="truncate">
          {activePackage ? (
            <span>
              Diunduh: <strong>{formatAbsoluteDate(activePackage.downloadedAt)}</strong>
            </span>
          ) : (
            <span className="text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Belum ada paket aktif
            </span>
          )}
        </div>

        {activePackage && (
          <div
            onClick={onOpenDeviceStatus}
            className={`cursor-pointer hover:underline flex items-center gap-1 ${
              isExpired ? 'text-red-300 font-bold' : 'text-slate-300'
            }`}
          >
            <Clock className="w-2.5 h-2.5" />
            <span>
              {isExpired ? 'Kedaluwarsa: ' : 'Berlaku: '}
              <strong>{formatAbsoluteDate(activePackage.expiresAt)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Reassurance Message for Offline */}
      {isOffline && (
        <p className="text-[10px] text-emerald-300/90 mt-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded">
          ✓ Anda tetap dapat mencatat kunjungan. Data tersimpan aman di perangkat.
        </p>
      )}
    </div>
  );
};
