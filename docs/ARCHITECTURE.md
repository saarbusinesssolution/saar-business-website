# Architecture & Technology Strategy: SAAR Business Support Solution

## 1. Executive Technical Direction

To achieve ultra-fast performance, elite visual fidelity, and effortless maintenance without unnecessary infrastructure costs, SAAR Business Support Solution adopts a modern **Islands Architecture** powered by **Astro 5, Tailwind CSS, TypeScript, and Cloudflare Pages**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge Network                         │
│   (Global Anycast CDN, DDoS Protection, Free SSL, Sub-50ms TTFB)       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          │                                                     │
          ▼                                                     ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│     Static HTML/CSS Pages         │       │     Serverless Function           │
│     (Pre-rendered at Build)       │       │     (/api/enquiry)                │
│                                   │       │                                   │
│  • Homepage (/)                   │       │  • Server-side Zod Validation     │
│  • Services (/services/)          │       │  • Honeypot + Turnstile Spam Gate │
│  • Projects (/projects/)          │       │  • Secure Email Dispatch (Resend) │
│  • About & Process Pages          │       │  • Zero Client Secret Exposure    │
│  • Astro Content Collections      │       │                                   │
└─────────────────┬─────────────────┘       └─────────────────┬─────────────────┘
                  │                                           │
                  ▼                                           ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│     Hydrated UI Islands           │       │   Designated Corporate Inbox      │
│     (Isolated React Component)    │       │   & Verified Business WhatsApp    │
│                                   │       │                                   │
│  • PlanMyProject Interactive      │       │  • hello@saarbusiness.com         │
│  • Mobile Drawer Navigation       │       │  • Instant Notification Alert     │
└───────────────────────────────────┘       └───────────────────────────────────┘
```

---

## 2. Technical Stack Specification

| Layer | Selected Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Meta-Framework** | **Astro 5.x** | Zero-JS by default. Delivers raw static HTML for editorial and marketing pages, ensuring perfect 100/100 Core Web Vitals and stellar search engine indexing. |
| **Language** | **TypeScript (Strict)** | Strict type safety for content schemas, project planner payloads, API contracts, and component props. Prevents runtime regressions. |
| **Styling Engine** | **Tailwind CSS 3.4** | Utility-first CSS compiling to a microscopic production stylesheet. Custom brand tokens enforce exact adherence to the SAAR design system. |
| **Content Layer** | **Astro 5 Content Collections** | Structured content stored in `src/content/` validated via Zod schemas in `src/content.config.ts`. Decouples editorial content from UI. |
| **Route Architecture**| **Central Route Registry** | `src/config/routes.ts` enforces `trailingSlash: 'always'`, separates implementation status from indexability, and eliminates hardcoded URLs. |
| **Interactive Islands** | **React (Deferred to Step 10)**| Loaded strictly where interactive client-side state is required (e.g. `client:visible` for the multi-step `PlanMyProject` wizard). Zero hydration overhead on static pages. |
| **Hosting & CDN** | **Cloudflare Pages** | Direct GitHub integration, immutable preview deploys, global edge delivery with unlimited bandwidth on standard tiers, and native support for serverless Functions. |
| **Serverless Backend** | **Cloudflare Pages Functions** | Lightweight API endpoint (`functions/api/enquiry.ts` or Astro hybrid endpoint) handling form submission, payload validation, spam filtering, and transactional email dispatch. |

---

## 3. URL Canonicalization & Trailing Slash Policy

* **Canonical Policy:** All public static and dynamic URLs enforce trailing slashes (e.g., `/services/`, `/projects/`, `/plan-my-project/`), with the exception of the homepage `/` and system error pages (`/404`).
* **Implementation:** Configured in `astro.config.mjs` with `trailingSlash: 'always'` and centralized in `src/config/routes.ts`.
* **Dynamic Route Generators:** Slugs are validated by `getServiceUrl(slug)` and `getProjectUrl(slug)` to ensure no literal `[slug]` strings or malformed patterns ever leak to public markup.

---

## 4. Content Architecture & Security Pipeline

```
[ Markdown Content: src/content/ ] ──► [ Astro Content Collections (Zod) ]
                                                        │
                                                        ▼
                                          [ Data Sanitization Layer ]
                                          (src/lib/content.ts)
                                                        │
                                     ┌──────────────────┴──────────────────┐
                                     ▼                                     ▼
                            [ Strip internalNotes ]               [ Attach Concept Badge ]
                            (Confidential Data)                   (Mandatory Disclosure)
                                     │                                     │
                                     └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
                                            [ Public UI Components ]
```

1. **Strict Draft Isolation:** Public data-loaders (`getPublishedServices()`, `getPublishedProjects()`) exclude drafts by default. Development-only utilities are explicitly prefixed with `_dev`.
2. **Confidentiality Protection:** The `sanitizePublicProject()` utility strips `internalNotes` before passing data to UI components.
3. **Concept Badging:** Architectural concepts automatically receive `natureLabel: 'Design Concept'` to prevent confusing conceptual renders with completed builds.
4. **Asset Readiness Guard:** Published records cannot reference `planned` or unapproved images.

---

## 5. Project Planner Architecture & Data Handoff (Step 10)

```
┌────────────────────────────────────────────────────────────────────────┐
│               5-Stage Interactive Spatial Wizard                       │
│                     (src/pages/plan-my-project/)                       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  In-Memory State │       │ Validation & UI  │       │ Deterministic    │
│  (briefState JS) │       │ (WCAG Alerts &   │       │ Service Engine   │
│  Zero Persist    │       │ Progress Bar)    │       │ (Confirmed Only) │
└────────┬─────────┘       └──────────────────┘       └────────┬─────────┘
         │                                                     │
         └───────────────────────────┬─────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Stage 05: Review Your Project Brief                  │
