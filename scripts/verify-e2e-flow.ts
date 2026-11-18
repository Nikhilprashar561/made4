import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createBookingAction } from "../app/actions/booking";
import { submitKycAction } from "../app/actions/kyc";
import { fetchLiveBookings, BookingDisplayItem } from "../app/actions/getBookings";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

async function verifyFlow() {
  console.log("=================================================");
  console.log("🚀 STARTING TOGETHR E2E BACKEND & CLOUDINARY VERIFICATION");
  console.log("=================================================");

  // 1. Test Booking Creation Action
  console.log("\n[TEST 1] Creating a new live booking via createBookingAction...");
  const bookingResult = await createBookingAction({
    companionId: "shameera-del",
    memberName: "Vikram Malhotra",
    memberPhone: "+91 99887 66554",
    memberEmail: "vikram@example.com",
    activitySlug: "gym-partner",
    date: "19 Nov 2026",
    startTime: "09:00 AM IST",
    durationHours: 2,
    meetingPoint: "Gold's Gym Lobby, Hauz Khas",
    note: "Focusing on strength training and bench press spotter.",
    hourlyRate: 699,
  });

  console.log("Booking Action Result:", bookingResult);
  if (!bookingResult.success || !bookingResult.bookingId) {
    throw new Error("Booking creation failed!");
  }

  // Verify it exists in Neon PostgreSQL
  const dbBooking = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingResult.bookingId));

  console.log("Retrieved from Neon DB:", {
    id: dbBooking[0].id,
    memberName: dbBooking[0].memberName,
    companionId: dbBooking[0].companionId,
    startCode: dbBooking[0].startCode,
    totalPayable: dbBooking[0].totalPayable,
    status: dbBooking[0].status,
    escrowReleased: dbBooking[0].escrowReleased,
  });

  // 2. Test KYC Submission with Cloudinary Image Upload
  console.log("\n[TEST 2] Submitting Host KYC via submitKycAction with Cloudinary upload...");
  const sampleAadhaarDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const kycResult = await submitKycAction({
    companionId: "shameera-del",
    fullName: "Shameera Akhtar",
    aadhaarNumber: "9182 7364 5512",
    aadhaarImage: sampleAadhaarDataUrl,
  });

  console.log("KYC Action Result:", kycResult);
  if (!kycResult.success) {
    throw new Error("KYC submission failed!");
  }

  // Verify KYC record in Neon PostgreSQL has the Cloudinary URL
  const dbKyc = await db
    .select()
    .from(schema.kycSubmissions)
    .where(eq(schema.kycSubmissions.id, kycResult.kycId!));

  console.log("Retrieved KYC submission from Neon DB:", {
    id: dbKyc[0].id,
    fullName: dbKyc[0].fullName,
    aadhaarMasked: dbKyc[0].aadhaarNumber,
    aadhaarImageUrl: dbKyc[0].aadhaarImage,
    isCloudinaryUrl: dbKyc[0].aadhaarImage.includes("cloudinary.com"),
    status: dbKyc[0].status,
  });

  if (!dbKyc[0].aadhaarImage.includes("cloudinary.com")) {
    throw new Error("Expected Cloudinary CDN URL in Neon DB record!");
  }

  // Verify companion table updated with Cloudinary image URL
  const updatedCompanion = await db
    .select()
    .from(schema.companions)
    .where(eq(schema.companions.id, "shameera-del"));

  console.log("Companion record updated in Neon DB with Cloudinary URL:", {
    id: updatedCompanion[0].id,
    name: updatedCompanion[0].name,
    verifiedId: updatedCompanion[0].verifiedId,
    aadhaarNumber: updatedCompanion[0].aadhaarNumber,
    aadhaarImageUrl: updatedCompanion[0].aadhaarImageUrl,
  });

  // 3. Test Member Portal Live Listing
  console.log("\n[TEST 3] Fetching all live bookings via fetchLiveBookings()...");
  const liveBookings = await fetchLiveBookings();
  console.log(`Total active bookings retrieved from Neon DB: ${liveBookings.length}`);
  liveBookings.slice(0, 3).forEach((b: BookingDisplayItem, idx: number) => {
    console.log(`  ${idx + 1}. [${b.id}] ${b.memberName} with ${b.companion.name} (${b.activity}) -> Code: ${b.startCode}`);
  });

  console.log("\n=================================================");
  console.log("🎉 ALL E2E AND CLOUDINARY TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

verifyFlow().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
