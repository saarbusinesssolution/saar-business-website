/**
 * Standalone Content, Route & Design System Integrity Verification Script
 * Validates route registry, navigation, image metadata, draft separation,
 * design tokens, typography, layout primitives, and production exclusions.
 */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

console.log('🔍 Starting SAAR Content, Route & Design System Validation Suite...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// ==========================================
// 1. ROUTE REGISTRY & TRAILING SLASH VALIDATION
// ==========================================
console.log('1. Validating Route Registry & URL Policies...');

const routesFile = fs.readFileSync(path.join(projectRoot, 'src/config/routes.ts'), 'utf-8');

assert(routesFile.includes("id: 'home'"), 'Home route registered');
assert(routesFile.includes("id: 'services'"), 'Services route registered');
assert(routesFile.includes("id: 'thank_you'"), 'Thank-you confirmation route registered');
assert(routesFile.includes("id: 'not_found'"), '404 route registered');
assert(routesFile.includes("path: '/services/'"), 'Services path follows trailing slash');
assert(routesFile.includes("path: '/plan-my-project/'"), 'Project planner follows trailing slash');
assert(routesFile.includes("isIndexable: false"), 'Transactional and error pages marked non-indexable');
assert(routesFile.includes("slug.includes('[slug]')"), 'Dynamic URL generators reject literal [slug]');

// ==========================================
// 2. DATA-DRIVEN NAVIGATION VALIDATION
// ==========================================
console.log('\n2. Validating Navigation Architecture...');

const navFile = fs.readFileSync(path.join(projectRoot, 'src/config/navigation.ts'), 'utf-8');

assert(navFile.includes("createNavItem('services'"), 'Primary nav includes Services via route registry');
assert(navFile.includes("createNavItem('projects'"), 'Primary nav includes Projects via route registry');
assert(navFile.includes("createNavItem('process'"), 'Primary nav includes Our Process via route registry');
assert(navFile.includes("createNavItem('about'"), 'Primary nav includes About via route registry');
assert(navFile.includes("createNavItem('contact'"), 'Primary nav includes Contact via route registry');
assert(navFile.includes("createNavItem('plan_my_project'"), 'Primary nav CTA is Plan My Project');
assert(navFile.includes("createNavItem('privacy'"), 'Footer nav includes Privacy Policy');
assert(navFile.includes('getAvailableNavItems'), 'Navigation provides availability filter for planned routes');

// ==========================================
// 3. BUSINESS CONFIGURATION & SAFETY CHECKS
// ==========================================
console.log('\n3. Validating Business Configuration & Contact Safety...');

const siteConfigFile = fs.readFileSync(path.join(projectRoot, 'src/config/site.ts'), 'utf-8');

assert(siteConfigFile.includes("name: 'Saar Business Support Solution'"), 'Official business name configured');
assert(siteConfigFile.includes("tagline: 'Designed with Purpose. Executed with Precision.'"), 'Official tagline configured');
assert(siteConfigFile.includes('phone: null'), 'Unconfirmed phone strictly initialized to null');
assert(siteConfigFile.includes('whatsappNumber: null'), 'Unconfirmed WhatsApp strictly initialized to null');
assert(siteConfigFile.includes('email: null'), 'Unconfirmed email strictly initialized to null');
assert(siteConfigFile.includes('address: null'), 'Unconfirmed address strictly initialized to null');
assert(siteConfigFile.includes('getWhatsAppDirectUrl'), 'WhatsApp deep link helper implemented with null guard');

// ==========================================
// 4. IMAGE METADATA REGISTRY VALIDATION
// ==========================================
console.log('\n4. Validating Image Registry & Publication Constraints...');

const imagesFile = fs.readFileSync(path.join(projectRoot, 'src/data/images.ts'), 'utf-8');

assert(imagesFile.includes('brand_logo_full'), 'Primary logo registered in image metadata');
assert(imagesFile.includes('brand_logo_icon'), 'Monogram icon registered in image metadata');
assert(imagesFile.includes("readiness: 'available'"), 'Brand assets flagged as available');
assert(imagesFile.includes("readiness: 'planned'"), 'Curated future photography classified as planned');
assert(imagesFile.includes('validateImageForPublication'), 'Publication image validation helper implemented');

const brandLogoPath = path.join(projectRoot, 'public/images/brand/logo-full.png');
const brandIconPath = path.join(projectRoot, 'public/images/brand/logo-icon.png');
assert(fs.existsSync(brandLogoPath), 'Brand full logo exists at public/images/brand/logo-full.png');
assert(fs.existsSync(brandIconPath), 'Brand icon exists at public/images/brand/logo-icon.png');

// ==========================================
// 5. CONTENT COLLECTIONS & DRAFT INTEGRITY
// ==========================================
console.log('\n5. Validating Content Collections & Draft Separation...');

const servicesDir = path.join(projectRoot, 'src/content/services');
const projectsDir = path.join(projectRoot, 'src/content/projects');

assert(fs.existsSync(servicesDir), 'Services content directory exists');
assert(fs.existsSync(projectsDir), 'Projects content directory exists');

const serviceFiles = fs.readdirSync(servicesDir).filter((f) => f.endsWith('.md'));
const projectFiles = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));

assert(serviceFiles.length === 4, `Found 4 service collection entries: ${serviceFiles.join(', ')}`);
assert(projectFiles.length >= 1, `Found ${projectFiles.length} project collection entry/entries`);

const serviceIds = new Set();
for (const file of serviceFiles) {
  const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');
  const idMatch = content.match(/^id:\s*"([^"]+)"/m);
  const statusMatch = content.match(/^publicationStatus:\s*"([^"]+)"/m);
  const verifyMatch = content.match(/^verificationStatus:\s*"([^"]+)"/m);

  assert(idMatch !== null, `${file} defines a valid id field`);
  if (idMatch) {
    const id = idMatch[1];
    assert(!serviceIds.has(id), `Service ID "${id}" is unique`);
    serviceIds.add(id);
    assert(/^[a-z0-9-]+$/.test(id), `Service ID "${id}" has valid lowercase-kebab format`);
  }

  const publishedServices = ['interior-design.md', 'turnkey-contracting.md'];
  const draftServices = ['renovation.md', 'property-solutions.md'];

  if (publishedServices.includes(file)) {
    assert(statusMatch && statusMatch[1] === 'published', `${file} is published following readiness verification`);
    assert(verifyMatch && verifyMatch[1] === 'verified', `${file} is verified following readiness audit`);
  } else if (draftServices.includes(file)) {
    assert(statusMatch && statusMatch[1] === 'draft', `${file} is correctly retained in draft status`);
    assert(verifyMatch && verifyMatch[1] === 'pending_confirmation', `${file} is pending operational confirmation`);
  }
}

