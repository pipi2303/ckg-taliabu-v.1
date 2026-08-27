import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import { regionalPtmForecastService } from '../../../services/regionalPtmForecastService';
import { RegionalPtmForecast } from '../../../types';

const TREND_STYLE: Record<string, { icon: React.ReactNode; className: string }> = {
  NAIK: { icon: <TrendingUp className="w-3 h-3" />, className: 'bg-rose-950/80 text-rose-300 border-rose-800' },
  STABIL: { icon: <Minus className="w-3 h-3" />, className: 'bg-slate-800 text-slate-300 border-slate-700' },
  TURUN: { icon: <TrendingDown className="w-3 h-3" />, className: 'bg-emerald-950/80 text-emerald-300 border-emerald-700' },
};

export const RegionalPtmForecastPage: React.FC = () => {
  const [forecasts, setForecasts] = useState<RegionalPtmForecast[]>([]);
  const [priorityRegions, setPriorityRegions] = useState<RegionalPtmForecast[]>([]);

  useEffect(() => {
    setForecasts(regionalPtmForecastService.getAllForecasts());
    setPriorityRegions(regionalPtmForecastService.getPriorityRegions(3));
  }, []);

  if (!forecasts.length) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Simulation banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-2 text-xs text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold uppercase tracking-wider text-amber-300">DATA SIMULASI PREDIKTIF:</strong> Proyeksi tren PTM per kecamatan, terurai per diagnosis (hipertensi/diabetes) — melengkapi proyeksi agregat kabupaten pada Proyeksi Beban &amp; Obat.
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          ANALISIS PREDIKTIF TREN PTM WILAYAH
        </div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Advanced AI Assistant — Tren PTM per Kecamatan</h1>
        <p className="text-xs text-gray-600 mt-1">
          Proyeksi 4 bulan ke depan beban hipertensi &amp; diabetes per kecamatan, membedakan wilayah pesisir/terluar (akses maritim terbatas) dari wilayah dengan kontinuitas kontrol terjaga.
        </p>
      </div>

      {/* Priority regions */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Wilayah Prioritas — Proyeksi Kenaikan Beban PTM Tertinggi
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {priorityRegions.map((r) => {
            const increase = regionalPtmForecastService.getProjectedIncrease(r);
            const lastMonth = r.months[r.months.length - 1];
            return (
              <div key={r.id} className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" /> {r.kecamatanName}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${TREND_STYLE[lastMonth.trend].className}`}>
                    {TREND_STYLE[lastMonth.trend].icon} {lastMonth.trend}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Total proyeksi kasus PTM {increase >= 0 ? 'naik' : 'turun'}{' '}
                  <strong className={increase >= 0 ? 'text-rose-300' : 'text-emerald-300'}>{Math.abs(increase)}</strong> kasus
                  hingga {lastMonth.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-kecamatan trend table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Proyeksi Bulanan per Kecamatan — Hipertensi vs. Diabetes</h3>
        <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Kecamatan</th>
                {forecasts[0].months.map((m) => (
                  <th key={m.month} className="py-2.5 px-3 whitespace-nowrap">{m.month}</th>
                ))}
                <th className="py-2.5 px-3">Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {forecasts.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{f.kecamatanName}</td>
                  {f.months.map((m) => (
                    <td key={m.month} className="py-3 px-3 whitespace-nowrap">
                      <div className="text-teal-300">HT: {m.hipertensiProjected}</div>
                      <div className="text-amber-300">DM: {m.diabetesProjected}</div>
                    </td>
                  ))}
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 w-fit ${TREND_STYLE[f.months[f.months.length - 1].trend].className}`}>
                      {TREND_STYLE[f.months[f.months.length - 1].trend].icon} {f.months[f.months.length - 1].trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk drivers per region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forecasts.map((f) => (
          <div key={f.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> {f.kecamatanName}
            </div>
            <ul className="space-y-1.5">
              {f.topRiskDrivers.map((driver, idx) => (
                <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
