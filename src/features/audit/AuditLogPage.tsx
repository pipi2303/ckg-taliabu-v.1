import React, { useState, useEffect } from 'react';
import { History, Search, Eye, Filter, ShieldCheck, Clock, Download } from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { auditRepo } from '../../repositories/auditRepo';
import { AuditEvent, AuditAction, AuditEntityType } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal } = useModal();
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await auditRepo.getLogs();
      setLogs(list);
    } catch (err: any) {
      toast.error('Gagal Memuat Audit Log', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (entityFilter !== 'ALL' && l.entityType !== entityFilter) return false;
    return true;
  });

  // Action: Open Read-only Audit Detail Modal
  const handleOpenDetailModal = (event: AuditEvent) => {
    openModal({
      title: `Detail Rekaman Audit: ${event.action} ${event.entityType}`,
      subtitle: `ID: ${event.id} • Waktu: ${new Date(event.occurredAt).toLocaleString('id-ID')}`,
      size: 'lg',
      content: ({ closeModal }) => (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[#60716D] block text-[11px]">Pelaksana (Actor):</span>
              <strong className="text-black text-sm">{event.actorName}</strong>
              <p className="text-[#397B94]">{event.actorRole} • ID: {event.actorUserId}</p>
            </div>
            <div>
              <span className="text-[#60716D] block text-[11px]">Entitas Target:</span>
              <strong className="text-black text-sm">{event.targetLabel || event.entityType}</strong>
              <p className="text-[#60716D]">ID: {event.entityId}</p>
            </div>
            <div>
              <span className="text-[#60716D] block text-[11px]">Fasilitas Kesehatan:</span>
              <span className="text-black font-medium">{event.facilityName || 'Dinas Kesehatan'}</span>
            </div>
            <div>
              <span className="text-[#60716D] block text-[11px]">Tujuan Pemrosesan (Purpose Code):</span>
              <span className="font-mono text-[#2E7D5B] font-bold">{event.purposeCode || 'STANDARD_AUDIT'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#60716D] mb-1.5">
              Payload & State Snapshot (Read-Only Immutable):
            </h4>
            <pre className="p-3 bg-[#00201C] text-emerald-300 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-64">
              {JSON.stringify(event.details || {}, null, 2)}
            </pre>
          </div>

          <div className="p-3 bg-[#E1F5FE] border border-[#BDE3F5] rounded-lg text-black flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#397B94] shrink-0" />
            <span>Rekaman audit ini bersifat append-only, terenkripsi, dan tidak dapat diubah maupun dihapus.</span>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#D8E5E2]">
            <Button variant="outline" size="sm" onClick={closeModal}>
              Tutup
            </Button>
          </div>
        </div>
      ),
    });
  };

  const columns: Column<AuditEvent>[] = [
    {
      key: 'occurredAt',
      header: 'Waktu Kejadian',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-black block text-xs">
            {new Date(row.occurredAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="text-[11px] text-[#60716D] font-mono">
            {new Date(row.occurredAt).toLocaleTimeString('id-ID')}
          </span>
        </div>
      ),
    },
    {
      key: 'actorName',
      header: 'Pelaksana (Actor)',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block">{row.actorName}</span>
          <span className="text-[11px] text-[#397B94]">{row.actorRole}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      sortable: true,
      align: 'center',
      render: (row) => {
        let variant: any = 'neutral';
        if (row.action === 'CREATE') variant = 'active';
        if (row.action === 'UPDATE') variant = 'review';
        if (row.action === 'DEACTIVATE') variant = 'revoked';
        if (row.action === 'PUBLISH') variant = 'published';
        if (row.action === 'LOGIN') variant = 'info';

        return <Badge variant={variant} size="sm">{row.action}</Badge>;
      },
    },
    {
      key: 'entityType',
      header: 'Tipe Objek',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-black">{row.entityType}</span>,
    },
    {
      key: 'targetLabel',
      header: 'Target & Keterangan',
      render: (row) => (
        <span className="text-xs text-[#334643] truncate block max-w-xs">
          {row.targetLabel || row.entityId}
        </span>
      ),
    },
    {
      key: 'facilityName',
      header: 'Faskes',
      render: (row) => <span className="text-xs text-[#60716D]">{row.facilityName || 'Dinkes'}</span>,
    },
    {
      key: 'actionButton',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDetailModal(row)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-bold text-black">Jejak Audit Sistem (Append-Only Log)</h3>
            <DocBadge code="SCR-PKM-H02" size="sm" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Log permanen untuk seluruh aktivitas pembuatan, perubahan data, pengelolaan pengguna, dan tata kelola aturan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="published" size="md">
            {logs.length} Peristiwa Tercatat
          </Badge>
        </div>
      </div>

      <EntityTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        searchPlaceholder="Cari pelaksana, target, atau ID peristiwa..."
        filters={[
          {
            key: 'action',
            label: 'Aksi',
            value: actionFilter,
            onChange: (v) => setActionFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Aksi' },
              { value: 'CREATE', label: 'CREATE' },
              { value: 'UPDATE', label: 'UPDATE' },
              { value: 'DEACTIVATE', label: 'DEACTIVATE' },
              { value: 'REACTIVATE', label: 'REACTIVATE' },
              { value: 'PUBLISH', label: 'PUBLISH' },
              { value: 'CONSENT_GRANT', label: 'CONSENT_GRANT' },
              { value: 'CONSENT_REVOKE', label: 'CONSENT_REVOKE' },
            ],
          },
          {
            key: 'entityType',
            label: 'Tipe Objek',
            value: entityFilter,
            onChange: (v) => setEntityFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Objek' },
              { value: 'USER', label: 'User' },
              { value: 'FACILITY', label: 'Facility' },
              { value: 'KECAMATAN', label: 'Kecamatan' },
              { value: 'DESA', label: 'Desa' },
              { value: 'CONSENT', label: 'Consent' },
              { value: 'RULE_VERSION', label: 'Rule Version' },
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Jejak Audit"
        emptyDescription="Setiap aksi modifikasi sistem akan otomatis dicatat di sini."
      />
    </div>
  );
};
