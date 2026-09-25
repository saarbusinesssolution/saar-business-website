/**
 * Hosted Runtime & Cloudflare Pages Verification Suite (Step 15)
 * Tests the live Cloudflare Pages runtime (wrangler pages dev) on http://127.0.0.1:8788
 */

import assert from 'node:assert';

const BASE_URL = process.env.STAGING_URL || 'http://127.0.0.1:8788';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(name, detail = '') {
  totalTests++;
  passedTests++;
  console.log(`  ✅ PASS: ${name}${detail ? ` (${detail})` : ''}`);
}

function fail(name, err) {
  totalTests++;
  failedTests++;
  console.error(`  ❌ FAIL: ${name}`);
  console.error(`     Reason: ${err.message || err}`);
}

async function testRoute(path, expectedStatus = 200, expectedHeader = null) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { redirect: 'manual' });
  assert.strictEqual(
    res.status,
    expectedStatus,
    `Expected HTTP ${expectedStatus} for ${path}, got ${res.status}`
  );
  if (expectedHeader) {
    for (const [hKey, hVal] of Object.entries(expectedHeader)) {
      const actual = res.headers.get(hKey);
      assert(
        actual && actual.toLowerCase().includes(hVal.toLowerCase()),
        `Header ${hKey} expected '${hVal}', got '${actual}'`
      );
    }
  }
  const text = await res.text();
  assert(text.length > 50, `Expected non-empty response body for ${path}`);
  return { res, text };
}

