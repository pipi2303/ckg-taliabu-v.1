import React, { useState, useEffect } from 'react';
import { X, Award, AlertTriangle, ShieldCheck, FileText, CheckCircle, Info } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { outcomeEvaluationService } from '../../../services/outcomeEvaluationService';
import { MonitoringCycle, ControlStatus, User } from '../../../types';

interface ManualDeterminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: MonitoringCycle | null;
  currentUser: User;
  onSaved: () => void;
}

export const ManualDeterminationModal: React.FC<ManualDeterminationModalProps> = ({
  isOpen,
  onClose,
  cycle,
  currentUser,
  onSaved,
}) => {
  const [controlStatus, setControlStatus] = useState<ControlStatus>('CONTROLLED');
  const [manualReason, setManualReason] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [hasComparator, setHasComparator] = useState(true);
  const [comparatorSummary, setComparatorSummary] = useState('');
  const [currentSummary, setCurrentSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cycle) {
      setControlStatus('CONTROLLED');
      setManualReason('Pasien menunjukkan tren tekanan darah/gula darah stabil dalam rentang target klinis selama pemantauan berkala.');
      setSupportingEvidence(`Bukti rekam longitudinal Faskes: Hasil pemeriksaan terkini menunjukkan perbaikan stabil dibandingkan data awal baseline skrining.`);
      setHasComparator(true);
      setComparatorSummary('Data Baseline Skrining CKG Awal (Terkonfirmasi)');
      setCurrentSummary('Pemeriksaan Kontrol Terkini (CR-KF)');
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

  const isDoctor = currentUser.roleId === 'DOCTOR' || currentUser.roleId === 'KEPALA_PUSKESMAS';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!isDoctor) {
        throw new Error('Penetapan manual status terkendali hanya memiliki wewenang sah bagi Dokter Penanggung Jawab.');
      }

      if (controlStatus === 'CONTROLLED' && !hasComparator) {
        throw new Error('Penetapan status TERKENDALI mewajibkan adanya komparator observasi sebelumnya yang sah.');
      }

      if (manualReason.trim().length < 10) {
        throw new Error('Alasan pertimbangan klinis wajib diisi secara komprehensif (minimal 10 karakter).');
      }

      await outcomeEvaluationService.recordManualClinicianDetermination({
        cycleId: cycle.id,
        citizenId: cycle.citizenId,
        citizenName: cycle.citizenName,
        controlStatus,
        manualReason,
        supportingEvidence,
        doctorUser: currentUser,
        currentObservation: {
          id: 'obs-curr-manual',
          label: 'Pemeriksaan Kontrol Terkini',
          valueSummary: currentSummary || 'Terkonfirmasi Dokter',
          measuredAt: new Date().toISOString().split('T')[0],
        },
        comparatorObservation: hasComparator
          ? {
              id: 'obs-comp-manual',
              label: 'Komparator Baseline / Siklus Sebelumnya',
              valueSummary: comparatorSummary || 'Baseline Terverifikasi',
              measuredAt: '2026-06-01',
            }
          : undefined,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan penetapan manual.');
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Penetapan Manual Status Kontrol</h3>
              <p className="text-xs text-teal-200/80">
                Wewenang Dokter Faskes • {cycle.citizenName} (Siklus #{cycle.cycleNumber})
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

          {/* Governance Notice */}
          <div className="bg-[#E1F5FE] border border-sky-200 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 leading-relaxed">
              <p className="font-semibold">Tata Kelola Klinis (Governance Lock OI-08)</p>
              <p className="mt-0.5 text-sky-800">
                Karena kriteria numerik otomatis (CR-OC) belum disahkan secara formal, penetapan manual dokter ini akan dicatat dalam Audit Trail sebagai <strong>PENETAPAN MANUAL TENAGA MEDIS</strong> dan bukan hasil klasifikasi otomatis sistem.
              </p>
            </div>
          </div>

          {/* Pilihan Status Terkendali */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Penetapan Status Klinis Pasien
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'CONTROLLED',
                  label: 'Terkendali (Controlled)',
                  sub: 'Mencapai target terapi klinis stabil',
                  color: 'border-emerald-600 bg-emerald-50 text-emerald-950',
                },
                {
                  id: 'NOT_CONTROLLED',
                  label: 'Belum Terkendali',
                  sub: 'Masih di luar target sasaran terapi',
                  color: 'border-stone-500 bg-stone-100 text-stone-950',
                },
                {
                  id: 'NOT_YET_ASSESSABLE',
                  label: 'Belum Dapat Dinilai',
                  sub: 'Data atau observasi belum lengkap',
                  color: 'border-amber-500 bg-amber-50 text-amber-950',
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setControlStatus(item.id as ControlStatus)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    controlStatus === item.id
                      ? `${item.color} shadow-xs font-semibold`
                      : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[11px] opacity-80 mt-1">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bukti Komparator Wajib */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Bukti Komparator Observasi (Wajib untuk Status Terkendali)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasComp"
                  checked={hasComparator}
                  onChange={(e) => setHasComparator(e.target.checked)}
                  className="rounded text-black focus:ring-[#00201C]"
                />
                <label htmlFor="hasComp" className="text-xs font-medium text-stone-700">
                  Tersedia Komparator Sah
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Observasi Terkini (Current)</label>
                <input
                  type="text"
                  value={currentSummary}
                  onChange={(e) => setCurrentSummary(e.target.value)}
                  placeholder="Contoh: TD 124/80 mmHg (15 Agu 2026)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Observasi Pembanding (Comparator Baseline)</label>
                <input
                  type="text"
                  value={comparatorSummary}
                  onChange={(e) => setComparatorSummary(e.target.value)}
                  placeholder="Contoh: Baseline TD 165/100 mmHg (15 Mei 2026)"
                  disabled={!hasComparator}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C] disabled:bg-stone-100 disabled:text-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Alasan Pertimbangan Klinis Dokter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Alasan Pertimbangan Klinis Dokter (Wajib Diisi)
            </label>
            <textarea
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              rows={2}
              placeholder="Jelaskan alasan penetapan status terkendali/belum terkendali..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          {/* Bukti Pendukung */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Rangkuman Bukti Pendukung (Rekam Medis & Kepatuhan)
            </label>
            <input
              type="text"
              value={supportingEvidence}
              onChange={(e) => setSupportingEvidence(e.target.value)}
              placeholder="Contoh: Tren stabil 3 siklus berturut-turut, kepatuhan minum obat teratur..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          {/* Hard Product Notice: CONTROLLED != CURED */}
          {controlStatus === 'CONTROLLED' && (
            <div className="p-3 bg-[#FFFACD] border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Prinsip: TERKENDALI ≠ SEMBUH (Controlled ≠ Cured)</p>
                <p className="mt-0.5">
                  Warga dengan status terkendali tetap wajib dijadwalkan kontrol berkala (Maintenance Monitoring) dan tidak akan diarsipkan keluar dari platform.
                </p>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !isDoctor}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penetapan Manual'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
