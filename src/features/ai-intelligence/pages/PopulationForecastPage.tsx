import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Pill,
  Compass,
  Ship,
  Sparkles,
  RefreshCw,
  Info,
  Calendar,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { aiForecastService } from '../../../services/aiForecastService';
import { AIPopulationForecast, AIDropoutPrediction } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const PopulationForecastPage: React.FC = () => {
  const { user } = useAuth();
  const [forecast, setForecast] = useState<AIPopulationForecast | null>(null);
  const [dropoutPredictions, setDropoutPredictions] = useState<AIDropoutPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterMinRisk, setFilterMinRisk] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fc = await aiForecastService.getCountyForecast();
      const dp = await aiForecastService.getDropoutRiskPredictions(filterMinRisk);
      setForecast(fc);
      setDropoutPredictions(dp);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterMinRisk]);

  const handleRefreshForecast = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const refreshed = await aiForecastService.runSimulatedForecastRefresh('Kabupaten Pulau Taliabu', {
        id: user.id,
        name: user.name,
        role: user.roleId,
      });
      setForecast(refreshed);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || !forecast) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Menghitung Proyeksi Beban Populasi & Prediksi Risiko AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="font-bold uppercase tracking-wider text-amber-950">DATA SIMULASI PREDIKTIF (PA-08):</strong> Model AI Proyeksi Beban Populasi & Estimasi Putus Pengobatan (Ensemble Model {forecast.modelMetadata.modelVersion}).
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">
          Confidence: {Math.round(forecast.modelMetadata.confidenceScore * 100)}%
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#00201C] dark:text-teal-400 font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#00201C] dark:text-teal-400" />
            POPULATION HEALTH BURDEN & MEDICATION DEMAND (PA-08)
          </div>
          <h1 className="text-2xl font-bold text-[#102521] dark:text-white tracking-tight">Proyeksi Beban Kesehatan & Kebutuhan Obat 6-Bulan</h1>
          <p className="text-xs text-[#60716D] dark:text-slate-400 mt-1">
            Forecasting beban penyakit kronis, kebutuhan stok obat antihipertensi/diabetes, dan risiko drop-out akibat faktor cuaca laut Kepulauan Taliabu.
          </p>
        </div>

        <button
          onClick={handleRefreshForecast}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#00201C] hover:bg-[#00332D] text-white rounded-xl text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Segarkan Prediksi Model AI
        </button>
      </div>

      {/* Strict Visual Distinction: # DATA AKTUAL vs # PROYEKSI AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-xl space-y-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            # 1. DATA AKTUAL HISTORIS (6 BULAN SEBELUMNYA)
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#60716D] dark:text-slate-400 uppercase font-semibold">Skrining Selesai</div>
              <div className="text-base font-bold text-[#102521] dark:text-white">3.420</div>
            </div>
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#60716D] dark:text-slate-400 uppercase font-semibold">Konsumsi Amlodipine</div>
              <div className="text-base font-bold text-[#00201C] dark:text-teal-300">18.400 tab</div>
            </div>
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#60716D] dark:text-slate-400 uppercase font-semibold">Rasio Drop-off Riil</div>
              <div className="text-base font-bold text-amber-700 dark:text-amber-400">23.6%</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-xl space-y-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-[#00201C] dark:text-teal-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#00201C] dark:text-teal-400" />
            # 2. PROYEKSI AI MODEL PA-08 (6 BULAN KE DEPAN)
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#00201C] dark:text-teal-400 uppercase font-semibold">Estimasi Skrining</div>
              <div className="text-base font-bold text-[#102521] dark:text-white">6.170</div>
            </div>
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#00201C] dark:text-teal-400 uppercase font-semibold">Proyeksi Amlodipine</div>
              <div className="text-base font-bold text-[#00201C] dark:text-teal-300">19.500 tab</div>
            </div>
            <div className="p-2 bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 rounded-xl shadow-2xs">
              <div className="text-[10px] text-[#00201C] dark:text-teal-400 uppercase font-semibold">Rentang Ketidakpastian</div>
              <div className="text-base font-bold text-amber-700 dark:text-amber-400">± 12%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Disclaimer */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 rounded-xl text-xs text-[#60716D] dark:text-slate-400 flex items-start gap-2 shadow-2xs">
        <Info className="w-4 h-4 text-[#00201C] dark:text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#102521] dark:text-white">Prinsip Tata Kelola (Forecast ≠ Target):</strong> Angka proyeksi ini adalah estimasi kapasitas logistik dan
          perencanaan kebutuhan obat Dinas Kesehatan, <strong>BUKAN</strong> target capaian kinerja individu tenaga kesehatan dan
          tidak boleh digunakan sebagai alasan pemotongan anggaran atau penutupan layanan faskes.
        </div>
      </div>

      {/* 6-Month Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {forecast.forecastMonths.map((m, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:border-[#BBE5D4] transition"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#102521] dark:text-white border-b border-[#E8EFEB] dark:border-slate-800 pb-1.5 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00201C] dark:text-teal-400" />
                  {m.monthLabel}
                </span>
                {m.maritimeRiskFactor >= 0.6 ? (
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold flex items-center gap-0.5">
                    <Ship className="w-2.5 h-2.5" /> Ombak Tinggi
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                    <Compass className="w-2.5 h-2.5" /> Laut Tenang
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#60716D] dark:text-slate-400">
                  <span>Sasaran CKG:</span>
                  <span className="font-bold text-[#102521] dark:text-white">{m.screenedProjected}</span>
                </div>
                <div className="flex justify-between text-[#60716D] dark:text-slate-400">
                  <span>Temuan Berisiko:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{m.abnormalRiskProjected}</span>
                </div>
                <div className="flex justify-between text-[#60716D] dark:text-slate-400">
                  <span>Potensi Drop-off:</span>
                  <span className="font-bold text-rose-700 dark:text-rose-400">{m.dropoutEstimated} jiwa</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#E8EFEB] dark:border-slate-800 text-[11px] text-[#60716D] dark:text-slate-400 space-y-1">
              <div className="font-bold text-[#102521] dark:text-white flex items-center gap-1">
                <Pill className="w-3 h-3 text-[#00201C] dark:text-teal-400" /> Kebutuhan Obat:
              </div>
              <div className="text-[10px] text-[#60716D] dark:text-slate-400">
                • Amlodipine: <strong className="text-[#102521] dark:text-white">{m.medicationDemand.amlodipine10mgUnits} tab</strong>
              </div>
              <div className="text-[10px] text-[#60716D] dark:text-slate-400">
                • Metformin: <strong className="text-[#102521] dark:text-white">{m.medicationDemand.metformin500mgUnits} tab</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Insights & Logistics Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102521] dark:text-white border-b border-[#E8EFEB] dark:border-slate-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Faktor Pendorong Risiko & Analisis Musiman (Pulau Taliabu)
          </div>
          <ul className="space-y-2.5 text-xs text-[#60716D] dark:text-slate-300">
            {forecast.keyRiskDrivers.map((driver, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102521] dark:text-white border-b border-[#E8EFEB] dark:border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-[#2E7D5B] dark:text-teal-400" />
            Rekomendasi Strategis Manajemen Logistik & Pelayanan
          </div>
          <ul className="space-y-2.5 text-xs text-[#60716D] dark:text-slate-300">
            {forecast.recommendedStockActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] dark:text-teal-400 mt-1.5 shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Predictive Dropout Risk Classifier Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E5E2] dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8EFEB] dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#102521] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00201C] dark:text-teal-400" />
              Sistem Peringatan Dini Pasien Berisiko Putus Berobat (Dropout Early Warning)
            </h3>
            <p className="text-xs text-[#60716D] dark:text-slate-400 mt-0.5">
              Identifikasi otomatis pasien kronis dengan probabilitas tinggi melewatkan siklus kontrol berdasarkan pola kepatuhan dan hambatan akses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#60716D] dark:text-slate-400 font-medium">Filter Minimal Skor:</span>
            <select
              value={filterMinRisk}
              onChange={(e) => setFilterMinRisk(Number(e.target.value))}
              className="px-2.5 py-1 rounded-xl bg-[#F8FBFA] dark:bg-slate-800 border border-[#D8E5E2] dark:border-slate-700 text-xs text-[#102521] dark:text-white font-semibold cursor-pointer"
            >
              <option value={0}>Semua Pasien Terpantau</option>
              <option value={50}>Risiko Sedang & Tinggi (≥ 50%)</option>
              <option value={70}>Hanya Risiko Tinggi (≥ 70%)</option>
            </select>
          </div>
        </div>

        <div className="border border-[#D8E5E2] dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-[#102521] dark:text-slate-200">
            <thead className="bg-[#F8FBFA] dark:bg-slate-800 text-[#60716D] dark:text-slate-400 text-[11px] uppercase border-b border-[#D8E5E2] dark:border-slate-800 font-bold">
              <tr>
                <th className="py-2.5 px-3">Nama Pasien & Faskes</th>
                <th className="py-2.5 px-3">Tingkat Risiko Prediksi</th>
                <th className="py-2.5 px-3">Faktor Pendorong Terbesar</th>
                <th className="py-2.5 px-3">Tindakan Pencegahan yang Disarankan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EFEB] dark:divide-slate-800 bg-white dark:bg-slate-900">
              {dropoutPredictions.map((dp) => (
                <tr key={dp.citizenId} className="hover:bg-[#F8FBFA] dark:hover:bg-slate-800/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#102521] dark:text-white">{dp.citizenName}</div>
                    <div className="text-[11px] text-[#60716D] dark:text-slate-400 font-mono">{dp.nikMasked}</div>
                    <div className="text-[11px] text-[#00201C] dark:text-teal-300 font-medium">{dp.facilityName} - {dp.desaName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E8EFEB] dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            dp.riskScorePercent >= 70 ? 'bg-rose-600' : 'bg-amber-600'
                          }`}
                          style={{ width: `${dp.riskScorePercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#102521] dark:text-white font-mono">{dp.riskScorePercent}%</span>
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        dp.riskScorePercent >= 70
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {dp.riskScorePercent >= 70 ? 'RISIKO TINGGI DROP-OFF' : 'RISIKO SEDANG'}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs space-y-1">
                    {dp.topPredictiveFactors.map((f, idx) => (
                      <div key={idx} className="text-[11px] text-[#60716D] dark:text-slate-300 flex items-start gap-1">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{f.factor}</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-3 max-w-sm space-y-1">
                    {dp.recommendedPreventiveActions.map((act, idx) => (
                      <div key={idx} className="text-[11px] text-[#00201C] dark:text-teal-300 font-medium flex items-start gap-1">
                        <span className="text-[#2E7D5B] dark:text-teal-400 font-bold">✓</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
