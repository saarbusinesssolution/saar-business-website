/**
 * Process Data Architecture: SAAR Business Support Solution
 * Central source of truth for the 5-stage spatial delivery methodology:
 * Discover → Plan → Design → Execute → Handover.
 *
 * Used concurrently by:
 * - Full Our Process page (/process/)
 * - Homepage Methodology summary (ProcessSection.astro via home.ts)
 * - Development component previews
 *
 * Strictly adheres to the Zero-Fabrication Mandate:
 * No invented turnaround days, synthetic payment milestone percentages,
 * artificial revision guarantees, or fake warranty claims.
 */

export interface ProcessStage {
  id: 'discover' | 'plan' | 'design' | 'execute' | 'handover';
  order: number;
  orderFormatted: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  objective: string;
  clientInvolvement: string[];
  saarResponsibility: string[];
  expectedOutput: string[];
  serviceApplicability: {
    interiorDesign: 'core' | 'excluded';
    turnkeyContracting: 'core';
    renovation: 'core';
  };
  applicabilityNote: string;
  reviewStatus: 'confirmed';
}

export interface PreparationItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  example: string;
}

export interface ProcessFaq {
  question: string;
  answer: string;
}

export const processStages: ProcessStage[] = [
  {
    id: 'discover',
    order: 1,
    orderFormatted: '01',
    title: 'Spatial Discovery & Brief Formulation',
    shortTitle: 'Discover',
    subtitle: 'Requirements Analysis & Spatial Scope',
    summary:
      'We analyze site proportions, functional priorities, spatial constraints, and natural illumination before drafting preliminary concepts.',
    objective:
      'Establish a clear, documented project baseline including spatial requirements, lifestyle or operational routines, and budget parameters.',
    clientInvolvement: [
      'Provide site access coordinates or architectural base drawings if available.',
      'Articulate functional spatial needs, occupancy requirements, and aesthetic preferences.',
      'Clarify desired project horizons and target investment framework.',
    ],
    saarResponsibility: [
      'Conduct preliminary spatial assessment and identify structural or MEP boundary conditions.',
      'Formulate structured discovery memo summarizing operational parameters.',
      'Define preliminary engagement scope and recommended delivery methodology.',
    ],
    expectedOutput: [
      'Documented Spatial Brief Memo',
      'Preliminary Scope Boundary Checklist',
      'Recommended Engagement Roadmap',
    ],
    serviceApplicability: {
      interiorDesign: 'core',
      turnkeyContracting: 'core',
      renovation: 'core',
    },
    applicabilityNote:
      'Foundational stage required for all projects: Interior Design, Turnkey Contracting, and Renovation.',
    reviewStatus: 'confirmed',
  },
  {
    id: 'plan',
    order: 2,
    orderFormatted: '02',
    title: 'Concept Direction & Spatial Planning',
    shortTitle: 'Plan',
    subtitle: 'Circulation Diagrams & Scaled Layouts',
    summary:
      'Translation of the spatial brief into scaled 2D furniture layouts, circulation pathways, functional zoning, and overarching design intent.',
    objective:
      'Optimize human circulation, ergonomic comfort, light ingress, and spatial efficiency prior to technical surface detailing.',
    clientInvolvement: [
      'Review scaled layout options and provide directional feedback on spatial zoning.',
      'Confirm functional furniture groupings, storage allocations, and movement clearances.',
      'Align on moodboard aesthetics and primary tactile material directions.',
    ],
    saarResponsibility: [
      'Develop scaled 2D General Arrangement (GA) floor plans and partition layouts.',
      'Map natural daylight angles, artificial light zones, and internal sightlines.',
      'Curate conceptual moodboards detailing primary wood, stone, metal, and textile directions.',
    ],
    expectedOutput: [
      'Scaled 2D General Arrangement (GA) Plans',
      'Zoning & Circulation Studies',
      'Concept Direction Moodboards',
    ],
    serviceApplicability: {
      interiorDesign: 'core',
      turnkeyContracting: 'core',
      renovation: 'core',
    },
    applicabilityNote:
      'Applies to all disciplines. Forms the frozen spatial footprint for technical documentation.',
    reviewStatus: 'confirmed',
  },
  {
    id: 'design',
    order: 3,
    orderFormatted: '03',
    title: 'Technical Detailing & Material Curation',
    shortTitle: 'Design',
    subtitle: 'Joinery Engineering & Detailed BoQ Formulation',
    summary:
      'Precision CAD drawing packages, 3D concept visualizations, physical material curation, and an itemized, line-item Bill of Quantities.',
    objective:
      'Produce contractor-ready technical documentation and transparent cost schedules with zero ambiguous line items.',
    clientInvolvement: [
      'Review and approve physical material swatches, veneer finishes, and hardware selections.',
      'Review reflected ceiling plans, lighting fixture points, and electrical convenience locations.',
      'Approve final detailed drawings and line-item Bill of Quantities (BoQ).',
    ],
    saarResponsibility: [
      'Engineer custom joinery, millwork construction details, and section elevations.',
      'Draft coordinated electrical, lighting switching, and plumbing point drawings.',
      'Formulate comprehensive material schedule and itemized BoQ with specified product grades.',
      'Render 3D spatial visualizations to demonstrate lighting and material harmony.',
    ],
    expectedOutput: [
      'Complete Technical Construction Drawing Pack (CAD)',
      'Reflected Ceiling & Lighting Layouts',
      'Custom Joinery Detail Drawings & Elevations',
      'Detailed Material & Finishes Schedule',
      'Line-Item Bill of Quantities (BoQ)',
    ],
    serviceApplicability: {
      interiorDesign: 'core',
      turnkeyContracting: 'core',
      renovation: 'core',
    },
    applicabilityNote:
      'Concluding stage for Design-Only engagements (provides tender-ready package). Forms the approved execution baseline for Turnkey Contracting.',
    reviewStatus: 'confirmed',
  },
  {
    id: 'execute',
    order: 4,
    orderFormatted: '04',
    title: 'Turnkey Execution & Site Management',
    shortTitle: 'Execute',
    subtitle: 'Trade Coordination & Quality Supervision',
    summary:
      'Single-point site contracting: material procurement control, specialist trade supervision, MEP coordination, and milestone-governed site delivery.',
    objective:
      'Faithfully translate approved technical drawings into built reality on site, adhering rigorously to material integrity and craft standards.',
    clientInvolvement: [
      'Participate in milestone site walkthroughs at key transformation stages.',
      'Review and sign off on on-site finish mockups prior to full batch production.',
      'Facilitate access permissions and building management approvals where applicable.',
    ],
    saarResponsibility: [
      'Deploy full-time on-site management and direct subcontractor trade coordination.',
      'Procure authentic specified materials directly from verified supply chains.',
      'Coordinate HVAC, electrical, plumbing, civil modifications, and acoustic fit-outs.',
      'Perform continuous quality audits and stage-gate inspections against technical drawings.',
    ],
    expectedOutput: [
      'Periodic Site Progress Reports with Photographic Verification',
      'Completed Civil, MEP, Ceiling & Surface Finishes',
      'Factory-Fabricated & Precision-Installed Custom Joinery',
      'Coordinated Lighting & Sanitary Installations',
    ],
    serviceApplicability: {
      interiorDesign: 'excluded',
      turnkeyContracting: 'core',
      renovation: 'core',
    },
    applicabilityNote:
      'Exclusive to Turnkey Contracting and Renovation execution. Design-only commissions exclude physical site labor and contracting.',
    reviewStatus: 'confirmed',
  },
  {
    id: 'handover',
    order: 5,
    orderFormatted: '05',
    title: 'Snag Auditing & Structured Handover',
    shortTitle: 'Handover',
    subtitle: 'Joint Inspection, Commissioning & Walkthrough',
    summary:
      'Meticulous snag-list audit, mechanical and electrical testing, deep surface detailing, and structured key handover.',
    objective:
      'Ensure every detail satisfies architectural specifications and deliver a flawless, move-in-ready environment.',
    clientInvolvement: [
      'Attend joint handover walkthrough to inspect finishes, joinery movement, and fixtures.',
      'Review snag list items for documented resolution verification.',
      'Accept formal handover of the completed space.',
    ],
    saarResponsibility: [
      'Perform rigorous pre-handover punch-list audit across all surfaces and hardware.',
      'Systematically rectify any identified snags before formal client walkthrough.',
      'Conduct operational testing of all lighting circuits, plumbing fixtures, and moving joinery.',
      'Provide comprehensive as-built drawing set and material care maintenance guidelines.',
    ],
    expectedOutput: [
      'Joint Snag Audit Checklist & Resolution Sign-Off',
      'As-Built Technical Reference Drawings',
      'Material Maintenance & Care Recommendations',
      'Formal Handover of Space and Keys',
    ],
    serviceApplicability: {
      interiorDesign: 'excluded',
      turnkeyContracting: 'core',
      renovation: 'core',
    },
    applicabilityNote:
      'Final milestone for Turnkey Contracting and Renovation projects.',
    reviewStatus: 'confirmed',
  },
];

