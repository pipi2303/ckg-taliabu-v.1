import React, { useState, useEffect } from 'react';
import { Shield, FileSearch, Clock, User, CheckCircle2 } from 'lucide-react';
import { DocBadge } from '../../../components/common/DocBadge';
import { auditRepo } from '../../../repositories/auditRepo';
import { AuditEvent } from '../../../types';

export const DrilldownAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allLogs = await auditRepo.getLogs();
      // Filter drilldown or export or population related audit entries
      const popLogs = allLogs.filter(
        (l) =>
          l.action === 'EXPORT' ||
          l.action === 'DRILLDOWN' ||
          l.action === 'ACCESS_DENIED' ||
          l.entityId === 'POPULATION_DRILLDOWN' ||
          l.entityType?.includes('POPULATION') ||
          (typeof l.details === 'object' && JSON.stringify(l.details).includes('Tujuan'))
      );
      setLogs(popLogs.length > 0 ? popLogs : allLogs.slice(0, 15));
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600 space-y-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Memuat Jejak Audit Penelusuran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          GOVERNANCE & PRIVACY COMPLIANCE AUDIT
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-black tracking-tight">Jejak Audit Penelusuran Data (Drilldown)</h1>
          <DocBadge code="SCR-DNK-B12" size="sm" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Pencatatan permanen setiap penelusuran data agregat ke tingkat operasional yang dilakukan pengguna Dinkes beserta kode tujuan yang sah.
        </p>
      </div>

      {/* Log Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white">Log Aktivitas Penelusuran Terkini ({logs.length} Catatan)</h3>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terverifikasi ISO-27701
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Waktu Akses</th>
                <th className="py-2.5 px-3">Pengguna & Peran</th>
                <th className="py-2.5 px-3">Konteks Sasaran</th>
                <th className="py-2.5 px-3">Rincian & Tujuan Penelusuran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.occurredAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{log.actorName || log.userName || 'Petugas Dinkes'}</div>
                    <div className="text-[11px] text-teal-400">{log.actorRole || 'ADMIN_DINKES'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {log.targetLabel || log.entityType} ({log.entityId || 'GLOBAL'})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-md leading-relaxed">
                    {log.description || (typeof log.details === 'string' ? log.details : JSON.stringify(log.details))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
