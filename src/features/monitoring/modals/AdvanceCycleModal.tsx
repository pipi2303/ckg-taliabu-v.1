import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Calendar, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { monitoringCycleService } from '../../../services/monitoringCycleService';
import { MonitoringCycle, User } from '../../../types';

interface AdvanceCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: MonitoringCycle | null;
  currentUser: User;
  onSaved: () => void;
}

export const AdvanceCycleModal: React.FC<AdvanceCycleModalProps> = ({
  isOpen,
  onClose,
  cycle,
  currentUser,
  onSaved,
}) => {
  const [intervalDays, setIntervalDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setIntervalDays(30);
      setError(null);
    }
  }, [cycle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cycle) return null;

  const nextCycleNumber = cycle.cycleNumber + 1;
  const nextPlannedDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await monitoringCycleService.advanceToNextCycle(cycle.id, currentUser, intervalDays);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menerbitkan siklus lanjutan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00201C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 flex items-center justify-center text-teal-200">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Terbitkan Siklus Lanjutan</h3>
              <p className="text-xs text-teal-200/80">
                Siklus #{cycle.cycleNumber} <ArrowRight className="inline w-3 h-3 mx-1" /> Siklus #{nextCycleNumber} • {cycle.citizenName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cyclical Care Principle Info */}
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
            <p className="font-semibold">Prinsip Kontinuitas Perawatan Siklik</p>
            <p className="mt-0.5 text-teal-800">
              Setiap siklus pemantauan yang telah selesai dievaluasi dilanjutkan ke nomor siklus berikutnya secara berurutan. Pasien tidak pernah dikeluarkan dari sistem pemantauan tanpa alasan terminal sah.
            </p>
          </div>

          {/* Interval Rule Selector (CR-IV) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Aturan Interval Kontrol Berikutnya (CR-IV)
            </label>
            <div className="space-y-2">
              {[
                { days: 14, label: 'CR-IV-01 (14 Hari - Titrasi Dosis / Risiko Menengah)', desc: 'Untuk evaluasi penyesuaian terapi antihipertensi/OAD awal' },
                { days: 30, label: 'CR-IV-01 (30 Hari - Interval Standar FKTP)', desc: 'Interval kontrol rutin bulanan standar Puskesmas Bobong' },
                { days: 60, label: 'CR-IV-04 (60 Hari - Evaluasi Non-Farmakologis CR-GZ-11)', desc: 'Untuk kasus prediabetes & modifikasi gaya hidup stabil' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.days}
                  onClick={() => setIntervalDays(item.days)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-start justify-between ${
                    intervalDays === item.days
                      ? 'border-[#00201C] bg-stone-50 font-medium text-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Calendar className={`w-4 h-4 mt-0.5 shrink-0 ${intervalDays === item.days ? 'text-black' : 'text-stone-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="text-stone-500 font-medium">Estimasi Tanggal Kontrol Siklus #{nextCycleNumber}:</p>
              <p className="text-sm font-bold text-black mt-0.5">{nextPlannedDate}</p>
            </div>
            <span className="px-2.5 py-1 bg-stone-200 font-semibold rounded-md text-stone-700 text-[11px]">
              {intervalDays} Hari Mendatang
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menerbitkan...' : `Terbitkan Siklus #${nextCycleNumber}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
