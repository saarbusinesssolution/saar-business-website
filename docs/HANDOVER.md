# SAAR Business Support Solution — Website Handover & Operations Guide

**Document Version:** 1.0.0  
**Target Domain:** `https://saarbusiness.com`  
**GitHub Repository:** `https://github.com/saarbusinesssolution/saar-business-website.git`  
**Hosting Target:** Cloudflare Pages (`saar-business-website`)  
**Production Branch:** `main`  
**Staging / Preview Target:** Non-production branches (`staging.<project>.pages.dev`)

---

## 1. Executive System Overview

The SAAR Business Support Solution website is built with a high-performance **Islands Architecture** using **Astro 5, Tailwind CSS, TypeScript, and Cloudflare Pages**.

* **Static Foundation:** Pages are pre-rendered into ultra-fast static HTML/CSS, providing sub-50ms Time to First Byte (TTFB), flawless Core Web Vitals (zero layout shifts), and optimal search engine discoverability.
* **Serverless Lead Delivery:** Submissions from the Contact form and Guided Project Planner are processed by a dedicated Cloudflare Pages Function (`functions/api/enquiry.ts`) that validates input, blocks spam via honeypot and rate limiting, and dispatches formatted notifications via Resend.
* **Privacy-First Design:** Zero personal identifiable information (PII) is emitted to analytics. Client-side state in the Project Planner is kept strictly in volatile browser memory with zero localStorage or cookies.

---

## 2. Local Development & Operational Commands

### 2.1 Prerequisites
* Node.js v18.17.0+ or v20+ (Node.js v24.18.0 tested)
* Git

### 2.2 Routine Commands

| Task | Command | Description |
| :--- | :--- | :--- |
| **Install Dependencies** | `npm install` | Installs framework and tooling packages. |
| **Start Dev Server** | `npm run dev` | Launches Astro development server on `http://localhost:4321`. Injects `/dev/components` preview gallery. |
| **Local Pages Runtime** | `npm run preview:pages` | Runs the full Cloudflare Pages edge runtime locally on `http://127.0.0.1:8788`, including Pages Functions. |
| **Static Production Build** | `npm run build` | Compiles production assets into `dist/` with canonical `index, follow` tags. |
| **Staging Preview Build** | `npm run build:staging` | Compiles staging assets into `dist/` with site-wide `noindex, nofollow` protection. |
| **Content Validation** | `npm run validate` | Runs 390 automated checks for schemas, routes, SEO tags, and zero-PII rules. |
| **Lead API Tests** | `npm run test:api` | Runs 32 automated tests for serverless form processing and anti-spam gates. |
| **Full QA DOM Audit** | `npm run test:qa` | Runs 695 assertions auditing DOM landmarks, links, images, and secret leaks. |
| **Visitor Journey Tests** | `npm run test:journeys` | Runs 44 assertions verifying all 6 end-to-end visitor flows. |
| **Hosted Runtime Test** | `npm run test:hosted` | Validates all 13 routes and API functions on the local Cloudflare Pages edge runtime. |

---

## 3. Editorial & Content Management

All website content is managed via typed markdown files inside `src/content/` and validated by Zod schemas in `src/content.config.ts`.

### 3.1 Managing Services (`src/content/services/`)
* **Published Services:** `interior-design.md`, `turnkey-contracting.md`.
* **Draft Services:** `renovation.md`, `property-solutions.md`.
* **To publish a service:**
  1. Open `src/content/services/<slug>.md`.
  2. Set `status: 'published'` and `verification: 'verified'`.
  3. Ensure a valid WebP hero image exists in `public/images/services/` and is registered in `src/data/images.ts`.
  4. Run `npm run validate` to confirm schema integrity before pushing.

### 3.2 Managing Projects & Portfolio (`src/content/projects/`)
* **Concepts vs. Actual Projects:**
  - **Conceptual Studies (`nature: 'concept'`):** Automatically labeled with a visible `<Badge variant="concept">Design Concept</Badge>` on overview cards and detail headers.
  - **Actual Client Builds (`nature: 'actual'`):** Reserved for verified commissions with client written release forms and authentic high-resolution site photography.
* **Client Confidentiality Safeguard:**
  - The markdown frontmatter field `internalNotes` is automatically stripped by `sanitizePublicProject()` and will **never** leak into public HTML bundles.

### 3.3 Adding & Replacing Images
1. Convert images to optimized **WebP** format (using Sharp or WebP converter).
2. Recommended dimensions:
   - Hero images: 1920w or 2400w
   - Service cards: 800x600 (4:3)
   - Project cards: 800x500 (16:10)
   - Lightbox gallery: 1200x900 or 1024x768 (4:3)
