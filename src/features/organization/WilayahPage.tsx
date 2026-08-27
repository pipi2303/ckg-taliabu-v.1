import React, { useState, useEffect } from 'react';
import { Plus, Edit2, ShieldAlert, Check, MapPin } from 'lucide-react';
import { Tabs } from '../../components/common/Tabs';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { regionService } from '../../services/regionService';
import { facilityService } from '../../services/facilityService';
import { Desa, Kecamatan } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const WilayahPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kecamatan' | 'desa'>('kecamatan');
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedKecFilter, setSelectedKecFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const kecs = await regionService.getKecamatanList();
      const desas = await regionService.getDesaList();
      setKecamatanList(kecs);
      setDesaList(desas);
    } catch (err: any) {
      toast.error('Gagal Memuat Data Wilayah', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  // Filtered lists
  const filteredKecamatan = kecamatanList.filter((k) => {
    if (statusFilter !== 'ALL' && k.status !== statusFilter) return false;
    return true;
  });

  const filteredDesa = desaList.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (selectedKecFilter !== 'ALL' && d.kecamatanId !== selectedKecFilter) return false;
    return true;
  });

  // Action: Add / Edit Kecamatan Modal with Draft Safety
  const handleOpenKecamatanModal = (kecToEdit?: Kecamatan) => {
    const draftKey = kecToEdit ? `edit_kec_${kecToEdit.id}` : 'create_kec';
    const draft = getDraft<{ code: string; name: string }>(draftKey);

    openModal({
      title: kecToEdit ? 'Ubah Data Kecamatan' : 'Tambah Kecamatan Baru',
      subtitle: 'Master Wilayah Kabupaten Pulau Taliabu',
      draftKey,
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          code: draft?.code || kecToEdit?.code || '',
          name: draft?.name || kecToEdit?.name || '',
        });
        const [error, setError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Auto-save temporary form draft on input change
        const handleChange = (field: string, val: string) => {
          const updated = { ...formData, [field]: val };
          setFormData(updated);
          if (draftKey) saveDraft(draftKey, updated);
        };

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!currentUser) return;
          if (!formData.code.trim() || !formData.name.trim()) {
            setError('Kode dan Nama Kecamatan wajib diisi.');
            return;
          }

          setIsSubmitting(true);
          setError(null);
          try {
            if (kecToEdit) {
              await regionService.updateKecamatan(currentUser, kecToEdit.id, formData);
              toast.success('Kecamatan Diperbarui', `Data ${formData.name} berhasil disimpan.`);
            } else {
              await regionService.createKecamatan(currentUser, formData);
              toast.success('Kecamatan Ditambahkan', `Kecamatan ${formData.name} berhasil dibuat.`);
            }
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data kecamatan.');
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#FDF0F0] border border-[#F8C6C6] text-xs text-[#9A2D2D] rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Kode Wilayah Kemendagri"
              required
              placeholder="Contoh: 82.08.01"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              helperText="Format kode wilayah standar Kemendagri (82.08.xx)"
            />

            <Input
              label="Nama Kecamatan"
              required
              placeholder="Contoh: Taliabu Barat"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Kecamatan
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Add / Edit Desa Modal with Draft Safety
  const handleOpenDesaModal = async (desaToEdit?: Desa) => {
    const draftKey = desaToEdit ? `edit_desa_${desaToEdit.id}` : 'create_desa';
    const draft = getDraft<any>(draftKey);
    const facilities = await facilityService.getFacilities({ type: 'PUSKESMAS' });

    openModal({
      title: desaToEdit ? 'Ubah Data Desa' : 'Tambah Desa / Kelurahan Baru',
      subtitle: 'Master Wilayah Kabupaten Pulau Taliabu',
      draftKey,
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          code: draft?.code || desaToEdit?.code || '',
          name: draft?.name || desaToEdit?.name || '',
          kecamatanId: draft?.kecamatanId || desaToEdit?.kecamatanId || kecamatanList[0]?.id || '',
          puskesmasId: draft?.puskesmasId || desaToEdit?.puskesmasId || facilities[0]?.id || '',
        });
        const [error, setError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (field: string, val: string) => {
          const updated = { ...formData, [field]: val };
          setFormData(updated);
          if (draftKey) saveDraft(draftKey, updated);
        };

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!currentUser) return;
          if (!formData.code.trim() || !formData.name.trim() || !formData.kecamatanId || !formData.puskesmasId) {
            setError('Semua kolom wajib diisi dengan benar.');
            return;
          }

          const selectedKec = kecamatanList.find((k) => k.id === formData.kecamatanId);
          const selectedPkm = facilities.find((f) => f.id === formData.puskesmasId);

          setIsSubmitting(true);
          setError(null);
          try {
            if (desaToEdit) {
              await regionService.updateDesa(currentUser, desaToEdit.id, {
                code: formData.code,
                name: formData.name,
                kecamatanId: formData.kecamatanId,
                kecamatanName: selectedKec?.name || desaToEdit.kecamatanName,
                puskesmasId: formData.puskesmasId,
                puskesmasName: selectedPkm?.name || desaToEdit.puskesmasName,
              });
              toast.success('Desa Diperbarui', `Data Desa ${formData.name} berhasil disimpan.`);
            } else {
              await regionService.createDesa(currentUser, {
                code: formData.code,
                name: formData.name,
                kecamatanId: formData.kecamatanId,
                kecamatanName: selectedKec?.name || '',
                puskesmasId: formData.puskesmasId,
                puskesmasName: selectedPkm?.name || '',
              });
              toast.success('Desa Ditambahkan', `Desa ${formData.name} berhasil dibuat.`);
            }
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data desa.');
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#FDF0F0] border border-[#F8C6C6] text-xs text-[#9A2D2D] rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kode Wilayah Desa"
                required
                placeholder="Contoh: 82.08.01.2001"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                helperText="Format Kemendagri 10 digit"
              />

              <Input
                label="Nama Desa / Kelurahan"
                required
                placeholder="Contoh: Desa Bobong"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <Select
              label="Kecamatan Induk"
              required
              value={formData.kecamatanId}
              onChange={(e) => handleChange('kecamatanId', e.target.value)}
              options={kecamatanList.map((k) => ({ value: k.id, label: k.name }))}
            />

            <Select
              label="Puskesmas Penanggung Jawab"
              required
              value={formData.puskesmasId}
              onChange={(e) => handleChange('puskesmasId', e.target.value)}
              options={facilities.map((f) => ({ value: f.id, label: `${f.name} (${f.kecamatanName})` }))}
              helperText="Fasilitas kesehatan induk yang mengkoordinasikan program CKG desa ini"
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Desa
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Deactivate / Reactivate Kecamatan
  const handleToggleKecamatan = (kec: Kecamatan) => {
    const isActivating = kec.status === 'INACTIVE';
    openModal({
      title: isActivating ? 'Aktifkan Kembali Kecamatan?' : 'Nonaktifkan Kecamatan?',
      subtitle: `Konfirmasi Perubahan Status: Kecamatan ${kec.name}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await regionService.toggleKecamatanStatus(
              currentUser,
              kec.id,
              isActivating ? 'ACTIVE' : 'INACTIVE',
            );
            toast.success(
              isActivating ? 'Kecamatan Diaktifkan' : 'Kecamatan Dinonaktifkan',
              `Status Kecamatan ${kec.name} berhasil diubah.`,
            );
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Mengubah Status', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs text-[#60716D] leading-relaxed">
              {isActivating ? (
                <span>
                  Kecamatan ini akan kembali aktif dan dapat dipilih dalam penugasan wilayah baru.
                </span>
              ) : (
                <span>
                  <strong>Perhatian:</strong> Data tidak dihapus permanen. Kecamatan yang nonaktif tidak dapat dipilih untuk penugasan faskes baru, namun data riwayat tetap tersimpan.
                </span>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={isActivating ? 'success' : 'danger'}
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirm}
              >
                {isActivating ? 'Aktifkan Kembali' : 'Nonaktifkan'}
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Action: Deactivate / Reactivate Desa
  const handleToggleDesa = (desa: Desa) => {
    const isActivating = desa.status === 'INACTIVE';
    openModal({
      title: isActivating ? 'Aktifkan Kembali Desa?' : 'Nonaktifkan Desa?',
      subtitle: `Konfirmasi Perubahan Status: Desa ${desa.name}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await regionService.toggleDesaStatus(
              currentUser,
              desa.id,
              isActivating ? 'ACTIVE' : 'INACTIVE',
            );
            toast.success(
              isActivating ? 'Desa Diaktifkan' : 'Desa Dinonaktifkan',
              `Status Desa ${desa.name} berhasil diubah.`,
            );
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Mengubah Status', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs text-[#60716D] leading-relaxed">
              {isActivating ? (
                <span>Desa ini akan kembali aktif dan dapat dipilih untuk penugasan kader binaan.</span>
              ) : (
                <span>
                  <strong>Perhatian:</strong> Data desa tetap tersimpan dalam jejak historis CKG.
                </span>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={isActivating ? 'success' : 'danger'}
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirm}
              >
                {isActivating ? 'Aktifkan Kembali' : 'Nonaktifkan'}
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Table Columns for Kecamatan
  const kecamatanColumns: Column<Kecamatan>[] = [
    { key: 'code', header: 'Kode', sortable: true, width: '130px' },
    {
      key: 'name',
      header: 'Nama Kecamatan',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black">{row.name}</span>
          <span className="block text-[11px] text-[#60716D]">Kab. Pulau Taliabu</span>
        </div>
      ),
    },
    {
      key: 'villageCount',
      header: 'Jumlah Desa',
      sortable: true,
      align: 'center',
      render: (row) => <span className="font-semibold">{row.villageCount} Desa</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Terakhir Diperbarui',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#60716D]">
          {new Date(row.updatedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenKecamatanModal(row)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'ACTIVE' ? 'outline' : 'success'}
            size="sm"
            onClick={() => handleToggleKecamatan(row)}
            className={row.status === 'ACTIVE' ? 'text-[#C84A4A] hover:bg-[#FDF0F0]' : ''}
          >
            {row.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  // Table Columns for Desa
  const desaColumns: Column<Desa>[] = [
    { key: 'code', header: 'Kode Desa', sortable: true, width: '150px' },
    {
      key: 'name',
      header: 'Nama Desa',
      sortable: true,
      render: (row) => <span className="font-bold text-black">{row.name}</span>,
    },
    {
      key: 'kecamatanName',
      header: 'Kecamatan',
      sortable: true,
      render: (row) => <span className="text-[#334643] font-medium">{row.kecamatanName}</span>,
    },
    {
      key: 'puskesmasName',
      header: 'Puskesmas Penanggung Jawab',
      sortable: true,
      render: (row) => <span className="text-xs text-[#1E5D75] font-medium">{row.puskesmasName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDesaModal(row)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'ACTIVE' ? 'outline' : 'success'}
            size="sm"
            onClick={() => handleToggleDesa(row)}
            className={row.status === 'ACTIVE' ? 'text-[#C84A4A] hover:bg-[#FDF0F0]' : ''}
          >
            {row.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h3 className="text-base font-bold text-black">Master Wilayah Kerja CKG</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Hierarki administrasi wilayah Kabupaten Pulau Taliabu untuk pemetaan Puskesmas dan Desa Binaan Kader.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => (activeTab === 'kecamatan' ? handleOpenKecamatanModal() : handleOpenDesaModal())}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {activeTab === 'kecamatan' ? '+ Tambah Kecamatan' : '+ Tambah Desa'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'kecamatan', label: 'Kecamatan', count: kecamatanList.length },
          { id: 'desa', label: 'Desa / Kelurahan', count: desaList.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'kecamatan' | 'desa')}
      />

      {/* Content Table */}
      {activeTab === 'kecamatan' ? (
        <EntityTable
          data={filteredKecamatan}
          columns={kecamatanColumns}
          keyExtractor={(k) => k.id}
          isLoading={isLoading}
          searchPlaceholder="Cari nama atau kode kecamatan..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as any),
              options: [
                { value: 'ALL', label: 'Semua Status' },
                { value: 'ACTIVE', label: 'Aktif Saja' },
                { value: 'INACTIVE', label: 'Nonaktif Saja' },
              ],
            },
          ]}
          onRefresh={loadData}
          emptyTitle="Belum Ada Kecamatan"
          emptyDescription="Tambahkan kecamatan untuk memulai hierarki wilayah."
        />
      ) : (
        <EntityTable
          data={filteredDesa}
          columns={desaColumns}
          keyExtractor={(d) => d.id}
          isLoading={isLoading}
          searchPlaceholder="Cari nama desa, kecamatan, atau faskes..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as any),
              options: [
                { value: 'ALL', label: 'Semua Status' },
                { value: 'ACTIVE', label: 'Aktif Saja' },
                { value: 'INACTIVE', label: 'Nonaktif Saja' },
              ],
            },
            {
              key: 'kecamatan',
              label: 'Kecamatan',
              value: selectedKecFilter,
              onChange: (v) => setSelectedKecFilter(v),
              options: [
                { value: 'ALL', label: 'Semua Kecamatan' },
                ...kecamatanList.map((k) => ({ value: k.id, label: k.name })),
              ],
            },
          ]}
          onRefresh={loadData}
          emptyTitle="Belum Ada Desa"
          emptyDescription="Tambahkan desa di bawah kecamatan induk."
        />
      )}
    </div>
  );
};
