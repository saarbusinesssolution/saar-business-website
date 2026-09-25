/**
 * Core Serverless Enquiry Handler for SAAR Lead Delivery.
 * Runs on Cloudflare Pages Functions (functions/api/enquiry.ts), Astro dev middleware, and automated test runners.
 */

import type { EnquiryServerEnv, EnquiryResponse } from '../../types/enquiry.ts';
import { enquirySchema } from '../validation/enquiry.ts';
import { checkRateLimit } from './rate-limiter.ts';
import { sendEnquiryNotification, MissingConfigurationError } from './email-provider.ts';

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB limit

/** Constructs a standardized JSON response */
function jsonResponse(data: EnquiryResponse, status: number = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

/** Generates a unique, non-sensitive reference code: e.g. SR-M1ABC-7X2Y */
export function generateReferenceCode(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${timePart}-${randomPart}`;
}

/** Extracts client IP safely from edge request headers */
function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/** Verifies Cloudflare Turnstile token server-side */
async function verifyTurnstileToken(
  token: string | undefined,
  secretKey: string,
  clientIp: string
): Promise<boolean> {
  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', clientIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) return false;
    const outcome = (await res.json()) as { success: boolean };
    return Boolean(outcome.success);
  } catch {
    return false;
  }
}

/** Validates that request origin matches allowed domains */
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const checkUrl = origin || referer;

  if (!checkUrl) return true; // Direct/same-origin curl or internal calls permitted

  try {
    const parsed = new URL(checkUrl);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'saarbusiness.com' ||
      host.endsWith('.saarbusiness.com') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.pages.dev') // Cloudflare Pages preview domains
    );
  } catch {
    return false;
  }
}

/**
 * Master Request Handler for POST /api/enquiry
 */
export async function handleEnquiryRequest(
  request: Request,
  env: EnquiryServerEnv = {}
): Promise<Response> {
  // 1. Method guard
  if (request.method !== 'POST') {
    return jsonResponse(
      {
        success: false,
        error: 'Method not allowed. Use POST.',
      },
      405,
      { Allow: 'POST, OPTIONS' }
    );
  }

  // 2. Content-Type guard
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(
      {
        success: false,
        error: 'Unsupported content type. Expected application/json.',
      },
      415
    );
  }

  // 3. Origin guard
  if (!isAllowedOrigin(request)) {
    return jsonResponse(
      {
        success: false,
        error: 'Cross-origin request rejected.',
      },
      403
    );
  }

  // 4. Request size check before unbounded parsing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return jsonResponse(
      {
        success: false,
        error: 'Payload too large. Maximum size is 64KB.',
      },
      413
    );
  }

  // Read body text and enforce physical byte limit
  let bodyText: string;
  try {
    bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).length > MAX_PAYLOAD_BYTES) {
      return jsonResponse(
        {
          success: false,
          error: 'Payload too large. Maximum size is 64KB.',
        },
        413
      );
    }
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Failed to read request body.',
      },
      400
    );
  }

  // 5. Parse JSON
  let bodyData: unknown;
  try {
    bodyData = JSON.parse(bodyText);
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Malformed JSON payload.',
      },
      400
    );
  }

  const clientIp = getClientIp(request);

  // 6. Rate Limiting Check
  const rateLimit = await checkRateLimit(clientIp, env.RATE_LIMIT_KV as any);
  if (!rateLimit.allowed) {
    const retrySecs = Math.ceil(rateLimit.resetMs / 1000);
    return jsonResponse(
      {
        success: false,
        error: 'Too many requests. Please wait a few moments before trying again.',
      },
      429,
      { 'Retry-After': String(retrySecs) }
    );
  }

  // 7. Honeypot Check (Fail early if bot trapped)
  if (
    typeof bodyData === 'object' &&
    bodyData !== null &&
    'website_url' in bodyData &&
    typeof (bodyData as any).website_url === 'string' &&
    (bodyData as any).website_url.trim().length > 0
  ) {
    // Return structured non-sensitive error without tipping off bot
    return jsonResponse(
      {
        success: false,
        error: 'Request verification failed.',
      },
      400
    );
  }

  // 8. Turnstile verification (if configured)
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileSecret.trim().length > 0) {
    const token = typeof bodyData === 'object' && bodyData !== null ? (bodyData as any).turnstileToken : undefined;
    const isTokenValid = await verifyTurnstileToken(token, turnstileSecret, clientIp);
    if (!isTokenValid) {
      return jsonResponse(
        {
          success: false,
          error: 'Security challenge failed or expired. Please refresh the page and try again.',
        },
        400
      );
    }
  }

  // 9. Zod Schema Validation
  const validationResult = enquirySchema.safeParse(bodyData);
  if (!validationResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] ? String(issue.path[0]) : '_general';
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }

    return jsonResponse(
      {
        success: false,
        error: 'Please review and correct the highlighted fields.',
        fieldErrors,
      },
      422
    );
  }

  const validData = validationResult.data;
  const reference = generateReferenceCode();

  // 10. Dispatch notification via Email Provider Adapter
  try {
    const dispatchResult = await sendEnquiryNotification(validData, reference, env);

    return jsonResponse({
      success: true,
      reference,
      message: 'Your enquiry has been submitted.',
      receivedAt: new Date().toISOString(),
      ...(dispatchResult.simulated ? { simulated: true } : {}),
    });
  } catch (error: unknown) {
    if (error instanceof MissingConfigurationError) {
      // Graceful fail-closed state without exposing missing secret names
      return jsonResponse(
        {
          success: false,
          error:
            'Our enquiry service is currently undergoing scheduled configuration. Please contact our team directly via telephone or WhatsApp.',
        },
        503
      );
    }

    // Provider error or connection timeout
    return jsonResponse(
      {
        success: false,
        error:
          'Unable to complete submission due to a service timeout. Your entered details have been preserved. Please retry or contact us directly.',
        reference,
      },
      502
    );
  }
}
