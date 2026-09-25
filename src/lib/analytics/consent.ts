/**
 * Privacy-Centric Consent Management for SAAR Analytics.
 * Enforces a conservative opt-in model: no tracking scripts or cookies load until explicit consent.
 * Provides transparent preference inspection, update, and immediate cookie withdrawal.
 */

export type ConsentStatus = 'granted' | 'denied' | 'unset';

export interface ConsentRecord {
  version: 1;
  status: 'granted' | 'denied';
  timestamp: string;
}

export const CONSENT_STORAGE_KEY = 'saar_analytics_consent';
export const CONSENT_VERSION = 1;

/**
 * Retrieves the visitor's current consent preference.
 * Returns 'unset' if no prior choice has been recorded.
 */
export function getConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return 'unset';
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return 'unset';

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version === CONSENT_VERSION && (parsed.status === 'granted' || parsed.status === 'denied')) {
      return parsed.status;
    }
    return 'unset';
  } catch {
    return 'unset';
  }
}

/**
 * Persists an explicit consent choice ('granted' or 'denied') and notifies the application.
 */
export function setConsentStatus(status: 'granted' | 'denied'): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    const record: ConsentRecord = {
      version: CONSENT_VERSION,
      status,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

    if (status === 'denied') {
      clearAnalyticsCookies();
    }

    // Broadcast change event
    window.dispatchEvent(
      new CustomEvent('saar:consent-changed', {
        detail: { status },
      })
    );
  } catch (err) {
    // Fail silently without blocking navigation
  }
}

/**
 * Withdraws previously granted consent, marks state as 'denied', and clears tracking cookies.
 */
export function withdrawConsent(): void {
  setConsentStatus('denied');
}

/**
 * Clears accessible Google Analytics cookies (_ga, _gid, _gat, _ga_*) across current host and root domain.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  const gaCookieRegex = /^(_ga|_gid|_gat|_gac_)/;

  const domainsToClear = [
    window.location.hostname,
    '.' + window.location.hostname,
  ];

  // Also include base domain if on subdomain
  const parts = window.location.hostname.split('.');
  if (parts.length > 2) {
    const rootDomain = '.' + parts.slice(-2).join('.');
    domainsToClear.push(rootDomain);
  }

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    if (gaCookieRegex.test(name)) {
      // Clear across paths and candidate domains
      domainsToClear.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      });
    }
  });
}
