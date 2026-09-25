# Technical SEO, AEO & Local Search Architecture

This document establishes the technical search engine optimization (SEO), answer engine optimization (AEO), and local search standards for **SAAR Business Support Solution** (`saarbusiness.com`).

---

## 1. Architectural Philosophy & Principles

1. **Truthful & Evidence-Based**: Search signals reflect genuine verified business information, published capabilities, and architectural studies. We do not invent ratings, client reviews, price estimates, opening hours, or fictitious branch offices.
2. **Deterministic & Maintainable**: SEO metadata is centralized in a single source of truth (`SEOHead.astro` via `BaseLayout.astro`). Canonical URLs, XML sitemaps, robots rules, and JSON-LD structured data are derived programmatically from the central route registry and content collections.
3. **No Speculative Ranking Claims**: We distinguish technical search engine readiness and valid Schema.org syntax from guaranteed rankings, rich results, or inclusion in AI answer generation engines.
4. **Transparent Project Concept Labeling**: Design concepts (such as The Courtyard Pavilion) are identified accurately across all title tags, meta descriptions, Open Graph cards, and JSON-LD schemas as conceptual architectural studies rather than commissioned client builds.

---

## 2. Central Metadata Architecture

The metadata system is implemented in `src/components/seo/SEOHead.astro` and consumed universally by `src/layouts/BaseLayout.astro`.

### Tag Generation Rules
- **Document Title**: Generates unique, non-duplicative titles formatted as `${pageTitle} | SAAR`. If the page title already includes the business name, suffix duplication is suppressed.
- **Meta Description**: Specific, informative editorial descriptions between 120 and 160 characters summarizing the page purpose without keyword stuffing.
- **Canonical URL**: Every page renders a self-referential absolute canonical tag (e.g., `<link rel="canonical" href="https://saarbusiness.com/services/" />`).
- **Robots Directive**:
  - Production Indexable Pages: `<meta name="robots" content="index, follow" />`
  - Utility & Error Pages (`/thank-you/`, `/404`): `<meta name="robots" content="noindex, nofollow" />`
  - Preview Deployments: Programmatically defaults to `noindex, nofollow` across all routes.
- **Open Graph & Twitter Cards**:
  - Standardized on `summary_large_image` Twitter card.
  - Absolute image URLs resolving to approved production assets (e.g., `https://saarbusiness.com/images/hero-architectural-main.webp` or project/service visuals).
  - Explicit alt text descriptions for all social imagery.

---

## 3. Canonical Host & Trailing-Slash Policy

- **Production Canonical Domain**: `https://saarbusiness.com`
- **Trailing-Slash Convention**: `always` (enforced via `astro.config.mjs`).
  - Home: `https://saarbusiness.com/`
  - Section overviews: `https://saarbusiness.com/services/`, `https://saarbusiness.com/projects/`
  - Dynamic routes: `https://saarbusiness.com/services/interior-design/`, `https://saarbusiness.com/projects/courtyard-minimalist-residence/`
- **Query & Parameter Isolation**: Filter parameters (such as `?category=residential`) or tracking tokens (`?utm_...`) never mutate the canonical URL tag, preventing duplicate indexation.
- **Planned Deployment Redirects**:
  - `http://saarbusiness.com/*` → `https://saarbusiness.com/*` (301 Permanent)
  - `https://www.saarbusiness.com/*` → `https://saarbusiness.com/*` (301 Permanent)

---

## 4. Public Route Inventory & Indexability Matrix

| URL | Purpose | Status | Indexable | Canonical URL | Structured Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Homepage & Executive Overview | Published | Yes | `https://saarbusiness.com/` | `Organization`, `WebSite`, `WebPage` |
| `/services/` | Services Overview | Published | Yes | `https://saarbusiness.com/services/` | `CollectionPage`, `BreadcrumbList` |
| `/services/interior-design/` | Service: Interior Design | Published | Yes | `https://saarbusiness.com/services/interior-design/` | `Service`, `BreadcrumbList` |
| `/services/turnkey-contracting/` | Service: Turnkey Contracting | Published | Yes | `https://saarbusiness.com/services/turnkey-contracting/` | `Service`, `BreadcrumbList` |
| `/projects/` | Portfolio Overview | Published | Yes | `https://saarbusiness.com/projects/` | `CollectionPage`, `BreadcrumbList` |
| `/projects/courtyard-minimalist-residence/` | Case Study: Courtyard Pavilion | Published | Yes | `https://saarbusiness.com/projects/courtyard-minimalist-residence/` | `WebPage`, `BreadcrumbList` |
| `/about/` | About the Practice | Published | Yes | `https://saarbusiness.com/about/` | `AboutPage`, `BreadcrumbList` |
| `/process/` | 5-Stage Spatial Delivery | Published | Yes | `https://saarbusiness.com/process/` | `WebPage`, `BreadcrumbList` |
| `/plan-my-project/` | Guided Spatial Planner | Published | Yes | `https://saarbusiness.com/plan-my-project/` | `WebPage`, `BreadcrumbList` |
| `/contact/` | Studio Consultation Enquiry | Published | Yes | `https://saarbusiness.com/contact/` | `ContactPage`, `BreadcrumbList` |
| `/privacy/` | Legal & Data Handling | Published | Yes | `https://saarbusiness.com/privacy/` | `WebPage`, `BreadcrumbList` |
| `/thank-you/` | Transactional Next Steps | Utility | **No** | `https://saarbusiness.com/thank-you/` | None (`noindex, nofollow`) |
| `/404` | Error Recovery | Error | **No** | None | None (`noindex, nofollow`) |

---

## 5. XML Sitemap Specification

