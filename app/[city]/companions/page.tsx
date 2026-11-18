import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CompanionCard } from '@/components/companion/companion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CITIES } from '@/lib/data/cities';
import { COMPANIONS } from '@/lib/data/companions';
import type { Metadata } from 'next';

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({
    city: c.slug,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const currentCity = CITIES.find((c) => c.slug === citySlug);
  if (!currentCity) return { title: 'City Not Found' };

  return {
    title: `Verified Local Companions in ${currentCity.name} — Gym, Movies & Coffee Buddies`,
    description: `Connect with ID-verified local buddies in ${currentCity.name} (${currentCity.popularAreas.slice(0, 3).join(', ')}). 100% platonic, escrow-safe companionship.`,
  };
}

export default async function CityCompanionsPage({ params }: CityPageProps) {
  const { city: citySlug } = await params;

  const currentCity = CITIES.find((c) => c.slug === citySlug);
  if (!currentCity) {
    notFound();
  }

  const cityCompanions = COMPANIONS.filter((c) => c.city === citySlug);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Back Navigation */}
          <div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 font-display text-xs font-black text-ink hover:text-lavender transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all cities</span>
            </Link>
          </div>

          {/* City Header Card */}
          <div className="rounded-3xl border-brutal bg-white p-8 sm:p-12 shadow-brutal-lg space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="lime" size="md">
                📍 {currentCity.name} Hub
              </Badge>
              <Badge variant="sunny" size="md">
                {currentCity.state}
              </Badge>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-ink">
              Verified Companions in {currentCity.name}
            </h1>

            <p className="font-body text-base sm:text-lg text-ink-soft max-w-2xl leading-relaxed">
              Find an ID-verified local buddy for coffee, gym sessions, movies, and city walks across {currentCity.name}. 100% platonic, escrow-protected, and verified via 4-digit start codes.
            </p>

            {/* Popular Neighborhoods Bar */}
            <div className="pt-4 border-t-brutal-sm space-y-2">
              <span className="block font-display text-xs font-black uppercase tracking-wider text-ink-muted">
                Popular Meetup Hubs in {currentCity.name}:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentCity.popularAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-lg border-brutal-sm bg-paper px-2.5 py-1 text-xs font-bold text-ink"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Companions in this City */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b-brutal pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink">
                Active Hosts in {currentCity.name}
              </h2>
              <span className="font-display text-xs font-black uppercase text-ink-muted">
                {cityCompanions.length} verified hosts
              </span>
            </div>

            {cityCompanions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityCompanions.map((comp) => (
                  <CompanionCard key={comp.id} companion={comp} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-brutal bg-white p-8 text-center space-y-3">
                <p className="font-display text-lg font-bold text-ink">
                  We are expanding! No active hosts live in {currentCity.name} today.
                </p>
                <Link href="/become-a-companion">
                  <Button variant="primary" size="sm">
                    Be the first host in {currentCity.name} →
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
