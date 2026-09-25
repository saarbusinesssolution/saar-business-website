/**
 * Transactional Email Provider Adapter for SAAR Lead Delivery.
 * Target Provider: Resend (https://resend.com).
 * Enforces strict header sanitization, HTML escaping, and native idempotency.
 */

import type { ValidatedEnquiryData } from '../validation/enquiry.ts';
import type { EnquiryServerEnv } from '../../types/enquiry.ts';
import { sanitizeHeader, escapeHtml } from '../validation/enquiry.ts';

export class MissingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingConfigurationError';
  }
}

export interface EmailDispatchResult {
  delivered: boolean;
  providerId: string;
  simulated?: boolean;
}

// In-memory record of mock dispatches for local integration tests
export const _mockDispatchedEmails: Array<{
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
  timestamp: string;
}> = [];

/** Formats a safe plain-text notification body for the SAAR team */
export function formatNotificationPlainText(
  submission: ValidatedEnquiryData,
  reference: string,
  timestamp: string
): string {
  const lines: string[] = [
    '==================================================================',
    `NEW SAAR PROJECT ENQUIRY — REF #${reference}`,
    '==================================================================',
    `Received At: ${timestamp}`,
    `Reference ID: ${reference}`,
    '',
    '------------------------------------------------------------------',
    '1. CLIENT CONTACT INFORMATION',
    '------------------------------------------------------------------',
    `Client Name: ${submission.name}`,
    `Preferred Contact Method: ${submission.contactMethod.toUpperCase()}`,
    `Email Address: ${submission.email || 'Not provided (Phone preferred)'}`,
    `Telephone Number: ${submission.phone || 'Not provided (Email preferred)'}`,
    `Project Location / Locality: ${submission.location}`,
    '',
    '------------------------------------------------------------------',
    '2. PROJECT REQUIREMENTS',
    '------------------------------------------------------------------',
    `Primary Discipline: ${submission.service || 'Specified in attached brief'}`,
  ];

  if (submission.message && submission.message.trim().length > 0) {
    lines.push('', 'Client Message / Overview:', submission.message.trim(), '');
  }

  if (submission.projectBrief) {
    const b = submission.projectBrief;
    lines.push(
      '------------------------------------------------------------------',
      '3. ATTACHED SPATIAL BRIEF (PLAN MY PROJECT)',
      '------------------------------------------------------------------',
      `Brief Version: ${b.version}`,
      `Space Category: ${b.space.categoryLabel || b.space.category}`,
      `Property Type: ${b.space.propertyTypeLabel || b.space.propertyType}`,
      b.space.customDescription ? `Custom Description: ${b.space.customDescription}` : '',
      `Requested Disciplines: ${b.requirements.serviceLabels?.join(', ') || b.requirements.services.join(', ')}`,
      b.requirements.additionalNotes ? `Requirements Note: ${b.requirements.additionalNotes}` : '',
      `Locality: ${b.details.locality}`,
      b.details.approximateArea
        ? `Approximate Area: ${b.details.approximateArea.toLocaleString()} ${b.details.areaUnit || 'sq ft'}`
        : 'Approximate Area: Not specified',
      `Current Stage: ${b.details.stageLabel || b.details.stage}`
    );

    if (b.preferences && !b.preferences.skipped) {
      lines.push(
        `Style Preference: ${b.preferences.stylePreference || 'Not specified'}`,
        `Budget Expectation: ${b.preferences.budgetExpectation || 'Not specified'}`,
        `Desired Timeline: ${b.preferences.desiredTiming || 'Not specified'}`
      );
    }

    lines.push(
      '',
      '[NOTICE]: Budget figures represent client expectation for initial conversation,',
      'not a quotation, cost estimate, or confirmed commercial commitment by SAAR.'
    );
  }

  lines.push(
    '==================================================================',
    'Action Required: Review brief feasibility and connect via preferred method.',
    '=================================================================='
  );

  return lines.filter(Boolean).join('\n');
}

