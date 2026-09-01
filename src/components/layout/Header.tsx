import React, { useState } from 'react';
import {
  Menu,
  LogOut,
  UserCheck,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDemoAccounts } from '../../mock/initialData';

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

  // Curated demo accounts aligned with login page (Akses Cepat Demo Peran)
  const demoAccounts = getDemoAccounts();

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
        {/* Quick Role Switcher for Testing & Permission Flow Validation */}
        <div className="relative" id="quick-role-switcher">
          <button
            id="quick-role-switcher-btn"
            data-testid="quick-role-switcher"
            aria-expanded={isRoleSwitcherOpen}
            aria-haspopup="true"
            onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-[#F0F5F4] hover:bg-[#E2ECE9] text-black border border-[#D8E5E2] rounded-lg transition-colors cursor-pointer"
            title="Quick Role Switcher: Ganti Peran Demo untuk Uji Hak Akses & Alur Navigasi"
          >
            <Shield className="w-3.5 h-3.5 text-[#2E7D5B]" />
            <span className="hidden sm:inline">Ganti Peran</span>
            <ChevronDown className={`w-3 h-3 text-[#60716D] transition-transform duration-150 ${isRoleSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleSwitcherOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleSwitcherOpen(false)}
              />
              <div
                id="quick-role-switcher-menu"
                role="menu"
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#D8E5E2] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3.5 py-2 border-b border-[#D8E5E2] bg-[#F8FBFA] rounded-t-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                    <Shield className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    <span>Quick Role Switcher</span>
                  </div>
                  <p className="text-[10.5px] text-[#60716D] mt-0.5">
                    Pilih akun demo untuk menguji wewenang, hak akses & alur navigasi tanpa harus keluar (logout)
                  </p>
                </div>
                <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                  {demoAccounts.map(({ label, user }) => {
                    const isCurrent =
                      currentUser?.id === user.id ||
                      (currentUser?.roleId === user.roleId && (user.roleId !== 'CITIZEN' || currentUser?.id === user.id));
                    const isSystemAdmin = user.id === 'usr-1' || user.name === label;
                    return (
                      <button
                        key={user.id || label}
                        role="menuitem"
                        onClick={async () => {
                          setIsRoleSwitcherOpen(false);
                          await switchDemoUser(user.id);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-xs flex items-center justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#E1F5FE] border-[#BDE3F5] text-black font-semibold shadow-2xs'
                            : 'bg-white hover:bg-[#F8FBFA] border-transparent hover:border-[#D8E5E2] text-black'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-black block truncate text-xs">
                            {label}
                          </span>
                          {!isSystemAdmin && (
                            <span className="text-[11px] text-[#60716D] block truncate">
                              {user.name}
                            </span>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0288D1] bg-white px-1.5 py-0.5 rounded border border-[#B3E5FC] shrink-0">
                            <UserCheck className="w-3 h-3 text-[#0288D1]" />
                            Aktif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
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
