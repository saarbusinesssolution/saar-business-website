import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

const PAGES = [
  { path: '/', file: 'index.html', indexable: true },
  { path: '/services/', file: 'services/index.html', indexable: true },
  { path: '/services/interior-design/', file: 'services/interior-design/index.html', indexable: true },
  { path: '/services/turnkey-contracting/', file: 'services/turnkey-contracting/index.html', indexable: true },
  { path: '/projects/', file: 'projects/index.html', indexable: true },
  { path: '/projects/courtyard-minimalist-residence/', file: 'projects/courtyard-minimalist-residence/index.html', indexable: true },
  { path: '/about/', file: 'about/index.html', indexable: true },
  { path: '/process/', file: 'process/index.html', indexable: true },
  { path: '/plan-my-project/', file: 'plan-my-project/index.html', indexable: true },
  { path: '/contact/', file: 'contact/index.html', indexable: true },
  { path: '/privacy/', file: 'privacy/index.html', indexable: true },
  { path: '/thank-you/', file: 'thank-you/index.html', indexable: false },
  { path: '/404.html', file: '404.html', indexable: false },
];

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const findings = [];

function assert(condition, message, pagePath = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    failedAssertions++;
    findings.push({ pagePath, message });
    console.error(`  ❌ FAIL [${pagePath || 'GLOBAL'}]: ${message}`);
  }
}

console.log('======================================================');
console.log('SAAR Comprehensive QA Audit Suite (Step 14)');
console.log('======================================================\n');

// 1. Audit Dist Existence & Files
console.log('1. Auditing Build Artifacts & Core Routes...');
for (const p of PAGES) {
  const filePath = path.join(DIST_DIR, p.file);
  const exists = fs.existsSync(filePath);
  assert(exists, `HTML file exists: ${p.file}`, p.path);
}

// 2. Deep Page-by-Page Markup Audit
console.log('\n2. Auditing DOM Landmarks, Headings & Accessibility...');
for (const p of PAGES) {
  const filePath = path.join(DIST_DIR, p.file);
  if (!fs.existsSync(filePath)) continue;

  const html = fs.readFileSync(filePath, 'utf-8');

  // Landmark: Main
  const mainMatches = html.match(/<main\b[^>]*>/gi) || [];
  assert(mainMatches.length === 1, `Has exactly 1 <main> landmark (found ${mainMatches.length})`, p.path);
  assert(html.includes('id="main-content"'), 'Has <main id="main-content">', p.path);

  // Skip link
  assert(
    html.includes('href="#main-content"') && html.includes('class="skip-link"'),
    'Has accessible skip link targeting #main-content',
    p.path
  );

  // H1 Check
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(h1Matches.length === 1, `Has exactly one H1 tag (found ${h1Matches.length})`, p.path);

  // Heading order check (detect any skipped levels like h1 -> h3 without h2)
  const headingTags = Array.from(html.matchAll(/<(h[1-6])\b[^>]*>/gi)).map((m) => parseInt(m[1].substring(1), 10));
  let skippedLevel = false;
  let skippedDesc = '';
  for (let i = 0; i < headingTags.length - 1; i++) {
    const current = headingTags[i];
    const next = headingTags[i + 1];
    if (next > current + 1) {
      skippedLevel = true;
      skippedDesc = `H${current} followed directly by H${next}`;
      break;
    }
  }
  assert(!skippedLevel, `Heading hierarchy is logical (no skipped levels, ${skippedDesc || 'valid'})`, p.path);

  // Canonical tag check
  if (p.indexable) {
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    assert(canonicalMatch !== null, 'Canonical tag is present', p.path);
    if (canonicalMatch) {
      const canonical = canonicalMatch[1];
      assert(canonical.startsWith('https://saarbusiness.com'), 'Canonical is absolute https://saarbusiness.com', p.path);
      assert(canonical.endsWith('/'), 'Canonical ends with trailing slash', p.path);
    }

    // Robots directive
    const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
    assert(robotsMatch !== null, 'Robots meta tag is present', p.path);
    if (robotsMatch) {
      assert(robotsMatch[1] === 'index, follow', `Robots directive is "index, follow" (got "${robotsMatch[1]}")`, p.path);
    }
  } else {
    // Non-indexable pages (/thank-you/, /404.html)
    const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
    assert(robotsMatch !== null, 'Robots meta tag is present', p.path);
    if (robotsMatch) {
      assert(robotsMatch[1] === 'noindex, nofollow', `Robots directive is "noindex, nofollow" (got "${robotsMatch[1]}")`, p.path);
    }
  }

  // Check structured data
  if (p.indexable) {
    const schemaMatches = Array.from(html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi));
    assert(schemaMatches.length > 0, `Has structured data scripts (found ${schemaMatches.length})`, p.path);
    for (const match of schemaMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        assert(parsed !== null && typeof parsed === 'object', 'JSON-LD parses cleanly', p.path);
      } catch (err) {
        assert(false, `JSON-LD syntax error: ${err.message}`, p.path);
      }
    }
  }
}

// 3. Link Validity & Route Integrity Audit
console.log('\n3. Auditing Internal Links & Anchors...');
const allHrefs = new Set();
const internalLinks = [];

