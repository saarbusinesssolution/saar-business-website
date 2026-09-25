# SAAR Business Support Solution — Production Release Checklist (Step 16 Preparation)

**Document Version:** 1.0.0  
**Target Release:** Production Release v1.0.0  
**Target Domain:** `saarbusiness.com`  
**Hosting Target:** Cloudflare Pages (Git Integration / Direct Asset Upload)  
**Edge Function Target:** Cloudflare Pages Functions (`functions/api/enquiry.ts`)  
**Base Source Revision:** `62f8090099679af7684c6fe65a787e19948c2a2c` (+ Step 15 staging preparation)

---

## 1. Release Source & Infrastructure Specification

| Parameter | Specification | Verification Method |
| :--- | :--- | :--- |
| **Source Revision** | `62f8090099679af7684c6fe65a787e19948c2a2c` (+ Step 15 commit) | `git rev-parse HEAD` |
| **Production Branch** | `main` | `git branch --show-current` |
| **Build Command** | `npm run build` (`astro build`) | Local build executes in < 5 seconds |
| **Output Directory** | `dist/` | Verified 13 HTML files + `sitemap.xml` |
| **Edge Functions Directory** | `functions/` | Auto-discovered by Cloudflare Pages |
| **Canonical Hostname** | `https://saarbusiness.com` | Defined in `src/config/site.ts` |
| **Deployment Command** | `npx wrangler pages deploy dist --project-name saar-business-website --branch main` | Cloudflare Pages CLI deployment |

---

## 2. Environment Variables & Secret Bindings (By Name Only)

> [!IMPORTANT]
> Never store live production secrets in version control. All production credentials must be set in the Cloudflare Pages Project Settings dashboard (`Settings` → `Environment Variables` → `Production`).

| Variable Name | Type | Purpose | Production Value State |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Secret | Authenticates with Resend REST API for lead delivery | Required (Pending client account) |
| `ENQUIRY_RECIPIENT_EMAIL` | Variable | Designated studio inbox receiving lead notifications | Required (e.g. `hello@saarbusiness.com`) |
| `ENQUIRY_SENDER_EMAIL` | Variable | Verified sender email address | Required (e.g. `notifications@saarbusiness.com`) |
| `PUBLIC_GA_MEASUREMENT_ID` | Variable | Google Analytics 4 Web Stream ID | Required (e.g. `G-XXXXXXXXXX`) |
| `TURNSTILE_SECRET_KEY` | Secret | Cloudflare Turnstile CAPTCHA server-side secret | Optional (If Turnstile is enabled) |
| `PUBLIC_TURNSTILE_SITE_KEY`| Variable | Cloudflare Turnstile public widget site key | Optional (If Turnstile is enabled) |
| `RATE_LIMIT_KV` | KV Binding | Cloudflare KV namespace for distributed rate limiting | Optional (In-memory fallback active) |
| `ENABLE_TEST_MOCK_DELIVERY`| Variable | Simulated mock delivery gate | Must NOT be set to `'true'` in production |

---

## 3. Verified Sender & DNS Configuration Checklist

Before activating live email dispatch:

- [ ] **Custom Domain Verification in Resend:** Add DKIM, SPF, and DMARC TXT records for `saarbusiness.com` in Cloudflare DNS.
- [ ] **Sender Address Match:** Ensure `ENQUIRY_SENDER_EMAIL` matches the verified sending domain (e.g. `notifications@saarbusiness.com`).
- [ ] **Designated Recipient Authorization:** Confirm written authorization for `ENQUIRY_RECIPIENT_EMAIL` to receive live customer project enquiries.
- [ ] **Reply-To Safety:** Verified that `reply_to` in `email-provider.ts` maps directly to the visitor's submitted email address, enabling instant client replies from mail clients.

---

## 4. Final Content & Privacy Readiness Gate

Before initiating production build:

- [ ] **Official Contact Coordinates (`src/config/site.ts`):**
  - Populate confirmed `phone` (e.g. `+91 98XXX XXXXX`).
  - Populate confirmed `whatsappNumber` (e.g. `9198XXXXXXXX`).
  - Populate confirmed `email` (e.g. `hello@saarbusiness.com`).
  - Populate confirmed physical studio `address` (Street, South Delhi, Delhi, PIN).
  - Verify that `hasVerifiedPhone()`, `hasVerifiedEmail()`, and `hasVerifiedWhatsApp()` return `true`.
