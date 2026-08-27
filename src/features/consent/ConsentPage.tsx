import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, FileCheck2, XCircle, Eye, RefreshCw } from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { consentService } from '../../services/consentService';
import { ConsentRecord, ConsentChannel, ConsentStatus } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const ConsentPage: React.FC = () => {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<ConsentStatus | 'ALL'>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await consentService.getConsents();
      setConsents(list);
    } catch (err: any) {
      toast.error('Gagal Memuat Persetujuan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const filteredConsents = consents.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (channelFilter !== 'ALL' && c.channel !== channelFilter) return false;
    return true;
  });

  // Action: Add Consent Modal
  const handleOpenAddConsentModal = () => {
    const draftKey = 'create_consent';
    const draft = getDraft<any>(draftKey);

    openModal({
      title: 'Catat Persetujuan Warga Baru',
      subtitle: 'Registrasi Informed Consent CKG Sesuai UU PDP & SATUSEHAT',
      draftKey,
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          citizenName: draft?.citizenName || '',
          citizenNik: draft?.citizenNik || '',
          channel: (draft?.channel || 'ASSISTED_KADER') as ConsentChannel,
          consentVersion: draft?.consentVersion || 'v1.0-2026',
          scopeSummary: draft?.scopeSummary || 'Pemeriksaan CKG, Kunjungan Kader, & Rujukan Faskes',
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
          if (!formData.citizenName.trim() || !formData.citizenNik.trim() || formData.citizenNik.length < 16) {
            setError('Nama lengkap dan NIK (16 digit) wajib diisi.');
            return;
          }

          setIsSubmitting(true);
          setError(null);
          try {
            await consentService.createConsent(currentUser, {
              citizenId: `CITIZEN-${Date.now()}`,
              citizenName: formData.citizenName,
              citizenNik: formData.citizenNik,
              consentTextVersion: formData.consentVersion,
              channel: formData.channel,
              scope: 'FOLLOW_UP_PROCESSING',
              notes: formData.scopeSummary,
            });
            toast.success('Persetujuan Dicatat', `Informed consent ${formData.citizenName} berhasil disimpan.`);
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal mencatat persetujuan.');
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
              label="Nama Lengkap Warga"
              required
              placeholder="Contoh: Muhammad Farhan"
              value={formData.citizenName}
              onChange={(e) => handleChange('citizenName', e.target.value)}
            />

            <Input
              label="Nomor Induk Kependudukan (NIK)"
              required
              maxLength={16}
              placeholder="820801xxxxxxxxx"
              value={formData.citizenNik}
              onChange={(e) => handleChange('citizenNik', e.target.value)}
              helperText="16 digit NIK resmi kependudukan"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Kanal Persetujuan"
                required
                value={formData.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                options={[
                  { value: 'ASSISTED_KADER', label: 'Pendampingan Kader (Lapangan)' },
                  { value: 'APP', label: 'Aplikasi Warga (Mandiri)' },
                  { value: 'PAPER', label: 'Formulir Kertas Tertulis' },
                  { value: 'SATUSEHAT', label: 'Sinkronisasi SATUSEHAT' },
                ]}
              />

              <Input
                label="Versi Lembar Persetujuan"
                required
                value={formData.consentVersion}
                onChange={(e) => handleChange('consentVersion', e.target.value)}
              />
            </div>

            <Input
              label="Ringkasan Cakupan Persetujuan"
              value={formData.scopeSummary}
              onChange={(e) => handleChange('scopeSummary', e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Persetujuan
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Revoke Consent Modal
  const handleRevokeConsent = (consent: ConsentRecord) => {
    openModal({
      title: 'Cabut Persetujuan Warga?',
      subtitle: `Warga: ${consent.citizenName} (NIK: ${consent.citizenNik})`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [reason, setReason] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          if (!reason.trim()) {
            toast.error('Alasan Diperlukan', 'Harap isi alasan pencabutan persetujuan.');
            return;
          }

          setIsSubmitting(true);
          try {
            await consentService.revokeConsent(currentUser, consent.id, reason);
            toast.success('Persetujuan Dicabut', `Consent ${consent.citizenName} berhasil dicabut.`);
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Mencabut Persetujuan', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#FDF0F0] rounded-lg border border-[#F8C6C6] text-xs text-[#9A2D2D] leading-relaxed">
              <strong>Peringatan Regulasi:</strong> Pencabutan persetujuan akan menghentikan intervensi outreach CKG dan kunjungan rumah bagi sasaran ini sampai persetujuan baru diberikan.
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Alasan Pencabutan Wajib <span className="text-[#C84A4A]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Permintaan warga secara tertulis / pindah domisili..."
                className="w-full text-xs p-2 rounded-lg border border-[#D8E5E2] text-black focus:ring-1 focus:ring-[#00201C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button variant="danger" size="sm" isLoading={isSubmitting} onClick={handleConfirm}>
                Cabut Persetujuan
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  const columns: Column<ConsentRecord>[] = [
    {
      key: 'citizenName',
      header: 'Sasaran Warga',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block">{row.citizenName}</span>
          <span className="text-[11px] text-[#60716D] font-mono">NIK: {row.citizenNik}</span>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Kanal',
      sortable: true,
      align: 'center',
      render: (row) => {
        let variant: any = 'neutral';
        if (row.channel === 'APP') variant = 'review';
        if (row.channel === 'ASSISTED_KADER') variant = 'approved';
        if (row.channel === 'SATUSEHAT') variant = 'published';

        return <Badge variant={variant} size="sm">{row.channel}</Badge>;
      },
    },
    {
      key: 'scope',
      header: 'Cakupan Izin',
      render: (row) => <span className="text-xs text-[#334643]">{row.scope} {row.notes ? `(${row.notes})` : ''}</span>,
    },
    {
      key: 'grantedAt',
      header: 'Tanggal Diberikan',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#60716D]">
          {new Date(row.grantedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'assistedByUserName',
      header: 'Petugas / Kader',
      render: (row) => (
        <span className="text-xs text-[#1E5D75]">
          {row.assistedByUserName || 'Mandiri / Sistem'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRevokeConsent(row)}
              className="text-[#C84A4A] hover:bg-[#FDF0F0]"
            >
              Cabut Consent
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h3 className="text-base font-bold text-black">Tata Kelola Persetujuan Warga (Consent)</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Pencatatan persetujuan pemrosesan data medis CKG, izin kunjungan rumah kader, dan integrasi SATUSEHAT.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddConsentModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Catat Persetujuan Warga
        </Button>
      </div>

      <EntityTable
        data={filteredConsents}
        columns={columns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        searchPlaceholder="Cari nama warga atau NIK..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'ACTIVE', label: 'Aktif' },
              { value: 'REVOKED', label: 'Dicabut' },
              { value: 'PENDING_SYNC', label: 'Menunggu Sinkronisasi' },
            ],
          },
          {
            key: 'channel',
            label: 'Kanal',
            value: channelFilter,
            onChange: (v) => setChannelFilter(v),
            options: [
              { value: 'ALL', label: 'Semua Kanal' },
              { value: 'ASSISTED_KADER', label: 'Kader Lapangan' },
              { value: 'APP', label: 'Aplikasi Mandiri' },
              { value: 'PAPER', label: 'Formulir Kertas' },
              { value: 'SATUSEHAT', label: 'SATUSEHAT' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Rekaman Consent"
        emptyDescription="Catat persetujuan saat kader melakukan kunjungan lapangan."
      />
    </div>
  );
};
