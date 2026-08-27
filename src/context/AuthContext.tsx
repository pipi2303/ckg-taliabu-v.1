import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, SensitivityLevel, User } from '../types';
import { authService } from '../services/authService';
import { permissionService } from '../services/permissionService';
import { subscribeToStorage } from '../repositories/storage';
import { useToast } from './ToastContext';

interface AuthContextValue {
  currentUser: User | null;
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthorizedForLevel: (level: SensitivityLevel) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const currentSession = authService.getCurrentSession();
      setSession(currentSession);
      if (currentSession) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
      setCurrentUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // Subscribe to storage changes (e.g. if user is deactivated or updated)
    const unsubscribe = subscribeToStorage(() => {
      refreshUser();
    });
    return unsubscribe;
  }, [refreshUser]);

  const login = async (usernameOrEmail: string) => {
    try {
      setIsLoading(true);
      const { user } = await authService.login(usernameOrEmail);
      await refreshUser();
      toast.success('Berhasil Masuk', `Selamat datang kembali, ${user.name} (${user.roleName}).`);
    } catch (err: any) {
      toast.error('Gagal Masuk', err.message || 'Nama pengguna atau kata sandi tidak valid.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setCurrentUser(null);
      setSession(null);
      toast.info('Sesi Ditutup', 'Anda telah berhasil keluar dari sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const user = await authService.switchRoleForDemo(userId);
      await refreshUser();
      toast.info('Beralih Peran Demo', `Sekarang Anda berperan sebagai ${user.name} (${user.roleName}).`);
    } catch (err: any) {
      toast.error('Gagal Beralih Peran', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Whether the current user's role is authorized to see data at a given data-sensitivity
  // level (S0-S4), per the platform's Plafon ceiling (see permissionService.hasSensitivityAccess).
  const isAuthorizedForLevel = useCallback(
    (level: SensitivityLevel) => {
      if (!currentUser) return false;
      return permissionService.hasSensitivityAccess(currentUser.roleId, level);
    },
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        session,
        isAuthenticated: !!currentUser && currentUser.status === 'ACTIVE',
        isLoading,
        login,
        logout,
        switchDemoUser,
        refreshUser,
        isAuthorizedForLevel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
