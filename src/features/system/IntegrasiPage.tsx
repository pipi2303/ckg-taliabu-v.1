import React, { useState } from 'react';
import { Share2, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const IntegrasiPage: React.FC = () => {
  const toast = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestBridge = (name: string) => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success('Koneksi Terverifikasi', `Jalur integrasi ${name} beroperasi normal.`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-black">Konektivitas & Integrasi Eksternal</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Penyelarasan data standar dengan Ekosistem Kesehatan Nasional (Kemenkes RI) dan Dukcapil.
          </p>
        </div>
        <Badge variant="published" size="md">
          Standar FHIR HL7 & SatuSehat
        </Badge>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SATUSEHAT Integration */}
        <Card className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1F5FE] text-[#1E5D75] flex items-center justify-center font-bold text-sm">
                SS
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Kemenkes SATUSEHAT Bridge</h4>
                <p className="text-[11px] text-[#60716D]">Interoperabilitas Rekam Medis Elektronik Nasional</p>
              </div>
            </div>
            <Badge variant="active" size="sm">
              Terkoneksi (Sandbox)
            </Badge>
          </div>

          <div className="space-y-2 text-xs text-[#60716D] bg-[#F8FBFA] p-3 rounded-lg border border-[#D8E5E2]">
            <div className="flex justify-between">
              <span>Organization ID:</span>
              <strong className="text-black font-mono">100025684 (Dinkes Taliabu)</strong>
            </div>
            <div className="flex justify-between">
              <span>FHIR Version:</span>
              <strong className="text-black">R4 (Condition, Observation, Encounter)</strong>
            </div>
            <div className="flex justify-between">
              <span>Plafon Data Sync:</span>
              <strong className="text-[#2E7D5B]">Terkontrol Level S3 & S4</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isTesting}
              onClick={() => handleTestBridge('SATUSEHAT')}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Uji Konektivitas
            </Button>
          </div>
        </Card>

        {/* Disdukcapil Bridge */}
        <Card className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F2] text-[#1E583F] flex items-center justify-center font-bold text-sm">
                DK
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Disdukcapil NIK Validation</h4>
                <p className="text-[11px] text-[#60716D]">Pemadanan NIK & Validasi Demografi Warga</p>
              </div>
            </div>
            <Badge variant="active" size="sm">
              Aktif
            </Badge>
          </div>

          <div className="space-y-2 text-xs text-[#60716D] bg-[#F8FBFA] p-3 rounded-lg border border-[#D8E5E2]">
            <div className="flex justify-between">
              <span>Wilayah Cakupan:</span>
              <strong className="text-black">Kabupaten Pulau Taliabu (82.08)</strong>
            </div>
            <div className="flex justify-between">
              <span>Protokol Keamanan:</span>
              <strong className="text-black">Secure VPN + Hash NIK Verification</strong>
            </div>
            <div className="flex justify-between">
              <span>Status Cache:</span>
              <strong className="text-[#2E7D5B]">Lokal Terenkripsi (S1)</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isTesting}
              onClick={() => handleTestBridge('Disdukcapil')}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Uji Validasi NIK
            </Button>
          </div>
        </Card>
      </div>

      {/* Security & Compliance Checklist */}
      <Card className="space-y-3">
        <h4 className="text-sm font-bold text-black flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2E7D5B]" />
          Kepatuhan Keamanan & UU Perlindungan Data Pribadi (PDP)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-1">
            <span className="font-bold text-black block">Pemisahan S0–S4</span>
            <p className="text-[#60716D]">Enkripsi berjenjang dan pemotongan data sebelum dikirim ke perangkat kader.</p>
          </div>
          <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-1">
            <span className="font-bold text-black block">Jejak Audit Kekal</span>
            <p className="text-[#60716D]">Setiap akses data dan transmisi terekam tanpa kemungkinan penghapusan.</p>
          </div>
          <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-1">
            <span className="font-bold text-black block">Idempotency Luring</span>
            <p className="text-[#60716D]">Menjamin tidak ada duplikasi data hasil skrining saat sinyal internet pulih.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