- **Endpoint**: `src/pages/sitemap.xml.ts` generates `dist/sitemap.xml` statically at build time.
- **Inclusion Rules**: Strictly includes the **11 public, canonical, indexable routes** confirmed above.
- **Exclusion Rules**:
  - Non-indexable utility page (`/thank-you/`)
  - Error page (`/404`)
  - Serverless API route (`/api/*`)
  - Draft services (`renovation`, `property-solutions`)
  - Dev-only component preview (`/dev/*`)
- **Modification Dates (`<lastmod>`)**: Omitted unless verified from source revision metadata to prevent fabricating deceptive timestamps on each automated build.

---

## 6. Robots Directives & Edge Headers

### `public/robots.txt`
```txt
User-agent: *
Allow: /
Allow: /images/
Allow: /_astro/

Disallow: /api/
Disallow: /thank-you/
Disallow: /dev/

Sitemap: https://saarbusiness.com/sitemap.xml
```

### Cloudflare Pages Edge Headers (`public/_headers`)
```txt
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/*
  X-Robots-Tag: noindex, nofollow
/thank-you/
  X-Robots-Tag: noindex, nofollow
/404.html
  X-Robots-Tag: noindex, nofollow
```

---

## 7. Staging & Preview Environment Protection

To prevent search engines from indexing ephemeral preview branches (e.g., `*.pages.dev` URLs):

1. **Environment Detection**: `src/lib/seo/metadata.ts` inspects `CF_PAGES_BRANCH` and `PUBLIC_STAGING`.
2. **Automatic Noindex**: If `CF_PAGES_BRANCH` is defined and is not equal to `'main'`, `SEOHead.astro` automatically forces `<meta name="robots" content="noindex, nofollow" />` across the entire build.
3. **Edge Header Redundancy**: In Cloudflare Pages project settings, preview environments can also be protected via Cloudflare Access (Zero Trust) or HTTP Basic Authentication.

---

## 8. Structured Data Strategy (JSON-LD)

Implemented via `src/lib/seo/schema.ts` with XSS mitigation (`safeJsonLd` escapes `<` to `\u003c`):

1. **Organization (`@type: "Organization"`)**:
   - Canonical `@id`: `https://saarbusiness.com/#organization`
   - Name: *Saar Business Support Solution* (Alternate: *SAAR*)
   - Logo: `https://saarbusiness.com/images/brand/logo-full.webp`
   - Area Served: Delhi NCR (South Delhi, Gurgaon, Noida).
   - Knowledge Scope: Architectural Space Planning, Interior Design, Turnkey Contracting.
   - Zero-Fabrication: Strictly excludes fictitious ratings, review counts, price ranges, or opening hours.
2. **WebSite (`@type: "WebSite"`)**:
   - Canonical `@id`: `https://saarbusiness.com/#website`
   - Publisher: Connected to `#organization`.
3. **WebPage (`@type: "WebPage"` / `AboutPage` / `ContactPage` / `CollectionPage`)**:
   - Connected to `#website` and `#organization`.
4. **Service (`@type: "Service"`)**:
   - Rendered on `/services/interior-design/` and `/services/turnkey-contracting/`.
   - Provider references `#organization`.
   - Scope area: Delhi NCR.
5. **Conservative Project Case Study Representation**:
   - Projects are marked as `WebPage` design studies with explicit concept disclosure.
   - Strictly rejects misleading `Product` or `Review` schemas.
6. **BreadcrumbList (`@type: "BreadcrumbList"`)**:
   - Matches visible UI wayfinding items exactly.
   - Positional sequence starting from position 1 at Home.

---

## 9. Answer Engine Optimization (AEO) Guidelines

To assist AI search models and answer engines in extracting accurate, structured facts:

1. **Direct Answers in HTML**: Crucial facts (services offered, process stages, geographical coverage, and deliverables) are rendered in static semantic HTML (`<p>`, `<ul>`, `<ol>`, `<dl>`) rather than obscured inside client-side JavaScript.
2. **Clear Scope Demarcation**: Content clearly articulates what is included (e.g., custom joinery, civil fit-outs) and what is outside the current confirmed scope (e.g., corporate property advisory in onboarding).
3. **Transparent Methodology**: Process stages are sequentially numbered (#01 Discover through #05 Handover) with clear client milestones.
4. **Preparation Checklists**: Consultation guides outline exact prerequisites for clients (site drawings, approximate area, possession timeline) before initial studio review.

---

## 10. Local Search Standards

- **Operating Geography**: Delhi NCR, with primary execution across South Delhi, Gurgaon, and Noida.
- **Location Transparency**: SAAR does not generate programmatic city × service doorway pages (`/interior-design-delhi/`, `/interior-design-gurgaon/`, etc.) that dilute domain authority with duplicate copy.
- **Genuine Project Context**: Project case studies specify genuine architectural contexts (e.g., Gurgaon regional villa study) without fabricating client addresses.

---

## 11. Google Search Console Launch Checklist

Upon domain deployment to production (`https://saarbusiness.com`):

1. **Domain Property Verification**:
   - Add a DNS TXT record in Cloudflare DNS pointing to Google Search Console verification token.
2. **Submit XML Sitemap**:
   - In Search Console > Sitemaps, submit: `https://saarbusiness.com/sitemap.xml`.
   - Verify that 11 URLs are discovered and 0 errors are reported.
3. **Inspect Core URLs**:
   - Run URL Inspection on `https://saarbusiness.com/`, `/services/`, and `/contact/`.
   - Verify that Googlebot renders the page with canonical intact and zero blocked resources.
4. **Verify Noindex Status for Utility Pages**:
   - Test `https://saarbusiness.com/thank-you/` and verify that Search Console identifies the `noindex` tag.
5. **Monitor Coverage & Core Web Vitals**:
   - Track Mobile Usability, HTTPS security, and Core Web Vitals over the initial 30 days post-launch.
