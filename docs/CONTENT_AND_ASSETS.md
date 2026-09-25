# Content Models & Asset Inventory: SAAR Business Support Solution

## 1. Content Integrity Policy & Zero-Fabrication Mandate

In accordance with strict professional standards, **Saar Business Support Solution** enforces zero-tolerance for synthetic or fabricated claims:

1. **No Invented Testimonials:** No fake quotes, fabricated client names, or stock-photo "clients" may ever be published. Client testimonials will only be displayed when accompanied by written client authorization.
2. **Mandatory Concept Tagging:** Any photographic visualization, 3D render, or moodboard that is not an actual completed site project must be visibly badged as `Design Concept` via `getProjectNatureLabel()`.
3. **Data Sanitization:** Internal evidence, review notes, and private contractor communications stored in `internalNotes` are stripped by `sanitizePublicProject()` before data enters public UI components.
4. **Publication Gates:** A content entry cannot be promoted to `published` if it references `planned` or unapproved images, or if its verification status remains `pending_confirmation`.

---

## 2. Implemented Content Collections Schemas (`src/content.config.ts`)

### 2.1 Services Collection Schema
* **ID & Slug:** Lowercase kebab-case string (`interior-design`, `turnkey-contracting`, `renovation`, `property-solutions`).
* **Title:** Human-readable service name.
* **Short Summary:** 1-2 sentence overview for cards and meta descriptions.
* **Publication Status:** `'draft' | 'published'` (All initial records set to `draft`).
* **Verification Status:** `'pending_confirmation' | 'verified'` (Initial records set to `pending_confirmation`).
* **Overview:** In-depth architectural narrative.
* **Suitable Project Types:** Array of target space typologies.
* **Deliverables:** Tangible outputs provided to client.
* **Exclusions:** Boundaries of scope (e.g. non-brokerage for Property Solutions).
* **Process Steps:** Array of `{ step, title, description }`.
* **Hero Image Reference:** ID referencing `src/data/images.ts`.
* **Related Project IDs:** Array linking to project case studies.
* **FAQs:** Array of `{ question, answer }`.
* **CTA Intent:** Conversion call to action.
* **SEO Title & Description:** Dedicated metadata strings.

### 2.2 Projects Collection Schema
* **ID & Slug:** Lowercase kebab-case string.
* **Title:** Project name (e.g. `The Courtyard Pavilion`).
* **Publication Status:** `'draft' | 'published'`.
* **Project Nature:** `'actual' | 'concept'`.
* **Category:** One of the 4 core pillars.
* **Space Type:** Typology (e.g. `Private Residential Villa`, `Corporate Headquarters`).
* **Summary:** Executive spatial synopsis.
* **Location:** City/region (only when verified).
* **Related Service IDs:** Array of service IDs.
* **Design Style Tags:** Array (e.g. `Minimalist`, `Warm Brutalism`).
* **The Space:** Comprehensive architectural description.
* **Challenge & Approach:** Narrative breakdown of engineering constraints and solutions.
* **Deliverables:** Deliverables produced.
* **Result:** Documented outcome (only for actual builds).
* **Cover & Gallery Images:** IDs referencing `src/data/images.ts`.
* **Featured:** Boolean flag for homepage/portfolio highlights.
* **Completion Date:** Optional verified date.
* **SEO Title & Description:** Dedicated metadata strings.
* **Internal Notes:** Confidential development notes (stripped from public helpers).

---

## 3. Central Image Metadata Registry (`src/data/images.ts`)

| Asset ID | Path | Section | Classification | Permission | Readiness | Alt Text |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `brand_logo_full` | `/images/brand/logo-full.png` | Global Header / Home | `brand_asset` | `approved` | `available` | Saar Business Support Solution Logo |
| `brand_logo_full_webp` | `/images/brand/logo-full.webp` | Global Header (Retina WebP) | `brand_asset` | `approved` | `available` | Saar Business Support Solution Logo |
| `brand_logo_icon` | `/images/brand/logo-icon.png` | Favicon / Mobile / 404 | `brand_asset` | `approved` | `available` | SAAR Isometric Monogram Icon |
| `brand_logo_icon_webp` | `/images/brand/logo-icon.webp` | Mobile Bar / Landmark | `brand_asset` | `approved` | `available` | SAAR Isometric Monogram Icon |
| `brand_palette_board` | `/images/brand/branding-color-board.png` | Brand Documentation | `brand_asset` | `approved` | `available` | SAAR Brand Identity and Color Palette Sheet |
| `hero_architectural_main` | `/images/hero/hero-architectural-main.webp` | Homepage Hero | `concept` | `approved` | `available` | Minimalist contemporary Indian living space opening onto courtyard |
| `service_hero_interior_design` | `/images/services/interior-design.webp` | Services: Interior Design | `concept` | `approved` | `available` | Bespoke walnut millwork and dining space with warm backlighting |
| `service_hero_turnkey_contracting`| `/images/services/turnkey-contracting.webp`| Services: Turnkey Contracting | `concept` | `approved` | `available` | Corporate conference room with acoustic wood baffles and glass |
| `service_hero_renovation` | `/images/services/renovation.webp` | Services: Renovation | `concept` | `pending` | `planned` | Architectural renovation showcasing restored masonry and steel |
| `service_hero_property_solutions` | `/images/services/property-solutions.webp` | Services: Property Solutions | `concept` | `pending` | `planned` | Open commercial floor plate during architectural inspection |
| `project_concept_courtyard_villa_cover`| `/images/projects/courtyard-villa/cover.webp`| Projects: Courtyard Villa | `concept` | `approved` | `available` | Minimalist luxury villa living pavilion |
| `project_concept_courtyard_villa_gallery_1`| `/images/projects/courtyard-villa/gallery-1.webp`| Projects: Courtyard Villa | `concept` | `approved` | `available` | Internal courtyard sightline with fluted timber partitions |
| `project_concept_courtyard_villa_gallery_2`| `/images/projects/courtyard-villa/gallery-2.webp`| Projects: Courtyard Villa | `concept` | `approved` | `available` | Architectural material palette detailing travertine |

