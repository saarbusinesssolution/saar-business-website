import { getCollection } from 'astro:content';
import { getImageMetadata } from '../data/images';
import type {
  ServiceData,
  ProjectData,
  PublicProject,
  ProjectNature,
  ImageMetadata,
} from '../types/content';

// ==========================================
// 1. DATA SANITIZATION & PRESENTATION HELPERS
// ==========================================

/**
 * Returns a user-facing label distinguishing architectural concepts
 * from commissioned client builds.
 */
export function getProjectNatureLabel(nature: ProjectNature): 'Design Concept' | 'Verified Project' {
  return nature === 'concept' ? 'Design Concept' : 'Verified Project';
}

/**
 * Sanitizes project data before passing to public UI components.
 * 1. Strips internal review and evidence notes (internalNotes).
 * 2. Injects mandatory 'natureLabel' for prominent concept disclosure.
 */
export function sanitizePublicProject(raw: ProjectData): PublicProject {
  const { internalNotes, ...safeFields } = raw;
  return {
    ...safeFields,
    natureLabel: getProjectNatureLabel(raw.projectNature),
  };
}

// ==========================================
// 2. PUBLIC SERVICE LOADERS (EXCLUDES DRAFTS)
// ==========================================

/**
 * Retrieves all published services sorted deterministically by order and title.
 * Strictly excludes draft and unverified services by default.
 */
export async function getPublishedServices(): Promise<ServiceData[]> {
  const entries = await getCollection('services', ({ data }) => {
    return data.publicationStatus === 'published' && data.verificationStatus === 'verified';
  });

  return entries
    .map((entry) => ({
      ...entry.data,
      slug: entry.data.id || entry.id,
    } as ServiceData))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/**
 * Retrieves a single published and verified service by its unique slug.
 * Returns null if the service does not exist, is in draft, or is unverified.
 */
export async function getServiceBySlug(slug: string): Promise<ServiceData | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');

  const entries = await getCollection('services', ({ data }) => {
    const entrySlug = (data.id || '').toLowerCase();
    return (
      entrySlug === cleanSlug &&
      data.publicationStatus === 'published' &&
      data.verificationStatus === 'verified'
    );
  });

  if (entries.length === 0) {
    return null;
  }

  const entry = entries[0];
  return {
    ...entry.data,
    slug: entry.data.id || entry.id,
  } as ServiceData;
}

// ==========================================
// 3. PUBLIC PROJECT LOADERS (EXCLUDES DRAFTS)
// ==========================================

/**
 * Retrieves all published projects sorted deterministically.
 * Strips internal notes and appends concept badges.
 */
export async function getPublishedProjects(): Promise<PublicProject[]> {
  const entries = await getCollection('projects', ({ data }) => {
    return data.publicationStatus === 'published';
  });

  return entries
    .map((entry) => {
      const projectData: ProjectData = {
        ...entry.data,
        slug: entry.data.id || entry.id,
      } as ProjectData;
      return sanitizePublicProject(projectData);
    })
    .sort((a, b) => {
      // Featured projects first, then alphabetical by title
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
}

/**
 * Retrieves a single published project by its unique slug.
 * Returns null if not found or in draft. NEVER silently substitutes another project.
 */
export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');

  const entries = await getCollection('projects', ({ data }) => {
    const entrySlug = (data.id || '').toLowerCase();
    return entrySlug === cleanSlug && data.publicationStatus === 'published';
  });

  if (entries.length === 0) {
    return null;
  }

  const projectData: ProjectData = {
    ...entries[0].data,
    slug: entries[0].data.id || entries[0].id,
  } as ProjectData;

  return sanitizePublicProject(projectData);
}

/**
 * Retrieves published projects flagged as featured.
 */
export async function getFeaturedProjects(): Promise<PublicProject[]> {
  const allPublished = await getPublishedProjects();
  return allPublished.filter((project) => project.featured);
}

// ==========================================
// 4. CROSS-CONTENT RESOLUTION HELPERS
// ==========================================

/**
 * Resolves published projects related to a specific service.
 */
export async function getRelatedProjectsForService(serviceId: string): Promise<PublicProject[]> {
  if (!serviceId) return [];
  const allProjects = await getPublishedProjects();
  return allProjects.filter((project) => project.relatedServiceIds.includes(serviceId));
}

/**
 * Resolves published services related to a specific project.
 */
export async function getRelatedServicesForProject(project: PublicProject): Promise<ServiceData[]> {
  if (!project.relatedServiceIds || project.relatedServiceIds.length === 0) {
    return [];
  }
  const allServices = await getPublishedServices();
  return allServices.filter((service) => project.relatedServiceIds.includes(service.id));
}

/**
 * Resolves published services related to another service (excludes current service).
 */
export async function getRelatedServices(currentServiceId: string): Promise<ServiceData[]> {
  if (!currentServiceId) return [];
  const allServices = await getPublishedServices();
  return allServices.filter((service) => service.id !== currentServiceId);
}

/**
 * Resolves verified image metadata for a given image ID reference.
 */
export function resolveImageMetadata(imageId: string): ImageMetadata | null {
  return getImageMetadata(imageId);
}

// ==========================================
// 5. EXPLICIT DEVELOPMENT FIXTURE ACCESS
// ==========================================

/**
 * Development-only inspection helper.
 * Clearly marked with _dev prefix to prevent accidental use in public views.
 */
export async function _devGetAllServices(includeDrafts: boolean = true): Promise<ServiceData[]> {
  const entries = await getCollection('services', ({ data }) => {
    if (includeDrafts) return true;
    return data.publicationStatus === 'published';
  });

  return entries.map((entry) => ({
    ...entry.data,
    slug: entry.data.id || entry.id,
  } as ServiceData));
}

/**
 * Development-only inspection helper.
 * Clearly marked with _dev prefix to prevent accidental use in public views.
 */
export async function _devGetAllProjects(includeDrafts: boolean = true): Promise<ProjectData[]> {
  const entries = await getCollection('projects', ({ data }) => {
    if (includeDrafts) return true;
    return data.publicationStatus === 'published';
  });

  return entries.map((entry) => ({
    ...entry.data,
    slug: entry.data.id || entry.id,
  } as ProjectData));
}
