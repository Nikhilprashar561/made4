'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Lock,
  Compass,
  Smile,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion } from '@/components/ui/accordion';
import { CompanionCard } from '@/components/companion/companion-card';
import { ACTIVITIES } from '@/lib/data/activities';
import { COMPANIONS } from '@/lib/data/companions';
import { CITIES } from '@/lib/data/cities';

export default function HomePage() {
  const [heroCity, setHeroCity] = useState('bengaluru');
  const [heroActivity, setHeroActivity] = useState('all');

  const freeTodayCompanions = COMPANIONS.filter((c) => c.isFreeToday);
  const topRatedCompanions = COMPANIONS.slice(0, 6);

  const faqItems = [
    {
      id: 'faq-1',
      question: 'Is Togethr a dating or matchmaking app?',
      answer:
        'Absolutely NOT. Togethr is strictly for platonic, activity-based companionship. We exist to help you find a gym spotter, a movie buddy, a shopping guide, or a coffee companion. Any romantic advances, escorting requests, or inappropriate behavior result in an immediate permanent ban and forfeiture of escrow funds.',
    },
    {
      id: 'faq-2',
      question: 'How do Escrow Payments protect my money?',
      answer:
        'When you book a companion, your payment is held securely in our escrow vault. The companion is NOT paid until the meetup happens in person and you exchange the 4-digit start code. If the companion declines, cancels, or fails to show up, you receive an automated 100% refund immediately.',
    },
    {
      id: 'faq-3',
      question: 'What is the 4-Digit Start Code and how does it work?',
      answer:
        'When your booking is confirmed, a secret 4-digit numeric code is generated on your Togethr screen. When you meet your companion at the agreed public venue, you share this code with them. Once they enter it, the meetup timer officially activates. No code = no meetup = zero payment released.',
    },
    {
      id: 'faq-4',
      question: 'Where can meetups take place?',
      answer:
        'PUBLIC VENUES ONLY. Coffee shops, malls, public parks, gym franchises, metro lobbies, museums, or cultural venues. Private residences, hotel rooms, or secluded areas are strictly prohibited and will get your account flagged.',
    },
    {
      id: 'faq-5',
      question: 'How are companions verified?',
      answer:
        'Every single host submits a government ID (Aadhaar, Passport, or Voter ID) along with a real-time live selfie for facial comparison. Our human trust team reviews their background, phone number, and social profiles before approving their profile.',
    },
    {
      id: 'faq-6',
      question: 'Can women choose women-only companions?',
      answer:
        'Yes. We have a dedicated "Women Hosts for Women" filter. Female hosts have the autonomy to restrict bookings exclusively to verified female members for maximum comfort and peace of mind.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            SECTION 1: HERO
           ========================================================================= */}
        <section className="relative overflow-hidden border-b-brutal bg-paper pt-12 pb-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & Search */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border-brutal-sm bg-sunny px-3 py-1 font-display text-xs font-black text-ink shadow-brutal-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>The Anti-Dating App · 100% Platonic</span>
                </div>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-ink leading-[1.05]">
                  Find a buddy, <br />
                  <span className="bg-lime px-2 py-0.5 border-brutal rounded-xl shadow-brutal inline-block mt-1">
                    not a date.
                  </span>
                </h1>

                <p className="font-body text-base sm:text-xl text-ink-soft max-w-xl leading-relaxed">
                  Connect with verified local companions for the gym, movies, coffee chats, and city walks across India. Safe, public, and zero awkwardness.
                </p>

                {/* Hero Quick Search Bar */}
                <div className="rounded-2xl border-brutal bg-white p-3 sm:p-4 shadow-brutal-lg space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                  {/* City Select */}
                  <div className="sm:w-1/3">
                    <label className="block text-[10px] font-black uppercase text-ink-muted mb-1">
                      City
                    </label>
                    <select
                      value={heroCity}
                      onChange={(e) => setHeroCity(e.target.value)}
                      className="w-full rounded-xl border-brutal-sm bg-paper-deep px-3 py-2 text-xs font-extrabold text-ink focus:outline-none"
                    >
                      {CITIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Activity Select */}
                  <div className="sm:w-1/3">
                    <label className="block text-[10px] font-black uppercase text-ink-muted mb-1">
                      Activity
                    </label>
                    <select
                      value={heroActivity}
                      onChange={(e) => setHeroActivity(e.target.value)}
                      className="w-full rounded-xl border-brutal-sm bg-paper-deep px-3 py-2 text-xs font-extrabold text-ink focus:outline-none"
                    >
                      <option value="all">Any Activity</option>
                      {ACTIVITIES.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.emoji} {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CTA Button */}
                  <div className="sm:w-1/3 sm:self-end">
                    <Link
                      href={`/explore?city=${heroCity}&activity=${heroActivity}`}
                      className="block w-full"
                    >
                      <Button variant="primary" size="md" fullWidth>
                        <span>Find Company →</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-extrabold text-ink">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>ID & Live Selfie Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Escrow Payment Vault</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>4-Digit Start Code</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Stacked Neo-Brutalist Preview Cards */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-sm">
                  {/* Backdrop Offset Card */}
                  <div className="absolute inset-0 rounded-2xl border-brutal bg-pink -rotate-3 translate-x-2 translate-y-3 shadow-brutal" />

                  {/* Top Featured Companion Card */}
                  <div className="relative rounded-2xl border-brutal bg-white p-5 shadow-brutal-lg rotate-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="lime" size="sm">
                        🟢 Free in 2 hours
                      </Badge>
                      <span className="font-display text-xs font-black text-ink-muted">
                        📍 Indiranagar, BLR
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-brutal bg-paper-deep">
                        <Image
                          src={COMPANIONS[0].avatarUrl}
                          alt={COMPANIONS[0].name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-black text-ink">
                          {COMPANIONS[0].name} · {COMPANIONS[0].age}
                        </h3>
                        <p className="text-xs font-bold text-ink-soft">
                          Design Student & Indie Music Fan
                        </p>
                        <div className="mt-1 flex gap-1">
                          <Badge variant="sunny" size="sm">
                            🛍️ Shopping
                          </Badge>
                          <Badge variant="paper" size="sm">
                            ☕ Coffee
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border-brutal-sm bg-paper/60 p-3 text-xs font-medium text-ink-soft leading-relaxed italic">
                      "I'm the plus-one who talks effortlessly to your colleagues and leaves before things get awkward."
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t-brutal-sm">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-ink-muted block">
                          Hourly Rate
                        </span>
                        <span className="font-display text-lg font-black text-ink">₹599 /hr</span>
                      </div>
                      <Link href={`/companions/${COMPANIONS[0].id}`}>
                        <Button variant="primary" size="sm">
                          View Kashish →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: 🟢 FREE TODAY LIVE CAROUSEL
           ========================================================================= */}
        <section className="border-b-brutal bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md border-brutal-sm bg-lime px-2.5 py-0.5 text-xs font-black uppercase text-ink shadow-brutal-sm mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Real-Time Availability</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-ink">
                  🟢 Free today in your city
                </h2>
                <p className="font-body text-sm text-ink-soft mt-1">
                  Need plans for later today? These verified hosts have open slots right now.
                </p>
              </div>

              <Link href="/explore?freeToday=true">
                <Button variant="outline" size="sm">
                  <span>See all {freeTodayCompanions.length} hosts →</span>
                </Button>
              </Link>
            </div>

            {/* Grid of Free Today Hosts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeTodayCompanions.slice(0, 3).map((comp) => (
                <CompanionCard key={comp.id} companion={comp} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: WHAT ARE WE DOING TODAY? (17 ACTIVITIES)
           ========================================================================= */}
        <section className="border-b-brutal bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <Badge variant="sunny" size="md">
                17 Approved Activities
              </Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                What are we doing today?
              </h2>
              <p className="font-body text-sm sm:text-base text-ink-soft">
                Everything is better with good company. Pick an activity and find a buddy ready to show up.
              </p>
            </div>

            {/* Activity Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACTIVITIES.map((act) => (
                <Link
                  key={act.slug}
                  href={`/explore/${act.slug}`}
                  className="group rounded-2xl border-brutal bg-white p-4 sm:p-5 shadow-brutal hover:shadow-brutal-lg transition-all btn-press flex flex-col justify-between"
                  style={{ backgroundColor: act.bgHex === '#FFF8EE' ? '#FFFFFF' : '#FFFFFF' }}
                >
                  <div>
                    <span className="text-3xl sm:text-4xl block mb-3 group-hover:scale-110 transition-transform">
                      {act.emoji}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-black text-ink">
                      {act.name}
                    </h3>
                    <p className="font-body text-xs text-ink-soft mt-1 line-clamp-2">
                      {act.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t-brutal-sm flex items-center justify-between text-xs font-black text-ink">
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: THREE STEPS. ZERO AWKWARD.
           ========================================================================= */}
        <section className="border-b-brutal bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <Badge variant="lime" size="md">
                How It Works
              </Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                Three steps. Zero awkward.
              </h2>
              <p className="font-body text-sm sm:text-base text-ink-soft">
                From "anyone free?" to confirmed plans in minutes. Transparent, safe, and mutually respectful.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="rounded-2xl border-brutal bg-sunny p-6 sm:p-8 shadow-brutal space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-white text-ink font-display text-2xl font-black shadow-brutal-sm">
                  1
                </div>
                <h3 className="font-display text-2xl font-black text-ink">Pick your vibe</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Browse reviewed companion profiles in your city. Filter by activity, languages, hourly rate, and availability schedule.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border-brutal bg-pink p-6 sm:p-8 shadow-brutal space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-white text-ink font-display text-2xl font-black shadow-brutal-sm">
                  2
                </div>
                <h3 className="font-display text-2xl font-black text-ink">Request & escrow pay</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Select your date, time, and public meeting spot. Pay safely into escrow. Funds are locked and never released until the meetup happens.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border-brutal bg-lime p-6 sm:p-8 shadow-brutal space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-white text-ink font-display text-2xl font-black shadow-brutal-sm">
                  3
                </div>
                <h3 className="font-display text-2xl font-black text-ink">Meet with a code</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Meet in a public venue. Share your secret 4-digit start code to activate the session. Enjoy great company, rate, and repeat!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: TOP-RATED COMPANIONS SHOWCASE
           ========================================================================= */}
        <section className="border-b-brutal bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <Badge variant="pink" size="md" className="mb-2">
                  Community Favorites
                </Badge>
                <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                  Top-rated this week
                </h2>
                <p className="font-body text-sm sm:text-base text-ink-soft mt-1">
                  ID-checked, reviewed by verified members, and ready to hang out.
                </p>
              </div>

              <Link href="/explore">
                <Button variant="dark" size="md">
                  <span>Browse All Companions →</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedCompanions.map((comp) => (
                <CompanionCard key={comp.id} companion={comp} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: BUILT SO EVERYONE FEELS SAFE SHOWING UP
           ========================================================================= */}
        <section className="border-b-brutal bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <Badge variant="lavender" size="md">
                Trust & Verification
              </Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                Built so everyone feels safe showing up.
              </h2>
              <p className="font-body text-sm sm:text-base text-ink-soft">
                Safety is not an add-on feature. It is the very foundation of Togethr.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-lime text-ink shadow-brutal-sm">
                  <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">ID + Live Selfie Checked</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Every host must submit a government ID and a live facial video selfie. No anonymous accounts, no catfish.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-sunny text-ink shadow-brutal-sm">
                  <Lock className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">Escrow Payment Vault</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Companions are never paid upfront. Your funds sit safely in escrow until the meetup is mutually completed.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-pink text-ink shadow-brutal-sm">
                  <KeyRound className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">4-Digit Start Codes</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  You hold the 4-digit code. Hand it over only once you are standing face-to-face at the public meetup spot.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-lavender text-white shadow-brutal-sm">
                  <MapPin className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">Public Places Only</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Strictly cafes, malls, gyms, museums, or metro hubs. Private homes or hotel rooms trigger an instant permanent ban.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-danger text-white shadow-brutal-sm">
                  <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">1-Tap Live SOS</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Real-time live location sharing with emergency contacts and direct priority escalation to 112 police services.
                </p>
              </div>

              {/* Pillar 6 */}
              <div className="rounded-2xl border-brutal bg-paper p-6 shadow-brutal space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-brutal bg-mint text-ink shadow-brutal-sm">
                  <Users className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-display text-xl font-black text-ink">Strictly Platonic</h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  Zero romance, zero escorting. Our community guidelines are enforced 24/7 with zero tolerance for misconduct.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: HOST RECRUITMENT BANNER
           ========================================================================= */}
        <section className="border-b-brutal bg-sunny py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border-brutal bg-white p-8 sm:p-12 shadow-brutal-lg text-center space-y-6">
              <Badge variant="lime" size="md">
                Earn with Togethr
              </Badge>

              <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                Good company is a skill. <br />
                <span className="bg-sunny px-2 py-0.5 border-brutal-sm rounded-lg">
                  Get paid for it.
                </span>
              </h2>

              <p className="font-body text-base sm:text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
                Set your own hourly rate (₹400–₹800/hr), choose your schedule, meet respectful people for gym, movies, or cafe chats, and withdraw instantly to UPI.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/become-a-companion">
                  <Button variant="primary" size="lg">
                    <span>Apply to Become a Host →</span>
                  </Button>
                </Link>

                <Link href="/how-it-works">
                  <Button variant="outline" size="lg">
                    <span>Learn How Payouts Work</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: QUESTIONS, ANSWERED (ACCORDION)
           ========================================================================= */}
        <section className="py-16 sm:py-20 bg-paper">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <Badge variant="paper" size="md">
                Clarity First
              </Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-ink">
                Questions, answered
              </h2>
              <p className="font-body text-sm sm:text-base text-ink-soft">
                Everything you need to know about safety, escrow, and meetup rules.
              </p>
            </div>

            <Accordion items={faqItems} />

            <div className="text-center pt-4">
              <Link href="/faq" className="font-display text-sm font-extrabold text-lavender underline">
                Have more questions? Read our full FAQ directory →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
