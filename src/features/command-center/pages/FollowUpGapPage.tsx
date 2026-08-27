import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  Filter,
  Clock,
  Building2,
  MapPin,
  FileSearch,
  CheckCircle2,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { SendAttentionModal } from '../components/SendAttentionModal';
import { DrilldownModal } from '../components/DrilldownModal';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationGapService } from '../../../services/populationGapService';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { PopulationGapItem, HealthFacility, PopulationAttentionSignal } from '../../../types';

export const FollowUpGapPage: React.FC = () => {
  const { user } = useAuth();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [gapItems, setGapItems] = useState<PopulationGapItem[]>([]);
  const [signals, setSignals] = useState<PopulationAttentionSignal[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP'>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Send Attention Modal
  const [isAttentionOpen, setIsAttentionOpen] = useState<boolean>(false);
  const [attentionFacilityId, setAttentionFacilityId] = useState<string>('');
  const [attentionGapType, setAttentionGapType] = useState<'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP' | 'FOLLOW_UP_DELAY'>('CITIZEN_ACCESS_GAP');
  const [attentionCount, setAttentionCount] = useState<number>(5);

  // Drilldown Modal
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(false);
  const [drilldownTitle, setDrilldownTitle] = useState<string>('');
  const [drilldownDescription, setDrilldownDescription] = useState<string>('');
  const [drilldownItems, setDrilldownItems] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, items, sigList, facList] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        populationGapService.getGapItems({
          facilityId: selectedFacilityId,
          gapCategory: selectedCategory,
          cascadeStage: selectedStage,
        }),
        populationGapService.getAllAttentionSignals(),
        facilityRepo.getAll(),
      ]);
      setCompleteness(compData);
      setGapItems(items);
      setSignals(sigList);
      setFacilities(facList.filter((f) => f.type === 'PUSKESMAS'));
    } catch (err) {
      console.error('Failed to load gap items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFacilityId, selectedCategory, selectedStage]);

  const openSendAttention = (facilityId: string, gapType: 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP', count: number) => {
    setAttentionFacilityId(facilityId);
    setAttentionGapType(gapType);
    setAttentionCount(count);
    setIsAttentionOpen(true);
  };

  const handleDrilldown = () => {
    setDrilldownTitle(`Penelusuran Kasus Tertahan`);
    setDrilldownDescription(`Menampilkan rincian kasus operasional yang tertahan pada kaskade.`);
    const items = gapItems.map((g) => ({
      id: g.id,
      label: g.citizenName || `Warga ID #${g.citizenId}`,
      subLabel: `NIK: ${g.citizenNik}`,
      facilityName: g.facilityName,
      kecamatanName: g.kecamatanName,
      villageName: g.villageName,
      stageOrStatus: g.cascadeStage,
      daysStuck: g.daysStuck,
    }));
    setDrilldownItems(items);
    setIsDrilldownOpen(true);
  };

  const capacityCount = gapItems.filter((i) => i.gapCategory === 'CAPACITY_GAP').length;
  const accessCount = gapItems.filter((i) => i.gapCategory === 'CITIZEN_ACCESS_GAP').length;

  if (isLoading || !completeness) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Analisis Disparitas Tindak Lanjut...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            OPERATIONAL BOTTLENECK TRIAGE
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Disparitas Tindak Lanjut Klinis</h1>
            <DocBadge code="SCR-DNK-B06" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Klasifikasi kasus tertahan berdasarkan Hambatan Akses Warga vs Kapasitas Faskes dengan fitur supervisi sinyal Dinkes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Puskesmas</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Kategori Hambatan</option>
              <option value="CITIZEN_ACCESS_GAP" className="bg-slate-900">Hambatan Akses Warga</option>
              <option value="CAPACITY_GAP" className="bg-slate-900">Kapasitas Faskes</option>
            </select>
          </div>
        </div>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Citizen Access Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hambatan Akses & Geografis Warga</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kendala jarak laut, kontak tak terhubung, atau jadwal melaut/kebun
                </p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">{accessCount}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Warga telah berhasil diidentifikasi berisiko namun belum berhasil hadir ke Puskesmas karena keterbatasan logistik warga atau belum terhubungnya komunikasi.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Intervensi: Transportasi perahu & outreach kader</span>
            <button
              onClick={() => openSendAttention('faskes-1', 'CITIZEN_ACCESS_GAP', accessCount)}
              className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Teruskan Perhatian</span>
            </button>
          </div>
        </div>

        {/* Capacity Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Kapasitas Layanan & Logistik Faskes</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kekosongan stok obat, antrean kuota lab penuh, atau jadwal dokter
                </p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-rose-400">{capacityCount}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Warga siap melakukan kontrol namun faskes atau Pustu mengalami hambatan ketersediaan obat kronis, alat reagen laboratorium, atau jadwal dokter.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Intervensi: Pengiriman buffer stok & supervisi kuota</span>
            <button
              onClick={() => openSendAttention('faskes-4', 'CAPACITY_GAP', capacityCount)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Teruskan Perhatian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Attention Signals from Dinkes */}
      {signals.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
              <Send className="w-4 h-4" />
              Sinyal Perhatian Dinkes Aktif ({signals.length})
            </div>
            <span className="text-xs text-slate-400">Telah diteruskan ke faskes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signals.map((sig) => (
              <div key={sig.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sig.targetFacilityName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sig.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {sig.status === 'ACKNOWLEDGED' ? 'Dikonfirmasi Faskes' : 'Terkirim (Menunggu Respon)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{sig.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>Oleh: {sig.createdByUserName}</span>
                  <span>{new Date(sig.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Table with Governed Drilldown */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Daftar Kluster Kasus Tertahan ({gapItems.length} Kasus)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan kasus berisiko yang tertahan lebih dari standar waktu operasional.
            </p>
          </div>

          {user?.roleId !== 'BUPATI' && (
            <button
              onClick={handleDrilldown}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Buka Penelusuran Detail</span>
            </button>
          )}
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fasilitas / Wilayah</th>
                <th className="py-2.5 px-3">Tahap Kaskade</th>
                <th className="py-2.5 px-3">Kategori Hambatan</th>
                <th className="py-2.5 px-3">Hambatan Utama Terlaporkan</th>
                <th className="py-2.5 px-3 text-right">Lama Tertahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {gapItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{item.facilityName}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.kecamatanName} • {item.villageName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {item.cascadeStage}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.gapCategory === 'CAPACITY_GAP'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.gapCategory === 'CAPACITY_GAP' ? 'Kapasitas & Logistik' : 'Akses Warga'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">{item.primaryBarrier}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-bold ${
                        item.daysStuck > 7 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {item.daysStuck} hari
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Attention Modal */}
      <SendAttentionModal
        isOpen={isAttentionOpen}
        onClose={() => setIsAttentionOpen(false)}
        facilities={facilities}
        currentUser={user}
        defaultFacilityId={attentionFacilityId}
        defaultGapType={attentionGapType}
        defaultCount={attentionCount}
        onSuccess={loadData}
      />

      {/* Governed Drilldown Modal */}
      <DrilldownModal
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        title={drilldownTitle}
        contextDescription={drilldownDescription}
        currentUser={user}
        items={drilldownItems}
      />
    </div>
  );
};
