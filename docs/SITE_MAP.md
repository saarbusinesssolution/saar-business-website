# Site Map & Route Specifications: SAAR Business Support Solution

## 1. Central Route Registry & Trailing Slash Policy

The canonical URL architecture enforces a strict **Trailing Slash Policy (`trailingSlash: 'always'`)** across all static and dynamic paths, with the exception of the homepage root `/` and system error routes like `/404`.

All application URLs, sitemaps, and navigation components derive their paths from the central TypeScript route registry at [`src/config/routes.ts`](file:///c:/Users/wasee/Desktop/saar-business-website/src/config/routes.ts).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Central Route Registry                          │
│                      (src/config/routes.ts)                            │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Data Navigation │       │ XML Sitemap Gen  │       │ Dynamic Helpers  │
│(src/config/nav.ts│       │ (Search Engines) │       │(getServiceUrl(), │
│                  │       │                  │       │ getProjectUrl()) │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## 2. Route Matrix & Implementation Status

| Route Identifier | Canonical Path | Page Label | Implementation Status | Search Indexability | Primary CTA Intent | Page Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `home` | `/` | Home | ✅ **Implemented** | `true` | Plan Your Project | Brand positioning, four pillars, authority showcase. |
| `services` | `/services/` | Services | ✅ **Implemented** (Step 07) | `true` | Explore Services | Comprehensive architectural & turnkey capabilities overview. |
| `service_detail` | `/services/[slug]/` | Service Detail | ✅ **Implemented** (Step 07) | `true` | Book Consultation | In-depth scope, deliverables, and process per pillar (`/services/interior-design/`, `/services/turnkey-contracting/`). |
| `projects` | `/projects/` | Projects | ✅ **Implemented** (Step 08) | `true` | View Case Studies | Selected works, concepts, and completed builds. |
| `project_detail` | `/projects/[slug]/` | Project Detail | ✅ **Implemented** (Step 08) | `true` | Plan Similar Project | Deep dive into spatial challenge, approach, materials. |
| `about` | `/about/` | About SAAR | ✅ **Implemented** (Step 09) | `true` | Speak With Our Team | Architectural ethos, precision standards, leadership. |
| `process` | `/process/` | Our Process | ✅ **Implemented** (Step 09) | `true` | Start Stage 01 | Transparent 5-stage execution methodology. |
| `plan_my_project` | `/plan-my-project/` | Plan My Project | ✅ **Implemented** (Step 10) | `true` | Submit Project Brief | Guided interactive spatial qualification wizard. |
| `contact` | `/contact/` | Contact | ✅ **Implemented** (Step 11) | `true` | Send Message | Direct consultation enquiry, studio coordinates, consultation guide. |
| `privacy` | `/privacy/` | Privacy Policy | ✅ **Implemented** (Step 11) | `true` | N/A | Data handling policy, service provider disclosures, zero-resale guarantee. |
| `thank_you` | `/thank-you/` | Consultation Next Steps | ✅ **Implemented** (Step 11) | 🚫 **`false`** | Return to Home | Transactional submission confirmation & consultation workflow guide. |
| `not_found` | `/404` | Page Not Found | ✅ **Implemented** (Step 01 & 12) | 🚫 **`false`** | Return to Home | Architectural 404 error redirect landmark (`noindex, nofollow`). |

> [!IMPORTANT]
> **Dynamic Route Safety:** Dynamic URLs (`/services/[slug]/`, `/projects/[slug]/`) must be generated strictly using `getServiceUrl(slug)` and `getProjectUrl(slug)`. Literal `[slug]` strings are programmatically rejected.

---

## 3. Data-Driven Navigation Architecture

The navigation system is separated from presentation components in [`src/config/navigation.ts`](file:///c:/Users/wasee/Desktop/saar-business-website/src/config/navigation.ts). It supports an availability filter (`getAvailableNavItems`) to prevent rendering dead links to planned routes during phased development.

### 3.1 Primary Navigation
* **Services** (`/services/`)
* **Projects** (`/projects/`)
* **Our Process** (`/process/`)
* **About** (`/about/`)
* **Contact** (`/contact/`)
* **Primary Navigation CTA:** **Plan My Project** (`/plan-my-project/`)

### 3.2 Footer Navigation
* **Services Column:** All Services (`/services/`)
* **Company Column:** About SAAR (`/about/`), Our Process (`/process/`), Selected Works (`/projects/`), Contact Us (`/contact/`)
* **Legal Column:** Privacy Policy (`/privacy/`)

---

## 4. Hosted & Staging Route Reconciliation (Step 15)

In Step 15, all 13 routes and endpoints were verified on the active Cloudflare Pages edge runtime (`http://127.0.0.1:8788` via `scripts/test-hosted-runtime.mjs`):

* **11 Public Canonical Routes:** All return HTTP 200 OK with single `<h1>`, valid breadcrumbs, and zero console errors.
* **Utility Routes:** `/thank-you/` and `/404.html` enforce edge `X-Robots-Tag: noindex, nofollow` and HTML meta `noindex, nofollow`.
* **Serverless Edge Function:** `/api/enquiry` handles OPTIONS preflight (HTTP 204) and POST submission with honeypot spam gates, Zod validation, and simulation responses.
* **Dynamic Slugs:** `/services/interior-design/`, `/services/turnkey-contracting/`, and `/projects/courtyard-minimalist-residence/` resolve cleanly. Draft slugs return genuine 404s.

