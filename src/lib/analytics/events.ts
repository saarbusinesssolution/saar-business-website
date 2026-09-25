/**
 * Strict Typed Event Taxonomy & Sanitization Suite for SAAR Analytics.
 * Enforces a strict allowlist of event names, parameter keys, and low-cardinality values.
 * Zero-PII Guarantee: strictly rejects all personal information and detailed brief payloads.
 */

export type AnalyticsPlacement =
  | 'header'
  | 'hero'
  | 'services'
  | 'service_page'
  | 'projects'
  | 'project_page'
  | 'about'
  | 'process'
  | 'planner'
  | 'contact'
  | 'footer'
  | 'mobile_bar';

export type AnalyticsErrorCategory =
  | 'validation'
  | 'spam_check'
  | 'rate_limited'
  | 'network'
  | 'delivery_unavailable'
  | 'unexpected';

export interface PageViewParams {
  page_path?: string;
  page_title?: string;
}

export interface ServiceViewParams {
  service_id: string;
}

export interface ProjectViewParams {
  project_id: string;
  project_nature: 'actual' | 'concept';
}

export interface CtaClickParams {
  cta_id: string;
  placement: AnalyticsPlacement;
}

export interface ContactClickParams {
  placement: AnalyticsPlacement;
}

export interface PlannerStartParams {
  form_origin?: 'planner';
}

export interface PlannerStepCompleteParams {
  step_id: 1 | 2 | 3 | 4;
}

export interface EnquiryFormStartParams {
  form_origin: 'contact' | 'planner';
}

export interface GenerateLeadParams {
  form_origin: 'contact' | 'planner';
  service_id?: string;
}

export interface EnquirySubmitErrorParams {
  form_origin: 'contact' | 'planner';
  error_category: AnalyticsErrorCategory;
}

/** Complete Strongly-Typed Event Schema Map */
export interface SAAREventMap {
  page_view: PageViewParams;
  service_view: ServiceViewParams;
  project_view: ProjectViewParams;
  cta_click: CtaClickParams;
  whatsapp_click: ContactClickParams;
  phone_click: ContactClickParams;
  email_click: ContactClickParams;
  planner_start: PlannerStartParams;
  planner_step_complete: PlannerStepCompleteParams;
  planner_complete: Record<string, never>;
  project_summary_copy: Record<string, never>;
  project_summary_download: Record<string, never>;
  enquiry_form_start: EnquiryFormStartParams;
  generate_lead: GenerateLeadParams;
  enquiry_submit_error: EnquirySubmitErrorParams;
}

export type SAAREventName = keyof SAAREventMap;

/** Strict allowlist of permitted event names */
export const ALLOWED_EVENT_NAMES = new Set<string>([
  'page_view',
  'service_view',
  'project_view',
  'cta_click',
  'whatsapp_click',
  'phone_click',
  'email_click',
  'planner_start',
  'planner_step_complete',
  'planner_complete',
  'project_summary_copy',
  'project_summary_download',
  'enquiry_form_start',
  'generate_lead',
  'enquiry_submit_error',
]);

/** Strict allowlist of permitted parameter keys */
export const ALLOWED_PARAM_KEYS = new Set<string>([
  'page_path',
  'page_title',
  'cta_id',
  'placement',
  'service_id',
  'project_id',
  'project_nature',
  'step_id',
  'form_origin',
  'error_category',
]);

/**
 * Strict PII and sensitive payload blacklist.
 * Any key matching these names or containing these patterns will be rejected unconditionally.
 */
const FORBIDDEN_PARAM_PATTERNS = [
  'name',
  'email',
  'phone',
  'mobile',
  'whatsapp',
  'message',
  'text',
  'body',
  'note',
  'brief',
  'token',
  'secret',
  'password',
  'budget',
  'cost',
  'price',
  'area',
  'dimension',
  'locality',
  'location',
  'address',
  'city',
  'submissionid',
  'reference',
  'idempotency',
  'payload',
  'response',
  'stack',
];

/** Low-cardinality valid values */
const VALID_PLACEMENTS = new Set<string>([
  'header',
  'hero',
  'services',
  'service_page',
  'projects',
  'project_page',
  'about',
  'process',
  'planner',
  'contact',
  'footer',
  'mobile_bar',
]);

const VALID_ERROR_CATEGORIES = new Set<string>([
  'validation',
  'spam_check',
  'rate_limited',
  'network',
  'delivery_unavailable',
  'unexpected',
]);

const VALID_FORM_ORIGINS = new Set<string>(['contact', 'planner']);
const VALID_PROJECT_NATURES = new Set<string>(['actual', 'concept']);

/**
 * Sanitizes an event and its parameters against strict security and zero-PII boundaries.
 * Returns a clean, controlled parameter dictionary or null if the event is disallowed.
 */
export function sanitizeEventPayload<T extends SAAREventName>(
  eventName: T,
  rawParams?: Record<string, unknown>
): Record<string, string | number> | null {
  if (!ALLOWED_EVENT_NAMES.has(eventName)) {
    return null;
  }

  if (!rawParams || typeof rawParams !== 'object') {
    return {};
  }

  const cleanParams: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(rawParams)) {
    // 1. Check permitted parameter keys
    if (!ALLOWED_PARAM_KEYS.has(key)) {
      continue;
    }

    // 2. Reject forbidden PII keys
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_PARAM_PATTERNS.some((pat) => lowerKey.includes(pat))) {
      continue;
    }

    // 3. Skip null or undefined
    if (value === null || value === undefined) {
      continue;
    }

    // 4. Validate value types and constraints
    if (typeof value === 'number') {
      if (Number.isFinite(value) && value >= 1 && value <= 10) {
        cleanParams[key] = value;
      }
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) continue;

      // Validate enum-like parameters
      if (key === 'placement' && !VALID_PLACEMENTS.has(trimmed)) {
        continue;
      }
      if (key === 'error_category' && !VALID_ERROR_CATEGORIES.has(trimmed)) {
        continue;
      }
      if (key === 'form_origin' && !VALID_FORM_ORIGINS.has(trimmed)) {
        continue;
      }
      if (key === 'project_nature' && !VALID_PROJECT_NATURES.has(trimmed)) {
        continue;
      }

      // Sanitize URL/path params: strip query parameters and hash fragments
      if (key === 'page_path') {
        const cleanPath = trimmed.split('?')[0].split('#')[0];
        cleanParams[key] = cleanPath.slice(0, 100);
        continue;
      }

      // Restrict maximum string length to prevent data stuffing
      cleanParams[key] = trimmed.slice(0, 100);
    }
  }

  return cleanParams;
}
