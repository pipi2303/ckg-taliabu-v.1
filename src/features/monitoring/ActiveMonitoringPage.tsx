import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  HeartHandshake,
  Stethoscope,
  Award,
  RefreshCw,
  MapPin,
  Send,
  Building2,
  ShieldCheck,
  Info,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { monitoringCycleRepo } from '../../repositories/monitoringCycleRepo';
import { outcomeEvaluationRepo } from '../../repositories/outcomeEvaluationRepo';
import { adherenceAssessmentRepo } from '../../repositories/adherenceAssessmentRepo';
import { citizenRepo } from '../../repositories/citizenRepo';
import { monitoringReminderService } from '../../services/monitoringReminderService';
import { AdherenceAssessmentModal } from './modals/AdherenceAssessmentModal';
import { ControlVisitModal } from './modals/ControlVisitModal';
import { ManualDeterminationModal } from './modals/ManualDeterminationModal';
import { AdvanceCycleModal } from './modals/AdvanceCycleModal';
import { TransferVillageModal } from './modals/TransferVillageModal';
import {
  MonitoringCycle,
  OutcomeEvaluation,
  AdherenceAssessment,
  User,
  ControlStatus,
  AdherenceLevel,
} from '../../types';

interface ActiveMonitoringPageProps {
  currentUser: User;
}