3. Save the image in `public/images/<section>/`.
4. Register the asset in `src/data/images.ts` with descriptive, architectural alt text.

---

## 4. Updating Business Contact Coordinates

Direct business coordinates are centralized in [`src/config/site.ts`](file:///c:/Users/wasee/Desktop/saar-business-website/src/config/site.ts) with strict null-safety:

```typescript
export const siteConfig: BusinessConfig = {
  name: 'Saar Business Support Solution',
  shortName: 'SAAR',
  url: 'https://saarbusiness.com',
  tagline: 'Designed with Purpose. Executed with Precision.',
  description: 'Premier architectural, interior design, turnkey contracting, and spatial solutions firm.',
  
  // Update these coordinates once officially approved:
  phone: '+91 98XXX XXXXX',            // Enables direct calling buttons across header and footer
  whatsappNumber: '9198XXXXXXXX',       // Enables floating WhatsApp bar and planner handoff
  email: 'hello@saarbusiness.com',      // Enables direct mailto links
  address: {
    street: 'Studio Address Line',
    city: 'South Delhi',
    state: 'Delhi',
    postalCode: '1100XX',
    country: 'India',
  },
  serviceAreas: ['South Delhi', 'Gurugram', 'Noida', 'Delhi NCR'],
};
```

---

## 5. Reviewing & Handling Client Enquiries

1. **Email Notification:**
   - Every submitted enquiry generates an email to the configured corporate recipient (`ENQUIRY_RECIPIENT_EMAIL`).
   - The subject line displays: `[SAAR Lead] <Discipline/Category> (<Location>) - Ref #SR-XXXXX-XXXX`.
2. **Direct Reply-To:**
   - The notification's `Reply-To` header is set to the client's entered email. Clicking **Reply** in Outlook, Gmail, or Apple Mail will address the response directly to the prospective client.
3. **Structured Brief Attachment:**
   - If the enquiry originated from the Guided Project Planner, a formatted summary table containing space typology, services, locality, approximate square footage, timeline, and budget expectations is embedded in the email body.

---

## 6. Deployment & Hosting Operations (Cloudflare Pages)

### 6.1 Recommended GitHub Continuous Delivery Flow
* **Production Branch:** `main` (automatically deploys to `https://saarbusiness.com`).
* **Staging / Preview Branch:** `staging` (automatically deploys to `https://staging.saar-business-website.pages.dev`).
* Pushing to `staging` generates an isolated preview URL with automatic `noindex, nofollow` search protection.

### 6.2 Managing Environment Secrets
Secrets are managed in the Cloudflare Pages Dashboard under **Settings** → **Environment Variables**:

* **Production Environment:**
  - `RESEND_API_KEY`: Secret API key from [resend.com](https://resend.com).
  - `ENQUIRY_RECIPIENT_EMAIL`: Primary studio inbox (e.g. `hello@saarbusiness.com`).
  - `ENQUIRY_SENDER_EMAIL`: Verified sender address (e.g. `notifications@saarbusiness.com`).
  - `PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`).
* **Preview Environment:**
  - `ENABLE_TEST_MOCK_DELIVERY`: Set to `'true'` to allow testing without consuming live Resend credits.

---

## 7. Rollback & Disaster Recovery Procedures

* **1-Click Rollback in Cloudflare Pages:**
  1. Open the Cloudflare Pages project dashboard for `saar-business-website`.
  2. Select **Deployments** from the left navigation.
  3. Locate the last known good deployment.
  4. Click the three dots (`...`) and select **Rollback to this deployment**. Edge routing updates within 30 seconds.
* **Git Rollback:**
  ```bash
  git revert HEAD
  git push origin main
  ```

---

## 8. Post-Handover External Account Checklist

| Action Item | Responsible Party | Priority | Impact |
| :--- | :--- | :--- | :--- |
| **Grant GitHub Push Access** | Repository Owner | High | Enables direct remote pushing to `origin/main`. |
| **Verify Custom Domain in Resend** | IT / Domain Admin | High | Required for live lead email delivery from `notifications@saarbusiness.com`. |
| **Add Custom Domain in Cloudflare Pages** | Cloudflare Admin | High | Maps `saarbusiness.com` and `www.saarbusiness.com` to the Pages project. |
| **Register Google Analytics Container** | Marketing / Owner | Medium | Populates `PUBLIC_GA_MEASUREMENT_ID` for privacy-aware metrics. |
| **Submit Sitemap to Google Search Console** | SEO Specialist | Medium | Submits `https://saarbusiness.com/sitemap.xml` for accelerated indexing. |
