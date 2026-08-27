import React, { useEffect, useState } from 'react';
import {
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  RefreshCw,
  Search,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Info,
} from 'lucide-react';
import { DropoutCandidate } from '../../../types';
import { dropoutCandidateService } from '../../../services/dropoutCandidateService';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { DocBadge } from '../../../components/common/DocBadge';
import { TerminalStatusModal } from '../components/TerminalStatusModal';

export const DropoutCandidatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<DropoutCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Terminal Modal
  const [selectedCandidate, setSelectedCandidate] = useState<DropoutCandidate | null>(null);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const list = await dropoutCandidateService.getCandidates();
      setCandidates(list);
    } catch (err) {
      console.error('Failed to load dropout candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async (cand: DropoutCandidate) => {
    const reason = prompt('Masukkan alasan pengaktifan kembali ke kaskade:');
    if (!reason || reason.trim().length < 5) return;

    if (!currentUser) return;
    try {
      await dropoutCandidateService.reactivateToCascade(cand.id, reason, {
        id: currentUser.id,
        name: currentUser.name,
      });
      loadCandidates();
    } catch (err) {
      console.error('Failed to reactivate candidate:', err);
    }
  };

  const filtered = candidates.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.citizenName.toLowerCase().includes(q) ||
        c.villageName?.toLowerCase().includes(q) ||
        c.reasonPattern.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <UserX className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">
                  Kandidat Putus Perawatan (Dropout Review)
                </h1>
                <DocBadge code="SCR-PKM-B04" size="xs" />
              </div>
              <p className="text-xs text-[#60716D]">
                Antrean telaah klinis & operasional warga yang berisiko keluar dari kaskade tindak lanjut CKG.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCandidates}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Governance & Human-Only LTFU Banner */}
      <div className="p-4 bg-[#F0F5F4] border border-[#D8E5E2] rounded-2xl text-xs text-[#334643] space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-black">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          Tata Kelola Kaskade CKG Pulau Taliabu:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
          <div className="p-2.5 bg-white rounded-lg border border-[#D8E5E2]">
            <strong>1. Status Non-Otomatis:</strong> Berada dalam daftar kandidat <em>bukanlah sebuah status akhir</em>. Sistem tidak pernah menetapkan LTFU secara otomatis tanpa telaah manusia.
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-[#D8E5E2]">
            <strong>2. Syarat Kontak Manusia:</strong> Penetapan LTFU wajib memiliki bukti minimal 1 kali kontak manusia langsung (telepon atau kunjungan kader).
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-[#D8E5E2]">
            <strong>3. Reversibel & Tercatat:</strong> Warga LTFU tetap dihitung dalam penyebut sasaran populasi daerah dan dapat direaktivasi kapan saja jika kembali aktif.
          </div>
        </div>
      </div>

      {/* Candidate List Table */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-xs">Daftar Kandidat ({filtered.length} Warga)</div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau desa..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white/10 text-white rounded-lg border border-white/20 placeholder-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#60716D]">Memuat data kandidat...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#60716D]">
            Tidak ada kandidat putus perawatan yang memerlukan telaah saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[#60716D] uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3.5">Warga & Domisili</th>
                  <th className="p-3.5">Pola Indikasi Dropout</th>
                  <th className="p-3.5">Upaya Outreach</th>
                  <th className="p-3.5">Bukti Kontak Manusia</th>
                  <th className="p-3.5">Status Kaskade</th>
                  <th className="p-3.5 text-right">Aksi Telaah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E5E2]">
                {filtered.map((cand) => {
                  const isTerminal =
                    cand.cascadeStatus === 'LOST_TO_FOLLOWUP' ||
                    cand.cascadeStatus === 'REFUSED' ||
                    cand.cascadeStatus === 'MOVED' ||
                    cand.cascadeStatus === 'DECEASED';

                  return (
                    <tr key={cand.id} className="hover:bg-[#F0F5F4] transition-colors">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-xs text-black">{cand.citizenName}</div>
                        <div className="text-[11px] text-[#60716D]">{cand.villageName}</div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-xs text-black">{cand.reasonPattern}</div>
                        <div className="text-[11px] text-[#60716D]">
                          {cand.missedAppointmentsCount} kali janji temu tidak hadir
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-xs text-black">{cand.contactAttemptsCount} Kali Kontak</div>
                        <div className="text-[10px] text-[#60716D]">
                          Terakhir: {new Date(cand.lastAttemptAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {cand.hasHumanContactAttempt ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Belum Ada
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            cand.cascadeStatus === 'LOST_TO_FOLLOWUP'
                              ? 'bg-red-100 text-red-800'
                              : cand.cascadeStatus === 'REFUSED'
                              ? 'bg-amber-100 text-amber-900'
                              : cand.cascadeStatus === 'QUEUED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cand.cascadeStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isTerminal ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivate(cand)}
                              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                              className="text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                            >
                              Aktifkan Kembali ke Kaskade
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setIsTerminalModalOpen(true);
                              }}
                              className="bg-red-700 hover:bg-red-800 text-white"
                            >
                              Tetapkan Status Terminal
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Terminal Status Modal */}
      <TerminalStatusModal
        candidate={selectedCandidate}
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        onSuccess={loadCandidates}
      />
    </div>
  );
};
