import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPinOff,
  UserCheck,
  RefreshCw,
  Eye,
  FileCheck2,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { useModal } from '../../../context/ModalContext';
import { dataQualityRepo, DataQualityFilterParams } from '../../../repositories/dataQualityRepo';
import { subscribeToStorage } from '../../../repositories/storage';
import { DataQualityIssue, DataQualityProblemType, DataQualityStatus } from '../../../types';
import { DataQualityDetailModal } from '../components/DataQualityDetailModal';

export const DataQualityPage: React.FC = () => {
  const { openModal } = useModal();
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [statusFilter, setStatusFilter] = useState<DataQualityStatus | 'ALL'>('OPEN');
  const [problemFilter, setProblemFilter] = useState<DataQualityProblemType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalOpen: 0,
    identityConflict: 0,
    invalidNik: 0,
    missingData: 0,
    areaConflict: 0,
    duplicateCandidate: 0,
    resolvedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [data, s] = await Promise.all([
        dataQualityRepo.query({
          status: statusFilter,
          problemType: problemFilter,
          search: searchTerm,
        }),
        dataQualityRepo.getStats(),
      ]);
      setIssues(data);
      setStats(s);
    } catch (err) {
      console.error('Failed to load data quality queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(loadData);
    return unsub;
  }, [statusFilter, problemFilter, searchTerm]);

  const handleOpenDetail = (issue: DataQualityIssue) => {
    openModal({
      title: `Peninjauan Masalah Data: ${issue.id}`,
      subtitle: `Warga: ${issue.citizenName} • Sumber: ${issue.sourceSystem}`,
      size: 'lg',
      content: ({ closeModal }) => (
        <DataQualityDetailModal
          issue={issue}
          closeModal={closeModal}
          onSuccess={loadData}
        />
      ),
    });
  };

  const getProblemBadge = (type: DataQualityProblemType) => {
    switch (type) {
      case 'SAME_NIK_DIFFERENT_NAME':
      case 'IDENTITY_AMBIGUOUS':
        return <Badge variant="warning" size="sm">Konflik Identitas</Badge>;
      case 'INVALID_NIK':
        return <Badge variant="danger" size="sm">NIK Tidak Valid</Badge>;
      case 'OUTSIDE_WORK_AREA':
        return <Badge variant="neutral" size="sm">Luar Wilayah</Badge>;
      case 'INVALID_MEASURE':
        return <Badge variant="warning" size="sm">Anomali Pengukuran</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  const columns: Column<DataQualityIssue>[] = [
    {
      key: 'id',
      header: 'Kode Masalah',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-xs text-black">{row.id}</span>,
    },
    {
      key: 'citizenName',
      header: 'Nama Sumber & NIK',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.citizenName}</span>
          <span className="font-mono text-[11px] text-[#60716D]">{row.identifierValue || 'NIK Tidak Lengkap'}</span>
        </div>
      ),
    },
    {
      key: 'problemType',
      header: 'Jenis Masalah',
      render: (row) => (
        <div>
          {getProblemBadge(row.problemType)}
          <span className="text-[11px] text-[#60716D] block truncate max-w-xs mt-0.5">
            {row.problemDescription}
          </span>
        </div>
      ),
    },
    {
      key: 'screeningDate',
      header: 'Tanggal Skrining',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-black">
          {new Date(row.screeningDate).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      key: 'facilityName',
      header: 'Fasilitas Terkait',
      render: (row) => (
        <span className="text-xs text-black">{row.facilityName || 'Puskesmas Bobong'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status Antrean',
      align: 'center',
      render: (row) => {
        const variant =
          row.status === 'OPEN'
            ? 'warning'
            : row.status === 'RESOLVED'
            ? 'success'
            : row.status === 'REJECTED'
            ? 'danger'
            : 'neutral';
        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button
          variant={row.status === 'OPEN' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleOpenDetail(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          {row.status === 'OPEN' ? 'Tinjau & Putuskan' : 'Lihat Detail'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Antrean Data Bermasalah (Data Quality Queue)</h2>
            <DocBadge code="SCR-PKM-C04" size="xs" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Peninjauan manual ketidakcocokan identitas, validasi NIK Dukcapil, dan batas wilayah kerja sebelum masuk ke registry resmi.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Muat Ulang
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Total Antrean Terbuka</span>
            <AlertTriangle className="w-4 h-4 text-[#C99720]" />
          </div>
          <p className="text-2xl font-bold text-[#C99720]">{stats.totalOpen}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Menunggu keputusan PJ CKG</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Konflik Identitas</span>
            <Users className="w-4 h-4 text-[#397B94]" />
          </div>
          <p className="text-2xl font-bold text-black">{stats.identityConflict}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Kemiripan nama / Beda NIK</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">NIK Tidak Standar</span>
            <AlertCircle className="w-4 h-4 text-[#C84A4A]" />
          </div>
          <p className="text-2xl font-bold text-[#C84A4A]">{stats.invalidNik}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Bukan 16 digit angka</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Selesai Diverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
          </div>
          <p className="text-2xl font-bold text-[#2E7D5B]">{stats.resolvedToday}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Hari ini</p>
        </div>
      </div>

      {/* Main Table with Filters */}
      <EntityTable
        data={issues}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Cari nama, NIK, atau deskripsi masalah..."
        isLoading={isLoading}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'OPEN', label: 'OPEN (Terbuka)' },
              { value: 'IN_REVIEW', label: 'IN REVIEW' },
              { value: 'RESOLVED', label: 'RESOLVED (Terselesaikan)' },
              { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
            ],
          },
          {
            key: 'problemType',
            label: 'Jenis Masalah',
            value: problemFilter,
            onChange: (v) => setProblemFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Jenis' },
              { value: 'SAME_NIK_DIFFERENT_NAME', label: 'NIK Sama Beda Nama' },
              { value: 'IDENTITY_AMBIGUOUS', label: 'Kemiripan Demografis' },
              { value: 'INVALID_NIK', label: 'NIK Tidak Standar' },
              { value: 'OUTSIDE_WORK_AREA', label: 'Luar Wilayah Kerja' },
              { value: 'INVALID_MEASURE', label: 'Anomali Nilai Ukur' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Tidak Ada Masalah Data"
        emptyDescription="Semua catatan skrining telah lolos validasi otomatis MPI dan masuk ke registry resmi."
      />
    </div>
  );
};