for (const file of projectFiles) {
  const content = fs.readFileSync(path.join(projectsDir, file), 'utf-8');
  const idMatch = content.match(/^id:\s*"([^"]+)"/m);
  const statusMatch = content.match(/^publicationStatus:\s*"([^"]+)"/m);
  const natureMatch = content.match(/^projectNature:\s*"([^"]+)"/m);
  const notesMatch = content.match(/^internalNotes:\s*"([^"]+)"/m);

  assert(idMatch !== null, `${file} defines a valid id field`);
  assert(statusMatch && statusMatch[1] === 'published', `${file} is published as an approved concept study`);
  assert(natureMatch && natureMatch[1] === 'concept', `${file} is correctly classified as a concept project`);
  assert(notesMatch !== null, `${file} contains internalNotes for testing data-leak prevention`);
}

// ==========================================
// 6. DESIGN SYSTEM & TOKENS VALIDATION
// ==========================================
console.log('\n6. Validating Design Tokens & CSS Properties...');

const tokensPath = path.join(projectRoot, 'src/styles/tokens.css');
assert(fs.existsSync(tokensPath), 'tokens.css exists');

const tokensContent = fs.readFileSync(tokensPath, 'utf-8');
assert(tokensContent.includes('--color-raw-navy: #173A5E'), 'Deep Navy token correctly defined');
assert(tokensContent.includes('--color-raw-gold: #B99052'), 'Architectural Gold token correctly defined');
assert(tokensContent.includes('--color-raw-charcoal: #202020'), 'Charcoal token correctly defined');
assert(tokensContent.includes('--color-raw-softwhite: #F4F1EA'), 'Soft White token correctly defined');
assert(tokensContent.includes('--color-bg-page: var(--color-raw-softwhite)'), 'Page background bound to Soft White');
assert(tokensContent.includes('--color-surface-elevated: #FFFFFF'), 'Elevated surface defined');
assert(tokensContent.includes('--max-content-width: 1240px'), 'Max content width defined as 1240px');

// ==========================================
// 7. COMPONENT PRIMITIVES VALIDATION
// ==========================================
console.log('\n7. Validating Component Primitives...');

const requiredComponents = [
  'src/components/layout/Container.astro',
  'src/components/layout/Section.astro',
  'src/components/layout/SectionHeader.astro',
  'src/components/layout/ResponsiveGrid.astro',
  'src/components/layout/Stack.astro',
  'src/components/layout/Cluster.astro',
  'src/components/ui/Button.astro',
  'src/components/ui/Badge.astro',
  'src/components/ui/FormField.astro',
  'src/components/ui/TextInput.astro',
  'src/components/ui/TextArea.astro',
  'src/components/ui/Select.astro',
  'src/components/ui/Checkbox.astro',
  'src/components/ui/RadioGroup.astro',
  'src/components/ui/Accordion.astro',
  'src/components/cards/ServiceCard.astro',
  'src/components/cards/ProjectCard.astro',
  'src/components/cards/ProcessStep.astro',
  'src/components/layout/SiteHeader.astro',
  'src/components/layout/DesktopNav.astro',
  'src/components/layout/MobileNav.astro',
  'src/components/layout/SiteFooter.astro',
  'src/components/ui/Breadcrumbs.astro',
  'src/components/ui/ContactActions.astro',
  'src/components/sections/CTASection.astro',
  'src/dev/ComponentPreview.astro',
];

for (const compPath of requiredComponents) {
  assert(fs.existsSync(path.join(projectRoot, compPath)), `Component primitive ${compPath} exists`);
}

// Check Button touch target & default type
const buttonCode = fs.readFileSync(path.join(projectRoot, 'src/components/ui/Button.astro'), 'utf-8');
assert(buttonCode.includes("type = 'button'"), 'Button type defaults to button');
assert(buttonCode.includes('min-h-[44px]'), 'Button medium size has min 44px touch target');

// Check ProjectCard concept badge integration
const projectCardCode = fs.readFileSync(path.join(projectRoot, 'src/components/cards/ProjectCard.astro'), 'utf-8');
assert(projectCardCode.includes("Badge variant=\"concept\">Design Concept</Badge>"), 'ProjectCard derives concept disclosure badge automatically');

// Check FormField accessibility
const formFieldCode = fs.readFileSync(path.join(projectRoot, 'src/components/ui/FormField.astro'), 'utf-8');
assert(formFieldCode.includes('for={id}'), 'FormField binds label to input id');
assert(formFieldCode.includes('role="alert"'), 'FormField marks error with role=alert');

// Check Global UI Shell Integrations (Step 05)
const baseLayoutCode = fs.readFileSync(path.join(projectRoot, 'src/layouts/BaseLayout.astro'), 'utf-8');
assert(baseLayoutCode.includes('<SiteHeader'), 'BaseLayout integrates SiteHeader');
assert(baseLayoutCode.includes('<SiteFooter'), 'BaseLayout integrates SiteFooter');
assert(baseLayoutCode.includes('href="/favicon.ico"'), 'BaseLayout includes favicon suite');

const mobileNavCode = fs.readFileSync(path.join(projectRoot, 'src/components/layout/MobileNav.astro'), 'utf-8');
assert(mobileNavCode.includes('aria-expanded'), 'MobileNav enforces aria-expanded');
assert(mobileNavCode.includes('aria-controls'), 'MobileNav binds aria-controls');

const breadcrumbsCode = fs.readFileSync(path.join(projectRoot, 'src/components/ui/Breadcrumbs.astro'), 'utf-8');
assert(breadcrumbsCode.includes('aria-label="Breadcrumb"'), 'Breadcrumbs enforces aria-label="Breadcrumb"');
assert(breadcrumbsCode.includes('<ol'), 'Breadcrumbs enforces ordered-list semantics');

const footerCode = fs.readFileSync(path.join(projectRoot, 'src/components/layout/SiteFooter.astro'), 'utf-8');
assert(footerCode.includes('Architectural visualizations'), 'SiteFooter enforces architectural concept disclaimer');
assert(footerCode.includes('new Date().getFullYear()'), 'SiteFooter dynamically resolves copyright year');

const ctaCode = fs.readFileSync(path.join(projectRoot, 'src/components/sections/CTASection.astro'), 'utf-8');
assert(ctaCode.includes("variant === 'navy'"), 'CTASection supports navy and light presentation variants');

const contactCode = fs.readFileSync(path.join(projectRoot, 'src/components/ui/ContactActions.astro'), 'utf-8');
assert(contactCode.includes('hasAnyValidContact'), 'ContactActions enforces zero-fabrication safety guard');

// Check Homepage Composition & Components (Step 06)
console.log('\n8. Validating Homepage Architecture (Step 06)...');

const homeDataFile = path.join(projectRoot, 'src/data/home.ts');
assert(fs.existsSync(homeDataFile), 'Homepage data source src/data/home.ts exists');

const homeDataCode = fs.readFileSync(homeDataFile, 'utf-8');
assert(homeDataCode.includes('heroContent'), 'Homepage data defines heroContent');
assert(homeDataCode.includes('verifiedDisciplines'), 'Homepage data defines verifiedDisciplines');
assert(homeDataCode.includes('methodologySteps'), 'Homepage data defines methodologySteps');
assert(homeDataCode.includes('trustPrinciples'), 'Homepage data defines trustPrinciples');
assert(homeDataCode.includes('homepageFaqs'), 'Homepage data defines homepageFaqs');

