import type { RouteDefinition, RouteId } from '../types/content';

/**
 * Trailing-slash policy: All canonical routes use a trailing slash,
 * with the exception of the root '/' and system error routes like '/404'.
 * Dynamic routes construct clean trailing-slash URLs from validated slugs.
 */
export const TRAILING_SLASH_POLICY = 'always' as const;

/**
 * Central registry of all intended SAAR website routes.
 * Decouples navigation, sitemaps, and link rendering from hardcoded strings.
 */
export const ROUTES: Record<RouteId, RouteDefinition> = {
  home: {
    id: 'home',
    path: '/',
    label: 'Home',
    purpose: 'Executive overview, four pillars, brand authority, and qualification gateway.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Plan Your Project',
  },
  services: {
    id: 'services',
    path: '/services/',
    label: 'Services',
    purpose: 'Comprehensive architectural, turnkey contracting, and renovation capabilities.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Explore Services',
  },
  service_detail: {
    id: 'service_detail',
    path: '/services/[slug]/',
    label: 'Service Detail',
    purpose: 'In-depth scope inclusions, deliverables, process steps, and FAQs per service.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Book Service Consultation',
    isDynamic: true,
  },
  projects: {
    id: 'projects',
    path: '/projects/',
    label: 'Projects',
    purpose: 'Portfolio index showcasing architectural case studies and design concepts.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'View Case Studies',
  },
  project_detail: {
    id: 'project_detail',
    path: '/projects/[slug]/',
    label: 'Project Case Study',
    purpose: 'Deep dive into spatial challenges, architectural approaches, and materials.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Plan a Similar Project',
    isDynamic: true,
  },
  about: {
    id: 'about',
    path: '/about/',
    label: 'About',
    purpose: 'Design philosophy, architectural ethos, single-point accountability, and standards.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Speak With Our Team',
  },
  proprietor_profile: {
    id: 'proprietor_profile',
    path: '/about/ramniwas-verma/',
    label: 'Ramniwas Verma — Proprietor',
    purpose: 'Authoritative professional profile and verified leadership background of Ramniwas Verma, Proprietor of SAAR Business Support Solution.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Connect with Studio Leadership',
  },
  process: {
    id: 'process',
    path: '/process/',
    label: 'Our Process',
    purpose: 'Transparent 5-stage methodology: Discover, Plan, Design, Execute, and Handover.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Start Stage 01',
  },
  blog: {
    id: 'blog',
    path: '/blog/',
    label: 'Blog & Insights',
    purpose: 'Architectural perspectives, turnkey contracting insights, and practical project planning guides.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Read Articles',
  },
  blog_detail: {
    id: 'blog_detail',
    path: '/blog/[slug]/',
    label: 'Article Detail',
    purpose: 'In-depth informational editorial guide or leadership article.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Discuss Project',
    isDynamic: true,
  },
  plan_my_project: {
    id: 'plan_my_project',
    path: '/plan-my-project/',
    label: 'Plan My Project',
    purpose: 'Interactive 5-step spatial qualification wizard and project brief formulation.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Submit Project Brief',
  },
  contact: {
    id: 'contact',
    path: '/contact/',
    label: 'Contact',
    purpose: 'Direct office coordinates, telephone, verified WhatsApp, and instant inquiry.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: 'Send Message',
  },
  privacy: {
    id: 'privacy',
    path: '/privacy/',
    label: 'Privacy Policy',
    purpose: 'Data protection standards, lead handling commitments, and zero-resale guarantee.',
    status: 'implemented',
    isIndexable: true,
    primaryCtaIntent: null,
  },
  thank_you: {
    id: 'thank_you',
    path: '/thank-you/',
    label: 'Inquiry Received',
    purpose: 'Post-submission confirmation, response time commitments, and next steps.',
    status: 'implemented',
    isIndexable: false, // Critical: Transactional page excluded from search indexing
    primaryCtaIntent: 'Return Home',
  },
  not_found: {
    id: 'not_found',
    path: '/404',
    label: 'Page Not Found',
    purpose: 'Graceful architectural error redirection for missing or mistyped URLs.',
    status: 'implemented',
    isIndexable: false, // Critical: Error page excluded from search indexing
    primaryCtaIntent: 'Return to Home',
  },
};

/**
 * Retrieve a route definition by its stable ID.
 */
export function getRoute(id: RouteId): RouteDefinition {
  const route = ROUTES[id];
  if (!route) {
    throw new Error(`Unknown route ID requested: "${id}"`);
  }
  return route;
}

/**
 * Construct a type-safe canonical URL for an individual service page.
 * Validates that slugs are well-formed and prevents literal "[slug]" leaks.
 */
export function getServiceUrl(slug: string): string {
  if (!slug || slug.trim() === '' || slug.includes('[slug]')) {
    throw new Error(`Invalid service slug provided: "${slug}"`);
  }
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  return `/services/${cleanSlug}/`;
}

/**
 * Construct a type-safe canonical URL for an individual project page.
 * Validates that slugs are well-formed and prevents literal "[slug]" leaks.
 */
export function getProjectUrl(slug: string): string {
  if (!slug || slug.trim() === '' || slug.includes('[slug]')) {
    throw new Error(`Invalid project slug provided: "${slug}"`);
  }
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  return `/projects/${cleanSlug}/`;
}

/**
 * Construct a type-safe canonical URL for an individual blog article.
 * Validates that slugs are well-formed and prevents literal "[slug]" leaks.
 */
export function getBlogUrl(slug: string): string {
  if (!slug || slug.trim() === '' || slug.includes('[slug]')) {
    throw new Error(`Invalid blog slug provided: "${slug}"`);
  }
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  return `/blog/${cleanSlug}/`;
}

/**
 * Returns all indexable static routes intended for the XML sitemap.
 * Excludes transactional, dynamic template strings, and error routes.
 */
export function getIndexableRoutes(): RouteDefinition[] {
  return Object.values(ROUTES).filter((route) => route.isIndexable && !route.isDynamic);
}

/**
 * Returns only routes currently implemented in code.
 */
export function getImplementedRoutes(): RouteDefinition[] {
  return Object.values(ROUTES).filter((route) => route.status === 'implemented');
}
