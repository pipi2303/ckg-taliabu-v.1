import React, { useState, useEffect } from 'react';
import {
  Plus,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { Input } from '../../components/common/Input';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ruleVersionService } from '../../services/ruleVersionService';
import { RuleVersion, RuleVersionStatus } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const RuleVersionPage: React.FC = () => {
  const [ruleVersions, setRuleVersions] = useState<RuleVersion[]>([]);
  const [statusFilter, setStatusFilter] = useState<RuleVersionStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await ruleVersionService.getRuleVersions();
      setRuleVersions(list);
    } catch (err: any) {
      toast.error('Gagal Memuat Versi Aturan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const filteredRules = ruleVersions.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const activeRule = ruleVersions.find((r) => r.status === 'PUBLISHED');

  // Action: Create Draft Version Modal
  const handleOpenCreateDraftModal = () => {
    const draftKey = 'create_rule_draft';
    const draft = getDraft<any>(draftKey);

    openModal({
      title: 'Buat Draf Versi Aturan Klinis Baru',
      subtitle: 'Tata Kelola Algoritma Stratifikasi Risiko & Protokol CKG',
      draftKey,
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          version: draft?.version || 'v1.2.0-CKG-TALIABU-2026',
          source: draft?.source || 'Kepmenkes No. HK.01.07/MENKES/2026 & Standar Dinkes Taliabu',
          effectiveDate: draft?.effectiveDate || new Date().toISOString().split('T')[0],
          description: draft?.description || 'Penyesuaian batas glukosa sewaktu dan penambahan kriteria hipertensi tahap 2.',
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
          if (!formData.version.trim() || !formData.source.trim()) {
            setError('Versi dan Rujukan Regulasi wajib diisi.');
            return;
          }

          setIsSubmitting(true);
          setError(null);
          try {
            await ruleVersionService.createDraft(currentUser, {
              version: formData.version,
              sourceDocument: formData.source,
              effectiveDate: formData.effectiveDate,
              notes: formData.description,
              rulesCount: 14,
            });
            toast.success('Draf Dibuat', `Versi ${formData.version} berhasil dibuat dalam status DRAFT.`);
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal membuat draf versi aturan.');
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
              label="Nomor / Identifier Versi Aturan"
              required
              placeholder="Contoh: v1.2.0-CKG-TALIABU-2026"
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              helperText="Gunakan format SemVer dengan prefiks CKG wilayah"
            />

            <Input
              label="Dasar Regulasi & Sumber Pedoman Klinis"
              required
              placeholder="Kepmenkes / Juknis Kemenkes RI"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            />

            <Input
              label="Rencana Tanggal Berlaku Efektif"
              type="date"
              required
              value={formData.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Catatan Perubahan Aturan (Changelog)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Rincian perubahan kriteria risiko atau ambang batas..."
                className="w-full text-xs p-2.5 rounded-lg border border-[#D8E5E2] text-black focus:ring-1 focus:ring-[#00201C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Draf Aturan
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Submit for Review
  const handleSubmitReview = (rule: RuleVersion) => {
    openModal({
      title: 'Ajukan Versi untuk Review?',
      subtitle: `Versi Aturan: ${rule.version}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await ruleVersionService.submitReview(currentUser, rule.id);
            toast.success('Diajukan', `Versi ${rule.version} kini berstatus REVIEW.`);
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Mengajukan', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4 text-xs">
            <p className="text-[#60716D]">
              Versi aturan akan dikunci untuk peninjauan klinis oleh Tim Komite Medis Dinkes sebelum disetujui.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={handleConfirm}>
                Ajukan Review
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Action: Approve
  const handleApprove = (rule: RuleVersion) => {
    openModal({
      title: 'Setujui Versi Aturan Klinis?',
      subtitle: `Versi Aturan: ${rule.version}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await ruleVersionService.approve(currentUser, rule.id);
            toast.success('Disetujui', `Versi ${rule.version} telah disetujui (APPROVED) dan siap dipublikasikan.`);
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Menyetujui', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4 text-xs">
            <p className="text-[#60716D]">
              Dengan menyetujui versi ini, Anda mengonfirmasi validitas algoritma skrining dan ambang batas risiko klinis.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button variant="success" size="sm" isLoading={isSubmitting} onClick={handleConfirm}>
                Setujui (Approve)
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Action: Publish (CRITICAL: Displays Mandatory Confirmation Text)
  const handlePublish = (rule: RuleVersion) => {
    openModal({
      title: 'Publikasikan Versi Aturan Klinis?',
      subtitle: `Versi Aturan: ${rule.version}`,
      size: 'md',
      content: ({ closeModal }) => {
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await ruleVersionService.publish(currentUser, rule.id);
            toast.success('Aturan Dipublikasikan', `Versi ${rule.version} kini aktif sebagai acuan klasifikasi CKG.`);
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Publikasi', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4">
            {/* MANDATORY TEXT CONTAINER */}
            <div className="p-4 bg-[#FFFACD]/50 border-2 border-[#E8DC7A] rounded-xl text-[#8C6407] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#6D4C04]">
                <AlertTriangle className="w-5 h-5 text-[#C99720] shrink-0" />
                <span>Pemberitahuan Efek Klasifikasi Data (Mandatory Rule):</span>
              </div>
              <p className="text-xs font-semibold text-[#6D4C04] leading-relaxed bg-white/70 p-3 rounded-lg border border-[#F5EC9C]">
                "A new rule version affects future classifications only. Historical classifications are not recalculated."
              </p>
              <p className="text-[11px] text-[#8C6407]">
                Artinya: Klasifikasi risiko masa lalu warga tetap menggunakan versi aturan saat skrining dilakukan untuk menjaga integritas rekam medis hukum.
              </p>
            </div>

            <div className="text-xs text-[#60716D] space-y-1">
              <p>• Versi aktif saat ini ({activeRule?.version || 'N/A'}) akan diarsipkan (RETIRED).</p>
              <p>• Seluruh perangkat kader yang melakukan sinkronisasi akan mengunduh payload aturan versi baru ini.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E5E2]">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleConfirm}>
                Saya Mengerti & Publikasikan
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  const columns: Column<RuleVersion>[] = [
    {
      key: 'version',
      header: 'Identifier Versi',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block font-mono">{row.version}</span>
          <span className="text-[11px] text-[#60716D] truncate block max-w-xs">{row.sourceDocument}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Siklus',
      sortable: true,
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'effectiveDate',
      header: 'Tanggal Berlaku',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#334643]">
          {new Date(row.effectiveDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'approvedBy',
      header: 'Persetujuan Medis',
      render: (row) => (
        <span className="text-xs text-[#1E5D75]">
          {row.approvedBy ? `${row.approvedBy}` : '— (Menunggu Review)'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Siklus Tata Kelola',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'DRAFT' && (
            <Button variant="outline" size="sm" onClick={() => handleSubmitReview(row)}>
              Ajukan Review
            </Button>
          )}

          {row.status === 'REVIEW' && currentUser?.roleId === 'ADMIN_DINKES' && (
            <Button variant="success" size="sm" onClick={() => handleApprove(row)}>
              Setujui (Approve)
            </Button>
          )}

          {row.status === 'APPROVED' && currentUser?.roleId === 'ADMIN_DINKES' && (
            <Button variant="primary" size="sm" onClick={() => handlePublish(row)}>
              Publikasikan
            </Button>
          )}

          {row.status === 'PUBLISHED' && (
            <span className="text-xs text-[#2E7D5B] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sedang Aktif
            </span>
          )}

          {row.status === 'RETIRED' && (
            <span className="text-xs text-[#AAB8B4] italic">Arsip Historis</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Doc Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#D8E5E2]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-black">Versi Aturan Klinis & Protokol CKG</h2>
            <DocBadge code="SCR-PKM-H01" size="sm" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Tata kelola siklus hidup algoritma stratifikasi risiko CKG, audit trail perubahan, dan sinkronisasi ke perangkat offline kader.
          </p>
        </div>
      </div>

      {/* Current Active Rule Card */}
      {activeRule && (
        <div className="bg-[#00201C] text-white p-5 rounded-2xl border border-[#002D27] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="published" size="sm">
                VERSI AKTIF SAAT INI
              </Badge>
              <span className="text-xs text-slate-300">Dipublikasikan pada {new Date(activeRule.publishedAt!).toLocaleDateString('id-ID')}</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight font-mono text-emerald-300">
              {activeRule.version}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Dasar: {activeRule.source} • Disetujui oleh: {activeRule.approvedByName}
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleOpenCreateDraftModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Buat Draf Versi Baru
          </Button>
        </div>
      )}

      {/* Main Table */}
      <EntityTable
        data={filteredRules}
        columns={columns}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        searchPlaceholder="Cari versi atau sumber regulasi..."
        filters={[
          {
            key: 'status',
            label: 'Status Siklus',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'PUBLISHED', label: 'Published (Aktif)' },
              { value: 'APPROVED', label: 'Approved (Siap)' },
              { value: 'REVIEW', label: 'Review (Dalam Telaah)' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'RETIRED', label: 'Retired (Arsip)' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Versi Aturan"
        emptyDescription="Buat draf aturan klinis CKG pertama."
      />
    </div>
  );
};
