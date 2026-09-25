# Privacy-Aware Analytics Architecture & Measurement Plan

## 1. Executive Summary & Privacy Principles

The SAAR Business Support Solution website implements a lightweight, conservative, privacy-aware analytics foundation powered by direct **Google Analytics 4 (GA4)** via `gtag.js`.

The implementation adheres to strict architectural boundaries:
1. **Conservative Opt-In Model:** No analytics scripts (`gtag.js`) load, and no cookies are stored until explicit visitor consent is granted via the consent banner.
2. **Zero Personal Identifiable Information (PII):** Client names, email addresses, telephone numbers, WhatsApp message bodies, floor area numbers, budget expectation figures, and narrative notes are strictly stripped and disallowed from entering event payloads.
3. **No Third-Party Advertising Pixels:** No Meta Pixel, LinkedIn Insight Tag, Google Ads remarketing tags, or third-party behavioral trackers are installed.
4. **Accurate Conversion Boundaries:** The primary business event `generate_lead` fires **exclusively** when the serverless backend (`/api/enquiry`) successfully receives and confirms a consultation enquiry. Button clicks, thank-you page visits, WhatsApp chats, and planner brief generations are treated as distinct interaction signals and are **never** reported as accepted leads.
5. **No GTM Duplication:** Direct `gtag.js` is used exclusively. Google Tag Manager (GTM) is not installed to prevent duplicate event collection and redundant network overhead.

---

## 2. Event Taxonomy & Trigger Boundaries

| Event Name | Trigger Condition / Boundary | Allowed Parameters | Primary Conversion? |
| :--- | :--- | :--- | :--- |
| `page_view` | Explicitly dispatched on document load when consent is granted. | `page_path`, `page_title` | No |
| `service_view` | A verified published service detail page is viewed (`/services/[slug]/`). | `service_id` | No |
| `project_view` | A verified published project study detail page is viewed (`/projects/[slug]/`). | `project_id`, `project_nature` (`concept` \| `actual`) | No |
| `cta_click` | Visitor clicks a primary or secondary call-to-action button. | `cta_id`, `placement` | No |
| `whatsapp_click` | Visitor activates a direct WhatsApp consultation link (`wa.me`). | `placement` | No (Intent Signal) |
| `phone_click` | Visitor activates a telephone call action (`tel:`). | `placement` | No (Intent Signal) |
| `email_click` | Visitor activates an email action (`mailto:`). | `placement` | No (Intent Signal) |
| `planner_start` | Visitor takes their first meaningful input action within Stage 1 of the guided planner (selecting category, property type, or typing). Deduplicated once per run. | `form_origin` (`planner`) | No |
| `planner_step_complete` | Visitor completes stage input validation and advances forward to the next stage. Deduplicated per step per run. | `step_id` (`1`, `2`, `3`, `4`) | No |
| `planner_complete` | Visitor reaches Stage 5 and the editable project brief review summary is generated. Deduplicated once per active run; editing does not refire. | *(None)* | No (High Intent) |
| `project_summary_copy` | Clipboard write operation returns successful confirmation. A failed copy never triggers this event. | *(None)* | No |
| `project_summary_download` | Summary `.txt` file export is initiated by the visitor. | *(None)* | No |
| `enquiry_form_start` | Visitor focuses or inputs into the consultation enquiry form. Deduplicated once per form load. | `form_origin` (`contact` \| `planner`) | No |
| `enquiry_submit_error` | Form validation fails locally, or the server rejects the submission with a categorized error. | `form_origin`, `error_category` (`validation`, `spam_check`, `rate_limited`, `network`, `delivery_unavailable`, `unexpected`) | No |
| **`generate_lead`** | **Authoritative Server Acceptance:** The serverless handler (`/api/enquiry`) returns HTTP 200 with `{ success: true }` and `!simulated`. Never fires on mock delivery, thank-you visits, or clicks. | `form_origin`, `service_id` | **YES (Key Event)** |

---

## 3. Allowed Parameter Schema & Strict Allowlist

To prevent data stuffing or accidental leaks, `src/lib/analytics/events.ts` filters all outgoing payloads against a strict allowlist.

### 3.1 Allowed Parameter Keys
* `page_path`: Clean pathname without URL query strings or hash fragments (truncated to 100 characters).
* `page_title`: Document title string (truncated to 100 characters).
* `cta_id`: Stable identifier of the activated CTA button (e.g. `header-plan-my-project`, `hero-start-planning`).
* `placement`: Architectural UI location (`header`, `hero`, `services`, `service_page`, `projects`, `project_page`, `about`, `process`, `planner`, `contact`, `footer`, `mobile_bar`).
* `service_id`: Published discipline slug (e.g. `interior-design`, `turnkey-contracting`).
* `project_id`: Published project slug (e.g. `courtyard-minimalist-residence`).
* `project_nature`: Classification (`actual` or `concept`).
* `step_id`: Planner stage number (`1`, `2`, `3`, `4`).
* `form_origin`: Submitting container (`contact` or `planner`).
* `error_category`: Sanitized error category (`validation`, `spam_check`, `rate_limited`, `network`, `delivery_unavailable`, `unexpected`).

### 3.2 Strictly Forbidden Payload Patterns
Any parameter containing or matching these patterns is stripped unconditionally before transmission:
* `name`, `email`, `phone`, `mobile`, `whatsapp`
* `message`, `text`, `body`, `note`, `brief`
* `budget`, `cost`, `price`, `area`, `dimension`
* `locality`, `location`, `address`, `city`
* `submissionid`, `reference`, `idempotency`, `token`, `secret`, `password`
* `response`, `payload`, `stack`