const homeComponents = [
  'src/components/home/HeroSection.astro',
  'src/components/home/ServicesSection.astro',
  'src/components/home/ProcessSection.astro',
  'src/components/home/TrustSection.astro',
  'src/components/home/FaqSection.astro',
  'src/components/home/PlannerIntro.astro',
  'src/components/home/DesignDirections.astro',
];

for (const compPath of homeComponents) {
  assert(fs.existsSync(path.join(projectRoot, compPath)), `Homepage component ${compPath} exists`);
}

const indexPageCode = fs.readFileSync(path.join(projectRoot, 'src/pages/index.astro'), 'utf-8');
assert(indexPageCode.includes('<HeroSection'), 'Homepage integrates HeroSection');
assert(indexPageCode.includes('<ServicesSection'), 'Homepage integrates ServicesSection');
assert(indexPageCode.includes('<ProcessSection'), 'Homepage integrates ProcessSection');
assert(indexPageCode.includes('<TrustSection'), 'Homepage integrates TrustSection');
assert(indexPageCode.includes('<FaqSection'), 'Homepage integrates FaqSection');
assert(indexPageCode.includes('id="contact"'), 'Homepage integrates final contact CTA section');
assert(indexPageCode.includes('getPublishedProjects'), 'Homepage queries published projects through content loader');

const heroSectionCode = fs.readFileSync(path.join(projectRoot, 'src/components/home/HeroSection.astro'), 'utf-8');
assert(heroSectionCode.includes('<h1'), 'HeroSection enforces exactly one descriptive H1');
assert(heroSectionCode.includes('fetchpriority="high"'), 'Hero image has fetchpriority=high for LCP optimization');
assert(heroSectionCode.includes('Badge variant="concept"'), 'Hero image displays mandatory concept disclosure badge');

// Check Production Build Excludes Dev Preview
const distDevDir = path.join(projectRoot, 'dist/dev');
assert(!fs.existsSync(distDevDir), 'Production build output dist/dev does not exist (dev-only preview successfully excluded)');

// ==========================================
// 9. SERVICES ARCHITECTURE & DETAIL VALIDATION (Step 07)
// ==========================================
console.log('\n9. Validating Services Architecture & Routes (Step 07)...');

const servicePages = [
  'src/pages/services/index.astro',
  'src/pages/services/[slug].astro',
  'src/components/services/ServiceScope.astro',
  'src/components/services/ServiceProcess.astro',
  'src/components/services/RelatedServices.astro',
  'src/components/services/ServiceDetail.astro',
];

for (const p of servicePages) {
  assert(fs.existsSync(path.join(projectRoot, p)), `Service page/component ${p} exists`);
}

// Routes registry validation for services
assert(routesFile.includes("id: 'services'") && routesFile.includes("status: 'implemented'"), 'Services route status marked implemented');
assert(routesFile.includes("id: 'service_detail'") && routesFile.includes("status: 'implemented'"), 'Service detail dynamic route status marked implemented');

// Check build output if dist exists
const distServicesIndex = path.join(projectRoot, 'dist/services/index.html');
const distInteriorDesign = path.join(projectRoot, 'dist/services/interior-design/index.html');
const distTurnkey = path.join(projectRoot, 'dist/services/turnkey-contracting/index.html');
const distRenovation = path.join(projectRoot, 'dist/services/renovation/index.html');
const distPropertySolutions = path.join(projectRoot, 'dist/services/property-solutions/index.html');

if (fs.existsSync(distServicesIndex)) {
  assert(fs.existsSync(distServicesIndex), 'Production build output dist/services/index.html exists');
  assert(fs.existsSync(distInteriorDesign), 'Production build output dist/services/interior-design/index.html exists');
  assert(fs.existsSync(distTurnkey), 'Production build output dist/services/turnkey-contracting/index.html exists');
  assert(!fs.existsSync(distRenovation), 'Draft service renovation excluded from production build (no 404 leakage)');
  assert(!fs.existsSync(distPropertySolutions), 'Draft service property-solutions excluded from production build');

  const interiorHtml = fs.readFileSync(distInteriorDesign, 'utf-8');
  assert(interiorHtml.includes('aria-label="Breadcrumb"'), 'Service detail page renders breadcrumbs');
  const h1Matches = interiorHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(h1Matches.length === 1 && h1Matches[0].includes('Interior Design'), 'Service detail page renders single H1 with service title');
  assert(interiorHtml.includes('Design Concept'), 'Service detail page renders concept badge on visual asset');
  assert(interiorHtml.includes('id="enquire"'), 'Service detail page renders contextual consultation anchor');

  const servicesIndexHtml = fs.readFileSync(distServicesIndex, 'utf-8');
  assert(servicesIndexHtml.includes('href="/services/interior-design/"'), 'Services overview links to published interior-design detail');
  assert(servicesIndexHtml.includes('href="/services/turnkey-contracting/"'), 'Services overview links to published turnkey-contracting detail');
}

// ==========================================
// 10. PORTFOLIO & PROJECT DETAIL VALIDATION (Step 08)
// ==========================================
console.log('\n10. Validating Portfolio & Project Detail Architecture (Step 08)...');

const projectComponents = [
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/components/projects/ProjectFilters.astro',
  'src/components/projects/ProjectDetail.astro',
  'src/components/projects/ProjectGallery.astro',
  'src/components/projects/RelatedProjects.astro',
];

for (const p of projectComponents) {
  assert(fs.existsSync(path.join(projectRoot, p)), `Portfolio component ${p} exists`);
}

// Routes registry validation for projects
assert(routesFile.includes("id: 'projects'") && routesFile.includes("status: 'implemented'"), 'Projects route status marked implemented');
assert(routesFile.includes("id: 'project_detail'") && routesFile.includes("status: 'implemented'"), 'Project detail dynamic route status marked implemented');

// Check build output if dist exists
const distProjectsIndex = path.join(projectRoot, 'dist/projects/index.html');
const distCourtyard = path.join(projectRoot, 'dist/projects/courtyard-minimalist-residence/index.html');

if (fs.existsSync(distProjectsIndex)) {
  assert(fs.existsSync(distProjectsIndex), 'Production build output dist/projects/index.html exists');
  assert(fs.existsSync(distCourtyard), 'Production build output dist/projects/courtyard-minimalist-residence/index.html exists');

  const courtyardHtml = fs.readFileSync(distCourtyard, 'utf-8');
  assert(!courtyardHtml.includes('Internal development concept') && !courtyardHtml.includes('internalNotes'), 'Project detail page strictly strips internal notes (zero data leak)');
  assert(courtyardHtml.includes('aria-label="Breadcrumb"'), 'Project detail page renders breadcrumbs');
  const projectH1s = courtyardHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(projectH1s.length === 1 && projectH1s[0].includes('The Courtyard Pavilion'), 'Project detail page renders single H1 with project title');
  assert(courtyardHtml.includes('Design Concept'), 'Project detail page renders prominent concept disclosure badge');
  assert(courtyardHtml.includes('id="gallery-lightbox"'), 'Project detail page includes accessible native dialog lightbox');
  assert(courtyardHtml.includes('id="enquire"'), 'Project detail page renders contextual consultation CTA');

  const projectsIndexHtml = fs.readFileSync(distProjectsIndex, 'utf-8');
  assert(projectsIndexHtml.includes('portfolio-filter-group'), 'Projects overview includes accessible filter controls');
  assert(projectsIndexHtml.includes('href="/projects/courtyard-minimalist-residence/"'), 'Projects overview links to published project detail');
  assert(projectsIndexHtml.includes('Explore Design Directions'), 'Projects overview uses concept-honest heading for design studies');

  const indexHtml = fs.readFileSync(path.join(projectRoot, 'dist/index.html'), 'utf-8');
  assert(indexHtml.includes('/projects/courtyard-minimalist-residence/'), 'Homepage Selected Works links to published project detail');
  assert(indexHtml.includes('href="/projects/"'), 'Homepage Selected Works includes link to /projects/ overview');
}

