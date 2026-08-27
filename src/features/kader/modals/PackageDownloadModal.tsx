import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, AlertCircle, HardDrive, Clock, FileText, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { fieldWorkPackageService, PackageMetadataPreview } from '../../../services/fieldWorkPackageService';
import { FieldWorkPackage } from '../../../types';

interface PackageDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageActivated: (pkg: FieldWorkPackage) => void;
}

export const PackageDownloadModal: React.FC<PackageDownloadModalProps> = ({
  isOpen,
  onClose,
  onPackageActivated,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [preview, setPreview] = useState<PackageMetadataPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [downloadStep, setDownloadStep] = useState<'IDLE' | 'DOWNLOADING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadedPkg, setDownloadedPkg] = useState<FieldWorkPackage | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadPreview();
    }
  }, [isOpen, currentUser]);

  const loadPreview = async () => {
    if (!currentUser) return;
    setIsLoadingPreview(true);
    setErrorMessage(null);
    setDownloadStep('IDLE');
    setDownloadProgress(0);
    try {
      const data = await fieldWorkPackageService.getPackagePreview(currentUser);
      setPreview(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat informasi paket kerja.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    if (!currentUser || !preview) return;

    if (!preview.storageSufficient) {
      toast.error('Memori Tidak Cukup', 'Ruang penyimpanan tidak cukup untuk mengunduh paket baru.');
      return;
    }

    setDownloadStep('DOWNLOADING');
    setDownloadProgress(15);

    try {
      // 1. Simulate chunked download
      await new Promise((r) => setTimeout(r, 400));
      setDownloadProgress(60);
      await new Promise((r) => setTimeout(r, 400));
      setDownloadProgress(85);

      // 2. Verification Step
      setDownloadStep('VERIFYING');
      await new Promise((r) => setTimeout(r, 300));
      setDownloadProgress(95);

      // 3. Atomic Activation
      const pkg = await fieldWorkPackageService.generateAndActivatePackage(currentUser);
      setDownloadedPkg(pkg);
      setDownloadProgress(100);
      setDownloadStep('SUCCESS');

      toast.success(
        'Paket Kerja Aktif',
        `Berhasil mengunduh ${pkg.assignmentCount} sasaran kunjungan untuk ${pkg.villageName}.`
      );
    } catch (err: any) {
      setDownloadStep('ERROR');
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunduh paket kerja.');
      toast.error('Gagal Mengunduh', err.message);
    }
  };

  const handleFinish = () => {
    if (downloadedPkg) {
      onPackageActivated(downloadedPkg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with outside click close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={downloadStep === 'DOWNLOADING' || downloadStep === 'VERIFYING' ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#D8E5E2]">
        {/* Header */}
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Unduh Paket Kerja (A02)</h3>
              <p className="text-[10px] text-slate-300">Penugasan Kunjungan Warga Lapangan</p>
            </div>
          </div>
          {downloadStep !== 'DOWNLOADING' && downloadStep !== 'VERIFYING' && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {isLoadingPreview ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#00201C] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#60716D] font-medium">Menyiapkan paket kerja wilayah...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Peringatan Ruang / Jaringan</span>
              </div>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
              <button
                onClick={loadPreview}
                className="mt-2 w-full py-2 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-900 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : preview ? (
            <>
              {downloadStep === 'IDLE' && (
                <div className="space-y-4">
                  {/* Readiness Banner */}
                  <div className="p-3.5 bg-[#EBF7F2] rounded-xl border border-[#D8E5E2] space-y-2">
                    <span className="text-[11px] font-bold text-[#2E7D5B] uppercase tracking-wider">
                      Paket Kerja Siap Diunduh
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-black">
                        {preview.assignmentCount}{' '}
                        <span className="text-sm font-normal text-[#60716D]">Warga</span>
                      </span>
                      <span className="text-sm font-mono font-bold text-black bg-white px-2.5 py-1 rounded-lg border border-[#D8E5E2]">
                        {preview.estimatedSizeKb} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-[#334643]">
                      Wilayah Kerja: <strong>{preview.villageName}</strong>
                    </p>
                  </div>

                  {/* Metadata Specs */}
                  <div className="space-y-2 text-[#334643]">
                    <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="flex items-center gap-1.5 text-[#60716D]">
                        <Clock className="w-3.5 h-3.5 text-[#2E7D5B]" />
                        Masa Berlaku Paket:
                      </span>
                      <span className="font-semibold text-black">
                        {new Date(preview.expiresAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                      <span className="flex items-center gap-1.5 text-[#60716D]">
                        <HardDrive className="w-3.5 h-3.5 text-[#2E7D5B]" />
                        Sisa Memori Gawai:
                      </span>
                      <span
                        className={`font-semibold ${
                          preview.storageSufficient ? 'text-black' : 'text-red-700 font-bold'
                        }`}
                      >
                        {preview.availableStorageMb} MB{' '}
                        {preview.storageSufficient ? '(Cukup)' : '(Memori Penuh)'}
                      </span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={handleStartDownload}
                    disabled={!preview.storageSufficient}
                    className={`w-full min-h-[48px] rounded-xl font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      preview.storageSufficient
                        ? 'bg-[#00201C] hover:bg-[#102521] shadow-md'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-5 h-5 text-emerald-400" />
                    <span>Unduh Paket ({preview.estimatedSizeKb} KB)</span>
                  </button>
                </div>
              )}

              {(downloadStep === 'DOWNLOADING' || downloadStep === 'VERIFYING') && (
                <div className="py-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full border-3 border-[#00201C] border-t-transparent animate-spin mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-black">
                      {downloadStep === 'DOWNLOADING' ? 'Mengunduh Data Sasaran...' : 'Memverifikasi Integritas S2...'}
                    </h4>
                    <p className="text-[11px] text-[#60716D] mt-0.5">
                      Proses transaksi aman, data tidak akan terputus separuh.
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#D8E5E2] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2E7D5B] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-black">{downloadProgress}%</span>
                </div>
              )}

              {downloadStep === 'SUCCESS' && (
                <div className="py-4 space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-[#2E7D5B] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-black">Paket Siap Digunakan!</h4>
                    <p className="text-xs text-[#60716D] mt-1">
                      {downloadedPkg?.assignmentCount} data warga telah tersimpan di gawai. Anda dapat bekerja luring sepenuhnya.
                    </p>
                  </div>
                  <button
                    onClick={handleFinish}
                    className="w-full min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Mulai Kunjungan</span>
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