export const preparationGuidelines: PreparationItem[] = [
  {
    id: 'location',
    title: 'Project Location & Site Accessibility',
    subtitle: 'City, neighborhood, and site handover status',
    description:
      'Knowing where the property is located and whether it is a bare-shell handover, an occupied space, or currently under builder construction helps us assess logistical parameters.',
    example: 'e.g., South Delhi residential apartment, possession handed over, ready for interior fit-out.',
  },
  {
    id: 'typology',
    title: 'Space Typology & Usable Area',
    subtitle: 'Residential villa, corporate floor, or retail space',
    description:
      'Approximate carpet area (in sq. ft. or sq. m.) and the nature of the space allow us to estimate spatial complexity, zoning requirements, and trade coordination scope.',
    example: 'e.g., 3,200 sq. ft. 4-BHK private residence or 4,500 sq. ft. commercial boutique office.',
  },
  {
    id: 'drawings',
    title: 'Base Drawings or Site Layout (If Available)',
    subtitle: 'Architectural CAD file, builder plan, or sketch',
    description:
      'Any existing architectural floor plan, builder brochure layout, or hand-drawn dimensioned sketch accelerates preliminary spatial zoning analysis.',
    example: 'e.g., PDF builder floor plan showing structural columns and shaft locations.',
  },
  {
    id: 'requirements',
    title: 'Functional Requirements & Lifestyle Priorities',
    subtitle: 'Must-have functional spaces, storage, and technology needs',
    description:
      'A concise list of how you intend to use the space: dedicated home office, acoustic conference room, custom walk-in wardrobes, or integrated smart home automation.',
    example: 'e.g., Need acoustic isolation in the study, extensive kitchen prep island, and concealed bar joinery.',
  },
  {
    id: 'timeline',
    title: 'Desired Timeline & Target Occupancy',
    subtitle: 'Target move-in date or key business milestone',
    description:
      'Understanding your target completion window allows us to structure appropriate milestone scheduling and procurement lead-time buffers.',
    example: 'e.g., Aiming for site completion within 5 to 6 months from technical sign-off.',
  },
  {
    id: 'budget',
    title: 'Target Investment Framework',
    subtitle: 'Realistic capital allocation for design and execution',
    description:
      'An honest budget framework enables us to specify appropriate material grades, joinery hardware, and lighting systems without wasteful value engineering later.',
    example: 'e.g., Defined budget range allowing for authentic veneer, Italian marble, and high-spec architectural lighting.',
  },
  {
    id: 'references',
    title: 'Aesthetic & Material References',
    subtitle: 'Inspirational images, tactile preferences, or moodboards',
    description:
      'Visual references—whether warm minimalism, mid-century modern, or industrial warmth—help calibrate initial design intent and palette curation.',
    example: 'e.g., Preference for muted earthy tones, fluted teak woodwork, and concealed warm LED illumination.',
  },
];

