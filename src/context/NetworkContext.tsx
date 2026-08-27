import React, { createContext, useContext, useState, useEffect } from 'react';
import { NetworkMode, SystemSettings } from '../types';
import { getSettings, saveSettings, subscribeToStorage } from '../repositories/storage';
import { useToast } from './ToastContext';

interface NetworkContextValue {
  networkMode: NetworkMode;
  isOffline: boolean;
  isSlow: boolean;
  settings: SystemSettings;
  setNetworkMode: (mode: NetworkMode) => void;
  updateSettings: (updates: Partial<SystemSettings>) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(getSettings());
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setSettings(getSettings());
    });
    return unsubscribe;
  }, []);

  const setNetworkMode = (mode: NetworkMode) => {
    const updated = { ...settings, networkMode: mode };
    saveSettings(updated);
    setSettings(updated);

    if (mode === 'OFFLINE') {
      toast.warning('Mode Luring Aktif', 'Koneksi internet terputus. Aksi akan disimpan di antrian offline.');
    } else if (mode === 'SLOW') {
      toast.info('Simulasi Jaringan Lambat', 'Latensi diperlambat untuk menguji performa data lapangan.');
    } else {
      toast.success('Kembali Daring', 'Koneksi terhubung kembali normal.');
    }
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    const updated = { ...settings, ...updates };
    saveSettings(updated);
    setSettings(updated);
    toast.success('Pengaturan Disimpan', 'Konfigurasi sistem berhasil diperbarui.');
  };

  return (
    <NetworkContext.Provider
      value={{
        networkMode: settings.networkMode,
        isOffline: settings.networkMode === 'OFFLINE',
        isSlow: settings.networkMode === 'SLOW',
        settings,
        setNetworkMode,
        updateSettings,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
};
