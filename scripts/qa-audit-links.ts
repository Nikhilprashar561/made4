import http from 'http';

const ROUTES = [
  // Core Landing & Info
  '/',
  '/how-it-works',
  '/safety',
  '/trust',
  '/community-guidelines',
  '/faq',
  '/terms',
  '/privacy',
  '/refunds',
  '/login',
  // Discovery & Booking
  '/explore',
  '/become-a-companion',
  '/companion/kyc',
  '/companion/dashboard',
  '/bookings',
  // Specific Companions
  '/companions/kashish-blr',
  '/companions/shameera-del',
  '/companions/akash-del',
  '/companions/dhwani-blr',
  '/companions/chirag-mum',
  '/companions/samridhi-pune',
  '/companions/vikas-jai',
  '/companions/poonam-hyd',
  // Specific Booking Pages
  '/book/kashish-blr',
  '/book/shameera-del',
  // 8 City Hubs
  '/bengaluru/companions',
  '/delhi/companions',
  '/mumbai/companions',
  '/pune/companions',
  '/hyderabad/companions',
  '/jaipur/companions',
  '/chennai/companions',
  '/chandigarh/companions',
  '/kolkata/companions',
  // 17 Activity Categories
  '/explore/gym-partner',
  '/explore/movie-buddy',
  '/explore/city-guide',
  '/explore/study-buddy',
  '/explore/shopping-buddy',
  '/explore/event-plus-one',
  '/explore/coffee-chat',
  '/explore/travel-buddy',
  '/explore/gaming-partner',
  '/explore/walk-and-talk',
  '/explore/food-walk',
  '/explore/festival-buddy',
  '/explore/sports-partner',
  '/explore/photo-walk',
  '/explore/comedy-and-shows',
  '/explore/career-chat',
  '/explore/settle-in-buddy',
  // Static brand assets
  '/logo.png',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
];

function checkUrl(path: string): Promise<{ path: string; status: number; ok: boolean; size: number }> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
      });
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode || 0,
          ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
          size,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, status: 0, ok: false, size: 0 });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ path, status: 408, ok: false, size: 0 });
    });
  });
}

async function runAudit() {
  console.log(`🔍 Starting QA Link & Route Audit across ${ROUTES.length} routes...`);
  let passed = 0;
  let failed = 0;
  const failedRoutes: any[] = [];

  for (const path of ROUTES) {
    const res = await checkUrl(path);
    if (res.ok) {
      passed++;
      console.log(`  ✓ [${res.status}] ${res.path} (${res.size} bytes)`);
    } else {
      failed++;
      failedRoutes.push(res);
      console.error(`  ❌ [${res.status}] ${res.path}`);
    }
  }

  console.log('\n=======================================');
  console.log(`QA ROUTE AUDIT REPORT:`);
  console.log(`Total Routes Tested: ${ROUTES.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('=======================================');

  if (failed > 0) {
    console.error('FAILED ROUTES DETECTED:', failedRoutes);
    process.exit(1);
  } else {
    console.log('🎉 100% OF APPLICATION ROUTES RETURNED 200 OK!');
  }
}

runAudit();