---

## 4. Pending Business Information & Launch Blockers Checklist

The following items are required from the client prior to public launch and promoting content to `published`:

- [ ] **Official Registered Corporate Entity Name**
- [ ] **Physical Office / Studio Address** (Street address, city, state, PIN code)
- [ ] **Primary Business Phone Number** (Enables direct calling action on homepage and global footer)
- [ ] **Dedicated Business WhatsApp Number** (Enables mobile floating contact bar and direct WhatsApp consultation)
- [ ] **Primary Inbound Lead Email** (Enables studio email consultation inquiries)
- [ ] **Operational Geographic Coverage** (Confirmed list of cities/regions)
- [ ] **Actual Project Portfolio Photography & Case Study Records**
- [ ] **Written Client Permissions for Case Studies**
- [ ] **Property Solutions Scope Clarification** (Scope boundaries must be established before introducing into public service discovery)
- [ ] **Renovation Hero Visual Asset & Structural Boundary Sign-off** (`service_hero_renovation.webp` generation pending model quota reset; consultant boundary review pending)

---

## 5. Service Readiness Classification (Step 07 Audit)

In accordance with strict architectural verification requirements, all service records have been audited and classified:

| Service ID | Title | Status | Verification | Classification | Justification / Missing Inputs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `interior-design` | Interior Design | `published` | `verified` | **Verified and ready to publish** | Deliverables, custom millwork, lighting engineering, and production WebP asset (`service_hero_interior_design`) fully verified. No unverified structural claims. |
| `turnkey-contracting` | Turnkey Contracting | `published` | `verified` | **Verified and ready to publish** | Single-point accountability, BoQ formulation, MEP coordination, and production WebP asset (`service_hero_turnkey_contracting`) fully verified. Excludes uncertified structural alterations. |
| `renovation` | Architectural Renovation | `draft` | `pending_confirmation` | **Verified but missing required content/assets** | Scope copy refined to exclude structural engineering claims. Awaiting production visual asset (`service_hero_renovation.webp`) and formal client boundary sign-off regarding licensed engineering consultancy. Demonstrated in dev preview. |
| `property-solutions` | Property Solutions | `draft` | `pending_confirmation` | **Scope awaiting confirmation** | Kept strictly unpublished as instructed. Commercial scope, pre-lease advisory boundaries, and regulatory compliance require operational sign-off. |
 
---

## 6. Project Readiness Classification (Step 08 Audit)

In accordance with the zero-fabrication mandate and strict architectural portfolio integrity:

| Project ID / Slug | Title | Nature | Status | Classification | Audit Findings & Safeguards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `courtyard-minimalist-residence` | The Courtyard Pavilion | `concept` | `published` | **Approved Architectural Concept** | Spatial design study exploring monolithic travertine, fluted teak partitions, and passive courtyard microclimate ventilation. Prominently labeled with `<Badge variant="concept">Design Concept</Badge>` across cards, overview hero, and detail page. Zero simulated client names, fake budgets, or fictitious completion metrics. Confidential `internalNotes` stripped via `sanitizePublicProject()`. |
| *Client Commission Case Studies* | *Completed Commercial / Residential Builds* | `actual` | `draft` / `unregistered` | **Awaiting Client Sign-off & Photographic Assets** | True completed client projects remain in staging pending: (1) high-resolution site photography, (2) formal written client publication release, and (3) verified project deliverables documentation. No synthetic or placeholder case studies permitted. |

---

## 7. About & Process Content Integrity Audit (Step 09)

In compliance with the Zero-Fabrication Mandate and strict business truthfulness:

