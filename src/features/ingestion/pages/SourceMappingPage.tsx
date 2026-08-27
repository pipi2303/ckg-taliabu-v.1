import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { EntityTable, Column } from '../../../components/common/EntityTable';
import { ingestionRepo } from '../../../repositories/ingestionRepo';
import { SourceMapping } from '../../../types';

export const SourceMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<SourceMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await ingestionRepo.getSourceMappings();
      setMappings(data);
    } catch (err) {
      console.error('Failed to load source mappings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<SourceMapping>[] = [
    {
      key: 'sourceField',
      header: 'Field Sumber (ASIK / SSI / File)',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-black block">{row.sourceField}</span>
          <span className="text-[10px] text-[#60716D]">{row.sourceSystem}</span>
        </div>
      ),
    },
    {
      key: 'arrow',
      header: '',
      align: 'center',
      render: () => <ArrowRight className="w-4 h-4 text-[#2E7D5B]" />,
    },
    {
      key: 'targetField',
      header: 'Field Target Platform (Kanonikal)',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#2E7D5B] block">{row.targetField}</span>
          <span className="text-[10px] text-[#60716D]">Tipe: {row.targetDataType || 'STRING'}</span>
        </div>
      ),
    },
    {
      key: 'transformationRule',
      header: 'Aturan Transformasi / Normalisasi',
      render: (row) => (
        <span className="text-xs text-black bg-[#F8FBFA] p-1.5 rounded border border-[#D8E5E2] block font-mono text-[11px]">
          {row.transformationRule}
        </span>
      ),
    },
    {
      key: 'isRequired',
      header: 'Wajib',
      align: 'center',
      render: (row) => (
        <Badge variant={row.isRequired ? 'warning' : 'neutral'} size="sm">
          {row.isRequired ? 'Wajib' : 'Opsional'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Pemetaan Kolom Sumber (Source Mapping Engine)</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E1F5FE] text-black rounded border border-[#BDE3F5]">
              Engine Ingestion
            </span>
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Kamus pemetaan field dari format ASIK / SatuSehat / Excel manual ke model entitas CKG Smart Care.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Muat Ulang
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] flex items-start gap-3">
        <Database className="w-5 h-5 text-[#2E7D5B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#334643] space-y-1">
          <p className="font-bold text-black">Standardisasi Normalisasi CKG</p>
          <p>
            Setiap payload data mentah dipetakan secara deklaratif sebelum masuk ke layer Master Patient Index (MPI). Jika terjadi perubahan skema pada API sumber, proses ingestion otomatis menolak data baru untuk menjaga integritas data historis.
          </p>
        </div>
      </div>

      <EntityTable
        data={mappings}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRefresh={loadData}
        emptyTitle="Belum Ada Pemetaan Kolom"
        emptyDescription="Kamus pemetaan sumber data belum dikonfigurasi."
      />
    </div>
  );
};
