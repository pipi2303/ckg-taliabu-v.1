import React, { useState, useEffect } from 'react';
import { X, Stethoscope, AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { controlVisitService } from '../../../services/controlVisitService';
import { MonitoringCycle, User } from '../../../types';

interface ControlVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: MonitoringCycle | null;
  currentUser: User;
  onSaved: () => void;
}

export const ControlVisitModal: React.FC<ControlVisitModalProps> = ({
  isOpen,
  onClose,
  cycle,
  currentUser,
  onSaved,
}) => {
  const [isMeasurementAvailable, setIsMeasurementAvailable] = useState(true);
  const [equipmentUnavailableReason, setEquipmentUnavailableReason] = useState('');
  const [systolicBp, setSystolicBp] = useState<number | ''>('');
  const [diastolicBp, setDiastolicBp] = useState<number | ''>('');
  const [repeatSystolicBp, setRepeatSystolicBp] = useState<number | ''>('');
  const [repeatDiastolicBp, setRepeatDiastolicBp] = useState<number | ''>('');
  const [fastingBloodGlucose, setFastingBloodGlucose] = useState<number | ''>('');
  const [randomBloodGlucose, setRandomBloodGlucose] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [anamnesisNotes, setAnamnesisNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setIsMeasurementAvailable(true);
      setEquipmentUnavailableReason('');
      setSystolicBp(130);
      setDiastolicBp(85);
      setRepeatSystolicBp('');
      setRepeatDiastolicBp('');
      setFastingBloodGlucose('');
      setRandomBloodGlucose('');
      setWeightKg(62);
      setHeightCm(162);
      setChiefComplaint('Kontrol rutin berkala');
      setAnamnesisNotes('Kondisi umum baik, tidak ada keluhan nyeri dada atau sesak nafas.');
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
      if (isMeasurementAvailable && !systolicBp && !fastingBloodGlucose && !randomBloodGlucose) {
        throw new Error('Mohon isi minimal salah satu parameter hasil pemeriksaan (Tekanan Darah atau Gula Darah).');
      }

      if (!isMeasurementAvailable && !equipmentUnavailableReason.trim()) {
        throw new Error('Mohon isi alasan kendala alat/reagen pemeriksaan tidak tersedia.');
      }

      await controlVisitService.processControlVisit({
        cycleId: cycle.id,
        citizenId: cycle.citizenId,
        examinerUser: currentUser,
        isMeasurementAvailable,
        equipmentUnavailableReason: !isMeasurementAvailable ? equipmentUnavailableReason : undefined,
        systolicBp: systolicBp !== '' ? Number(systolicBp) : undefined,
        diastolicBp: diastolicBp !== '' ? Number(diastolicBp) : undefined,
        repeatSystolicBp: repeatSystolicBp !== '' ? Number(repeatSystolicBp) : undefined,
        repeatDiastolicBp: repeatDiastolicBp !== '' ? Number(repeatDiastolicBp) : undefined,
        fastingBloodGlucose: fastingBloodGlucose !== '' ? Number(fastingBloodGlucose) : undefined,
        randomBloodGlucose: randomBloodGlucose !== '' ? Number(randomBloodGlucose) : undefined,
        weightKg: weightKg !== '' ? Number(weightKg) : undefined,
        heightCm: heightCm !== '' ? Number(heightCm) : undefined,
        chiefComplaint,
        anamnesisNotes,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses kunjungan kontrol.');
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
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#00201C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 flex items-center justify-center text-teal-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pemeriksaan Kunjungan Kontrol</h3>
              <p className="text-xs text-teal-200/80">
                Siklus #{cycle.cycleNumber} • {cycle.citizenName} ({cycle.condition})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ketersediaan Alat & Reagen */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-700">Ketersediaan Pengukuran Terkonfirmasi</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isMeasurementAvailable
                  ? 'Alat tensimeter dan/atau reagen lab faskes siap pakai.'
                  : 'Peralatan/reagen rusak atau habis. Kunjungan tetap dicatat tanpa klasifikasi gagal.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsMeasurementAvailable(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMeasurementAvailable
                    ? 'bg-[#00201C] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Tersedia
              </button>
              <button
                type="button"
                onClick={() => setIsMeasurementAvailable(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isMeasurementAvailable
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Terkendala
              </button>
            </div>
          </div>

          {!isMeasurementAvailable ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Pencatatan Kendala Alat / Reagen (CR-KF-01/02)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Status siklus akan diset <strong>Menunggu Pengukuran (Awaiting Measurement)</strong> dan evaluasi outcome diset <strong>Belum Dapat Dinilai</strong>. Sistem akan menerbitkan task tindak lanjut saat perbekalan faskes siap.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Alasan Kendala Peralatan / Reagen
                </label>
                <input
                  type="text"
                  value={equipmentUnavailableReason}
                  onChange={(e) => setEquipmentUnavailableReason(e.target.value)}
                  placeholder="Contoh: Reagen glukosa di Pustu habis / Tensimeter sedang dikalibrasi..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tekanan Darah */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Pengukuran Tekanan Darah (CR-KF-01)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Sistolik (mmHg)</label>
                    <input
                      type="number"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="130"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Diastolik (mmHg)</label>
                    <input
                      type="number"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="85"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Sistolik Ulang (Opsional)</label>
                    <input
                      type="number"
                      value={repeatSystolicBp}
                      onChange={(e) => setRepeatSystolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="128"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Diastolik Ulang (Opsional)</label>
                    <input
                      type="number"
                      value={repeatDiastolicBp}
                      onChange={(e) => setRepeatDiastolicBp(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="82"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                </div>
              </div>

              {/* Laboratorium Glukosa */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Pemeriksaan Gula Darah Terkonfirmasi (CR-KF-02)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">GDP - Gula Darah Puasa (mg/dL)</label>
                    <input
                      type="number"
                      value={fastingBloodGlucose}
                      onChange={(e) => setFastingBloodGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 126"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">GDS - Gula Darah Sewaktu (mg/dL)</label>
                    <input
                      type="number"
                      value={randomBloodGlucose}
                      onChange={(e) => setRandomBloodGlucose(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 160"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                    />
                  </div>
                </div>
              </div>

              {/* Antropometri */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="60"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="160"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Anamnesis & Keluhan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Keluhan Utama / Catatan Anamnesis Kontrol
            </label>
            <textarea
              value={anamnesisNotes}
              onChange={(e) => setAnamnesisNotes(e.target.value)}
              rows={2}
              placeholder="Catatan perkembangan klinis, kepatuhan minum obat, atau keluhan penyerta..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Simpan Kunjungan Kontrol'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