/** Formats an HTML notification email with strict escaping */
export function formatNotificationHtml(
  submission: ValidatedEnquiryData,
  reference: string,
  timestamp: string
): string {
  const safeName = escapeHtml(submission.name);
  const safeMethod = escapeHtml(submission.contactMethod.toUpperCase());
  const safeEmail = escapeHtml(submission.email || 'Not provided');
  const safePhone = escapeHtml(submission.phone || 'Not provided');
  const safeLocation = escapeHtml(submission.location);
  const safeService = escapeHtml(submission.service || 'Attached in brief');
  const safeMessage = submission.message ? escapeHtml(submission.message).replace(/\n/g, '<br/>') : '';

  let briefHtml = '';
  if (submission.projectBrief) {
    const b = submission.projectBrief;
    briefHtml = `
      <div style="margin-top: 24px; padding: 20px; background-color: #f7f5f0; border: 1px solid #e2ded5; border-radius: 4px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #173A5E; font-family: serif;">Attached Spatial Project Brief</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666; width: 140px;">Category:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.space.categoryLabel || b.space.category)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Property Type:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.space.propertyTypeLabel || b.space.propertyType)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Services:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.requirements.serviceLabels?.join(', ') || b.requirements.services.join(', '))}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Locality:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.details.locality)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Approx Area:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${b.details.approximateArea ? escapeHtml(b.details.approximateArea.toLocaleString()) + ' ' + escapeHtml(b.details.areaUnit || 'sq ft') : 'Not specified'}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Stage:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.details.stageLabel || b.details.stage)}</td></tr>
          ${b.preferences?.budgetExpectation ? `<tr><td style="padding: 6px 0; color: #666;">Budget Expectation:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.preferences.budgetExpectation)}</td></tr>` : ''}
          ${b.preferences?.desiredTiming ? `<tr><td style="padding: 6px 0; color: #666;">Timeline:</td><td style="padding: 6px 0; font-weight: bold; color: #202020;">${escapeHtml(b.preferences.desiredTiming)}</td></tr>` : ''}
        </table>
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #888; font-style: italic;">
          * Note: Budget figures represent client expectation for initial conversation, not a cost estimate or quotation.
        </p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #202020; margin: 0; padding: 24px; background-color: #fcfbf9;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; padding: 32px;">
          <div style="border-bottom: 2px solid #B99052; padding-bottom: 16px; margin-bottom: 24px;">
            <span style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #B99052; font-weight: bold;">SAAR Business Support Solution</span>
            <h1 style="font-size: 22px; color: #173A5E; margin: 4px 0 0 0; font-family: serif;">New Project Enquiry — Ref #${escapeHtml(reference)}</h1>
            <p style="font-size: 12px; color: #888888; margin: 4px 0 0 0;">Received: ${escapeHtml(timestamp)}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;">Client Name:</td><td style="padding: 8px 0; font-weight: bold; color: #173A5E;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Preferred Contact:</td><td style="padding: 8px 0; font-weight: bold;">${safeMethod}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email Address:</td><td style="padding: 8px 0;">${safeEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Telephone:</td><td style="padding: 8px 0;">${safePhone}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Locality:</td><td style="padding: 8px 0;">${safeLocation}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Discipline:</td><td style="padding: 8px 0; font-weight: bold;">${safeService}</td></tr>
          </table>

          ${safeMessage ? `
            <div style="margin-top: 16px; padding: 16px; background-color: #f9f9f9; border-left: 3px solid #173A5E; font-size: 14px;">
              <strong style="display: block; margin-bottom: 6px; color: #173A5E;">Client Overview:</strong>
              ${safeMessage}
            </div>
          ` : ''}

          ${briefHtml}

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888;">
            Delivered securely via SAAR Lead Delivery Engine. To reply to the visitor directly, use the Reply button in your mail client.
          </div>
        </div>
      </body>
    </html>
  `;
}

/** Dispatches the notification email through Resend or test mock */
export async function sendEnquiryNotification(
  submission: ValidatedEnquiryData,
  reference: string,
  env: EnquiryServerEnv
): Promise<EmailDispatchResult> {
  const timestamp = new Date().toISOString();
  const locationClean = sanitizeHeader(submission.location);
  const subjectCategory = submission.projectBrief?.space?.categoryLabel || submission.service || 'Consultation';
  const emailSubject = sanitizeHeader(`[SAAR Lead] ${subjectCategory} (${locationClean}) - Ref #${reference}`);

  const plainText = formatNotificationPlainText(submission, reference, timestamp);
  const htmlContent = formatNotificationHtml(submission, reference, timestamp);

  const apiKey = env.RESEND_API_KEY;
  const recipient = env.ENQUIRY_RECIPIENT_EMAIL;
  const sender = env.ENQUIRY_SENDER_EMAIL;

  // Check if test mock delivery is explicitly enabled in non-production environment
  const isMockAllowed =
    env.ENABLE_TEST_MOCK_DELIVERY === 'true' && env.NODE_ENV !== 'production';

  if (isMockAllowed) {
    _mockDispatchedEmails.push({
      to: recipient || 'test-recipient@saarbusiness.test',
      subject: emailSubject,
      text: plainText,
      idempotencyKey: submission.submissionId,
      timestamp,
    });
    return {
      delivered: true,
      providerId: `mock-${reference.toLowerCase()}`,
      simulated: true,
    };
  }

  // Fail closed if required live provider bindings are absent
  if (!apiKey || !recipient || !sender) {
    throw new MissingConfigurationError(
      'Lead delivery credentials (RESEND_API_KEY, ENQUIRY_RECIPIENT_EMAIL, or ENQUIRY_SENDER_EMAIL) are not configured.'
    );
  }

  // Live dispatch via Resend REST API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const resendPayload: Record<string, unknown> = {
      from: sender,
      to: [recipient],
      subject: emailSubject,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': reference,
      },
    };

    if (submission.email && submission.email.trim() !== '') {
      resendPayload.reply_to = submission.email.trim();
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': submission.submissionId,
      },
      body: JSON.stringify(resendPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown provider error');
      throw new Error(`Resend provider returned HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { id?: string };
    return {
      delivered: true,
      providerId: data.id || `re_${reference}`,
      simulated: false,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout connecting to transactional email service (Resend).');
    }
    throw error;
  }
}
