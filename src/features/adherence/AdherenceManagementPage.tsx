import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldCheck, AlertTriangle, CheckCircle, Info, Filter, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DocBadge } from '../../components/common/DocBadge';
import { adherenceAssessmentRepo } from '../../repositories/adherenceAssessmentRepo';
import { monitoringCycleRepo } from '../../repositories/monitoringCycleRepo';
import { nonAdherenceCauseService } from '../../services/nonAdherenceCauseService';
import { AdherenceAssessmentModal } from '../monitoring/modals/AdherenceAssessmentModal';
import {
  AdherenceAssessment,
  MonitoringCycle,
  User,
  ExtendedBarrierCause,
  CauseProvenance,
} from '../../types';

interface AdherenceManagementPageProps {
  currentUser: User;
}

export const AdherenceManagementPage: React.FC<AdherenceManagementPageProps> = ({ currentUser }) => {
  const [assessments, setAssessments] = useState<AdherenceAssessment[]>([]);
  const [cycles, setCycles] = useState<MonitoringCycle[]>([]);
  const [filterProvenance, setFilterProvenance] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [selectedCycleForAdherence, setSelectedCycleForAdherence] = useState<MonitoringCycle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allAdhs, allCycles] = await Promise.all([
        adherenceAssessmentRepo.getAll(),
        monitoringCycleRepo.getAll(),
      ]);
      setAssessments(allAdhs);
      setCycles(allCycles);
    } catch (err) {
      console.error('Failed to load adherence data', err);
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

  // Cause distribution aggregations
  const causeCountMap = new Map<ExtendedBarrierCause, number>();
  assessments.forEach((a) => {
    (a.causes || []).forEach((c) => {
      causeCountMap.set(c.causeCode, (causeCountMap.get(c.causeCode) || 0) + 1);
    });
  });

  const allMetaCauses = nonAdherenceCauseService.getAllCauses();

  const filteredAssessments = assessments.filter((a) => {
    const matchesLevel = filterLevel === 'ALL' || a.adherenceLevel === filterLevel;
    const matchesProvenance =
      filterProvenance === 'ALL' ||
      (a.causes && a.causes.some((c) => c.reportedVia === filterProvenance));
    return matchesLevel && matchesProvenance;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00201C] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-900/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Pusat Tata Kelola Kepatuhan & Mitigasi Kendala Terapi</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black font-display">Kepatuhan Terapi & Manajemen Kendala</h1>
          <DocBadge code="SCR-PKM-F03" size="sm" />
        </div>
        <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Mengutamakan identifikasi sistemik dan dukungan solusi (transportasi laut, persediaan logistik obat, edukasi jadwal) daripada menyalahkan pasien. Terintegrasi dengan intervensi kader dan klinisi.
        </p>
      </div>

      {/* Non-Blaming Philosophy Card */}
      <div className="bg-[#E1F5FE] border border-sky-200 rounded-2xl p-5 flex items-start gap-4">
        <Info className="w-6 h-6 text-sky-800 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-950 leading-relaxed">
          <h3 className="text-sm font-bold text-sky-900 mb-1">Prinsip Solutif Tanpa Stigma (Non-Blaming Taxonomy)</h3>
          <p>
            Di wilayah kepulauan Pulau Taliabu, ketidakteraturan minum obat sering disebabkan oleh keterbatasan penyeberangan perahu saat cuaca buruk, kendala biaya perjalanan, atau kehabisan stok obat di Pustu pembantu. Platform ini merutekan setiap kendala ke tim yang berwenang membantu penyelesaian.
          </p>
        </div>
      </div>

      {/* Cause Distribution Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Distribusi Kendala & Hambatan Terdeteksi di Lapangan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allMetaCauses.map((cause) => {
            const count = causeCountMap.get(cause.code) || 0;
            return (
              <Card key={cause.code} className="p-4 border-stone-200 bg-white">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cause.category === 'CLINICAL'
                        ? 'bg-purple-100 text-purple-900'
                        : cause.category === 'SYSTEM_SUPPLY'
                        ? 'bg-rose-100 text-rose-900'
                        : cause.category === 'COMMUNITY'
                        ? 'bg-teal-100 text-teal-900'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {cause.category}
                  </span>
                  <span className="text-lg font-black text-stone-900 font-mono">{count}</span>
                </div>
                <h4 className="font-bold text-xs text-stone-900 mt-2">{cause.label}</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">{cause.suggestedActionText}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-stone-200 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Filter Tingkat Kepatuhan
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Tingkat Kepatuhan</option>
              <option value="REGULAR">Teratur (Regular)</option>
              <option value="PARTIAL">Sebagian (Partial)</option>
              <option value="IRREGULAR">Tidak Teratur (Irregular)</option>
              <option value="NOT_ASSESSABLE">Belum Dinilai</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Filter Asal Pelaporan (Provenance)
            </label>
            <select
              value={filterProvenance}
              onChange={(e) => setFilterProvenance(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C]"
            >
              <option value="ALL">Semua Sumber Pelaporan</option>
              <option value="CLINICIAN">Pemeriksaan Tenaga Medis</option>
              <option value="CITIZEN">Laporan Mandiri Warga / Portal</option>
              <option value="KADER">Kunjungan Rumah Kader Posyandu</option>
              <option value="SYSTEM_CONTEXT">Konteks Sistem (Stok Kosong)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assessment Table */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3 px-4">Warga</th>
                <th className="py-3 px-3">Tingkat Kepatuhan</th>
                <th className="py-3 px-3">Kekuatan Bukti</th>
                <th className="py-3 px-3">Kendala Teridentifikasi</th>
                <th className="py-3 px-3">Penilai & Tanggal</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">Memuat data kepatuhan...</td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    Tidak ditemukan data kepatuhan sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((a) => {
                  const cycle = cycles.find((c) => c.id === a.cycleId);

                  return (
                    <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{a.citizenName}</div>
                        <div className="text-[10px] text-stone-500">Siklus: {a.cycleId}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                            a.adherenceLevel === 'REGULAR'
                              ? 'bg-emerald-100 text-emerald-900'
                              : a.adherenceLevel === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-900'
                              : a.adherenceLevel === 'IRREGULAR'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {a.adherenceLevel === 'REGULAR'
                            ? 'Teratur'
                            : a.adherenceLevel === 'PARTIAL'
                            ? 'Sebagian'
                            : a.adherenceLevel === 'IRREGULAR'
                            ? 'Tidak Teratur'
                            : 'Belum Dinilai'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-stone-700">
                          {a.evidenceStrength === 'STRONG'
                            ? 'Kuat (Bawa Obat)'
                            : a.evidenceStrength === 'MODERATE'
                            ? 'Sedang (Verbal)'
                            : 'Terbatas / Estimasi'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {a.causes && a.causes.length > 0 ? (
                          <div className="space-y-1">
                            {a.causes.map((c, i) => (
                              <div key={i} className="text-[11px] font-semibold text-stone-800">
                                • {c.causeLabel}{' '}
                                <span className="text-[9px] font-normal text-stone-500">
                                  ({c.reportedVia})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Tidak ada kendala spesifik</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-stone-700">
                        <div>{a.assessedByUserName}</div>
                        <div className="text-[10px] text-stone-500">{a.assessedAt.split('T')[0]}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => cycle && setSelectedCycleForAdherence(cycle)}
                        >
                          <HeartHandshake className="w-3.5 h-3.5 mr-1" />
                          <span>Perbarui</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdherenceAssessmentModal
        isOpen={Boolean(selectedCycleForAdherence)}
        onClose={() => setSelectedCycleForAdherence(null)}
        cycle={selectedCycleForAdherence}
        currentUser={currentUser}
        onSaved={() => {
          loadData();
          showToast('Penilaian kepatuhan berhasil diperbarui.');
        }}
      />
    </div>
  );
};