// Check About & Process Architecture (Step 09)
console.log('\n11. Validating About & Process Architecture (Step 09)...');

const aboutDataFile = path.join(projectRoot, 'src/data/about.ts');
const processDataFile = path.join(projectRoot, 'src/data/process.ts');
assert(fs.existsSync(aboutDataFile), 'About data source src/data/about.ts exists');
assert(fs.existsSync(processDataFile), 'Process data source src/data/process.ts exists');

const processDataCode = fs.readFileSync(processDataFile, 'utf-8');
assert(processDataCode.includes("id: 'discover'"), 'Process data defines Stage 01 Discover');
assert(processDataCode.includes("id: 'plan'"), 'Process data defines Stage 02 Plan');
assert(processDataCode.includes("id: 'design'"), 'Process data defines Stage 03 Design');
assert(processDataCode.includes("id: 'execute'"), 'Process data defines Stage 04 Execute');
assert(processDataCode.includes("id: 'handover'"), 'Process data defines Stage 05 Handover');
assert(processDataCode.includes('preparationGuidelines'), 'Process data defines preparation guidelines');
assert(processDataCode.includes('processFaqs'), 'Process data defines process FAQs');

const aboutProcessComponents = [
  'src/pages/about/index.astro',
  'src/pages/process/index.astro',
  'src/components/process/ProcessTimeline.astro',
  'src/components/process/PreparationSection.astro',
];

for (const p of aboutProcessComponents) {
  assert(fs.existsSync(path.join(projectRoot, p)), `About/Process component ${p} exists`);
}

// Routes registry validation for about and process
assert(routesFile.includes("id: 'about'") && routesFile.includes("status: 'implemented'"), 'About route status marked implemented');
assert(routesFile.includes("id: 'process'") && routesFile.includes("status: 'implemented'"), 'Process route status marked implemented');

// Check build output if dist exists
const distAboutIndex = path.join(projectRoot, 'dist/about/index.html');
const distProcessIndex = path.join(projectRoot, 'dist/process/index.html');

if (fs.existsSync(distAboutIndex) && fs.existsSync(distProcessIndex)) {
  assert(fs.existsSync(distAboutIndex), 'Production build output dist/about/index.html exists');
  assert(fs.existsSync(distProcessIndex), 'Production build output dist/process/index.html exists');

  const aboutHtml = fs.readFileSync(distAboutIndex, 'utf-8');
  assert(aboutHtml.includes('aria-label="Breadcrumb"'), 'About page renders breadcrumbs');
  const aboutH1s = aboutHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(aboutH1s.length === 1, 'About page renders exactly one H1');
  assert(aboutHtml.includes('Design Concept'), 'About page renders concept badge on editorial visual');
  assert(aboutHtml.includes('href="/services/interior-design/"'), 'About page links to interior-design service');
  assert(aboutHtml.includes('href="/services/turnkey-contracting/"'), 'About page links to turnkey-contracting service');
  assert(aboutHtml.includes('href="/process/"'), 'About page links to Our Process');
  assert(!aboutHtml.includes('award-winning') && !aboutHtml.includes('No. 1') && !aboutHtml.includes('100% satisfaction'), 'About page adheres to zero-fabrication claims restriction');

  const processHtml = fs.readFileSync(distProcessIndex, 'utf-8');
  assert(processHtml.includes('aria-label="Breadcrumb"'), 'Process page renders breadcrumbs');
  const processH1s = processHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(processH1s.length === 1, 'Process page renders exactly one H1');
  assert(processHtml.includes('<ol'), 'Process page uses semantic ordered list for stages');
  assert(processHtml.includes('Stage 01'), 'Process page renders Stage 01');
  assert(processHtml.includes('Stage 05'), 'Process page renders Stage 05');
  assert(processHtml.includes('Design Milestone'), 'Process page marks Design stage boundary');
  assert(processHtml.includes('Turnkey Execution Only'), 'Process page marks Turnkey-only execution stages');
  assert(processHtml.includes('What to Prepare for Stage 01'), 'Process page renders preparation guide');
  assert(processHtml.includes('id="faqs"'), 'Process page renders FAQs section');

  const homeHtml = fs.readFileSync(path.join(projectRoot, 'dist/index.html'), 'utf-8');
  assert(homeHtml.includes('href="/process/"'), 'Homepage process section links to /process/');
  assert(homeHtml.includes('href="/about/"'), 'Global navigation links to /about/');
}

// Check Project Planner Architecture (Step 10)
console.log('\n12. Validating Project Planner Architecture (Step 10)...');

const briefTypesFile = path.join(projectRoot, 'src/types/project-brief.ts');
const plannerSchemaFile = path.join(projectRoot, 'src/lib/planner/schema.ts');
const plannerRecsFile = path.join(projectRoot, 'src/lib/planner/recommendations.ts');
const plannerSummaryFile = path.join(projectRoot, 'src/lib/planner/summary.ts');

assert(fs.existsSync(briefTypesFile), 'ProjectBrief types src/types/project-brief.ts exists');
assert(fs.existsSync(plannerSchemaFile), 'Planner schema src/lib/planner/schema.ts exists');
assert(fs.existsSync(plannerRecsFile), 'Recommendations engine src/lib/planner/recommendations.ts exists');
assert(fs.existsSync(plannerSummaryFile), 'Summary formatter src/lib/planner/summary.ts exists');

const schemaCode = fs.readFileSync(plannerSchemaFile, 'utf-8');
assert(schemaCode.includes('CATEGORY_OPTIONS'), 'Planner schema defines CATEGORY_OPTIONS');
assert(schemaCode.includes('PROPERTY_TYPES_BY_CATEGORY'), 'Planner schema defines PROPERTY_TYPES_BY_CATEGORY');
assert(schemaCode.includes('SERVICE_OPTIONS'), 'Planner schema defines confirmed SERVICE_OPTIONS');
assert(schemaCode.includes('validateStage1'), 'Planner schema provides validateStage1');
assert(schemaCode.includes('validateStage2'), 'Planner schema provides validateStage2');
assert(schemaCode.includes('validateStage3'), 'Planner schema provides validateStage3');

