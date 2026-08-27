import React, { useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Info,
  Scale,
  Shield,
} from 'lucide-react';
import { PriorityWeightVersion } from '../../../types';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { priorityWeightRepo } from '../../../repositories/priorityWeightRepo';

interface PriorityWeightModalProps {
  currentWeights: PriorityWeightVersion;
  closeModal: () => void;
  onSuccess: (newVersion: PriorityWeightVersion) => void;
}

export const PriorityWeightModal: React.FC<PriorityWeightModalProps> = ({
  currentWeights,
  closeModal,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [riskCategoryWeight, setRiskCategoryWeight] = useState(
    Math.round(currentWeights.weights.riskCategory * 100)
  );
  const [accompanyingWeight, setAccompanyingWeight] = useState(
    Math.round(currentWeights.weights.accompanyingFactors * 100)
  );
  const [daysSinceWeight, setDaysSinceWeight] = useState(
    Math.round(currentWeights.weights.daysSinceFinding * 100)
  );
  const [missedVisitsWeight, setMissedVisitsWeight] = useState(
    Math.round(currentWeights.weights.missedVisits * 100)
  );
  const [criticalWeight, setCriticalWeight] = useState(
    Math.round(currentWeights.weights.criticalFinding * 100)
  );

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSum =
    riskCategoryWeight +
    accompanyingWeight +
    daysSinceWeight +
    missedVisitsWeight +
    criticalWeight;

  const isSumValid = totalSum === 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) return;

    if (!isSumValid) {
      setError(`Total bobot harus bernilai 100% (saat ini ${totalSum}%).`);
      return;
    }

    if (!notes.trim() || notes.trim().length < 10) {
      setError('Catatan tata kelola perubahan bobot wajib diisi (minimal 10 karakter).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newVersion = await priorityWeightRepo.createNewVersion(
        {
          riskCategory: riskCategoryWeight / 100,
          accompanyingFactors: accompanyingWeight / 100,
          daysSinceFinding: daysSinceWeight / 100,
          missedVisits: missedVisitsWeight / 100,
          criticalFinding: criticalWeight / 100,
          accessibility: 0.0,
        },
        notes.trim(),
        currentUser
      );

      addToast(
        'Konfigurasi Bobot Diperbarui',
        'success',
        `Versi bobot baru ${newVersion.version} berhasil diaktifkan.`
      );
      onSuccess(newVersion);
    } catch (err: any) {
      console.error('Failed to update priority weights:', err);
      setError(err.message || 'Gagal menyimpan perubahan bobot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Informational Callout */}
      <div className="p-3.5 bg-[#FFFACD] border border-amber-300 rounded-xl text-xs text-black space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <Scale className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Tata Kelola Algoritma Skor Prioritas Operasional</span>
        </div>
        <p className="text-[11px] text-amber-800">
          Skor Prioritas Operasional (0-100) digunakan untuk mengurutkan atensi operasional faskes dan kader. <strong>Perubahan bobot tidak pernah mengubah kategori risiko klinis diagnosis warga.</strong>
        </p>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4 p-4 bg-[#F8FBFA] border border-[#D8E5E2] rounded-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8E5E2]">
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            Komponen Pembobot
          </span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              isSumValid
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Total: {totalSum}% / 100%
          </span>
        </div>

        {/* 1. Risk Category */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-black">
            <span>1. Kategori Risiko Klinis</span>
            <span className="font-mono">{riskCategoryWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={riskCategoryWeight}
            onChange={(e) => setRiskCategoryWeight(parseInt(e.target.value))}
            className="w-full accent-[#00201C]"
          />
        </div>

        {/* 2. Accompanying Factors */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-black">
            <span>2. Faktor Risiko Penyerta (Multimorbiditas)</span>
            <span className="font-mono">{accompanyingWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={accompanyingWeight}
            onChange={(e) => setAccompanyingWeight(parseInt(e.target.value))}
            className="w-full accent-[#00201C]"
          />
        </div>

        {/* 3. Days Since Finding */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-black">
            <span>3. Lama Hari Sejak Temuan Tanpa Tindakan</span>
            <span className="font-mono">{daysSinceWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={daysSinceWeight}
            onChange={(e) => setDaysSinceWeight(parseInt(e.target.value))}
            className="w-full accent-[#00201C]"
          />
        </div>

        {/* 4. Missed Visits */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-black">
            <span>4. Kunjungan Skrining/Posyandu Terlewat</span>
            <span className="font-mono">{missedVisitsWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={missedVisitsWeight}
            onChange={(e) => setMissedVisitsWeight(parseInt(e.target.value))}
            className="w-full accent-[#00201C]"
          />
        </div>

        {/* 5. Critical Finding Status */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-black">
            <span>5. Status Temuan Kritis (Emergency Boost)</span>
            <span className="font-mono">{criticalWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={criticalWeight}
            onChange={(e) => setCriticalWeight(parseInt(e.target.value))}
            className="w-full accent-[#00201C]"
          />
        </div>
      </div>

      {/* Governance Notes (Mandatory) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-black uppercase tracking-wider">
          Catatan & Justifikasi Perubahan Versi Bobot <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Penyesuaian bobot prioritas operasional semester II 2026 berdasarkan evaluasi ketersediaan nakes wilayah kepulauan."
          className="w-full px-3 py-2 bg-white border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] outline-hidden resize-none"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Modal Actions */}
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
          disabled={isSubmitting || !isSumValid || notes.trim().length < 10}
          className="bg-[#00201C] hover:bg-[#102521] text-white"
        >
          {isSubmitting ? 'Menyimpan Versi...' : 'Terbitkan Versi Bobot Baru'}
        </Button>
      </div>
    </form>
  );
};
