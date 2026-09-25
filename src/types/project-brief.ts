/**
 * Typed, versioned Project Brief Model for SAAR Business Support Solution.
 * Version: 1.0.0
 *
 * Used by:
 * - /plan-my-project/ spatial planner wizard
 * - Deterministic service recommendation engine
 * - Plain-text export & clipboard formatters
 * - Future Step 11 Contact & Lead Delivery adapter
 *
 * Strict Privacy & Zero-Fabrication Mandate:
 * - No user accounts, database persistence, or tracking cookies.
 * - Does not claim to be a formal quotation or confirmed scope.
 * - Answers held in client memory during the active session.
 */

export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'hospitality'
  | 'other';

export type AreaUnit = 'sq ft' | 'sq m';

export type ProjectStage =
  | 'exploring'
  | 'planning'
  | 'design_in_progress'
  | 'preparing_execution'
  | 'renovation'
  | 'not_sure';

export type ServiceOptionId =
  | 'interior-design'
  | 'turnkey-contracting'
  | 'renovation'
  | 'guidance_needed';

export interface ProjectBriefV1 {
  version: '1.0';
  timestamp: string; // ISO 8601 creation timestamp in memory

  // Stage 1: Your Space
  space: {
    category: ProjectCategory;
    categoryLabel: string;
    propertyType: string;
    propertyTypeLabel: string;
    customDescription?: string;
  };

  // Stage 2: What You Need
  requirements: {
    services: ServiceOptionId[];
    serviceLabels: string[];
    isGuidanceOnly: boolean;
    additionalNotes?: string;
  };

  // Stage 3: Project Details
  details: {
    locality: string;
    approximateArea?: number;
    areaUnit: AreaUnit;
    stage: ProjectStage;
    stageLabel: string;
  };

  // Stage 4: Preferences (Optional)
  preferences: {
    stylePreference?: string;
    budgetExpectation?: string;
    desiredTiming?: string;
    skipped: boolean;
  };
}

/**
 * Handoff payload interface for future Step 11 Contact Form consumption.
 * Encapsulates the validated in-memory brief without exposing internal UI state.
 */
export interface ProjectBriefPayload {
  version: '1.0';
  createdAt: string;
  briefSummaryText: string;
  structuredBrief: ProjectBriefV1;
  recommendedServiceSlugs: string[];
}
