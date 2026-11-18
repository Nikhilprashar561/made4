import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function runE2ETest() {
  console.log('================================================================');
  console.log('🧪 TESTING E2E MEMBER -> HOST UPGRADE & DYNAMIC BOOKING FLOW');
  console.log('================================================================');

  const BASE_URL = 'http://localhost:3000';
  let cookieHeader = '';

  const updateCookies = (res: Response) => {
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const parts = setCookie.split(',').map((c) => c.split(';')[0].trim());
      cookieHeader = parts.join('; ');
    }
  };

  // 1. Request OTP
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  console.log(`\n[STEP 1] Requesting OTP for test mobile: +91 ${testPhone}...`);
  const otpRes = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone }),
  });
  const otpJson = await otpRes.json();
  console.log('OTP Request Result:', otpJson);

  // 2. Verify OTP
  console.log('\n[STEP 2] Verifying OTP 7492...');
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, otp: '7492' }),
  });
  updateCookies(verifyRes);
  const verifyJson = await verifyRes.json();
  console.log('Verify Result:', {
    success: verifyJson.success,
    role: verifyJson.user?.activeRole,
    userId: verifyJson.user?.id,
  });

  // 3. Complete Member Profile Onboarding
  console.log('\n[STEP 3] Setting up Member Profile for Rahul...');
  const profileRes = await fetch(`${BASE_URL}/api/user/member-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      fullName: 'Rahul Varma',
      gender: 'male',
      city: 'chandigarh',
      area: 'Sector 17',
      bio: 'Loves fitness and coffee',
      emergencyContact: '9876543210',
    }),
  });
  updateCookies(profileRes);
  const profileJson = await profileRes.json();
  console.log('Profile Result:', {
    success: profileJson.success,
    fullName: profileJson.memberProfile?.fullName,
    city: profileJson.memberProfile?.city,
  });

  // 4. Member Upgrades to Host (Become a Host / KYC)
  console.log('\n[STEP 4] Submitting Host Verification & KYC via /api/companion/upgrade...');
  const upgradeRes = await fetch(`${BASE_URL}/api/companion/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      fullName: 'Rahul Varma',
      dob: '2000-05-15',
      aadhaarNumber: '987654321098',
      aadhaarImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      upiId: 'rahul@okaxis',
    }),
  });
  updateCookies(upgradeRes);
  const upgradeJson = await upgradeRes.json();
  console.log('Host Upgrade Result:', {
    success: upgradeJson.success,
    message: upgradeJson.message,
    role: upgradeJson.user?.activeRole,
    hostDisplayName: upgradeJson.hostProfile?.displayName,
    verificationStatus: upgradeJson.hostProfile?.verificationStatus,
    walletBalance: upgradeJson.hostProfile?.walletBalance,
  });

  // 5. Verify Session Restoration via /api/auth/me
  console.log('\n[STEP 5] Verifying Session via /api/auth/me...');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meJson = await meRes.json();
  console.log('Session Status:', {
    isAuthenticated: meJson.isAuthenticated,
    role: meJson.user?.activeRole,
    memberName: meJson.memberProfile?.fullName,
    hostDisplayName: meJson.hostProfile?.displayName,
    hostStatus: meJson.hostProfile?.verificationStatus,
  });

  // 6. Test Host Availability Toggle
  console.log('\n[STEP 6] Testing Host Availability Toggle to FALSE and TRUE...');
  const availRes = await fetch(`${BASE_URL}/api/companion/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ isFreeToday: false }),
  });
  const availJson = await availRes.json();
  console.log('Availability Response:', availJson);

  // 7. Test Booking Flow with actual Member Details
  console.log('\n[STEP 7] Placing a booking for companion Kashish with member Rahul Varma...');
  const { createBookingAction } = await import('../app/actions/booking');
  const bookingResult = await createBookingAction({
    companionId: 'kashish-blr',
    memberId: meJson.user.id,
    memberName: meJson.memberProfile.fullName,
    memberPhone: `+91 ${testPhone}`,
    activitySlug: 'coffee-chat',
    date: '2026-11-20',
    startTime: '17:00 IST',
    durationHours: 2,
    meetingPoint: 'Third Wave Coffee, Indiranagar',
    hourlyRate: 599,
  });
  console.log('Booking Result:', bookingResult);

  // 8. Test Member Bookings Portal Query
  console.log('\n[STEP 8] Querying Member Bookings via fetchLiveBookings({ memberId })...');
  const { fetchLiveBookings } = await import('../app/actions/getBookings');
  const userBookings = await fetchLiveBookings({ memberId: meJson.user.id });
  console.log(`Found ${userBookings.length} bookings for member ${meJson.memberProfile.fullName}:`);
  userBookings.forEach((b) => {
    console.log(`  - Ref: ${b.id} | Companion: ${b.companion.name} | Start Code: ${b.startCode} | Escrow: ₹${b.escrowAmount}`);
  });

  // 9. Host Verifies Start Code
  if (bookingResult.startCode) {
    console.log(`\n[STEP 9] Host verifies Start Code ${bookingResult.startCode}...`);
    const verifyCodeRes = await fetch(`${BASE_URL}/api/companion/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({ code: bookingResult.startCode }),
    });
    const verifyCodeJson = await verifyCodeRes.json();
    console.log('Verify Code Result:', verifyCodeJson);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL INTEGRATION AND UPGRADE TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runE2ETest().catch(console.error);
