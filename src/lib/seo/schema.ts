import { SITE_URL } from './metadata';
import type { BreadcrumbItem } from '../../components/ui/Breadcrumbs.astro';

/**
 * Returns the authoritative Organization schema for SAAR Business Support Solution.
 * Uses only verified public facts: no fabricated ratings, founding years, or price ranges.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'SAAR Business Support Solution',
    alternateName: 'SAAR',
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-full.webp`,
    telephone: '+91 9930321817',
    email: 'saarbusinesssolution@gmail.com',
    description:
      'Premier architectural space planning, bespoke interior design, and turnkey contracting solutions in Delhi NCR and western regional markets.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop No. 1, Thakkar Residency, Plot No. 224, Sector 17',
      addressLocality: 'Ulwe',
      addressRegion: 'Maharashtra',
      postalCode: '410206',
      addressCountry: 'IN',
    },
    founder: {
      '@type': 'Person',
      name: 'Ramnewas Verma',
      jobTitle: 'Proprietor',
      image: `${SITE_URL}/images/team/ramnewas-verma.webp`,
    },
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Maharashtra',
      },
      {
        '@type': 'City',
        name: 'Navi Mumbai',
      },
      {
        '@type': 'City',
        name: 'Mumbai',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Delhi NCR',
      },
      {
        '@type': 'City',
        name: 'South Delhi',
      },
      {
        '@type': 'City',
        name: 'Gurgaon',
      },
      {
        '@type': 'City',
        name: 'Noida',
      },
    ],
    knowsAbout: [
      'Architectural Space Planning',
      'Interior Design',
      'Turnkey Contracting',
      'Residential Renovation',
      'Commercial Interiors',
    ],
  };
}

/**
 * Returns the LocalBusiness schema representing the physical studio entity.
 * Strictly uses verified details: no fabricated opening hours, reviews, or prices.
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'SAAR Business Support Solution',
    alternateName: 'SAAR',
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo-full.webp`,
    image: `${SITE_URL}/images/brand/logo-full.webp`,
    telephone: '+91 9930321817',
    email: 'saarbusinesssolution@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop No. 1, Thakkar Residency, Plot No. 224, Sector 17',
      addressLocality: 'Ulwe',
      addressRegion: 'Maharashtra',
      postalCode: '410206',
      addressCountry: 'IN',
    },
    founder: {
      '@type': 'Person',
      name: 'Ramnewas Verma',
      jobTitle: 'Proprietor',
      image: `${SITE_URL}/images/team/ramnewas-verma.webp`,
    },
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

/**
 * Returns the WebSite schema representing the root domain.
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Saar Business Support Solution',
    url: SITE_URL,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en',
  };
}

export interface WebPageSchemaOptions {
  canonicalUrl: string;
  title: string;
  description: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
}

/**
 * Returns a standardized WebPage schema linked to the site and organization entities.
 */
export function getWebPageSchema({
  canonicalUrl,
  title,
  description,
  type = 'WebPage',
}: WebPageSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en',
  };
}

export interface ServiceSchemaOptions {
  canonicalUrl: string;
  name: string;
  description: string;
  serviceType: string;
}

/**
 * Returns a Service schema for published discipline detail pages.
 */
export function getServiceSchema({
  canonicalUrl,
  name,
  description,
  serviceType,
}: ServiceSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonicalUrl}#service`,
    name,
    description,
    serviceType,
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Delhi NCR',
    },
  };
}

/**
 * Returns a BreadcrumbList schema matching visible wayfinding navigation.
 */
export function getBreadcrumbListSchema(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const rawHref = item.href || '';
      const isAbsolute = rawHref.startsWith('http://') || rawHref.startsWith('https://');
      const cleanHref = rawHref.replace(/^\/+/, '');
      const absoluteUrl = isAbsolute
        ? rawHref
        : cleanHref === ''
          ? `${SITE_URL}/`
          : `${SITE_URL}/${cleanHref}`;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: absoluteUrl,
      };
    }),
  };
}

/**
 * Safely serializes an object into JSON-LD script content, escaping `<` to prevent XSS breakout.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
