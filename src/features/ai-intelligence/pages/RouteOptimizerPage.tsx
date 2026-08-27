import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Ship,
  Footprints,
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { aiRouteOptimizerService } from '../../../services/aiRouteOptimizerService';
import { AIRouteOptimization } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const RouteOptimizerPage: React.FC = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<AIRouteOptimization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await aiRouteOptimizerService.getOptimizedRoutes();
      setRoutes(data);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecompute = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const updated = await aiRouteOptimizerService.requestRouteOptimization(
        'Nurhaliza (Kader Desa Lede)',
        'Desa Lede & Dusun Pesisir',
        { id: user.id, name: user.name, role: user.roleName || user.roleId }
      );
      setRoutes([updated]);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Menghitung Optimasi Rute Lapangan & Prakiraan Maritim...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4" />
            MARITIME-AWARE ROUTE OPTIMIZER
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Optimasi Rute Maritim & Beban Kerja Kader</h1>
          <p className="text-xs text-gray-600 mt-1">
            Penjadwalan urutan kunjungan rumah cerdas dengan memperhitungkan kondisi gelombang laut, jarak tempuh perahu tempel, dan kegawatan klinis pasien.
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Hitung Ulang Rute Berdasarkan Cuaca Terkini
        </button>
      </div>

      {/* Active Route Plans */}
      {routes.map((route) => (
        <div key={route.id} className="space-y-4">
          {/* Top Route Overview Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-teal-400 font-semibold">{route.desaCoverage}</div>
                <h2 className="text-base font-bold text-white">Rencana Kunjungan Lapangan: {route.kaderName}</h2>
                <div className="text-xs text-slate-400">Tanggal: {route.planDate}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimasi Waktu Total</div>
                  <div className="text-sm font-bold text-teal-400 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {route.totalEstimatedHours} Jam
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-right ${
                    route.seaWaveCondition === 'GELOMBANG_TINGGI_WASPADA'
                      ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                      : route.seaWaveCondition === 'GELOMBANG_SEDANG'
                      ? 'bg-amber-950/50 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Prakiraan Laut BMKG</div>
                  <div className="text-xs font-bold flex items-center justify-end gap-1">
                    <Ship className="w-3.5 h-3.5" />
                    {route.seaWaveCondition.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Advisory */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300">Peringatan Keselamatan Maritim:</strong> {route.safetyAdvisory}
                {route.weatherAlert && <div className="mt-1 text-[11px] text-amber-400/90">{route.weatherAlert}</div>}
              </div>
            </div>
          </div>

          {/* Sequence Waypoint Stepper */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Urutan Kunjungan yang Dioptimalkan (Rekomendasi AI)
            </h3>

            <div className="space-y-3">
              {route.optimizedWaypoints.map((wp) => (
                <div
                  key={wp.order}
                  className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                      #{wp.order}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{wp.citizenName}</span>
                        {wp.isUrgentCase && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                            PRIORITAS TINGGI
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {wp.dusunOrRt}
                      </div>
                      <div className="text-[11px] text-teal-300">
                        <strong>Alasan Kunjungan:</strong> {wp.priorityReason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 border-t md:border-t-0 border-slate-700 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Moda Transportasi</div>
                      <div className="font-semibold text-white flex items-center gap-1 justify-end">
                        {wp.recommendedTransport === 'PERAHU_MOTOR_TEMPEL' ? (
                          <Ship className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {wp.recommendedTransport.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center min-w-[70px]">
                      <div className="text-[10px] text-slate-400">Perjalanan</div>
                      <div className="font-bold text-teal-400 font-mono text-xs">{wp.estimatedTravelMinutes} mnt</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
