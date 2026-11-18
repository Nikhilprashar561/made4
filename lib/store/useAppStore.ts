'use client';

import { create } from 'zustand';

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
  userId?: string;
  displayName: string;
  age?: number;
  gender?: string;
  city?: string;
  area?: string;
  bio?: string;
  tagline?: string;
  avatarUrl?: string;
  hourlyRate?: number;
  verificationStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
  isFreeToday: boolean;
  walletBalance: number;
  upiId?: string;
}

export interface AppState {
  user: User | null;
  memberProfile: MemberProfile | null;
  hostProfile: HostProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'member' | 'host';

  // Synchronous State Modifiers
  setAuth: (payload: {
    user: User | null;
    memberProfile?: MemberProfile | null;
    hostProfile?: HostProfile | null;
  }) => void;
  setMemberProfile: (profile: MemberProfile | null) => void;
  setHostProfile: (profile: HostProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  upgradeToHost: (hostProfile: HostProfile) => void;

  // Async API Operations
  refreshSession: () => Promise<void>;
  requestOtp: (phone: string) => Promise<{ success: boolean; error?: string; sandboxHint?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  switchRole: (targetRole: 'member' | 'host') => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  memberProfile: null,
  hostProfile: null,
  isAuthenticated: false,
  isLoading: true,
  activeRole: 'member',

  setAuth: ({ user, memberProfile = null, hostProfile = null }) => {
    set({
      user,
      memberProfile: memberProfile ?? null,
      hostProfile: hostProfile ?? null,
      isAuthenticated: !!user,
      activeRole: (user?.activeRole as 'member' | 'host') || 'member',
      isLoading: false,
    });
  },

  setMemberProfile: (memberProfile) => set({ memberProfile }),

  setHostProfile: (hostProfile) => set({ hostProfile }),

  setIsLoading: (isLoading) => set({ isLoading }),

  upgradeToHost: (hostProfile) => {
    set((state) => ({
      hostProfile,
      activeRole: 'host',
      user: state.user ? { ...state.user, activeRole: 'host' } : null,
    }));
  },

  refreshSession: async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          set({
            user: data.user,
            memberProfile: data.memberProfile || null,
            hostProfile: data.hostProfile || null,
            isAuthenticated: true,
            activeRole: (data.user.activeRole as 'member' | 'host') || 'member',
            isLoading: false,
          });
          return;
        }
      }
      set({
        user: null,
        memberProfile: null,
        hostProfile: null,
        isAuthenticated: false,
        activeRole: 'member',
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to restore session via Zustand:', err);
      set({
        user: null,
        memberProfile: null,
        hostProfile: null,
        isAuthenticated: false,
        activeRole: 'member',
        isLoading: false,
      });
    }
  },

  requestOtp: async (phone: string) => {
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
          error:
            data.error ||
            (res.status === 429
              ? 'Too many attempts. Please wait a minute and try again.'
              : 'Unable to send verification code. Please check your number and try again.'),
        };
      }
      return { success: true, sandboxHint: data.otp || data.sandboxHint || '7492' };
    } catch (err) {
      const isNetwork =
        typeof navigator !== 'undefined' &&
        (!navigator.onLine || (err instanceof Error && err.message.toLowerCase().includes('fetch')));
      return {
        success: false,
        error: isNetwork
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : 'Unable to request code right now. Please try again.',
      };
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
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
          error:
            data.error ||
            (res.status === 400
              ? 'The verification code you entered is invalid. Please try again.'
              : 'Verification was not successful. Please try again.'),
        };
      }

      set({
        user: data.user,
        memberProfile: data.memberProfile || null,
        hostProfile: data.hostProfile || null,
        isAuthenticated: !!data.user,
        activeRole: (data.user?.activeRole as 'member' | 'host') || 'member',
        isLoading: false,
      });

      return {
        success: true,
        redirectTo: data.redirectTo || '/explore',
      };
    } catch (err) {
      const isNetwork =
        typeof navigator !== 'undefined' &&
        (!navigator.onLine || (err instanceof Error && err.message.toLowerCase().includes('fetch')));
      return {
        success: false,
        error: isNetwork
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : 'Unable to verify your code right now. Please try again.',
      };
    }
  },

  switchRole: async (targetRole: 'member' | 'host') => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        set((state) => ({
          activeRole: targetRole,
          user: state.user ? { ...state.user, activeRole: targetRole } : null,
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Switch role error:', err);
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({
        user: null,
        memberProfile: null,
        hostProfile: null,
        isAuthenticated: false,
        activeRole: 'member',
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },
}));
