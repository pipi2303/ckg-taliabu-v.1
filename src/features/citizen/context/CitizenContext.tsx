import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Citizen,
  CitizenCompanionProfileDTO,
  CitizenHealthValueDTO,
  CitizenOfflineCacheData,
} from '../../../types';
import { citizenAuthService } from '../../../services/citizenAuthService';
import { citizenOtpService } from '../../../services/citizenOtpService';
import { citizenProfileService } from '../../../services/citizenProfileService';
import { citizenOfflineCacheService } from '../../../services/citizenOfflineCacheService';
import { consentRepo } from '../../../repositories/consentRepo';
import { citizenRepo } from '../../../repositories/citizenRepo';

export type CitizenDemoMode =
  | 'NORMAL'
  | 'ACTION_REQUIRED'
  | 'AWAITING_CONFIRMATION'
  | 'SCHEDULED'
  | 'BARRIER_CASE'
  | 'NO_DATA'
  | 'OFFLINE_CACHED';

interface CitizenContextType {
  citizen: Citizen | null;
  profile: CitizenCompanionProfileDTO | null;
  healthValues: CitizenHealthValueDTO[];
  offlineCache: CitizenOfflineCacheData | null;
  isLoading: boolean;
  isOnline: boolean;
  demoMode: CitizenDemoMode;
  showConsentModal: boolean;
  // Methods
  requestOtp: (phone: string) => Promise<{ success: boolean; challengeId?: string; mockOtpCode?: string; message: string }>;
  verifyOtpAndLogin: (challengeId: string, code: string) => Promise<{ success: boolean; message: string; requiresConsent?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleOnlineStatus: () => void;
  setDemoMode: (mode: CitizenDemoMode) => Promise<void>;
  grantConsent: () => Promise<void>;
  dismissConsentModal: () => void;
  setDirectCitizen: (citizenId: string) => Promise<void>;
}

const CitizenContext = createContext<CitizenContextType | undefined>(undefined);

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [profile, setProfile] = useState<CitizenCompanionProfileDTO | null>(null);
  const [healthValues, setHealthValues] = useState<CitizenHealthValueDTO[]>([]);
  const [offlineCache, setOfflineCache] = useState<CitizenOfflineCacheData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<CitizenDemoMode>('ACTION_REQUIRED');
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  // Load session or initialize default demo citizen
  const loadCitizenData = useCallback(async (c: Citizen) => {
    setIsLoading(true);
    try {
      setCitizen(c);
      const prof = await citizenProfileService.getProfile(c.id);
      setProfile(prof);
      const vals = await citizenProfileService.getHealthValues(c.id);
      setHealthValues(vals);
      const cache = await citizenOfflineCacheService.getOfflineData(c.id);
      setOfflineCache(cache);

      if (prof && !prof.hasConsent) {
        setShowConsentModal(true);
      }
    } catch (err) {
      console.error('Failed to load citizen companion data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial session check
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const current = await citizenAuthService.getCurrentCitizen();
      if (current) {
        await loadCitizenData(current);
      } else {
        // Default to Hamid La Ode for instant smooth prototype demo
        const defaultCitizen = await citizenRepo.getById('CIT-8208-0001');
        if (defaultCitizen) {
          await loadCitizenData(defaultCitizen);
        } else {
          setIsLoading(false);
        }
      }
    };
    init();
  }, [loadCitizenData]);

  const requestOtp = async (phone: string) => {
    return citizenOtpService.requestOtp(phone);
  };

  const verifyOtpAndLogin = async (challengeId: string, code: string) => {
    const verifyRes = await citizenOtpService.verifyOtp(challengeId, code);
    if (!verifyRes.success || !verifyRes.phone) {
      return { success: false, message: verifyRes.message };
    }

    const authRes = await citizenAuthService.loginWithVerifiedPhone(verifyRes.phone);
    if (!authRes.success || !authRes.citizen) {
      return { success: false, message: authRes.message };
    }

    await loadCitizenData(authRes.citizen);

    if (authRes.requiresConsent) {
      setShowConsentModal(true);
    }

    return {
      success: true,
      message: authRes.message,
      requiresConsent: authRes.requiresConsent,
    };
  };

  const logout = async () => {
    await citizenAuthService.logout();
    setCitizen(null);
    setProfile(null);
    setHealthValues([]);
  };

  const refreshProfile = async () => {
    if (!citizen) return;
    if (!isOnline) {
      const cache = await citizenOfflineCacheService.getOfflineData(citizen.id);
      setOfflineCache(cache);
      return;
    }
    const prof = await citizenProfileService.getProfile(citizen.id);
    setProfile(prof);
    const vals = await citizenProfileService.getHealthValues(citizen.id);
    setHealthValues(vals);
    const cache = await citizenOfflineCacheService.getOfflineData(citizen.id);
    setOfflineCache(cache);
  };

  const toggleOnlineStatus = () => {
    setIsOnline((prev) => !prev);
  };

  const setDirectCitizen = async (citizenId: string) => {
    const target = await citizenRepo.getById(citizenId);
    if (target) {
      await loadCitizenData(target);
    }
  };

  const setDemoMode = async (mode: CitizenDemoMode) => {
    setDemoModeState(mode);
    setIsLoading(true);

    if (mode === 'OFFLINE_CACHED') {
      setIsOnline(false);
      if (citizen) {
        const cache = await citizenOfflineCacheService.getOfflineData(citizen.id);
        setOfflineCache(cache);
      }
      setIsLoading(false);
      return;
    }

    setIsOnline(true);

    // Switch citizen based on scenario
    let targetCitizenId = 'CIT-8208-0001'; // Default Hamid La Ode (Action Required)
    if (mode === 'AWAITING_CONFIRMATION') {
      targetCitizenId = 'CIT-8208-0002'; // Nuraini
    } else if (mode === 'SCHEDULED') {
      targetCitizenId = 'CIT-8208-0004'; // Siti Rahmawati
    } else if (mode === 'BARRIER_CASE') {
      targetCitizenId = 'CIT-8208-0005'; // Yohanis Karepesina
    } else if (mode === 'NO_DATA') {
      targetCitizenId = 'CIT-8208-0007'; // Rusli Silayar
    }

    const c = await citizenRepo.getById(targetCitizenId);
    if (c) {
      await loadCitizenData(c);
    } else {
      setIsLoading(false);
    }
  };

  const grantConsent = async () => {
    if (!citizen) return;
    await consentRepo.create({
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      citizenNik: '8208************',
      consentTextVersion: 'v1.0-2026',
      channel: 'APP',
      scope: 'FOLLOW_UP_PROCESSING',
      grantedAt: new Date().toISOString(),
      status: 'ACTIVE',
      notes: 'Persetujuan mandiri diberikan melalui Citizen Companion App',
    });

    setShowConsentModal(false);
    await refreshProfile();
  };

  const dismissConsentModal = () => {
    setShowConsentModal(false);
  };

  return (
    <CitizenContext.Provider
      value={{
        citizen,
        profile,
        healthValues,
        offlineCache,
        isLoading,
        isOnline,
        demoMode,
        showConsentModal,
        requestOtp,
        verifyOtpAndLogin,
        logout,
        refreshProfile,
        toggleOnlineStatus,
        setDemoMode,
        grantConsent,
        dismissConsentModal,
        setDirectCitizen,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
};

export const useCitizen = () => {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
};
