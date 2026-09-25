import fs from 'node:fs';
import path from 'node:path';
import { handleEnquiryRequest } from '../src/lib/server/enquiry-handler.ts';
import { formatBriefText } from '../src/lib/planner/summary.ts';
import { projectBriefSchema } from '../src/lib/validation/enquiry.ts';
import { _resetRateLimitsForTesting } from '../src/lib/server/rate-limiter.ts';

const DIST_DIR = path.resolve('dist');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('======================================================');
console.log('SAAR End-to-End Visitor Journey Verification (Step 14)');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// JOURNEY A: Service-Led Enquiry Flow
// -----------------------------------------------------------------------------
console.log('1. Testing Journey A: Service-Led Discovery to Consultation...');
{
  // Step 1: Homepage links to services
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
  assert(homeHtml.includes('href="/services/"'), 'Journey A.1: Homepage contains link to Services overview');

  // Step 2: Services page displays published services
  const servicesHtml = fs.readFileSync(path.join(DIST_DIR, 'services/index.html'), 'utf-8');
  assert(
    servicesHtml.includes('href="/services/interior-design/"'),
    'Journey A.2: Services overview links to Interior Design detail'
  );
  assert(
    servicesHtml.includes('href="/services/turnkey-contracting/"'),
    'Journey A.2: Services overview links to Turnkey Contracting detail'
  );

  // Step 3: Service detail page provides complete deliverables and enquiry action
  const interiorHtml = fs.readFileSync(path.join(DIST_DIR, 'services/interior-design/index.html'), 'utf-8');
  assert(interiorHtml.includes('href="#enquire"'), 'Journey A.3: Interior Design page has #enquire action');
  assert(interiorHtml.includes('id="enquire"'), 'Journey A.3: #enquire target anchor exists on page');
  assert(
    interiorHtml.includes('data-service-id="interior-design"'),
    'Journey A.4: Service view tracking hook data-service-id is present'
  );
}

// -----------------------------------------------------------------------------
// JOURNEY B: Project-Led Enquiry Flow
// -----------------------------------------------------------------------------
console.log('\n2. Testing Journey B: Project Case Study to Enquiry...');
{
  // Step 1: Projects page links to published case study
  const projectsHtml = fs.readFileSync(path.join(DIST_DIR, 'projects/index.html'), 'utf-8');
  assert(
    projectsHtml.includes('href="/projects/courtyard-minimalist-residence/"'),
    'Journey B.1: Projects overview links to published concept case study'
  );

  // Step 2: Project detail page renders lightbox gallery and consultation hook
  const projectHtml = fs.readFileSync(
    path.join(DIST_DIR, 'projects/courtyard-minimalist-residence/index.html'),
    'utf-8'
  );
  assert(projectHtml.includes('id="gallery-lightbox"'), 'Journey B.2: Project detail embeds native <dialog> lightbox');
  assert(projectHtml.includes('data-lightbox-trigger'), 'Journey B.2: Project detail has lightbox thumbnail triggers');
  assert(projectHtml.includes('href="#enquire"'), 'Journey B.3: Project detail has #enquire consultation action');
  assert(projectHtml.includes('id="enquire"'), 'Journey B.3: #enquire target section exists');
  assert(
    projectHtml.includes('data-project-id="courtyard-minimalist-residence"'),
    'Journey B.4: Project view tracking hook data-project-id is present'
  );
}

