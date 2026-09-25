/**
 * Deterministic Service Recommendations: SAAR Business Support Solution
 * Suggests relevant published services based on explicit visitor requirements.
 *
 * Rules:
 * - Simple, explainable, and deterministic.
 * - Links ONLY to published, verified services.
 * - Described as "Services to explore", NOT an automated quotation or professional assessment.
 * - Zero AI APIs or synthetic claims.
 */

import type { ProjectBriefV1 } from '../../types/project-brief';

export interface ServiceSuggestion {
  slug: string;
  title: string;
  href: string;
  rationale: string;
  orderNumber: number;
}

export function getRecommendedServices(brief: ProjectBriefV1): ServiceSuggestion[] {
  const suggestions: ServiceSuggestion[] = [];
  const selected = new Set(brief.requirements.services);

  // 1. Explicit Interior Design Selection or Guidance
  if (selected.has('interior-design') || selected.has('guidance_needed')) {
    suggestions.push({
      slug: 'interior-design',
      title: 'Interior Design & Space Planning',
      href: '/services/interior-design/',
      rationale:
        'Ideal for establishing scaled spatial layouts, custom joinery engineering, tactile material palettes, and comprehensive drawing sets.',
      orderNumber: 1,
    });
  }

  // 2. Explicit Turnkey Contracting Selection or Guidance
  if (selected.has('turnkey-contracting') || selected.has('guidance_needed')) {
    suggestions.push({
      slug: 'turnkey-contracting',
      title: 'Turnkey Contracting & Execution',
      href: '/services/turnkey-contracting/',
      rationale:
        'Delivers single-point site accountability, trade management, verified material procurement, and structured handover for your built space.',
      orderNumber: 2,
    });
  }

  // 3. Fallback / Default: If neither was selected (or custom renovation only), provide the two confirmed core services
  if (suggestions.length === 0) {
    suggestions.push(
      {
        slug: 'interior-design',
        title: 'Interior Design & Space Planning',
        href: '/services/interior-design/',
        rationale: 'Review our architectural spatial planning and custom joinery engineering capabilities.',
        orderNumber: 1,
      },
      {
        slug: 'turnkey-contracting',
        title: 'Turnkey Contracting & Execution',
        href: '/services/turnkey-contracting/',
        rationale: 'Explore our single-point site contracting and trade management practice.',
        orderNumber: 2,
      }
    );
  }

  return suggestions;
}
