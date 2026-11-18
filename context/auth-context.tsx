'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore, User, MemberProfile, HostProfile } from '@/lib/store/useAppStore';

export type { User, MemberProfile, HostProfile };

interface AuthContextType {
  user: User | null;
  memberProfile: MemberProfile | null;
  hostProfile: HostProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'member' | 'host';
  requestOtp: (phone: string) => Promise<{ success: boolean; error?: string; sandboxHint?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: 'member' | 'host') => Promise<boolean>;
  refreshSession: () => Promise<void>;
  upgradeToHost: (hostProfile: HostProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStore();

  useEffect(() => {
    store.refreshSession();
  }, []);

  const value: AuthContextType = {
    user: store.user,
    memberProfile: store.memberProfile,
    hostProfile: store.hostProfile,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    activeRole: store.activeRole,
    requestOtp: store.requestOtp,
    verifyOtp: store.verifyOtp,
    logout: store.logout,
    switchRole: store.switchRole,
    refreshSession: store.refreshSession,
    upgradeToHost: store.upgradeToHost,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // If used outside provider, directly return store
    const store = useAppStore();
    return {
      user: store.user,
      memberProfile: store.memberProfile,
      hostProfile: store.hostProfile,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      activeRole: store.activeRole,
      requestOtp: store.requestOtp,
      verifyOtp: store.verifyOtp,
      logout: store.logout,
      switchRole: store.switchRole,
      refreshSession: store.refreshSession,
      upgradeToHost: store.upgradeToHost,
    };
  }
  return context;
}
