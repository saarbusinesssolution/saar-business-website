/**
 * Homepage Data Architecture: SAAR Business Support Solution
 * Centralizes factual homepage copy, core disciplines, process steps,
 * architectural principles, and supported FAQs.
 */

export interface HeroData {
  eyebrow: string;
  heading: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
  heroImage: {
    src: string;
    srcSet: string;
    alt: string;
    width: number;
    height: number;
    badge: string;
  };
}

export interface DisciplineItem {
  id: string;
  orderNumber: number;
  title: string;
  shortSummary: string;
  deliverables: string[];
  imagePath?: string;
  imageAlt?: string;
  isAvailable: boolean;
  href?: string;
}

export interface MethodologyStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface TrustPrinciple {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const heroContent: HeroData = {
  eyebrow: 'Architectural Interiors & Turnkey Contracting',
  heading: 'Thoughtful Interiors. Carefully Executed Spaces.',
  description:
    'SAAR Business Support Solution delivers comprehensive spatial design, bespoke joinery, and disciplined turnkey contracting for luxury residential residences and boutique commercial environments.',
  primaryAction: {
    label: 'Explore Capabilities',
    href: '/services/',
  },
  secondaryAction: {
    label: 'Our Process',
    href: '#process',
  },
  heroImage: {
    src: '/images/hero/hero-architectural-main.webp',
    srcSet:
      '/images/hero/hero-architectural-main-sm.webp 640w, /images/hero/hero-architectural-main-md.webp 1200w, /images/hero/hero-architectural-main.webp 2400w',
    alt: 'Minimalist contemporary Indian living space opening onto an internal courtyard garden',
    width: 2400,
    height: 1350,
    badge: 'Design Concept',
  },
};

export const verifiedDisciplines: DisciplineItem[] = [
  {
    id: 'interior-design',
    orderNumber: 1,
    title: 'Interior Design',
    shortSummary:
      'Bespoke spatial design, material curation, custom millwork engineering, and balanced architectural lighting.',
    deliverables: [
      'Spatial layouts & circulation plans',
      'Detailed 3D visualizations & concepts',
      'Custom joinery & millwork drawings',
      'Tactile material & finishes schedule',
    ],
    imagePath: '/images/services/interior-design.webp',
    imageAlt: 'Bespoke walnut millwork and residential dining area with warm LED backlighting',
    isAvailable: true,
    href: '/services/interior-design/',
  },
  {
    id: 'turnkey-contracting',
    orderNumber: 2,
    title: 'Turnkey Contracting',
    shortSummary:
      'Single-point site execution, trade coordination, procurement control, and structural fit-outs delivered with timeline rigor.',
    deliverables: [
      'Single-point site accountability',
      'Material procurement & logistics',
      'Specialist trade supervision',
      'Phase-gated milestone delivery',
    ],
    imagePath: '/images/services/turnkey-contracting.webp',
    imageAlt: 'Corporate conference boardroom with acoustic wood baffles and framed glass partitions',
    isAvailable: true,
    href: '/services/turnkey-contracting/',
  },
  {
    id: 'renovation',
    orderNumber: 3,
    title: 'Architectural Renovation',
    shortSummary:
      'Spatial reconfiguration, interior partition modernization, and MEP overhauls adapted to existing built footprints.',
    deliverables: [
      'Architectural condition assessment',
      'Interior footprint reconfiguration',
      'MEP & electrical infrastructure upgrade',
      'Restorative finishes & millwork',
    ],
    isAvailable: false, // Detail route pending production asset & consultant boundary sign-off
  },
];

import { processStages } from './process';

export { processStages };

export const methodologySteps: MethodologyStep[] = processStages.map((stage) => ({
  step: stage.order,
  title: stage.shortTitle,
  subtitle: stage.subtitle,
  description: stage.summary,
}));

export const trustPrinciples: TrustPrinciple[] = [
  {
    number: '01',
    title: 'Material Honesty',
    description:
      'We specify authentic regional stones, genuine wood veneers, architectural steel, and breathable lime plasters designed to age gracefully.',
  },
  {
    number: '02',
    title: 'Single-Point Accountability',
    description:
      'By uniting architectural design and turnkey site contracting under one roof, we eliminate communication gaps between drawing board and builder.',
  },
  {
    number: '03',
    title: 'Documented Scope Boundaries',
    description:
      'Every project engagement includes an exhaustive, line-item scope definition so you know exactly what is included, engineered, and delivered.',
  },
];

export const homepageFaqs: FaqItem[] = [
  {
    question: 'What disciplines does SAAR Business Support Solution specialize in?',
    answer:
      'SAAR specializes in three integrated disciplines: architectural interior design, turnkey contracting, and comprehensive spatial renovation. We deliver tailored environments for private residential villas, corporate offices, and boutique commercial properties.',
  },
  {
    question: 'How does turnkey contracting differ from design-only consultancy?',
    answer:
      'Design-only consultancy provides spatial drawings, 3D renderings, and specifications, leaving the client to source contractors and manage site issues. With Turnkey Contracting, SAAR assumes total responsibility for procurement, labor, site coordination, timeline control, and final delivery.',
  },
  {
    question: 'Are the architectural imagery shown on this website completed builds?',
    answer:
      'Images badged with "Design Concept" represent curated 3D visualizations and spatial studies illustrating our architectural proportion and material philosophy. In strict adherence to our transparency code, concepts are visibly marked and never represented as commissioned client projects.',
  },
  {
    question: 'What information is helpful to provide before an initial project discussion?',
    answer:
      'Helpful preliminary details include your property type (residential villa, apartment, or commercial floor plate), approximate carpet area, current condition (bare shell, existing fit-out, or occupied), and target completion timeframe.',
  },
  {
    question: 'How do I start a discussion for an upcoming project?',
    answer:
      'We are currently onboarding official corporate communication channels. In the interim, explore our capabilities and methodology across this website. Direct consultation booking and spatial qualification tools will activate shortly.',
  },
];

export const plannerTeaser = {
  eyebrow: 'Interactive Planning Tool',
  heading: 'Plan Your Space with Precision',
  description:
    'Our guided 5-step spatial planner helps you organize your space typology, service requirements, timeline, and budget framework into an editable project brief.',
  statusNote: 'Interactive planning wizard is live at /plan-my-project/.',
};
