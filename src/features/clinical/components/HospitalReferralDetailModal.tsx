import React from 'react';
import {
  HospitalReferral,
  ReferralStatus,
  ReferralReplyChannel,
} from '../../../types';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  QrCode,
  Ship,
  FileText,
} from 'lucide-react';
import { formatDateTime } from '../../../utils/date';

interface HospitalReferralDetailModalProps {
  referral: HospitalReferral;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (status: ReferralStatus, notes?: string, replyChannel?: ReferralReplyChannel) => Promise<void>;
  readOnly?: boolean;
}

export const HospitalReferralDetailModal: React.FC<HospitalReferralDetailModalProps> = ({
  referral,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [responseNotes, setResponseNotes] = React.useState(referral.rsudResponseNote || '');
  const [selectedStatus, setSelectedStatus] = React.useState<ReferralStatus>(referral.status);
  // IS-CKG §4 (INT-05): Tingkat 1 (surat dipindai manual) is what must work from day one of
  // pilot, so it's the honest default rather than implying a digital channel exists.
  const [selectedReplyChannel, setSelectedReplyChannel] = React.useState<ReferralReplyChannel>(
    referral.replyChannel || 'MANUAL_LETTER'
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveStatus = async () => {
    if (!onStatusUpdate) return;
    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedStatus, responseNotes, selectedReplyChannel);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const REPLY_CHANNEL_LABELS: Record<ReferralReplyChannel, string> = {
    MANUAL_LETTER: 'Tingkat 1 — Surat Dipindai (Manual)',
    DIGITAL_ASSISTED: 'Tingkat 2 — Kanal Digital Disepakati (Semi-otomatis)',
    SYSTEM_TO_SYSTEM: 'Tingkat 3 — Sistem-ke-Sistem (Belum untuk Pilot)',
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY_IMMEDIATE':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 border border-red-200">
            CITO / Kedaruratan Medis Segera
          </span>
        );
      case 'URGENT_24H':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
            URGENT (Dalam 24 Jam)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
            Rutin / Poliklinik Terjadwal
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'RECEIVED_BY_RSUD':
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Diterima RSUD Bobong
          </span>
        );
      case 'CONSULTED':
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Konsultasi Spesialis
          </span>
        );
      case 'RETURNED_TO_PUSKESMAS':
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Rujuk Balik (PRB BPJS)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Dikirim ke RSUD
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-semibold">Surat Rujukan Pasien CKG (FKTP ke RSUD)</h2>
              <p className="text-xs text-slate-300">Nomor: {referral.referralLetterNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs flex items-center gap-1.5 px-3"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Surat</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Surat Rujukan Canvas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm print:p-0">
          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              PEMERINTAH KABUPATEN PULAU TALIABU &bull; DINAS KESEHATAN
            </p>
            <h3 className="text-base font-bold text-slate-900 uppercase">
              {referral.originFacilityName}
            </h3>
            <p className="text-xs text-slate-600">
              Sistem Layanan Kesehatan Terpadu CKG &bull; Provinsi Maluku Utara
            </p>
          </div>

          {/* Status & Triage Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Tingkat Urgensi:</span>
              {getUrgencyBadge(referral.urgency)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Status Rujukan:</span>
              {getStatusBadge(referral.status)}
            </div>
            {referral.replyChannel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Kanal Balasan RSUD:</span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-800">
                  {REPLY_CHANNEL_LABELS[referral.replyChannel]}
                </span>
              </div>
            )}
          </div>

          {/* Tujuan Rujukan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/50 border border-teal-100 p-4 rounded-lg">
            <div>
              <span className="text-xs font-medium text-slate-500">Rumah Sakit Rujukan:</span>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                {referral.targetHospitalName}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Spesialisasi Dituju:</span>
              <p className="font-semibold text-teal-700 mt-0.5">
                {referral.specialty.replace('SPESIALIS_', 'Spesialis ')}
              </p>
            </div>
          </div>

          {/* Identitas Pasien */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1">
              Identitas Pasien
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 pt-1">
              <div>
                <span className="text-xs text-slate-500">Nama Lengkap</span>
                <p className="font-medium text-slate-900">{referral.citizenName}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">NIK Pasien</span>
                <p className="font-medium text-slate-900 font-mono">{referral.citizenNik}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">No. Kontak</span>
                <p className="font-medium text-slate-900">{referral.citizenPhone || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Alamat Domisili</span>
                <p className="font-medium text-slate-900">{referral.citizenAddress || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Tanggal Terbit Rujukan</span>
                <p className="font-medium text-slate-900">{formatDateTime(referral.issuedAt)}</p>
              </div>
            </div>
          </div>

          {/* Ringkasan Medis Klinis */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1">
              Ringkasan Medis & Temuan Klinis (S3 Data)
            </h4>

            <div>
              <span className="text-xs font-semibold text-slate-700">Diagnosis Utama (ICD-10):</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                [{referral.primaryDiagnosis.code}] {referral.primaryDiagnosis.name}
              </p>
            </div>

            {referral.secondaryDiagnoses && referral.secondaryDiagnoses.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700">Diagnosis Sekunder:</span>
                <ul className="list-disc list-inside text-xs text-slate-700 mt-0.5">
                  {referral.secondaryDiagnoses.map((d, i) => (
                    <li key={i}>
                      [{d.code}] {d.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-xs font-semibold text-slate-600 block mb-1">Tanda Vital Saat Rujukan</span>
                <p className="text-xs font-mono text-slate-800">{referral.vitalSignsSummary}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-xs font-semibold text-slate-600 block mb-1">Hasil Lab / Penunjang FKTP</span>
                <p className="text-xs font-mono text-slate-800">{referral.labFindingsSummary}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700">Anamnesis & Riwayat Penyakit:</span>
              <p className="text-xs text-slate-700 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100">
                {referral.clinicalAnamnesis}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700">Terapi Awal / Tindakan di FKTP:</span>
              <p className="text-xs text-slate-700 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100">
                {referral.initialTherapyGiven || '-'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700">Alasan Rujukan:</span>
              <p className="text-xs text-slate-800 mt-0.5 font-medium">
                {referral.reasonForReferral}
              </p>
            </div>

            {referral.transportConsiderations && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded flex items-start gap-2 text-xs text-blue-900">
                <Ship className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Pertimbangan Transportasi Laut (Taliabu):</span>{' '}
                  {referral.transportConsiderations}
                </div>
              </div>
            )}
          </div>

          {/* Legal Signatures & QR */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-slate-300 rounded bg-slate-50">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700">Verifikasi Digital CKG</p>
                <p>Dokumen resmi terenkripsi</p>
                <p className="font-mono text-[10px]">{referral.id}</p>
              </div>
            </div>

            <div className="text-right space-y-1 text-xs">
              <p className="text-slate-500">Dokter Penanggung Jawab FKTP,</p>
              <div className="h-8"></div>
              <p className="font-bold text-slate-900 underline">{referral.doctorName}</p>
              <p className="text-[11px] text-slate-600 font-mono">{referral.doctorSip}</p>
            </div>
          </div>

          {/* RSUD Feedback Section / Update */}
          {onStatusUpdate && (
            <div className="mt-6 p-4 bg-slate-100 border border-slate-300 rounded-lg space-y-3 print:hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Respon / Umpan Balik RSUD Bobong (Feedback Loop)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Update Status Rujukan:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ReferralStatus)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="SENT">DIKIRIM / MENUNGGU TANGGAPAN RSUD</option>
                    <option value="RECEIVED_BY_RSUD">DITERIMA DI RSUD BOBONG</option>
                    <option value="CONSULTED">SELESAI KONSULTASI SPESIALIS</option>
                    <option value="RETURNED_TO_PUSKESMAS">PROGRAM RUJUK BALIK (PRB PUSKESMAS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Catatan Klinis RSUD / Resume PRB:
                  </label>
                  <input
                    type="text"
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Contoh: Pasien telah diperiksa dr. Sp.M, terapi tetes mata dilanjutkan di Puskesmas."
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Balasan Diterima Lewat (Tingkat Kematangan Interaksi RSUD):
                  </label>
                  <select
                    value={selectedReplyChannel}
                    onChange={(e) => setSelectedReplyChannel(e.target.value as ReferralReplyChannel)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="MANUAL_LETTER">{REPLY_CHANNEL_LABELS.MANUAL_LETTER}</option>
                    <option value="DIGITAL_ASSISTED">{REPLY_CHANNEL_LABELS.DIGITAL_ASSISTED}</option>
                    <option value="SYSTEM_TO_SYSTEM">{REPLY_CHANNEL_LABELS.SYSTEM_TO_SYSTEM}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-teal-600 text-white rounded text-xs font-medium hover:bg-teal-700 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Feedback Rujukan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
