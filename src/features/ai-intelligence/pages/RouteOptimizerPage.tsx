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
          <div className="flex items-center gap-2 text-xs text-teal-800 font-bold uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4 text-teal-700" />
            MARITIME-AWARE ROUTE OPTIMIZER
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Optimasi Rute Maritim & Beban Kerja Kader</h1>
          <p className="text-xs text-stone-600 mt-1">
            Penjadwalan urutan kunjungan rumah cerdas dengan memperhitungkan kondisi gelombang laut, jarak tempuh perahu tempel, dan kegawatan klinis pasien.
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Hitung Ulang Rute Berdasarkan Cuaca Terkini
        </button>
      </div>

      {/* Active Route Plans */}
      {routes.map((route) => (
        <div key={route.id} className="space-y-4">
          {/* Top Route Overview Card */}
          <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <div className="text-xs text-teal-800 font-bold">{route.desaCoverage}</div>
                <h2 className="text-base font-bold text-black">Rencana Kunjungan Lapangan: {route.kaderName}</h2>
                <div className="text-xs text-stone-500 font-medium">Tanggal: {route.planDate}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white border border-stone-200 text-right shadow-2xs">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Estimasi Waktu Total</div>
                  <div className="text-sm font-bold text-teal-800 flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {route.totalEstimatedHours} Jam
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-right shadow-2xs ${
                    route.seaWaveCondition === 'GELOMBANG_TINGGI_WASPADA'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : route.seaWaveCondition === 'GELOMBANG_SEDANG'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Prakiraan Laut BMKG</div>
                  <div className="text-xs font-bold flex items-center justify-end gap-1">
                    <Ship className="w-3.5 h-3.5" />
                    {route.seaWaveCondition.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Advisory */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950">Peringatan Keselamatan Maritim:</strong> {route.safetyAdvisory}
                {route.weatherAlert && <div className="mt-1 text-[11px] text-amber-900">{route.weatherAlert}</div>}
              </div>
            </div>
          </div>

          {/* Sequence Waypoint Stepper */}
          <div className="p-5 rounded-2xl bg-[#faf9f6] border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              Urutan Kunjungan yang Dioptimalkan (Rekomendasi AI)
            </h3>

            <div className="space-y-3">
              {route.optimizedWaypoints.map((wp) => (
                <div
                  key={wp.order}
                  className="p-4 rounded-xl bg-white border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-300 transition shadow-2xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      #{wp.order}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-xs">{wp.citizenName}</span>
                        {wp.isUrgentCase && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            PRIORITAS TINGGI
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        {wp.dusunOrRt}
                      </div>
                      <div className="text-[11px] text-teal-800 font-semibold">
                        <strong>Alasan Kunjungan:</strong> {wp.priorityReason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-700 border-t md:border-t-0 border-stone-200 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Moda Transportasi</div>
                      <div className="font-bold text-black flex items-center gap-1 justify-end">
                        {wp.recommendedTransport === 'PERAHU_MOTOR_TEMPEL' ? (
                          <Ship className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          <Footprints className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                        {wp.recommendedTransport.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-center min-w-[70px]">
                      <div className="text-[10px] text-stone-500 uppercase font-semibold">Perjalanan</div>
                      <div className="font-bold text-teal-800 font-mono text-xs">{wp.estimatedTravelMinutes} mnt</div>
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
