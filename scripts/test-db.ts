import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const url = process.env.DATABASE_URL;
  console.log("Connecting to:", url ? url.replace(/:[^:@]+@/, ":***@") : "NO URL");

  const sql = neon(url!);
  const db = drizzle(sql, { schema });

  // 1. Query companions
  const allCompanions = await db.select().from(schema.companions);
  console.log(`Found ${allCompanions.length} companions in Neon DB:`);
  allCompanions.forEach((c) => {
    console.log(`- [${c.id}] ${c.name} (${c.city}, ₹${c.hourlyRate}/hr) - rating: ${c.rating}`);
  });

  // 2. Query reviews
  const allReviews = await db.select().from(schema.reviews);
  console.log(`Found ${allReviews.length} reviews in Neon DB.`);

  // 3. Query bookings
  const allBookings = await db.select().from(schema.bookings);
  console.log(`Found ${allBookings.length} bookings in Neon DB.`);
  allBookings.forEach((b) => {
    console.log(`- Booking #${b.id}: ${b.memberName} with companion ${b.companionId} (${b.activitySlug}) - Start Code: ${b.startCode}`);
  });

  console.log("TEST SUCCESSFUL: Neon Postgres + Drizzle ORM is working end-to-end!");
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