async function runHostedSuite() {
  console.log('======================================================');
  console.log(`Cloudflare Pages Runtime Verification (Step 15)`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log('======================================================\n');

  // 1. Core Public Routes
  console.log('1. Testing Core Public Routes on Cloudflare Pages...');
  const publicRoutes = [
    { path: '/', title: 'Saar Business Support Solution' },
    { path: '/services/', title: 'Architectural & Interior Services' },
    { path: '/services/interior-design/', title: 'Interior Design' },
    { path: '/services/turnkey-contracting/', title: 'Turnkey Contracting' },
    { path: '/projects/', title: 'Design Directions' },
    { path: '/projects/courtyard-minimalist-residence/', title: 'The Courtyard Pavilion' },
    { path: '/about/', title: 'About SAAR' },
    { path: '/process/', title: 'Our Process' },
    { path: '/plan-my-project/', title: 'Plan My Project' },
    { path: '/contact/', title: 'Contact' },
    { path: '/privacy/', title: 'Privacy Policy' },
  ];

  for (const route of publicRoutes) {
    try {
      const { text } = await testRoute(route.path, 200);
      assert(text.includes('<h1'), `Page ${route.path} missing <h1> element`);
      pass(`Route ${route.path} resolves HTTP 200 with valid content`);
    } catch (err) {
      fail(`Route ${route.path}`, err);
    }
  }

  // 2. Utility & Special Routes
  console.log('\n2. Testing Utility Routes & Security Headers...');
  try {
    const { res, text } = await testRoute('/thank-you/', 200, {
      'x-robots-tag': 'noindex, nofollow',
    });
    assert(text.includes('Consultation Coordination'), 'Thank-you page missing title');
    pass('/thank-you/ resolves HTTP 200 with X-Robots-Tag: noindex, nofollow');
  } catch (err) {
    fail('/thank-you/ header check', err);
  }

  try {
    const res = await fetch(`${BASE_URL}/nonexistent-route-testing-404`, { redirect: 'manual' });
    assert.strictEqual(res.status, 404, `Expected 404, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('Page Not Found') || text.includes('404'), '404 page content check');
    pass('Unknown route correctly returns HTTP 404 with custom error page');
  } catch (err) {
    fail('404 error page check', err);
  }

  // 3. Global Security Headers Verification
  console.log('\n3. Testing Global Edge Security Headers (_headers)...');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const xfo = res.headers.get('x-frame-options');
    const xcto = res.headers.get('x-content-type-options');
    const rp = res.headers.get('referrer-policy');
    const pp = res.headers.get('permissions-policy');

    assert.strictEqual(xfo, 'SAMEORIGIN', `X-Frame-Options mismatch: ${xfo}`);
    assert.strictEqual(xcto, 'nosniff', `X-Content-Type-Options mismatch: ${xcto}`);
    assert.strictEqual(rp, 'strict-origin-when-cross-origin', `Referrer-Policy mismatch: ${rp}`);
    assert(pp && pp.includes('camera=()'), `Permissions-Policy mismatch: ${pp}`);
    pass('Global security headers applied by Cloudflare Pages (_headers rules)');
  } catch (err) {
    fail('Global security headers check', err);
  }

  // 4. Static Asset Caching Headers
  console.log('\n4. Testing Static Asset Delivery & Caching...');
  try {
    const res = await fetch(`${BASE_URL}/images/hero/hero-architectural-main.webp`);
    assert.strictEqual(res.status, 200, `Asset expected 200, got ${res.status}`);
    const cc = res.headers.get('cache-control');
    assert(
      cc && cc.includes('max-age=31536000'),
      `Asset Cache-Control expected immutable, got: ${cc}`
    );
    pass('Static WebP asset delivered with long-term immutable caching');
  } catch (err) {
    fail('Static asset caching check', err);
  }

  // 5. Cloudflare Pages Functions (/api/enquiry)
  console.log('\n5. Testing Cloudflare Pages Functions (/api/enquiry)...');
  try {
    const optRes = await fetch(`${BASE_URL}/api/enquiry`, { method: 'OPTIONS' });
    assert.strictEqual(optRes.status, 204, `OPTIONS expected 204, got ${optRes.status}`);
    assert.strictEqual(
      optRes.headers.get('allow'),
      'POST, OPTIONS',
      'OPTIONS Allow header mismatch'
    );
    pass('OPTIONS /api/enquiry preflight returns HTTP 204');
  } catch (err) {
    fail('OPTIONS /api/enquiry', err);
  }

  try {
    const botPayload = {
      name: 'Spam Bot',
      contactMethod: 'email',
      email: 'bot@spam.com',
      location: 'New Delhi',
      service: 'interior-design',
      message: 'Spam content',
      website_url: 'http://malicious.com', // honeypot
      acknowledgement: true,
      submissionId: 'test-honeypot-sub-001',
    };
    const botRes = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '192.0.2.10',
      },
      body: JSON.stringify(botPayload),
    });
    assert.strictEqual(botRes.status, 400, `Expected 400 for honeypot, got ${botRes.status}`);
    const botData = await botRes.json();
    assert.strictEqual(botData.success, false, 'Expected success: false for spam');
    pass('POST /api/enquiry honeypot rejects spam with HTTP 400');
  } catch (err) {
    fail('Honeypot anti-spam check', err);
  }

  let generatedRefCode = '';
  try {
    const validPayload = {
      name: 'Hosted Verification Tester',
      contactMethod: 'email',
      email: 'verification@saarbusiness.test',
      phone: '+91 98765 43210',
      location: 'South Delhi, Vasant Vihar',
      service: 'interior-design',
      timeline: 'within_1_month',
      message: 'Cloudflare Pages runtime verification enquiry.',
      acknowledgement: true,
      submissionId: `sub-hosted-${Date.now()}`,
    };
    const validRes = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '192.0.2.20',
      },
      body: JSON.stringify(validPayload),
    });
    assert.strictEqual(validRes.status, 200, `Expected 200 for valid submission, got ${validRes.status}`);
    const validData = await validRes.json();
    assert.strictEqual(validData.success, true, 'Expected success: true');
    assert.strictEqual(validData.simulated, true, 'Expected simulated: true without Resend API key');
    assert(validData.reference && validData.reference.startsWith('SR-'), 'Expected valid SR- reference code');
    generatedRefCode = validData.reference;
    pass(`POST /api/enquiry successfully processed by Pages Functions (Ref: ${generatedRefCode}, Simulated: true)`);
  } catch (err) {
    fail('Valid enquiry submission via Pages Functions', err);
  }

  // 6. Performance Observations (TTFB & Latency)
  console.log('\n6. Measuring Hosted Page Latency & TTFB (Local Edge Simulation)...');
  const perfPages = ['/', '/services/interior-design/', '/projects/courtyard-minimalist-residence/', '/plan-my-project/', '/contact/'];
  for (const p of perfPages) {
    try {
      const start = performance.now();
      const res = await fetch(`${BASE_URL}${p}`);
      const ttfb = performance.now() - start;
      assert.strictEqual(res.status, 200);
      pass(`Page ${p} TTFB`, `${ttfb.toFixed(1)}ms`);
    } catch (err) {
      fail(`Page ${p} latency measurement`, err);
    }
  }

  // Final Summary
  console.log('\n======================================================');
  console.log(`Hosted Runtime Results: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${totalTests})`);
  console.log('======================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runHostedSuite().catch((err) => {
  console.error('Fatal error during hosted suite execution:', err);
  process.exit(1);
});