- [ ] **Concept Disclosure Integrity:**
  - Verify that `courtyard-minimalist-residence` retains `nature: 'concept'` and the visible `<Badge variant="concept">Design Concept</Badge>`.
  - Confirm zero synthetic testimonials, client quotes, or fake employee profiles exist in production files.
- [ ] **Privacy Policy Disclosures:**
  - Confirm `src/pages/privacy/index.astro` accurately reflects the GA4 property configuration, opt-in mechanism, and zero-PII handling.

---

## 5. Search Engine & Edge Protection Audit

- [ ] **Robots Metadata Policy:**
  - Standard production build sets `<meta name="robots" content="index, follow" />` on all 11 canonical public routes.
  - `/thank-you/`, `/404.html`, and `/api/*` have edge `X-Robots-Tag: noindex, nofollow` in `public/_headers`.
- [ ] **XML Sitemap:**
  - `dist/sitemap.xml` contains exactly the 11 public canonical indexable routes.
  - No preview URLs (`*.pages.dev`), draft slugs, or utility endpoints leak into the sitemap.
- [ ] **Domain Redirection:**
  - Configure Cloudflare Page Rule or Redirect Rule to route `www.saarbusiness.com` to `https://saarbusiness.com` (301 Permanent Redirect).

---

## 6. Post-Deployment Smoke Tests (Production Acceptance)

Immediately following production deployment to `saarbusiness.com`:

1. **Automated Hosted Health Check:**
   ```bash
   STAGING_URL=https://saarbusiness.com node scripts/test-hosted-runtime.mjs
   ```
   *Expected:* All 11 public routes return HTTP 200; `/thank-you/` and `/404` return `noindex, nofollow`; security headers match.

2. **Core Visitor Journey Visual Verification:**
   - **Homepage:** Verify Hero image LCP, 5-stage methodology section, and navigation links.
   - **Services:** Verify `/services/interior-design/` and `/services/turnkey-contracting/`.
   - **Portfolio:** Verify `/projects/` and modal lightbox in `/projects/courtyard-minimalist-residence/`.
   - **Planner:** Complete 5-stage wizard on desktop and mobile; verify plain-text brief download.
   - **Contact Form:** Verify form fields, honeypot rendering, and contact method selection.

3. **Authorized Live Lead Delivery Smoke Test:**
   - Submit a single test enquiry:
     - Name: `Release Engineer Smoke Test`
     - Contact Method: `email`
     - Email: `authorized-test@saarbusiness.com`
     - Location: `South Delhi`
     - Service: `interior-design`
     - Message: `Step 16 production release smoke test. Please disregard.`
   - Verify:
     - Response returns HTTP 200 with `{ success: true, simulated: false, reference: "SR-XXXXX-XXXX" }`.
     - Email arrives in designated corporate inbox within 15 seconds.
     - Email displays formatted HTML table with brand header and exact submission details.
     - Clicking "Reply" in mail client populates `authorized-test@saarbusiness.com`.

4. **Analytics Consent Smoke Test:**
   - Open private browsing window on `https://saarbusiness.com`.
   - Confirm no GA4 network hits dispatch prior to consent banner interaction.
   - Click "Accept All" and verify page_view dispatches in Google Analytics Realtime DebugView.
   - Open `/privacy/`, click "Withdraw Consent", and verify `_ga*` cookies are deleted immediately.

---

## 7. Rollback & Contingency Plan

### 7.1 Rollback Targets
- **Initial Production Release (v1.0.0):** As this is the initial deployment of the new website architecture, there is no previous Cloudflare Pages deployment to revert to.
- **Rollback Procedure in Cloudflare Pages:**
  1. If critical defects are discovered post-deploy, navigate to Cloudflare Pages Dashboard: `saar-business-website` → `Deployments`.
  2. Locate the previous stable build and click **Rollback to this deployment**.
  3. Cloudflare Pages re-routes edge traffic within 30 seconds.
- **Emergency Git Reversion:**
  ```bash
  git revert <release-commit-sha>
  git push origin main
  ```
- **Fallback Edge Redirect:**
  If emergency site downtime occurs, activate a Cloudflare Worker or Page Rule redirecting all traffic to a temporary static maintenance splash page or the previous domain records.