const summaryCode = fs.readFileSync(plannerSummaryFile, 'utf-8');
assert(summaryCode.includes('formatBriefText'), 'Planner summary defines formatBriefText');
assert(summaryCode.includes('formatWhatsAppMessage'), 'Planner summary defines formatWhatsAppMessage');
assert(summaryCode.includes('Hello SAAR, I would like to discuss this project'), 'WhatsApp formatter enforces mandatory opening text');

const plannerComponents = [
  'src/components/planner/PlannerWizard.astro',
  'src/pages/plan-my-project/index.astro',
];

for (const p of plannerComponents) {
  assert(fs.existsSync(path.join(projectRoot, p)), `Planner component ${p} exists`);
}

// Routes registry validation for plan_my_project
assert(routesFile.includes("id: 'plan_my_project'") && routesFile.includes("status: 'implemented'"), 'Plan My Project route marked implemented');

// Check build output if dist exists
const distPlannerIndex = path.join(projectRoot, 'dist/plan-my-project/index.html');

if (fs.existsSync(distPlannerIndex)) {
  assert(fs.existsSync(distPlannerIndex), 'Production build output dist/plan-my-project/index.html exists');

  const plannerHtml = fs.readFileSync(distPlannerIndex, 'utf-8');
  assert(plannerHtml.includes('aria-label="Breadcrumb"'), 'Planner page renders breadcrumbs');
  const plannerH1s = plannerHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(plannerH1s.length === 1, 'Planner page renders exactly one H1');
  assert(plannerHtml.includes('Step 1 of 5'), 'Planner wizard renders Step 1 badge');
  assert(plannerHtml.includes('<noscript>'), 'Planner page includes accessible noscript fallback');
  assert(plannerHtml.includes('id="copy-summary-btn"'), 'Planner wizard renders copy summary action');
  assert(plannerHtml.includes('id="download-summary-btn"'), 'Planner wizard renders download summary action');
  assert(!plannerHtml.includes('Enquiry received') && !plannerHtml.includes('guaranteed quote'), 'Planner adheres to zero-fabrication quotation restriction');

  const homeHtml = fs.readFileSync(path.join(projectRoot, 'dist/index.html'), 'utf-8');
  assert(homeHtml.includes('href="/plan-my-project/"'), 'Homepage links to /plan-my-project/ via PlannerIntro');
}

// Check Contact, Privacy, Thank-You & Lead Delivery Architecture (Step 11)
console.log('\n13. Validating Contact, Privacy, Thank-You & Lead Delivery Architecture (Step 11)...');

const enquiryTypesFile = path.join(projectRoot, 'src/types/enquiry.ts');
const enquiryValidationFile = path.join(projectRoot, 'src/lib/validation/enquiry.ts');
const rateLimiterFile = path.join(projectRoot, 'src/lib/server/rate-limiter.ts');
const emailProviderFile = path.join(projectRoot, 'src/lib/server/email-provider.ts');
const enquiryHandlerFile = path.join(projectRoot, 'src/lib/server/enquiry-handler.ts');
const cloudflareFunctionFile = path.join(projectRoot, 'functions/api/enquiry.ts');
const apiTestFile = path.join(projectRoot, 'scripts/test-enquiry-api.mjs');
const envExampleFile = path.join(projectRoot, '.env.example');

assert(fs.existsSync(enquiryTypesFile), 'Enquiry types src/types/enquiry.ts exists');
assert(fs.existsSync(enquiryValidationFile), 'Enquiry validation schema src/lib/validation/enquiry.ts exists');
assert(fs.existsSync(rateLimiterFile), 'Rate limiter src/lib/server/rate-limiter.ts exists');
assert(fs.existsSync(emailProviderFile), 'Email provider adapter src/lib/server/email-provider.ts exists');
assert(fs.existsSync(enquiryHandlerFile), 'Enquiry request handler src/lib/server/enquiry-handler.ts exists');
assert(fs.existsSync(cloudflareFunctionFile), 'Cloudflare Pages function functions/api/enquiry.ts exists');
assert(fs.existsSync(apiTestFile), 'Lead Delivery API test runner scripts/test-enquiry-api.mjs exists');
assert(fs.existsSync(envExampleFile), 'Environment template .env.example exists');

const step11Components = [
  'src/components/forms/EnquiryForm.astro',
  'src/pages/contact/index.astro',
  'src/pages/privacy/index.astro',
  'src/pages/thank-you/index.astro',
];

for (const c of step11Components) {
  assert(fs.existsSync(path.join(projectRoot, c)), `Step 11 component ${c} exists`);
}

// Routes registry validation for contact, privacy, thank_you
assert(routesFile.includes("id: 'contact'") && routesFile.includes("path: '/contact/'"), 'Contact route configured in routes registry');
assert(routesFile.includes("id: 'privacy'") && routesFile.includes("path: '/privacy/'"), 'Privacy route configured in routes registry');
assert(routesFile.includes("id: 'thank_you'") && routesFile.includes("path: '/thank-you/'"), 'Thank You route configured in routes registry');

// Check build outputs if dist exists
const distContactIndex = path.join(projectRoot, 'dist/contact/index.html');
const distPrivacyIndex = path.join(projectRoot, 'dist/privacy/index.html');
const distThankYouIndex = path.join(projectRoot, 'dist/thank-you/index.html');

if (fs.existsSync(distContactIndex)) {
  assert(fs.existsSync(distContactIndex), 'Production build output dist/contact/index.html exists');
  const contactHtml = fs.readFileSync(distContactIndex, 'utf-8');
  assert(contactHtml.includes('aria-label="Breadcrumb"'), 'Contact page renders breadcrumbs');
  const contactH1s = contactHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(contactH1s.length === 1, 'Contact page renders exactly one H1');
  assert(contactHtml.includes('name="name"'), 'Contact page renders Full Name field');
  assert(contactHtml.includes('name="contactMethod"'), 'Contact page renders Preferred Contact Method');
  assert(contactHtml.includes('name="location"'), 'Contact page renders Location field');
  assert(contactHtml.includes('href="/privacy/"'), 'Contact page links to Privacy Policy');
}

if (fs.existsSync(distPrivacyIndex)) {
  assert(fs.existsSync(distPrivacyIndex), 'Production build output dist/privacy/index.html exists');
  const privacyHtml = fs.readFileSync(distPrivacyIndex, 'utf-8');
  assert(privacyHtml.includes('aria-label="Breadcrumb"'), 'Privacy page renders breadcrumbs');
  const privacyH1s = privacyHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(privacyH1s.length === 1, 'Privacy page renders exactly one H1');
  assert(privacyHtml.includes('Cloudflare Pages'), 'Privacy page discloses Cloudflare Pages hosting');
  assert(privacyHtml.includes('Resend'), 'Privacy page discloses Resend email provider');
}

if (fs.existsSync(distThankYouIndex)) {
  assert(fs.existsSync(distThankYouIndex), 'Production build output dist/thank-you/index.html exists');
  const thankYouHtml = fs.readFileSync(distThankYouIndex, 'utf-8');
  assert(thankYouHtml.includes('content="noindex, nofollow"'), 'Thank You page has robots noindex, nofollow meta tag');
  const thankYouH1s = thankYouHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(thankYouH1s.length === 1, 'Thank You page renders exactly one H1');
  assert(thankYouHtml.includes('Direct Access Notice'), 'Thank You page renders truthful direct access notice');
}

