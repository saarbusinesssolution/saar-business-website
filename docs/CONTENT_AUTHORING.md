# Content Authoring & Publication Guide: SAAR Business Platform

This guide outlines the standard operating procedure for adding, editing, and publishing architectural services, project case studies, and visual assets on the SAAR web platform.

---

## 1. How to Add a Service

Services represent core architectural and contracting disciplines. They are stored as Markdown documents in `src/content/services/[slug].md`.

### Step-by-Step Procedure
1. Create a new markdown file: `src/content/services/<service-id>.md`.
2. Populate the required frontmatter schema:
   ```yaml
   ---
   id: "commercial-fitout"
   title: "Commercial Fit-Out"
   shortSummary: "Turnkey office and retail space interior engineering."
   publicationStatus: "draft" # Always start in draft!
   verificationStatus: "pending_confirmation" # Mark verified only after client approval
   overview: "Comprehensive description of commercial execution capabilities..."
   suitableProjectTypes:
     - "Corporate Offices"
     - "Flagship Retail"
   deliverables:
     - "MEP layouts and schematic approvals"
     - "Acoustic ceiling and partition installation"
   exclusions:
     - "Unregistered third-party subcontractors"
   processSteps:
     - step: 1
       title: "Space Assessment"
       description: "Detailed laser survey and load calculation."
   heroImageId: "service_hero_commercial_fitout" # Must reference src/data/images.ts
   relatedProjectIds: []
   faqs:
     - question: "What is the typical commercial timeline?"
       answer: "Fit-out timelines vary from 4 to 12 weeks based on square footage."
   ctaIntent: "Request Commercial Consultation"
   seoTitle: "Commercial Fit-Out & Office Contracting | SAAR"
   seoDescription: "Turnkey commercial fit-out services by SAAR Business Support Solution."
   order: 5
   ---

   ## Detailed Service Narrative
   Additional markdown content exploring technical methodology...
   ```
3. Run validation: `npm run validate && npm run check`.

---

## 2. How to Add a Project or Case Study

Projects represent design concepts or completed client builds. They are stored in `src/content/projects/[slug].md`.

### Step-by-Step Procedure
1. Create a new markdown file: `src/content/projects/<project-id>.md`.
2. Populate the required frontmatter:
   ```yaml
   ---
   id: "the-monolith-office"
   title: "The Monolith Executive Suite"
   publicationStatus: "draft"
   projectNature: "concept" # 'concept' OR 'actual'
   category: "Turnkey Contracting" # Must match one of the 4 pillars
   spaceType: "Corporate Headquarters"
   summary: "A high-performance workspace combining acoustics and walnut millwork."
   location: "Gujarat Region" # Optional, only when supported
   relatedServiceIds:
     - "turnkey-contracting"
   designStyleTags:
     - "Architectural"
     - "Executive Minimalist"
   theSpace: "Detailed architectural breakdown of the 6,500 sq. ft. floorplate..."
   challenge: "Addressing complex HVAC routing within limited vertical clearance."
   approach: "Exposing structural ribs while integrating acoustic baffle clouds."
   deliverables:
     - "Executive boardroom acoustic ceiling"
     - "Custom walnut executive desking"
   coverImageId: "project_monolith_cover" # Must reference src/data/images.ts
   galleryImageIds:
     - "project_monolith_gallery_1"
   featured: false
   seoTitle: "The Monolith Executive Suite Case Study | SAAR"
   seoDescription: "Corporate turnkey contracting case study by SAAR."
   internalNotes: "Internal client review: awaiting final on-site photography sign-off."
   ---

   ## Architectural Case Narrative
   In-depth narrative of spatial composition, materials, and execution...
   ```
3. **Mandatory Concept Tagging:** If the project is not a verified, completed build, `projectNature: "concept"` is mandatory. The UI will automatically attach the prominent **"Design Concept"** badge.

---

## 3. How to Register Images

All images must be cataloged in the central metadata registry at `src/data/images.ts` before they can be referenced in content.

### Step-by-Step Procedure
1. Place physical files in `public/images/<category>/` (e.g. `public/images/projects/monolith/cover.webp`).
2. Add an entry to `IMAGES` in `src/data/images.ts`:
   ```typescript
   project_monolith_cover: {
     id: 'project_monolith_cover',
     assetPath: '/images/projects/monolith/cover.webp',
     intendedSection: 'Project Cover',
     purpose: 'Hero visual of the executive boardroom',
     altText: 'Executive boardroom with acoustic ceiling and custom walnut table',
     isDecorative: false,
     dimensions: { width: 1400, height: 875 },
     aspectRatio: '16:10',
     classification: 'concept', // 'actual_project' | 'concept' | 'illustrative' | 'brand_asset'
     sourceCredit: 'SAAR Studio 3D Visualization',
     permissionStatus: 'approved', // 'approved' | 'pending' | 'restricted'
     readiness: 'available', // 'available' (if file exists) OR 'planned'
   },
   ```

---

## 4. Keeping Content in Draft

To keep any content entry hidden from public routes:
* Set `publicationStatus: "draft"`.
* For services, keep `verificationStatus: "pending_confirmation"`.

Public data-loaders (`getPublishedServices()`, `getPublishedProjects()`) automatically filter out drafts. Development-only scripts can inspect drafts using explicit `_dev` helpers (`_devGetAllServices()`, `_devGetAllProjects()`).

---

## 5. Reviewing Facts & Asset Permissions

Before promoting any draft to published status, complete the verification audit:
1. **Fact Check:** Confirm no invented metrics, costs, dates, or false client claims exist in the narrative.
2. **Permission Check:** Confirm all referenced image IDs have `permissionStatus: "approved"`.
3. **Readiness Check:** Confirm all referenced images have `readiness: "available"` (physical files exist on disk).
4. **Accessibility Check:** Confirm informative images possess non-empty, descriptive `altText`.

---

## 6. Publishing Approved Content

Once the client provides written verification and genuine assets:
1. In `src/data/images.ts`: Update image entries to `readiness: 'available'` and `permissionStatus: 'approved'`.
2. In the content markdown file:
   * For services: Set `publicationStatus: "published"` and `verificationStatus: "verified"`.
   * For projects: Set `publicationStatus: "published"`. (If `projectNature: "actual"`, ensure client permission is on file).
3. Run the automated publication audit:
   ```bash
   npm run validate
   npm run check
   npm run build
   ```
4. Verify the published item appears cleanly in `dist/` and inspect via `npm run preview`.
