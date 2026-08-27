import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Bell,
  CloudUpload,
  Smartphone,
  Sliders,
  LogOut,
  UserCheck,
  Download,
  LayoutDashboard,
  ArrowLeft,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { kaderStorageRepo } from '../../repositories/kaderStorageRepo';
import { localQueueService } from '../../services/localQueueService';
import { FieldWorkPackage } from '../../types';
import { KaderStatusBanner } from './components/KaderStatusBanner';
import { DevSimulatorDrawer } from './components/DevSimulatorDrawer';
import { PackageDownloadModal } from './modals/PackageDownloadModal';
import { KaderRecapModal } from './modals/KaderRecapModal';
import { TodayVisitListPage } from './pages/TodayVisitListPage';
import { NewAssignmentsPage } from './pages/NewAssignmentsPage';
import { SyncCenterPage } from './pages/SyncCenterPage';
import { DeviceStatusPage } from './pages/DeviceStatusPage';

type KaderTab = 'VISITS' | 'NEW_TASKS' | 'SYNC' | 'DEVICE';

interface KaderAppShellProps {
  onSwitchToDesktop?: () => void;
}

export const KaderAppShell: React.FC<KaderAppShellProps> = ({ onSwitchToDesktop }) => {
  const { currentUser, logout, switchDemoUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<KaderTab>('VISITS');
  const [activePackage, setActivePackage] = useState<FieldWorkPackage | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);

  // Load package and queue
  const refreshData = () => {
    const pkg = kaderStorageRepo.getActivePackage(currentUser?.id);
    setActivePackage(pkg);
    setPendingCount(localQueueService.getPendingCount(currentUser?.id));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = kaderStorageRepo.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handlePackageActivated = (pkg: FieldWorkPackage) => {
    setActivePackage(pkg);
    refreshData();
    setActiveTab('VISITS');
  };

  return (
    <div className="min-h-screen bg-[#E5E9E8] flex justify-center selection:bg-emerald-100">
      {/* Mobile PWA Container - Max 480px, clean shadow, crisp contrast */}
      <div className="w-full max-w-md bg-[#F4F6F5] min-h-screen flex flex-col shadow-2xl relative border-x border-[#D8E5E2]">
        {/* Persistent Offline Status Banner */}
        <KaderStatusBanner
          activePackage={activePackage}
          pendingCount={pendingCount}
          onOpenSync={() => setActiveTab('SYNC')}
          onOpenDeviceStatus={() => setActiveTab('DEVICE')}
        />

        {/* Top App Header */}
        <header className="bg-white px-3 py-2.5 border-b border-[#D8E5E2] flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            {onSwitchToDesktop && (
              <button
                type="button"
                onClick={onSwitchToDesktop}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#00201C] hover:bg-[#00332D] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Kembali ke Aplikasi Portal Desktop"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Kembali</span>
              </button>
            )}
            <div className="w-7 h-7 rounded-full bg-[#2E7D5B] text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'KD'}
            </div>
            <div>
              <h2 className="text-xs font-bold text-black leading-tight truncate max-w-[130px] sm:max-w-[170px]">
                {currentUser?.name || 'Kader Marlina'}
              </h2>
              <p className="text-[10px] text-[#60716D] font-medium">
                {currentUser?.villageAssignmentName || activePackage?.villageName || 'Desa Bobong'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Direct Return to App Button */}
            {onSwitchToDesktop && (
              <button
                type="button"
                onClick={onSwitchToDesktop}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#EBF7F2] text-[#2E7D5B] hover:bg-emerald-100 text-[11px] font-bold cursor-pointer"
                title="Kembali ke Aplikasi Web"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Portal</span>
              </button>
            )}

            {/* Rekap Kerja Saya (KF-15) */}
            <button
              onClick={() => setIsRecapOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              title="Rekap Kerja Saya"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
            </button>

            {/* Quick Package Download */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              title="Unduh / Perbarui Paket Kerja"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Dev Simulator Button */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer relative"
              title="Simulator Uji Lapangan"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'VISITS' && (
            <TodayVisitListPage
              activePackage={activePackage}
              onOpenDownloadPackage={() => setIsDownloadModalOpen(true)}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'NEW_TASKS' && (
            <NewAssignmentsPage
              activePackage={activePackage}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'SYNC' && (
            <SyncCenterPage onRefresh={refreshData} />
          )}

          {activeTab === 'DEVICE' && (
            <DeviceStatusPage
              activePackage={activePackage}
              onOpenDownloadPackage={() => setIsDownloadModalOpen(true)}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onRefresh={refreshData}
            />
          )}
        </main>

        {/* Bottom Navigation Bar (48px Touch Targets) */}
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-[#D8E5E2] px-2 py-1.5 flex items-center justify-around z-40 shadow-lg">
          {/* Tab 1: Kunjungan */}
          <button
            type="button"
            onClick={() => setActiveTab('VISITS')}
            className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all ${
              activeTab === 'VISITS'
                ? 'text-black font-bold'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'VISITS' ? 'text-[#2E7D5B]' : ''}`} />
            <span className="text-[10px] mt-0.5">Kunjungan</span>
          </button>

          {/* Tab 2: Tugas Baru */}
          <button
            type="button"
            onClick={() => setActiveTab('NEW_TASKS')}
            className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center rounded-xl cursor-pointer relative transition-all ${
              activeTab === 'NEW_TASKS'
                ? 'text-black font-bold'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'NEW_TASKS' ? 'text-[#2E7D5B]' : ''}`} />
            <span className="text-[10px] mt-0.5">Tugas Baru</span>
            <span className="absolute top-1.5 right-6 w-2 h-2 bg-emerald-600 rounded-full" />
          </button>

          {/* Tab 3: Sinkronisasi */}
          <button
            type="button"
            onClick={() => setActiveTab('SYNC')}
            className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center rounded-xl cursor-pointer relative transition-all ${
              activeTab === 'SYNC'
                ? 'text-black font-bold'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <CloudUpload className={`w-5 h-5 ${activeTab === 'SYNC' ? 'text-[#2E7D5B]' : ''}`} />
            <span className="text-[10px] mt-0.5">Sinkron</span>
            {pendingCount > 0 && (
              <span className="absolute top-1 right-5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Tab 4: Gawai */}
          <button
            type="button"
            onClick={() => setActiveTab('DEVICE')}
            className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all ${
              activeTab === 'DEVICE'
                ? 'text-black font-bold'
                : 'text-[#60716D] hover:text-black'
            }`}
          >
            <Smartphone className={`w-5 h-5 ${activeTab === 'DEVICE' ? 'text-[#2E7D5B]' : ''}`} />
            <span className="text-[10px] mt-0.5">Gawai</span>
          </button>
        </nav>
      </div>

      {/* Simulator Drawer */}
      <DevSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onRefreshData={refreshData}
        onSwitchToDesktop={onSwitchToDesktop}
      />

      {/* Package Download Modal */}
      <PackageDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onPackageActivated={handlePackageActivated}
      />

      {/* Rekap Kerja Saya Modal (KF-15) */}
      <KaderRecapModal isOpen={isRecapOpen} onClose={() => setIsRecapOpen(false)} />
    </div>
  );
};
