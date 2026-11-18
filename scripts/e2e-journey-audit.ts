import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

interface AuditFinding {
  id: string;
  category: string;
  page: string;
  role: 'Member' | 'Host' | 'Both';
  problem: string;
  impact: string;
  rootCause: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  solution: string;
  dependencies: string;
}

const findings: AuditFinding[] = [];

async function auditFlow() {
  console.log('========================================================================');
  console.log('🕵️‍♂️ DEEP PRODUCT, UX, ARCHITECTURE & END-TO-END JOURNEY AUDIT');
  console.log('========================================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // -------------------------------------------------------------------------
  // 1. AUDIT PUBLIC LANDING & DISCOVERY PAGES
  // -------------------------------------------------------------------------
  console.log('--- [1. AUDITING HOMEPAGE & DISCOVERY] ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();

  // Check 1.1: City Dropdown presence
  if (!homeHtml.includes('Bengaluru') || !homeHtml.includes('Delhi NCR')) {
    findings.push({
      id: 'DISC-01',
      category: 'Navigation & Information Architecture',
      page: '/',
      role: 'Both',
      problem: 'City selector missing prominent active city choices in initial server-rendered HTML.',
      impact: 'Users in non-Bengaluru cities might not know their city is supported.',
      rootCause: 'City selector dropdown is client-side state only.',
      severity: 'Low',
      solution: 'Ensure server-rendered cities strip or SSR pills for top cities.',
      dependencies: 'Frontend',
    });
  }

  // Check 1.2: Platonic Disclaimers
  const hasPlatonicDisclaimer = /100% Platonic Only/i.test(homeHtml);
  console.log(`  ✓ Homepage rendered (${homeHtml.length} bytes), Platonic disclaimer: ${hasPlatonicDisclaimer}`);

  // -------------------------------------------------------------------------
  // 2. AUDIT MEMBER JOURNEY (AUTHENTICATION & ONBOARDING)
  // -------------------------------------------------------------------------
  console.log('\n--- [2. AUDITING MEMBER JOURNEY] ---');
  const memberPhone = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  // 2.1: Request OTP
  const otpRes = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: memberPhone }),
  });
  const otpData = await otpRes.json();
  console.log(`  ✓ OTP Requested for +91 ${memberPhone}: ${otpData.success ? 'Success (OTP: ' + otpData.otp + ')' : 'Failed'}`);

  // 2.2: Verify OTP
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: memberPhone, otp: '7492' }),
  });
  const setCookie = verifyRes.headers.get('set-cookie') || '';
  const cookies = setCookie.split(',').map((c) => c.split(';')[0].trim()).join('; ');
  const verifyData = await verifyRes.json();
  console.log(`  ✓ OTP Verified: user ${verifyData.user?.id}, activeRole=${verifyData.user?.activeRole}, redirectTo=${verifyData.redirectTo}`);

  if (verifyData.redirectTo !== '/onboarding/member') {
    findings.push({
      id: 'AUTH-01',
      category: 'User Flow & Journey',
      page: '/login',
      role: 'Member',
      problem: 'New user with incomplete profile was not directed to /onboarding/member',
      impact: 'New users land on explore or profile without setting their name and gender.',
      rootCause: 'redirectTo logic did not check onboardingCompleted.',
      severity: 'High',
      solution: 'Enforce onboardingCompleted check before redirecting.',
      dependencies: 'Backend/API',
    });
  }

  // 2.3: Check protected route redirection without cookies
  const protectedBookingsRes = await fetch(`${BASE_URL}/bookings`, { redirect: 'manual' });
  console.log(`  ✓ Unauthenticated access to /bookings redirected with status: ${protectedBookingsRes.status}`);
  if (protectedBookingsRes.status !== 307 && protectedBookingsRes.status !== 302) {
    findings.push({
      id: 'SEC-01',
      category: 'Security & Authorization',
      page: '/bookings',
      role: 'Member',
      problem: 'Unauthenticated requests to /bookings do not redirect to /login',
      impact: 'Security hole allowing unauthenticated visitors into member portal.',
      rootCause: 'Middleware matcher missing or failing.',
      severity: 'Critical',
      solution: 'Ensure middleware protects /bookings and redirects to /login.',
      dependencies: 'Backend/Middleware',
    });
  }

  // 2.4: Authenticated Member Profile Fetch
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: cookies } });
  const meData = await meRes.json();
  console.log(`  ✓ Session verified via /api/auth/me: authenticated=${meData.isAuthenticated}, user=${meData.user?.phone}`);

  // 2.5: Member Onboarding Completion
  const onboardRes = await fetch(`${BASE_URL}/api/user/member-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      fullName: 'Aarav Sharma',
      gender: 'male',
      city: 'bengaluru',
      area: 'Koramangala',
      bio: 'Music enthusiast and coffee explorer',
      emergencyContact: '9811223344',
    }),
  });
  const onboardData = await onboardRes.json();
  console.log(`  ✓ Member Profile Saved: ${onboardData.memberProfile?.fullName} (${onboardData.memberProfile?.gender})`);

  // -------------------------------------------------------------------------
  // 3. AUDIT BOOKING FLOW AS LOGGED-IN MEMBER
  // -------------------------------------------------------------------------
  console.log('\n--- [3. AUDITING COMPANION BOOKING FLOW] ---');
  const { createBookingAction } = await import('../app/actions/booking');
  const bookingRes = await createBookingAction({
    companionId: 'kashish-blr',
    memberId: meData.user.id,
    memberName: 'Aarav Sharma',
    memberPhone: `+91 ${memberPhone}`,
    activitySlug: 'coffee-chat',
    date: '2026-11-25',
    startTime: '16:00 IST',
    durationHours: 2,
    meetingPoint: 'Starbucks, 80ft Road, Koramangala',
    hourlyRate: 599,
  });
  console.log(`  ✓ Booking Created: ID=${bookingRes.bookingId}, StartCode=${bookingRes.startCode}, Total=₹${bookingRes.totalPayable}`);

  // Check bookings retrieval for this member
  const { fetchLiveBookings } = await import('../app/actions/getBookings');
  const aaravBookings = await fetchLiveBookings({ memberId: meData.user.id });
  console.log(`  ✓ Member Bookings Count for Aarav: ${aaravBookings.length}`);
  if (aaravBookings.length === 0) {
    findings.push({
      id: 'BOOK-01',
      category: 'Member Experience',
      page: '/bookings',
      role: 'Member',
      problem: 'Newly created booking did not appear in member bookings query.',
      impact: 'Member places booking and sees empty bookings screen.',
      rootCause: 'memberId filter mismatch or unpersisted field.',
      severity: 'Critical',
      solution: 'Ensure createBookingAction writes memberId and query matches.',
      dependencies: 'Database/API',
    });
  }

  // -------------------------------------------------------------------------
  // 4. AUDIT HOST JOURNEY (APPLICATION, KYC & UPGRADE)
  // -------------------------------------------------------------------------
  console.log('\n--- [4. AUDITING HOST JOURNEY & DASHBOARD] ---');
  
  // 4.1: Member applies to Become a Host
  const upgradeRes = await fetch(`${BASE_URL}/api/companion/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      fullName: 'Aarav Sharma',
      dob: '1999-08-20',
      aadhaarNumber: '887766554433',
      aadhaarImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      upiId: 'aarav@okaxis',
    }),
  });
  const upgradeCookie = upgradeRes.headers.get('set-cookie') || '';
  const hostCookies = upgradeCookie ? upgradeCookie.split(',').map((c) => c.split(';')[0].trim()).join('; ') : cookies;
  const upgradeData = await upgradeRes.json();
  console.log(`  ✓ Host Upgrade Result: ${upgradeData.success ? 'Approved & Role upgraded to ' + upgradeData.user?.activeRole : 'Failed'}`);

  // 4.2: Verify host permissions to /companion/dashboard
  const hostDashRes = await fetch(`${BASE_URL}/api/companion/bookings`, {
    headers: { Cookie: hostCookies },
  });
  const hostDashData = await hostDashRes.json();
  console.log(`  ✓ Host Bookings API Response: ${hostDashRes.status} (bookings: ${hostDashData.bookings?.length})`);

  // 4.3: Test Code Verification by Host
  if (bookingRes.startCode) {
    const verifyCodeRes = await fetch(`${BASE_URL}/api/companion/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: hostCookies },
      body: JSON.stringify({ code: bookingRes.startCode }),
    });
    const verifyCodeData = await verifyCodeRes.json();
    console.log(`  ✓ In-Person Start Code Verification: ${verifyCodeData.success ? 'Verified! New Balance=₹' + verifyCodeData.newWalletBalance : 'Failed'}`);
  }

  // -------------------------------------------------------------------------
  // 5. AUDIT ROLE SWITCHING & DATA PERSISTENCE
  // -------------------------------------------------------------------------
  console.log('\n--- [5. AUDITING ROLE SWITCHING & PERSISTENCE] ---');
  const switchRoleRes = await fetch(`${BASE_URL}/api/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: hostCookies },
    body: JSON.stringify({ role: 'member' }),
  });
  const switchRoleData = await switchRoleRes.json();
  console.log(`  ✓ Switched Role to member: success=${switchRoleData.success}`);

  // Re-verify session
  const finalMeRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: hostCookies } });
  const finalMeData = await finalMeRes.json();
  console.log(`  ✓ Final Session State: role=${finalMeData.user?.activeRole}, hasMemberProfile=${!!finalMeData.memberProfile}, hasHostProfile=${!!finalMeData.hostProfile}`);

  // -------------------------------------------------------------------------
  // 6. VIEWPORT & RESPONSIVE CHECKS
  // -------------------------------------------------------------------------
  console.log('\n--- [6. AUDITING RESPONSIVE VIEWPORT DOM ATTRIBUTES] ---');
  const viewports = [320, 375, 425, 475, 768, 1024, 1440];
  const pagesToInspect = ['/', '/explore', '/companions/kashish-blr', '/book/kashish-blr', '/become-a-companion', '/how-it-works', '/safety'];

  for (const page of pagesToInspect) {
    const res = await fetch(`${BASE_URL}${page}`);
    const html = await res.text();

    // Check viewport meta tag
    if (!html.includes('width=device-width')) {
      findings.push({
        id: `RESP-VIEWPORT-${page.replace(/\//g, '_')}`,
        category: 'Responsive & Cross-Device',
        page,
        role: 'Both',
        problem: 'Missing standard responsive viewport meta tag',
        impact: 'Mobile browsers might render page zoomed out.',
        rootCause: 'Missing viewport configuration in layout/metadata.',
        severity: 'Critical',
        solution: 'Add viewport: { width: "device-width", initialScale: 1 } to metadata.',
        dependencies: 'Frontend',
      });
    }

    // Check for hardcoded fixed pixel widths (e.g. style="width: 1200px" or w-[1200px] without max-w)
    const fixedWidthMatch = html.match(/class="[^"]*(w-\[1[0-9]{3}px\]|min-w-\[[0-9]{3,4}px\])[^"]*"/g);
    if (fixedWidthMatch) {
      findings.push({
        id: `RESP-OVERFLOW-${page.replace(/\//g, '_')}`,
        category: 'Responsive & Cross-Device',
        page,
        role: 'Both',
        problem: `Potentially rigid width classes detected: ${fixedWidthMatch.slice(0, 2).join(', ')}`,
        impact: 'May trigger horizontal scroll on mobile viewports.',
        rootCause: 'Fixed width utility class.',
        severity: 'Medium',
        solution: 'Replace with max-w-* and w-full.',
        dependencies: 'Frontend',
      });
    }
  }

  console.log('\n========================================================================');
  console.log(`E2E JOURNEY AUDIT COMPLETE! Total issues flagged: ${findings.length}`);
  console.log('========================================================================\n');
  return findings;
}

auditFlow().catch(console.error);
