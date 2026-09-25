import type { ImageMetadata } from '../types/content';

/**
 * Central registry of all known visual assets for SAAR Business Support Solution.
 * Real files on disk are classified as 'available'.
 * Unproduced future photography/renders are marked as 'planned'.
 */
export const IMAGES: Record<string, ImageMetadata> = {
  // ==========================================
  // AVAILABLE BRAND IDENTITY ASSETS
  // ==========================================
  brand_logo_full: {
    id: 'brand_logo_full',
    assetPath: '/images/brand/logo-full.png',
    intendedSection: 'Global Header / Homepage Foundation',
    purpose: 'Primary brand identity lockup with tagline and service pillars',
    altText: 'Saar Business Support Solution Logo',
    isDecorative: false,
    dimensions: { width: 2172, height: 724 },
    aspectRatio: '3:1',
    classification: 'brand_asset',
    sourceCredit: 'Official SAAR Identity Assets',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  brand_logo_full_webp: {
    id: 'brand_logo_full_webp',
    assetPath: '/images/brand/logo-full.webp',
    intendedSection: 'Global Header (WebP Optimized)',
    purpose: 'Compressed retina-ready web derivative of full logo lockup',
    altText: 'Saar Business Support Solution Logo',
    isDecorative: false,
    dimensions: { width: 1200, height: 400 },
    aspectRatio: '3:1',
    classification: 'brand_asset',
    sourceCredit: 'Official SAAR Identity Assets',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  brand_logo_icon: {
    id: 'brand_logo_icon',
    assetPath: '/images/brand/logo-icon.png',
    intendedSection: 'Favicon / Mobile App Mark / 404 Landmark',
    purpose: 'Isometric ribbon S monogram with technical drafting coordinate grid',
    altText: 'SAAR Isometric Monogram Icon',
    isDecorative: false,
    dimensions: { width: 1254, height: 1254 },
    aspectRatio: '1:1',
    classification: 'brand_asset',
    sourceCredit: 'Official SAAR Identity Assets',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  brand_logo_icon_webp: {
    id: 'brand_logo_icon_webp',
    assetPath: '/images/brand/logo-icon.webp',
    intendedSection: 'Mobile Bar / Landmark (WebP Optimized)',
    purpose: 'Compressed web derivative of monogram icon',
    altText: 'SAAR Isometric Monogram Icon',
    isDecorative: false,
    dimensions: { width: 512, height: 512 },
    aspectRatio: '1:1',
    classification: 'brand_asset',
    sourceCredit: 'Official SAAR Identity Assets',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  brand_palette_board: {
    id: 'brand_palette_board',
    assetPath: '/images/brand/branding-color-board.png',
    intendedSection: 'Brand Reference & Design Documentation',
    purpose: 'Official color palette and identity lockups sheet',
    altText: 'SAAR Brand Identity and Color Palette Sheet',
    isDecorative: false,
    dimensions: { width: 1448, height: 1086 },
    aspectRatio: '4:3',
    classification: 'brand_asset',
    sourceCredit: 'Official SAAR Identity Assets',
    permissionStatus: 'approved',
    readiness: 'available',
  },

  // ==========================================
  // AVAILABLE ARCHITECTURAL ASSETS (Generated in Step 04)
  // ==========================================
  hero_architectural_main: {
    id: 'hero_architectural_main',
    assetPath: '/images/hero/hero-architectural-main.webp',
    intendedSection: 'Homepage Hero',
    purpose: 'Primary visual anchor showcasing architectural proportion, daylight, and courtyard transition',
    altText: 'Minimalist contemporary Indian living space opening onto a lush internal courtyard garden',
    isDecorative: false,
    dimensions: { width: 2400, height: 1350 },
    aspectRatio: '16:9',
    classification: 'concept',
    sourceCredit: 'SAAR Architectural Concept Generation (Step 04)',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  service_hero_interior_design: {
    id: 'service_hero_interior_design',
    assetPath: '/images/services/interior-design.webp',
    intendedSection: 'Service Detail & Card - Interior Design',
    purpose: 'Editorial presentation of bespoke residential dining, joinery, and warm ambient illumination',
    altText: 'Bespoke walnut millwork and dining space with warm architectural backlighting',
    isDecorative: false,
    dimensions: { width: 1200, height: 900 },
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'SAAR Architectural Concept Generation (Step 04)',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  service_hero_turnkey_contracting: {
    id: 'service_hero_turnkey_contracting',
    assetPath: '/images/services/turnkey-contracting.webp',
    intendedSection: 'Service Detail & Card - Turnkey Contracting',
    purpose: 'Commercial corporate fit-out showcasing acoustic slatted ceiling and industrial glass partitions',
    altText: 'Commercial executive conference room with acoustic wood baffles and framed glass partitions',
    isDecorative: false,
    dimensions: { width: 1200, height: 900 },
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'SAAR Architectural Concept Generation (Step 04)',
    permissionStatus: 'approved',
    readiness: 'available',
  },

  // ==========================================
  // PROMPT READY / PENDING GENERATION ASSETS
  // ==========================================
  service_hero_renovation: {
    id: 'service_hero_renovation',
    assetPath: '/images/services/renovation.webp',
    intendedSection: 'Service Detail & Card - Renovation',
    purpose: 'Modernized structural restoration and spatial transformation',
    altText: 'Architectural renovation showcasing restored masonry, black steel framing, and herringbone wood floor',
    isDecorative: false,
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'Curated Architectural Concept',
    permissionStatus: 'pending',
    readiness: 'planned',
  },
  service_hero_property_solutions: {
    id: 'service_hero_property_solutions',
    assetPath: '/images/services/property-solutions.webp',
    intendedSection: 'Service Detail & Card - Property Solutions',
    purpose: 'Commercial floor plate feasibility and spatial assessment',
    altText: 'Open commercial floor plate during architectural inspection and layout analysis',
    isDecorative: false,
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'Curated Architectural Concept',
    permissionStatus: 'pending',
    readiness: 'planned',
  },
  project_concept_courtyard_villa_cover: {
    id: 'project_concept_courtyard_villa_cover',
    assetPath: '/images/projects/courtyard-villa/cover.webp',
    intendedSection: 'Project Showcase Cover - The Courtyard Pavilion',
    purpose: 'Double-height residential pavilion with limestone flooring',
    altText: 'Minimalist luxury villa living pavilion featuring natural light and travertine floor',
    isDecorative: false,
    dimensions: { width: 1200, height: 750 },
    aspectRatio: '16:10',
    classification: 'concept',
    sourceCredit: 'Curated Concept Visualization (Step 04 / Step 08)',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  project_concept_courtyard_villa_gallery_1: {
    id: 'project_concept_courtyard_villa_gallery_1',
    assetPath: '/images/projects/courtyard-villa/gallery-1.webp',
    intendedSection: 'Project Gallery - The Courtyard Pavilion',
    purpose: 'Central circulation courtyard and bespoke fluted wood partitions',
    altText: 'Internal courtyard sightline with fluted timber partitions and recessed fixtures',
    isDecorative: false,
    dimensions: { width: 1024, height: 768 },
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'Curated Concept Visualization (Step 04 / Step 08)',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  project_concept_courtyard_villa_gallery_2: {
    id: 'project_concept_courtyard_villa_gallery_2',
    assetPath: '/images/projects/courtyard-villa/gallery-2.webp',
    intendedSection: 'Project Gallery - The Courtyard Pavilion',
    purpose: 'Material tactile flat-lay: brushed brass, silver travertine, and fumed oak',
    altText: 'Architectural material palette detailing travertine, brass hardware, and oak wood',
    isDecorative: false,
    dimensions: { width: 1024, height: 768 },
    aspectRatio: '4:3',
    classification: 'concept',
    sourceCredit: 'Curated Concept Visualization (Step 04 / Step 08)',
    permissionStatus: 'approved',
    readiness: 'available',
  },
  project_concept_linear_commercial_cover: {
    id: 'project_concept_linear_commercial_cover',
    assetPath: '/images/projects/linear-commercial/cover.webp',
    intendedSection: 'Project Showcase Cover - Linear Commercial Suite',
    purpose: 'Executive corporate office suite with linear lighting and glass partitions',
    altText: 'Contemporary corporate executive suite with linear acoustic ceiling and marble reception',
    isDecorative: false,
    aspectRatio: '16:10',
    classification: 'concept',
    sourceCredit: 'Curated Concept Visualization',
    permissionStatus: 'pending',
    readiness: 'planned',
  },
  about_studio_craft: {
    id: 'about_studio_craft',
    assetPath: '/images/about/studio-craft.webp',
    intendedSection: 'About Page - Philosophy & Detailing',
    purpose: 'Studio craftsmanship, drafting tools, and material samples',
    altText: 'Architectural blueprints, marble swatches, and drafting instruments on studio desk',
    isDecorative: false,
    aspectRatio: '3:2',
    classification: 'concept',
    sourceCredit: 'Curated Studio Imagery',
    permissionStatus: 'pending',
    readiness: 'planned',
  },
};

/**
 * Retrieve image metadata by its registered ID.
 */
export function getImageMetadata(id: string): ImageMetadata | null {
  return IMAGES[id] || null;
}

/**
 * Check if an image is verified and available on the filesystem.
 */
export function isImageAvailable(id: string): boolean {
  const meta = IMAGES[id];
  return Boolean(meta && meta.readiness === 'available');
}

/**
 * Validates that an image meets all publication criteria.
 * Published content must NEVER reference planned or unapproved images.
 */
export function validateImageForPublication(id: string): { valid: boolean; reason?: string } {
  const meta = IMAGES[id];
  if (!meta) {
    return { valid: false, reason: `Image ID "${id}" is not registered in the image registry.` };
  }
  if (meta.readiness !== 'available') {
    return {
      valid: false,
      reason: `Image "${id}" has readiness status "${meta.readiness}". Published content requires "available" assets.`,
    };
  }
  if (meta.permissionStatus !== 'approved') {
    return {
      valid: false,
      reason: `Image "${id}" has permission status "${meta.permissionStatus}". Published content requires "approved" assets.`,
    };
  }
  if (!meta.isDecorative && (!meta.altText || meta.altText.trim() === '')) {
    return {
      valid: false,
      reason: `Informative image "${id}" requires non-empty alt text for accessibility.`,
    };
  }
  return { valid: true };
}
