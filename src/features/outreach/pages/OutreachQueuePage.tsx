import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Building2,
} from 'lucide-react';
import { CareTask, ContactAttempt } from '../../../types';
import { careTaskRepo } from '../../../repositories/careTaskRepo';
import { contactAttemptRepo } from '../../../repositories/contactAttemptRepo';
import { outreachOrchestrationService } from '../../../services/outreachOrchestrationService';
import { Button } from '../../../components/common/Button';
import { DocBadge } from '../../../components/common/DocBadge';
import { DigitalOutreachModal } from '../components/DigitalOutreachModal';
import { PhoneContactModal } from '../components/PhoneContactModal';

export const OutreachQueuePage: React.FC = () => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [attempts, setAttempts] = useState<ContactAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // Modals
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);

  // Response simulation modal
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [responseType, setResponseType] = useState<'AGREE' | 'DECLINE' | 'POSTPONE' | 'OPT_OUT' | 'FREE_TEXT'>('AGREE');
  const [freeText, setFreeText] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeTasks = await careTaskRepo.query({
        status: 'IN_PROGRESS',
      });
      const openTasks = await careTaskRepo.query({
        status: 'OPEN',
      });
      setTasks([...activeTasks, ...openTasks]);
      const atts = await contactAttemptRepo.getAll();
      setAttempts(atts);
    } catch (err) {
      console.error('Failed to load outreach data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateCitizenResponse = async () => {
    if (!selectedTask) return;
    try {
      await outreachOrchestrationService.handleCitizenResponse(
        selectedTask.id,
        responseType,
        responseType === 'DECLINE' ? 'DISTANCE_TRANSPORT' : responseType === 'POSTPONE' ? 'WORK_SCHEDULE' : undefined,
        freeText
      );
      setIsResponseModalOpen(false);
      setFreeText('');
      loadData();
    } catch (err) {
      console.error('Failed to record response:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.citizenName?.toLowerCase().includes(q) && !t.citizenPhone?.includes(q)) return false;
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
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">Kaskade Outreach Aktif</h1>
                <DocBadge code="SCR-PKM-B03" size="xs" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  SIMULASI KANAL PESAN
                </span>
              </div>
              <p className="text-xs text-[#60716D]">
                Orkestrasi penjangkauan berjenjang (WhatsApp &gt; Telepon &gt; Kunjungan Kader) dengan perlindungan privasi data warga.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Rules Notice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-[#60716D] uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aturan Pesan Otomatis
          </span>
          <p className="text-xs text-[#334643]">
            Maksimal <strong>2 pesan otomatis</strong> per siklus sebelum eskalasi ke kontak manusia langsung.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Temuan Kritis
          </span>
          <p className="text-xs text-[#334643]">
            Melewati (bypass) jenjang pengingat bertahap dan langsung diarahkan ke kontak manusia segera.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#D8E5E2] space-y-1">
          <span className="text-[11px] font-bold text-[#60716D] uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Perlindungan Privasi
          </span>
          <p className="text-xs text-[#334643]">
            Pesan otomatis <strong>TIDAK memuat</strong> diagnosis, nilai tensi/gula darah, atau warna risiko.
          </p>
        </div>
      </div>

      {/* Main Outreach Queue Table */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-xs">Antrean Penjangkauan Warga ({filteredTasks.length} Kasus)</div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau no. kontak..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white/10 text-white rounded-lg border border-white/20 placeholder-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#60716D]">Memuat antrean outreach...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#60716D]">Tidak ada antrean outreach aktif.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[#60716D] uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3.5">Warga & No. Telepon</th>
                  <th className="p-3.5">Instruksi Tindak Lanjut</th>
                  <th className="p-3.5">Tahap Ladder</th>
                  <th className="p-3.5">Hasil Kontak Terakhir</th>
                  <th className="p-3.5 text-right">Aksi Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E5E2]">
                {filteredTasks.map((task) => {
                  const attemptsCount = task.contactAttemptsCount || 0;
                  const hasPhone = !!task.citizenPhone;

                  return (
                    <tr key={task.id} className="hover:bg-[#F0F5F4] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-xs text-black">{task.citizenName}</div>
                        <div className="text-[11px] text-[#60716D]">
                          {task.citizenPhone || <span className="text-amber-700 italic">Tanpa Nomor Kontak</span>}
                        </div>
                        <div className="text-[10px] text-[#60716D]">{task.villageName}</div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-xs text-black line-clamp-1">{task.actionText}</div>
                        <div className="text-[11px] text-[#60716D]">
                          {task.taskType} · Batas {new Date(task.dueAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              attemptsCount >= 2
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            Langkah {attemptsCount} / 4
                          </span>
                        </div>
                        <span className="text-[10px] text-[#60716D]">
                          {attemptsCount === 0
                            ? 'Pesan Digital 1'
                            : attemptsCount === 1
                            ? 'Pengingat Digital 2'
                            : attemptsCount === 2
                            ? 'Panggilan Telepon'
                            : 'Kunjungan Kader Lapangan'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {task.lastContactOutcome ? (
                          <div>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                task.lastContactOutcome === 'CONNECTED_AGREED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : task.lastContactOutcome === 'CONNECTED_DECLINED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {task.lastContactOutcome}
                            </span>
                            {task.lastContactAttemptAt && (
                              <div className="text-[10px] text-[#60716D] mt-0.5">
                                {new Date(task.lastContactAttemptAt).toLocaleDateString('id-ID')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#60716D] italic">Belum Dikontak</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDigitalModalOpen(true);
                            }}
                            disabled={!hasPhone || attemptsCount >= 2 || task.isCritical}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Kirim Pesan
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsPhoneModalOpen(true);
                            }}
                            leftIcon={<Phone className="w-3.5 h-3.5" />}
                          >
                            Telepon
                          </Button>

                          {/* Simulation trigger: simulate citizen reply */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsResponseModalOpen(true);
                            }}
                            className="bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 text-xs"
                          >
                            Simulasi Respons
                          </Button>
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

      {/* Response Simulation Modal */}
      {isResponseModalOpen && selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsResponseModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D8E5E2] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Simulasi Respons Masuk dari Warga</span>
              <button onClick={() => setIsResponseModalOpen(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                <div className="font-bold text-black">{selectedTask.citizenName}</div>
                <div className="text-[11px] text-[#60716D]">{selectedTask.citizenPhone}</div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                  Pilih Jenis Respons Warga:
                </label>
                <select
                  value={responseType}
                  onChange={(e: any) => setResponseType(e.target.value)}
                  className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
                >
                  <option value="AGREE">Bersedia Hadir (Connected - Agreed)</option>
                  <option value="POSTPONE">Minta Tunda / Jadwal Ulang (Postponed)</option>
                  <option value="DECLINE">Menolak Tindak Lanjut (Declined)</option>
                  <option value="OPT_OUT">Opsi: Berhenti Pesan Digital (Opt-out)</option>
                  <option value="FREE_TEXT">Pesan Teks Bebas (Free-text Reply)</option>
                </select>
              </div>

              {responseType === 'FREE_TEXT' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                    Isi Pesan Teks Warga:
                  </label>
                  <input
                    type="text"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="Contoh: Dok, saya ada perahu ke Bobong hari Rabu, bisa datang saat itu?"
                    className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsResponseModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="sm" onClick={handleSimulateCitizenResponse}>
                  Simulasikan Respons
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DigitalOutreachModal
        task={selectedTask}
        isOpen={isDigitalModalOpen}
        onClose={() => setIsDigitalModalOpen(false)}
        onSuccess={loadData}
      />

      <PhoneContactModal
        task={selectedTask}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
