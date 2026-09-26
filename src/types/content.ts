/**
 * Core type definitions for SAAR Business Support Solution
 * Central route registry, navigation, image metadata, services, and project models.
 */

// ==========================================
// 1. ROUTE REGISTRY & NAVIGATION TYPES
// ==========================================

export type RouteId =
  | 'home'
  | 'services'
  | 'service_detail'
  | 'projects'
  | 'project_detail'
  | 'about'
  | 'process'
  | 'plan_my_project'
  | 'contact'
  | 'privacy'
  | 'thank_you'
  | 'not_found';

export type RouteStatus = 'implemented' | 'planned';

export interface RouteDefinition {
  /** Stable identifier for programmatic reference */
  id: RouteId;
  /** Normalized canonical path adhering to trailing-slash convention */
  path: string;
  /** Human-readable label for navigation and document titles */
  label: string;
  /** Architectural purpose and intent of the page */
  purpose: string;
  /** Implementation status in current phase (prevents treating planned pages as live) */
  status: RouteStatus;
  /** Whether search engine crawlers should index this route */
  isIndexable: boolean;
  /** Primary user intent / conversion call-to-action */
  primaryCtaIntent: string | null;
  /** Whether this is a parameterized dynamic route template (e.g. [slug]) */
  isDynamic?: boolean;
}

export interface NavigationItem {
  routeId: RouteId;
  label: string;
  path: string;
  isAvailable: boolean;
  isCta?: boolean;
}

export interface NavigationConfig {
  primary: NavigationItem[];
  primaryCta: NavigationItem;
  footer: {
    services: NavigationItem[];
    company: NavigationItem[];
    legal: NavigationItem[];
  };
}

// ==========================================
// 2. IMAGE METADATA TYPES
// ==========================================

export type ImageClassification =
  | 'actual_project'
  | 'concept'
  | 'illustrative'
  | 'brand_asset';

export type ImagePermissionStatus = 'approved' | 'pending' | 'restricted';

export type ImageReadiness = 'available' | 'planned';

export interface ImageMetadata {
  id: string;
  assetPath: string;
  intendedSection: string;
  purpose: string;
  altText: string;
  isDecorative: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
  aspectRatio: string;
  classification: ImageClassification;
  sourceCredit?: string;
  permissionStatus: ImagePermissionStatus;
  readiness: ImageReadiness;
}

// ==========================================
// 3. SERVICE CONTENT TYPES
// ==========================================

export type PublicationStatus = 'draft' | 'published';
export type VerificationStatus = 'pending_confirmation' | 'verified';

export interface ServiceProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  shortSummary: string;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  overview: string;
  suitableProjectTypes: string[];
  deliverables: string[];
  exclusions?: string[];
  processSteps: ServiceProcessStep[];
  heroImageId?: string;
  relatedProjectIds: string[];
  faqs: ServiceFaq[];
  ctaIntent: string;
  seoTitle: string;
  seoDescription: string;
  order: number;
}

// ==========================================
// 4. PROJECT / CASE STUDY TYPES
// ==========================================

export type ProjectNature = 'actual' | 'concept';
export type ProjectCategory =
  | 'Interior Design'
  | 'Turnkey Contracting'
  | 'Renovation'
  | 'Property Solutions'
  | 'Residential Projects'
  | 'Commercial Projects'
  | 'Hospitality'
  | 'Retail & Showrooms';

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  publicationStatus: PublicationStatus;
  projectNature: ProjectNature;
  category: ProjectCategory;
  spaceType: string;
  summary: string;
  location?: string;
  relatedServiceIds: string[];
  designStyleTags: string[];
  theSpace: string;
  challenge?: string;
  approach?: string;
  deliverables: string[];
  result?: string;
  coverImageId: string;
  galleryImageIds: string[];
  featured: boolean;
  completionDate?: string;
  seoTitle: string;
  seoDescription: string;
  /** Internal review & evidence notes - NEVER exposed to public consumers */
  internalNotes?: string;
  /** Whether images are demo/illustrative or actual project photos */
  imageType?: 'demo' | 'actual';
  /** Client name for the project */
  clientName?: string;
}

/**
 * Sanitized public project data returned to UI components.
 * Strips confidential internal review notes and attaches presentation badges.
 */
export interface PublicProject extends Omit<ProjectData, 'internalNotes'> {
  natureLabel: 'Design Concept' | 'Verified Project';
}