for (const p of PAGES) {
  const filePath = path.join(DIST_DIR, p.file);
  if (!fs.existsSync(filePath)) continue;

  const html = fs.readFileSync(filePath, 'utf-8');
  const anchorRegex = /<a\s+[^>]*href="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    allHrefs.add(href);
    if (href.startsWith('/') || href.startsWith('#')) {
      internalLinks.push({ sourcePage: p.path, href });
    }
  }
}

console.log(`  Found ${internalLinks.length} internal links across ${PAGES.length} pages.`);

for (const link of internalLinks) {
  if (link.href.startsWith('#')) {
    // Local anchor on the same page
    const sourceFile = PAGES.find((p) => p.path === link.sourcePage)?.file;
    if (sourceFile) {
      const html = fs.readFileSync(path.join(DIST_DIR, sourceFile), 'utf-8');
      const targetId = link.href.substring(1);
      const idExists = html.includes(`id="${targetId}"`);
      assert(idExists, `Anchor ${link.href} resolves to id="${targetId}" on source page`, link.sourcePage);
    }
  } else if (link.href.startsWith('/')) {
    const urlParts = link.href.split('#');
    const pathname = urlParts[0];
    const hash = urlParts[1];

    // Check if target file exists
    let targetFile;
    if (pathname === '/') {
      targetFile = 'index.html';
    } else {
      const cleaned = pathname.replace(/^\/|\/$/g, '');
      targetFile = path.join(cleaned, 'index.html');
      if (!fs.existsSync(path.join(DIST_DIR, targetFile))) {
        targetFile = cleaned;
      }
    }

    const fullTargetPath = path.join(DIST_DIR, targetFile);
    const targetExists = fs.existsSync(fullTargetPath);
    assert(targetExists, `Internal link target exists: ${pathname} (mapped to ${targetFile})`, link.sourcePage);

    if (targetExists && hash) {
      const targetHtml = fs.readFileSync(fullTargetPath, 'utf-8');
      const idExists = targetHtml.includes(`id="${hash}"`);
      assert(idExists, `Internal anchor target ${link.href} resolves to id="${hash}" in ${targetFile}`, link.sourcePage);
    }
  }
}

// 4. Image Performance & Accessibility Audit
console.log('\n4. Auditing Images (Aspect Ratio, Alt Text, Layout Shift)...');
const imageIssues = [];
for (const p of PAGES) {
  const filePath = path.join(DIST_DIR, p.file);
  if (!fs.existsSync(filePath)) continue;

  const html = fs.readFileSync(filePath, 'utf-8');
  const imgRegex = /<img\s+([^>]*?)>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];

    const srcMatch = attrs.match(/src="([^"]+)"/i);
    const altMatch = attrs.match(/alt="([^"]*)"/i);
    const widthMatch = attrs.match(/width="([^"]+)"/i);
    const heightMatch = attrs.match(/height="([^"]+)"/i);
    const loadingMatch = attrs.match(/loading="([^"]+)"/i);
    const priorityMatch = attrs.match(/fetchpriority="([^"]+)"/i);

    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : null;

    // Check file on disk if local
    if (src.startsWith('/')) {
      const imgPath = path.join(DIST_DIR, src.substring(1));
      const imgExists = fs.existsSync(imgPath);
      assert(imgExists, `Image asset exists on disk: ${src}`, p.path);
    }

    // Check alt attribute
    assert(alt !== null, `Image has alt attribute: ${src}`, p.path);

    // Check width & height for layout stability (CLS prevention)
    const hasDimensions = Boolean(widthMatch && heightMatch);
    if (!hasDimensions) {
      imageIssues.push({ page: p.path, src, issue: 'Missing explicit width/height attributes' });
    }

    // Check loading priority logic
    if (priorityMatch && priorityMatch[1] === 'high') {
      assert(loadingMatch && loadingMatch[1] === 'eager', `High priority image has loading="eager": ${src}`, p.path);
    }
  }
}

console.log(`  Identified ${imageIssues.length} image dimension warnings across built pages.`);
for (const issue of imageIssues) {
  console.warn(`    ⚠️  [${issue.page}] Image ${issue.src}: ${issue.issue}`);
}

// 5. Security & Sensitive Data Leak Audit
console.log('\n5. Auditing Security, Secrets & Payload Hygiene...');
const jsFiles = fs.readdirSync(path.join(DIST_DIR, '_astro')).filter((f) => f.endsWith('.js'));
const secretKeywords = ['RESEND_API_KEY', 're_test_', 're_live_', 'sk_live_', 'sk_test_', 'API_SECRET'];

for (const jsFile of jsFiles) {
  const content = fs.readFileSync(path.join(DIST_DIR, '_astro', jsFile), 'utf-8');
  for (const kw of secretKeywords) {
    assert(!content.includes(kw), `Client JS bundle ${jsFile} does not contain secret keyword: ${kw}`);
  }
}

// 6. Summary & Results
console.log('\n======================================================');
console.log(`QA Audit Results: ${passedAssertions} PASSED, ${failedAssertions} FAILED (Total: ${totalAssertions})`);
console.log('======================================================\n');

if (failedAssertions > 0) {
  console.error('FAILURES SUMMARY:');
  findings.forEach((f) => console.error(`  - [${f.pagePath || 'GLOBAL'}] ${f.message}`));
  process.exit(1);
} else {
  console.log('✅ ALL AUDIT ASSERTIONS COMPLETED SUCCESSFULLY.');
}
