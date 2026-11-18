import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CompanionCard } from '@/components/companion/companion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ACTIVITIES } from '@/lib/data/activities';
import { COMPANIONS } from '@/lib/data/companions';
import { ActivityCategory } from '@/lib/types';
import type { Metadata } from 'next';

interface ActivityPageProps {
  params: Promise<{
    activity: string;
  }>;
}

export async function generateStaticParams() {
  return ACTIVITIES.map((act) => ({
    activity: act.slug,
  }));
}

export async function generateMetadata({ params }: ActivityPageProps): Promise<Metadata> {
  const { activity: activitySlug } = await params;
  const currentActivity = ACTIVITIES.find((a) => a.slug === activitySlug);
  if (!currentActivity) return { title: 'Activity Not Found' };

  return {
    title: `Find a Verified ${currentActivity.name} in India — ${currentActivity.tagline}`,
    description: currentActivity.description,
  };
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { activity: activitySlug } = await params;

  const currentActivity = ACTIVITIES.find((a) => a.slug === activitySlug);
  if (!currentActivity) {
    notFound();
  }

  // Filter companions who offer this activity
  const relevantCompanions = COMPANIONS.filter((comp) =>
    comp.activities.includes(activitySlug as ActivityCategory)
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back Navigation */}
          <div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 font-display text-xs font-black text-ink hover:text-lavender transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all activities</span>
            </Link>
          </div>

          {/* Activity Hero Banner */}
          <div className="rounded-3xl border-brutal bg-white p-8 sm:p-12 shadow-brutal-lg space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl sm:text-5xl">{currentActivity.emoji}</span>
              <Badge variant="lime" size="md">
                Activity Hub
              </Badge>
              <Badge variant="sunny" size="md">
                100% Platonic
              </Badge>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-ink">
              {currentActivity.name}
            </h1>

            <p className="font-body text-base sm:text-xl text-ink-soft max-w-3xl leading-relaxed">
              {currentActivity.description}
            </p>

            {/* Safety & Protocol Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-brutal-sm">
              <div className="rounded-xl border-brutal-sm bg-paper p-3.5 space-y-1">
                <span className="block font-display text-xs font-black text-ink">
                  📍 Public Spaces Only
                </span>
                <p className="text-xs text-ink-soft">
                  Verified gyms, cafes, sports turfs, and public avenues.
                </p>
              </div>

              <div className="rounded-xl border-brutal-sm bg-paper p-3.5 space-y-1">
                <span className="block font-display text-xs font-black text-ink">
                  🔐 Escrow Protection
                </span>
                <p className="text-xs text-ink-soft">
                  Pay securely; funds release only after the session concludes.
                </p>
              </div>

              <div className="rounded-xl border-brutal-sm bg-paper p-3.5 space-y-1">
                <span className="block font-display text-xs font-black text-ink">
                  🔢 4-Digit Code
                </span>
                <p className="text-xs text-ink-soft">
                  Start code mutual verification required at venue.
                </p>
              </div>
            </div>
          </div>

          {/* Companions Offering this Activity */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b-brutal pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">
                Verified {currentActivity.name}s in India
              </h2>
              <span className="font-display text-xs font-black uppercase text-ink-muted">
                {relevantCompanions.length} hosts ready
              </span>
            </div>

            {relevantCompanions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relevantCompanions.map((comp) => (
                  <CompanionCard key={comp.id} companion={comp} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-brutal bg-white p-8 text-center space-y-3">
                <p className="font-display text-lg font-bold text-ink">
                  No hosts currently available specifically for {currentActivity.name}.
                </p>
                <Link href="/explore">
                  <Button variant="primary" size="sm">
                    Browse All Companions →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
