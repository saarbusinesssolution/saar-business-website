/**
 * Central site and business configuration for SAAR Business Support Solution.
 * Strictly distinguishes verified project facts from pending business data.
 * Private integration keys/secrets must NEVER enter this file.
 */

export interface BusinessAddress {
  street: string | null;
  area?: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  formatted?: string | null;
}

export interface BusinessOwner {
  readonly name: string;
  readonly designation: string;
  readonly image: string;
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
  readonly owner: BusinessOwner;

  /** Verified Business Details */
  phone: string | null;
  phoneClean?: string | null;
  whatsappNumber: string | null;
  whatsappClean?: string | null;
  email: string | null;
  address: BusinessAddress | null;
  serviceAreas: string[] | null;
  socialProfiles: SocialProfiles | null;
  businessHours: BusinessHours | null;
}

export const siteConfig: BusinessConfig = {
  // 1. Verified Public Project Facts
  name: 'SAAR Business Support Solution',
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
  owner: {
    name: 'Ramnewas Verma',
    designation: 'Proprietor',
    image: '/images/team/ramnewas-verma.webp',
  },

  // 2. Verified Business Contact & Registered Address
  phone: '+91 9930321817',
  phoneClean: '919930321817',
  whatsappNumber: '+91 9930321817',
  whatsappClean: '919930321817',
  email: 'saarbusinesssolution@gmail.com',
  address: {
    street: 'Shop No. 1, Thakkar Residency, Plot No. 224, Sector 17',
    area: 'Ulwe',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    postalCode: '410206',
    country: 'India',
    formatted: 'Shop No. 1, Thakkar Residency, Plot No. 224, Sector 17, Ulwe – 410206',
  },
  serviceAreas: ['Navi Mumbai', 'Mumbai', 'Raigad', 'Thane', 'Maharashtra'],
  socialProfiles: null,
  businessHours: null, // Strictly not provided. Do not invent.
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
  const cleanNumber = config.whatsappClean || config.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledMessage)}`;
}

/**
 * Generates a Google Maps directions query URL from verified office address.
 * Strictly uses text query without invented GPS coordinates.
 */
export function getGoogleMapsDirectionsUrl(config: BusinessConfig = siteConfig): string | null {
  if (!config.address) return null;
  const destinationQuery = config.address.formatted || `${config.address.street}, ${config.address.city} ${config.address.postalCode}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
}
