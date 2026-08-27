import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, AlertTriangle, CheckCircle2, User, Stethoscope, Calendar, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { outcomeTrendService, CitizenOutcomeTrendProfile } from '../../services/outcomeTrendService';
import { citizenRepo } from '../../repositories/citizenRepo';
import { Citizen, User as UserModel } from '../../types';

interface OutcomeTrendsPageProps {
  currentUser: UserModel;
}

export const OutcomeTrendsPage: React.FC<OutcomeTrendsPageProps> = ({ currentUser }) => {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('CTZ-2026-0001');
  const [trendProfile, setTrendProfile] = useState<CitizenOutcomeTrendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCitizens = async () => {
      try {
        const list = await citizenRepo.getAll();
        setCitizens(list);
        if (list.length > 0) {
          setSelectedCitizenId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load citizens', err);
      }
    };
    loadCitizens();
  }, []);

  useEffect(() => {
    const loadTrend = async () => {
      if (!selectedCitizenId) return;
      setIsLoading(true);
      try {
        const data = await outcomeTrendService.getCitizenTrendProfile(selectedCitizenId);
        setTrendProfile(data);
      } catch (err) {
        console.error('Failed to load trend profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrend();
  }, [selectedCitizenId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#00201C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-900/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 rounded-full text-xs font-semibold text-teal-200 mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analisis Tren Klinis Longitudinal & Riwayat Intervensi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display">Tren Longitudinal Hasil Kontrol & Terapi</h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Menampilkan perkembangan parameter vital dan laboratorium dari siklus ke siklus, bersanding langsung dengan catatan kepatuhan dan penyesuaian regimen obat.
        </p>
      </div>

      {/* Citizen Selector Card */}
      <Card className="p-4 border-stone-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Pilih Warga untuk Telaah Longitudinal
            </label>
            <select
              value={selectedCitizenId}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#00201C]"
            >
              {citizens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} (NIK: {c.nik ? `${c.nik.substring(0, 6)}••••••` : '••••••'}) - {c.villageName}
                </option>
              ))}
            </select>
          </div>

          {trendProfile && (
            <div className="flex items-center gap-3 text-xs bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500">Kondisi:</span>{' '}
                <span className="font-bold text-stone-900">{trendProfile.condition}</span>
              </div>
              <div className="border-l border-stone-300 pl-3">
                <span className="text-stone-500">Total Siklus:</span>{' '}
                <span className="font-bold text-teal-900">#{trendProfile.totalCyclesCount}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Trend Notice Banner */}
      {trendProfile && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
            trendProfile.hasEnoughDataForTrend
              ? 'bg-teal-50 border-teal-200 text-teal-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {trendProfile.hasEnoughDataForTrend ? (
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">Status Data Longitudinal:</p>
            <p className="mt-0.5">{trendProfile.trendNotice}</p>
          </div>
        </div>
      )}

      {/* Longitudinal Timeline / Table */}
      <Card className="overflow-hidden border-stone-200 bg-white">
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-bold text-stone-900 text-sm">
            Riwayat Kronologis Multi-Siklus ({trendProfile?.citizenName})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3 px-4">Siklus & Waktu</th>
                <th className="py-3 px-3">Tekanan Darah (CR-KF-01)</th>
                <th className="py-3 px-3">Gula Darah (CR-KF-02)</th>
                <th className="py-3 px-3">Kepatuhan Pasien</th>
                <th className="py-3 px-3">Intervensi / Kendala</th>
                <th className="py-3 px-3">Regimen Terapi</th>
                <th className="py-3 px-4">Status Hasil (Outcome)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">Memuat riwayat tren...</td>
                </tr>
              ) : !trendProfile || trendProfile.points.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    Belum ada titik riwayat pemeriksaan pada warga ini.
                  </td>
                </tr>
              ) : (
                trendProfile.points.map((p, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900">Siklus #{p.cycleNumber}</span>
                      <div className="text-[11px] text-stone-500">{p.cycleDate}</div>
                      {p.missedVisit && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                          Terlewat Kontrol
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {p.systolicBp && p.diastolicBp ? (
                        <div className="font-mono font-bold text-stone-900">
                          {p.systolicBp}/{p.diastolicBp} <span className="text-[10px] font-normal text-stone-500">mmHg</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {p.bloodGlucose ? (
                        <div className="font-mono font-bold text-stone-900">
                          {p.bloodGlucose} <span className="text-[10px] font-normal text-stone-500">mg/dL</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.adherenceLevel === 'REGULAR'
                            ? 'bg-emerald-100 text-emerald-900'
                            : p.adherenceLevel === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-900'
                            : p.adherenceLevel === 'IRREGULAR'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {p.adherenceLevel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-stone-700">
                      <div className="max-w-xs truncate" title={p.interventionSummary}>
                        {p.interventionSummary}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-stone-700">
                      <div className="max-w-xs truncate" title={p.treatmentAdjustmentSummary}>
                        {p.treatmentAdjustmentSummary}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.controlStatus === 'CONTROLLED'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : p.controlStatus === 'NOT_CONTROLLED'
                            ? 'bg-stone-200 text-stone-900 border border-stone-300'
                            : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {p.controlStatus === 'CONTROLLED'
                          ? 'Terkendali'
                          : p.controlStatus === 'NOT_CONTROLLED'
                          ? 'Belum Terkendali'
                          : 'Belum Dapat Dinilai'}
                      </span>
                      {p.isManual && (
                        <div className="text-[9px] font-bold text-teal-800 mt-0.5">Penetapan Dokter</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
