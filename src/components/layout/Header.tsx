import React, { useState } from 'react';
import {
  Menu,
  LogOut,
  UserCheck,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_USERS } from '../../mock/initialData';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  pageTitle: string;
  breadcrumbs?: string[];
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  pageTitle,
  breadcrumbs = ['Beranda'],
}) => {
  const { currentUser, logout, switchDemoUser } = useAuth();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Demo users list for quick prototyping across all roles
  const demoProfiles = INITIAL_USERS.filter((p) => p.roleId !== 'PHARMACY_OFFICER');

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#D8E5E2] px-4 lg:px-6 flex items-center justify-between shadow-2xs">
      {/* Zone 1: Mobile trigger & Page Identity / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-black hover:bg-[#F0F5F4] focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#60716D]">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[#AAB8B4]">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'font-medium text-black' : ''}>{b}</span>
              </React.Fragment>
            ))}
          </nav>
          <h2 className="text-base sm:text-lg font-bold text-black tracking-tight leading-none truncate mt-0.5">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Zone 2 & 3: Controls & Direct Logout */}
      <div id="tour-role-network-bar" className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher for Testing — always available, including while previewing
            the Citizen role/screens, so testers are never stranded without logging out. */}
        <div className="relative">
          <button
            onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-[#F0F5F4] hover:bg-[#E2ECE9] text-black border border-[#D8E5E2] rounded-lg transition-colors cursor-pointer"
            title="Beralih peran akun pengguna"
          >
            <Shield className="w-3.5 h-3.5 text-[#2E7D5B]" />
            <span className="hidden sm:inline">Ganti Peran</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isRoleSwitcherOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#D8E5E2] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setIsRoleSwitcherOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-[#D8E5E2] text-xs text-[#60716D]">
                <strong className="text-black block">Pilih Akun Pengguna</strong>
                Beralih profil untuk menguji hak akses peran pengguna
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {demoProfiles.map((p) => {
                  const isCurrent = currentUser?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={async () => {
                        setIsRoleSwitcherOpen(false);
                        await switchDemoUser(p.id);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F0F7F5] flex items-start justify-between gap-2 transition-colors ${
                        isCurrent ? 'bg-[#E1F5FE] font-bold' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">{p.name}</p>
                        <p className="text-[11px] text-[#60716D] truncate">{p.roleName}</p>
                      </div>
                      {isCurrent && <UserCheck className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Replaced Profile dropdown with direct Logout feature to return to Login Menu */}
        <button
          id="btn-header-logout"
          onClick={async () => {
            await logout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#9A2D2D] bg-[#FDF0F0] hover:bg-[#FBE4E4] active:bg-[#F8D7D7] border border-[#F8C6C6] rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Keluar dari sesi dan kembali ke menu login"
        >
          <LogOut className="w-3.5 h-3.5 text-[#9A2D2D]" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
