import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Camera,
  Star,
  MapPin,
  Languages,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PriceSummary } from '@/components/booking/price-summary';
import { Badge } from '@/components/ui/badge';
import { COMPANIONS } from '@/lib/data/companions';
import { ACTIVITIES } from '@/lib/data/activities';
import type { Metadata } from 'next';

interface CompanionProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return COMPANIONS.map((comp) => ({
    id: comp.id,
  }));
}

export async function generateMetadata({ params }: CompanionProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const companion = COMPANIONS.find((c) => c.id === id);
  if (!companion) return { title: 'Companion Not Found' };

  return {
    title: `${companion.name}, ${companion.age} — Verified Companion in ${companion.area} (₹${companion.hourlyRate}/hr)`,
    description: `Book an ID-verified meetup with ${companion.name} in ${companion.area}. "${companion.tagline}" 100% platonic & escrow protected.`,
  };
}

export default async function CompanionProfilePage({ params }: CompanionProfilePageProps) {
  const { id } = await params;

  const companion = COMPANIONS.find((c) => c.id === id);
  if (!companion) {
    notFound();
  }

  const companionActivities = companion.activities
    .map((slug) => ACTIVITIES.find((a) => a.slug === slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back Link */}
          <div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 font-display text-xs font-black text-ink hover:text-lavender transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all companions</span>
            </Link>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Companion Details & Schedule */}
            <div className="lg:col-span-8 space-y-8">
              {/* Profile Header Card */}
              <div className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-2xl border-brutal bg-paper-deep shadow-brutal-sm">
                    <Image
                      src={companion.avatarUrl}
                      alt={companion.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Identity Info */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-3xl sm:text-4xl font-black text-ink">
                        {companion.name}
                      </h1>
                      <span className="font-display text-2xl font-bold text-ink-muted">
                        · {companion.age}
                      </span>

                      {companion.isFreeToday && (
                        <Badge variant="lime" size="sm">
                          🟢 Free Today
                        </Badge>
                      )}

                      {companion.acceptsWomenOnly && (
                        <Badge variant="pink" size="sm">
                          👩 Women Hosts Only
                        </Badge>
                      )}
                    </div>

                    <p className="font-display text-base sm:text-lg font-bold text-ink-soft leading-snug">
                      "{companion.tagline}"
                    </p>

                    {/* Verification Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {companion.verifiedId && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border-brutal-sm bg-lime px-2.5 py-1 text-xs font-black uppercase text-ink shadow-brutal-sm">
                          <ShieldCheck className="h-4 w-4" />
                          ID Verified
                        </span>
                      )}
                      {companion.verifiedPhoto && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border-brutal-sm bg-sunny px-2.5 py-1 text-xs font-black uppercase text-ink shadow-brutal-sm">
                          <Camera className="h-4 w-4" />
                          Live Selfie Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Attributes Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t-brutal-sm text-xs font-extrabold text-ink">
                  <div className="rounded-xl border-brutal-sm bg-paper p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">
                      📍 Area
                    </span>
                    <span className="truncate block">{companion.area}</span>
                  </div>

                  <div className="rounded-xl border-brutal-sm bg-paper p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">
                      🗣 Languages
                    </span>
                    <span className="truncate block">{companion.languages.join(', ')}</span>
                  </div>

                  <div className="rounded-xl border-brutal-sm bg-paper p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">
                      ★ Rating
                    </span>
                    <span className="block">
                      {companion.rating.toFixed(1)} ({companion.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="rounded-xl border-brutal-sm bg-paper p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">
                      🤝 Experience
                    </span>
                    <span className="block">{companion.meetupsCount} meetups done</span>
                  </div>
                </div>
              </div>

              {/* About & Boundaries */}
              <div className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal space-y-4">
                <h2 className="font-display text-2xl font-black text-ink">
                  About {companion.name}
                </h2>
                <p className="font-body text-sm sm:text-base leading-relaxed text-ink-soft whitespace-pre-line">
                  {companion.about}
                </p>

                {/* Activities Badges */}
                <div className="pt-4 border-t-brutal-sm space-y-2.5">
                  <span className="block font-display text-xs font-black uppercase tracking-wider text-ink-muted">
                    Open to these activities with you:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {companionActivities.map((act) => (
                      <Link
                        key={act!.slug}
                        href={`/explore/${act!.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border-brutal-sm bg-paper-deep px-3 py-1.5 font-display text-xs font-bold text-ink hover:bg-sunny btn-press transition-colors"
                      >
                        <span>{act!.emoji}</span>
                        <span>{act!.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Availability Schedule */}
              <div className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-ink" />
                  <h2 className="font-display text-2xl font-black text-ink">
                    Weekly Availability
                  </h2>
                </div>
                <p className="font-body text-xs text-ink-muted">
                  All times are in Indian Standard Time (IST). Public venues only.
                </p>

                <div className="divide-y-brutal-sm rounded-2xl border-brutal bg-paper-deep/30 overflow-hidden">
                  {companion.availability.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 sm:px-5 font-display text-xs sm:text-sm font-bold text-ink"
                    >
                      <span className="text-ink">{slot.days}</span>
                      <span className="font-mono bg-white px-2.5 py-1 rounded-md border-brutal-sm shadow-brutal-sm">
                        {slot.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="rounded-3xl border-brutal bg-white p-6 sm:p-8 shadow-brutal space-y-6">
                <div className="flex items-baseline justify-between border-b-brutal pb-4">
                  <h2 className="font-display text-2xl font-black text-ink">
                    Member Reviews ({companion.reviews.length})
                  </h2>
                  <div className="flex items-center gap-1 text-sm font-black text-ink">
                    <Star className="h-4 w-4 fill-ink" />
                    <span>{companion.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                {companion.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {companion.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl border-brutal-sm bg-paper/40 p-4 sm:p-5 space-y-2"
                      >
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-black text-ink">
                              {rev.authorName}
                            </span>
                            <span className="text-xs text-ink-muted">({rev.authorCity})</span>
                          </div>
                          <span className="text-xs font-mono text-ink-muted">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-ink-soft">
                            · {rev.activityName}
                          </span>
                        </div>

                        <p className="font-body text-xs sm:text-sm text-ink-soft leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">
                    No reviews yet. Be the first to book and rate {companion.name}!
                  </p>
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Sticky Price Calculator & Booking Trigger */}
            <div className="lg:col-span-4">
              <PriceSummary companion={companion} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
