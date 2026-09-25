/**
 * About Data Architecture: SAAR Business Support Solution
 * Central source of truth for About page editorial narrative,
 * working principles, confirmed service capabilities, and operational standards.
 *
 * Strictly adheres to the Zero-Fabrication Mandate:
 * Zero invented founding dates, fictional founder biographies, fake awards,
 * synthetic client quotes, or simulated certifications.
 */

export interface EthosPrinciple {
  number: string;
  title: string;
  tagline: string;
  description: string;
}

export interface ServiceFitItem {
  id: string;
  title: string;
  slug: string;
  suitableFor: string;
  deliverablesSummary: string;
  isImplemented: boolean;
}

export interface AboutData {
  tagline: string;
  introHeading: string;
  introLead: string;
  introNarrative: string[];
  principles: EthosPrinciple[];
  serviceFit: ServiceFitItem[];
  evidenceNotice: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  leadership: LeadershipProfile;
  operationalFootprint: {
    title: string;
    serviceCoverage: string;
    consultationModel: string;
    physicalCoordinatesNotice: string;
  };
}

export interface LeadershipProfile {
  name: string;
  designation: string;
  image: string;
  bio: string[];
  quote: string;
  focusAreas: string[];
}

export const aboutData: AboutData = {
  tagline: 'Designed with Purpose. Executed with Precision.',
  introHeading: 'Bridging Architectural Vision and Disciplined Execution',
  introLead:
    'Saar Business Support Solution provides comprehensive architectural interior design, bespoke joinery engineering, and single-point turnkey contracting for luxury residential environments and boutique commercial spaces.',
  introNarrative: [
    'Too often in the spatial design industry, a profound disconnect emerges between the architect’s drawing board and the contractor’s job site. Subtle details, material tactile qualities, and lighting transitions frequently become compromised through fragmented subcontractor handoffs and opaque procurement practices.',
    'SAAR was established to resolve this fundamental friction. By operating as a unified practice uniting spatial design rigor with direct site contracting accountability, we ensure that every millimeter conceived in our technical drawings is executed with fidelity on site.',
    'We work with discerning homeowners, boutique commercial leaders, and corporate teams who value architectural clarity, material authenticity, and calm, transparent project governance.',
  ],
  principles: [
    {
      number: '01',
      title: 'Material Honesty',
      tagline: 'Authentic regional textures engineered to age gracefully',
      description:
        'We believe spaces should feel grounded and enduring. We specify authentic regional stones, genuine wood veneers, architectural metals, and breathable mineral plasters, rejecting artificial imitations that deteriorate quickly under daily use.',
    },
    {
      number: '02',
      title: 'Single-Point Accountability',
      tagline: 'Eliminating the gap between drawing board and job site',
      description:
        'By integrating interior architectural design with full turnkey contracting, clients communicate with a single responsible entity. We manage procurement, specialist trades, and quality audits from initial brief to final key handover.',
    },
    {
      number: '03',
      title: 'Documented Quantities & Scope Transparency',
      tagline: 'Line-item clarity with zero ambiguous contingencies',
      description:
        'Every project is governed by an exhaustive technical drawing set and an itemized Bill of Quantities (BoQ) with defined material grades and dimensions. We do not engage in opaque lump-sum pricing or hidden on-site markups.',
    },
    {
      number: '04',
      title: 'Architectural Boundary Integrity',
      tagline: 'Respecting engineering disciplines and structural safety',
      description:
        'We maintain strict ethical boundaries around our scope. Structural calculations, modifications to primary RCC frames, and municipal authority sanctions are never improvised and are always referred to independent licensed structural engineers.',
    },
  ],
  serviceFit: [
    {
      id: 'interior-design',
      title: 'Interior Design & Space Planning',
      slug: 'interior-design',
      suitableFor: 'Clients seeking comprehensive design drawings, custom joinery details, and material schedules to tender or execute independently.',
      deliverablesSummary: 'Scaled 2D layouts, 3D conceptual renderings, joinery drawing package, and line-item BoQ.',
      isImplemented: true,
    },
    {
      id: 'turnkey-contracting',
      title: 'Turnkey Contracting & Fit-Out',
      slug: 'turnkey-contracting',
      suitableFor: 'Clients requiring end-to-end execution where SAAR assumes total responsibility for procurement, trades, site supervision, and delivery.',
      deliverablesSummary: 'Single-point site management, MEP coordination, factory-crafted joinery installation, snag auditing, and move-in handover.',
      isImplemented: true,
    },
    {
      id: 'renovation',
      title: 'Architectural Renovation',
      slug: 'renovation',
      suitableFor: 'Adaptive reuse of existing residential or commercial spaces requiring partition reconfiguration and MEP overhauls.',
      deliverablesSummary: 'Condition assessments, non-structural spatial remodeling, and high-performance finishes (in phased rollout).',
      isImplemented: false,
    },
  ],
  evidenceNotice: {
    title: 'Design Directions & Client Confidentiality',
    description:
      'To honor the privacy of private residential owners and commercial partners, our publicly showcased case studies currently feature curated architectural design concepts demonstrating our spatial planning, joinery detailing, and material curation standards. Commissioned client projects remain in staging pending formal photographic release authorization.',
    ctaLabel: 'Explore Design Directions',
    ctaHref: '/projects/',
  },
  leadership: {
    name: 'Ramnewas Verma',
    designation: 'Proprietor',
    image: '/images/team/ramnewas-verma.webp',
    bio: [
      'Ramnewas Verma leads SAAR Business Support Solution with a practical, execution-first approach to architectural interior design and turnkey contracting across Delhi NCR.',
      'Recognizing the persistent divide between architectural drawings and site delivery, he established the practice around single-point accountability — ensuring spatial integrity, material authenticity, and line-item clarity are strictly preserved from initial brief through project handover.',
      'His leadership emphasizes direct owner governance on site, rigorous vendor and MEP trade coordination, and complete transparency in quantities and construction documentation.',
    ],
    quote:
      'True architectural delivery requires standing behind every millimeter conceived on the drawing board. Our single-point governance ensures that promises made during design are faithfully realized on site.',
    focusAreas: [
      'Single-Point Operational Governance',
      'Material Integrity & Authentic Finishes',
      'On-Site Trade & MEP Quality Supervision',
      'Transparent Quantity & Cost Auditing',
    ],
  },
  operationalFootprint: {
    title: 'Operational Coverage & Consultation',
    serviceCoverage:
      'SAAR provides architectural interior design and turnkey execution services across select regional metropolitan markets for qualified residential and commercial projects.',
    consultationModel:
      'We initiate all client engagements through structured Stage 01 discovery discussions to assess spatial feasibility, site logistics, and alignment with our delivery standards.',
    physicalCoordinatesNotice:
      'Physical studio consultations are coordinated by prior appointment. Registered office coordinates will be published upon final operational administrative sign-off.',
  },
};
