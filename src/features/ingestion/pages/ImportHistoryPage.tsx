import React, { useState, useEffect } from 'react';
import {
  History,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { useModal } from '../../../context/ModalContext';
import { ingestionRepo } from '../../../repositories/ingestionRepo';
import { subscribeToStorage } from '../../../repositories/storage';
import { ImportFileHistory } from '../../../types';

export const ImportHistoryPage: React.FC<{ onNavigate?: (navId: string) => void }> = ({ onNavigate }) => {
  const { openModal } = useModal();
  const [histories, setHistories] = useState<ImportFileHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await ingestionRepo.getImportHistories();
      setHistories(data);
    } catch (err) {
      console.error('Failed to load import histories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(loadData);
    return unsub;
  }, []);

  const handleOpenDetail = (item: ImportFileHistory) => {
    openModal({
      title: `Detail Riwayat Import: ${item.fileName}`,
      subtitle: `ID: ${item.id} • Faskes: ${item.facilityName}`,
      size: 'md',
      content: ({ closeModal }) => (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <div>
              <span className="text-[10px] text-[#60716D] block">Pengunggah</span>
              <span className="font-bold text-black">{item.uploadedByUserName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Waktu Unggah</span>
              <span className="font-mono text-black">
                {new Date(item.uploadedAt).toLocaleString('id-ID')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Total Baris File</span>
              <span className="font-bold text-black">{item.totalRows} Baris</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Baris Valid Diterima</span>
              <span className="font-bold text-[#2E7D5B]">{item.validRows} Baris</span>
            </div>
          </div>

          {item.errorLogSummary && (
            <div className="p-3 bg-[#FFFACD] rounded-lg border border-[#F2ECC2] text-[#554700]">
              <strong>Catatan / Error:</strong>
              <p className="mt-0.5">{item.errorLogSummary}</p>
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

  const columns: Column<ImportFileHistory>[] = [
    {
      key: 'id',
      header: 'ID Import',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-xs text-black">{row.id}</span>,
    },
    {
      key: 'fileName',
      header: 'Nama File & Ukuran',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.fileName}</span>
          <span className="text-[11px] text-[#60716D]">
            {Math.round((row.fileSizeBytes || 1024) / 1024)} KB • {row.sourceSystem}
          </span>
        </div>
      ),
    },
    {
      key: 'facilityName',
      header: 'Puskesmas',
      render: (row) => <span className="text-xs text-black">{row.facilityName}</span>,
    },
    {
      key: 'uploadedAt',
      header: 'Waktu Unggah',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-black">
          {new Date(row.uploadedAt).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'totalRows',
      header: 'Total / Valid',
      align: 'center',
      render: (row) => (
        <span className="text-xs font-semibold text-black">
          {row.validRows} / {row.totalRows}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.status === 'SUCCESS' || (row.status as any) === 'COMPLETED' ? 'success' : 'danger'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDetail(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h2 className="text-lg font-bold text-black">Riwayat Import File CKG</h2>
          <p className="text-xs text-[#60716D] mt-0.5">
            Log seluruh berkas data skrining yang pernah diunggah ke platform dengan jejak audit pengunggah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <Button variant="primary" size="sm" onClick={() => onNavigate('import-ckg')}>
              + Unggah File Baru
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Muat Ulang
          </Button>
        </div>
      </div>

      <EntityTable
        data={histories}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRefresh={loadData}
        emptyTitle="Belum Ada Riwayat Import"
        emptyDescription="Seluruh file skrining CSV yang diimpor akan tercatat di halaman ini."
      />
    </div>
  );
};
