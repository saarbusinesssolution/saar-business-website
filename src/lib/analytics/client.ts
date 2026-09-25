/**
 * Central Analytics Client Adapter for SAAR Business Support Solution.
 * Encapsulates direct Google Analytics 4 (gtag.js) behind a typed, privacy-preserving interface.
 * Strictly guarantees fail-safe execution: tracking failure NEVER impacts user experience.
 */

import {
  type SAAREventMap,
  type SAAREventName,
  sanitizeEventPayload,
} from './events';
import { getConsentStatus, clearAnalyticsCookies } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __SAAR_GA_MEASUREMENT_ID__?: string;
    __SAAR_DEBUG_ANALYTICS__?: boolean;
    __SAAR_ANALYTICS_INITIALIZED__?: boolean;
    __SAAR_LAST_LEAD_SUBMISSION__?: string;
  }
}

/**
 * Retrieves the configured GA4 Measurement ID.
 * Returns null if not set or invalid.
 */
export function getMeasurementId(): string | null {
  if (typeof window !== 'undefined' && window.__SAAR_GA_MEASUREMENT_ID__) {
    return window.__SAAR_GA_MEASUREMENT_ID__;
  }

  // Astro public env var
  const envId = (import.meta as any).env?.PUBLIC_GA_MEASUREMENT_ID;
  if (typeof envId === 'string' && /^G-[A-Z0-9]+$/i.test(envId.trim())) {
    return envId.trim();
  }

  return null;
}

/**
 * Determines whether explicit developer diagnostics mode is active.
 */
export function isDebugMode(): boolean {
  if (typeof window !== 'undefined' && window.__SAAR_DEBUG_ANALYTICS__ === true) {
    return true;
  }

  const envDebug = (import.meta as any).env?.PUBLIC_ANALYTICS_DEBUG;
  if (envDebug === 'true' || envDebug === true) {
    return true;
  }

  return Boolean((import.meta as any).env?.DEV);
}

/**
 * Checks if the current host is a local development or preview deployment.
 */
export function isLocalOrPreview(): boolean {
  if (typeof window === 'undefined') return true;

  const host = window.location.hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local') ||
    host.endsWith('.pages.dev')
  );
}

/**
 * Determines if hits should be dispatched to the remote GA4 server.
 * Requires:
 * 1. Explicit consent granted.
 * 2. Valid measurement ID.
 * 3. Either not a local/preview environment, or explicit debug override.
 */
export function isRemoteTrackingAllowed(): boolean {
  const consent = getConsentStatus();
  if (consent !== 'granted') return false;

  const measurementId = getMeasurementId();
  if (!measurementId) return false;

  // Protect production analytics against local/preview data pollution
  if (isLocalOrPreview()) {
    return false;
  }

  return true;
}

/**
 * Dynamically loads and configures Google Analytics 4.
 * Strictly no-ops if consent is not granted or measurement ID is absent.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const consent = getConsentStatus();
  if (consent !== 'granted') {
    if (isDebugMode()) {
      console.info('[SAAR Analytics] Initialization skipped: consent status is', consent);
    }
    return;
  }

  if (window.__SAAR_ANALYTICS_INITIALIZED__) {
    return;
  }

  const measurementId = getMeasurementId();
  const remoteAllowed = isRemoteTrackingAllowed();

  if (remoteAllowed && measurementId) {
    // 1. Initialize dataLayer and gtag stub
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());

    // 2. Configure GA4 safely: disable automatic page views and enforce privacy
    window.gtag('config', measurementId, {
      send_page_view: false, // Managed explicitly to prevent duplicate counts
      anonymize_ip: true,
      restricted_data_processing: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    // 3. Inject gtag.js script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.__SAAR_ANALYTICS_INITIALIZED__ = true;
  }

  if (isDebugMode()) {
    console.info(
      '[SAAR Analytics] Initialized. Remote dispatch:',
      remoteAllowed ? `Active (${measurementId})` : 'Disabled (Local/Preview Diagnostics Mode)'
    );
  }

  // 4. Send initial page_view for the current document
  trackPageView();
}

/**
 * Sends a sanitized page_view event.
 */
