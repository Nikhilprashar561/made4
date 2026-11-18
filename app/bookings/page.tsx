'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  KeyRound,
  ShieldAlert,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANIONS } from '@/lib/data/companions';
import { formatRupees } from '@/lib/utils';
import { fetchLiveBookings, BookingDisplayItem } from '@/app/actions/getBookings';

const DEFAULT_INITIAL_BOOKINGS: BookingDisplayItem[] = [
  {
    id: 'tog-book-sample-8891',
    companion: COMPANIONS[0],
    memberName: 'Rahul Sharma',
    memberPhone: '+91 98765 43210',
    activity: 'Coffee Chat',
    date: 'Today, 18 Nov 2026',
    time: '17:00 IST',
    duration: '2 Hours',
    meetingPoint: 'Third Wave Coffee, 100ft Road, Indiranagar',
    startCode: '8492',
    escrowAmount: 1374,
    status: 'Confirmed · Ready to Meet',
  },
];

export default function MemberBookingsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [showSosModal, setShowSosModal] = useState(false);
  const [bookings, setBookings] = useState<BookingDisplayItem[]>(DEFAULT_INITIAL_BOOKINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const live = await fetchLiveBookings();
        setBookings(live);
      } catch (err) {
        console.error('Error fetching live bookings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Badge variant="lime" size="sm">
              Member Portal · Protected Meetup
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-ink">
              My Meetups
            </h1>
            <p className="font-body text-xs sm:text-sm text-ink-soft">
              Track your upcoming bookings, view your secret 4-digit start codes, and review completed meetups.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 border-b-brutal pb-2">
            {[
              { id: 'active', label: `🟢 Active & Upcoming (${bookings.length})` },
              { id: 'completed', label: '✓ Completed (2)' },
              { id: 'cancelled', label: 'Refunded (0)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`rounded-xl border-brutal-sm px-4 py-2 font-display text-xs font-black transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-ink text-paper shadow-brutal-sm'
                    : 'bg-white text-ink hover:bg-paper-deep'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'active' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="rounded-2xl border-brutal bg-white p-12 text-center font-display text-sm font-bold text-ink">
                  Loading your bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-2xl border-brutal bg-white p-12 text-center space-y-3">
                  <p className="font-display text-base font-black text-ink">No active bookings yet.</p>
                  <p className="text-xs text-ink-muted">Explore verified companions in your city and book your first meetup.</p>
                  <Link href="/explore">
                    <Button variant="primary" size="md">
                      Explore Companions →
                    </Button>
                  </Link>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal-lg space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-brutal-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-brutal bg-paper-deep">
                          <Image
                            src={booking.companion.avatarUrl}
                            alt={booking.companion.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-black text-ink">
                            {booking.companion.name} · {booking.companion.age}
                          </h2>
                          <span className="text-xs font-bold text-ink-muted">
                            Activity: {booking.activity} · Ref #{booking.id}
                          </span>
                        </div>
                      </div>

                      <Badge variant="lime" size="md">
                        🟢 {booking.status}
                      </Badge>
                    </div>

                    {/* Secret 4-Digit Start Code Box */}
                    <div className="rounded-2xl border-brutal bg-sunny p-6 text-center space-y-2 shadow-brutal">
                      <span className="text-xs font-black uppercase text-ink">
                        Give this 4-Digit Code to {booking.companion.name} in person:
                      </span>
                      <div className="font-mono text-5xl font-black tracking-widest text-ink select-all">
                        {booking.startCode}
                      </div>
                      <p className="text-[11px] font-bold text-ink-soft max-w-sm mx-auto">
                        Tell this code verbally when you meet at {booking.meetingPoint}. Once entered, the meetup officially begins and your payment remains safe.
                      </p>
                    </div>

                    {/* Logistics Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-extrabold text-ink">
                      <div className="rounded-xl border-brutal-sm bg-paper p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-ink-muted block">
                          📍 Public Venue
                        </span>
                        <span className="block">{booking.meetingPoint}</span>
                      </div>

                      <div className="rounded-xl border-brutal-sm bg-paper p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-ink-muted block">
                          ⏰ Date & Time
                        </span>
                        <span className="block">
                          {booking.date} at {booking.time} ({booking.duration})
                        </span>
                      </div>
                    </div>

                    {/* Emergency SOS & Support Trigger */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
                        <Lock className="h-4 w-4 text-emerald-600" />
                        <span>Protected Payment: {formatRupees(booking.escrowAmount)}</span>
                      </div>

                      <button
                        onClick={() => setShowSosModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border-brutal bg-danger px-4 py-2 font-display text-xs font-black text-white shadow-brutal-sm hover:bg-red-600 btn-press cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        <span>Emergency SOS</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="rounded-2xl border-brutal bg-white p-6 shadow-brutal space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-lg font-black text-ink">
                    Shameera · Gym Partner
                  </h3>
                  <p className="text-xs text-ink-muted">14 Nov 2026 · Hauz Khas, Delhi</p>
                </div>
                <Badge variant="lime" size="sm">
                  ✓ Completed & Reviewed (★ 5.0)
                </Badge>
              </div>
            </div>
          )}

          {activeTab === 'cancelled' && (
            <div className="rounded-2xl border-brutal bg-white p-8 text-center text-xs text-ink-muted">
              No cancelled or refunded bookings.
            </div>
          )}

          {/* SOS Modal Dialog */}
          {showSosModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal-lg space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-danger font-display text-lg font-black">
                  <ShieldAlert className="h-6 w-6" />
                  <span>Immediate Safety Escalation</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-ink-soft leading-relaxed">
                  If you feel unsafe or in danger, please exit the venue immediately and call emergency services.
                </p>

                <div className="space-y-2 pt-2">
                  <a
                    href="tel:112"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-brutal bg-danger p-3.5 font-display text-sm font-black text-white shadow-brutal btn-press"
                  >
                    <span>Dial Police Emergency 112 →</span>
                  </a>

                  <a
                    href="mailto:safety@made4togethr.com?subject=URGENT%20SAFETY%20INCIDENT"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-brutal bg-sunny p-3 font-display text-xs font-black text-ink shadow-brutal-sm btn-press"
                  >
                    <span>Alert 24/7 Togethr Safety Desk</span>
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowSosModal(false)}
                    className="text-xs font-extrabold text-ink-muted hover:underline"
                  >
                    Close & Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
