import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.phone, '6239130326'))
    .limit(1);

  if (!user) {
    console.log('User 6239130326 not found.');
    return;
  }

  console.log('Found user:', user);

  const [member] = await db
    .select()
    .from(schema.memberProfiles)
    .where(eq(schema.memberProfiles.userId, user.id))
    .limit(1);

  const hostId = `host-${user.id}`;

  // 1. Link KYC submission
  await db
    .update(schema.kycSubmissions)
    .set({
      userId: user.id,
      companionId: hostId,
      status: 'approved',
    })
    .where(eq(schema.kycSubmissions.fullName, 'Nikhil'));

  // 2. Create Host Profile
  const [existingHost] = await db
    .select()
    .from(schema.hostProfiles)
    .where(eq(schema.hostProfiles.userId, user.id))
    .limit(1);

  if (!existingHost) {
    await db.insert(schema.hostProfiles).values({
      id: hostId,
      userId: user.id,
      displayName: 'Nikhil',
      age: 24,
      gender: 'male',
      city: 'chandigarh',
      area: 'Mohali',
      tagline: 'Friendly, respectful, and verified platonic companion in Chandigarh & Mohali',
      about: 'Verified platonic companion on Togethr. Available for gym sessions, coffee chats, movies, and city exploration.',
      avatarUrl: '/avatars/male.svg',
      languages: ['English', 'Hindi', 'Punjabi'],
      hourlyRate: 600,
      verificationStatus: 'approved',
      verifiedId: true,
      verifiedPhoto: true,
      isFreeToday: true,
      isWeekendOnly: false,
      acceptsWomenOnly: false,
      isActive: true,
      rating: '5.00',
      reviewCount: 0,
      meetupsCount: 0,
      activities: ['gym-partner', 'movie-buddy', 'coffee-chat', 'explore-city'],
      upiId: 'nikhil@okaxis',
      walletBalance: 0,
    });
    console.log('Created host profile for Nikhil:', hostId);
  }

  // 3. Upsert into public companions table
  const [existingCompanion] = await db
    .select()
    .from(schema.companions)
    .where(eq(schema.companions.id, hostId))
    .limit(1);

  if (!existingCompanion) {
    await db.insert(schema.companions).values({
      id: hostId,
      name: 'Nikhil',
      age: 24,
      gender: 'male',
      city: 'chandigarh',
      area: 'Mohali',
      tagline: 'Friendly, respectful, and verified platonic companion in Chandigarh & Mohali',
      about: 'Verified platonic companion on Togethr. Available for gym sessions, coffee chats, movies, and city exploration.',
      avatarUrl: '/avatars/male.svg',
      languages: ['English', 'Hindi', 'Punjabi'],
      hourlyRate: 600,
      verifiedId: true,
      verifiedPhoto: true,
      rating: '5.00',
      reviewCount: 0,
      meetupsCount: 0,
      activities: ['gym-partner', 'movie-buddy', 'coffee-chat', 'explore-city'],
      isFreeToday: true,
      isWeekendOnly: false,
      acceptsWomenOnly: false,
      memberSince: 'November 2026',
      availability: [
        { days: 'Mon — Fri', hours: '16:00 – 21:00' },
        { days: 'Sat — Sun', hours: '11:00 – 20:00' },
      ],
      aadhaarNumber: 'XXXX-XXXX-2875',
      aadhaarImageUrl: 'https://res.cloudinary.com/da9c3vejh/image/upload/v1795005877/made4togethr/kyc/qtcgraw4djj94s7ucfel.jpg',
      upiId: 'nikhil@okaxis',
    });
    console.log('Created companion catalogue row for Nikhil:', hostId);
  }

  // 4. Update user activeRole to host
  await db
    .update(schema.users)
    .set({ activeRole: 'host', updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));

  console.log('Successfully upgraded user activeRole to host!');
}

main().catch(console.error);
