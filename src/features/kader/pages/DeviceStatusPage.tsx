import React, { useState } from 'react';
import {
  Smartphone,
  HardDrive,
  Clock,
  CloudUpload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { kaderStorageRepo } from '../../../repositories/kaderStorageRepo';
import { localQueueService } from '../../../services/localQueueService';
import { kaderSyncService } from '../../../services/kaderSyncService';
import { FieldWorkPackage } from '../../../types';

interface DeviceStatusPageProps {
  activePackage: FieldWorkPackage | null;
  onOpenDownloadPackage: () => void;
  onOpenSimulator: () => void;
  onRefresh: () => void;
}

export const DeviceStatusPage: React.FC<DeviceStatusPageProps> = ({
  activePackage,
  onOpenDownloadPackage,
  onOpenSimulator,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [isPurging, setIsPurging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingCount = localQueueService.getPendingCount(currentUser?.id);
  const deviceState = kaderStorageRepo.getDeviceState();

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  // Calculate remaining days
  let remainingDays = 0;
  let isExpired = false;
  if (activePackage?.expiresAt) {
    const diffMs = new Date(activePackage.expiresAt).getTime() - Date.now();
    remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (remainingDays < 0) {
      isExpired = true;
      remainingDays = 0;
    }
  }

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const res = await kaderSyncService.syncQueue(currentUser.id);
      toast.info('Status Sinkronisasi', res.message);
      onRefresh();
    } catch (err: any) {
      toast.error('Gagal Sinkronisasi', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmPurgePackage = () => {
    kaderStorageRepo.purgeExpiredPackage('USER_MANUAL_PURGE');
    setIsPurging(false);
    toast.info(
      'Paket Dihapus',
      'Paket unduhan warga dibersihkan. Catatan kunjungan lokal yang belum terkirim TETAP AMAN di antrean perangkat.'
    );
    onRefresh();
  };

  return (
    <div className="p-3.5 space-y-3 pb-24 text-xs">
      {/* Header Info Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#EBF7F2] text-[#2E7D5B]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black">Status Gawai & Paket (A03)</h3>
            <p className="text-[11px] text-[#60716D]">
              Pengaturan luring, penyimpanan, dan masa berlaku
            </p>
          </div>
        </div>
      </div>

      {/* Package Lifecycle Specs */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <h4 className="font-bold text-black text-xs">Masa Berlaku Paket Wilayah</h4>

        {activePackage ? (
          <div className="space-y-2 text-[#334643]">
            <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="text-[#60716D]">Wilayah Kerja:</span>
              <span className="font-bold text-black">{activePackage.villageName}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="text-[#60716D]">Data Diunduh:</span>
              <span className="font-semibold text-black">{formatDate(activePackage.downloadedAt)}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="text-[#60716D]">Berlaku Sampai:</span>
              <span className={`font-semibold ${isExpired ? 'text-red-700 font-bold' : 'text-black'}`}>
                {formatDate(activePackage.expiresAt)}
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="text-[#60716D]">Sisa Masa Berlaku:</span>
              <span className="font-bold text-[#2E7D5B]">
                {isExpired ? 'Kedaluwarsa' : `${remainingDays} Hari Lagi`}
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
              <span className="text-[#60716D]">Jumlah Sasaran:</span>
              <span className="font-semibold text-black">{activePackage.assignmentCount} Warga</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
            <p className="text-xs text-amber-900 font-semibold">Tidak ada paket kerja aktif</p>
            <button
              onClick={onOpenDownloadPackage}
              className="px-4 py-2 bg-[#00201C] text-white rounded-xl font-bold text-xs cursor-pointer"
            >
              Unduh Paket Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Storage & Sync Status */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <h4 className="font-bold text-black text-xs">Penyimpanan & Kuota Transmisi</h4>

        <div className="space-y-2 text-[#334643]">
          <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <span className="text-[#60716D]">Catatan Belum Terkirim:</span>
            <span className="font-bold text-amber-800">{pendingCount} Catatan</span>
          </div>

          <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <span className="text-[#60716D]">Total Data Digunakan:</span>
            <span className="font-mono font-bold text-black">{deviceState.totalSyncBytesUsed || 0} KB</span>
          </div>

          <div className="flex justify-between p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <span className="text-[#60716D]">Status Jam Gawai:</span>
            <span className="font-semibold text-black">
              {deviceState.simulatedClockSkewMinutes !== 0 ? 'Clock Skew Aktif (+5 Hari)' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Package Management Actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="w-full min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <CloudUpload className="w-4 h-4 text-emerald-400" />
          <span>Sinkronkan Sekarang ({pendingCount} Tertunda)</span>
        </button>

        <button
          onClick={onOpenDownloadPackage}
          className="w-full min-h-[48px] bg-white border border-[#D8E5E2] text-black hover:bg-[#F8FBFA] rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-[#2E7D5B]" />
          <span>Perbarui / Unduh Ulang Paket</span>
        </button>

        {activePackage && (
          <button
            onClick={() => setIsPurging(true)}
            className="w-full min-h-[44px] bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Paket Baca Warga</span>
          </button>
        )}

        <button
          onClick={onOpenSimulator}
          className="w-full min-h-[44px] bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Sliders className="w-4 h-4 text-slate-700" />
          <span>Buka Panel Simulator & Pengujian (12 Skenario)</span>
        </button>
      </div>

      {/* Purge Safe Modal */}
      {isPurging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsPurging(false)}
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl z-10 space-y-4 border border-[#D8E5E2]">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Hapus Paket Baca</span>
            </div>

            <p className="text-xs text-[#334643] leading-relaxed">
              Paket daftar warga akan dibersihkan dari memori gawai.
            </p>

            {/* Zero-Loss Safe Notice (Hard Requirement) */}
            <div className="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-[11px] font-medium">
              ✓ Catatan kunjungan yang belum terkirim akan <strong>tetap disimpan</strong> sampai berhasil dikirim.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsPurging(false)}
                className="flex-1 min-h-[44px] border border-[#D8E5E2] text-[#334643] rounded-xl font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPurgePackage}
                className="flex-1 min-h-[44px] bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