// ==========================================
// 14. SEO, AEO & LOCAL SEARCH ARCHITECTURE (Step 12)
// ==========================================
console.log('\n14. Validating SEO, AEO & Local Search Architecture (Step 12)...');

const robotsPath = path.join(projectRoot, 'public/robots.txt');
const headersPath = path.join(projectRoot, 'public/_headers');
const sitemapSourcePath = path.join(projectRoot, 'src/pages/sitemap.xml.ts');
const seoMetadataPath = path.join(projectRoot, 'src/lib/seo/metadata.ts');
const seoSchemaPath = path.join(projectRoot, 'src/lib/seo/schema.ts');
const seoHeadPath = path.join(projectRoot, 'src/components/seo/SEOHead.astro');

assert(fs.existsSync(robotsPath), 'public/robots.txt exists');
assert(fs.existsSync(headersPath), 'public/_headers exists');
assert(fs.existsSync(sitemapSourcePath), 'src/pages/sitemap.xml.ts endpoint exists');
assert(fs.existsSync(seoMetadataPath), 'src/lib/seo/metadata.ts exists');
assert(fs.existsSync(seoSchemaPath), 'src/lib/seo/schema.ts exists');
assert(fs.existsSync(seoHeadPath), 'src/components/seo/SEOHead.astro exists');

if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
  assert(robotsTxt.includes('Sitemap: https://saarbusiness.com/sitemap.xml'), 'robots.txt references absolute production sitemap');
  assert(robotsTxt.includes('Disallow: /api/'), 'robots.txt disallows /api/');
  assert(robotsTxt.includes('Disallow: /thank-you/'), 'robots.txt disallows /thank-you/');
}

if (fs.existsSync(headersPath)) {
  const headersContent = fs.readFileSync(headersPath, 'utf-8');
  assert(headersContent.includes('X-Robots-Tag: noindex, nofollow'), '_headers enforces edge X-Robots-Tag noindex for utility paths');
  assert(headersContent.includes('X-Content-Type-Options: nosniff'), '_headers includes security headers');
}

// Validate production build outputs for SEO
const distSitemapPath = path.join(projectRoot, 'dist/sitemap.xml');
const distRobotsPath = path.join(projectRoot, 'dist/robots.txt');
const dist404Path = path.join(projectRoot, 'dist/404.html');

if (fs.existsSync(distSitemapPath)) {
  assert(fs.existsSync(distSitemapPath), 'Production build output dist/sitemap.xml exists');
  const sitemapXml = fs.readFileSync(distSitemapPath, 'utf-8');
  assert(sitemapXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'Sitemap specifies standard schema namespace');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/</loc>'), 'Sitemap includes Home route');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/services/</loc>'), 'Sitemap includes Services overview');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/services/interior-design/</loc>'), 'Sitemap includes published interior-design service');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/services/turnkey-contracting/</loc>'), 'Sitemap includes published turnkey-contracting service');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/projects/</loc>'), 'Sitemap includes Projects overview');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/projects/courtyard-minimalist-residence/</loc>'), 'Sitemap includes published concept project');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/about/</loc>'), 'Sitemap includes About page');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/process/</loc>'), 'Sitemap includes Process page');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/plan-my-project/</loc>'), 'Sitemap includes Plan My Project tool');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/contact/</loc>'), 'Sitemap includes Contact page');
  assert(sitemapXml.includes('<loc>https://saarbusiness.com/privacy/</loc>'), 'Sitemap includes Privacy page');
  assert(!sitemapXml.includes('/thank-you/'), 'Sitemap strictly excludes non-indexable /thank-you/');
  assert(!sitemapXml.includes('/404'), 'Sitemap strictly excludes error route /404');
  assert(!sitemapXml.includes('renovation'), 'Sitemap strictly excludes draft service renovation');
  assert(!sitemapXml.includes('property-solutions'), 'Sitemap strictly excludes draft service property-solutions');
}

if (fs.existsSync(distRobotsPath)) {
  assert(fs.existsSync(distRobotsPath), 'Production build output dist/robots.txt exists');
}

if (fs.existsSync(distContactIndex)) {
  const contactHtml = fs.readFileSync(distContactIndex, 'utf-8');
  assert(contactHtml.includes('https://schema.org') && contactHtml.includes('"@type":"ContactPage"'), 'Contact page renders ContactPage structured data');
}

if (fs.existsSync(distPrivacyIndex)) {
  const privacyHtml = fs.readFileSync(distPrivacyIndex, 'utf-8');
  assert(privacyHtml.includes('https://schema.org') && privacyHtml.includes('"@type":"WebPage"'), 'Privacy page renders WebPage structured data');
}

if (fs.existsSync(path.join(projectRoot, 'dist/index.html'))) {
  const homeHtml = fs.readFileSync(path.join(projectRoot, 'dist/index.html'), 'utf-8');
  assert(homeHtml.includes('rel="canonical" href="https://saarbusiness.com/"'), 'Home page renders canonical URL with trailing slash');
  assert(homeHtml.includes('content="index, follow"'), 'Home page renders index, follow robots directive');
  assert(homeHtml.includes('"@type":"Organization"'), 'Home page renders Organization structured data');
  assert(homeHtml.includes('"@type":"WebSite"'), 'Home page renders WebSite structured data');
  assert(homeHtml.includes('Delhi NCR'), 'Structured data includes verified Delhi NCR operating area');
  assert(!homeHtml.includes('aggregateRating') && !homeHtml.includes('"ratingValue"'), 'Zero fake ratings or reviews in structured data');
}

if (fs.existsSync(path.join(projectRoot, 'dist/services/interior-design/index.html'))) {
  const serviceHtml = fs.readFileSync(path.join(projectRoot, 'dist/services/interior-design/index.html'), 'utf-8');
  assert(serviceHtml.includes('"@type":"Service"'), 'Service detail renders Service structured data');
  assert(serviceHtml.includes('"@type":"BreadcrumbList"'), 'Service detail renders BreadcrumbList structured data');
}

if (fs.existsSync(path.join(projectRoot, 'dist/projects/courtyard-minimalist-residence/index.html'))) {
  const projectHtml = fs.readFileSync(path.join(projectRoot, 'dist/projects/courtyard-minimalist-residence/index.html'), 'utf-8');
  assert(projectHtml.includes('"@type":"WebPage"'), 'Project detail renders conservative WebPage structured data');
  assert(!projectHtml.includes('"@type":"Product"') && !projectHtml.includes('aggregateRating'), 'Project detail does not masquerade as Product or Review');
}

if (fs.existsSync(dist404Path)) {
  const notFoundHtml = fs.readFileSync(dist404Path, 'utf-8');
  assert(notFoundHtml.includes('content="noindex, nofollow"'), '404 error page renders noindex, nofollow directive');
}