// -----------------------------------------------------------------------------
// JOURNEY C: Guided Project Planning Flow
// -----------------------------------------------------------------------------
console.log('\n3. Testing Journey C: Project Planning, Summary & Submission Handoff...');
{
  const plannerHtml = fs.readFileSync(path.join(DIST_DIR, 'plan-my-project/index.html'), 'utf-8');

  // Verify all 5 steps exist in the DOM
  assert(plannerHtml.includes('id="step-1"'), 'Journey C.1: Stage 1 (Space Typology) exists');
  assert(plannerHtml.includes('id="step-2"'), 'Journey C.1: Stage 2 (Services Scope) exists');
  assert(plannerHtml.includes('id="step-3"'), 'Journey C.1: Stage 3 (Location & Area) exists');
  assert(plannerHtml.includes('id="step-4"'), 'Journey C.1: Stage 4 (Preferences & Budget) exists');
  assert(plannerHtml.includes('id="step-5"'), 'Journey C.1: Stage 5 (Review & Handoff) exists');

  // Verify jump-to-edit actions
  assert(plannerHtml.includes('data-target-step="1"'), 'Journey C.2: Jump-to-edit for Step 1 exists in review');
  assert(plannerHtml.includes('data-target-step="2"'), 'Journey C.2: Jump-to-edit for Step 2 exists in review');
  assert(plannerHtml.includes('data-target-step="3"'), 'Journey C.2: Jump-to-edit for Step 3 exists in review');
  assert(plannerHtml.includes('data-target-step="4"'), 'Journey C.2: Jump-to-edit for Step 4 exists in review');

  // Test summary text generator with realistic brief
  const sampleBrief = {
    version: '1.0',
    timestamp: '2026-09-25T14:30:00.000Z',
    space: {
      category: 'residential',
      categoryLabel: 'Residential Space',
      propertyType: 'villa',
      propertyTypeLabel: 'Private Villa / Bungalow',
    },
    requirements: {
      services: ['interior-design', 'turnkey-contracting'],
      serviceLabels: ['Interior Design & Spatial Planning', 'Turnkey Contracting & Execution'],
    },
    details: {
      locality: 'South Delhi (Greater Kailash)',
      approximateArea: 3500,
      areaUnit: 'sq ft',
      stage: 'planning',
      stageLabel: 'Planning & Brief Formulation',
    },
    preferences: {
      stylePreference: 'Warm Minimalist',
      budgetExpectation: '50L_1Cr',
      desiredTiming: '3_6_months',
    },
  };

  const validationResult = projectBriefSchema.safeParse(sampleBrief);
  assert(validationResult.success, 'Journey C.3: Sample planner brief validates against projectBriefSchema');

  const summaryText = formatBriefText(sampleBrief);
  assert(summaryText.includes('SAAR BUSINESS SUPPORT SOLUTION'), 'Journey C.4: Summary text contains title header');
  assert(summaryText.includes('South Delhi (Greater Kailash)'), 'Journey C.4: Summary text includes locality');
  assert(summaryText.includes('3500 sq ft'), 'Journey C.4: Summary text formats area correctly');
  assert(summaryText.includes('IMPORTANT NOTICE & SCOPE DISCLAIMER'), 'Journey C.5: Summary text includes non-quotation disclaimer');
  assert(!summaryText.includes('password') && !summaryText.includes('credit_card'), 'Journey C.5: Zero sensitive leaks in summary');

  // Verify embedded EnquiryForm is present for handoff
  assert(plannerHtml.includes('id="planner-direct-form"'), 'Journey C.6: Stage 5 embeds EnquiryForm in planner mode');
}

