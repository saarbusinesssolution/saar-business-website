/**
 * Planner Schema & Option Definitions: SAAR Business Support Solution
 * Centralizes selectable choices, conditional property types,
 * and client-side validation rules for the 5-step spatial planner.
 */

import type {
  ProjectCategory,
  ProjectStage,
  ServiceOptionId,
  ProjectBriefV1,
} from '../../types/project-brief';

export interface CategoryOption {
  id: ProjectCategory;
  label: string;
  description: string;
  iconName?: string;
}

export interface PropertyTypeOption {
  id: string;
  label: string;
  category: ProjectCategory;
}

export interface ServiceChoiceOption {
  id: ServiceOptionId;
  label: string;
  subtitle: string;
  isExclusive?: boolean;
  statusBadge?: string;
}

export interface ProjectStageOption {
  id: ProjectStage;
  label: string;
  description: string;
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
}

export interface BudgetOption {
  id: string;
  label: string;
  sublabel: string;
}

export interface TimingOption {
  id: string;
  label: string;
}

// ==========================================
// 1. Stage 1: Space Options
// ==========================================

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'residential',
    label: 'Residential Space',
    description: 'Private villas, bespoke penthouses, or full home interiors.',
  },
  {
    id: 'commercial',
    label: 'Commercial & Workplace',
    description: 'Corporate headquarters, boutique studios, or executive suites.',
  },
  {
    id: 'hospitality',
    label: 'Hospitality & Dining',
    description: 'Curated restaurants, cafes, or boutique hospitality spaces.',
  },
  {
    id: 'other',
    label: 'Other / Custom Typology',
    description: 'Unique spatial footprint or project requiring tailored scoping.',
  },
];

export const PROPERTY_TYPES_BY_CATEGORY: Record<ProjectCategory, PropertyTypeOption[]> = {
  residential: [
    { id: 'villa', label: 'Villa / Independent Bungalow', category: 'residential' },
    { id: 'apartment', label: 'Apartment / Penthouse', category: 'residential' },
    { id: 'builder_floor', label: 'Residential Builder Floor', category: 'residential' },
    { id: 'farmhouse', label: 'Country Estate / Farmhouse', category: 'residential' },
  ],
  commercial: [
    { id: 'corporate_office', label: 'Corporate Office / Headquarters', category: 'commercial' },
    { id: 'boutique_studio', label: 'Boutique Creative Studio / Workplace', category: 'commercial' },
    { id: 'retail_showroom', label: 'Retail Store / Showroom', category: 'commercial' },
    { id: 'commercial_fitout', label: 'Commercial Interior Fit-Out', category: 'commercial' },
  ],
  hospitality: [
    { id: 'restaurant', label: 'Restaurant / Dining Establishment', category: 'hospitality' },
    { id: 'cafe_lounge', label: 'Cafe / Lounge / Bar', category: 'hospitality' },
    { id: 'boutique_hotel', label: 'Boutique Hotel / Guest Suites', category: 'hospitality' },
  ],
  other: [
    { id: 'custom_space', label: 'Custom Architectural Interior', category: 'other' },
    { id: 'adaptive_reuse', label: 'Adaptive Reuse / Heritage Conversion', category: 'other' },
    { id: 'undecided', label: 'Not Sure / Open to Recommendation', category: 'other' },
  ],
};

// ==========================================
// 2. Stage 2: What You Need Options
// ==========================================

export const SERVICE_OPTIONS: ServiceChoiceOption[] = [
  {
    id: 'interior-design',
    label: 'Interior Design & Space Planning',
    subtitle: 'Scaled layouts, joinery detailing, 3D spatial models & itemized BoQ.',
    statusBadge: 'Confirmed Discipline',
  },
  {
    id: 'turnkey-contracting',
    label: 'Turnkey Contracting & Execution',
    subtitle: 'Single-point site management, trade coordination, procurement & handover.',
    statusBadge: 'Confirmed Discipline',
  },
  {
    id: 'renovation',
    label: 'Architectural Renovation',
    subtitle: 'Spatial reconfiguration and partition overhauls for existing structures.',
    statusBadge: 'Staged Rollout',
  },
  {
    id: 'guidance_needed',
    label: 'Not sure — I would like guidance',
    subtitle: 'Help me determine whether I need design-only documentation or full turnkey delivery.',
    isExclusive: true,
  },
];

// ==========================================
// 3. Stage 3: Project Details Options
// ==========================================

