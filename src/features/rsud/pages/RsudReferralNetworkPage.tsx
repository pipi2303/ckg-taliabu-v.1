import React, { useEffect, useState } from 'react';
import { GitBranch, Inbox, Layers, Clock, Ban, Building2, FileSearch } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { Tabs, TabItem } from '../../../components/common/Tabs';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { Button } from '../../../components/common/Button';
import { DrilldownModal } from '../../../features/command-center/components/DrilldownModal';
import { useAuth } from '../../../context/AuthContext';
import { rsudRepo } from '../../../repositories/rsudRepo';
import {
  rsudExecutiveService,
  ReferralCascadeSummary,
  BacklogStageRow,
  RejectionRow,
  SourcePuskesmasRow,
  RepeatReferralRow,
} from '../../../services/rsudExecutiveService';
import { HospitalReferral } from '../../../types';

const URGENCY_LABEL: Record<string, string> = {
  ROUTINE: 'Rutin',
  URGENT_24H: 'Mendesak (24 Jam)',
  EMERGENCY_IMMEDIATE: 'Emergensi',
};

const daysBetween = (a: string, b?: string) => Math.round((new Date(b || Date.now()).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export const RsudReferralNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('masuk');
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<HospitalReferral[]>([]);
  const [cascade, setCascade] = useState<ReferralCascadeSummary | null>(null);
  const [backlog, setBacklog] = useState<BacklogStageRow[]>([]);
  const [sla, setSla] = useState<Awaited<ReturnType<typeof rsudExecutiveService.getReferralSla>> | null>(null);
  const [rejections, setRejections] = useState<RejectionRow[]>([]);
  const [sourceRows, setSourceRows] = useState<SourcePuskesmasRow[]>([]);
  const [repeatRows, setRepeatRows] = useState<RepeatReferralRow[]>([]);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [refList, cascadeData, backlogData, slaData, rejectionData, sourceData, repeatData] = await Promise.all([
        rsudRepo.getAllReferrals(),
        rsudExecutiveService.getReferralCascade(),
        rsudExecutiveService.getReferralBacklog(),
        rsudExecutiveService.getReferralSla(),
        rsudExecutiveService.getRejectionAnalysis(),
        rsudExecutiveService.getSourcePuskesmasAnalysis(),
        rsudExecutiveService.getContinuityAndRepeatReferral(),
      ]);
      setReferrals(refList);
      setCascade(cascadeData);
      setBacklog(backlogData);
      setSla(slaData);
      setRejections(rejectionData);
      setSourceRows(sourceData);
      setRepeatRows(repeatData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: TabItem[] = [
    { id: 'masuk', label: 'Rujukan Masuk', icon: <Inbox className="w-4 h-4" /> },
    { id: 'cascade', label: 'Referral Cascade', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'backlog', label: 'Backlog & Overdue', icon: <Layers className="w-4 h-4" /> },
    { id: 'sla', label: 'Referral & Reply SLA', icon: <Clock className="w-4 h-4" /> },
    { id: 'rejection', label: 'Rejection Analysis', icon: <Ban className="w-4 h-4" /> },
    { id: 'network', label: 'Puskesmas Network', icon: <Building2 className="w-4 h-4" /> },
  ];

  const referralColumns: Column<HospitalReferral>[] = [
    { key: 'referralLetterNumber', header: 'No. Surat', render: (r) => <span className="font-mono text-xs">{r.referralLetterNumber}</span> },
    { key: 'originFacilityName', header: 'Puskesmas Asal' },
    { key: 'specialty', header: 'Spesialisasi' },
    { key: 'urgency', header: 'Prioritas', render: (r) => URGENCY_LABEL[r.urgency] || r.urgency },
    { key: 'status', header: 'Status' },
    {
      key: 'issuedAt',
      header: 'Tgl Rujuk',
      render: (r) => new Date(r.issuedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  const drilldownItems = referrals.map((r) => ({
    id: r.id,
    label: r.referralLetterNumber,
    subLabel: `${r.citizenNik.slice(0, 6)}••••••`,
    facilityName: r.originFacilityName,
    kecamatanName: r.targetHospitalName,
    stageOrStatus: r.status,
    daysStuck: r.acceptedAt ? undefined : daysBetween(r.issuedAt),
  }));

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Referral Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <GitBranch className="w-4 h-4" />
          RSUD COMMAND CENTER — REFERRAL NETWORK
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Referral Network</h1>
          <DocBadge
            code="SCR-RSD-B01"
            title="Referral Network"
            phase="F1"
            plafon="S3"
            description="Cascade, backlog, SLA, dan analisis penolakan rujukan CKG ke RSUD. Tidak menampilkan diagnosis/terapi individual."
            size="sm"
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'masuk' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" leftIcon={<FileSearch className="w-4 h-4" />} onClick={() => setDrilldownOpen(true)}>
              Buka Penelusuran Individual (Purpose-Gated)
            </Button>
          </div>
          <EntityTable
            data={referrals}
            columns={referralColumns}
            keyExtractor={(r) => r.id}
            searchField={(r) => `${r.referralLetterNumber} ${r.originFacilityName} ${r.specialty}`}
            searchPlaceholder="Cari No. Surat / Puskesmas / Spesialisasi..."
            onRefresh={loadData}
          />
          <DrilldownModal
            isOpen={drilldownOpen}
            onClose={() => setDrilldownOpen(false)}
            title="Penelusuran Individual Rujukan RSUD"
            contextDescription="Daftar operasional minimum (tanpa diagnosis) untuk koordinasi rujukan & closed-loop."
            currentUser={user}
            items={drilldownItems}
          />
        </div>
      )}

      {activeTab === 'cascade' && cascade && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Cut-off data: {new Date(cascade.dataCutoffAt).toLocaleString('id-ID')} · Total rujukan masuk: {cascade.totalReferred} · Ditolak/dialihkan: {cascade.totalRejected} (dikeluarkan dari funnel di bawah)
          </p>
          <div className="space-y-2">
            {cascade.stages.map((s, idx) => {
              const prev = idx > 0 ? cascade.stages[idx - 1].count : s.count;
              const widthPct = cascade.stages[0].count > 0 ? Math.round((s.count / cascade.stages[0].count) * 100) : 0;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-52 text-xs font-medium text-gray-700 shrink-0">{s.label}</span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-teal-600 flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all"
                      style={{ width: `${Math.max(widthPct, 4)}%` }}
                    >
                      {s.count}
                    </div>
                  </div>
                  {idx > 0 && prev > 0 && (
                    <span className="w-16 text-right text-[11px] text-gray-500 shrink-0">
                      {Math.round((s.count / prev) * 100)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'backlog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backlog.map((row) => (
            <div key={row.stage} className="p-4 bg-white border border-[#D8E5E2] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-black">{row.label}</span>
                <span className="text-lg font-extrabold text-teal-700">{row.count}</span>
              </div>
              {row.referrals.length > 0 ? (
                <ul className="text-[11px] text-gray-600 space-y-1">
                  {row.referrals.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex justify-between">
                      <span className="font-mono">{r.referralLetterNumber}</span>
                      <span>{r.originFacilityName}</span>
                    </li>
                  ))}
                  {row.referrals.length > 5 && <li className="text-gray-400">+{row.referrals.length - 5} lainnya</li>}
                </ul>
              ) : (
                <p className="text-[11px] text-gray-400">Tidak ada rujukan tertahan di tahap ini.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sla' && sla && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[sla.responseSla, sla.replySlaRoutine, sla.replySlaHighPriority].map((bucket) => (
            <div key={bucket.slaCode} className="p-5 bg-[#faf9f6] border border-stone-200 rounded-2xl text-stone-800 space-y-2 shadow-2xs">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">{bucket.label}</p>
              <p className="text-[11px] text-stone-500">Target: {bucket.targetHours} jam</p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-stone-200">
                  <p className="text-xl font-extrabold text-emerald-700">{bucket.onTimeCount}</p>
                  <p className="text-[10px] text-stone-500">Tepat Waktu</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-stone-200">
                  <p className="text-xl font-extrabold text-rose-600">{bucket.breachedCount}</p>
                  <p className="text-[10px] text-stone-500">Breach SLA</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-stone-200">
                  <p className="text-xl font-extrabold text-amber-700">{bucket.pendingWithinTargetCount}</p>
                  <p className="text-[10px] text-stone-500">Dalam Target</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rejection' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 italic">
            Penolakan karena keterbatasan sistem RSUD tidak diperlakukan sebagai kegagalan pasien (Gap Closure §Domain A item 10).
          </p>
          {rejections.length === 0 && <p className="text-sm text-gray-500">Tidak ada rujukan ditolak pada periode ini.</p>}
          {rejections.map((row) => (
            <div key={row.reason} className="p-4 bg-white border border-[#D8E5E2] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black">{row.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{row.referrals.map((r) => r.referralLetterNumber).join(', ')}</p>
              </div>
              <span className="text-lg font-extrabold text-rose-600">{row.count}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-[#D8E5E2]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] border-b border-[#D8E5E2]">
                <tr>
                  <th className="py-2.5 px-3">Puskesmas</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Diterima</th>
                  <th className="py-2.5 px-3 text-right">Hadir</th>
                  <th className="py-2.5 px-3 text-right">Selesai</th>
                  <th className="py-2.5 px-3 text-right">Closed-Loop</th>
                  <th className="py-2.5 px-3 text-right">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF3F1]">
                {sourceRows.map((row) => (
                  <tr key={row.facilityId}>
                    <td className="py-2.5 px-3 font-medium">{row.facilityName}</td>
                    <td className="py-2.5 px-3 text-right">{row.total}</td>
                    <td className="py-2.5 px-3 text-right">{row.accepted}</td>
                    <td className="py-2.5 px-3 text-right">{row.attended}</td>
                    <td className="py-2.5 px-3 text-right">{row.serviceCompleted}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{row.closedLoop}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">{row.overdueCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Repeat Referral Monitoring (Continuity)</p>
            {repeatRows.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada warga dengan lebih dari satu rujukan pada periode ini.</p>
            ) : (
              <ul className="text-xs text-gray-600 space-y-1">
                {repeatRows.map((row) => (
                  <li key={row.citizenId} className="flex justify-between p-2 bg-white border border-[#D8E5E2] rounded-lg">
                    <span>{row.citizenName}</span>
                    <span className="font-semibold">{row.count} rujukan</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
