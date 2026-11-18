'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  phone: string;
  activeRole: 'member' | 'host' | 'admin';
  accountStatus: string;
}

export interface MemberProfile {
  id: string;
  fullName: string;
  gender?: 'female' | 'male' | 'other' | string;
  city: string;
  area?: string;
  bio?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  onboardingCompleted: boolean;
}

export interface HostProfile {
  id: string;
  displayName: string;
  verificationStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
  isFreeToday: boolean;
  walletBalance: number;
}

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session from backend on initial mount
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setMemberProfile(data.memberProfile || null);
          setHostProfile(data.hostProfile || null);
        } else {
          setUser(null);
          setMemberProfile(null);
          setHostProfile(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const requestOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON response
      }
      if (!res.ok) {
        return {
          success: false,
          error: data.error || (res.status === 429
            ? 'Too many attempts. Please wait a minute and try again.'
            : 'Unable to send verification code. Please check your number and try again.'),
        };
      }
      return { success: true, sandboxHint: data.otp || data.sandboxHint || '7492' };
    } catch (err) {
      const isNetwork = typeof navigator !== 'undefined' && (!navigator.onLine || (err instanceof Error && err.message.toLowerCase().includes('fetch')));
      return {
        success: false,
        error: isNetwork
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : 'Unable to request code right now. Please try again.',
      };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON response
      }
      if (!res.ok) {
        return {
          success: false,
          error: data.error || (res.status === 400
            ? 'The verification code you entered is invalid. Please try again.'
            : 'Verification was not successful. Please try again.'),
        };
      }

      setUser(data.user);
      setMemberProfile(data.memberProfile);
      setHostProfile(data.hostProfile);

      return {
        success: true,
        redirectTo: data.redirectTo || '/explore',
      };
    } catch (err) {
      const isNetwork = typeof navigator !== 'undefined' && (!navigator.onLine || (err instanceof Error && err.message.toLowerCase().includes('fetch')));
      return {
        success: false,
        error: isNetwork
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : 'Unable to verify your code right now. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setMemberProfile(null);
      setHostProfile(null);
      router.push('/');
      router.refresh();
    }
  };

  const switchRole = async (targetRole: 'member' | 'host') => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, activeRole: targetRole } : null));
        router.refresh();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Switch role error:', err);
      return false;
    }
  };

  const activeRole: 'member' | 'host' = (user?.activeRole as 'member' | 'host') || 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        memberProfile,
        hostProfile,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        requestOtp,
        verifyOtp,
        logout,
        switchRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