### 7.1 Verified Business Facts Used in Public Pages
* **Business Name:** Saar Business Support Solution (`SAAR`).
* **Brand Tagline:** *"Designed with Purpose. Executed with Precision."*
* **Core Practice Ethos:** Uniting architectural interior design sensibility with single-point turnkey contracting accountability.
* **Confirmed Services:** Interior Design & Space Planning (`/services/interior-design/`) and Turnkey Contracting (`/services/turnkey-contracting/`). Renovation presented strictly as staged rollout.
* **Process Stages:** 5-stage sequential delivery:
  1. `#01 Discover`: Spatial Discovery & Brief Formulation
  2. `#02 Plan`: Concept Direction & Spatial Planning
  3. `#03 Design`: Technical Detailing & Material Curation (Concluding milestone for Design-Only engagements; execution baseline for Turnkey Contracting)
  4. `#04 Execute`: Turnkey Execution & Site Management (Turnkey-only scope)
  5. `#05 Handover`: Snag Auditing & Structured Handover (Turnkey-only scope)
* **Single Source of Truth:** `src/data/process.ts` drives both the full `/process/` page and the homepage methodology section (`src/data/home.ts`).

### 7.2 Missing Facts Kept Strictly Absent (Zero-Fabrication Safeguards)
* **Founding Year:** Kept absent. No invented "Est. 2010" or simulated longevity claims.
* **Founder / Executive Identities:** Kept absent. No synthetic founder biographies, fictional leadership portraits, or stock-photo team grids.
* **Awards & Badges:** Kept absent. Zero synthetic "Best Interior Designer" or "No. 1 Turnkey Contractor" claims.
* **Customer Testimonials / Client Quotes:** Kept absent. Zero simulated quotes or invented client names.
* **Statutory Structural Claims:** Structural modifications explicitly disclaimed as requiring external licensed structural engineer sign-off and municipal authority sanction.
* **Preparation Suggestions:** Explicitly presented as helpful starting guidance, not mandatory bureaucratic prerequisites; zero document upload or financial statement requirements.

---

## 8. Project Planner Content Integrity & Qualification Models (Step 10)

In strict alignment with the Zero-Fabrication Mandate:

### 8.1 Categorical Scope & Dynamic Typologies
* **Categories:** `Residential`, `Commercial`, `Hospitality`, `Other`.
* **Dynamic Property Types:** Selecting a category dynamically updates available property typologies. Selecting `Other` renders a mandatory single-line specification field (`customCategoryDescription`).
* **Category Change Safety:** Modifying the category automatically clears incompatible property types and invalidates downstream review states.

### 8.2 Confirmed Services & Mutual Exclusivity
* Supported service selections:
  1. `interior_design`: Interior Design & Space Planning
  2. `turnkey_contracting`: Turnkey Contracting & Execution
  3. `renovation`: Architectural Renovation
  4. `guidance_needed`: *"Not sure — I would like guidance"*
* **Mutual Exclusivity Enforcement:** Selecting `guidance_needed` automatically clears and disables specific service checkboxes. Selecting any specific service immediately unchecks `guidance_needed`.

### 8.3 Zero-Quotation Disclaimers & Budget Integrity
* **No Algorithmic Pricing:** The planner contains **zero** quotation formulas, cost-per-sq-ft calculators, or suitability algorithms.
* **Visitor Expectations Only:** Budget tier selections are prominently labeled as *"Your Budget Expectation"*, accompanied by the mandatory disclaimer:
  > *"Budget figures reflect your initial expectation for planning discussions, not a formal quotation or cost estimate by SAAR. Detailed cost frameworks are prepared only after comprehensive spatial discovery."*
* **Non-Enquiry Clarification:** Generating, reviewing, copying, or downloading a project brief does **not** send an enquiry to SAAR.

### 8.4 Export & Communication Safeguards
* **File Export:** Plain text brief generated purely in-memory via Blob URL as `saar-project-summary.txt` and immediately revoked after download.
* **Clipboard Copy:** Copies formatted brief with fallback; screen reader status feedback announced via `aria-live="polite"`.
* **WhatsApp Deep Link:** Programmatically guarded by `hasVerifiedWhatsApp()`. When `siteConfig.whatsappNumber` is `null`, the action renders an informative disabled badge explaining that WhatsApp will activate once the number is verified.
* **Zero Uploads:** No floor plan uploads, photo submissions, or financial documents are accepted in the planner.

---

## 9. Staging & Final Content Release Status (Step 15 Reconciliation)

In preparation for staging release (Step 15) and production deployment (Step 16):

1. **Published Pages Reconciled:**
   - 11 canonical routes are finalized and verified with approved content models.
   - All draft records (`renovation`, `property-solutions`, unconfirmed client projects) remain isolated from production static generation and sitemap.
2. **Concept Safeguards Preserved:**
   - The Courtyard Pavilion project is published strictly as an approved conceptual study with visible `Design Concept` badging.
   - Zero placeholder text, TODO comments, or lorem ipsum remain in public source code.
3. **Contact Details Gate:**
   - Unverified business credentials (phone, email, WhatsApp, studio address) remain strictly `null` in `src/config/site.ts` with graceful fallback UI rendering.





