import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lock,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { ClinicalRiskCategory, RiskClassification } from '../../../types';
import { ClinicalRiskBadge } from '../../../components/common/ClinicalRiskBadge';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { classificationService } from '../../../services/classificationService';

interface ClinicianOverrideModalProps {
  classification: RiskClassification;
  closeModal: () => void;
  onSuccess: () => void;
}

export const ClinicianOverrideModal: React.FC<ClinicianOverrideModalProps> = ({
  classification,
  closeModal,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [newCategory, setNewCategory] = useState<ClinicalRiskCategory>(
    classification.finalCategory === 'DARK_RED'
      ? 'RED'
      : classification.finalCategory === 'RED'
      ? 'ORANGE'
      : classification.finalCategory === 'ORANGE'
      ? 'YELLOW'
      : 'GREEN'
  );
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isCriticalDowngrade =
    classification.isCritical && newCategory !== 'DARK_RED';

  const categories: Array<{
    category: ClinicalRiskCategory;
    title: string;
    description: string;
  }> = [
    {
      category: 'GREEN',
      title: 'HIJAU (Normal / Sehat)',
      description: 'Hasil pengukuran optimal, tidak ada faktor risiko aktif.',
    },
    {
      category: 'YELLOW',
      title: 'KUNING (Faktor Risiko)',
      description: 'Ditemukan faktor risiko perilaku atau antropometri ringan.',
    },
    {
      category: 'ORANGE',
      title: 'ORANYE (Pre-Penyakit)',
      description: 'Pre-hipertensi atau toleransi glukosa terganggu.',
    },
    {
      category: 'RED',
      title: 'MERAH (Penyakit - FPKTP)',
      description: 'Hipertensi Derajat 1/2 atau terduga Diabetes terkonfirmasi.',
    },
    {
      category: 'DARK_RED',
      title: 'MERAH TUA (Tinggi / FKRTL)',
      description: 'Krisis klinis atau kondisi komplikasi membutuhkan rujukan sekunder.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!currentUser) {
      setValidationError('Sesi pengguna tidak valid.');
      return;
    }

    if (!reason || reason.trim().length < 15) {
      setValidationError(
        'Alasan klinis wajib diisi secara substantif (minimal 15 karakter) untuk akuntabilitas audit.'
      );
      return;
    }

    if (newCategory === classification.finalCategory) {
      setValidationError(
        'Kategori risiko baru harus berbeda dari kategori klasifikasi sistem saat ini.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await classificationService.override(classification.id, {
        newCategory,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        actor: currentUser,
      });

      addToast(
        'Override Klasifikasi Berhasil',
        'success',
        `Kategori risiko ${classification.citizenName} diubah menjadi ${newCategory}.`
      );

      onSuccess();
    } catch (err: any) {
      console.error('Failed to override classification:', err);
      setValidationError(err.message || 'Gagal menyimpan override klasifikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Side-by-side comparison summary */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-2xl">
        <div>
          <span className="text-[10px] font-bold text-[#60716D] uppercase block">
            Klasifikasi Sistem (CRS)
          </span>
          <div className="mt-1">
            <ClinicalRiskBadge
              category={classification.finalCategory}
              isCritical={classification.isCritical}
              size="sm"
            />
          </div>
          <span className="text-[10px] text-[#60716D] block mt-1">
            Versi: {classification.ruleVersion}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#60716D] uppercase block">
            Keputusan Tenaga Kesehatan
          </span>
          <div className="mt-1">
            <ClinicalRiskBadge category={newCategory} size="sm" />
          </div>
          <span className="text-[10px] text-[#2E7D5B] font-semibold block mt-1">
            Penetapan Manual Dokter
          </span>
        </div>
      </div>

      {/* Critical Downgrade Warning */}
      {isCriticalDowngrade && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl flex items-start gap-2.5 text-xs text-red-950">
          <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">
              PERINGATAN: DOWNGRADE TEMUAN KRITIS
            </p>
            <p className="text-[11px] text-red-800 mt-0.5">
              Kasus ini sebelumnya ditandai sebagai temuan kritis ({classification.criticalRuleCode || 'CRIT'}). Tindakan penurunan kategori risiko akan dicatat khusus pada log audit pengawasan Dinkes.
            </p>
          </div>
        </div>
      )}

      {/* Target Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-black uppercase tracking-wider">
          Pilih Kategori Risiko Baru <span className="text-red-500">*</span>
        </label>

        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.category}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                newCategory === cat.category
                  ? 'bg-white border-[#00201C] ring-2 ring-[#00201C]/10 shadow-2xs'
                  : 'bg-white/60 border-[#D8E5E2] hover:bg-white hover:border-[#60716D]'
              }`}
            >
              <input
                type="radio"
                name="newCategory"
                value={cat.category}
                checked={newCategory === cat.category}
                onChange={() => setNewCategory(cat.category)}
                className="mt-1 text-black focus:ring-[#00201C]"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">{cat.title}</span>
                </div>
                <p className="text-[11px] text-[#60716D] mt-0.5">{cat.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Substantive Reason (Mandatory, >= 15 chars) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-black uppercase tracking-wider">
            Alasan Klinis Substantif <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-[#60716D]">
            {reason.trim().length}/15 karakter minimum
          </span>
        </div>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Reaksi White-Coat Hypertension saat pemeriksaan di ruang tindakan. Hasil pemantauan tensi mandiri di rumah konsisten berada pada rentang pre-hipertensi (126-132 mmHg)."
          className="w-full px-3 py-2 bg-white border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] focus:border-transparent outline-hidden resize-none"
        />
      </div>

      {/* Additional Supporting Notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-black uppercase tracking-wider">
          Catatan Tindak Lanjut / Rencana Klinis (Opsional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Evaluasi ulang tensi serial dalam 2 minggu."
          className="w-full px-3 py-2 bg-white border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] focus:border-transparent outline-hidden"
        />
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E5E2]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={closeModal}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || reason.trim().length < 15}
          className="bg-[#00201C] hover:bg-[#102521] text-white"
        >
          {isSubmitting ? 'Menyimpan Override...' : 'Konfirmasi & Simpan Override'}
        </Button>
      </div>
    </form>
  );
};
