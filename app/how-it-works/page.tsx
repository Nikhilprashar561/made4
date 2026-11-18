import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Compass,
  CalendarCheck,
  Lock,
  MessageSquare,
  KeyRound,
  Star,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: "How It Works — 3 Simple Steps, Zero Awkwardness",
  description:
    "From 'anyone free?' to confirmed plans in minutes. Pick your vibe, request a public meetup, pay safely into escrow, and meet with a 4-digit code.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: 1,
      title: 'Find your person',
      desc: 'Browse verified local companions in your city. Filter by activity (gym, movies, coffee chats, food walks), languages, hourly rates, or same-day availability.',
      icon: Compass,
      color: 'bg-sunny',
    },
    {
      num: 2,
      title: 'Request a time & venue',
      desc: 'Choose your date, start time, duration (1–4 hours), and an approved public meeting point like a cafe, mall entrance, or gym lobby.',
      icon: CalendarCheck,
      color: 'bg-pink',
    },
    {
      num: 3,
      title: 'Pay safely into escrow',
      desc: 'Authorize payment via UPI, debit card, or net banking. Your funds are locked securely in our escrow vault and never released upfront.',
      icon: Lock,
      color: 'bg-lime',
    },
    {
      num: 4,
      title: 'Coordinate in private chat',
      desc: 'Once the host accepts, in-app messaging unlocks. Coordinate exact arrival details while keeping personal phone numbers completely confidential.',
      icon: MessageSquare,
      color: 'bg-lavender text-white',
    },
    {
      num: 5,
      title: 'Meet with a start code',
      desc: 'Show up at the public venue. Share your secret 4-digit start code with your companion to officially activate the meetup timer.',
      icon: KeyRound,
      color: 'bg-sky',
    },
    {
      num: 6,
      title: 'Confirm & review',
      desc: 'Once the meetup concludes, funds are released to the host wallet. Both parties leave an honest rating and review to keep the community trusted.',
      icon: Star,
      color: 'bg-mint',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="lime" size="md">
              Step-by-Step Guide
            </Badge>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-ink leading-tight">
              From “anyone free?” to <br />
              <span className="bg-sunny px-3 py-0.5 border-brutal rounded-xl shadow-brutal inline-block mt-1">
                plans in minutes.
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-ink-soft leading-relaxed">
              How meeting a verified host on Togethr works from initial discovery to safe completion in public venues.
            </p>
          </div>

          {/* 6-Step Visual Timeline */}
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center gap-6"
                >
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-brutal text-ink font-display text-2xl font-black shadow-brutal-sm ${step.color}`}
                  >
                    <Icon className="h-8 w-8 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-black uppercase text-ink-muted">
                        Step 0{step.num}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-black text-ink">
                      {step.title}
                    </h2>
                    <p className="font-body text-sm sm:text-base text-ink-soft leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refunds & Cancellations Policy Box */}
          <div className="rounded-3xl border-brutal bg-white p-8 sm:p-10 shadow-brutal space-y-6">
            <div className="flex items-center gap-2 text-lavender font-display text-sm font-black uppercase">
              <RotateCcw className="h-5 w-5" />
              <span>Refunds & Cancellation Policy</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">
              100% Risk-Free Escrow Protection
            </h2>

            <div className="space-y-3 font-body text-sm text-ink-soft leading-relaxed">
              <p>
                <strong>If a companion declines or does not respond within 4 hours:</strong> 100% of your funds are immediately refunded to your original payment method.
              </p>
              <p>
                <strong>If a companion cancels before the meetup:</strong> You receive an instant 100% full refund with zero deductions.
              </p>
              <p>
                <strong>If you cancel more than 4 hours before the meetup:</strong> You receive a 100% refund. Cancellations under 4 hours deduct a 20% convenience fee to compensate the host for reserved time.
              </p>
            </div>

            <div className="pt-4 border-t-brutal-sm flex flex-col sm:flex-row gap-3">
              <Link href="/explore">
                <Button variant="primary" size="lg">
                  <span>Browse Companions Now →</span>
                </Button>
              </Link>
              <Link href="/become-a-companion">
                <Button variant="outline" size="lg">
                  <span>Want to become a Host?</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
