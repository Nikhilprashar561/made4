import { pgTable, varchar, integer, boolean, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";

// --- 1. CORE USER IDENTITY ---
export const users = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(), // usr_...
  phone: varchar("phone", { length: 32 }).notNull().unique(), // 10-digit Indian mobile
  activeRole: varchar("active_role", { length: 32 }).default("member").notNull(), // 'member' | 'host' | 'admin'
  accountStatus: varchar("account_status", { length: 32 }).default("active").notNull(), // 'active' | 'suspended' | 'deleted'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// --- 2. MEMBER PROFILES ---
export const memberProfiles = pgTable("member_profiles", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  gender: varchar("gender", { length: 32 }).default("female"), // 'male' | 'female' | 'other'
  city: varchar("city", { length: 64 }).default("bengaluru"),
  area: varchar("area", { length: 128 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  emergencyContact: varchar("emergency_contact", { length: 32 }),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// --- 3. HOST PROFILES (COMPANIONS) ---
export const hostProfiles = pgTable("host_profiles", {
  id: varchar("id", { length: 128 }).primaryKey(), // matches companion slug e.g. kashish-blr
  userId: varchar("user_id", { length: 128 }).references(() => users.id, { onDelete: "cascade" }).unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 32 }).notNull(),
  city: varchar("city", { length: 64 }).notNull(),
  area: varchar("area", { length: 128 }).notNull(),
  tagline: text("tagline").notNull(),
  about: text("about").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  verificationStatus: varchar("verification_status", { length: 32 }).default("not_applied").notNull(), // 'not_applied' | 'pending' | 'approved' | 'rejected'
  verifiedId: boolean("verified_id").default(true),
  verifiedPhoto: boolean("verified_photo").default(true),
  isFreeToday: boolean("is_free_today").default(false),
  isWeekendOnly: boolean("is_weekend_only").default(false),
  acceptsWomenOnly: boolean("accepts_women_only").default(false),
  isActive: boolean("is_active").default(true),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  meetupsCount: integer("meetups_count").default(0),
  activities: jsonb("activities").$type<string[]>().notNull(),
  upiId: varchar("upi_id", { length: 128 }),
  walletBalance: integer("wallet_balance").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 4. OTP VERIFICATIONS ---
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id", { length: 128 }).primaryKey(),
  phone: varchar("phone", { length: 32 }).notNull(),
  otpHash: varchar("otp_hash", { length: 128 }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  consumed: boolean("consumed").default(false).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 5. REFRESH TOKENS (SESSION MANAGEMENT) ---
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 64 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 6. LEGACY / PUBLIC COMPANIONS CATALOGUE (Preserved for backwards compatibility) ---
export const companions = pgTable("companions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 32 }).notNull(),
  city: varchar("city", { length: 64 }).notNull(),
  area: varchar("area", { length: 128 }).notNull(),
  tagline: text("tagline").notNull(),
  about: text("about").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  verifiedId: boolean("verified_id").default(true),
  verifiedPhoto: boolean("verified_photo").default(true),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  meetupsCount: integer("meetups_count").default(0),
  activities: jsonb("activities").$type<string[]>().notNull(),
  isFreeToday: boolean("is_free_today").default(false),
  isWeekendOnly: boolean("is_weekend_only").default(false),
  acceptsWomenOnly: boolean("accepts_women_only").default(false),
  memberSince: varchar("member_since", { length: 64 }).default("November 2026"),
  availability: jsonb("availability").$type<{ days: string; hours: string }[]>(),
  aadhaarNumber: varchar("aadhaar_number", { length: 32 }),
  aadhaarImageUrl: text("aadhaar_image_url"),
  upiId: varchar("upi_id", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 7. REVIEWS ---
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 128 }).primaryKey(),
  companionId: varchar("companion_id", { length: 128 }).references(() => companions.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 128 }).notNull(),
  authorCity: varchar("author_city", { length: 64 }).notNull(),
  rating: integer("rating").notNull(),
  date: varchar("date", { length: 64 }).notNull(),
  activityName: varchar("activity_name", { length: 128 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 8. BOOKINGS ---
export const bookings = pgTable("bookings", {
  id: varchar("id", { length: 128 }).primaryKey(),
  companionId: varchar("companion_id", { length: 128 }).references(() => companions.id),
  memberId: varchar("member_id", { length: 128 }),
  memberName: varchar("member_name", { length: 128 }).notNull(),
  memberPhone: varchar("member_phone", { length: 32 }).notNull(),
  memberEmail: varchar("member_email", { length: 128 }),
  activitySlug: varchar("activity_slug", { length: 64 }).notNull(),
  date: varchar("date", { length: 64 }).notNull(),
  startTime: varchar("start_time", { length: 32 }).notNull(),
  durationHours: integer("duration_hours").notNull(),
  meetingPoint: text("meeting_point").notNull(),
  note: text("note"),
  hourlyRate: integer("hourly_rate").notNull(),
  hostSubtotal: integer("host_subtotal").notNull(),
  connectionFee: integer("connection_fee").notNull(),
  gst: integer("gst").notNull(),
  totalPayable: integer("total_payable").notNull(),
  startCode: varchar("start_code", { length: 8 }).notNull(),
  status: varchar("status", { length: 32 }).default("confirmed"), // confirmed, in_progress, completed, cancelled
  paymentStatus: varchar("payment_status", { length: 32 }).default("paid_escrow"), // pending, paid_escrow, refunded, released
  razorpayOrderId: varchar("razorpay_order_id", { length: 128 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 128 }),
  escrowReleased: boolean("escrow_released").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- 9. KYC SUBMISSIONS ---
export const kycSubmissions = pgTable("kyc_submissions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  companionId: varchar("companion_id", { length: 128 }),
  userId: varchar("user_id", { length: 128 }),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  aadhaarNumber: varchar("aadhaar_number", { length: 32 }).notNull(),
  aadhaarImage: text("aadhaar_image").notNull(),
  status: varchar("status", { length: 32 }).default("submitted"), // submitted, under_review, approved
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
});

// Infer types
export type UserRecord = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MemberProfileRecord = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;
export type HostProfileRecord = typeof hostProfiles.$inferSelect;
export type InsertHostProfile = typeof hostProfiles.$inferInsert;
export type OtpVerificationRecord = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;
export type RefreshTokenRecord = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type CompanionRecord = typeof companions.$inferSelect;
export type InsertCompanion = typeof companions.$inferInsert;
export type ReviewRecord = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type BookingRecord = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type KycSubmissionRecord = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = typeof kycSubmissions.$inferInsert;
