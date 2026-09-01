import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Play,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ClinicalRiskCategory,
  HealthFacility,
  PriorityWeightVersion,
  RiskClassification,
} from '../../types';
import { classificationRepo } from '../../repositories/classificationRepo';
import { facilityRepo } from '../../repositories/facilityRepo';
import { priorityWeightRepo } from '../../repositories/priorityWeightRepo';
import { ClinicalRiskBadge } from '../../components/common/ClinicalRiskBadge';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { StratificationDetailModal } from './components/StratificationDetailModal';
import { BatchExecutionModal } from './components/BatchExecutionModal';
import { PriorityWeightModal } from './components/PriorityWeightModal';
import { ClinicianOverrideModal } from './components/ClinicianOverrideModal';
import { DocBadge } from '../../components/common/DocBadge';
import { CRS_CKG_V0_9, CRS_OPEN_ISSUES } from '../classification/rules/crsPackageV0_9';

export const StratificationRegistryView: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { addToast } = useToast();

  const [classifications, setClassifications] = useState<RiskClassification[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [activeWeights, setActiveWeights] = useState<PriorityWeightVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [minPriorityScore, setMinPriorityScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'TRIAGE' | 'OPEN_ISSUES' | 'RULES_EXPLORER'>('TRIAGE');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classList, facList, weights] = await Promise.all([
        classificationRepo.getAll(),
        facilityRepo.getAll(),
        priorityWeightRepo.getActive(),
      ]);
      setClassifications(classList);
      setFacilities(facList);
      setActiveWeights(weights);
    } catch (err) {
      console.error('Failed to load risk registry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  const filteredClassifications = classifications.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.citizenName.toLowerCase().includes(q);
      const matchNik = c.citizenNik?.toLowerCase().includes(q);
      const matchVillage = c.villageName.toLowerCase().includes(q);
      if (!matchName && !matchNik && !matchVillage) return false;
    }

    if (selectedCategory !== 'ALL' && c.finalCategory !== selectedCategory) {
      return false;
    }

    if (selectedFacility !== 'ALL' && c.facilityId !== selectedFacility) {
      return false;
    }

    if (selectedStage !== 'ALL' && c.classificationStage !== selectedStage) {
      return false;
    }

    if (criticalOnly && !c.isCritical) {
      return false;
    }

    if (c.priorityScore < minPriorityScore) {
      return false;
    }

    return true;
  });

  // Open detail modal
  const handleViewDetail = (item: RiskClassification) => {
    openModal({
      title: 'Jejak Keputusan Stratifikasi Risiko & Rekomendasi Tindakan',
      subtitle: `${item.citizenName} • ${item.villageName} • ${item.facilityName}`,
      size: 'lg',
      content: ({ closeModal }) => (
        <StratificationDetailModal
          classification={item}
          closeModal={closeModal}
          onRefresh={loadData}
        />
      ),
    });
  };

  // Open batch modal
  const handleOpenBatch = () => {
    openModal({
      title: 'Jalankan Stratifikasi Risiko Massal (Batch)',
      subtitle: `Engine: ${CRS_CKG_V0_9.version} • Status Append-Only`,
      size: 'md',
      content: ({ closeModal }) => (
        <BatchExecutionModal
          facilities={facilities}
          closeModal={closeModal}
          onSuccess={() => {
            loadData();
          }}
        />
      ),
    });
  };

  // Open weights modal
  const handleOpenWeights = () => {
    if (!activeWeights) return;
    openModal({
      title: 'Konfigurasi Bobot Skor Prioritas Operasional',
      subtitle: `Versi Aktif: ${activeWeights.version}`,
      size: 'md',
      content: ({ closeModal }) => (
        <PriorityWeightModal
          currentWeights={activeWeights}
          closeModal={closeModal}
          onSuccess={() => {
            loadData();
          }}
        />
      ),
    });
  };

  const isNakes =
    currentUser?.roleId === 'DOCTOR' ||
    currentUser?.roleId === 'NURSE_MIDWIFE' ||
    currentUser?.roleId === 'ADMIN_DINKES';

  return (
    <div className="space-y-6">
      {/* Top Banner: Simulation Notice & Active Rule Package */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Activity className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Engine Stratifikasi Risiko & Next-Best-Action CKG
              </h3>
              <DocBadge code="SCR-PKM-C03" size="xs" />
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-mono text-[10px] font-bold rounded">
                CRS v0.9 (Simulasi)
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Klasifikasi klinis 5 domain berbasis aturan deterministik, skor prioritas operasional, dan rekomendasi tindakan cerdas untuk faskes Kabupaten Pulau Taliabu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenWeights}
            className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100/50"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" />
            Bobot Prioritas ({activeWeights?.version || 'v1.0'})
          </Button>

          {isNakes && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenBatch}
              className="text-xs bg-[#00201C] hover:bg-[#102521] text-white"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
              Jalankan Batch
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8E5E2] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('TRIAGE')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TRIAGE'
              ? 'bg-[#00201C] text-white shadow-2xs'
              : 'text-[#60716D] hover:text-black hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Daftar Stratifikasi & Triage ({filteredClassifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OPEN_ISSUES')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'OPEN_ISSUES'
              ? 'bg-[#00201C] text-white shadow-2xs'
              : 'text-[#60716D] hover:text-black hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Open Issues / Aturan Tertunda ({CRS_OPEN_ISSUES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RULES_EXPLORER')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'RULES_EXPLORER'
              ? 'bg-[#00201C] text-white shadow-2xs'
              : 'text-[#60716D] hover:text-black hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2E7D5B]" />
          <span>Katalog Aturan Klinis (CRS v0.9)</span>
        </button>
      </div>

      {activeTab === 'TRIAGE' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white border border-[#D8E5E2] rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#60716D]" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau desa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] outline-hidden"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] outline-hidden"
              >
                <option value="ALL">Semua Kategori Risiko</option>
                <option value="DARK_RED">MERAH TUA — Tinggi / Krisis</option>
                <option value="RED">MERAH — Penyakit (FPKTP)</option>
                <option value="ORANGE">ORANYE — Pre-Penyakit</option>
                <option value="YELLOW">KUNING — Faktor Risiko</option>
                <option value="GREEN">HIJAU — Normal / Sehat</option>
                <option value="UNDETERMINED">BELUM DITENTUKAN — Data Kurang</option>
              </select>

              {/* Stage Filter */}
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] outline-hidden"
              >
                <option value="ALL">Semua Tahapan Klasifikasi</option>
                <option value="CONFIRMED">Terkonfirmasi (Definitif)</option>
                <option value="SCREENING">Menunggu Konfirmasi Ulang</option>
              </select>

              {/* Facility Filter */}
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-black focus:ring-2 focus:ring-[#00201C] outline-hidden"
              >
                <option value="ALL">Semua Fasilitas Kesehatan</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Filters: Critical Only & Min Score */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D8E5E2] text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-black">
                  <input
                    type="checkbox"
                    checked={criticalOnly}
                    onChange={(e) => setCriticalOnly(e.target.checked)}
                    className="rounded border-[#D8E5E2] text-[#78161B] focus:ring-[#78161B]"
                  />
                  <span className="flex items-center gap-1 text-[#78161B]">
                    <Flame className="w-3.5 h-3.5" />
                    Hanya Temuan Kritis (Emergency Boost)
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#60716D] font-medium">Skor Prioritas Min:</span>
                <span className="font-mono font-bold text-black min-w-[24px]">
                  {minPriorityScore}
                </span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={minPriorityScore}
                  onChange={(e) => setMinPriorityScore(parseInt(e.target.value))}
                  className="w-28 accent-[#00201C]"
                />
              </div>
            </div>
          </div>

          {/* Classification Table */}
          <div className="bg-white border border-[#D8E5E2] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[#60716D] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Warga / NIK</th>
                    <th className="px-4 py-3">Kategori Risiko</th>
                    <th className="px-4 py-3">Kluster Multimorbiditas</th>
                    <th className="px-4 py-3 text-center">Skor Prioritas</th>
                    <th className="px-4 py-3">Faskes / Skrining</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E5E2]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#60716D]">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2E7D5B]" />
                        Memuat data stratifikasi risiko...
                      </td>
                    </tr>
                  ) : filteredClassifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#60716D]">
                        <HelpCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="font-semibold text-black">Tidak ada data stratifikasi risiko yang cocok.</p>
                        <p className="text-[11px] mt-0.5">Coba sesuaikan filter pencarian Anda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClassifications.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F8FBFA] transition-colors cursor-pointer ${
                          item.isCritical ? 'bg-red-50/30' : ''
                        }`}
                        onClick={() => handleViewDetail(item)}
                      >
                        {/* Citizen */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-black flex items-center gap-1.5">
                            {item.citizenName}
                            {item.isCritical && (
                              <span className="px-1.5 py-0.2 bg-[#78161B] text-white font-bold rounded text-[9px] uppercase tracking-wider animate-pulse">
                                KRITIS
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[#60716D] mt-0.5">
                            {item.citizenNik || item.citizenId} • Desa {item.villageName}
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="px-4 py-3">
                          <ClinicalRiskBadge
                            category={item.finalCategory}
                            stage={item.classificationStage}
                            isCritical={item.isCritical}
                            size="sm"
                            showStage
                          />
                          {item.overriddenByUserName && (
                            <span className="block text-[10px] text-amber-800 font-semibold mt-1">
                              * Override Nakes
                            </span>
                          )}
                        </td>

                        {/* Cluster */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-black block">
                            {item.clusterLabel || '—'}
                          </span>
                          {item.clusterCode && (
                            <span className="text-[10px] font-mono text-[#2E7D5B]">
                              {item.clusterCode}
                            </span>
                          )}
                        </td>

                        {/* Priority Score */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-black">
                              {item.priorityScore}
                            </span>
                            <div className="w-12 h-1.5 bg-[#D8E5E2] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  item.priorityScore >= 80
                                    ? 'bg-[#78161B]'
                                    : item.priorityScore >= 60
                                    ? 'bg-[#C22A2A]'
                                    : item.priorityScore >= 40
                                    ? 'bg-[#DD6B12]'
                                    : 'bg-[#2E7D5B]'
                                }`}
                                style={{ width: `${item.priorityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Facility & Screening Date */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-black">{item.facilityName}</div>
                          <div className="text-[11px] text-[#60716D] mt-0.5">
                            {item.screeningDate
                              ? new Date(item.screeningDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(item);
                            }}
                            className="text-[#2E7D5B] hover:text-black"
                          >
                            Jejak Keputusan
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Open Issues */}
      {activeTab === 'OPEN_ISSUES' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFACD] border border-amber-300 rounded-2xl text-xs text-black">
            <h4 className="font-bold text-amber-900 text-sm">
              Daftar Isu Terbuka (Open Issues) CRS-CKG v0.9
            </h4>
            <p className="text-amber-800 mt-1">
              Seluruh domain atau aturan yang ditandai sebagai Open Issue <strong>tidak menghasilkan klasifikasi risiko otomatis</strong> dan tidak menggunakan ambang substitusi yang tidak terverifikasi.
            </p>
          </div>

          <div className="space-y-3">
            {CRS_OPEN_ISSUES.map((issue) => (
              <div
                key={issue.code}
                className="p-4 bg-white border border-[#D8E5E2] rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-600 text-white rounded">
                      {issue.code}
                    </span>
                    <span className="font-bold text-sm text-black">{issue.title}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold">
                    Domain: {issue.domain}
                  </span>
                </div>

                <p className="text-xs text-[#334643] leading-relaxed">{issue.description}</p>

                <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-between text-[11px] text-[#60716D]">
                  <span>Aturan Terdampak: <strong className="text-black">{(issue.affectedRules || []).join(', ')}</strong></span>
                  <span className="font-semibold text-amber-900">Status: {issue.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Rules Catalog */}
      {activeTab === 'RULES_EXPLORER' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#F8FBFA] border border-[#D8E5E2] rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-black text-sm">
                Katalog Aturan Klinis ({CRS_CKG_V0_9.version})
              </h4>
              <span className="px-2.5 py-0.5 bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30 rounded text-xs font-bold">
                {CRS_CKG_V0_9.rules.length} Aturan Terdefinisi
              </span>
            </div>
            <p className="text-[#60716D]">
              Status Paket: <strong className="text-black">{CRS_CKG_V0_9.status}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {CRS_CKG_V0_9.rules.map((rule) => (
              <div
                key={rule.ruleCode}
                className="p-4 bg-white border border-[#D8E5E2] rounded-2xl space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#00201C] text-white rounded">
                      {rule.ruleCode}
                    </span>
                    <span className="font-bold text-xs text-black">{rule.name}</span>
                  </div>
                  <div>
                    {rule.resultingCategory ? (
                      <ClinicalRiskBadge category={rule.resultingCategory} size="xs" />
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Open Rule
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#60716D]">{rule.description}</p>

                {rule.nextActions && rule.nextActions.length > 0 && (
                  <div className="pt-2 border-t border-[#D8E5E2] text-xs space-y-1">
                    <span className="font-bold text-[11px] text-black uppercase block">
                      Aksi Terkait:
                    </span>
                    {rule.nextActions.map((act, i) => (
                      <p key={i} className="text-[11px] text-[#334643]">
                        • {act.actionText} (<strong className="text-black">{act.suggestedRole}</strong>)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
