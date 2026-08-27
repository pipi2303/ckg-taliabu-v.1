import React, { useState } from 'react';
import { IdentityMatchCandidate, Citizen } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { rawStorage } from '../../../repositories/storage';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { duplicateRepo } from '../../../repositories/duplicateRepo';
import { auditService } from '../../../services/auditService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Users, GitMerge, AlertCircle, ArrowRight, Check } from 'lucide-react';

interface DuplicateCompareModalProps {
  candidate: IdentityMatchCandidate;
  onSuccess: () => void;
  closeModal: () => void;
}

export const DuplicateCompareModal: React.FC<DuplicateCompareModalProps> = ({
  candidate,
  onSuccess,
  closeModal,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const citizenA = rawStorage.getCitizens().find((c) => c.id === candidate.citizenAId);
  const citizenB = rawStorage.getCitizens().find((c) => c.id === candidate.citizenBId);

  const [targetCitizenId, setTargetCitizenId] = useState<string>(candidate.citizenAId);
  const [mergeReason, setMergeReason] = useState('');
  const [isConfirmingMerge, setIsConfirmingMerge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!citizenA || !citizenB) {
    return (
      <div className="p-4 text-center text-xs text-[#60716D]">
        Data identitas tidak lengkap atau salah satu warga telah digabungkan sebelumnya.
      </div>
    );
  }

  const handleMergeSubmit = async () => {
    if (!currentUser) return;
    if (!mergeReason.trim()) {
      toast.warning('Alasan Wajib Diisi', 'Silakan masukkan alasan penggabungan kedua identitas warga.');
      return;
    }

    const sourceId = targetCitizenId === citizenA.id ? citizenB.id : citizenA.id;
    const targetId = targetCitizenId;

    setIsSubmitting(true);
    try {
      const history = await citizenRepo.merge(
        sourceId,
        targetId,
        mergeReason,
        currentUser
      );

      await duplicateRepo.markMerged(candidate.id);

      await auditService.log(currentUser, 'MERGE', 'CITIZEN', {
        targetLabel: `Penggabungan ${history.sourceCitizenName} -> ${history.targetCitizenName}`,
        citizenId: targetId,
        purposeCode: 'IDENTITY_DUPLICATE_MERGE',
        details: {
          candidateId: candidate.id,
          sourceId,
          targetId,
          reason: mergeReason,
        },
      });

      toast.success(
        'Identitas Berhasil Digabungkan',
        `Seluruh riwayat pemeriksaan telah disatukan ke ${history.targetCitizenName}. Tindakan ini dapat dibatalkan jika diperlukan.`
      );
      onSuccess();
      closeModal();
    } catch (err: any) {
      toast.error('Gagal Menggabungkan Identitas', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    await duplicateRepo.dismiss(candidate.id);
    toast.info('Duplikat Diabaikan', 'Kedua identitas telah ditandai sebagai individu terpisah.');
    onSuccess();
    closeModal();
  };

  return (
    <div className="space-y-4">
      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Identity A */}
        <div
          onClick={() => setTargetCitizenId(citizenA.id)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            targetCitizenId === citizenA.id
              ? 'bg-[#E1F5FE]/40 border-[#397B94] ring-2 ring-[#397B94]'
              : 'bg-white border-[#D8E5E2] hover:bg-[#F8FBFA]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#60716D] uppercase">Identitas A (Primer)</span>
              <h4 className="font-bold text-xs text-black">{citizenA.fullName}</h4>
            </div>
            {targetCitizenId === citizenA.id && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2E7D5B] text-white rounded">
                Target Gabung Utama
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-[#60716D] block">Nomor NIK</span>
              <span className="font-mono font-bold text-black">{candidate.citizenANik}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Tanggal Lahir / Jenis Kelamin</span>
              <span className="text-black">
                {citizenA.birthDate} ({citizenA.sex === 'MALE' ? 'L' : 'P'})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Desa & Puskesmas</span>
              <span className="text-black">
                Desa {citizenA.villageName} ({citizenA.facilityName})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Alamat / Telepon</span>
              <span className="text-black">
                {citizenA.addressText || '—'} • {citizenA.phonePrimary || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Identity B */}
        <div
          onClick={() => setTargetCitizenId(citizenB.id)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            targetCitizenId === citizenB.id
              ? 'bg-[#E1F5FE]/40 border-[#397B94] ring-2 ring-[#397B94]'
              : 'bg-white border-[#D8E5E2] hover:bg-[#F8FBFA]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-2 mb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#60716D] uppercase">Identitas B (Kandidat)</span>
              <h4 className="font-bold text-xs text-black">{citizenB.fullName}</h4>
            </div>
            {targetCitizenId === citizenB.id && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2E7D5B] text-white rounded">
                Target Gabung Utama
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-[#60716D] block">Nomor NIK</span>
              <span className="font-mono font-bold text-black">{candidate.citizenBNik}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Tanggal Lahir / Jenis Kelamin</span>
              <span className="text-black">
                {citizenB.birthDate} ({citizenB.sex === 'MALE' ? 'L' : 'P'})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Desa & Puskesmas</span>
              <span className="text-black">
                Desa {citizenB.villageName} ({citizenB.facilityName})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#60716D] block">Alamat / Telepon</span>
              <span className="text-black">
                {citizenB.addressText || '—'} • {citizenB.phonePrimary || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Matching Details */}
      <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2 text-xs">
        <span className="font-bold text-black block">Kesesuaian Data:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="font-semibold text-[#2E7D5B] block">✓ Atribut Cocok:</span>
            <ul className="list-disc list-inside text-[#334643]">
              {candidate.matchingFields.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-[#C84A4A] block">⚠ Atribut Berbeda:</span>
            <ul className="list-disc list-inside text-[#334643]">
              {candidate.differentFields.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Merge Confirmation Form */}
      {isConfirmingMerge ? (
        <div className="p-4 bg-[#FFFACD] rounded-xl border border-[#F2ECC2] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2 text-xs text-[#554700]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C99720]" />
            <p>
              <strong>Konfirmasi Penggabungan:</strong> Seluruh riwayat kedua identitas akan disatukan ke target identitas utama. Tindakan ini dapat dibatalkan melalui tab riwayat penggabungan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Alasan Penggabungan <span className="text-[#C84A4A]">*</span>
            </label>
            <input
              type="text"
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              placeholder="Contoh: Terbukti orang yang sama berdasarkan verifikasi kartu keluarga..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F2ECC2]">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmingMerge(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!mergeReason.trim()}
              onClick={handleMergeSubmit}
              leftIcon={<GitMerge className="w-3.5 h-3.5" />}
            >
              Konfirmasi Penggabungan
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#D8E5E2]">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Tandai Bukan Duplikat
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsConfirmingMerge(true)}
            leftIcon={<GitMerge className="w-3.5 h-3.5" />}
          >
            Gabungkan Identitas
          </Button>
        </div>
      )}
    </div>
  );
};
