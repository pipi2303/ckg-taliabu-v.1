import React, { useEffect, useState } from 'react';
import { FileCheck2, FileText, Eye, Users, Layers3 } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { auditRepo } from '../../../repositories/auditRepo';
import { rsudExecutiveService } from '../../../services/rsudExecutiveService';
import { AuditEvent, RsudSlaDefinition, RsudEscalationLevel } from '../../../types';

const REPORT_DEFINITIONS = [
  { code: 'RPT-RSD-01', title: 'Laporan Referral Bulanan', description: 'Rekap volume, acceptance, dan closed-loop rujukan CKG per bulan.' },
  { code: 'RPT-RSD-02', title: 'Closed-Loop Referral Report', description: 'Status closed-loop per rujukan beserta tahap tertahan.' },
  { code: 'RPT-RSD-03', title: 'Referral per Puskesmas', description: 'Kinerja rujukan per Puskesmas pengirim.' },
  { code: 'RPT-RSD-04', title: 'SLA Report', description: 'Kepatuhan Referral Response SLA & Clinical Reply SLA.' },
  { code: 'RPT-RSD-05', title: 'Service Capacity Report', description: 'Kapasitas dan utilisasi layanan RSUD.' },
  { code: 'RPT-RSD-06', title: 'Overdue Report', description: 'Daftar rujukan overdue per tahap kaskade.' },
  { code: 'RPT-RSD-07', title: 'Pharmacy Availability Aggregate', description: 'Sinyal ketersediaan obat agregat lintas layanan.' },
  { code: 'RPT-RSD-08', title: 'Integration Report', description: 'Status integrasi SIMRS/SATUSEHAT & rekonsiliasi.' },
  { code: 'RPT-RSD-09', title: 'Executive Summary ke Dinkes', description: 'Ringkasan eksekutif lintas domain untuk koordinasi Dinkes.' },
];

const DELEGATION_FUNCTIONS = [
  { key: 'operational-monitoring', label: 'Operational Monitoring' },
  { key: 'referral-coordination', label: 'Referral Coordination' },
  { key: 'report-preparation', label: 'Report Preparation' },
  { key: 'capa-followup', label: 'CAPA Follow-up' },
];

const DELEGATE_ROLE_OPTIONS = [
  { value: 'Referral Coordinator', label: 'Referral Coordinator' },
  { value: 'Kepala Bidang Pelayanan', label: 'Kepala Bidang Pelayanan' },
  { value: 'Unit Pelayanan', label: 'Unit Pelayanan' },
  { value: 'Admin Rujukan', label: 'Admin Rujukan' },
];

