import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { monitoringCycleService } from '../../../services/monitoringCycleService';
import { MonitoringCycle, User } from '../../../types';

interface TransferVillageModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: MonitoringCycle | null;
  currentUser: User;
  onSaved: () => void;
}

export const TransferVillageModal: React.FC<TransferVillageModalProps> = ({
  isOpen,
  onClose,
  cycle,
  currentUser,
  onSaved,
}) => {
  const [targetVillage, setTargetVillage] = useState('Desa Wayo');
  const [targetFacilityName, setTargetFacilityName] = useState('Puskesmas Bobong');
  const [targetFacilityId, setTargetFacilityId] = useState('fac-001');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setTargetVillage('Desa Wayo');
      setTargetFacilityName('Puskesmas Bobong');
      setTargetFacilityId('fac-001');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await monitoringCycleService.transferCycleToNewVillage({
        cycleId: cycle.id,
        newVillageName: targetVillage,
        newFacilityId: targetFacilityId,
        newFacilityName: targetFacilityName,
        operatorUser: currentUser,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses transfer wilayah.');
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
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00201C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 flex items-center justify-center text-teal-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Transfer Wilayah Kerja</h3>
              <p className="text-xs text-teal-200/80">
                Pindahan Domisili • {cycle.citizenName} (Siklus #{cycle.cycleNumber})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
            <p className="font-semibold text-stone-700">Integritas Riwayat Longitudinal (Hard Lock)</p>
            <p className="text-stone-600 leading-relaxed">
              Nomor siklus (#{cycle.cycleNumber}), rekam resep, dan seluruh riwayat hasil observasi tetap utuh dan dialihkan ke faskes pembina wilayah baru tanpa memulai ulang dari Siklus 1.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Desa Tujuan Baru
            </label>
            <select
              value={targetVillage}
              onChange={(e) => {
                const val = e.target.value;
                setTargetVillage(val);
                if (val === 'Desa Bobong' || val === 'Desa Wayo' || val === 'Desa Ratahaya') {
                  setTargetFacilityName('Puskesmas Bobong');
                  setTargetFacilityId('fac-001');
                } else if (val === 'Desa Lede' || val === 'Desa Todoli') {
                  setTargetFacilityName('Puskesmas Lede');
                  setTargetFacilityId('fac-002');
                } else if (val === 'Desa Nggele') {
                  setTargetFacilityName('Puskesmas Taliabu Barat Laut (Nggele)');
                  setTargetFacilityId('fac-003');
                } else {
                  setTargetFacilityName('Puskesmas Samuya');
                  setTargetFacilityId('fac-004');
                }
              }}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="Desa Bobong">Desa Bobong (Puskesmas Bobong)</option>
              <option value="Desa Wayo">Desa Wayo (Puskesmas Bobong)</option>
              <option value="Desa Ratahaya">Desa Ratahaya (Puskesmas Bobong)</option>
              <option value="Desa Lede">Desa Lede (Puskesmas Lede)</option>
              <option value="Desa Todoli">Desa Todoli (Puskesmas Lede)</option>
              <option value="Desa Nggele">Desa Nggele (Puskesmas Nggele)</option>
              <option value="Desa Samuya">Desa Samuya (Puskesmas Samuya)</option>
            </select>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-teal-800 font-medium">Faskes Pembina Baru:</span>
            <span className="font-bold text-teal-950">{targetFacilityName}</span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Mentransfer...' : 'Konfirmasi Transfer Wilayah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
