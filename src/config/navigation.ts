import { ROUTES, getRoute } from './routes';
import type { NavigationConfig, NavigationItem } from '../types/content';

/**
 * Helper to build a NavigationItem from a registered route.
 */
function createNavItem(
  routeId: keyof typeof ROUTES,
  customLabel?: string,
  isCta: boolean = false
): NavigationItem {
  const route = getRoute(routeId);
  return {
    routeId,
    label: customLabel || route.label,
    path: route.path,
    isAvailable: route.status === 'implemented',
    isCta,
  };
}

/**
 * Master navigation configuration.
 * All paths and labels are bound to the central route registry.
 */
export const navigationConfig: NavigationConfig = {
  primary: [
    createNavItem('services', 'Services'),
    createNavItem('projects', 'Projects'),
    createNavItem('process', 'Our Process'),
    createNavItem('about', 'About'),
    createNavItem('blog', 'Blog & Insights'),
    createNavItem('contact', 'Contact'),
  ],
  primaryCta: createNavItem('plan_my_project', 'Plan My Project', true),
  footer: {
    services: [
      createNavItem('services', 'All Services'),
    ],
    company: [
      createNavItem('about', 'About SAAR'),
      createNavItem('process', 'Our Process'),
      createNavItem('projects', 'Selected Works'),
      createNavItem('blog', 'Blog & Insights'),
      createNavItem('contact', 'Contact Us'),
    ],
    legal: [
      createNavItem('privacy', 'Privacy Policy'),
    ],
  },
};

/**
 * Filter navigation items to include only currently implemented destinations.
 * Used by UI components to prevent rendering 404 dead links while routes are planned.
 */
export function getAvailableNavItems(items: NavigationItem[]): NavigationItem[] {
  return items.filter((item) => item.isAvailable);
}

/**
 * Return all primary navigation items.
 * @param availableOnly If true, filters out planned routes not yet implemented.
 */
export function getPrimaryNavigation(availableOnly: boolean = false): NavigationItem[] {
  if (availableOnly) {
    return getAvailableNavItems(navigationConfig.primary);
  }
  return navigationConfig.primary;
}

/**
 * Return primary CTA item.
 * @param availableOnly If true, returns null if the destination route is not yet implemented.
 */
export function getPrimaryNavCta(availableOnly: boolean = false): NavigationItem | null {
  if (availableOnly && !navigationConfig.primaryCta.isAvailable) {
    return null;
  }
  return navigationConfig.primaryCta;
}