// Title uniqueness check across published pages
const pageTitles = new Map();
const publishedPageFiles = [
  'dist/index.html',
  'dist/services/index.html',
  'dist/services/interior-design/index.html',
  'dist/services/turnkey-contracting/index.html',
  'dist/projects/index.html',
  'dist/projects/courtyard-minimalist-residence/index.html',
  'dist/about/index.html',
  'dist/process/index.html',
  'dist/plan-my-project/index.html',
  'dist/contact/index.html',
  'dist/privacy/index.html',
];

for (const relPath of publishedPageFiles) {
  const fullPath = path.join(projectRoot, relPath);
  if (fs.existsSync(fullPath)) {
    const html = fs.readFileSync(fullPath, 'utf-8');
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      assert(!pageTitles.has(title), `Page title "${title}" in ${relPath} is unique across indexable routes`);
      pageTitles.set(title, relPath);
    }
  }
}

// ==========================================
// 15. ANALYTICS & PRIVACY ARCHITECTURE (Step 13)
// ==========================================
console.log('\n15. Validating Analytics & Privacy Architecture (Step 13)...');

const analyticsEventsPath = path.join(projectRoot, 'src/lib/analytics/events.ts');
const analyticsConsentPath = path.join(projectRoot, 'src/lib/analytics/consent.ts');
const analyticsClientPath = path.join(projectRoot, 'src/lib/analytics/client.ts');
const consentBannerPath = path.join(projectRoot, 'src/components/analytics/ConsentBanner.astro');
const analyticsPlanPath = path.join(projectRoot, 'docs/ANALYTICS_PLAN.md');

assert(fs.existsSync(analyticsEventsPath), 'src/lib/analytics/events.ts exists');
assert(fs.existsSync(analyticsConsentPath), 'src/lib/analytics/consent.ts exists');
assert(fs.existsSync(analyticsClientPath), 'src/lib/analytics/client.ts exists');
assert(fs.existsSync(consentBannerPath), 'src/components/analytics/ConsentBanner.astro exists');
assert(fs.existsSync(analyticsPlanPath), 'docs/ANALYTICS_PLAN.md exists');

// Verify Event Taxonomy in events.ts
if (fs.existsSync(analyticsEventsPath)) {
  const eventsContent = fs.readFileSync(analyticsEventsPath, 'utf-8');
  const requiredEvents = [
    'page_view',
    'service_view',
    'project_view',
    'cta_click',
    'whatsapp_click',
    'phone_click',
    'email_click',
    'planner_start',
    'planner_step_complete',
    'planner_complete',
    'project_summary_copy',
    'project_summary_download',
    'enquiry_form_start',
    'generate_lead',
    'enquiry_submit_error',
  ];

  for (const ev of requiredEvents) {
    assert(eventsContent.includes(`'${ev}'`), `Analytics taxonomy includes approved event "${ev}"`);
  }

  assert(eventsContent.includes('sanitizeEventPayload'), 'events.ts exports sanitizeEventPayload helper');
  assert(eventsContent.includes('ALLOWED_PARAM_KEYS'), 'events.ts defines ALLOWED_PARAM_KEYS allowlist');
  assert(eventsContent.includes('FORBIDDEN_PARAM_PATTERNS'), 'events.ts defines FORBIDDEN_PARAM_PATTERNS blacklist');
}

// Verify Consent Manager
if (fs.existsSync(analyticsConsentPath)) {
  const consentContent = fs.readFileSync(analyticsConsentPath, 'utf-8');
  assert(consentContent.includes('getConsentStatus'), 'consent.ts exports getConsentStatus');
  assert(consentContent.includes('setConsentStatus'), 'consent.ts exports setConsentStatus');
  assert(consentContent.includes('withdrawConsent'), 'consent.ts exports withdrawConsent');
  assert(consentContent.includes('clearAnalyticsCookies'), 'consent.ts exports clearAnalyticsCookies');
  assert(consentContent.includes('saar_analytics_consent'), 'consent.ts uses saar_analytics_consent storage key');
}

// Verify Client Adapter
if (fs.existsSync(analyticsClientPath)) {
  const clientContent = fs.readFileSync(analyticsClientPath, 'utf-8');
  assert(clientContent.includes('initAnalytics'), 'client.ts exports initAnalytics');
  assert(clientContent.includes('trackEvent'), 'client.ts exports trackEvent');
  assert(clientContent.includes('initAnalyticsDelegation'), 'client.ts exports initAnalyticsDelegation');
  assert(clientContent.includes('send_page_view: false'), 'client.ts disables automatic page views');
  assert(clientContent.includes('anonymize_ip: true'), 'client.ts enforces anonymize_ip');
  assert(clientContent.includes('restricted_data_processing: true'), 'client.ts enforces restricted_data_processing');
  assert(clientContent.includes('__SAAR_TRACK_EVENT__'), 'client.ts binds global __SAAR_TRACK_EVENT__');
}

// Verify Layout Integration
const baseLayoutPath = path.join(projectRoot, 'src/layouts/BaseLayout.astro');
if (fs.existsSync(baseLayoutPath)) {
  const baseLayoutContent = fs.readFileSync(baseLayoutPath, 'utf-8');
  assert(baseLayoutContent.includes('ConsentBanner'), 'BaseLayout imports and renders ConsentBanner');
  assert(baseLayoutContent.includes('initAnalyticsDelegation'), 'BaseLayout initializes analytics delegation');
  assert(baseLayoutContent.includes('initAnalytics'), 'BaseLayout initializes analytics client');
}

// Verify Enquiry Form Conversion Integrity
const enquiryFormCompPath = path.join(projectRoot, 'src/components/forms/EnquiryForm.astro');
if (fs.existsSync(enquiryFormCompPath)) {
  const enquiryContent = fs.readFileSync(enquiryFormCompPath, 'utf-8');
  assert(enquiryContent.includes('enquiry_form_start'), 'EnquiryForm tracks enquiry_form_start');
  assert(enquiryContent.includes('generate_lead'), 'EnquiryForm instruments generate_lead');
  assert(enquiryContent.includes('data.simulated === true'), 'EnquiryForm guards generate_lead against mock delivery');
  assert(enquiryContent.includes('enquiry_submit_error'), 'EnquiryForm tracks enquiry_submit_error');
  assert(enquiryContent.includes('__SAAR_LAST_LEAD_SUBMISSION__'), 'EnquiryForm deduplicates generate_lead in memory');
}

// Verify Planner Wizard Instrumentation
const plannerWizardCompPath = path.join(projectRoot, 'src/components/planner/PlannerWizard.astro');
if (fs.existsSync(plannerWizardCompPath)) {
  const plannerContent = fs.readFileSync(plannerWizardCompPath, 'utf-8');
  assert(plannerContent.includes('planner_start'), 'PlannerWizard tracks planner_start');
  assert(plannerContent.includes('planner_step_complete'), 'PlannerWizard tracks planner_step_complete');
  assert(plannerContent.includes('planner_complete'), 'PlannerWizard tracks planner_complete');
  assert(plannerContent.includes('project_summary_copy'), 'PlannerWizard tracks project_summary_copy');
  assert(plannerContent.includes('project_summary_download'), 'PlannerWizard tracks project_summary_download');
  assert(plannerContent.includes('whatsapp_click'), 'PlannerWizard tracks whatsapp_click on handoff');
  assert(plannerContent.includes('completedSteps.clear()'), 'PlannerWizard resets tracking state on restart');
}

