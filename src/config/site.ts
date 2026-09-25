/**
 * Central site and business configuration for SAAR Business Support Solution.
 * Strictly distinguishes verified project facts from pending business data.
 * Private integration keys/secrets must NEVER enter this file.
 */

export interface BusinessAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface BusinessHours {
  days: string;
  hours: string;
}

export interface SocialProfiles {
  instagram: string | null;
  linkedin: string | null;
}

export interface BusinessConfig {
  /** Verified Project Inputs */
  readonly name: string;
  readonly shortName: string;
  readonly url: string;
  readonly tagline: string;
  readonly description: string;
  readonly defaultLanguage: string;
  readonly brandColors: {
    readonly navy: string;
    readonly gold: string;
    readonly charcoal: string;
    readonly softWhite: string;
  };

  /** Business Details Awaiting Confirmation (Strictly null when unverified) */
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: BusinessAddress | null;
  serviceAreas: string[] | null;
  socialProfiles: SocialProfiles | null;
  businessHours: BusinessHours | null;
}

export const siteConfig: BusinessConfig = {
  // 1. Verified Public Project Facts
  name: 'Saar Business Support Solution',
  shortName: 'SAAR',
  url: 'https://saarbusiness.com',
  tagline: 'Designed with Purpose. Executed with Precision.',
  description:
    'Premier architectural, interior design, turnkey contracting, and spatial solutions firm.',
  defaultLanguage: 'en',
  brandColors: {
    navy: '#173A5E',
    gold: '#B99052',
    charcoal: '#202020',
    softWhite: '#F4F1EA',
  },

  // 2. Business Details Awaiting Client Confirmation (Pending)
  phone: null,
  whatsappNumber: null,
  email: null,
  address: null,
  serviceAreas: null,
  socialProfiles: null,
  businessHours: null,
};

// ==========================================
// Contact Destination Safety Helpers
// ==========================================

export function hasVerifiedPhone(config: BusinessConfig = siteConfig): boolean {
  return typeof config.phone === 'string' && config.phone.trim().length > 5;
}

export function hasVerifiedEmail(config: BusinessConfig = siteConfig): boolean {
  return typeof config.email === 'string' && config.email.includes('@');
}

export function hasVerifiedWhatsApp(config: BusinessConfig = siteConfig): boolean {
  return typeof config.whatsappNumber === 'string' && config.whatsappNumber.trim().length > 5;
}

/**
 * Generates an encoded WhatsApp deep-link.
 * Returns null if the business WhatsApp number is unconfirmed.
 */
export function getWhatsAppDirectUrl(
  prefilledMessage: string,
  config: BusinessConfig = siteConfig
): string | null {
  if (!hasVerifiedWhatsApp(config) || !config.whatsappNumber) {
    return null;
  }
  const cleanNumber = config.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledMessage)}`;
}
