import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Building2, MapPin, Phone, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { facilityService } from '../../services/facilityService';
import { regionService } from '../../services/regionService';
import { userService } from '../../services/userService';
import { auditRepo } from '../../repositories/auditRepo';
import { FacilityType, HealthFacility, Kecamatan, Desa, Status, User, AuditEvent } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const FacilityPage: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [selectedType, setSelectedType] = useState<FacilityType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'ALL'>('ALL');
  const [selectedKec, setSelectedKec] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const f = await facilityService.getFacilities();
      const k = await regionService.getKecamatanList();
      const d = await regionService.getDesaList();
      setFacilities(f);
      setKecamatanList(k);
      setDesaList(d);
    } catch (err: any) {
      toast.error('Gagal Memuat Fasilitas', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const filteredFacilities = facilities.filter((f) => {
    if (selectedType !== 'ALL' && f.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && f.status !== selectedStatus) return false;
    if (selectedKec !== 'ALL' && f.kecamatanId !== selectedKec) return false;
    return true;
  });

  // Action: Open Detail Modal / Drawer
  const handleOpenDetailModal = async (faskes: HealthFacility) => {
    const assignedUsers = await userService.getUsers(currentUser!, { facilityId: faskes.id });
    const auditLogs = await auditRepo.getLogs({ facilityId: faskes.id });

    openModal({
      title: `Detail Fasilitas: ${faskes.name}`,
      subtitle: `${faskes.code} • ${faskes.serviceLevel}`,
      size: 'lg',
      content: ({ closeModal }) => {
        const [activeSubTab, setActiveSubTab] = useState<'general' | 'network' | 'users' | 'audit'>('general');

        return (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex border-b border-[#D8E5E2] gap-2">
              <button
                onClick={() => setActiveSubTab('general')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'general' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Informasi Umum & Lokasi
              </button>
              <button
                onClick={() => setActiveSubTab('network')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'network' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Jejaring Rujukan ({faskes.connectedFacilitiesCount || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('users')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'users' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Staf & Kader Terdaftar ({assignedUsers.length})
              </button>
              <button
                onClick={() => setActiveSubTab('audit')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'audit' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Riwayat Perubahan ({auditLogs.length})
              </button>
            </div>

            {/* General Tab */}
            {activeSubTab === 'general' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-2">
                  <p className="font-bold text-black text-sm">Klasifikasi Fasilitas</p>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Jenis Fasilitas:</span>
                    <strong className="text-black">{faskes.type}</strong>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Tingkat Layanan:</span>
                    <span className="text-black font-medium">{faskes.serviceLevel}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Status Operasional:</span>
                    <Badge variant={getStatusBadgeVariant(faskes.status)} size="sm">
                      {faskes.status === 'ACTIVE' ? 'Aktif Beroperasi' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-2">
                  <p className="font-bold text-black text-sm">Lokasi & Kontak</p>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Kecamatan:</span>
                    <span className="text-black font-medium">{faskes.kecamatanName}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Desa / Kelurahan:</span>
                    <span className="text-black font-medium">{faskes.desaName}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Alamat Lengkap:</span>
                    <span className="text-black">{faskes.address}</span>
                  </div>
                  {faskes.phone && (
                    <div>
                      <span className="text-[#60716D] block text-[11px]">Nomor Telepon:</span>
                      <span className="text-black font-medium">{faskes.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Network Tab */}
            {activeSubTab === 'network' && (
              <div className="space-y-3 text-xs">
                {faskes.parentFacilityName && (
                  <div className="p-3 bg-[#E1F5FE] border border-[#BDE3F5] rounded-lg text-black">
                    <span className="font-semibold block">Puskesmas Induk Pengampu:</span>
                    <span>{faskes.parentFacilityName}</span>
                  </div>
                )}

                <div className="p-3 bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg">
                  <span className="font-bold text-black block mb-1">Jalur Rujukan Spesifik CKG:</span>
                  <p className="text-[#60716D]">
                    Pasien dengan stratifikasi risiko CKG Merah / bergejala klinis berat dirujuk berjenjang ke{' '}
                    <strong>RSUD Bobong (Rujukan Utama Kabupaten)</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeSubTab === 'users' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {assignedUsers.length > 0 ? (
                  assignedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-black">{u.name}</p>
                        <p className="text-[11px] text-[#60716D]">{u.roleName} • @{u.username}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(u.status)} size="sm">
                        {u.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#60716D] text-center py-6">Belum ada pengguna terdaftar pada faskes ini.</p>
                )}
              </div>
            )}

            {/* Audit Tab */}
            {activeSubTab === 'audit' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {auditLogs.length > 0 ? (
                  auditLogs.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-black">{a.targetLabel || a.action}</p>
                        <p className="text-[11px] text-[#60716D]">Oleh: {a.actorName} ({a.actorRole})</p>
                      </div>
                      <span className="text-[10px] text-[#AAB8B4] shrink-0">
                        {new Date(a.occurredAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#60716D] text-center py-6">Belum ada catatan perubahan untuk faskes ini.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D8E5E2]">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Tutup
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Action: Add / Edit Facility Modal with Draft Safety
  const handleOpenFacilityModal = (faskesToEdit?: HealthFacility) => {
    const draftKey = faskesToEdit ? `edit_faskes_${faskesToEdit.id}` : 'create_faskes';
    const draft = getDraft<any>(draftKey);

    openModal({
      title: faskesToEdit ? 'Ubah Fasilitas Kesehatan' : 'Tambah Fasilitas Kesehatan Baru',
      subtitle: 'Registrasi Faskes Kabupaten Pulau Taliabu',
      draftKey,
      size: 'lg',
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          code: draft?.code || faskesToEdit?.code || '',
          name: draft?.name || faskesToEdit?.name || '',
          type: (draft?.type || faskesToEdit?.type || 'PUSKESMAS') as FacilityType,
          kecamatanId: draft?.kecamatanId || faskesToEdit?.kecamatanId || kecamatanList[0]?.id || '',
          desaId: draft?.desaId || faskesToEdit?.desaId || desaList[0]?.id || '',
          serviceLevel: draft?.serviceLevel || faskesToEdit?.serviceLevel || 'Rawat Jalan',
          address: draft?.address || faskesToEdit?.address || '',
          phone: draft?.phone || faskesToEdit?.phone || '',
          parentFacilityId: draft?.parentFacilityId || faskesToEdit?.parentFacilityId || '',
        });
        const [error, setError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const filteredDesaOptions = desaList.filter((d) => d.kecamatanId === formData.kecamatanId);
        const puskesmasList = facilities.filter((f) => f.type === 'PUSKESMAS');

        const handleChange = (field: string, val: string) => {
          let updated = { ...formData, [field]: val };
          if (field === 'kecamatanId') {
            const firstDesa = desaList.find((d) => d.kecamatanId === val);
            updated.desaId = firstDesa?.id || '';
          }
          setFormData(updated);
          if (draftKey) saveDraft(draftKey, updated);
        };

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!currentUser) return;
          if (!formData.code.trim() || !formData.name.trim() || !formData.kecamatanId || !formData.address.trim()) {
            setError('Kolom Kode, Nama, Kecamatan, dan Alamat wajib diisi.');
            return;
          }

          const selectedKec = kecamatanList.find((k) => k.id === formData.kecamatanId);
          const selectedDes = desaList.find((d) => d.id === formData.desaId);
          const parentPkm = puskesmasList.find((p) => p.id === formData.parentFacilityId);

          setIsSubmitting(true);
          setError(null);
          try {
            if (faskesToEdit) {
              await facilityService.updateFacility(currentUser, faskesToEdit.id, {
                ...formData,
                kecamatanName: selectedKec?.name || faskesToEdit.kecamatanName,
                desaName: selectedDes?.name || faskesToEdit.desaName,
                parentFacilityName: parentPkm?.name || undefined,
              });
              toast.success('Fasilitas Diperbarui', `Data ${formData.name} berhasil disimpan.`);
            } else {
              await facilityService.createFacility(currentUser, {
                ...formData,
                kecamatanName: selectedKec?.name || '',
                desaName: selectedDes?.name || '',
                parentFacilityName: parentPkm?.name || undefined,
              });
              toast.success('Fasilitas Ditambahkan', `${formData.name} berhasil didaftarkan.`);
            }
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan fasilitas kesehatan.');
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
                label="Kode Fasilitas Kemenkes"
                required
                placeholder="Contoh: PKM-820801"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
              />

              <Input
                label="Nama Fasilitas Kesehatan"
                required
                placeholder="Contoh: Puskesmas Bobong"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Tipe Fasilitas"
                required
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                options={[
                  { value: 'PUSKESMAS', label: 'Puskesmas' },
                  { value: 'PUSTU', label: 'Pustu (Puskesmas Pembantu)' },
                  { value: 'POSYANDU', label: 'Posyandu' },
                  { value: 'RSUD_RUJUKAN', label: 'Fasilitas Rujukan (RSUD)' },
                ]}
              />

              <Input
                label="Tingkat Layanan"
                placeholder="Contoh: Rawat Inap & PONED"
                value={formData.serviceLevel}
                onChange={(e) => handleChange('serviceLevel', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Kecamatan"
                required
                value={formData.kecamatanId}
                onChange={(e) => handleChange('kecamatanId', e.target.value)}
                options={kecamatanList.map((k) => ({ value: k.id, label: k.name }))}
              />

              <Select
                label="Desa / Kelurahan"
                required
                value={formData.desaId}
                onChange={(e) => handleChange('desaId', e.target.value)}
                options={filteredDesaOptions.map((d) => ({ value: d.id, label: d.name }))}
              />
            </div>

            {(formData.type === 'PUSTU' || formData.type === 'POSYANDU') && (
              <Select
                label="Puskesmas Induk Pengampu"
                value={formData.parentFacilityId}
                onChange={(e) => handleChange('parentFacilityId', e.target.value)}
                options={[
                  { value: '', label: '-- Pilih Puskesmas Induk --' },
                  ...puskesmasList.map((p) => ({ value: p.id, label: p.name })),
                ]}
                helperText="Fasilitas induk penanggung jawab koordinasi lapangan"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Alamat Lengkap"
                required
                placeholder="Nama jalan, RT/RW, lingkungan"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />

              <Input
                label="Nomor Telepon / Kontak Faskes"
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Fasilitas
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Deactivate / Reactivate Facility
  const handleToggleStatus = (faskes: HealthFacility) => {
    const isActivating = faskes.status === 'INACTIVE';
    openModal({
      title: isActivating ? 'Aktifkan Fasilitas Kesehatan?' : 'Nonaktifkan Fasilitas Kesehatan?',
      subtitle: `Konfirmasi: ${faskes.name} (${faskes.code})`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [reason, setReason] = useState('');
        const reasonRequired = !isActivating;
        const canConfirm = !reasonRequired || reason.trim().length >= 10;

        const handleConfirm = async () => {
          if (!currentUser || !canConfirm) return;
          setIsSubmitting(true);
          try {
            await facilityService.toggleStatus(
              currentUser,
              faskes.id,
              isActivating ? 'ACTIVE' : 'INACTIVE',
              reason.trim() || undefined,
            );
            toast.success(
              isActivating ? 'Faskes Diaktifkan' : 'Faskes Dinonaktifkan',
              `Status ${faskes.name} berhasil diubah.`,
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
                <span>Faskes ini akan kembali aktif dan dapat dipilih dalam penugasan staf serta jejaring CKG.</span>
              ) : (
                <span>
                  <strong>Aturan Integritas Data:</strong> Fasilitas tidak dihapus keras (hard delete). Faskes yang dinonaktifkan tidak dapat dipilih pada pendaftaran sasaran CKG baru, namun riwayat skrining tetap terjaga.
                </span>
              )}
            </div>

            {reasonRequired && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Alasan Penonaktifan <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Bangunan direnovasi, layanan sementara dipindahkan ke Pustu terdekat."
                  className="w-full text-xs p-2.5 border border-[#D8E5E2] rounded-lg focus:ring-2 focus:ring-[#00201C] focus:border-transparent outline-hidden"
                />
                <p className="text-[10px] text-[#60716D]">Wajib diisi (minimal 10 karakter) — dicatat pada jejak audit.</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={isActivating ? 'success' : 'danger'}
                size="sm"
                isLoading={isSubmitting}
                disabled={!canConfirm}
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

  const columns: Column<HealthFacility>[] = [
    {
      key: 'name',
      header: 'Nama Fasilitas',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block">{row.name}</span>
          <span className="text-[11px] text-[#60716D] font-mono">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipe',
      sortable: true,
      align: 'center',
      render: (row) => {
        let variant: any = 'neutral';
        if (row.type === 'PUSKESMAS') variant = 'review';
        if (row.type === 'RSUD_RUJUKAN') variant = 'published';
        if (row.type === 'PUSTU') variant = 'info';
        if (row.type === 'POSYANDU') variant = 'approved';

        return <Badge variant={variant} size="sm">{row.type}</Badge>;
      },
    },
    {
      key: 'kecamatanName',
      header: 'Wilayah',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-black block">{row.kecamatanName}</span>
          <span className="text-[11px] text-[#60716D]">Desa {row.desaName}</span>
        </div>
      ),
    },
    {
      key: 'parentFacilityName',
      header: 'Faskes Pengampu',
      render: (row) => (
        <span className="text-xs text-[#397B94] font-medium">
          {row.parentFacilityName || '— (Induk)'}
        </span>
      ),
    },
    {
      key: 'serviceLevel',
      header: 'Layanan',
      render: (row) => <span className="text-xs text-[#60716D]">{row.serviceLevel}</span>,
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
            onClick={() => handleOpenDetailModal(row)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Detail
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenFacilityModal(row)}
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
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h3 className="text-base font-bold text-black">Master Fasilitas Kesehatan</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Puskesmas, Pustu, Posyandu, dan Rumah Sakit Rujukan dalam jejaring tindak lanjut CKG Kabupaten Pulau Taliabu.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenFacilityModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Tambah Fasilitas
        </Button>
      </div>

      {/* Filter Quick Pills */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PUSKESMAS', 'PUSTU', 'POSYANDU', 'RSUD_RUJUKAN'] as const).map((type) => {
          const count = type === 'ALL' ? facilities.length : facilities.filter((f) => f.type === type).length;
          const isActive = selectedType === type;
          const label =
            type === 'ALL'
              ? 'Semua Fasilitas'
              : type === 'RSUD_RUJUKAN'
              ? 'Fasilitas Rujukan'
              : type;

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#00201C] text-white border-[#00201C]'
                  : 'bg-white text-black border-[#D8E5E2] hover:bg-[#F8FBFA]'
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-[#E1F5FE] text-[#397B94]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <EntityTable
        data={filteredFacilities}
        columns={columns}
        keyExtractor={(f) => f.id}
        isLoading={isLoading}
        searchPlaceholder="Cari faskes, kode, kecamatan, atau desa..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: (v) => setSelectedStatus(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'ACTIVE', label: 'Aktif Saja' },
              { value: 'INACTIVE', label: 'Nonaktif Saja' },
            ],
          },
          {
            key: 'kecamatan',
            label: 'Kecamatan',
            value: selectedKec,
            onChange: (v) => setSelectedKec(v),
            options: [
              { value: 'ALL', label: 'Semua Kecamatan' },
              ...kecamatanList.map((k) => ({ value: k.id, label: k.name })),
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Fasilitas"
        emptyDescription="Daftarkan fasilitas kesehatan untuk memulai jejaring layanan."
      />
    </div>
  );
};
