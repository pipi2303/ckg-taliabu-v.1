import React, { useState } from 'react';
import {
  Phone,
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  User,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { DocBadge } from '../components/DocBadge';

interface CitizenLoginPageProps {
  onSuccess: () => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({ onSuccess }) => {
  const { requestOtp, verifyOtpAndLogin } = useCitizen();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMismatchHelp, setShowMismatchHelp] = useState(false);

  // Preset demo numbers
  const demoUsers = [
    { name: 'Hamid La Ode', phone: '081248991001', note: 'Perlu Jadwal' },
    { name: 'Nuraini Hasan', phone: '082199882341', note: 'Perlu Konfirmasi' },
    { name: 'Yohanis Karepesina', phone: '081244332211', note: 'Kendala Laut' },
    { name: 'Nomor Belum Terdaftar', phone: '089999999999', note: 'Uji Mismatch' },
  ];

  const handleRequestOtp = async (targetPhone = phone) => {
    if (!targetPhone.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setShowMismatchHelp(false);

    try {
      const res = await requestOtp(targetPhone);
      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setSimulatedCode(res.mockOtpCode || '123456');
        setStep('OTP');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOtpAndLogin(challengeId, otpCode);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.message);
        if (res.message.includes('belum sesuai')) {
          setShowMismatchHelp(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verifikasi OTP gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#D8E5E2] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#00201C] text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E1F5FE] text-black flex items-center justify-center font-extrabold text-xl shadow-md">
            CKG
          </div>
          <h1 className="text-lg font-bold text-[#E1F5FE] tracking-tight">
            CKG Sahabat Warga
          </h1>
          <div className="flex justify-center pt-0.5">
            <DocBadge
              code="SCR-WRG-A01"
              title="Masuk / Otentikasi OTP"
              phase="F1"
              plafon="S0"
              useCase="UC PSN-01"
              description="Nomor HP + OTP SMS/WA. Mismatch nomor mengarahkan ke faskes/kader tanpa pesan eror membingungkan."
              rules={[
                'Nomor HP + OTP SMS/WA (6 digit).',
                'Alur mismatch nomor HP terhubung langsung dengan loket/kader.',
              ]}
              variant="teal"
              size="xs"
            />
          </div>
          <p className="text-xs text-[#D8E5E2] leading-relaxed max-w-xs mx-auto">
            Aplikasi pendampingan tindak lanjut pemeriksaan kesehatan CKG Kabupaten Pulau Taliabu
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {showMismatchHelp && (
            <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-800" />
                Bantuan Penautan Nomor Telepon
              </div>
              <p className="text-[11px] leading-relaxed">
                Nomor ini belum terhubung dengan data CKG Anda. Silakan kunjungi loket pendaftaran Puskesmas Bobong atau hubungi kader Posyandu untuk memperbarui nomor kontak Anda.
              </p>
              <a
                href="tel:081240018899"
                className="block text-center py-2 bg-[#00201C] text-white rounded-lg font-bold text-xs"
              >
                Telepon Puskesmas Bobong
              </a>
            </div>
          )}

          {step === 'PHONE' ? (
            /* STEP 1: Phone Input */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 block">
                  Nomor HP Terdaftar di CKG:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="Contoh: 081248991001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#00201C] focus:outline-none bg-[#F8FBFA]"
                  />
                </div>
                <span className="text-[11px] text-gray-500 block">
                  Masukkan nomor telepon yang Anda daftarkan saat skrining Posyandu / Puskesmas.
                </span>
              </div>

              <button
                onClick={() => handleRequestOtp(phone)}
                disabled={isLoading || !phone.trim()}
                className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Lanjutkan & Kirim Kode OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Shortcuts */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Pilihan Cepat Warga (Simulasi):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoUsers.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPhone(u.phone);
                        handleRequestOtp(u.phone);
                      }}
                      className="p-2 bg-gray-50 hover:bg-[#E1F5FE] border border-gray-200 rounded-lg text-left text-xs transition-colors"
                    >
                      <div className="font-bold text-black truncate">{u.name}</div>
                      <div className="text-[10px] text-gray-500">{u.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: OTP Input */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Simulation Banner */}
              <div className="bg-[#FFFACD]/80 border border-[#ebd79b] p-3 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Kode Simulasi OTP: <strong>{simulatedCode}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(simulatedCode)}
                  className="px-2 py-0.5 bg-[#00201C] text-white text-[10px] rounded font-bold"
                >
                  Isi Otomatis
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 block">
                  Masukkan Kode 6 Digit OTP:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-extrabold tracking-widest focus:ring-2 focus:ring-[#00201C] focus:outline-none bg-[#F8FBFA]"
                  />
                </div>
                <span className="text-[11px] text-gray-500 block text-center">
                  Kode dikirimkan ke nomor <strong>{phone}</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#FFFACD]" />
                    <span>Verifikasi & Masuk</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-gray-600 hover:underline"
                >
                  Ubah Nomor HP
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestOtp(phone)}
                  className="text-black font-bold hover:underline"
                >
                  Kirim Ulang Kode
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