export function trackPageView(): void {
  if (typeof window === 'undefined') return;

  const cleanPath = window.location.pathname.split('?')[0].split('#')[0];
  const safeTitle = document.title ? document.title.slice(0, 100) : 'SAAR';

  trackEvent('page_view', {
    page_path: cleanPath,
    page_title: safeTitle,
  });
}

/**
 * Primary typed event dispatcher.
 * Dispatches to GA4 if remote tracking is permitted, or outputs developer diagnostics.
 * NEVER throws an uncaught error.
 */
export function trackEvent<T extends SAAREventName>(
  eventName: T,
  rawParams?: SAAREventMap[T]
): void {
  if (typeof window === 'undefined') return;

  try {
    const consent = getConsentStatus();
    const isDebug = isDebugMode();

    // 1. Consent guard: if not granted, do not record or buffer
    if (consent !== 'granted') {
      if (isDebug) {
        console.debug(`[SAAR Analytics (Consent Denied)] event: ${eventName} suppressed.`);
      }
      return;
    }

    // 2. Sanitize and validate payload
    const sanitizedParams = sanitizeEventPayload(
      eventName,
      rawParams as Record<string, unknown>
    );

    if (sanitizedParams === null) {
      if (isDebug) {
        console.warn(`[SAAR Analytics] Rejected unapproved event: "${eventName}"`);
      }
      return;
    }

    // 3. Developer Diagnostics logging
    if (isDebug) {
      console.info(
        `%c[SAAR Analytics]%c ${eventName}`,
        'color: #B99052; font-weight: bold;',
        'color: #173A5E; font-weight: bold;',
        sanitizedParams
      );
    }

    // 4. Dispatch to GA4 gtag if active
    if (isRemoteTrackingAllowed() && typeof window.gtag === 'function') {
      window.gtag('event', eventName, sanitizedParams);
    }
  } catch (err) {
    // Fail closed and silent to ensure website functionality remains resilient
    if (isDebugMode()) {
      console.error('[SAAR Analytics] trackEvent error:', err);
    }
  }
}

/**
 * Attaches delegated click listeners for CTAs and contact links across the site.
 * Uses stable data attributes:
 * - [data-analytics-cta] & [data-analytics-placement]
 * - [data-analytics-contact="whatsapp" | "phone" | "email"] & [data-analytics-placement]
 */
export function initAnalyticsDelegation(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 1. Contact action links (WhatsApp, Phone, Email)
    const contactEl = target.closest<HTMLElement>('[data-analytics-contact]');
    if (contactEl) {
      const type = contactEl.dataset.analyticsContact;
      const placement = (contactEl.dataset.analyticsPlacement || 'hero') as any;

      if (type === 'whatsapp') {
        trackEvent('whatsapp_click', { placement });
      } else if (type === 'phone') {
        trackEvent('phone_click', { placement });
      } else if (type === 'email') {
        trackEvent('email_click', { placement });
      }
      return;
    }

    // 2. Primary CTAs
    const ctaEl = target.closest<HTMLElement>('[data-analytics-cta]');
    if (ctaEl) {
      const ctaId = ctaEl.dataset.analyticsCta;
      const placement = (ctaEl.dataset.analyticsPlacement || 'hero') as any;

      if (ctaId) {
        trackEvent('cta_click', { cta_id: ctaId, placement });
      }
    }
  });

  // Listen for consent changes dynamically
  window.addEventListener('saar:consent-changed', (e: Event) => {
    const custom = e as CustomEvent<{ status: 'granted' | 'denied' }>;
    if (custom.detail?.status === 'granted') {
      initAnalytics();
    } else if (custom.detail?.status === 'denied') {
      clearAnalyticsCookies();
    }
  });
}

// Bind trackEvent globally for inline script components (e.g. EnquiryForm)
if (typeof window !== 'undefined') {
  (window as any).__SAAR_TRACK_EVENT__ = trackEvent;
}