export const processFaqs: ProcessFaq[] = [
  {
    question: 'How does the process differ between Interior Design and Turnkey Contracting?',
    answer:
      'An Interior Design engagement covers Stages 01 through 03, concluding with a comprehensive technical drawing pack, material schedules, 3D visualizations, and an itemized BoQ. This leaves you with an executable blueprint to tender independently. A Turnkey Contracting engagement encompasses the entire journey from Stage 01 through Stage 05, with SAAR assuming single-point accountability for procurement, trade supervision, site execution, snag auditing, and final handover.',
  },
  {
    question: 'Can we begin with design and decide on turnkey execution later?',
    answer:
      'Yes. Many clients engage SAAR initially for Stages 01–03 to develop and freeze the spatial layouts, bespoke joinery drawings, and line-item BoQ. Once the detailed scope and budget are approved, clients frequently transition into our Turnkey Contracting service (Stages 04–05) for seamless single-point execution without handoff friction.',
  },
  {
    question: 'How are unexpected site conditions managed during execution?',
    answer:
      'Preliminary site inspections in Stage 01 evaluate observable structural constraints and MEP pathways. However, if concealed deviations (such as hidden plumbing offsets or non-square civil walls) are uncovered during demolition or fit-out in Stage 04, they are immediately documented, measured, and reviewed with the client alongside proposed technical adjustments before proceeding.',
  },
  {
    question: 'Does SAAR undertake structural load-bearing modifications?',
    answer:
      'No. In strict accordance with engineering safety standards, SAAR does not perform uncertified structural modifications. Any proposed alterations to primary RCC columns, shear walls, or load-bearing masonry require formal review, calculations, and sign-off by an independent licensed structural engineer and municipal building authorities.',
  },
  {
    question: 'Are the preparation guidelines mandatory before contacting SAAR?',
    answer:
      'No. The preparation guidelines are helpful suggestions designed to maximize the productivity of our initial conversation. If you do not have drawings, exact dimensions, or defined material preferences, our Stage 01 discovery consultation is structured to help you explore and clarify these requirements.',
  },
];