// -----------------------------------------------------------------------------
// JOURNEY D: Direct Contact & Serverless Lead Pipeline
// -----------------------------------------------------------------------------
console.log('\n4. Testing Journey D: Contact Form Submission & API Pipeline...');
{
  _resetRateLimitsForTesting();

  const contactHtml = fs.readFileSync(path.join(DIST_DIR, 'contact/index.html'), 'utf-8');
  assert(contactHtml.includes('id="contact-page-form"'), 'Journey D.1: Contact page contains EnquiryForm');
  assert(contactHtml.includes('name="website_url"'), 'Journey D.1: Honeypot anti-spam field is rendered');
  assert(contactHtml.includes('name="acknowledgement"'), 'Journey D.1: Privacy acknowledgement checkbox is rendered');

  // Proper test double environment
  const mockEnv = {
    RESEND_API_KEY: 're_test_mock_api_key_123',
    ENQUIRY_RECIPIENT_EMAIL: 'test-inbox@saarbusiness.test',
    ENQUIRY_SENDER_EMAIL: 'notifications@saarbusiness.test',
    ENABLE_TEST_MOCK_DELIVERY: 'true',
    NODE_ENV: 'development',
  };

  const validPayload = {
    submissionId: 'test-sub-12345678',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    location: 'Gurgaon, DLF Phase 5',
    contactMethod: 'email',
    service: 'interior-design',
    message: 'We are seeking architectural interior planning for our new 4BHK apartment in DLF Phase 5.',
    acknowledgement: true,
  };

  const request = new Request('https://saarbusiness.com/api/enquiry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://saarbusiness.com',
      'CF-Connecting-IP': '192.168.1.55',
    },
    body: JSON.stringify(validPayload),
  });

  const response = await handleEnquiryRequest(request, mockEnv);
  assert(response.status === 200, 'Journey D.2: Valid enquiry receives HTTP 200 OK', `Status was ${response.status}`);

  const json = await response.json();
  assert(json.success === true, 'Journey D.3: API response returns success: true');
  assert(json.simulated === true, 'Journey D.3: API response correctly flags simulated delivery in mock mode');
  assert(/^SR-[A-Z0-9]{4,6}-[A-Z0-9]{4}$/.test(json.reference), `Journey D.4: Generated reference matches SR-XXXX-XXXX pattern (${json.reference})`);

  // Verify honeypot rejection
  const botPayload = { ...validPayload, website_url: 'https://spam-bot.xyz' };
  const botRequest = new Request('https://saarbusiness.com/api/enquiry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://saarbusiness.com',
      'CF-Connecting-IP': '192.168.1.56',
    },
    body: JSON.stringify(botPayload),
  });
  const botResponse = await handleEnquiryRequest(botRequest, mockEnv);
  assert(botResponse.status === 400, 'Journey D.5: Bot submission with honeypot filled is rejected with HTTP 400');
}

// -----------------------------------------------------------------------------
// JOURNEY E: Information & Trust Exploration
// -----------------------------------------------------------------------------
console.log('\n5. Testing Journey E: About, Process & Trust Verification...');
{
  const aboutHtml = fs.readFileSync(path.join(DIST_DIR, 'about/index.html'), 'utf-8');
  assert(aboutHtml.includes('href="/process/"'), 'Journey E.1: About page contains direct link to Process page');
  assert(aboutHtml.includes('Delhi NCR'), 'Journey E.1: About page discloses verified Delhi NCR operating territory');

  const processHtml = fs.readFileSync(path.join(DIST_DIR, 'process/index.html'), 'utf-8');
  assert(processHtml.includes('A Disciplined 5-Stage Process'), 'Journey E.2: Process page outlines 5-stage methodology');
  assert(processHtml.includes('South Delhi residential apartment'), 'Journey E.2: Preparation section references verified South Delhi example');
  assert(
    processHtml.includes('href="/plan-my-project/"') || processHtml.includes('href="/services/"'),
    'Journey E.3: Process page provides onward conversion routes'
  );
}

// -----------------------------------------------------------------------------
// JOURNEY F: Recovery from Unknown Route (Custom 404)
// -----------------------------------------------------------------------------
console.log('\n6. Testing Journey F: Error Recovery & 404 Navigation...');
{
  const notFoundHtml = fs.readFileSync(path.join(DIST_DIR, '404.html'), 'utf-8');
  assert(notFoundHtml.includes('Page Not Found'), 'Journey F.1: 404 page displays clear Page Not Found message');
  assert(notFoundHtml.includes('href="/"'), 'Journey F.2: 404 page provides primary Return to Home recovery button');
  assert(
    notFoundHtml.includes('content="noindex, nofollow"'),
    'Journey F.3: 404 page instructs search engines not to index error routes'
  );
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`Visitor Journey Results: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${totalTests})`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL 6 VISITOR JOURNEYS VERIFIED SUCCESSFULLY.');
}
