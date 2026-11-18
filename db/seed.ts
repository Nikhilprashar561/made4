import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { COMPANIONS } from "../lib/data/companions";

async function runSeed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("🌱 Connecting to Neon PostgreSQL...");
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log("🧹 Clearing old seed data (if any)...");
  try {
    await db.delete(schema.reviews);
    await db.delete(schema.bookings);
    await db.delete(schema.companions);
  } catch (err) {
    console.log("No existing tables to clear or empty tables:", err);
  }

  console.log(`Inserting ${COMPANIONS.length} verified companions...`);

  for (const c of COMPANIONS) {
    await db.insert(schema.companions).values({
      id: c.id,
      name: c.name,
      age: c.age,
      gender: c.gender,
      city: c.city,
      area: c.area,
      tagline: c.tagline,
      about: c.about,
      avatarUrl: c.avatarUrl,
      languages: c.languages,
      hourlyRate: c.hourlyRate,
      verifiedId: c.verifiedId,
      verifiedPhoto: c.verifiedPhoto,
      rating: c.rating.toString(),
      reviewCount: c.reviewCount,
      meetupsCount: c.meetupsCount,
      activities: c.activities,
      isFreeToday: c.isFreeToday,
      isWeekendOnly: c.isWeekendOnly ?? false,
      acceptsWomenOnly: c.acceptsWomenOnly ?? false,
      memberSince: c.memberSince,
      availability: c.availability,
      aadhaarNumber: "XXXX-XXXX-8921",
      aadhaarImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      upiId: `${c.name.toLowerCase()}@okhdfcbank`,
    }).onConflictDoNothing();

    if (c.reviews && c.reviews.length > 0) {
      for (const r of c.reviews) {
        await db.insert(schema.reviews).values({
          id: r.id,
          companionId: c.id,
          authorName: r.authorName,
          authorCity: r.authorCity,
          rating: r.rating,
          date: r.date,
          activityName: r.activityName,
          comment: r.comment,
        }).onConflictDoNothing();
      }
    }
  }

  // Also insert a sample booking for member dashboard demonstration
  console.log("Inserting a sample active booking...");
  await db.insert(schema.bookings).values({
    id: "tog-book-sample-8891",
    companionId: "kashish-blr",
    memberName: "Rahul Sharma",
    memberPhone: "+91 98765 43210",
    memberEmail: "rahul.s@example.com",
    activitySlug: "coffee-chat",
    date: "Today, 18 Nov 2026",
    startTime: "17:00",
    durationHours: 2,
    meetingPoint: "Third Wave Coffee, 100ft Road, Indiranagar",
    note: "Discussing moving to Bangalore and tech startups in Indiranagar.",
    hourlyRate: 599,
    hostSubtotal: 1198,
    connectionFee: 149,
    gst: 27,
    totalPayable: 1374,
    startCode: "8492",
    status: "confirmed",
    paymentStatus: "paid_escrow",
    razorpayOrderId: "order_test_88912",
    razorpayPaymentId: "pay_test_99214",
    escrowReleased: false,
  }).onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