export const ActiveMonitoringPage: React.FC<ActiveMonitoringPageProps> = ({ currentUser }) => {
  const [cycles, setCycles] = useState<MonitoringCycle[]>([]);
  const [evaluations, setEvaluations] = useState<OutcomeEvaluation[]>([]);
  const [adherences, setAdherences] = useState<AdherenceAssessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFacility, setFilterFacility] = useState('ALL');
  const [filterCondition, setFilterCondition] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAdherence, setFilterAdherence] = useState('ALL');
  const [filterOutcome, setFilterOutcome] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Active Modals
  const [selectedCycleForAdherence, setSelectedCycleForAdherence] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForVisit, setSelectedCycleForVisit] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForManual, setSelectedCycleForManual] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForAdvance, setSelectedCycleForAdvance] = useState<MonitoringCycle | null>(null);
  const [selectedCycleForTransfer, setSelectedCycleForTransfer] = useState<MonitoringCycle | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allCycles, allEvals, allAdhs] = await Promise.all([
        monitoringCycleRepo.getAll(),
        outcomeEvaluationRepo.getAll(),
        adherenceAssessmentRepo.getAll(),
      ]);
      setCycles(allCycles);
      setEvaluations(allEvals);
      setAdherences(allAdhs);
    } catch (err) {
      console.error('Failed to load monitoring data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendReminder = async (cycle: MonitoringCycle) => {
    try {
      const citizen = await citizenRepo.getById(cycle.citizenId);
      if (!citizen) throw new Error('Data warga tidak ditemukan.');
      await monitoringReminderService.sendMonitoringReminder(citizen, cycle);
      showToast(`Pengingat kontrol privasi aman berhasil dikirimkan ke ${citizen.fullName}.`);
    } catch (err: any) {
      showToast(`Gagal mengirim pengingat: ${err.message}`);
    }
  };

  // Filter calculations
  const filteredCycles = cycles.filter((c) => {
    const matchesSearch =
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenNik.includes(searchQuery) ||
      c.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.villageName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFacility = filterFacility === 'ALL' || c.facilityId === filterFacility;
    const matchesCondition =
      filterCondition === 'ALL' || c.condition.toLowerCase().includes(filterCondition.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.cycleStatus === filterStatus;

    // Outcome filter
    const evalItem = evaluations.find((e) => e.cycleId === c.id && !e.supersededById);
    const outcomeStatus = evalItem ? evalItem.controlStatus : 'NOT_YET_ASSESSABLE';
    const matchesOutcome = filterOutcome === 'ALL' || outcomeStatus === filterOutcome;

    // Adherence filter
    const adhItem = adherences.find((a) => a.cycleId === c.id);
    const adhLevel = adhItem ? adhItem.adherenceLevel : 'NOT_ASSESSABLE';
    const matchesAdherence = filterAdherence === 'ALL' || adhLevel === filterAdherence;

    return (
      matchesSearch &&
      matchesFacility &&
      matchesCondition &&
      matchesStatus &&
      matchesOutcome &&
      matchesAdherence
    );
  });

  // Summary Metrics
  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
  const activeCount = cycles.filter(
    (c) =>
      c.cycleStatus === 'ACTIVE' ||
      c.cycleStatus === 'AWAITING_CONTROL' ||
      c.cycleStatus === 'AWAITING_MEASUREMENT' ||
      c.cycleStatus === 'AWAITING_EVALUATION'
  ).length;

  const dueThisWeekCount = cycles.filter((c) => {
    const t = new Date(c.plannedControlAt).getTime();
    return t >= now && t <= weekAhead;
  }).length;

  const awaitingMeasurementCount = cycles.filter((c) => c.cycleStatus === 'AWAITING_MEASUREMENT').length;
  const awaitingEvaluationCount = cycles.filter((c) => c.cycleStatus === 'AWAITING_EVALUATION').length;
  const atRiskCount = cycles.filter((c) => c.cycleStatus === 'AT_RISK_DROPOUT' || c.dropoutRiskFlagged).length;
  const notAssessableCount = evaluations.filter(
    (e) => !e.supersededById && e.controlStatus === 'NOT_YET_ASSESSABLE'
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00201C] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-3 border border-teal-600/40">
            <Activity className="w-3.5 h-3.5" />
            <span>Continuous Cyclical Monitoring & Control Status</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
              Pemantauan Aktif & Status Hasil Kontrol
            </h1>
            <DocBadge code="SCR-PKM-F01" size="sm" />
          </div>
          <p className="text-stone-300 text-sm mt-2 leading-relaxed">
            Menjawab: <em>"Setelah pasien mulai ditangani, apakah ia tetap dalam perawatan dan apakah kondisinya membaik?"</em>. Setiap warga dalam perawatan terhubung dalam siklus pemantauan berkesinambungan tanpa celah klinis.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-teal-700/20 to-transparent pointer-events-none" />
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-stone-200 bg-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Pasien Monitoring</p>
          <p className="text-2xl font-black text-black mt-1">{cycles.length}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">{activeCount} siklus aktif</p>
        </Card>

        <Card className="p-4 border-sky-200 bg-[#E1F5FE]/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Kontrol Minggu Ini</p>
          <p className="text-2xl font-black text-sky-950 mt-1">{dueThisWeekCount}</p>
          <p className="text-[10px] text-sky-700 mt-0.5">Jadwal 7 hari ke depan</p>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Menunggu Ukur</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{awaitingMeasurementCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Kendala alat/reagen</p>
        </Card>

        <Card className="p-4 border-teal-200 bg-teal-50/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Menunggu Evaluasi</p>
          <p className="text-2xl font-black text-teal-950 mt-1">{awaitingEvaluationCount}</p>
          <p className="text-[10px] text-teal-700 mt-0.5">Ukur selesai, siap telaah</p>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/50">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Risiko Putus (Dropout)</p>
          <p className="text-2xl font-black text-rose-950 mt-1">{atRiskCount}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">&gt; 14 hari terlewat</p>
        </Card>

        <Card className="p-4 border-amber-200 bg-[#FFFACD]/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
            <span>OI-08 Status</span>
          </p>
          <p className="text-lg font-black text-amber-950 mt-1 truncate">Belum Dapat Dinilai</p>
          <p className="text-[10px] text-amber-800 mt-0.5">{notAssessableCount} kasus locked</p>
        </Card>
      </div>

      {/* Governance Banner: OI-08 Hard Lock */}
      <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-bold">Kunci Tata Kelola Klinis (Governance Hard Lock OI-08): </span>
          Sistem dilarang menetapkan status <em>CONTROLLED</em> atau <em>NOT_CONTROLLED</em> secara otomatis menggunakan ambang batas yang belum disahkan (WHO/ADA/PERKI/ACC/AHA). Status evaluasi sistem otomatis terstandar <strong>Belum Dapat Dinilai</strong>. Dokter penanggung jawab dapat melakukan penetapan klinis manual dengan bukti komparator sah.
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-stone-200 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Warga / NIK / Desa..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            />
          </div>

          {/* Facility Filter */}
          <div>
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Faskes (Kab. Pulau Taliabu)</option>
              <option value="fac-001">Puskesmas Bobong</option>
              <option value="fac-002">Puskesmas Lede</option>
              <option value="fac-003">Puskesmas Taliabu Barat Laut (Nggele)</option>
              <option value="fac-004">Puskesmas Samuya</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Kondisi / Diagnosa</option>
              <option value="Hipertensi">Hipertensi (I10)</option>
              <option value="Diabetes">Diabetes Mellitus (E11)</option>
              <option value="Prediabetes">Prediabetes & Gaya Hidup</option>
              <option value="Ginjal">Penyakit Ginjal Kronik (N18)</option>
            </select>
          </div>

          {/* Adherence Filter */}
          <div>
            <select
              value={filterAdherence}
              onChange={(e) => setFilterAdherence(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Tingkat Kepatuhan</option>
              <option value="REGULAR">Teratur (Regular)</option>
              <option value="PARTIAL">Sebagian (Partial)</option>
              <option value="IRREGULAR">Tidak Teratur (Irregular)</option>
              <option value="NOT_ASSESSABLE">Belum Dinilai</option>
            </select>
          </div>

          {/* Outcome Status Filter */}
          <div>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Status Outcome</option>
              <option value="NOT_YET_ASSESSABLE">Belum Dapat Dinilai (OI-08)</option>
              <option value="CONTROLLED">Terkendali (Manual Doctor)</option>
              <option value="NOT_CONTROLLED">Belum Terkendali</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3.5 px-4">Warga & Domisili</th>
                <th className="py-3.5 px-3">Kondisi & Siklus</th>
                <th className="py-3.5 px-3">Jadwal Kontrol</th>
                <th className="py-3.5 px-3">Kepatuhan Terapi</th>
                <th className="py-3.5 px-3">Status Hasil (Outcome)</th>
                <th className="py-3.5 px-3">Faskes Pembina</th>
                <th className="py-3.5 px-4 text-right">Tindakan Klinis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    Memuat data siklus pemantauan aktif...
                  </td>
                </tr>
              ) : filteredCycles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    Tidak ditemukan data siklus monitoring yang sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredCycles.map((c) => {
                  const evalItem = evaluations.find((e) => e.cycleId === c.id && !e.supersededById);
                  const adhItem = adherences.find((a) => a.cycleId === c.id);

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Warga & Domisili */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{c.citizenName}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          NIK: {c.citizenNik ? `${c.citizenNik.substring(0, 4)}••••••••${c.citizenNik.substring(12)}` : '••••••••••••••••'}
                        </div>
                        <div className="text-[11px] text-stone-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{c.villageName}</span>
                          {c.transferredFromVillage && (
                            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-sm border border-teal-200">
                              Pindahan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kondisi & Siklus */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-800">{c.condition}</div>
                        <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                          <span>Siklus #{c.cycleNumber}</span>
                        </div>
                        {c.isContinuingFkrtl && (
                          <div className="mt-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 inline-block">
                            Perawatan FKRTL (RSUD)
                          </div>
                        )}
                      </td>

                      {/* Jadwal Kontrol */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-stone-800">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.plannedControlAt}</span>
                        </div>
                        {c.actualControlAt && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Hadir: {c.actualControlAt}
                          </div>
                        )}
                        {c.cycleStatus === 'AT_RISK_DROPOUT' ? (
                          <div className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-200 mt-1 inline-block">
                            Terlewat {c.missedControlDays || 14}+ hari
                          </div>
                        ) : c.cycleStatus === 'AWAITING_MEASUREMENT' ? (
                          <div className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 mt-1 inline-block">
                            Menunggu Alat Lab
                          </div>
                        ) : (
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            {c.intervalSourceRule.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Kepatuhan Terapi */}
                      <td className="py-3 px-3">
                        {adhItem ? (
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                                adhItem.adherenceLevel === 'REGULAR'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : adhItem.adherenceLevel === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-900'
                                  : adhItem.adherenceLevel === 'IRREGULAR'
                                  ? 'bg-rose-100 text-rose-900'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {adhItem.adherenceLevel === 'REGULAR'
                                ? 'Teratur'
                                : adhItem.adherenceLevel === 'PARTIAL'
                                ? 'Sebagian'
                                : adhItem.adherenceLevel === 'IRREGULAR'
                                ? 'Tidak Teratur'
                                : 'Belum Dinilai'}
                            </span>
                            {adhItem.causes && adhItem.causes.length > 0 && (
                              <div className="text-[10px] text-stone-500 mt-0.5 truncate max-w-36">
                                {adhItem.causes.map((k) => k.causeLabel).join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Belum dinilai</span>
                        )}
                      </td>

                      {/* Status Hasil (Outcome) - Separate Semantics */}
                      <td className="py-3 px-3">
                        {evalItem ? (
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                                evalItem.controlStatus === 'CONTROLLED'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : evalItem.controlStatus === 'NOT_CONTROLLED'
                                  ? 'bg-stone-200 text-stone-900 border border-stone-300'
                                  : 'bg-amber-100 text-amber-950 border border-amber-300'
                              }`}
                            >
                              {evalItem.controlStatus === 'CONTROLLED'
                                ? 'Terkendali'
                                : evalItem.controlStatus === 'NOT_CONTROLLED'
                                ? 'Belum Terkendali'
                                : 'Belum Dapat Dinilai'}
                            </span>
                            {evalItem.isManualDetermination ? (
                              <div className="text-[9px] font-bold text-teal-800 mt-0.5 flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5" />
                                <span>Penetapan Manual Dokter</span>
                              </div>
                            ) : (
                              <div className="text-[9px] text-amber-800 mt-0.5 font-medium">
                                Sistem (Kunci OI-08)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                            Belum Dapat Dinilai
                          </span>
                        )}
                      </td>

                      {/* Faskes Pembina */}
                      <td className="py-3 px-3 text-stone-700">
                        <div className="font-medium text-xs">{c.facilityName}</div>
                        {c.estimatedRunoutDate && (
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            Est. Obat: {c.estimatedRunoutDate}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Catat Kunjungan Kontrol */}
                          <button
                            onClick={() => setSelectedCycleForVisit(c)}
                            title="Catat Pemeriksaan Kunjungan Kontrol"
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 transition-colors"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>

                          {/* Penilaian Kepatuhan */}
                          <button
                            onClick={() => setSelectedCycleForAdherence(c)}
                            title="Penilaian Kepatuhan & Kendala"
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                          >
                            <HeartHandshake className="w-4 h-4" />
                          </button>

                          {/* Penetapan Manual Dokter */}
                          <button
                            onClick={() => setSelectedCycleForManual(c)}
                            title="Penetapan Klinis Manual Dokter (Wewenang Medis)"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors"
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          {/* Terbitkan Siklus Berikutnya */}
                          <button
                            onClick={() => setSelectedCycleForAdvance(c)}
                            title="Terbitkan Siklus Lanjutan (Cycle + 1)"
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Pindah Wilayah */}
                          <button
                            onClick={() => setSelectedCycleForTransfer(c)}
                            title="Pindahan Domisili / Transfer Wilayah"
                            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>

                          {/* Kirim Pengingat Privasi Aman */}
                          <button
                            onClick={() => handleSendReminder(c)}
                            title="Kirim Pengingat Kontrol (Privasi Aman)"
                            className="p-1.5 rounded-lg bg-[#00201C] hover:bg-teal-900 text-white transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals with Single Active & Global Outside Click Close */}
      <AdherenceAssessmentModal
        isOpen={Boolean(selectedCycleForAdherence)}
        onClose={() => setSelectedCycleForAdherence(null)}
        cycle={selectedCycleForAdherence}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Penilaian kepatuhan & rute intervensi berhasil disimpan.');
        }}
      />

      <ControlVisitModal
        isOpen={Boolean(selectedCycleForVisit)}
        onClose={() => setSelectedCycleForVisit(null)}
        cycle={selectedCycleForVisit}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Rekam kunjungan kontrol & pengukuran berhasil disimpan.');
        }}
      />

      <ManualDeterminationModal
        isOpen={Boolean(selectedCycleForManual)}
        onClose={() => setSelectedCycleForManual(null)}
        cycle={selectedCycleForManual}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Penetapan manual tenaga medis berhasil disimpan & dicatat ke Audit.');
        }}
      />

      <AdvanceCycleModal
        isOpen={Boolean(selectedCycleForAdvance)}
        onClose={() => setSelectedCycleForAdvance(null)}
        cycle={selectedCycleForAdvance}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Siklus pemantauan lanjutan berhasil diterbitkan.');
        }}
      />

      <TransferVillageModal
        isOpen={Boolean(selectedCycleForTransfer)}
        onClose={() => setSelectedCycleForTransfer(null)}
        cycle={selectedCycleForTransfer}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Tanggung jawab siklus berhasil ditransfer ke faskes tujuan.');
        }}
      />
    </div>
  );
};