export const RsudGovernancePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('reports');
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [slaDefs, setSlaDefs] = useState<RsudSlaDefinition[]>([]);
  const [escalation, setEscalation] = useState<RsudEscalationLevel[]>([]);
  const [delegateSelections, setDelegateSelections] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hospitalRefLogs, actionLogs, delegationLogs, slas, ladder] = await Promise.all([
        auditRepo.getLogs({ entityType: 'HOSPITAL_REFERRAL' }),
        auditRepo.getLogs({ entityType: 'EXECUTIVE_ACTION' }),
        auditRepo.getLogs({ entityType: 'RSUD_DELEGATION' }),
        rsudExecutiveService.getSlaGovernance(),
        rsudExecutiveService.getEscalationLadder(),
      ]);
      const merged = [...hospitalRefLogs, ...actionLogs, ...delegationLogs].sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      setAuditLogs(merged.slice(0, 30));
      setSlaDefs(slas);
      setEscalation(ladder);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit & Privacy Oversight', icon: <Eye className="w-4 h-4" /> },
    { id: 'delegation', label: 'Delegation', icon: <Users className="w-4 h-4" /> },
    { id: 'sla-governance', label: 'SLA Governance & Escalation', icon: <Layers3 className="w-4 h-4" /> },
  ];

  const handleDelegate = async (fn: typeof DELEGATION_FUNCTIONS[number]) => {
    if (!user) return;
    const delegateTo = delegateSelections[fn.key];
    if (!delegateTo) {
      toast.error('Pilih Penerima Delegasi', 'Tentukan peran penerima delegasi terlebih dahulu.');
      return;
    }
    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'CREATE',
      entityType: 'RSUD_DELEGATION',
      targetLabel: `Delegasi ${fn.label} → ${delegateTo}`,
      description: 'Delegasi operasional — tidak memberikan kewenangan klinis.',
      details: { function: fn.key, delegateTo, revocable: true },
    });
    toast.success('Delegasi Tercatat', `${fn.label} → ${delegateTo}`);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Governance & Audit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" />
          RSUD COMMAND CENTER — GOVERNANCE
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Governance & Audit</h1>
          <DocBadge
            code="SCR-RSD-F01"
            title="Governance & Audit"
            phase="F1"
            plafon="S1"
            description="Laporan resmi, oversight audit & privasi, delegasi operasional, serta tata kelola SLA & escalation ladder."
            size="sm"
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_DEFINITIONS.map((r) => (
            <div key={r.code} className="p-4 bg-white border border-[#D8E5E2] rounded-xl flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono text-gray-400">{r.code}</p>
                <p className="text-sm font-semibold text-black">{r.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{r.description}</p>
              </div>
              <Button size="sm" variant="outline" disabled>Segera Hadir</Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300">
            Direktur RSUD dapat melihat oversight audit — namun tidak otomatis memiliki akses membuka seluruh rekam medis atau data klinis sensitif di luar keperluan sah (Gap Closure §15 Audit Hard Lock).
          </div>
          <div className="bg-white border border-[#D8E5E2] rounded-xl divide-y divide-[#EDF3F1]">
            {auditLogs.length === 0 && <div className="p-6 text-center text-sm text-gray-500">Belum ada aktivitas tercatat terkait rujukan/tindakan eksekutif RSUD.</div>}
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-black">{log.action}</span>
                  <span className="text-gray-500"> · {log.targetLabel}</span>
                </div>
                <span className="text-gray-400">{new Date(log.occurredAt).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'delegation' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Delegasi bersifat auditable dan dapat dicabut kapan saja — tidak memberikan kewenangan klinis.</p>
          {DELEGATION_FUNCTIONS.map((fn) => (
            <div key={fn.key} className="p-4 bg-white border border-[#D8E5E2] rounded-xl flex items-center gap-4">
              <span className="text-sm font-medium text-black flex-1">{fn.label}</span>
              <div className="w-56">
                <Select
                  options={DELEGATE_ROLE_OPTIONS}
                  placeholderOption="Pilih penerima..."
                  value={delegateSelections[fn.key] || ''}
                  onChange={(e) => setDelegateSelections({ ...delegateSelections, [fn.key]: e.target.value })}
                />
              </div>
              <Button size="sm" onClick={() => handleDelegate(fn)}>Delegasikan</Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sla-governance' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Definisi SLA (Versioned & Auditable)</p>
            <div className="overflow-x-auto rounded-xl border border-[#D8E5E2]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] border-b border-[#D8E5E2]">
                  <tr>
                    <th className="py-2.5 px-3">SLA</th>
                    <th className="py-2.5 px-3">Versi</th>
                    <th className="py-2.5 px-3">Berlaku Sejak</th>
                    <th className="py-2.5 px-3">Pemilik</th>
                    <th className="py-2.5 px-3 text-right">Target (Jam)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF3F1]">
                  {slaDefs.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-medium">{s.label}</td>
                      <td className="py-2.5 px-3 font-mono">{s.version}</td>
                      <td className="py-2.5 px-3">{s.effectiveDate}</td>
                      <td className="py-2.5 px-3">{s.ownerRoleName}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{s.targetHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Escalation Ladder (Otomatis Hanya Memberi Alert)</p>
            <div className="flex flex-col gap-2">
              {escalation.map((lvl) => (
                <div key={lvl.level} className="p-3 bg-white border border-[#D8E5E2] rounded-lg flex items-center gap-4">
                  <span className="w-16 text-xs font-bold text-teal-700">Level {lvl.level}</span>
                  <span className="text-sm font-medium text-black flex-1">{lvl.roleLabel}</span>
                  <span className="text-xs text-gray-500">Trigger &gt; {lvl.triggerAfterHours} jam</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
