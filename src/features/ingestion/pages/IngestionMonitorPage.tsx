import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Play,
  Zap,
  ShieldAlert,
  Server,
  Layers,
  FileText,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useToast } from '../../../context/ToastContext';
import { ingestionRepo } from '../../../repositories/ingestionRepo';
import { ingestionService } from '../../../services/ingestionService';
import { rawStorage, subscribeToStorage } from '../../../repositories/storage';
import { IngestionFailureType, IngestionRun } from '../../../types';

export const IngestionMonitorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const toast = useToast();

  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [latestSuccess, setLatestSuccess] = useState<IngestionRun | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rList, lSuccess] = await Promise.all([
        ingestionRepo.getRuns(),
        ingestionRepo.getLatestSuccessfulRun(),
      ]);
      setRuns(rList);
      setLatestSuccess(lSuccess);
    } catch (err) {
      console.error('Failed to load ingestion runs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(loadData);
    return unsub;
  }, []);

  const handleTriggerSync = async (simulatedError?: IngestionFailureType) => {
    if (!currentUser) return;
    setIsSyncing(true);

    try {
      const mockBatch = ingestionService.generateMockBatch(30);
      const res = await ingestionService.processBatch(
        mockBatch,
        'SSI-ASIK-SCHEDULED-API',
        'FASKES-PKM-01',
        'Puskesmas Bobong',
        currentUser,
        simulatedError
      );

      if (res.status === 'SUCCESS') {
        toast.success(
          'Sinkronisasi Selesai',
          `${res.acceptedCount} data berhasil dipadankan ke registry.`
        );
      } else if (res.status === 'FAILED') {
        toast.error(
          `Gagal: ${res.errorType}`,
          res.errorMessage || 'Proses sinkronisasi dihentikan.'
        );
      }
      loadData();
    } catch (err: any) {
      toast.error('Gagal Memulai Sinkronisasi', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenRunDetail = (run: IngestionRun) => {
    openModal({
      title: `Detail Eksekusi Ingestion: ${run.id}`,
      subtitle: `Faskes: ${run.facilityName} • Status: ${run.status}`,
      size: 'md',
      content: ({ closeModal }) => (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <div>
              <span className="text-[10px] text-[#60716D] block">Waktu Mulai</span>
              <span className="font-mono text-black">
                {new Date(run.startedAt).toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Waktu Selesai</span>
              <span className="font-mono text-black">
                {run.completedAt ? new Date(run.completedAt).toLocaleString('id-ID') : 'Sedang Berjalan'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Watermark Awal</span>
              <span className="font-mono text-[#60716D] text-[10px] truncate block">
                {run.watermarkFrom || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Watermark Akhir</span>
              <span className="font-mono text-[#2E7D5B] text-[10px] truncate block">
                {run.watermarkTo || '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
              <span className="text-[10px] text-[#60716D] block">Total Data</span>
              <span className="font-bold text-black text-sm">{run.receivedCount}</span>
            </div>
            <div className="p-2 bg-[#E8F5E9] rounded-lg border border-[#C8E6C9]">
              <span className="text-[10px] text-[#2E7D5B] block">Diterima</span>
              <span className="font-bold text-[#2E7D5B] text-sm">{run.acceptedCount}</span>
            </div>
            <div className="p-2 bg-[#FFFACD] rounded-lg border border-[#F2ECC2]">
              <span className="text-[10px] text-[#C99720] block">Antrean DQ</span>
              <span className="font-bold text-[#C99720] text-sm">{run.qualityQueueCount}</span>
            </div>
            <div className="p-2 bg-[#FFEBEE] rounded-lg border border-[#FFCDD2]">
              <span className="text-[10px] text-[#C84A4A] block">Ditolak</span>
              <span className="font-bold text-[#C84A4A] text-sm">{run.rejectedCount}</span>
            </div>
          </div>

          {run.errorMessage && (
            <div className="p-3 bg-[#FFEBEE] rounded-lg border border-[#FFCDD2] text-[#801010]">
              <strong>Keterangan Error:</strong>
              <p className="mt-0.5">{run.errorMessage}</p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[#D8E5E2]">
            <Button variant="ghost" size="sm" onClick={closeModal}>
              Tutup
            </Button>
          </div>
        </div>
      ),
    });
  };

  const columns: Column<IngestionRun>[] = [
    {
      key: 'id',
      header: 'Run ID',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-xs text-black">{row.id}</span>,
    },
    {
      key: 'facilityName',
      header: 'Faskes & Sistem Sumber',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.facilityName}</span>
          <span className="text-[11px] text-[#60716D]">{row.sourceSystem}</span>
        </div>
      ),
    },
    {
      key: 'startedAt',
      header: 'Waktu Eksekusi',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-black">
          {new Date(row.startedAt).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'counts',
      header: 'Hasil (Masuk / DQ / Tolak)',
      align: 'center',
      render: (row) => (
        <span className="text-xs font-semibold text-black">
          <span className="text-[#2E7D5B]">{row.acceptedCount}</span> /{' '}
          <span className="text-[#C99720]">{row.qualityQueueCount}</span> /{' '}
          <span className="text-[#C84A4A]">{row.rejectedCount}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Pipeline',
      align: 'center',
      render: (row) => {
        const variant =
          row.status === 'SUCCESS'
            ? 'success'
            : row.status === 'PARTIAL_FAILED'
            ? 'warning'
            : row.status === 'RUNNING'
            ? 'neutral'
            : 'danger';
        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenRunDetail(row)}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          Log
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Absolute Timestamp Data Freshness Banner */}
      <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#C8E6C9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2E7D5B] text-white flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black">Data Freshness CKG</span>
              <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
            </div>
            <p className="text-xs text-[#2E7D5B] mt-0.5">
              Sinkronisasi terakhir pada:{' '}
              <strong>
                {latestSuccess
                  ? new Date(latestSuccess.completedAt || latestSuccess.startedAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) + ' WIT'
                  : '24 Agustus 2026, 14:30 WIT'}
              </strong>{' '}
              ({latestSuccess?.facilityName || 'Puskesmas Bobong'})
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          isLoading={isSyncing}
          onClick={() => handleTriggerSync()}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          Tarik Data CKG Sekarang (Sync Trigger)
        </Button>
      </div>

      {/* Failure Simulation Sandbox */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3">
        <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C99720]" />
            <span className="text-xs font-bold text-black">
              Simulasi Uji Ketahanan Integrasi (Resilience Sandbox)
            </span>
          </div>
          <span className="text-[11px] text-[#60716D]">
            Watermark safety: Watermark tidak akan dimajukan saat error
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={() => handleTriggerSync('NETWORK_ERROR')}
            leftIcon={<Zap className="w-3.5 h-3.5 text-[#C84A4A]" />}
          >
            Simulasi Jaringan Putus (Network Error)
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={() => handleTriggerSync('CREDENTIAL_REJECTED')}
            leftIcon={<Server className="w-3.5 h-3.5 text-[#C84A4A]" />}
          >
            Simulasi Kredensial Ditolak (401 Unauthorized)
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={() => handleTriggerSync('PAYLOAD_SCHEMA_CHANGED')}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-[#C99720]" />}
          >
            Simulasi Perubahan Skema Sumber (Schema Mismatch)
          </Button>
        </div>
      </div>

      {/* Ingestion Runs Table */}
      <EntityTable
        data={runs}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRefresh={loadData}
        emptyTitle="Belum Ada Eksekusi Ingestion"
        emptyDescription="Eksekusi penarikan data berkala atau manual akan tampil di sini."
      />
    </div>
  );
};