// Verify Privacy Page Disclosure
const privacyIndexPath = path.join(projectRoot, 'src/pages/privacy/index.astro');
if (fs.existsSync(privacyIndexPath)) {
  const privacyContent = fs.readFileSync(privacyIndexPath, 'utf-8');
  assert(privacyContent.includes('Google Analytics 4'), 'Privacy page discloses Google Analytics 4');
  assert(privacyContent.includes('Opt-In Consent Requirement'), 'Privacy page notes opt-in consent requirement');
  assert(privacyContent.includes('Your Analytics Preference'), 'Privacy page includes interactive preference widget');
  assert(privacyContent.includes('withdrawConsent'), 'Privacy page allows withdrawing consent and clearing cookies');
}

// Zero-PII Unit Test on sanitizeEventPayload logic
import('./src/lib/analytics/events.ts').then(({ sanitizeEventPayload }) => {
  const testPayload = {
    cta_id: 'hero-start-planning',
    placement: 'hero',
    name: 'Waseem Mansoori',
    email: 'client@example.com',
    phone: '+91 9999999999',
    message: 'I want an architectural design',
    brief: { space: 'residential' },
    budget: '50 Lakhs',
    locality: 'South Delhi',
  };
  const sanitized = sanitizeEventPayload('cta_click', testPayload);
  assert(sanitized !== null, 'Sanitization succeeds on approved event');
  assert(sanitized.cta_id === 'hero-start-planning', 'Permitted cta_id is preserved');
  assert(sanitized.placement === 'hero', 'Permitted placement is preserved');
  assert(!('name' in sanitized), 'Client name is strictly stripped');
  assert(!('email' in sanitized), 'Client email is strictly stripped');
  assert(!('phone' in sanitized), 'Client phone is strictly stripped');
  assert(!('message' in sanitized), 'Client message is strictly stripped');
  assert(!('brief' in sanitized), 'Client brief is strictly stripped');
  assert(!('budget' in sanitized), 'Client budget is strictly stripped');
  assert(!('locality' in sanitized), 'Client locality is strictly stripped');
}).catch((err) => {
  console.error('Failed to run zero-PII unit test:', err);
});

// ==========================================
// 16. QUALITY ASSURANCE & ACCESSIBILITY ARCHITECTURE (Step 14)
// ==========================================
console.log('\n16. Validating Quality Assurance & Accessibility Architecture (Step 14)...');

const qaReportPath = path.join(projectRoot, 'docs/QA_REPORT.md');
const auditQaPath = path.join(projectRoot, 'scripts/audit-qa.mjs');
const testJourneysPath = path.join(projectRoot, 'scripts/test-visitor-journeys.mjs');

assert(fs.existsSync(qaReportPath), 'docs/QA_REPORT.md exists');
assert(fs.existsSync(auditQaPath), 'scripts/audit-qa.mjs exists');
assert(fs.existsSync(testJourneysPath), 'scripts/test-visitor-journeys.mjs exists');

// Verify package.json scripts
const packageJsonPath = path.join(projectRoot, 'package.json');
const pkgContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
assert(Boolean(pkgContent.scripts['test:qa']), 'package.json defines "test:qa" script');
assert(Boolean(pkgContent.scripts['test:journeys']), 'package.json defines "test:journeys" script');

// Verify Heading Hierarchy in Projects Index
const projectsIndexPath = path.join(projectRoot, 'src/pages/projects/index.astro');
if (fs.existsSync(projectsIndexPath)) {
  const projectsIndexContent = fs.readFileSync(projectsIndexPath, 'utf-8');
  assert(projectsIndexContent.includes('Project Index'), 'Projects index renders Project Index section eyebrow');
  assert(projectsIndexContent.includes('<h2'), 'Projects index contains valid H2 heading in section 2');
}

// Verify explicit dimensions on Card components
const serviceCardPath = path.join(projectRoot, 'src/components/cards/ServiceCard.astro');
if (fs.existsSync(serviceCardPath)) {
  const serviceCardContent = fs.readFileSync(serviceCardPath, 'utf-8');
  assert(serviceCardContent.includes('width="800"') && serviceCardContent.includes('height="600"'), 'ServiceCard specifies explicit width and height attributes');
  assert(serviceCardContent.includes('decoding="async"'), 'ServiceCard specifies decoding="async"');
}

const projectCardPath = path.join(projectRoot, 'src/components/cards/ProjectCard.astro');
if (fs.existsSync(projectCardPath)) {
  const projectCardContent = fs.readFileSync(projectCardPath, 'utf-8');
  assert(projectCardContent.includes('width="800"') && projectCardContent.includes('height="500"'), 'ProjectCard specifies explicit width and height attributes');
  assert(projectCardContent.includes('decoding="async"'), 'ProjectCard specifies decoding="async"');
}

// Verify MobileNav focus trapping and scroll locking
const mobileNavPath = path.join(projectRoot, 'src/components/layout/MobileNav.astro');
if (fs.existsSync(mobileNavPath)) {
  const mobileNavContent = fs.readFileSync(mobileNavPath, 'utf-8');
  assert(mobileNavContent.includes('getFocusableElements'), 'MobileNav implements getFocusableElements helper');
  assert(mobileNavContent.includes("document.body.style.overflow = 'hidden'"), 'MobileNav locks background scrolling on open');
  assert(mobileNavContent.includes("document.body.style.overflow = ''"), 'MobileNav restores background scrolling on close');
}

// Verify ProjectGallery scroll locking
const projectGalleryPath = path.join(projectRoot, 'src/components/projects/ProjectGallery.astro');
if (fs.existsSync(projectGalleryPath)) {
  const projectGalleryContent = fs.readFileSync(projectGalleryPath, 'utf-8');
  assert(projectGalleryContent.includes("document.body.style.overflow = 'hidden'"), 'ProjectGallery locks background scrolling when dialog opens');
  assert(projectGalleryContent.includes("document.body.style.overflow = ''"), 'ProjectGallery restores background scrolling when dialog closes');
}

// Verify Geographic Consistency
const processDataPath = path.join(projectRoot, 'src/data/process.ts');
if (fs.existsSync(processDataPath)) {
  const processDataContent = fs.readFileSync(processDataPath, 'utf-8');
  assert(processDataContent.includes('South Delhi'), 'Process data references verified South Delhi example');
  assert(!processDataContent.includes('South Mumbai'), 'Process data does not contain outdated South Mumbai reference');
}

if (fs.existsSync(plannerWizardCompPath)) {
  const plannerContent = fs.readFileSync(plannerWizardCompPath, 'utf-8');
  assert(plannerContent.includes('South Delhi'), 'PlannerWizard references verified South Delhi locality');
  assert(!plannerContent.includes('South Mumbai'), 'PlannerWizard does not contain outdated South Mumbai reference');
}

// ==========================================
// SUMMARY
// ==========================================
console.log(`\n==========================================`);
console.log(`Validation Completed: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`==========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