---

## 4. Consent Lifecycle & Cookie Governance

### 4.1 Storage & Preferences
* **Consent Key:** `saar_analytics_consent` in `window.localStorage`.
* **Record Structure:** `{"version": 1, "status": "granted" | "denied", "timestamp": "ISO-8601"}`.
* **Default State:** `unset`. When `unset`, no cookies are placed, and the consent banner is rendered.
* **Banner Interaction:**
  * **"Accept Analytics"**: Sets status to `granted`, initializes `gtag.js`, and dispatches initial `page_view`.
  * **"Decline"**: Sets status to `denied`, clears any candidate cookies, and hides the banner.

### 4.2 Preference Management & Withdrawal
* Visitors can view, change, or withdraw consent at any time via the **Your Analytics Preference** widget on the [Privacy Policy](/privacy/) page.
* Upon clicking **"Withdraw Consent & Clear Cookies"**:
  1. Consent status is updated to `denied`.
  2. Future event calls are immediately suppressed.
  3. `clearAnalyticsCookies()` deletes all accessible cookies matching `_ga`, `_gid`, `_gat`, and `_gac_*` across the current hostname and root domain.

---

## 5. Deduplication Strategy

1. **`generate_lead` Deduplication:**
   * Tracked in memory via `window.__SAAR_LAST_LEAD_SUBMISSION__`.
   * If a user retries or double-clicks after an enquiry is already confirmed, the event will not fire twice for the same submission.
   * `submissionId` is held in memory and never transmitted to Google Analytics.
2. **`planner_start` Deduplication:**
   * A single boolean flag `hasFiredPlannerStart` tracks whether the active session has already initiated the planner.
   * Cleared only upon explicit user confirmation of "Restart Planning".
3. **`planner_step_complete` Deduplication:**
   * Uses an in-memory `Set<1 | 2 | 3 | 4>()`.
   * Passing validation on Step 1 records `step_id: 1` once. Navigating back and forward again does not duplicate the completion event.
4. **`planner_complete` Deduplication:**
   * `hasFiredPlannerComplete` boolean flag ensures reaching Stage 5 review generates `planner_complete` exactly once per run.
   * Clicking "Edit Step" from the review summary and returning does **not** generate another completion event.
5. **Page View Deduplication:**
   * `send_page_view: false` is configured during `gtag('config')` initialization.
   * `page_view` is controlled explicitly via `trackPageView()` to prevent GA4 automatic measurement from double-counting.

---

## 6. Known Measurement Limitations & Inbox Reality

1. **Client-Side Ad Blockers & Tracking Protection:**
   * Visitors using Brave, uBlock Origin, Firefox Enhanced Tracking Protection, or Safari ITP may block `gtag.js` entirely.
   * Analytics event counts represent **trends and relative discovery patterns**, not an exhaustive legal ledger of all traffic.
2. **Acceptance vs. Inbox Placement:**
   * `generate_lead` confirms that `/api/enquiry` validated the payload and accepted it for delivery. It does not certify email client inbox delivery (e.g. recipient spam filters).
   * Official inquiry figures must always be verified directly against the studio inbox (`hello@saarbusiness.com`).
3. **Mock Delivery Suppression:**
   * During local automated testing (`ENABLE_TEST_MOCK_DELIVERY=true`), `/api/enquiry` returns `{ success: true, simulated: true }`. The client explicitly suppresses `generate_lead` during simulation.

---

## 7. Development Diagnostics & Local Verification

In local development (`npm run dev`) or when `PUBLIC_ANALYTICS_DEBUG=true` is set:
* Events are formatted and logged to the browser developer console:
  ```
  [SAAR Analytics] event: cta_click { cta_id: 'hero-start-planning', placement: 'hero' }
  ```
* Remote network requests to `www.google-analytics.com` are blocked on `localhost`, `127.0.0.1`, and `*.pages.dev` to protect production datasets from test contamination.

---

## 8. External Account Configuration Checklist (Pre-Launch)

These tasks require Google Analytics administrative console access once production DNS is provisioned:

- [ ] **Data Stream Setup:** Create a Web Data Stream for `https://saarbusiness.com` and obtain the live Measurement ID (`G-XXXXXXXXXX`).
- [ ] **Configure Enhanced Measurement Safely:**
  - In GA4 Admin > Data Streams > Web Stream Details > Enhanced Measurement:
  - Verify that **Outbound clicks** and **File downloads** do not conflict with explicit custom events (`whatsapp_click`, `project_summary_download`).
  - Disable automatic **Form interactions** to prevent GA4 from incorrectly counting contact typing or spam attempts as lead submissions.
- [ ] **Register Custom Dimensions:**
  - `placement` (Event scope)
  - `cta_id` (Event scope)
  - `service_id` (Event scope)
  - `project_id` (Event scope)
  - `form_origin` (Event scope)
  - `error_category` (Event scope)
- [ ] **Mark Key Events (Conversions):**
  - In GA4 Admin > Events:
  - Mark **`generate_lead`** as a **Key Event**.
  - Do **NOT** mark `whatsapp_click`, `planner_complete`, or CTA clicks as primary conversions.
- [ ] **Data Retention Settings:**
  - Navigate to Admin > Data Settings > Data Retention:
  - Set Event Data Retention to 14 months (or 2 months based on organizational compliance requirements).
- [ ] **Internal IP Filtering:**
  - Define internal studio traffic filters to exclude studio staff development and testing traffic.
