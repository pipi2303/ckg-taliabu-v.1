import React, { useEffect, useState } from 'react';
import { RefreshCw, Server, Share2, GitCompare, LifeBuoy } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { Badge, BadgeVariant } from '../../../components/common/Badge';
import { rsudExecutiveService } from '../../../services/rsudExecutiveService';
import { RsudIntegrationChannelStatus, RsudIntegrationStatusValue, RsudReconciliationIssue } from '../../../types';

const STATUS_VARIANT: Record<RsudIntegrationStatusValue, BadgeVariant> = {
  CONNECTED: 'active',
  DEGRADED: 'warning',
  MANUAL_MODE: 'pending',
  FAILED: 'failed',
};

const ISSUE_LABEL: Record<string, string> = {
  MISSING_REFERRAL: 'Rujukan Hilang',
  DUPLICATE: 'Duplikasi',
  STATUS_MISMATCH: 'Status Tidak Cocok',
  MISSING_REPLY: 'Balasan Hilang',
  STALE_RECORD: 'Data Basi (Stale)',
};

const ChannelCard: React.FC<{ channel: RsudIntegrationChannelStatus }> = ({ channel }) => (
  <div className="p-5 bg-white border border-[#D8E5E2] rounded-xl space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-black">{channel.channel}</span>
      <Badge variant={STATUS_VARIANT[channel.status]} size="sm">{channel.status}</Badge>
    </div>
    <p className="text-xs text-gray-600">Mode: <strong>{channel.mode}</strong></p>
    <p className="text-xs text-gray-600">
      Sinkron terakhir: {channel.lastSuccessfulSyncAt ? new Date(channel.lastSuccessfulSyncAt).toLocaleString('id-ID') : 'Belum pernah'}
    </p>
    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
      <div>
        <p className="text-lg font-bold text-amber-600">{channel.pendingCount}</p>
        <p className="text-[10px] text-gray-500">Pending</p>
      </div>
      <div>
        <p className="text-lg font-bold text-rose-600">{channel.failedCount}</p>
        <p className="text-[10px] text-gray-500">Gagal</p>
      </div>
      <div>
        <p className="text-lg font-bold text-slate-600">{channel.reconciliationBacklogCount}</p>
        <p className="text-[10px] text-gray-500">Backlog Rekonsiliasi</p>
      </div>
    </div>
    {channel.note && <p className="text-[11px] text-gray-500 italic pt-1 border-t border-[#EDF3F1]">{channel.note}</p>}
  </div>
);

export const RsudDataIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('simrs');
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState<RsudIntegrationChannelStatus[]>([]);
  const [issues, setIssues] = useState<RsudReconciliationIssue[]>([]);
  const [continuity, setContinuity] = useState<Awaited<ReturnType<typeof rsudExecutiveService.getBusinessContinuityMode>>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, i, c] = await Promise.all([
        rsudExecutiveService.getIntegrationStatus(),
        rsudExecutiveService.getReconciliationIssues(),
        rsudExecutiveService.getBusinessContinuityMode(),
      ]);
      setStatuses(s);
      setIssues(i);
      setContinuity(c);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'simrs', label: 'SIMRS', icon: <Server className="w-4 h-4" /> },
    { id: 'satusehat', label: 'SATUSEHAT', icon: <Share2 className="w-4 h-4" /> },
    { id: 'reconciliation', label: 'Reconciliation', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'continuity', label: 'Business Continuity', icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Data & Integrasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <RefreshCw className="w-4 h-4" />
          RSUD COMMAND CENTER — DATA & INTEGRATION
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Data & Integrasi</h1>
          <DocBadge
            code="SCR-RSD-E01"
            title="Data & Integrasi"
            phase="F1"
            plafon="S0"
            description="Status integrasi SIMRS/SATUSEHAT, rekonsiliasi data lintas sistem, dan mode kesinambungan bisnis (fallback manual)."
            size="sm"
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">CKG Smart Care tidak menggantikan SIMRS — ini hanya lapisan status konektivitas & rekonsiliasi.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'simrs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {statuses.filter((s) => s.channel === 'SIMRS').map((s) => <ChannelCard key={s.id} channel={s} />)}
        </div>
      )}

      {activeTab === 'satusehat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {statuses.filter((s) => s.channel === 'SATUSEHAT').map((s) => <ChannelCard key={s.id} channel={s} />)}
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <div className="space-y-3">
          {issues.length === 0 && <p className="text-sm text-gray-500">Tidak ada disparitas data terdeteksi.</p>}
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 bg-white border border-[#D8E5E2] rounded-xl flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{ISSUE_LABEL[issue.issueType] || issue.issueType}</span>
                <p className="text-sm text-black mt-1">{issue.description}</p>
                {issue.referralLetterNumber && <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{issue.referralLetterNumber}</p>}
                <p className="text-[11px] text-gray-400 mt-0.5">Terdeteksi: {new Date(issue.detectedAt).toLocaleString('id-ID')}</p>
              </div>
              <Badge variant={issue.status === 'RESOLVED' ? 'active' : issue.status === 'INVESTIGATING' ? 'info' : 'warning'} size="sm">{issue.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'continuity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continuity.map((c) => (
            <div key={c.channel} className="p-4 bg-white border border-[#D8E5E2] rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-black">{c.channel}</span>
                <Badge variant={c.fallbackActive ? 'warning' : 'active'} size="sm">{c.mode}</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">{c.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
