import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Trash2, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { useToast } from '../../context/ToastContext';
import { useNetwork } from '../../context/NetworkContext';
import { useAuth } from '../../context/AuthContext';
import { syncService } from '../../services/syncService';
import { syncRepo } from '../../repositories/syncRepo';
import { OfflineQueueItem, SyncStatus } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const SyncPage: React.FC = () => {
  const [queueItems, setQueueItems] = useState<OfflineQueueItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<SyncStatus | 'ALL'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();
  const { isOffline } = useNetwork();
  const { currentUser } = useAuth();

  const loadData = async () => {
    const items = await syncService.getQueue();
    setQueueItems(items);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const stats = {
    pending: queueItems.filter((i) => i.syncStatus === 'PENDING').length,
    synced: queueItems.filter((i) => i.syncStatus === 'SYNCED').length,
    failed: queueItems.filter((i) => i.syncStatus === 'FAILED').length,
    conflict: queueItems.filter((i) => i.syncStatus === 'CONFLICT').length,
  };

  const handleSyncNow = async () => {
    if (isOffline) {
      toast.warning('Gagal Sinkronisasi', 'Perangkat sedang dalam Mode Luring. Hubungkan ke jaringan untuk mengirim antrian.');
      return;
    }

    if (!currentUser) return;

    setIsSyncing(true);
    try {
      const results = await syncService.syncAll(currentUser);
      toast.success(
        'Sinkronisasi Selesai',
        `Berhasil menyinkronkan ${results.synced} item. Gagal: ${results.failed}.`,
      );
      loadData();
    } catch (err: any) {
      toast.error('Gagal Sinkronisasi', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetryItem = async (item: OfflineQueueItem) => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await syncService.retryItem(currentUser, item.id);
      toast.info('Item Disinkronkan Ulang', `Item ${item.entityType} berhasil diproses.`);
      loadData();
    } catch (err: any) {
      toast.error('Gagal Coba Ulang', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSynced = async () => {
    await syncService.clearSynced();
    toast.info('Antrian Dibersihkan', 'Item yang sudah sukses tersinkron telah diarsipkan dari antrian.');
    loadData();
  };

  // Helper: Inject mock offline change for testing idempotency & sync queue
  const handleInjectMockQueueItem = async () => {
    await syncRepo.enqueue({
      entityType: 'CONSENT_RECORD',
      operation: 'CREATE',
      payload: {
        citizenName: 'Warga Uji Luring Taliabu',
        citizenNik: `820801${Math.floor(Math.random() * 10000000000)}`,
        channel: 'ASSISTED_KADER',
        timestamp: new Date().toISOString(),
      },
    });
    toast.success('Item Antrian Ditambahkan', 'Item perubahan uji coba berhasil dimasukkan ke antrian luring.');
    loadData();
  };

  const columns: Column<OfflineQueueItem>[] = [
    {
      key: 'idempotencyKey',
      header: 'Kunci Idempotency',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-black block truncate max-w-xs">
            {row.idempotencyKey}
          </span>
          <span className="text-[11px] text-[#60716D]">Entitas: {row.entityType}</span>
        </div>
      ),
    },
    {
      key: 'operation',
      header: 'Operasi',
      align: 'center',
      render: (row) => <Badge variant="neutral" size="sm">{row.operation}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Waktu Masuk Antrian',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#60716D]">
          {new Date(row.createdAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'retryCount',
      header: 'Percobaan',
      align: 'center',
      render: (row) => <span className="font-mono text-xs font-semibold">{row.retryCount}x</span>,
    },
    {
      key: 'syncStatus',
      header: 'Status Sinkron',
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.syncStatus)} size="sm">
          {row.syncStatus}
        </Badge>
      ),
    },
    {
      key: 'errorMessage',
      header: 'Keterangan / Error',
      render: (row) => (
        <span className="text-xs text-[#C84A4A] truncate block max-w-xs">
          {row.errorMessage || '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.syncStatus === 'FAILED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRetryItem(row)}
            >
              Coba Ulang
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-bold text-black">Infrastruktur Sinkronisasi & Antrian Luring (Offline Sync)</h3>
            <DocBadge code="SCR-PKM-I02" size="sm" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Arsitektur penyimpanan idempotency berbasis UUID untuk menjamin integritas data lapangan tanpa duplikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInjectMockQueueItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            + Simulasi Item Luring
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isSyncing}
            onClick={handleSyncNow}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Sinkronkan Sekarang
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Menunggu Kirim</span>
            <Clock className="w-4 h-4 text-[#C99720]" />
          </div>
          <p className="text-2xl font-bold text-[#C99720]">{stats.pending}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Item dalam antrian lokal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Sukses Tersinkron</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
          </div>
          <p className="text-2xl font-bold text-[#2E7D5B]">{stats.synced}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Tervalidasi di server</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Gagal Jaringan</span>
            <AlertCircle className="w-4 h-4 text-[#C84A4A]" />
          </div>
          <p className="text-2xl font-bold text-[#C84A4A]">{stats.failed}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Bisa dicoba ulang</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Konflik Data</span>
            <AlertCircle className="w-4 h-4 text-[#397B94]" />
          </div>
          <p className="text-2xl font-bold text-black">{stats.conflict}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Memerlukan resolusi</p>
        </div>
      </div>

      {/* Action Bar for Queue Cleanup */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#60716D]">
          Daftar Antrian Transaksi Luring
        </span>
        <div className="flex items-center gap-2">
          {stats.synced > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearSynced} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Bersihkan Item Tersinkron
            </Button>
          )}
        </div>
      </div>

      <EntityTable
        data={queueItems}
        columns={columns}
        keyExtractor={(q) => q.id}
        searchPlaceholder="Cari kunci idempotency atau tipe objek..."
        filters={[
          {
            key: 'syncStatus',
            label: 'Status Antrian',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'PENDING', label: 'PENDING (Menunggu)' },
              { value: 'SYNCED', label: 'SYNCED (Tersinkron)' },
              { value: 'FAILED', label: 'FAILED (Gagal)' },
              { value: 'CONFLICT', label: 'CONFLICT' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Antrian Sinkronisasi Kosong"
        emptyDescription="Seluruh data lokal telah tersinkronisasi sempurna dengan server."
      />
    </div>
  );
};
