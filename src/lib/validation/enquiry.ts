import { z } from 'zod';

/** Whitelist of supported service IDs for enquiries */
export const ALLOWED_SERVICE_IDS = [
  'interior-design',
  'turnkey-contracting',
  'renovation',
  'guidance_needed',
] as const;

/** Whitelist of allowed categories in project brief */
export const ALLOWED_BRIEF_CATEGORIES = [
  'residential',
  'commercial',
  'hospitality',
  'other',
] as const;

/** Validates basic international phone numbers (+91 98765 43210, (555) 123-4567, etc.) */
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;

/** Strips control characters, carriage returns, and newlines to prevent header injection */
export function sanitizeHeader(input: string): string {
  return input.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Escapes characters to prevent HTML injection in emails */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sanitizes general user text: trims and collapses whitespace */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim();
}

/** Nested schema for validating attached ProjectBriefV1 */
export const projectBriefSchema = z.object({
  version: z.literal('1.0', {
    errorMap: () => ({ message: 'Unsupported project brief version. Expected version 1.0.' }),
  }),
  timestamp: z.string().optional(),
  space: z.object({
    category: z.enum(ALLOWED_BRIEF_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid space category specified in brief.' }),
    }),
    categoryLabel: z.string().max(100).optional(),
    propertyType: z.string().min(1).max(100),
    propertyTypeLabel: z.string().max(100).optional(),
    customDescription: z.string().max(200).optional(),
  }),
  requirements: z.object({
    services: z.array(z.string().max(50)).min(1, 'At least one service or guidance must be specified in brief.'),
    serviceLabels: z.array(z.string().max(100)).optional(),
    isGuidanceOnly: z.boolean().optional(),
    additionalNotes: z.string().max(1000).optional(),
  }),
  details: z.object({
    locality: z.string().min(2, 'Brief locality must have at least 2 characters.').max(120),
    approximateArea: z.number().positive().finite().optional(),
    areaUnit: z.enum(['sq ft', 'sq m']).optional(),
    stage: z.string().max(50),
    stageLabel: z.string().max(100).optional(),
  }),
  preferences: z
    .object({
      stylePreference: z.string().max(100).optional(),
      budgetExpectation: z.string().max(100).optional(),
      desiredTiming: z.string().max(100).optional(),
      skipped: z.boolean().optional(),
    })
    .optional(),
});

/** Master Enquiry Zod Schema with contextual refinements */
export const enquirySchema = z
  .object({
    name: z
      .string({ required_error: 'Please enter your name.' })
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name must not exceed 100 characters.'),

    contactMethod: z.enum(['email', 'phone'], {
      errorMap: (issue) => ({
        message:
          issue.code === 'invalid_type' && issue.received === 'undefined'
            ? 'Please select your preferred contact method.'
            : 'Preferred contact method must be either email or phone.',
      }),
    }),

    email: z
      .string()
      .trim()
      .max(254, 'Email must not exceed 254 characters.')
      .optional()
      .or(z.literal('')),

    phone: z
      .string()
      .trim()
      .max(25, 'Phone number must not exceed 25 characters.')
      .optional()
      .or(z.literal('')),

    location: z
      .string({ required_error: 'Please enter your project city or locality.' })
      .trim()
      .min(2, 'Project location must be at least 2 characters.')
      .max(120, 'Project location must not exceed 120 characters.'),

    service: z
      .string()
      .optional()
      .refine(
        (val) => !val || ALLOWED_SERVICE_IDS.includes(val as (typeof ALLOWED_SERVICE_IDS)[number]),
        { message: 'Please select a recognized discipline or "guidance_needed".' }
      ),

    message: z
      .string()
      .trim()
      .max(2000, 'Project message must not exceed 2000 characters.')
      .optional()
      .or(z.literal('')),

    acknowledgement: z.literal(true, {
      errorMap: () => ({
        message: 'You must acknowledge that details will be used to respond to your enquiry.',
      }),
    }),

    website_url: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length === 0, {
        message: 'Spam detected via honeypot field.',
      }),

    turnstileToken: z.string().max(2048).optional(),

    submissionId: z
      .string({ required_error: 'Submission identifier missing.' })
      .min(8, 'Invalid submission identifier.')
      .max(64, 'Submission identifier too long.'),

    projectBrief: projectBriefSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Validate email when email is preferred contact method
    if (data.contactMethod === 'email') {
      if (!data.email || data.email.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email address is required when email is your preferred contact method.',
        });
      } else {
        const emailValidation = z.string().email('Please enter a valid email address.');
        const result = emailValidation.safeParse(data.email.trim());
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Please enter a valid email address.',
          });
        }
      }
    }

    // 2. Validate phone when phone is preferred contact method
    if (data.contactMethod === 'phone') {
      if (!data.phone || data.phone.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Phone number is required when phone is your preferred contact method.',
        });
      } else {
        const cleanedPhone = data.phone.trim();
        if (cleanedPhone.length < 7 || !PHONE_REGEX.test(cleanedPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['phone'],
            message: 'Please enter a valid telephone number (including country/area code).',
          });
        }
      }
    }

    // Optional phone validation if provided while email preferred
    if (data.contactMethod === 'email' && data.phone && data.phone.trim() !== '') {
      if (data.phone.trim().length < 7 || !PHONE_REGEX.test(data.phone.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: 'Please enter a valid telephone number.',
        });
      }
    }

    // 3. Message requirement: If no projectBrief is attached, message is required
    const hasBrief = Boolean(data.projectBrief && data.projectBrief.space && data.projectBrief.space.category);
    if (!hasBrief) {
      if (!data.message || data.message.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['message'],
          message: 'Please provide a short overview of your project requirements (at least 10 characters).',
        });
      }
      if (!data.service || data.service.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['service'],
          message: 'Please select a primary discipline or request guidance.',
        });
      }
    }
  });

export type ValidatedEnquiryData = z.infer<typeof enquirySchema>;
