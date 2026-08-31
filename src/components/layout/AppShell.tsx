import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineBanner } from '../common/OfflineBanner';

interface AppShellProps {
  children: React.ReactNode;
  activeNav: string;
  onNavigate: (navId: string) => void;
  pageTitle: string;
  breadcrumbs?: string[];
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeNav,
  onNavigate,
  pageTitle,
  breadcrumbs,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col text-black antialiased">
      <OfflineBanner />

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onNavigate={onNavigate}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[264px]">
          <Header
            onToggleMobileSidebar={() => setIsOpenMobile(true)}
            pageTitle={pageTitle}
            breadcrumbs={breadcrumbs}
          />

          <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
