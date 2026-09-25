/**
 * Typed models for SAAR Contact & Lead Delivery pipeline.
 * Used across client enquiry forms, validation schemas, and serverless handlers.
 */

import type { ProjectBriefV1 } from './project-brief';

export type PreferredContactMethod = 'email' | 'phone';

export interface EnquirySubmission {
  name: string;
  contactMethod: PreferredContactMethod;
  email?: string;
  phone?: string;
  location: string;
  service?: string;
  message?: string;
  acknowledgement: boolean;
  website_url?: string; // Honeypot field
  turnstileToken?: string;
  submissionId: string;
  projectBrief?: ProjectBriefV1 | null;
}

export interface EnquirySuccessResponse {
  success: true;
  reference: string;
  message: string;
  receivedAt: string;
}

export interface EnquiryErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
  reference?: string;
}

export type EnquiryResponse = EnquirySuccessResponse | EnquiryErrorResponse;

export interface EnquiryServerEnv {
  RESEND_API_KEY?: string;
  ENQUIRY_RECIPIENT_EMAIL?: string;
  ENQUIRY_SENDER_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  ENABLE_TEST_MOCK_DELIVERY?: string;
  NODE_ENV?: string;
  [key: string]: unknown;
}
