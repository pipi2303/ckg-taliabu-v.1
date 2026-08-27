import React, { useState, useEffect } from 'react';
import {
  Users,
  GitMerge,
  Undo2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { useModal } from '../../../context/ModalContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { duplicateRepo } from '../../../repositories/duplicateRepo';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { auditService } from '../../../services/auditService';
import { subscribeToStorage } from '../../../repositories/storage';
import { IdentityMatchCandidate, IdentityMergeHistory } from '../../../types';
import { DuplicateCompareModal } from '../components/DuplicateCompareModal';

export const DuplicateReviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'MERGE_HISTORY'>('PENDING');
  const [candidates, setCandidates] = useState<IdentityMatchCandidate[]>([]);
  const [mergeHistories, setMergeHistories] = useState<IdentityMergeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, hList] = await Promise.all([
        duplicateRepo.query('ALL'),
        duplicateRepo.getMergeHistories(),
      ]);
      setCandidates(cList);
      setMergeHistories(hList);
    } catch (err) {
      console.error('Failed to load duplicate candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStorage(loadData);
    return unsub;
  }, []);

  const handleOpenCompare = (cand: IdentityMatchCandidate) => {
    openModal({
      title: `Peninjauan Kemiripan Identitas: ${cand.id}`,
      subtitle: `Tingkat Keyakinan: ${cand.confidence} • Kemiripan: ${Math.round((cand.similarityScore || 0.85) * 100)}%`,
      size: 'lg',
      content: ({ closeModal }) => (
        <DuplicateCompareModal
          candidate={cand}
          closeModal={closeModal}
          onSuccess={loadData}
        />
      ),
    });
  };

  const handleUnmerge = (history: IdentityMergeHistory) => {
    openModal({
      title: 'Batalkan Penggabungan Identitas (Unmerge)',
      subtitle: `Memisahkan kembali ${history.sourceCitizenName} dari ${history.targetCitizenName}`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [reason, setReason] = useState('');
        const [submitting, setSubmitting] = useState(false);

        const onConfirm = async () => {
          if (!currentUser || !reason.trim()) return;
          setSubmitting(true);
          try {
            await citizenRepo.unmerge(history.id, reason, currentUser);
            await auditService.log(currentUser, 'UPDATE', 'CITIZEN', {
              targetLabel: `Unmerge ${history.sourceCitizenName}`,
              purposeCode: 'IDENTITY_UNMERGE_ACTION',
              details: { mergeHistoryId: history.id, reason },
            });
            toast.success('Penggabungan Dibatalkan', 'Identitas warga berhasil dipisahkan kembali.');
            loadData();
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Membatalkan Penggabungan', err.message);
          } finally {
            setSubmitting(false);
          }
        };

        return (
          <div className="space-y-3">
            <p className="text-xs text-[#60716D]">
              Tindakan ini akan mengaktifkan kembali entitas warga sumber dan mencatat riwayat pemisahan.
            </p>
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Alasan Pembatalan <span className="text-[#C84A4A]">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Ditemukan bukti fisik bahwa keduanya individu kembar..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#D8E5E2]">
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submitting}
                disabled={!reason.trim()}
                onClick={onConfirm}
              >
                Konfirmasi Unmerge
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  const pendingCandidates = candidates.filter((c) => c.status === 'PENDING_REVIEW');

  const candidateColumns: Column<IdentityMatchCandidate>[] = [
    {
      key: 'citizenAName',
      header: 'Identitas Warga A',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.citizenAName}</span>
          <span className="font-mono text-[11px] text-[#60716D]">{row.citizenANik}</span>
        </div>
      ),
    },
    {
      key: 'citizenBName',
      header: 'Identitas Warga B',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.citizenBName}</span>
          <span className="font-mono text-[11px] text-[#60716D]">{row.citizenBNik}</span>
        </div>
      ),
    },
    {
      key: 'confidence',
      header: 'Tingkat Keyakinan',
      align: 'center',
      render: (row) => (
        <Badge
          variant={row.confidence === 'HIGH' ? 'warning' : 'neutral'}
          size="sm"
        >
          {row.confidence} ({Math.round((row.similarityScore || 0.85) * 100)}%)
        </Badge>
      ),
    },
    {
      key: 'matchingFields',
      header: 'Atribut Serupa',
      render: (row) => (
        <span className="text-xs text-[#2E7D5B] font-medium">
          {row.matchingFields.join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge
          variant={
            row.status === 'PENDING_REVIEW'
              ? 'warning'
              : row.status === 'MERGED'
              ? 'success'
              : 'neutral'
          }
          size="sm"
        >
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
          variant={row.status === 'PENDING_REVIEW' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleOpenCompare(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          {row.status === 'PENDING_REVIEW' ? 'Bandingkan & Putuskan' : 'Detail'}
        </Button>
      ),
    },
  ];

  const historyColumns: Column<IdentityMergeHistory>[] = [
    {
      key: 'mergedAt',
      header: 'Waktu Penggabungan',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-black">
          {new Date(row.mergedAt).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'sourceCitizenName',
      header: 'Identitas Sumber (Digabungkan)',
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-black block">{row.sourceCitizenName}</span>
          <span className="font-mono text-[10px] text-[#60716D]">{row.sourceCitizenId}</span>
        </div>
      ),
    },
    {
      key: 'targetCitizenName',
      header: 'Target Utama (Penerima)',
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-[#2E7D5B] block">{row.targetCitizenName}</span>
          <span className="font-mono text-[10px] text-[#60716D]">{row.targetCitizenId}</span>
        </div>
      ),
    },
    {
      key: 'mergedByUserName',
      header: 'Petugas / Alasan',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-black block">{row.mergedByUserName}</span>
          <span className="text-[11px] text-[#60716D] italic truncate max-w-xs">{row.reason}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Penggabungan',
      align: 'center',
      render: (row) => (
        <Badge variant={row.isUnmerged ? 'neutral' : 'success'} size="sm">
          {row.isUnmerged ? 'Telah Dibatalkan (Unmerged)' : 'Aktif Bergabung'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) =>
        !row.isUnmerged ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUnmerge(row)}
            leftIcon={<Undo2 className="w-3.5 h-3.5" />}
          >
            Batalkan Gabung
          </Button>
        ) : (
          <span className="text-[11px] text-[#60716D]">Unmerged</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Peninjauan Duplikat Identitas (MPI Review)</h2>
            <DocBadge code="SCR-PKM-C05" size="xs" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Pemeriksaan manual pasangan warga terduga duplikat demi memastikan keutuhan data longitudinal.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Muat Ulang
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8E5E2] pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-[#00201C] text-white shadow-2xs'
              : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Antrean Duplikat Terdeteksi</span>
          <span className="px-2 py-0.5 text-[10px] bg-[#C99720] text-white rounded-full">
            {pendingCandidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MERGE_HISTORY')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'MERGE_HISTORY'
              ? 'bg-[#00201C] text-white shadow-2xs'
              : 'text-[#60716D] hover:bg-[#D8E5E2]/40 hover:text-black'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Penggabungan ({mergeHistories.length})</span>
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        <EntityTable
          data={candidates}
          columns={candidateColumns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          onRefresh={loadData}
          emptyTitle="Tidak Ada Pasangan Terduga Duplikat"
          emptyDescription="Algoritma Master Patient Index tidak menemukan kemiripan identitas ganda yang belum ditinjau."
        />
      ) : (
        <EntityTable
          data={mergeHistories}
          columns={historyColumns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          onRefresh={loadData}
          emptyTitle="Belum Ada Riwayat Penggabungan"
          emptyDescription="Daftar penggabungan identitas dan opsi pembatalan (unmerge) akan tercatat di sini."
        />
      )}
    </div>
  );
};
