import { db } from "./index";
import * as schema from "./schema";
import { eq, desc } from "drizzle-orm";
import { Companion, Review, ActivityCategory } from "@/lib/types";
import { COMPANIONS } from "@/lib/data/companions";

export async function getDbCompanions(): Promise<Companion[]> {
  try {
    const rows = await db.select().from(schema.companions);
    if (!rows || rows.length === 0) {
      return COMPANIONS;
    }

    // Also fetch reviews for each
    const allReviews = await db.select().from(schema.reviews);

    return rows.map((row) => {
      const companionReviews = allReviews
        .filter((r) => r.companionId === row.id)
        .map((r): Review => ({
          id: r.id,
          authorName: r.authorName,
          authorCity: r.authorCity,
          rating: r.rating,
          date: r.date,
          activityName: r.activityName,
          comment: r.comment,
        }));

      return {
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender as 'female' | 'male' | 'non-binary',
        city: row.city,
        area: row.area,
        tagline: row.tagline,
        about: row.about,
        avatarUrl: row.avatarUrl,
        languages: (row.languages as string[]) || [],
        hourlyRate: row.hourlyRate,
        verifiedId: row.verifiedId ?? true,
        verifiedPhoto: row.verifiedPhoto ?? true,
        rating: row.rating ? parseFloat(row.rating) : 5.0,
        reviewCount: row.reviewCount ?? 0,
        meetupsCount: row.meetupsCount ?? 0,
        activities: (row.activities as ActivityCategory[]) || [],
        isFreeToday: row.isFreeToday ?? false,
        isWeekendOnly: row.isWeekendOnly ?? false,
        acceptsWomenOnly: row.acceptsWomenOnly ?? false,
        memberSince: row.memberSince || 'November 2026',
        availability: row.availability || [
          { days: 'Mon — Fri', hours: '16:00 – 21:00' },
          { days: 'Sat — Sun', hours: '11:00 – 20:00' },
        ],
        reviews: companionReviews,
      };
    });
  } catch (error) {
    console.error("Database query failed, falling back to static companions:", error);
    return COMPANIONS;
  }
}

export async function getDbCompanionById(id: string): Promise<Companion | null> {
  try {
    const rows = await db
      .select()
      .from(schema.companions)
      .where(eq(schema.companions.id, id))
      .limit(1);

    if (rows.length === 0) {
      return COMPANIONS.find((c) => c.id === id) || null;
    }

    const row = rows[0];
    const reviewsRows = await db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.companionId, id));

    const reviews: Review[] = reviewsRows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorCity: r.authorCity,
      rating: r.rating,
      date: r.date,
      activityName: r.activityName,
      comment: r.comment,
    }));

    return {
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender as 'female' | 'male' | 'non-binary',
      city: row.city,
      area: row.area,
      tagline: row.tagline,
      about: row.about,
      avatarUrl: row.avatarUrl,
      languages: (row.languages as string[]) || [],
      hourlyRate: row.hourlyRate,
      verifiedId: row.verifiedId ?? true,
      verifiedPhoto: row.verifiedPhoto ?? true,
      rating: row.rating ? parseFloat(row.rating) : 5.0,
      reviewCount: row.reviewCount ?? 0,
      meetupsCount: row.meetupsCount ?? 0,
      activities: (row.activities as ActivityCategory[]) || [],
      isFreeToday: row.isFreeToday ?? false,
      isWeekendOnly: row.isWeekendOnly ?? false,
      acceptsWomenOnly: row.acceptsWomenOnly ?? false,
      memberSince: row.memberSince || 'November 2026',
      availability: row.availability || [
        { days: 'Mon — Fri', hours: '16:00 – 21:00' },
        { days: 'Sat — Sun', hours: '11:00 – 20:00' },
      ],
      reviews,
    };
  } catch (error) {
    console.error(`Failed to fetch companion ${id} from database:`, error);
    return COMPANIONS.find((c) => c.id === id) || null;
  }
}

export async function getDbBookings() {
  try {
    return await db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt));
  } catch (error) {
    console.error("Failed to fetch bookings from database:", error);
    return [];
  }
}
