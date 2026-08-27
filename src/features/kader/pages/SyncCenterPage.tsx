import React, { useState } from 'react';
import {
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  HardDrive,
  Calendar,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { localQueueService } from '../../../services/localQueueService';
import { kaderSyncService, SyncBatchResult } from '../../../services/kaderSyncService';
import { kaderStorageRepo } from '../../../repositories/kaderStorageRepo';

interface SyncCenterPageProps {
  onRefresh: () => void;
}

export const SyncCenterPage: React.FC<SyncCenterPageProps> = ({ onRefresh }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncBatchResult | null>(null);

  const queueItems = localQueueService.getAllQueueItems(currentUser?.id);
  const queueSummary = localQueueService.getQueueSummary(currentUser?.id);
  const conflicts = kaderStorageRepo.getConflicts();
  const deviceState = kaderStorageRepo.getDeviceState();

  const handleRunSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await kaderSyncService.syncQueue(currentUser.id);
      setSyncResult(res);

      if (res.syncedCount > 0) {
        toast.success('Sinkronisasi Sukses', res.message);
      } else if (res.failedCount > 0) {
        toast.warning('Sinkronisasi Tertunda', res.message);
      } else {
        toast.info('Status Data', res.message);
      }
      onRefresh();
    } catch (err: any) {
      toast.error('Gagal Sinkronisasi', err.message || 'Terjadi kesalahan sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetryFailed = () => {
    localQueueService.retryFailedItems(currentUser?.id);
    toast.info('Antrean Disetel Ulang', 'Catatan siap untuk dikirim ulang.');
    onRefresh();
  };

  return (
    <div className="p-3.5 space-y-3 pb-24 text-xs">
      {/* Top Banner: Status & Action */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EBF7F2] text-[#2E7D5B]">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">Pusat Antrean & Sinkronisasi (E01)</h3>
              <p className="text-[11px] text-[#60716D]">
                Data aman tersimpan luring & dikirim idempotensial
              </p>
            </div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-[#FFFACD] rounded-xl border border-yellow-300">
            <p className="text-lg font-bold text-black">{queueSummary.pending}</p>
            <p className="text-[10px] text-amber-900 font-semibold">Belum Dikirim</p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-lg font-bold text-[#2E7D5B]">{queueSummary.synced}</p>
            <p className="text-[10px] text-emerald-800 font-semibold">Terkirim</p>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-lg font-bold text-amber-800">{queueSummary.failed}</p>
            <p className="text-[10px] text-amber-900 font-semibold">Tertunda</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-lg font-bold text-purple-800">{queueSummary.conflict}</p>
            <p className="text-[10px] text-purple-900 font-semibold">Konflik</p>
          </div>
        </div>

        {/* Sync Usage Info */}
        <div className="flex items-center justify-between text-[11px] text-[#60716D] pt-1">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-[#2E7D5B]" />
            Penggunaan Data Terakhir: <strong>{deviceState.lastSyncBytesUsed || 0} KB</strong>
          </span>
          <span>Total: {deviceState.totalSyncBytesUsed || 0} KB</span>
        </div>

        {/* Primary Sync Actions (48px Touch Target) */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleRunSync}
            disabled={isSyncing}
            className="flex-1 min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sedang Mengirim...' : 'Kirim Sekarang'}</span>
          </button>

          {queueSummary.failed > 0 && (
            <button
              onClick={handleRetryFailed}
              className="min-h-[48px] px-4 bg-white border border-amber-300 text-amber-900 rounded-xl font-semibold text-xs hover:bg-amber-50 cursor-pointer"
            >
              Coba Ulang
            </button>
          )}
        </div>

        {syncResult && (
          <div className="p-3 bg-[#EBF7F2] border border-[#2E7D5B]/30 rounded-xl text-[11px] text-black space-y-0.5">
            <p className="font-bold">Laporan Pengiriman Terakhir:</p>
            <p>{syncResult.message}</p>
            <p className="text-[10px] text-[#2E7D5B]">Kuota terpakai: {syncResult.bytesTransferredKb} KB</p>
          </div>
        )}
      </div>

      {/* Sync Conflicts Section if any */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-purple-700" />
            <span>Perhatian Penyesuaian Jadwal / Catatan ({conflicts.length})</span>
          </div>

          <div className="space-y-2">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>{c.conflictType}</span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                    {c.resolutionState}
                  </span>
                </div>
                <p className="text-xs">{c.serverSummary}</p>
                <p className="text-[10px] text-purple-800 italic">Tindakan: {c.localSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Items Detail List */}
      <div className="space-y-2">
        <h4 className="font-bold text-black text-xs">Daftar Rekaman di Gawai ({queueItems.length})</h4>

        {queueItems.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-[#D8E5E2] space-y-1">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D5B] mx-auto" />
            <p className="text-xs font-bold text-black">Antrean Bersih</p>
            <p className="text-[11px] text-[#60716D]">
              Semua catatan kunjungan dan jadwal telah tersinkronisasi.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {queueItems.map((item) => {
              const isUrgent = item.syncPriority === 'HIGHEST';
              const isSynced = item.syncStatus === 'SYNCED';

              return (
                <div
                  key={item.id}
                  className={`p-3 bg-white rounded-xl border transition-all ${
                    isUrgent
                      ? 'border-red-300 shadow-2xs'
                      : isSynced
                      ? 'border-[#D8E5E2] opacity-80'
                      : 'border-[#D8E5E2]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-black">
                      {item.entityType === 'FIELD_VISIT' ? (
                        <FileText className="w-3.5 h-3.5 text-[#2E7D5B]" />
                      ) : item.entityType === 'SCHEDULING_REQUEST' ? (
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      ) : item.entityType === 'URGENT_ESCALATION' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>
                        {item.entityType === 'FIELD_VISIT'
                          ? 'Hasil Kunjungan'
                          : item.entityType === 'SCHEDULING_REQUEST'
                          ? 'Pengajuan Jadwal'
                          : item.entityType === 'URGENT_ESCALATION'
                          ? 'Eskalasi Mendesak'
                          : 'Tanggapan Penugasan'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.syncStatus === 'SYNCED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : item.syncStatus === 'FAILED'
                          ? 'bg-red-100 text-red-900'
                          : item.syncStatus === 'CONFLICT'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-yellow-100 text-yellow-900'
                      }`}
                    >
                      {item.syncStatus === 'SYNCED'
                        ? 'Tersinkron'
                        : item.syncStatus === 'FAILED'
                        ? 'Tertunda'
                        : item.syncStatus === 'CONFLICT'
                        ? 'Konflik'
                        : 'Belum Terkirim'}
                    </span>
                  </div>

                  {/* Safe context label */}
                  <p className="text-xs text-[#334643] font-medium truncate">
                    {item.payload?.citizenName || 'Warga CKG'}
                    {item.payload?.outcome ? ` — ${item.payload.outcome}` : ''}
                    {item.payload?.preferredDate ? ` (${item.payload.preferredDate})` : ''}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#60716D] mt-1 pt-1 border-t border-[#D8E5E2]/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#2E7D5B]" />
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.retryCount > 0 && <span>Dicoba {item.retryCount}x</span>}
                  </div>

                  {item.lastError && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5">
                      {item.lastError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
