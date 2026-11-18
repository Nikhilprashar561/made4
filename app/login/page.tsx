'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Phone, Lock, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/explore';
  const toast = useToast();
  const { isAuthenticated, memberProfile, requestOtp, verifyOtp } = useAuth();

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  // If already logged in, redirect to onboarding (if profile incomplete) or explore
  useEffect(() => {
    if (isAuthenticated) {
      if (!memberProfile?.onboardingCompleted) {
        router.push('/onboarding/member');
      } else {
        router.push(nextUrl && nextUrl !== '/login' ? nextUrl : '/explore');
      }
    }
  }, [isAuthenticated, memberProfile, nextUrl, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error(
        `Please enter a complete 10-digit mobile number. You entered ${phone.length} digit${phone.length === 1 ? '' : 's'}.`,
        'Mobile Number Incomplete'
      );
      return;
    }
    setLoading(true);
    const res = await requestOtp(phone);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      const code = res.sandboxHint || '7492';
      setSandboxCode(code);
      setOtp(code); // Pre-fill for instant 1-click verification
      toast.success(`Verification code is ready: ${code}`, 'Code Generated');
    } else {
      toast.error(res.error || 'Failed to send verification code. Please try again.', 'Error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      toast.error('Please enter the 4-digit verification code sent to your phone.', 'Code Incomplete');
      return;
    }
    setLoading(true);
    const res = await verifyOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      toast.success('Welcome to Togethr! Signing you in...', 'Verified');
      // If profile is not complete, strictly direct to profile setup form
      const target =
        res.redirectTo === '/onboarding/member'
          ? '/onboarding/member'
          : nextUrl && nextUrl !== '/login'
          ? nextUrl
          : res.redirectTo || '/explore';
      router.push(target);
    } else {
      toast.error(res.error || 'Invalid code entered. Please try again.', 'Verification Failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border-brutal bg-white p-8 sm:p-10 shadow-brutal-lg space-y-6">
          <div className="text-center space-y-3">
            <Logo size="md" className="mx-auto" />
            <div className="inline-flex">
              <Badge variant="lime" size="sm">
                Secure Auth
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-black text-ink">
              Welcome to made4togethr
            </h1>
            <p className="font-body text-xs sm:text-sm text-ink-soft">
              Sign in with your mobile number to explore, book meetups, or manage your host profile.
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-display text-xs font-black uppercase text-ink">
                  Mobile Number (India +91)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-xs font-black text-ink-muted">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full rounded-xl border-brutal bg-paper-deep/30 pl-12 pr-4 py-3 font-mono text-sm font-bold text-ink focus:bg-white focus:outline-none focus:shadow-brutal"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send 4-Digit OTP →'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-display text-xs font-black uppercase text-ink">
                    Enter 4-Digit Code
                  </label>
                  <span className="text-[11px] font-bold text-ink-muted">
                    Sent to +91 {phone}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[1em] rounded-xl border-brutal bg-white py-3 font-mono text-2xl font-black text-ink focus:outline-none focus:shadow-brutal"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </Button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center font-display text-xs font-bold text-ink-muted hover:underline cursor-pointer"
              >
                Change Phone Number
              </button>
            </form>
          )}

          <div className="border-t-brutal-sm pt-4 text-center text-[11px] font-medium text-ink-muted leading-relaxed">
            By proceeding, you agree to our{' '}
            <Link href="/terms" className="font-bold underline text-ink">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/community-guidelines" className="font-bold underline text-ink">
              Platonic Community Guidelines
            </Link>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