export const PROJECT_STAGE_OPTIONS: ProjectStageOption[] = [
  {
    id: 'exploring',
    label: 'Exploring Feasibility',
    description: 'Preliminary planning, evaluating ideas and budget frameworks.',
  },
  {
    id: 'planning',
    label: 'Formulating Brief',
    description: 'Possession received or imminent; ready to define spatial layouts.',
  },
  {
    id: 'design_in_progress',
    label: 'Design in Progress',
    description: 'Architectural drawings underway; preparing for interior specifications.',
  },
  {
    id: 'preparing_execution',
    label: 'Ready for Execution',
    description: 'Design drawings finalized; actively seeking turnkey site contracting.',
  },
  {
    id: 'renovation',
    label: 'Renovating Existing Space',
    description: 'Modifying an occupied or existing built space.',
  },
  {
    id: 'not_sure',
    label: 'Not Sure / Other',
    description: 'Timeline and stage are currently flexible.',
  },
];

// ==========================================
// 4. Stage 4: Preferences Options
// ==========================================

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'warm_minimalist',
    label: 'Warm Minimalist',
    description: 'Clean geometric lines, unadorned surfaces, and neutral palettes.',
  },
  {
    id: 'contemporary_architectural',
    label: 'Contemporary Architectural',
    description: 'Monolithic stone elements, fluted timber, and refined spatial transitions.',
  },
  {
    id: 'industrial_warmth',
    label: 'Industrial Warmth',
    description: 'Exposed structural steel, tactile brick or lime, and dark metal accents.',
  },
  {
    id: 'classic_modern',
    label: 'Modern Classic',
    description: 'Subtle symmetry, rich walnut joinery, and tailored architectural moldings.',
  },
  {
    id: 'open_recommendation',
    label: 'Open to Recommendations',
    description: 'We would like SAAR to propose aesthetic directions suited to the space.',
  },
];

export const BUDGET_OPTIONS: BudgetOption[] = [
  { id: 'under_25L', label: 'Under ₹25 Lakhs', sublabel: 'Focused interior transformation' },
  { id: '25L_50L', label: '₹25 Lakhs – ₹50 Lakhs', sublabel: 'Comprehensive design or fit-out' },
  { id: '50L_1Cr', label: '₹50 Lakhs – ₹1 Crore', sublabel: 'High-spec residential or boutique office' },
  { id: '1Cr_2.5Cr', label: '₹1 Crore – ₹2.5 Crore', sublabel: 'Extensive turnkey villa or corporate workplace' },
  { id: 'above_2.5Cr', label: 'Above ₹2.5 Crore', sublabel: 'Large-scale luxury estate or institutional space' },
  { id: 'undecided', label: 'Budget Not Decided Yet', sublabel: 'Looking for initial feasibility guidance' },
];

export const TIMING_OPTIONS: TimingOption[] = [
  { id: 'exploring', label: 'Exploring / Flexible Timeline' },
  { id: '1_to_3_months', label: 'Within 1 to 3 Months' },
  { id: '3_to_6_months', label: 'Within 3 to 6 Months' },
  { id: '6_plus_months', label: '6+ Months / Future Planning' },
];

// ==========================================
// Validation Helpers
// ==========================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStage1(data: Partial<ProjectBriefV1['space']>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.category) {
    errors.category = 'Please select a project category.';
  }

  if (data.category && data.category !== 'other' && !data.propertyType) {
    errors.propertyType = 'Please select a space or property type.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStage2(data: Partial<ProjectBriefV1['requirements']>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.services || data.services.length === 0) {
    errors.services = 'Please select at least one requirement or choose "Not sure — I would like guidance".';
  } else if (data.services.includes('guidance_needed') && data.services.length > 1) {
    errors.services = '"Not sure — I would like guidance" cannot be combined with specific service selections.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStage3(data: Partial<ProjectBriefV1['details']>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.locality || data.locality.trim().length < 2) {
    errors.locality = 'Please enter a city or general locality (e.g. South Mumbai, Indiranagar Bangalore).';
  }

  if (data.approximateArea !== undefined && data.approximateArea !== null) {
    const num = Number(data.approximateArea);
    if (isNaN(num) || num <= 0 || !isFinite(num)) {
      errors.approximateArea = 'Please enter a valid positive number for area, or leave it blank.';
    }
  }

  if (!data.stage) {
    errors.stage = 'Please select the current stage of your project.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