│                                                                        │
│  • Sectional Summary Cards with Jump-to-Edit & Return Flow             │
│  • Client-Side Plain Text Brief Generation (saar-project-summary.txt)  │
│  • Live Clipboard Copy with Accessible Status Feedback                 │
│  • WhatsApp Handoff (Safely Disabled When Number Unverified)           │
│  • Standardized Handoff Contract for Step 11 Contact Submission        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
                     [ ProjectBriefPayload Interface ]
                        (Target: Step 11 Contact API)
```

### 5.1 Strict In-Memory State & Privacy Mandate
* **Zero LocalStorage & Cookies:** In strict alignment with privacy regulations and client confidentiality, all brief state is held exclusively in volatile client-side JavaScript memory (`briefState`). Refreshing or navigating away clears the state completely.
* **Zero URL Parameter Leakage:** No user inputs, space dimensions, or contact intentions are appended to URL query parameters or browser history state.
* **No Premature Enquiries:** Generating or reviewing a project brief does **NOT** constitute a submitted enquiry. The interface prominently states that the brief is visitor-curated preparation.

### 5.2 Deterministic Service Recommendation Engine
* Suggestions in Stage 05 are generated deterministically by `src/lib/planner/recommendations.ts`.
* Only currently published and verified service routes (`/services/interior-design/`, `/services/turnkey-contracting/`) are recommended.
* No speculative AI recommendations, probability models, or opaque scoring algorithms are used.

### 5.3 Step 11 Contact Handoff Contract (`src/types/project-brief.ts`)
The planner defines a clean, versioned payload interface ready for consumption by Step 11 (`/contact/` form or `/api/enquiry`):

```typescript
export interface ProjectBriefPayload {
  version: '1.0';
  generatedAt: string;
  category: ProjectCategory;
  propertyType: string;
  customCategoryDescription?: string;
  services: ConfirmedServiceId[];
  guidanceNeeded: boolean;
  requirementsNote?: string;
  locality: string;
  approximateArea?: number;
  areaUnit: AreaUnit;
  stage: ProjectStage;
  stylePreferences?: string[];
  budgetExpectation?: BudgetTier;
  targetTimeline?: ProjectTimeline;
  notes?: string;
}
```

---

## 6. Privacy-Aware Analytics Architecture (Step 13)

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Client Browser Environment                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           │                                                   │
           ▼                                                   ▼
┌───────────────────────────────────┐       ┌───────────────────────────────────┐
│     Consent Manager               │       │     Interactive Applications      │
│     (src/lib/analytics/consent.ts)│       │     • EnquiryForm.astro           │
│                                   │       │     • PlannerWizard.astro         │
│  • Storage: saar_analytics_consent│       │     • ContactActions.astro        │
│  • State: granted | denied | unset│       │     • CTASection.astro            │
│  • Cookie Purge on Withdrawal     │       └─────────────────┬─────────────────┘
└──────────────────┬────────────────┘                         │
                   │                                          │
                   ▼ (Status === 'granted')                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Central Analytics Client                             │
│                   (src/lib/analytics/client.ts)                        │
│                                                                        │
│  • Strict Payload Sanitizer (src/lib/analytics/events.ts)              │
│  • Zero-PII Boundary: Strips names, emails, phones, notes, brief state  │
│  • Preview & Local Protection: No hits from localhost or *.pages.dev    │
│  • Localhost Developer Diagnostics Console Logging                     │
│  • Dynamic Script Injection (gtag.js)                                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼ (Production Host + Granted Consent)
┌────────────────────────────────────────────────────────────────────────┐
│                       Google Analytics 4 (GA4)                         │
│   (send_page_view: false, anonymize_ip: true, restricted_data: true)   │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Architectural Mandates
1. **Direct GA4 (`gtag.js`):** Strictly avoids Google Tag Manager (GTM) to eliminate redundant script tags and payload duplication.
2. **Conservative Opt-In Consent:** No external tracking scripts load, and no cookies are stored until explicit visitor consent is granted via `ConsentBanner.astro`.
3. **Zero-PII Payload Enforcement:** All outgoing parameters pass through `sanitizeEventPayload()`, strictly stripping visitor names, telephone numbers, emails, WhatsApp messages, dimensions, budgets, and project brief contents.
4. **Authoritative Conversion Boundary:** `generate_lead` triggers exclusively when the serverless `/api/enquiry` endpoint returns `{ success: true }` without simulation. Thank-you visits, WhatsApp taps, and planner reviews are tracked as distinct intent signals.
5. **Environment Isolation:** Local development and preview deployments (`*.pages.dev`, `localhost`) never emit network hits to production GA4 properties, logging structured diagnostics to the browser console instead.


