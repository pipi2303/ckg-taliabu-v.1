import React, { useMemo } from 'react';
import { X, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { kaderStorageRepo } from '../../../repositories/kaderStorageRepo';
import { FieldVisitOutcome } from '../../../types';

interface KaderRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OUTCOME_LABELS: Record<FieldVisitOutcome, string> = {
  AGREED_TO_ATTEND: 'Bersedia Hadir',
  DECLINED: 'Menolak',
  POSTPONED: 'Menunda Jadwal',
  NOT_AT_HOME: 'Tidak di Rumah',
  MOVED_AWAY: 'Pindah Domisili',
  DECEASED: 'Meninggal Dunia',
  ADDRESS_NOT_FOUND: 'Alamat Tidak Ditemukan',
};

const OUTCOME_ORDER: FieldVisitOutcome[] = [
  'AGREED_TO_ATTEND',
  'DECLINED',
  'POSTPONED',
  'NOT_AT_HOME',
  'MOVED_AWAY',
  'ADDRESS_NOT_FOUND',
  'DECEASED',
];

// KF-15: kader's own work recap — count of visits & their outcomes, deliberately never a
// cross-kader ranking/leaderboard (per the catalog's explicit constraint on this feature).
export const KaderRecapModal: React.FC<KaderRecapModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  const visits = useMemo(() => {
    if (!isOpen || !currentUser) return [];
    return kaderStorageRepo.getLocalFieldVisits(currentUser.id);
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const outcomeCounts = OUTCOME_ORDER.map((outcome) => ({
    outcome,
    label: OUTCOME_LABELS[outcome],
    count: visits.filter((v) => v.outcome === outcome).length,
  })).filter((o) => o.count > 0);

  const lastVisitDate = visits.length
    ? new Date(
        Math.max(...visits.map((v) => new Date(v.deviceRecordedAt).getTime()))
      ).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl z-10 border border-[#D8E5E2] max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-[#D8E5E2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EBF7F2] text-[#2E7D5B]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-black">Rekap Kerja Saya</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#60716D] hover:text-black cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          <p className="text-[11px] text-[#60716D] leading-relaxed">
            Ringkasan kunjungan yang Anda catat di gawai ini. Rekapan ini hanya menampilkan hasil kerja Anda sendiri — tidak ada perbandingan atau peringkat antar-kader.
          </p>

          <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] flex items-center justify-between">
            <span className="text-[#60716D]">Total Kunjungan Tercatat</span>
            <span className="text-lg font-black text-black">{visits.length}</span>
          </div>

          {lastVisitDate && (
            <div className="p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] flex items-center justify-between">
              <span className="text-[#60716D]">Kunjungan Terakhir</span>
              <span className="font-semibold text-black">{lastVisitDate}</span>
            </div>
          )}

          {outcomeCounts.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">Rincian Hasil Kunjungan</span>
              {outcomeCounts.map((o) => (
                <div
                  key={o.outcome}
                  className="p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] flex items-center justify-between"
                >
                  <span className="text-[#334643]">{o.label}</span>
                  <span className="font-bold text-black">{o.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-center">
              Belum ada kunjungan tercatat di gawai ini.
            </div>
          )}

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-700" />
            <span className="text-[11px] leading-relaxed">Data ini milik Anda sendiri dan tidak dibagikan sebagai peringkat ke kader lain.</span>
          </div>
        </div>

        <div className="p-3 border-t border-[#D8E5E2] shrink-0">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
