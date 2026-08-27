import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Flame,
  Info,
  Play,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ClassificationBatch, HealthFacility } from '../../../types';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { classificationService } from '../../../services/classificationService';
import { CRS_CKG_V0_9 } from '../../classification/rules/crsPackageV0_9';

interface BatchExecutionModalProps {
  facilities: HealthFacility[];
  closeModal: () => void;
  onSuccess: (batch: ClassificationBatch) => void;
}

export const BatchExecutionModal: React.FC<BatchExecutionModalProps> = ({
  facilities,
  closeModal,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [completedBatch, setCompletedBatch] = useState<ClassificationBatch | null>(null);

  const handleStartBatch = async () => {
    if (!currentUser) return;

    setIsRunning(true);
    setCompletedBatch(null);

    try {
      const facilityFilter = selectedFacilityId === 'ALL' ? undefined : selectedFacilityId;
      const batch = await classificationService.runBatch(
        facilityFilter,
        currentUser,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      setCompletedBatch(batch);
      addToast(
        'Eksekusi Batch Selesai',
        'success',
        `Berhasil memproses stratifikasi risiko untuk ${batch.completed} warga.`
      );
      onSuccess(batch);
    } catch (err: any) {
      console.error('Batch run error:', err);
      addToast(
        'Eksekusi Batch Gagal',
        'error',
        err.message || 'Terjadi kesalahan saat menjalankan stratifikasi batch.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Informational Callout */}
      <div className="p-3.5 bg-[#FFFACD] border border-amber-300 rounded-xl text-xs text-black space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Simulasi Stratifikasi Risiko Massal (Engine CRS v0.9)</span>
        </div>
        <p className="text-[11px] text-amber-800">
          Proses batch akan mengevaluasi seluruh riwayat skrining dan observasi warga terhadap paket aturan klinis aktif secara deterministik, menghasilkan klasifikasi risiko append-only dan skor prioritas operasional.
        </p>
      </div>

      {!completedBatch ? (
        <div className="space-y-4">
          {/* Target Facility Scope */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-black uppercase tracking-wider">
              Cakupan Wilayah / Fasilitas Kesehatan
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-white border border-[#D8E5E2] rounded-xl text-xs font-medium text-black focus:ring-2 focus:ring-[#00201C] focus:border-transparent outline-hidden"
            >
              <option value="ALL">Seluruh Kabupaten Pulau Taliabu (Semua Puskesmas)</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.districtName})
                </option>
              ))}
            </select>
          </div>

          {/* Engine Parameters */}
          <div className="p-3 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs space-y-2">
            <span className="font-bold text-black block">Parameter Eksekusi:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#60716D] block">Paket Aturan:</span>
                <span className="font-bold text-black">{CRS_CKG_V0_9.version}</span>
              </div>
              <div>
                <span className="text-[#60716D] block">Status Engine:</span>
                <span className="font-bold text-[#2E7D5B]">Deterministik / Append-only</span>
              </div>
            </div>
          </div>

          {/* Running Progress Bar */}
          {isRunning && (
            <div className="space-y-2 p-3 bg-white border border-[#D8E5E2] rounded-xl">
              <div className="flex justify-between text-xs font-semibold text-black">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2E7D5B]" />
                  Memproses Warga ({progress.current} dari {progress.total})...
                </span>
                <span>
                  {progress.total > 0
                    ? Math.round((progress.current / progress.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full h-2 bg-[#D8E5E2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2E7D5B] transition-all duration-150"
                  style={{
                    width: `${
                      progress.total > 0
                        ? (progress.current / progress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completed Batch Statistics */
        <div className="space-y-4 animate-in fade-in-50">
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Eksekusi Batch Berhasil</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Batch ID: <span className="font-mono font-semibold">{completedBatch.id}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white border border-[#D8E5E2] rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                Total Diproses
              </span>
              <span className="text-xl font-bold font-mono text-black">
                {completedBatch.completed}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#D8E5E2] rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                Perlu Konfirmasi
              </span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {completedBatch.awaitingConfirmationCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#D8E5E2] rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                Temuan Kritis
              </span>
              <span className="text-xl font-bold font-mono text-red-700">
                {completedBatch.criticalCount}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#D8E5E2] rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                Belum Ditentukan
              </span>
              <span className="text-xl font-bold font-mono text-slate-600">
                {completedBatch.undeterminedCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E5E2]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={closeModal}
          disabled={isRunning}
        >
          {completedBatch ? 'Tutup' : 'Batal'}
        </Button>

        {!completedBatch ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleStartBatch}
            disabled={isRunning}
            className="bg-[#00201C] hover:bg-[#102521] text-white"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
            {isRunning ? 'Sedang Memproses...' : 'Jalankan Batch Sekarang'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={closeModal}
            className="bg-[#2E7D5B] text-white"
          >
            Selesai
          </Button>
        )}
      </div>
    </div>
  );
};
