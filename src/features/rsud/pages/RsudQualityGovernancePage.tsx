import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertOctagon, ClipboardCheck, MessageCircleWarning, BadgeCheck } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { rsudExecutiveService } from '../../../services/rsudExecutiveService';
import { RsudQualityEvent, RsudRiskCapaItem, RsudRiskCapaStatus } from '../../../types';

const SEVERITY_COLOR: Record<RsudQualityEvent['severity'], string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-300',
  CRITICAL: 'bg-rose-50 text-rose-800 border-rose-300',
};

const RISK_STAGE_ORDER: RsudRiskCapaStatus[] = ['IDENTIFIED', 'ASSESSED', 'ACTION_IN_PROGRESS', 'IN_REVIEW', 'CLOSED'];

const nextStage = (current: RsudRiskCapaStatus): RsudRiskCapaStatus => {
  const idx = RISK_STAGE_ORDER.indexOf(current);
  return RISK_STAGE_ORDER[Math.min(idx + 1, RISK_STAGE_ORDER.length - 1)];
};

export const RsudQualityGovernancePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('quality');
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<RsudQualityEvent[]>([]);
  const [riskItems, setRiskItems] = useState<RsudRiskCapaItem[]>([]);
  const [compliance, setCompliance] = useState<Awaited<ReturnType<typeof rsudExecutiveService.getComplianceStatus>> | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [e, r, c] = await Promise.all([
        rsudExecutiveService.getQualityEvents(),
        rsudExecutiveService.getRiskRegister(),
        rsudExecutiveService.getComplianceStatus(),
      ]);
      setEvents(e);
      setRiskItems(r);
      setCompliance(c);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'quality', label: 'Quality & Safety Indicators', icon: <AlertOctagon className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk Register & CAPA', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'complaint', label: 'Patient Experience & Complaint', icon: <MessageCircleWarning className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance Monitor', icon: <BadgeCheck className="w-4 h-4" /> },
  ];

  const handleAdvanceRisk = async (item: RsudRiskCapaItem) => {
    if (!user) return;
    await rsudExecutiveService.updateRiskCapaItem(item.id, { status: nextStage(item.status) }, { id: user.id, name: user.name });
    toast.info('Status CAPA Diperbarui', `${item.riskTitle} → ${nextStage(item.status)}`);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Quality & Safety...</p>
      </div>
    );
  }

  const qualityIndicators = events.filter((e) => e.eventType === 'QUALITY_INDICATOR' || e.eventType === 'SAFETY_INCIDENT');
  const complaints = events.filter((e) => e.eventType === 'COMPLAINT');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          RSUD COMMAND CENTER — QUALITY & GOVERNANCE
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Quality & Safety</h1>
          <DocBadge
            code="SCR-RSD-D01"
            title="Quality & Safety"
            phase="F1"
            plafon="S3"
            description="Indikator mutu, insiden keselamatan, risk register/CAPA, keluhan pasien, dan kepatuhan — level agregat, bukan rekam medis individual."
            size="sm"
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'quality' && (
        <div className="space-y-3">
          {qualityIndicators.length === 0 && <p className="text-sm text-gray-500">Tidak ada indikator mutu/insiden tercatat.</p>}
          {qualityIndicators.map((e) => (
            <div key={e.id} className={`p-4 rounded-xl border ${SEVERITY_COLOR[e.severity]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{e.category}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/60 border border-current">{e.severity}</span>
              </div>
              <p className="text-sm mt-1">{e.description}</p>
              <p className="text-[11px] mt-1 opacity-70">Dilaporkan oleh {e.reportedByRole} · {new Date(e.reportedAt).toLocaleDateString('id-ID')} · Status: {e.status}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-3">
          {riskItems.map((item) => (
            <div key={item.id} className="p-4 bg-white border border-[#D8E5E2] rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-black">{item.riskTitle}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.riskDescription}</p>
                  {item.actionPlan && <p className="text-[11px] text-teal-700 mt-1"><strong>Rencana Aksi:</strong> {item.actionPlan}</p>}
                  <p className="text-[11px] text-gray-500 mt-1">PIC: {item.picUserName || '—'} · Tenggat: {item.dueDate || '—'}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={item.status === 'CLOSED' ? 'active' : item.status === 'IDENTIFIED' ? 'pending' : 'info'} size="sm">{item.status}</Badge>
                  {item.status !== 'CLOSED' && (
                    <Button size="sm" variant="outline" onClick={() => handleAdvanceRisk(item)}>Majukan Tahap</Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-400">
                {RISK_STAGE_ORDER.map((stage, idx) => (
                  <React.Fragment key={stage}>
                    <span className={RISK_STAGE_ORDER.indexOf(item.status) >= idx ? 'text-teal-600 font-semibold' : ''}>{stage}</span>
                    {idx < RISK_STAGE_ORDER.length - 1 && <span>→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'complaint' && (
        <div className="space-y-3">
          {complaints.length === 0 && <p className="text-sm text-gray-500">Tidak ada keluhan tercatat.</p>}
          {complaints.map((e) => (
            <div key={e.id} className={`p-4 rounded-xl border ${SEVERITY_COLOR[e.severity]}`}>
              <span className="text-xs font-bold uppercase tracking-wider">{e.category}</span>
              <p className="text-sm mt-1">{e.description}</p>
              <p className="text-[11px] mt-1 opacity-70">{new Date(e.reportedAt).toLocaleDateString('id-ID')} · Status: {e.status}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'compliance' && compliance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Credential Akan Berakhir', value: compliance.credentialsExpiringSoon, tone: compliance.credentialsExpiringSoon > 0 ? 'text-amber-600' : 'text-emerald-600' },
            { label: 'Credential Belum Lengkap', value: compliance.credentialsIncomplete, tone: compliance.credentialsIncomplete > 0 ? 'text-rose-600' : 'text-emerald-600' },
            { label: 'CAPA Belum Selesai', value: compliance.unresolvedCriticalCapaCount, tone: compliance.unresolvedCriticalCapaCount > 0 ? 'text-amber-600' : 'text-emerald-600' },
            { label: 'Kegagalan Integrasi', value: compliance.integrationFailureCount, tone: compliance.integrationFailureCount > 0 ? 'text-rose-600' : 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-white border border-[#D8E5E2] rounded-xl text-center">
              <p className={`text-3xl font-extrabold ${stat.tone}`}>{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
