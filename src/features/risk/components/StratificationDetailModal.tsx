import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  FileCheck,
  FileText,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { RiskClassification } from '../../../types';
import { ClinicalRiskBadge } from '../../../components/common/ClinicalRiskBadge';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { ClinicianOverrideModal } from './ClinicianOverrideModal';

interface StratificationDetailModalProps {
  classification: RiskClassification;
  closeModal: () => void;
  onRefresh?: () => void;
}

export const StratificationDetailModal: React.FC<StratificationDetailModalProps> = ({
  classification,
  closeModal,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [viewMode, setViewMode] = useState<'PLAIN' | 'TECHNICAL'>('PLAIN');
  const [showPriorityDetails, setShowPriorityDetails] = useState(false);

  const canOverride =
    currentUser?.roleId === 'DOCTOR' ||
    currentUser?.roleId === 'PJ_CKG' ||
    currentUser?.roleId === 'ADMIN_DINKES';

  const handleOpenOverride = () => {
    openModal({
      title: 'Override Klasifikasi Klinis',
      subtitle: `Warga: ${classification.citizenName} • ID: ${classification.citizenId}`,
      size: 'md',
      content: ({ closeModal: closeOverride }) => (
        <ClinicianOverrideModal
          classification={classification}
          closeModal={closeOverride}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            closeModal();
          }}
        />
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="p-3 bg-[#FFFACD] border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-black">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">MODE SIMULASI KLINIS ({classification.ruleVersion})</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            CRS v0.9 belum disetujui untuk penggunaan klinis produksi. Seluruh hasil stratifikasi bersifat simulasi deterministik.
          </p>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="p-4 bg-[#F8FBFA] border border-[#D8E5E2] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8E5E2]">
          <div>
            <span className="text-[10px] font-bold text-[#60716D] uppercase block">
              Hasil Klasifikasi Sistem
            </span>
            <div className="flex items-center gap-2 mt-1">
              <ClinicalRiskBadge
                category={classification.finalCategory}
                stage={classification.classificationStage}
                isCritical={classification.isCritical}
                size="md"
                showStage
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D8E5E2] text-xs font-semibold">
            <button
              onClick={() => setViewMode('PLAIN')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'PLAIN'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] hover:text-black'
              }`}
            >
              Penjelasan Ringkas
            </button>
            <button
              onClick={() => setViewMode('TECHNICAL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TECHNICAL'
                  ? 'bg-[#00201C] text-white shadow-2xs'
                  : 'text-[#60716D] hover:text-black'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Audit Teknis (CRS)
            </button>
          </div>
        </div>

        {/* Operational Priority Score & Cluster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-[#D8E5E2] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#60716D] uppercase block">
                Skor Prioritas Operasional
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-mono font-bold text-black">
                  {classification.priorityScore}
                </span>
                <span className="text-xs text-[#60716D]">/ 100</span>
              </div>
              <p className="text-[10px] text-[#60716D] mt-0.5">Bukan skor keparahan klinis</p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowPriorityDetails(!showPriorityDetails)}
              className="text-[11px]"
            >
              <Calculator className="w-3 h-3 mr-1" />
              {showPriorityDetails ? 'Sembunyikan' : 'Lihat Perhitungan'}
            </Button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#D8E5E2]">
            <span className="text-[10px] font-bold text-[#60716D] uppercase block">
              Kluster Multimorbiditas
            </span>
            <p className="text-xs font-bold text-black mt-1">
              {classification.clusterLabel || 'Faktor Risiko Tunggal / Tidak Ada'}
            </p>
            {classification.clusterCode && (
              <span className="text-[10px] font-mono text-[#2E7D5B] block mt-0.5">
                Kode: {classification.clusterCode}
              </span>
            )}
          </div>
        </div>

        {/* Priority Score Breakdown (Expandable) */}
        {showPriorityDetails && (
          <div className="p-3.5 bg-[#E1F5FE]/40 border border-[#BDE3F5] rounded-xl text-xs space-y-2 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between font-bold text-black pb-1.5 border-b border-[#BDE3F5]">
              <span>Rincian Komponen Skor Prioritas</span>
              <span>Total: {classification.priorityScore} Poin</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-[#BDE3F5]">
                <span className="text-[#60716D] block">Kategori Risiko:</span>
                <span className="font-mono font-bold text-black">
                  +{classification.priorityComponents.riskCategory} poin
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#BDE3F5]">
                <span className="text-[#60716D] block">Faktor Penyerta:</span>
                <span className="font-mono font-bold text-black">
                  +{classification.priorityComponents.accompanyingFactors} poin
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#BDE3F5]">
                <span className="text-[#60716D] block">Lama Sejak Temuan:</span>
                <span className="font-mono font-bold text-black">
                  +{classification.priorityComponents.daysSinceFinding} poin
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#BDE3F5]">
                <span className="text-[#60716D] block">Kunjungan Terlewat:</span>
                <span className="font-mono font-bold text-black">
                  +{classification.priorityComponents.missedVisits} poin
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#BDE3F5]">
                <span className="text-[#60716D] block">Status Temuan Kritis:</span>
                <span className="font-mono font-bold text-black">
                  +{classification.priorityComponents.criticalFinding} poin
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#60716D] pt-1">
              * Skoring berbasis bobot konfigurasi aktif Dinkes Pulau Taliabu untuk urutan atensi operasional faskes.
            </p>
          </div>
        )}

        {/* Override History Callout if present */}
        {classification.overriddenByUserName && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Keputusan Override Tenaga Kesehatan</span>
            </div>
            <p className="text-[11px] text-amber-950">
              Ditetapkan oleh: <span className="font-semibold">{classification.overriddenByUserName}</span> ({classification.overrideRole})
            </p>
            <p className="text-[11px] text-amber-900 italic">
              "Alasan: {classification.overrideReason}"
            </p>
            {classification.overridePreviousCategory && (
              <p className="text-[10px] text-amber-800">
                Kategori Sistem Asli: <span className="font-bold">{classification.overridePreviousCategory}</span> → Disesuaikan menjadi <span className="font-bold">{classification.finalCategory}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Domain Breakdown Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2E7D5B]" />
          Evaluasi 5 Domain Klinis (CRS-CKG)
        </h4>

        <div className="space-y-2.5">
          {classification.domainResults.map((dom) => (
            <div
              key={dom.domain}
              className={`p-3.5 rounded-xl border transition-all ${
                dom.status === 'NOT_EVALUATED_OPEN_RULE'
                  ? 'bg-slate-50 border-slate-300'
                  : dom.status === 'AWAITING_CONFIRMATION'
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-white border-[#D8E5E2]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#D8E5E2]/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#00201C] text-white rounded">
                    {dom.domain}
                  </span>
                  <span className="text-xs font-bold text-black">{dom.domainName}</span>
                </div>

                <div>
                  {dom.category ? (
                    <ClinicalRiskBadge category={dom.category} size="xs" />
                  ) : dom.status === 'NOT_EVALUATED_OPEN_RULE' ? (
                    <Badge variant="neutral" size="sm">
                      Open Rule ({dom.openIssueCode})
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Data Belum Lengkap
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 text-xs space-y-1.5">
                <p className="text-black leading-relaxed">{dom.reason || 'Tidak ada catatan.'}</p>

                {viewMode === 'TECHNICAL' && (
                  <div className="p-2 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-[11px] font-mono text-[#60716D] space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Aturan CRS:</span>
                      <span className="font-bold text-black">{dom.ruleCode || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nilai Input:</span>
                      <span className="text-black">{JSON.stringify(dom.inputValues)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Evaluasi:</span>
                      <span className="font-semibold text-[#2E7D5B]">{dom.status}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next-Best-Action Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
            Rekomendasi Tindakan Berikutnya (Next-Best-Action)
          </h4>
          <span className="text-[10px] text-[#60716D] italic">
            Berdasarkan Aturan CRS-CKG
          </span>
        </div>

        <div className="p-3 bg-[#E1F5FE]/40 border border-[#BDE3F5] rounded-xl text-[11px] text-black">
          <p className="font-semibold">Perhatian Alur Kerja:</p>
          <p className="text-[#334643] mt-0.5">
            Rekomendasi tindakan belum menjadi penugasan. Alur penugasan (Care Task), batas waktu final, dan kontak warga akan dibentuk pada modul Care Orchestration.
          </p>
        </div>

        <div className="space-y-2">
          {classification.nextBestActions.length === 0 ? (
            <div className="p-4 bg-white border border-[#D8E5E2] rounded-xl text-center text-xs text-[#60716D]">
              Belum ada rekomendasi tindakan yang dapat dibentuk untuk kondisi saat ini.
            </div>
          ) : (
            classification.nextBestActions.map((nba, idx) => (
              <div
                key={nba.id || idx}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  nba.status === 'BLOCKED_OPEN_RULE'
                    ? 'bg-slate-50 border-slate-300 opacity-80'
                    : nba.status === 'AWAITING_CONFIRMATION'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-[#D8E5E2]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#00201C] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-black">{nba.actionType}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded text-[#60716D]">
                      {nba.sourceRuleCode}
                    </span>
                  </div>
                  <p className="text-[#334643]">{nba.actionText}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#60716D] pt-1">
                    <span>Peran: <strong className="text-black">{nba.suggestedRole}</strong></span>
                    {nba.intervalValue && (
                      <span>Interval: <strong className="text-black">{nba.intervalValue} {nba.intervalUnit}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#D8E5E2]">
        <div>
          {canOverride && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenOverride}
              className="text-[#C22A2A] hover:bg-red-50 border-red-200"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Override Keputusan Klinis
            </Button>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={closeModal}>
          Tutup Rincian
        </Button>
      </div>
    </div>
  );
};
