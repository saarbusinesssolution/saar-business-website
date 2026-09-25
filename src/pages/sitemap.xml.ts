import type { APIRoute } from 'astro';
import { getPublishedServices, getPublishedProjects } from '../lib/content';
import { getIndexableRoutes, getServiceUrl, getProjectUrl } from '../config/routes';
import { SITE_URL } from '../lib/seo/metadata';

export const GET: APIRoute = async () => {
  // 1. Static indexable routes from central routes registry
  // (strictly excludes /thank-you/, /404, /dev/*, and dynamic placeholders)
  const staticRoutes = getIndexableRoutes().map((route) => `${SITE_URL}${route.path}`);

  // 2. Published & verified services (excludes drafts like renovation & property-solutions)
  const publishedServices = await getPublishedServices();
  const serviceRoutes = publishedServices.map((service) => `${SITE_URL}${getServiceUrl(service.slug)}`);

  // 3. Published projects (excludes drafts)
  const publishedProjects = await getPublishedProjects();
  const projectRoutes = publishedProjects.map((project) => `${SITE_URL}${getProjectUrl(project.slug)}`);

  // Combine and deduplicate URLs
  const allUrls = Array.from(new Set([...staticRoutes, ...serviceRoutes, ...projectRoutes]));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
