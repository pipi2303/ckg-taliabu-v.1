import React, { useState } from 'react';
import {
  User,
  Phone,
  Building2,
  ShieldCheck,
  BellOff,
  LogOut,
  ChevronRight,
  Info,
  Lock,
  FileCheck,
  Heart,
  Users,
  Clock,
  Sparkles,
  X,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { useAuth } from '../../../context/AuthContext';
import { DocBadge } from '../components/DocBadge';

interface CitizenAccountPageProps {
  onExitToWebApp?: () => void;
}

export const CitizenAccountPage: React.FC<CitizenAccountPageProps> = ({ onExitToWebApp }) => {
  const { citizen, profile, logout } = useCitizen();
  const { logout: authLogout } = useAuth();

  const [optOutMessage, setOptOutMessage] = useState(profile?.optOutMessaging || false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConsentReviewModal, setShowConsentReviewModal] = useState(false);

  const handleToggleOptOut = () => {
    setOptOutMessage((prev) => !prev);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    await authLogout();
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-black">Akun Saya</h1>
          <p className="text-xs text-[#60716D]">
            Pengaturan profil pendampingan kesehatan dan persetujuan
          </p>
        </div>

        <DocBadge
          code="SCR-WRG-F03"
          title="Pengaturan Akun & Notifikasi"
          phase="F1"
          plafon="S3"
          useCase="UC PSN-16"
          description="Preferensi kanal notifikasi, tinjau persetujuan berbagi data, & opsi jeda pendampingan."
          rules={[
            'Persetujuan data dapat ditinjau dan ditarik kapan saja.',
            'Opsi jeda pendampingan tanpa menghilangkan riwayat medis.',
          ]}
          variant="slate"
          size="xs"
        />
      </div>

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E1F5FE] flex items-center justify-center text-black font-extrabold text-lg">
            {citizen?.fullName.charAt(0) || 'W'}
          </div>
          <div>
            <h2 className="font-bold text-base text-black leading-snug">
              {citizen?.fullName || 'Warga Taliabu'}
            </h2>
            <p className="text-xs text-[#60716D]">
              NIK: {profile?.nikMasked || '8208************'}
            </p>
          </div>
        </div>

        <div className="border-t border-[#D8E5E2] pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Nomor Telepon Terdaftar
            </span>
            <strong className="text-black">{citizen?.phonePrimary || '-'}</strong>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              Fasilitas Kesehatan Terkait
            </span>
            <strong className="text-black">{citizen?.facilityName || 'Puskesmas Bobong'}</strong>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              Persetujuan Pendampingan
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {profile?.hasConsent ? 'Aktif (v1.0-2026)' : 'Belum Ditandatangani'}
            </span>
          </div>
        </div>
      </div>

      {/* Message Preference & Opt-Out */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Pengaturan Komunikasi & Notifikasi
        </h3>

        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#F8FBFA] border border-[#D8E5E2]">
          <div className="space-y-1">
            <div className="font-bold text-xs text-black">
              Pengingat Jadwal via WhatsApp / SMS
            </div>
            <p className="text-[11px] text-[#60716D] leading-tight">
              Menerima pesan pengingat otomatis menjelang hari kunjungan pemeriksaan.
            </p>
          </div>
          <button
            onClick={handleToggleOptOut}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              !optOutMessage ? 'bg-[#00201C]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                !optOutMessage ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {optOutMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Pemberitahuan:</strong> Pengiriman pesan pengingat dihentikan. Tindak lanjut kesehatan Anda tetap berjalan melalui Puskesmas dan kunjungan kader di desa.
          </div>
        )}
      </div>

      {/* Consent Review Link */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowConsentReviewModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5FE] flex items-center justify-center text-black">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-black">Surat Persetujuan Pendampingan</div>
              <div className="text-[10px] text-gray-500">Lihat kembali rincian persetujuan CKG</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Future Phase 2 & 3 Features (Planned Teasers) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#60716D] uppercase tracking-wider">
            Fitur Tahap Berikutnya (Fase 2 & 3)
          </h3>
          <span className="text-[10px] text-amber-800 font-semibold bg-[#FFFACD] px-2 py-0.5 rounded-full">
            Pengembangan
          </span>
        </div>

        <div className="space-y-2">
          {[
            {
              title: 'Akun Keluarga / Pendamping (Proxy Link)',
              desc: 'Memantau jadwal pemeriksaan orang tua atau anak oleh wali terverifikasi.',
              icon: Users,
            },
            {
              title: 'Pengingat & Penanda Minum Obat (Adherence)',
              desc: 'Pencatatan kepatuhan konsumsi obat rutin hipertensi & diabetes.',
              icon: Heart,
            },
            {
              title: 'Riwayat Kesehatan Longitudinal CKG',
              desc: 'Grafik perkembangan tekanan darah dan gula darah berkala.',
              icon: Clock,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-3.5 bg-white/70 rounded-xl border border-dashed border-gray-300 flex items-start gap-3 opacity-75"
              >
                <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{item.title}</span>
                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      Fase 2
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        {onExitToWebApp && (
          <button
            onClick={onExitToWebApp}
            className="w-full py-3 bg-[#00201C] hover:bg-[#00332D] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-teal-300" />
            Kembali ke Aplikasi Portal Web
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 border border-[#D8E5E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-black">
              <LogOut className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base text-black">Keluar dari Aplikasi?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Anda dapat masuk kembali kapan saja menggunakan nomor telepon yang sama dan kode OTP verifikasi.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Ya, Keluar
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Review Modal */}
      {showConsentReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowConsentReviewModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 border border-[#D8E5E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-black">Persetujuan Pendampingan</h3>
              <button
                onClick={() => setShowConsentReviewModal(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
              <p>
                <strong>Status:</strong> Aktif (Tercatat pada data CKG Kabupaten Pulau Taliabu).
              </p>
              <p>
                Persetujuan ini mencakup penerimaan informasi tindak lanjut, koordinasi jadwal kunjungan faskes, serta kunjungan pendampingan kader Posyandu jika diperlukan.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600">
                Persetujuan ini dapat diperbarui atau disesuaikan sewaktu-waktu melalui loket pendaftaran Puskesmas Bobong.
              </div>
            </div>

            <button
              onClick={() => setShowConsentReviewModal(false)}
              className="w-full py-2.5 bg-[#00201C] text-white font-bold text-xs rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
