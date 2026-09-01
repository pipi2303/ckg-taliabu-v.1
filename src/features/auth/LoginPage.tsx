import React, { useState } from 'react';
import { HeartHandshake, Lock, User, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { INITIAL_USERS } from '../../mock/initialData';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser, isLoading } = useAuth();
  const [username, setUsername] = useState('admin.dinkes');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(username);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali nama pengguna dan kata sandi.');
    }
  };

  const kadisUser = INITIAL_USERS.find((u) => u.roleId === 'KEPALA_DINAS') || INITIAL_USERS[1];
  const adminUser = INITIAL_USERS.find((u) => u.roleId === 'ADMIN_DINKES') || INITIAL_USERS[0];
  const rsudUser = INITIAL_USERS.find((u) => u.roleId === 'DIR_RSUD');
  const kapusUser = INITIAL_USERS.find((u) => u.roleId === 'KEPALA_PUSKESMAS') || INITIAL_USERS[3];
  const doctorUser = INITIAL_USERS.find((u) => u.roleId === 'DOCTOR') || INITIAL_USERS[5];
  const kaderUser = INITIAL_USERS.find((u) => u.roleId === 'KADER') || INITIAL_USERS[8];
  const citizenUser = INITIAL_USERS.find((u) => u.roleId === 'CITIZEN') || INITIAL_USERS[INITIAL_USERS.length - 1];

  const demoAccounts = [
    { label: 'Kepala Dinas (Dinkes)', user: kadisUser },
    { label: 'Admin System', user: adminUser },
    { label: 'Direktur RSUD', user: rsudUser },
    { label: 'Kepala Puskesmas', user: kapusUser },
    { label: 'Dokter Puskesmas', user: doctorUser },
    { label: 'Kader Posyandu', user: kaderUser },
    { label: 'Warga / Sasaran', user: citizenUser },
  ].filter((item) => !!item.user);

  return (
    <div className="min-h-screen bg-[#F8FBFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon & Heading */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#00201C] flex items-center justify-center text-white shadow-md mb-4">
          <HeartHandshake className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
          CKG Smart Care Platform
        </h1>
        <p className="mt-1 text-sm font-medium text-[#60716D]">
          Platform Tindak Lanjut Cek Kesehatan Gratis
        </p>
        <p className="text-xs text-[#2E7D5B] font-semibold mt-1">
          Kabupaten Pulau Taliabu — Provinsi Maluku Utara
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-[#D8E5E2]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#F8C6C6] text-xs text-[#9A2D2D] font-medium leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Nama Pengguna / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#60716D]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin.dinkes / kapus.bobong"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D8E5E2] hover:border-[#B4C9C5] focus:border-[#00201C] focus:ring-1 focus:ring-[#00201C] focus:outline-none text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#60716D]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-[#D8E5E2] hover:border-[#B4C9C5] focus:border-[#00201C] focus:ring-1 focus:ring-[#00201C] focus:outline-none text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#60716D] hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#60716D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D8E5E2] text-black focus:ring-[#00201C]"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <span className="text-[#397B94] font-medium cursor-default">Bantuan Akses</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Platform
            </Button>
          </form>

          {/* Prototype Demo Shortcuts */}
          <div className="mt-6 pt-5 border-t border-[#D8E5E2]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black mb-2.5">
              <Shield className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Akses Cepat Demo Peran (Prototype Verification):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {demoAccounts.map(({ label, user }) => {
                const userId = user?.id || '';
                const userName = user?.name || label;
                const isSystemAdmin = userId === 'usr-1' || userName === label;
                return (
                  <button
                    key={userId || label}
                    type="button"
                    onClick={() => userId && switchDemoUser(userId)}
                    className="px-2 py-2 text-left bg-[#F8FBFA] hover:bg-[#E1F5FE] border border-[#D8E5E2] hover:border-[#BDE3F5] rounded-lg transition-all text-[11px] group cursor-pointer"
                  >
                    <span className="font-bold text-black block group-hover:text-black truncate">
                      {label}
                    </span>
                    {!isSystemAdmin && (
                      <span className="text-[10px] text-[#60716D] block truncate">
                        {userName.split(',')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#60716D]">
          Hak Cipta &copy; 2026 Dinas Kesehatan Kab. Pulau Taliabu & Intramedika
        </p>
      </div>
    </div>
  );
};
