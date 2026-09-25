import { siteConfig } from '../../config/site';

export const SITE_URL = siteConfig.url.replace(/\/+$/, '');

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-architectural-main.webp`;
export const DEFAULT_OG_IMAGE_ALT = 'Architectural space planning and interior design by SAAR';

/**
 * Normalizes a relative or absolute path into a canonical URL with trailing slash.
 * E.g., '/services' -> 'https://saarbusiness.com/services/'
 * E.g., '/' -> 'https://saarbusiness.com/'
 */
export function getCanonicalUrl(path: string = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      path = url.pathname;
    } catch {
      // Fallback to relative handling
    }
  }

  // Remove duplicate slashes, leading and trailing slashes
  const cleanPath = path.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');

  if (cleanPath === '') {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}/${cleanPath}/`;
}

/**
 * Checks whether the current build or runtime environment is a preview/staging deployment.
 * Cloudflare Pages sets CF_PAGES_BRANCH; if present and not 'main', it's a preview.
 */
export function isPreviewEnvironment(): boolean {
  // Check Node / Vite environment variables safely
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main') {
      return true;
    }
    if (process.env.PUBLIC_STAGING === 'true' || process.env.STAGING === 'true') {
      return true;
    }
  }
  return false;
}
