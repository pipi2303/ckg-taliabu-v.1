import React, { useState, useEffect } from 'react';
import {
  Layers,
  Filter,
  TrendingDown,
  Clock,
  UserX,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { DocBadge } from '../../../components/common/DocBadge';
import { CompletenessBanner } from '../components/CompletenessBanner';
import { DrilldownModal } from '../components/DrilldownModal';
import {
  populationQualificationService,
  CountyCompletenessSummary,
} from '../../../services/populationQualificationService';
import { populationCascadeService } from '../../../services/populationCascadeService';
import { commandCenterExportService } from '../../../services/commandCenterExportService';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { CascadeAggregation, HealthFacility } from '../../../types';

export const CascadePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [completeness, setCompleteness] = useState<CountyCompletenessSummary | null>(null);
  const [cascade, setCascade] = useState<CascadeAggregation | null>(null);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Drilldown state
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(false);
  const [drilldownTitle, setDrilldownTitle] = useState<string>('');
  const [drilldownDescription, setDrilldownDescription] = useState<string>('');
  const [drilldownItems, setDrilldownItems] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compData, cascadeData, facList] = await Promise.all([
        populationQualificationService.getCountyCompleteness(),
        populationCascadeService.getCascadeAggregation({
          facilityId: selectedFacilityId,
          condition: selectedCondition,
        }),
        facilityRepo.getAll(),
      ]);
      setCompleteness(compData);
      setCascade(cascadeData);
      setFacilities(facList.filter((f) => f.type === 'PUSKESMAS'));
    } catch (err) {
      console.error('Failed to load cascade data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFacilityId, selectedCondition]);

  const handleStageDrilldown = (stage: any) => {
    setDrilldownTitle(`Penelusuran Tahap: ${stage.label}`);
    setDrilldownDescription(`Menampilkan daftar kasus operasional pada tahap kaskade ini.`);
    // Generate representative minimum non-clinical items
    const sampleItems = Array.from({ length: Math.min(15, stage.count || 5) }).map((_, i) => ({
      id: `case-${i + 1}`,
      label: `Warga ID #8208-01-00${i + 1} (Masked)`,
      subLabel: `NIK: 820801******${1000 + i}`,
      facilityName: selectedFacilityId === 'ALL' ? 'Puskesmas Bobong' : 'Puskesmas Terpilih',
      kecamatanName: 'Taliabu Barat',
      villageName: 'Desa Wayo',
      stageOrStatus: stage.label,
      daysStuck: (i % 6) + 2,
    }));
    setDrilldownItems(sampleItems);
    setIsDrilldownOpen(true);
  };

  const handleExportExcel = async () => {
    if (!user) return;
    setIsExportingExcel(true);
    try {
      await commandCenterExportService.exportCommandCenterExcel(user);
      addToast('Data Kaskade & Indikator (.xlsx) berhasil diunduh', 'success');
    } catch (err) {
      console.error('Excel Export error:', err);
      addToast('Gagal menghasilkan file Excel', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoading || !completeness || !cascade) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Tindak Lanjut...</p>
      </div>
    );
  }

  const largestDropStage = cascade.stages.find((s) => s.isLargestDrop);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            CARE CONTINUUM ANALYTICS
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-black tracking-tight">Tindak Lanjut Dinas Kesehatan</h1>
            <DocBadge code="SCR-DNK-B02" size="sm" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Aliran penurunan kasus dari tahap pemeriksaan awal hingga kepatuhan kontrol jangka panjang.
          </p>
        </div>

        {/* Filter Controls & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Seluruh Puskesmas</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Semua Kondisi Kronis</option>
              <option value="HYPERTENSION" className="bg-slate-900">Hipertensi</option>
              <option value="DIABETES" className="bg-slate-900">Diabetes Melitus</option>
              <option value="OBESITY" className="bg-slate-900">Obesitas / Sindrom Metabolik</option>
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600/50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Unduh Analisis Kaskade Format Excel (.xlsx)"
          >
            {isExportingExcel ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>{isExportingExcel ? 'Menyusun...' : 'Ekspor Excel'}</span>
          </button>
        </div>
      </div>

      <CompletenessBanner completeness={completeness} onRefresh={loadData} />

      {/* Main Cascade Visualization */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Funnel Tindak Lanjut CKG</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap baris menampilkan jumlah absolut, persentase terhadap skrining awal, dan tingkat penyusutan (drop-off).
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Cutoff: {cascade.dataCutoffAt.slice(0, 10)}</span>
        </div>

        {/* Cascade Rows */}
        <div className="space-y-4">
          {cascade.stages.map((stage, idx) => {
            const isFirst = idx === 0;
            const isOutcome = stage.code === 'CONTROLLED';

            return (
              <div
                key={stage.stageId}
                className={`p-4 rounded-xl border transition-all ${
                  stage.isLargestDrop
                    ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500'
                    : isOutcome
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 font-mono w-5">0{idx + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{stage.label}</span>
                        {stage.isLargestDrop && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 uppercase tracking-wider">
                            <TrendingDown className="w-3 h-3" />
                            Titik Penyusutan Terbesar
                          </span>
                        )}
                        {isOutcome && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Lock OI-08
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end md:self-center">
                    {/* Absolute count */}
                    <div className="text-right">
                      <div className="text-lg font-black text-white tracking-tight">
                        {isOutcome ? '—' : stage.count.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isOutcome ? 'Belum dinilai' : `${stage.percentage}% dari total skrining`}
                      </div>
                    </div>

                    {/* Drop-off / Shrinkage metrics */}
                    {!isFirst && !isOutcome && (
                      <div className="text-right pl-4 border-l border-slate-800">
                        <div
                          className={`text-xs font-bold ${
                            stage.isLargestDrop ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          - {stage.shrinkageCount?.toLocaleString('id-ID')} kasus
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ({stage.shrinkagePercentage}% drop)
                        </div>
                      </div>
                    )}

                    {/* Drilldown button */}
                    {user?.roleId !== 'BUPATI' && !isOutcome && (
                      <button
                        onClick={() => handleStageDrilldown(stage)}
                        title="Telusuri Kasus Tahap Ini"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 transition"
                      >
                        <FileSearch className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!isOutcome && (
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stage.isLargestDrop
                          ? 'bg-rose-500'
                          : idx >= 4
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(4, stage.percentage || 0)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Partitions: Awaiting Confirmation, Exits, and Quality Signal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Awaiting Confirmation */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-stone-900 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-800" />
            Menunggu Konfirmasi Klinis
          </div>
          <div className="text-3xl font-black text-black">
            {cascade.awaitingConfirmationCount}{' '}
            <span className="text-xs font-normal text-stone-800">warga</span>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed">
            Warga yang telah hadir di faskes namun hasil diagnosa atau input resume medisnya masih dalam proses konfirmasi oleh tim dokter penanggung jawab.
          </p>
        </div>

        {/* Exits / Terminal Stages */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
            <UserX className="w-4 h-4" />
            Kasus Keluar Jalur Kaskade (Exits)
          </div>
          <div className="text-3xl font-black text-white">
            {cascade.exits.totalExits}{' '}
            <span className="text-xs font-normal text-slate-400">kasus keluar</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <div className="p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Putus Kontak (LTFU):</span>{' '}
              <strong className="text-white">{cascade.exits.lostToFollowUp}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Menolak Layanan:</span>{' '}
              <strong className="text-white">{cascade.exits.refused}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Pindah Domisili:</span>{' '}
              <strong className="text-white">{cascade.exits.moved}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Meninggal Dunia:</span>{' '}
              <strong className="text-white">{cascade.exits.deceased}</strong>
            </div>
          </div>
        </div>

        {/* Quality Signal: Manual Task Closure */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Sinyal Penutupan Manual Tugas
          </div>
          <div className="text-3xl font-black text-white">
            {cascade.manualTaskClosureRatio}%{' '}
            <span className="text-xs font-normal text-slate-400">
              ({cascade.manualTaskClosureCount} tugas ditutup manual)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Proporsi tugas tindak lanjut yang ditutup tanpa encounter data langsung. Angka di atas 25% menjadi sinyal supervisi kualitas pencatatan faskes.
          </p>
        </div>
      </div>

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
