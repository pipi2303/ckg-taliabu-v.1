import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  Lock,
  Upload,
  Calendar,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useToast } from '../../../context/ToastContext';
import { citizenRepo, CitizenQueryResult } from '../../../repositories/citizenRepo';
import { auditRepo } from '../../../repositories/auditRepo';
import { rawStorage, subscribeToStorage } from '../../../repositories/storage';
import { CitizenDetailDrawer } from '../components/CitizenDetailDrawer';

const MAX_EXPORT_ROWS = 500;

export const RegistryPage: React.FC<{ onNavigate?: (navId: string) => void }> = ({ onNavigate }) => {
  const { currentUser, isAuthorizedForLevel } = useAuth();
  const { openModal } = useModal();
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [queryResult, setQueryResult] = useState<CitizenQueryResult>({
    data: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [nikSearch, setNikSearch] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('ALL');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState('ALL');
  const [selectedVillageId, setSelectedVillageId] = useState('ALL');
  const [selectedSex, setSelectedSex] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [selectedCompleteness, setSelectedCompleteness] = useState<'ALL' | 'COMPLETE' | 'INCOMPLETE'>('ALL');

  // Selected Citizen for Drawer Detail
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);

  const facilities = rawStorage.getFacilities();
  const kecamatans = rawStorage.getKecamatan();
  const desas = rawStorage.getDesa();

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await citizenRepo.query({
        search: searchTerm,
        nik: nikSearch,
        facilityId: selectedFacilityId,
        kecamatanId: selectedKecamatanId,
        villageId: selectedVillageId,
        sex: selectedSex !== 'ALL' ? selectedSex : undefined,
        isComplete: selectedCompleteness === 'COMPLETE' ? true : selectedCompleteness === 'INCOMPLETE' ? false : undefined,
        page,
        limit: 25,
      });
      setQueryResult(res);
    } catch (err) {
      console.error('Failed to load registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    const unsub = subscribeToStorage(() => loadData(queryResult.page));
    return unsub;
  }, [selectedFacilityId, selectedKecamatanId, selectedVillageId, selectedSex, selectedCompleteness]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setNikSearch('');
    setSelectedFacilityId('ALL');
    setSelectedKecamatanId('ALL');
    setSelectedVillageId('ALL');
    setSelectedSex('ALL');
    setSelectedCompleteness('ALL');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await citizenRepo.query({
        search: searchTerm,
        nik: nikSearch,
        facilityId: selectedFacilityId,
        kecamatanId: selectedKecamatanId,
        villageId: selectedVillageId,
        sex: selectedSex !== 'ALL' ? selectedSex : undefined,
        isComplete: selectedCompleteness === 'COMPLETE' ? true : selectedCompleteness === 'INCOMPLETE' ? false : undefined,
        page: 1,
        limit: MAX_EXPORT_ROWS,
      });

      const canSeeFullNik = isAuthorizedForLevel('S1');
      const exportedRows = res.data.slice(0, MAX_EXPORT_ROWS);
      const truncated = res.total > exportedRows.length;

      const header = ['Nama Warga', 'NIK', 'Usia', 'Jenis Kelamin', 'Desa', 'Puskesmas', 'CKG Terakhir', 'Jumlah Sesi', 'Kelengkapan'];
      const rows = exportedRows.map((row: any) => {
        const primaryNik = row.identifiers?.find((i: any) => i.identifierType === 'NIK')?.identifierValue || '';
        const nikValue = canSeeFullNik
          ? primaryNik
          : primaryNik.length >= 10
            ? `${primaryNik.slice(0, 4)}********${primaryNik.slice(-4)}`
            : primaryNik;
        const age = row.birthDate ? new Date().getFullYear() - new Date(row.birthDate).getFullYear() : '';
        return [
          row.fullName,
          nikValue,
          age,
          row.sex === 'MALE' ? 'Laki-laki' : 'Perempuan',
          row.villageName || '',
          row.facilityName || '',
          row.latestScreeningDate ? new Date(row.latestScreeningDate).toLocaleDateString('id-ID') : '',
          row.totalSessionsCount,
          row.isCompleteLatest ? 'Lengkap' : 'Sebagian',
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registry_CKG');
      const fileName = `Registry_CKG_Taliabu_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      await auditRepo.log({
        actorUserId: currentUser?.id || 'unknown',
        actorName: currentUser?.name || 'Unknown',
        actorRole: currentUser?.roleId || 'ADMIN_DINKES',
        action: 'EXPORT',
        entityType: 'CITIZEN',
        entityId: 'registry-export',
        targetLabel: 'Ekspor Registry CKG — Wilayah Kerja',
        description: `Ekspor ${exportedRows.length} baris data warga (kolom sesuai peran)${truncated ? `, dibatasi dari total ${res.total} baris` : ''}`,
        details: {
          fileName,
          rowCount: exportedRows.length,
          totalMatching: res.total,
          truncated,
          fullNikIncluded: canSeeFullNik,
          filters: {
            search: searchTerm || undefined,
            nik: nikSearch || undefined,
            facilityId: selectedFacilityId !== 'ALL' ? selectedFacilityId : undefined,
            kecamatanId: selectedKecamatanId !== 'ALL' ? selectedKecamatanId : undefined,
            villageId: selectedVillageId !== 'ALL' ? selectedVillageId : undefined,
          },
        },
      });

      if (truncated) {
        addToast(
          'Ekspor Dibatasi',
          'warning',
          `Hanya ${exportedRows.length} dari ${res.total} baris yang diekspor (batas maksimum ${MAX_EXPORT_ROWS} baris). Persempit filter untuk ekspor lengkap.`
        );
      } else {
        addToast('Ekspor Berhasil', 'success', `${exportedRows.length} baris data warga berhasil diekspor ke ${fileName}.`);
      }
    } catch (err) {
      console.error('Failed to export registry:', err);
      addToast('Ekspor Gagal', 'error', 'Terjadi kesalahan saat mengekspor data registry.');
    } finally {
      setIsExporting(false);
    }
  };

  // Metrics
  const totalCitizens = rawStorage.getCitizens().filter((c) => !c.mergedIntoId).length;
  const totalSessions = rawStorage.getScreeningSessions().length;
  const completeSessions = rawStorage.getScreeningSessions().filter((s) => s.isComplete).length;
  const openDqIssues = rawStorage.getDataQualityIssues().filter((i) => i.status === 'OPEN').length;

  const columns: Column<any>[] = [
    {
      key: 'fullName',
      header: 'Nama Warga & NIK',
      sortable: true,
      render: (row) => {
        const primaryNik = row.identifiers?.find((i: any) => i.identifierType === 'NIK')?.identifierValue || '';
        const maskedNik = primaryNik.length >= 10
          ? `${primaryNik.slice(0, 4)}********${primaryNik.slice(-4)}`
          : primaryNik;

        return (
          <div>
            <span className="font-bold text-xs text-black block hover:text-[#2E7D5B] transition-colors">
              {row.fullName}
            </span>
            <span className="font-mono text-[11px] text-[#60716D]">{maskedNik || 'NIK belum tercatat'}</span>
          </div>
        );
      },
    },
    {
      key: 'demographic',
      header: 'Usia / JK',
      align: 'center',
      render: (row) => {
        const age = row.birthDate
          ? new Date().getFullYear() - new Date(row.birthDate).getFullYear()
          : '—';
        return (
          <span className="text-xs text-black">
            {age} th • {row.sex === 'MALE' ? 'L' : 'P'}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: 'Desa & Puskesmas',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-black block">Desa {row.villageName || '—'}</span>
          <span className="text-[11px] text-[#60716D]">{row.facilityName || '—'}</span>
        </div>
      ),
    },
    {
      key: 'latestScreeningDate',
      header: 'CKG Terakhir',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="text-xs font-mono text-black">
          {row.latestScreeningDate
            ? new Date(row.latestScreeningDate).toLocaleDateString('id-ID')
            : '—'}
        </span>
      ),
    },
    {
      key: 'totalSessionsCount',
      header: 'Jumlah Sesi',
      align: 'center',
      render: (row) => (
        <span className="font-bold text-xs text-black bg-[#F8FBFA] px-2 py-0.5 rounded border border-[#D8E5E2]">
          {row.totalSessionsCount}x
        </span>
      ),
    },
    {
      key: 'isCompleteLatest',
      header: 'Kelengkapan',
      align: 'center',
      render: (row) => (
        <Badge variant={row.isCompleteLatest ? 'success' : 'warning'} size="sm">
          {row.isCompleteLatest ? 'Lengkap' : 'Sebagian'}
        </Badge>
      ),
    },
    {
      key: 'riskClassification',
      header: 'Stratifikasi Risiko',
      align: 'center',
      render: () => (
        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-medium">
          Belum diklasifikasikan
        </span>
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
          onClick={() => setSelectedCitizenId(row.id)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Kartu Warga
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Page Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Registry CKG — Wilayah Kerja</h2>
            <DocBadge code="SCR-PKM-C01" size="xs" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Profil longitudinal warga berdasarkan data CKG yang telah tervalidasi di Kabupaten Pulau Taliabu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('import-ckg')}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Import Data CKG
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {isExporting ? 'Mengekspor...' : 'Ekspor'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData(queryResult.page)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Total Warga Terdaftar</span>
            <Users className="w-4 h-4 text-[#2E7D5B]" />
          </div>
          <p className="text-2xl font-bold text-black">{totalCitizens}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Master Patient Index</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Sesi Skrining CKG</span>
            <FileText className="w-4 h-4 text-[#397B94]" />
          </div>
          <p className="text-2xl font-bold text-black">{totalSessions}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Tersimpan longitudinal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Skrining Lengkap</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
          </div>
          <p className="text-2xl font-bold text-[#2E7D5B]">{completeSessions}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Tensi & Lab terpenuhi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] shadow-2xs">
          <div className="flex items-center justify-between text-[#60716D] mb-1">
            <span className="text-xs font-semibold">Antrean Masalah Data</span>
            <AlertCircle className="w-4 h-4 text-[#C99720]" />
          </div>
          <p className="text-2xl font-bold text-[#C99720]">{openDqIssues}</p>
          <p className="text-[11px] text-[#60716D] mt-0.5">Memerlukan peninjauan</p>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] space-y-3 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#60716D] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama warga, desa, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Cari Nomor NIK Lengkap (Exact Search)..."
              value={nikSearch}
              onChange={(e) => setNikSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="md" type="submit">
              Terapkan Pencarian
            </Button>
            <Button variant="ghost" size="md" type="button" onClick={handleResetFilters}>
              Reset Semua
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[#D8E5E2]/80">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#60716D] mb-1">Puskesmas</label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Puskesmas</option>
              {facilities
                .filter((f) => f.type === 'PUSKESMAS')
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#60716D] mb-1">Kecamatan</label>
            <select
              value={selectedKecamatanId}
              onChange={(e) => setSelectedKecamatanId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Kecamatan</option>
              {kecamatans.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#60716D] mb-1">Desa Binaan</label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Desa</option>
              {desas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#60716D] mb-1">Jenis Kelamin</label>
            <select
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Gender</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#60716D] mb-1">Kelengkapan</label>
            <select
              value={selectedCompleteness}
              onChange={(e) => setSelectedCompleteness(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETE">Lengkap</option>
              <option value="INCOMPLETE">Sebagian (Incomplete)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Count Status Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-black">
          {queryResult.total} warga ditemukan
        </span>
        <span className="text-[11px] text-[#60716D]">
          Halaman {queryResult.page} dari {queryResult.totalPages} (25 baris per halaman)
        </span>
      </div>

      {/* Main Entity Table */}
      <EntityTable
        data={queryResult.data}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onRefresh={() => loadData(queryResult.page)}
        emptyTitle="Tidak Ada Warga yang Sesuai dengan Filter"
        emptyDescription="Silakan ubah kata kunci pencarian atau reset filter wilayah dan kelengkapan data."
      />

      {/* Pagination Controls */}
      {queryResult.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={queryResult.page <= 1}
            onClick={() => loadData(queryResult.page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-xs font-bold text-black px-3 py-1 bg-white border border-[#D8E5E2] rounded-lg">
            {queryResult.page} / {queryResult.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={queryResult.page >= queryResult.totalPages}
            onClick={() => loadData(queryResult.page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      )}

      {/* Citizen Longitudinal Detail Drawer */}
      {selectedCitizenId && (
        <CitizenDetailDrawer
          citizenId={selectedCitizenId}
          onClose={() => setSelectedCitizenId(null)}
          onRefresh={() => loadData(queryResult.page)}
        />
      )}
    </div>
  );
};
