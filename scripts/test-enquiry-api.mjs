/**
 * Local Integration Test Suite for SAAR Lead Delivery Pipeline.
 * Tests POST /api/enquiry against all required functional, security, and edge-case scenarios.
 */

import { handleEnquiryRequest } from '../src/lib/server/enquiry-handler.ts';
import { _resetRateLimitsForTesting } from '../src/lib/server/rate-limiter.ts';
import { _mockDispatchedEmails, formatNotificationHtml } from '../src/lib/server/email-provider.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

const baseDevEnv = {
  RESEND_API_KEY: 're_test_mock_api_key_123',
  ENQUIRY_RECIPIENT_EMAIL: 'test-inbox@saarbusiness.test',
  ENQUIRY_SENDER_EMAIL: 'notifications@saarbusiness.test',
  ENABLE_TEST_MOCK_DELIVERY: 'true',
  NODE_ENV: 'development',
};

let ipCounter = 1;

function createRequest(body, options = {}) {
  const method = options.method || 'POST';
  const headers = new Headers({
    'Content-Type': options.contentType !== undefined ? options.contentType : 'application/json',
    'Origin': 'https://saarbusiness.com',
    'cf-connecting-ip': options.ip || `10.0.${Math.floor(ipCounter / 250)}.${(ipCounter++) % 250 + 1}`,
    ...(options.headers || {}),
  });

  const reqInit = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD' && body !== undefined && body !== null) {
    reqInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new Request('https://saarbusiness.com/api/enquiry', reqInit);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('Running SAAR Lead Delivery Integration Tests');
  console.log('======================================================\n');

  _resetRateLimitsForTesting();

  // Test 1: Valid email-contact enquiry
  console.log('1. Valid email-contact enquiry:');
  const validEmailPayload = {
    name: 'Waseem Mansoori',
    contactMethod: 'email',
    email: 'waseem@example.com',
    location: 'South Delhi, Vasant Vihar',
    service: 'interior-design',
    message: 'We are looking to design a 3BHK luxury apartment with warm minimalist aesthetics.',
    acknowledgement: true,
    submissionId: 'sub-test-001-' + Date.now(),
  };
  const res1 = await handleEnquiryRequest(createRequest(validEmailPayload), baseDevEnv);
  const json1 = await res1.json();
  assert(res1.status === 200, 'Returns HTTP 200 OK');
  assert(json1.success === true, 'Response success is true');
  assert(typeof json1.reference === 'string' && json1.reference.startsWith('SR-'), 'Generates valid reference code');
  assert(json1.message === 'Your enquiry has been submitted.', 'Success message is factual and non-presumptuous');

  // Test 2: Valid phone-contact enquiry
  console.log('\n2. Valid phone-contact enquiry:');
  const validPhonePayload = {
    name: 'Rohit Sharma',
    contactMethod: 'phone',
    phone: '+91 98765 43210',
    location: 'Gurugram, Golf Course Road',
    service: 'turnkey-contracting',
    message: 'Need complete turnkey execution for our 4,000 sq ft duplex residence.',
    acknowledgement: true,
    submissionId: 'sub-test-002-' + Date.now(),
  };
  const res2 = await handleEnquiryRequest(createRequest(validPhonePayload), baseDevEnv);
  const json2 = await res2.json();
  assert(res2.status === 200, 'Returns HTTP 200 OK for valid phone contact');
  assert(json2.success === true, 'Phone enquiry succeeds');

  // Test 3: Planner enquiry with attached ProjectBriefV1
  console.log('\n3. Planner enquiry with attached ProjectBriefV1:');
  const plannerPayload = {
    name: 'Ananya Singhania',
    contactMethod: 'email',
    email: 'ananya@singhania.test',
    location: 'South Delhi, Jor Bagh',
    acknowledgement: true,
    submissionId: 'sub-test-003-' + Date.now(),
    projectBrief: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      space: {
        category: 'residential',
        categoryLabel: 'Residential',
        propertyType: 'independent_villa',
        propertyTypeLabel: 'Independent Villa / Bungalow',
      },
      requirements: {
        services: ['interior-design', 'turnkey-contracting'],
        serviceLabels: ['Interior Design & Space Planning', 'Turnkey Contracting & Execution'],
        isGuidanceOnly: false,
      },
      details: {
        locality: 'South Delhi, Jor Bagh',
        approximateArea: 6500,
        areaUnit: 'sq ft',
        stage: 'planning',
        stageLabel: 'Planning Stage',
      },
      preferences: {
        stylePreference: 'Warm Minimalist',
        budgetExpectation: '₹1Cr – ₹3Cr',
        desiredTiming: '3 to 6 Months',
        skipped: false,
      },
    },
  };
  const res3 = await handleEnquiryRequest(createRequest(plannerPayload), baseDevEnv);
  const json3 = await res3.json();
  assert(res3.status === 200, 'Returns HTTP 200 for planner brief enquiry');
  assert(json3.success === true, 'Planner enquiry succeeds without separate message');

  // Test 4: Missing required fields (e.g. missing name, email when email selected)
  console.log('\n4. Field validation & missing required fields:');
  const missingNamePayload = {
    contactMethod: 'email',
    email: 'valid@example.com',
    location: 'Noida',
    service: 'interior-design',
    message: 'Valid project message for validation testing.',
    acknowledgement: true,
    submissionId: 'sub-test-004a',
  };
  const res4a = await handleEnquiryRequest(createRequest(missingNamePayload), baseDevEnv);
  const json4a = await res4a.json();
  assert(res4a.status === 422, 'Returns HTTP 422 for missing name');
  assert(Boolean(json4a.fieldErrors?.name), 'Reports missing name error');

  const missingEmailPayload = {
    name: 'Waseem Mansoori',
    contactMethod: 'email',
    location: 'Noida',
    service: 'interior-design',
    message: 'Valid project message for validation testing.',
    acknowledgement: true,
    submissionId: 'sub-test-004b',
  };
  const res4b = await handleEnquiryRequest(createRequest(missingEmailPayload), baseDevEnv);
  const json4b = await res4b.json();
  assert(res4b.status === 422, 'Returns HTTP 422 for missing email when email preferred');
  assert(Boolean(json4b.fieldErrors?.email), 'Reports missing email error when email preferred');

  // Test 5: Invalid email syntax
  console.log('\n5. Invalid email syntax:');
  const badEmailPayload = {
    name: 'Test Visitor',
    contactMethod: 'email',
    email: 'not-an-email',
    location: 'Delhi',
    service: 'interior-design',
    message: 'Testing invalid email format verification.',
    acknowledgement: true,
    submissionId: 'sub-test-005',
  };
  const res5 = await handleEnquiryRequest(createRequest(badEmailPayload), baseDevEnv);
  const json5 = await res5.json();
  assert(res5.status === 422, 'Returns HTTP 422 for malformed email');
  assert(Boolean(json5.fieldErrors?.email), 'Field errors contain email error');

  // Test 6: Invalid phone syntax
  console.log('\n6. Invalid phone format:');
  const badPhonePayload = {
    name: 'Test Visitor',
    contactMethod: 'phone',
    phone: '123', // too short
    location: 'Delhi',
    service: 'interior-design',
    message: 'Testing short phone format rejection.',
    acknowledgement: true,
    submissionId: 'sub-test-006',
  };
  const res6 = await handleEnquiryRequest(createRequest(badPhonePayload), baseDevEnv);
  const json6 = await res6.json();
  assert(res6.status === 422, 'Returns HTTP 422 for invalid phone');
  assert(Boolean(json6.fieldErrors?.phone), 'Field errors contain phone error');

  // Test 7: Message too short when no brief attached
  console.log('\n7. Message too short without brief:');
  const shortMsgPayload = {
    name: 'Test Visitor',
    contactMethod: 'email',
    email: 'test@example.com',
    location: 'Delhi',
    service: 'interior-design',
    message: 'Short',
    acknowledgement: true,
    submissionId: 'sub-test-007',
  };
  const res7 = await handleEnquiryRequest(createRequest(shortMsgPayload), baseDevEnv);
  const json7 = await res7.json();
  assert(res7.status === 422, 'Returns HTTP 422 for message < 10 characters');
  assert(Boolean(json7.fieldErrors?.message), 'Identifies message error');

  // Test 8: Oversized payload (> 64KB)
  console.log('\n8. Oversized payload protection:');
  const hugeString = 'X'.repeat(70 * 1024);
  const oversizedPayload = {
    name: 'Test Oversize',
    contactMethod: 'email',
    email: 'test@example.com',
    location: 'Delhi',
    message: hugeString,
    acknowledgement: true,
    submissionId: 'sub-test-008',
  };
  const res8 = await handleEnquiryRequest(createRequest(oversizedPayload), baseDevEnv);
  assert(res8.status === 413, 'Returns HTTP 413 Payload Too Large');

  // Test 9: Honeypot submission rejection
  console.log('\n9. Honeypot anti-spam protection:');
  const spamPayload = {
    name: 'Spam Bot',
    contactMethod: 'email',
    email: 'bot@spam.com',
    location: 'Delhi',
    service: 'interior-design',
    message: 'Buy cheap watches now at spam-site.com!',
    acknowledgement: true,
    website_url: 'http://spam-link.example.com', // Filled honeypot
    submissionId: 'sub-test-009',
  };
  const res9 = await handleEnquiryRequest(createRequest(spamPayload), baseDevEnv);
  assert(res9.status === 400, 'Trapped honeypot submission rejected with HTTP 400');

  // Test 10: Unsupported brief version
  console.log('\n10. Unsupported brief version rejection:');
  const badBriefPayload = {
    name: 'Test User',
    contactMethod: 'email',
    email: 'test@example.com',
    location: 'Delhi',
    acknowledgement: true,
    submissionId: 'sub-test-010',
    projectBrief: {
      version: '99.0', // Unsupported version
      space: { category: 'residential', propertyType: 'villa' },
      requirements: { services: ['interior-design'] },
      details: { locality: 'Delhi', stage: 'planning' },
    },
  };
  const res10 = await handleEnquiryRequest(createRequest(badBriefPayload), baseDevEnv);
  assert(res10.status === 422, 'Rejects unsupported brief version with 422');

  // Test 11: Malformed JSON syntax
  console.log('\n11. Malformed JSON handling:');
  const res11 = await handleEnquiryRequest(createRequest('{ this is invalid json : ', { contentType: 'application/json' }), baseDevEnv);
  assert(res11.status === 400, 'Returns HTTP 400 for malformed JSON');

  // Test 12: Method guard (GET / PUT / DELETE)
  console.log('\n12. HTTP method guard:');
  const res12 = await handleEnquiryRequest(createRequest(null, { method: 'GET' }), baseDevEnv);
  assert(res12.status === 405, 'Rejects GET with HTTP 405 Method Not Allowed');

  // Test 13: Content-Type guard
  console.log('\n13. Content-Type guard:');
  const res13 = await handleEnquiryRequest(createRequest('hello text', { contentType: 'text/plain' }), baseDevEnv);
  assert(res13.status === 415, 'Rejects text/plain with HTTP 415 Unsupported Media Type');

  // Test 14: Unacknowledged terms (acknowledgement === false)
  console.log('\n14. Acknowledgement required:');
  const unackPayload = {
    name: 'Test Visitor',
    contactMethod: 'email',
    email: 'test@example.com',
    location: 'Delhi',
    service: 'interior-design',
    message: 'Valid project message here.',
    acknowledgement: false,
    submissionId: 'sub-test-014',
  };
  const res14 = await handleEnquiryRequest(createRequest(unackPayload), baseDevEnv);
  assert(res14.status === 422, 'Rejects unacknowledged submission with HTTP 422');

  // Test 15: Rate limiting enforcement
  console.log('\n15. Rate limiting:');
  const spamIp = '10.0.0.99';
  _resetRateLimitsForTesting();
  let rateLimitHit = false;
  for (let i = 0; i < 7; i++) {
    const p = {
      name: `Rate Test ${i}`,
      contactMethod: 'email',
      email: `test${i}@example.com`,
      location: 'Delhi',
      service: 'interior-design',
      message: 'Rate limit test message content.',
      acknowledgement: true,
      submissionId: `sub-rl-${i}`,
    };
    const r = await handleEnquiryRequest(createRequest(p, { ip: spamIp }), baseDevEnv);
    if (r.status === 429) {
      rateLimitHit = true;
      break;
    }
  }
  assert(rateLimitHit === true, 'Enforces rate limit and returns HTTP 429 Too Many Requests');

  // Test 16: Missing configuration in production fails closed
  console.log('\n16. Fail-closed on missing production configuration:');
  const prodEnvWithoutKeys = {
    ENABLE_TEST_MOCK_DELIVERY: 'false',
    NODE_ENV: 'production',
  };
  const res16 = await handleEnquiryRequest(createRequest(validEmailPayload, { ip: '127.0.0.9' }), prodEnvWithoutKeys);
  const json16 = await res16.json();
  assert(res16.status === 503, 'Returns HTTP 503 Service Unavailable when credentials missing in production');
  assert(json16.success === false, 'Reports failure without exposing internal variable names');

  // Test 17: HTML Escaping verification
  console.log('\n17. HTML escaping and XSS safety:');
  const htmlOutput = formatNotificationHtml(
    {
      name: '<script>alert("xss")</script>',
      contactMethod: 'email',
      email: 'safe@test.com',
      location: 'Delhi <img src=x onerror=alert(1)>',
      service: 'interior-design',
      message: '<b style="color:red">bold text</b> & "quotes"',
      acknowledgement: true,
      submissionId: 'test-escape',
    },
    'SR-TEST-001',
    new Date().toISOString()
  );
  assert(!htmlOutput.includes('<script>'), 'Script tags are escaped');
  assert(!htmlOutput.includes('<img src=x'), 'Image onerror tags are escaped');
  assert(htmlOutput.includes('&lt;script&gt;'), 'Script converted to &lt;script&gt;');
  assert(htmlOutput.includes('&amp;'), 'Ampersands are escaped');

  console.log('\n======================================================');
  console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
