import http from 'http';

function fetchHtml(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function runDomAudit() {
  console.log('====================================================');
  console.log('🔬 STARTING DEEP DOM & HTML INTEGRITY AUDIT');
  console.log('====================================================\n');

  const tests = [
    {
      name: 'Homepage (/) Integrity',
      path: '/',
      checks: [
        { desc: 'Page title contains made4togethr/Togethr', test: (html: string) => /<title>.*(made4togethr|Togethr).*<\/title>/i.test(html) },
        { desc: 'Favicon is linked properly', test: (html: string) => html.includes('/favicon.ico') || html.includes('icon.png') },
        { desc: 'Wordmark / Logo is present', test: (html: string) => html.includes('logo.png') },
        { desc: 'Neo-Brutalist CSS classes present', test: (html: string) => html.includes('border-brutal') && html.includes('shadow-brutal') },
        { desc: 'Strictly Platonic disclaimer present', test: (html: string) => /platonic/i.test(html) },
        { desc: 'Hero CTA exists', test: (html: string) => html.includes('/explore') },
        { desc: 'Zero competitor domain leaks', test: (html: string) => !html.includes('trycompanio') && !html.includes('getcompanio') },
      ],
    },
    {
      name: 'Explore Page (/explore) Integrity',
      path: '/explore',
      checks: [
        { desc: 'Title mentions Verified Local Companions', test: (html: string) => /Companions/i.test(html) },
        { desc: 'Companion cards rendered', test: (html: string) => html.includes('/companions/') },
        { desc: 'Hourly pricing in Rupees visible', test: (html: string) => html.includes('₹') },
        { desc: 'City / Activity filter bar present', test: (html: string) => html.includes('Search by companion') || html.includes('All Cities') },
      ],
    },
    {
      name: 'Companion Profile (/companions/kashish-blr) Integrity',
      path: '/companions/kashish-blr',
      checks: [
        { desc: 'Companion name Kashish rendered', test: (html: string) => html.includes('Kashish') },
        { desc: 'Verification badges present', test: (html: string) => html.includes('ID Verified') },
        { desc: 'Price breakdown sidebar present', test: (html: string) => html.includes('Price Summary') || html.includes('Escrow') },
        { desc: 'Request Meetup CTA button present', test: (html: string) => html.includes('/book/kashish-blr') },
        { desc: 'Platonic safety rules highlighted', test: (html: string) => html.includes('Platonic') || html.includes('Public Venues Only') },
      ],
    },
    {
      name: 'Booking Wizard (/book/kashish-blr) Integrity',
      path: '/book/kashish-blr',
      checks: [
        { desc: 'Booking form rendered', test: (html: string) => html.includes('Book a Meetup') },
        { desc: 'Meeting point input exists', test: (html: string) => html.includes('Public Meeting Point') },
        { desc: 'Platonic checkbox agreement exists', test: (html: string) => html.includes('100% platonic') },
        { desc: 'Escrow Vault protection card exists', test: (html: string) => html.includes('Escrow Protection') },
      ],
    },
    {
      name: 'Host KYC Page (/companion/kyc) Integrity',
      path: '/companion/kyc',
      checks: [
        { desc: 'Aadhaar input field present', test: (html: string) => html.includes('Aadhaar') },
        { desc: '18+ age requirement stated', test: (html: string) => html.includes('18 years') },
        { desc: 'Host verification title present', test: (html: string) => html.includes('Verify your Host Profile') },
      ],
    },
    {
      name: 'Member Bookings Portal (/bookings) Integrity',
      path: '/bookings',
      checks: [
        { desc: 'Portal header rendered', test: (html: string) => html.includes('My Meetups') },
        { desc: '4-Digit Start Code box structure exists', test: (html: string) => html.includes('4-Digit Code') || html.includes('Secret') },
        { desc: 'Emergency SOS button exists', test: (html: string) => html.includes('Emergency SOS') },
        { desc: 'Active & Upcoming tab exists', test: (html: string) => html.includes('Active &amp; Upcoming') || html.includes('Active & Upcoming') },
      ],
    },
    {
      name: 'Safety & Trust Pages Integrity',
      path: '/safety',
      checks: [
        { desc: 'Safety measures detailed', test: (html: string) => html.includes('Safety') },
        { desc: 'Mutual 4-digit code explained', test: (html: string) => html.includes('4-digit') || html.includes('Code') },
        { desc: 'Zero Tolerance Platonic rule prominent', test: (html: string) => html.includes('Platonic') },
        { desc: 'Emergency police 112 mentioned', test: (html: string) => html.includes('112') },
      ],
    },
  ];

  let totalChecks = 0;
  let passedChecks = 0;

  for (const t of tests) {
    console.log(`Testing: ${t.name} (${t.path})`);
    try {
      const html = await fetchHtml(t.path);
      for (const check of t.checks) {
        totalChecks++;
        const passed = check.test(html);
        if (passed) {
          passedChecks++;
          console.log(`  ✓ ${check.desc}`);
        } else {
          console.error(`  ❌ FAILED: ${check.desc}`);
        }
      }
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${t.path}:`, err);
    }
    console.log('');
  }

  console.log('====================================================');
  console.log(`DOM AUDIT SUMMARY: ${passedChecks} / ${totalChecks} checks passed!`);
  console.log('====================================================');

  if (passedChecks !== totalChecks) {
    process.exit(1);
  }
}

runDomAudit();
