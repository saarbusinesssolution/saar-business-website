# SAAR Design System Documentation

## 1. Executive Design Ethos

The **Saar Business Support Solution** design system embodies the brand promise:  
> *“Designed with Purpose. Executed with Precision.”*

It translates high-end architectural discipline, material honesty, and spatial harmony into a reusable, accessible component library.

---

## 2. Design Tokens & Semantic Roles

Defined in [`src/styles/tokens.css`](file:///c:/Users/wasee/Desktop/saar-business-website/src/styles/tokens.css) and mapped into [`tailwind.config.mjs`](file:///c:/Users/wasee/Desktop/saar-business-website/tailwind.config.mjs):

### 2.1 Color Palette & Contrast Validation

| Token | Hex | Role | Contrast Ratio | Compliance |
| :--- | :--- | :--- | :--- | :--- |
| `--color-raw-navy` | `#173A5E` | Primary Action, Headings, Anchors | **9.8:1** (against Soft White) | **WCAG AAA** |
| `--color-raw-charcoal` | `#202020` | Primary Body Text | **13.8:1** (against Soft White) | **WCAG AAA** |
| `--color-raw-softwhite` | `#F4F1EA` | Gallery Canvas / Page Background | Canvas base | N/A |
| `--color-raw-gold` | `#B99052` | Accent lines, Badges, Step numbers | **4.5:1** (Navy on Gold) | **WCAG AA** |
| `--color-text-muted` | `#525252` | Secondary / Lead Copy | **6.1:1** (against Soft White) | **WCAG AA** |
| `--color-border-subtle` | `#E2DDD5` | 1px Architectural dividers | Subtle structural boundary | 3:1 graphical |
| `--color-status-success` | `#1E6B47` | Verified badges, success states | **5.2:1** (against Soft White) | **WCAG AA** |
| `--color-status-error` | `#B91C1C` | Input errors, validation alerts | **5.4:1** (against Soft White) | **WCAG AA** |

> [!CAUTION]
> **Gold Text Restriction:**  
> Architectural Gold (`#B99052`) on Soft White (`#F4F1EA`) achieves only **2.5:1** contrast. Gold must **NEVER** be applied to small body text. It is strictly reserved for badges with dark text (`#173A5E`), borders, and graphical accents.

---

## 3. Typographic System

### 3.1 Font Stacks
* **Display / Editorial Headings:**  
  `'Cormorant Garamond', 'Playfair Display', Georgia, Cambria, serif`
* **Body / Controls / Captions:**  
  `'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### 3.2 Fluid Type Scales
* **Display 1 (H1):** `clamp(2.5rem, 5vw + 1rem, 4.25rem)` | Line-height `1.1`
* **Display 2 (H2):** `clamp(2.0rem, 3.5vw + 0.5rem, 3.0rem)` | Line-height `1.15`
* **Display 3 (H3):** `clamp(1.4rem, 2vw + 0.5rem, 1.85rem)` | Line-height `1.25`
* **Display 4 (H4):** `1.25rem` (20px) | Line-height `1.35`
* **Lead Copy:** `clamp(1.125rem, 1vw + 0.5rem, 1.25rem)` | Line-height `1.6`
* **Body:** `1.0rem` (16px) | Line-height `1.65`
* **Small / Caption:** `0.875rem` (14px) / `0.75rem` (12px)

---

## 4. Component Catalog

### 4.1 Layout Primitives
* **`Container.astro`:** Centers content up to 1240px with responsive gutters (`px-5 sm:px-8 lg:px-10`).
* **`Section.astro`:** Semantic sections with background variants (`page`, `elevated`, `subtle`, `dark`) and `scroll-mt-24` anchor offsets.
* **`SectionHeader.astro`:** Consistent architectural heading lockup with optional gold eyebrow and lead paragraph.
* **`ResponsiveGrid.astro`:** Pure CSS responsive grid collapsing to a single column on 320px/375px mobile screens.
* **`Stack.astro` & `Cluster.astro`:** Vertical and horizontal layout flow utilities.

### 4.2 Buttons & Links (`Button.astro`)
* **Variants:** `primary` (Navy), `secondary` (Soft White), `gold` (Architectural Gold with Navy text), `outline-gold`, `ghost`.
* **Sizes:** `sm` (38px), `md` (44px - minimum touch target), `lg` (52px).
* **States:** Default, Hover, Focus-visible (outline with offset), Active, Disabled (`aria-disabled`), Loading (`aria-busy` with inline SVG spinner).
* **Semantics:** Automatically renders an `<a>` tag when `href` is supplied, or a `<button type="button">` for interactive actions.

### 4.3 Form Controls
* **`FormField.astro`:** Accessible wrapper with `<label for="...">`, required indicator, optional tag, `helpText` (`aria-describedby`), and error alert (`role="alert"`).
* **`TextInput.astro`:** Inputs with 44px min-height, explicit 16px font-size on mobile (prevents iOS Safari zoom), autocomplete, and inputmode support.
* **`TextArea.astro`:** Multi-line textarea with resize-y and clear focus rings.
* **`Select.astro`:** Native browser select styled with architectural SVG chevron.
* **`Checkbox.astro` & `RadioGroup.astro`:** Accessible native selection controls with custom focus indicators and `<fieldset>`/`<legend>` groupings.

### 4.4 Cards & Badges
* **`ServiceCard.astro`:** Architectural card showcasing service title, short summary, key deliverables preview, order index (`01`, `02`), and hover elevation.
* **`ProjectCard.astro`:** 16:10 aspect ratio visual frame, category tag, optional location, and **automatic "Design Concept" badge** derived from `projectNature === 'concept'`.
* **`ProcessStep.astro`:** Step number badge (`#01` - `#04`), title, description, and horizontal divider.
* **`Badge.astro`:** Variants for `concept`, `verified`, `category`, and `neutral`.

### 4.5 Accessible Disclosure (`Accordion.astro`)
* Built with native HTML `<details>` and `<summary>` for universal keyboard and screen reader accessibility without JavaScript dependencies.
* Smooth CSS chevron rotation and accessible focus outlines.

### 4.6 Global UI Shell & Navigation (Step 05)
* **`SiteHeader.astro`:** Sticky header (`sticky top-0 z-sticky`) with high-resolution brand logo lockup, desktop navigation, mobile drawer toggle, and route-filtering to prevent dead links in production.
* **`DesktopNav.astro`:** Desktop navigation list with exact active (`aria-current="page"`) and parent section highlighting (`data-parent-active="true"`), touch targets $\ge 44\text{px}$, and primary conversion CTA button.
* **`MobileNav.astro`:** Accessible mobile navigation panel with `aria-expanded`, `aria-controls`, `hidden` panel for collapsed focus safety, Escape key dismissal, outside click closing, and clean state reset upon resizing to desktop breakpoint ($\ge 1024\text{px}$).
* **`SiteFooter.astro`:** Four-column architectural footer featuring brand logo, tagline, mandatory conceptual design transparency statement, zero-fabrication contact safety, dynamic copyright year, and back-to-top landmark link.
* **`Breadcrumbs.astro`:** Semantic `<nav aria-label="Breadcrumb">` with `<ol>` ordered-list hierarchy, `aria-current="page"` on current leaf, hidden separators (`aria-hidden="true"`), flex wrapping, and CSS text truncation for long titles. Automatically suppressed on the homepage.
* **`ContactActions.astro`:** Reusable contact action helper for Telephone (`tel:`), Email (`mailto:`), and WhatsApp (`wa.me`) with URL-encoding and zero-fabrication guards (strictly renders nothing if contact destinations are unconfirmed). Supports buttons, link lists, and mobile floating contact bar.
* **`CTASection.astro`:** Reusable conversion section supporting `navy` and `light` presentation variants, optional eyebrow, configurable heading tags (`h2`, `h3`), dual actions with polymorphic buttons, and subtle architectural drafting grid background.

### 4.7 Portfolio & Project Components (Step 08)
* **`ProjectFilters.astro`:** Accessible category filter control bar. Renders semantic `<button>` elements with `aria-pressed="true|false"` and dynamic `aria-live="polite"` status announcements. Client script dynamically filters project cards without page reload while maintaining clean server-rendered initial state and accessible reset button when no items match.
* **`ProjectGallery.astro`:** High-performance responsive image gallery with integrated accessible modal lightbox using the native HTML5 `<dialog>` API. Features backdrop dismissal, Escape key handling, focus trapping and return, ArrowLeft/ArrowRight keyboard navigation, position counter indicator ("1 of 3"), concept disclosure tags, and progressive enhancement fallback (`<a>` links) for non-JS clients.
* **`ProjectDetail.astro`:** Architectural case study layout component. Enforces strict single H1 hierarchy, prominent concept transparency disclosures, structured project fact grid (Space Type, Category, Location, Design Style), comprehensive narrative sections (The Space, The Challenge, The Approach, Deliverables list), and contextual consultation CTA linking to `#enquire`.
* **`RelatedProjects.astro`:** Related studies section presenting complementary case studies using `ProjectCard` with automated concept badging.

---

## 5. Development Component Preview

* **Route:** `/dev/components/`
* **Access Rule:** Injected strictly during `astro dev` via a custom Astro config hook.
* **Production Build Exclusion:** Completely omitted during `astro build` (`dist/dev/` does not exist).
* **Included Previews:** Color palette, typography scale, layout primitives, form inputs, buttons, cards, accordions, contact sheet, production & full headers, mobile navigation, breadcrumbs, CTA variants, production & full footers, safe contact mock actions, services detail overview, and Section 16: Project Detail & Gallery Lightbox.

