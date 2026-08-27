import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Stethoscope, ShieldCheck } from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { SensitivityBadge } from '../../components/common/SensitivityBadge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { serviceRepo } from '../../repositories/serviceRepo';
import { auditRepo } from '../../repositories/auditRepo';
import { HealthService, SensitivityLevel, Status } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const ServicePage: React.FC = () => {
  const [services, setServices] = useState<HealthService[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await serviceRepo.getServices();
      setServices(list);
    } catch (err: any) {
      toast.error('Gagal Memuat Layanan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const filteredServices = services.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenServiceModal = (serviceToEdit?: HealthService) => {
    const draftKey = serviceToEdit ? `edit_srv_${serviceToEdit.id}` : 'create_srv';
    const draft = getDraft<any>(draftKey);

    openModal({
      title: serviceToEdit ? 'Ubah Layanan Kesehatan' : 'Tambah Layanan Kesehatan CKG',
      subtitle: 'Katalog Layanan & Plafon Sensitivitas Data',
      draftKey,
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          code: draft?.code || serviceToEdit?.code || '',
          name: draft?.name || serviceToEdit?.name || '',
          category: (draft?.category || serviceToEdit?.category || 'CKG_SCREENING') as any,
          targetDemographic: draft?.targetDemographic || serviceToEdit?.targetDemographic || '',
          description: draft?.description || serviceToEdit?.description || '',
          sensitivity: (draft?.sensitivity || serviceToEdit?.sensitivity || 'S3') as SensitivityLevel,
        });
        const [error, setError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleChange = (field: string, val: any) => {
          const updated = { ...formData, [field]: val };
          setFormData(updated);
          if (draftKey) saveDraft(draftKey, updated);
        };

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!currentUser) return;
          if (!formData.code.trim() || !formData.name.trim() || !formData.targetDemographic.trim()) {
            setError('Kolom Kode, Nama, dan Target Sasaran wajib diisi.');
            return;
          }

          setIsSubmitting(true);
          setError(null);
          try {
            if (serviceToEdit) {
              await serviceRepo.updateService(serviceToEdit.id, formData);
              await auditRepo.log({
                actorUserId: currentUser.id,
                actorName: currentUser.name,
                actorRole: currentUser.roleId,
                action: 'UPDATE',
                entityType: 'HEALTH_SERVICE',
                entityId: serviceToEdit.id,
                targetLabel: `Layanan: ${formData.name}`,
                purposeCode: 'SERVICE_CATALOG_UPDATE',
              });
              toast.success('Layanan Diperbarui', `Data ${formData.name} berhasil disimpan.`);
            } else {
              const newSrv = await serviceRepo.createService({
                ...formData,
                status: 'ACTIVE',
              });
              await auditRepo.log({
                actorUserId: currentUser.id,
                actorName: currentUser.name,
                actorRole: currentUser.roleId,
                action: 'CREATE',
                entityType: 'HEALTH_SERVICE',
                entityId: newSrv.id,
                targetLabel: `Layanan Baru: ${formData.name}`,
                purposeCode: 'SERVICE_CATALOG_CREATE',
              });
              toast.success('Layanan Ditambahkan', `${formData.name} berhasil didaftarkan.`);
            }
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data layanan.');
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
                label="Kode Layanan"
                required
                placeholder="Contoh: CKG-01"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
              />

              <Select
                label="Kategori Program"
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={[
                  { value: 'CKG_SCREENING', label: 'Skrining CKG' },
                  { value: 'HOME_VISIT', label: 'Kunjungan Rumah Kader' },
                  { value: 'FOLLOW_UP', label: 'Tindak Lanjut Faskes' },
                  { value: 'SPECIALIST', label: 'Rujukan Spesialis' },
                  { value: 'LABORATORY', label: 'Pemeriksaan Laboratorium' },
                ]}
              />
            </div>

            <Input
              label="Nama Layanan / Program"
              required
              placeholder="Contoh: Skrining CKG Usia Produktif"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Demografis Sasaran"
                required
                placeholder="Contoh: Masyarakat usia 15-59 tahun"
                value={formData.targetDemographic}
                onChange={(e) => handleChange('targetDemographic', e.target.value)}
              />

              <Select
                label="Tingkat Sensitivitas Data (Plafon)"
                required
                value={formData.sensitivity}
                onChange={(e) => handleChange('sensitivity', e.target.value as SensitivityLevel)}
                options={[
                  { value: 'S0', label: 'S0 - Publik Internal' },
                  { value: 'S1', label: 'S1 - Identitas Warga' },
                  { value: 'S2', label: 'S2 - Data Operasional (Plafon Kader)' },
                  { value: 'S3', label: 'S3 - Data Klinis Rutin (Tensi, Gula)' },
                  { value: 'S4', label: 'S4 - Klinis Sangat Rahasia (Diagnosa)' },
                ]}
                helperText="Menentukan peran apa yang berhak mengakses rekaman klinis layanan ini"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Deskripsi & Cakupan Tindakan
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Penjelasan pemeriksaan dan tindak lanjut..."
                className="w-full text-sm bg-white rounded-lg border border-[#D8E5E2] p-2.5 text-black focus:ring-2 focus:ring-[#00201C] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Layanan
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  const handleToggleStatus = (srv: HealthService) => {
    const isActivating = srv.status === 'INACTIVE';
    openModal({
      title: isActivating ? 'Aktifkan Kembali Layanan?' : 'Nonaktifkan Layanan?',
      subtitle: `Konfirmasi: ${srv.name}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await serviceRepo.toggleStatus(srv.id, isActivating ? 'ACTIVE' : 'INACTIVE');
            await auditRepo.log({
              actorUserId: currentUser.id,
              actorName: currentUser.name,
              actorRole: currentUser.roleId,
              action: isActivating ? 'REACTIVATE' : 'DEACTIVATE',
              entityType: 'HEALTH_SERVICE',
              entityId: srv.id,
              targetLabel: `Layanan: ${srv.name} (${isActivating ? 'ACTIVE' : 'INACTIVE'})`,
              purposeCode: 'SERVICE_STATUS_CHANGE',
            });
            toast.success(
              isActivating ? 'Layanan Diaktifkan' : 'Layanan Dinonaktifkan',
              `Status ${srv.name} berhasil diubah.`,
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
            <p className="text-xs text-[#60716D] leading-relaxed">
              {isActivating
                ? 'Layanan akan kembali aktif di katalog pemeriksaan CKG.'
                : 'Layanan yang dinonaktifkan tidak akan muncul pada menu skrining baru, namun riwayat lama tetap tersimpan.'}
            </p>

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

  const columns: Column<HealthService>[] = [
    { key: 'code', header: 'Kode', sortable: true, width: '110px' },
    {
      key: 'name',
      header: 'Nama Layanan',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block">{row.name}</span>
          <span className="text-[11px] text-[#60716D]">{row.description}</span>
        </div>
      ),
    },
    {
      key: 'targetDemographic',
      header: 'Sasaran',
      sortable: true,
      render: (row) => <span className="text-xs text-[#334643] font-medium">{row.targetDemographic}</span>,
    },
    {
      key: 'sensitivity',
      header: 'Tingkat Sensitivitas',
      align: 'center',
      render: (row) => <SensitivityBadge level={row.sensitivity} />,
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
            onClick={() => handleOpenServiceModal(row)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'ACTIVE' ? 'outline' : 'success'}
            size="sm"
            onClick={() => handleToggleStatus(row)}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h3 className="text-base font-bold text-black">Katalog Layanan & Intervensi CKG</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Daftar paket pemeriksaan skrining, kunjungan rumah kader, dan tindak lanjut faskes terstandar.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenServiceModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Tambah Layanan
        </Button>
      </div>

      <EntityTable
        data={filteredServices}
        columns={columns}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        searchPlaceholder="Cari layanan atau target sasaran..."
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
            key: 'category',
            label: 'Kategori',
            value: categoryFilter,
            onChange: (v) => setCategoryFilter(v),
            options: [
              { value: 'ALL', label: 'Semua Kategori' },
              { value: 'CKG_SCREENING', label: 'Skrining CKG' },
              { value: 'HOME_VISIT', label: 'Kunjungan Rumah' },
              { value: 'FOLLOW_UP', label: 'Tindak Lanjut Faskes' },
              { value: 'SPECIALIST', label: 'Rujukan Spesialis' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Layanan"
        emptyDescription="Tambahkan layanan standar tindak lanjut CKG."
      />
    </div>
  );
};
