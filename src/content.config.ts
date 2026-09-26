import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Zod validation schema for SAAR Service entries.
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    id: z.string().min(2, 'Stable ID must be at least 2 characters'),
    title: z.string().min(2, 'Title is required'),
    shortSummary: z.string().min(10, 'Short summary must be descriptive'),
    publicationStatus: z.enum(['draft', 'published']),
    verificationStatus: z.enum(['pending_confirmation', 'verified']),
    overview: z.string().min(20, 'Overview narrative is required'),
    suitableProjectTypes: z.array(z.string()).min(1, 'At least one project type must be specified'),
    deliverables: z.array(z.string()).min(1, 'At least one deliverable must be listed'),
    exclusions: z.array(z.string()).optional(),
    processSteps: z.array(
      z.object({
        step: z.number().int().positive(),
        title: z.string(),
        description: z.string(),
      })
    ).min(1, 'At least one process step is required'),
    heroImageId: z.string().optional(),
    relatedProjectIds: z.array(z.string()).default([]),
    faqs: z.array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(10),
      })
    ).default([]),
    ctaIntent: z.string().default('Book Consultation'),
    seoTitle: z.string().min(10),
    seoDescription: z.string().min(20),
    order: z.number().default(99),
  }),
});

/**
 * Zod validation schema for SAAR Project / Case Study entries.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    id: z.string().min(2, 'Stable ID must be at least 2 characters'),
    title: z.string().min(2, 'Title is required'),
    publicationStatus: z.enum(['draft', 'published']),
    projectNature: z.enum(['actual', 'concept']),
    category: z.enum([
      'Interior Design',
      'Turnkey Contracting',
      'Renovation',
      'Property Solutions',
      'Residential Projects',
      'Commercial Projects',
      'Hospitality',
      'Retail & Showrooms',
    ]),
    spaceType: z.string().min(2, 'Space type is required'),
    summary: z.string().min(10, 'Summary is required'),
    location: z.string().optional(),
    relatedServiceIds: z.array(z.string()).default([]),
    designStyleTags: z.array(z.string()).default([]),
    theSpace: z.string().min(20, 'Spatial description is required'),
    challenge: z.string().optional(),
    approach: z.string().optional(),
    deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
    result: z.string().optional(),
    coverImageId: z.string().min(1, 'Cover image reference is required'),
    galleryImageIds: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    completionDate: z.string().optional(),
    seoTitle: z.string().min(10),
    seoDescription: z.string().min(20),
    /** Internal review notes - stripped by public helper functions */
    internalNotes: z.string().optional(),
    /** Whether images are demo/illustrative or actual project photos */
    imageType: z.enum(['demo', 'actual']).default('actual'),
    /** Client name for the project */
    clientName: z.string().optional(),
  }),
});

export const collections = { services, projects };
