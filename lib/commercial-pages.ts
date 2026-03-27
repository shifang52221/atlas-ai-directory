import type { EditorialHubConfig } from "./editorial-hubs";

type CommercialPageSeed = {
  path: string;
  title: string;
  metadataDescription: string;
  heroSubtitle: string;
  recommendationSlugs: [string, string, string];
};

function buildCommercialFaqItems(seed: CommercialPageSeed) {
  return [
    {
      question: `What should buyers know about ${seed.title}?`,
      answer:
        "Start with shortlist fit, then validate setup effort, total cost, and operational reliability under a real pilot workflow.",
    },
    {
      question: `How should teams compare ${seed.title} options before buying?`,
      answer:
        "Compare rollout speed, ownership model, and pricing-to-output efficiency before selecting a long-term stack.",
    },
    {
      question: `Are affiliate links used in this ${seed.title} guide?`,
      answer:
        "Yes, some outbound links may include affiliate tracking. Ranking logic remains editorial and is separated from monetization.",
    },
  ];
}

function buildCommercialPageConfig(seed: CommercialPageSeed): EditorialHubConfig {
  const [firstSlug, secondSlug, thirdSlug] = seed.recommendationSlugs;

  return {
    path: seed.path,
    title: seed.title,
    metadataDescription: seed.metadataDescription,
    heroSubtitle: seed.heroSubtitle,
    heroMeta: ["Updated monthly", "Commercial intent page", "Affiliate-supported with disclosure"],
    whoFits: [
      "Teams selecting tools with immediate deployment and ROI requirements",
      "Operators comparing alternatives before procurement decisions",
      "Leads who need implementation constraints and tradeoffs up front",
    ],
    avoidIf: [
      "Your workflow objectives are still undefined or unstable",
      "No owner can validate rollout quality and adoption metrics",
    ],
    implementationPlan: [
      "Week 1: define buying criteria and baseline current process performance",
      "Week 2: pilot top candidates and track setup friction by owner role",
      "Week 3: compare reliability, quality, and cost under real workload",
      "Week 4: standardize winning stack and publish operational playbook",
    ],
    kpiScorecard: [
      "Time to first production-ready workflow",
      "Outbound CTR and click-to-conversion rate by page module",
      "Cost-per-successful workflow execution at expected monthly volume",
    ],
    buyingMistakes: [
      "Choosing based on headline pricing alone instead of validating cost at realistic monthly usage.",
      "Skipping owner assignment and rollout checkpoints because the shortlist looks straightforward.",
      "Comparing too many vendors at once without a fixed pilot workflow and scorecard.",
    ],
    rolloutChecklist: [
      "Days 1-15: define buying criteria, current pain points, and minimum success thresholds.",
      "Days 16-30: run a controlled pilot with the top candidates on one real workflow.",
      "Days 31-45: measure setup effort, reliability, and operator confidence under live conditions.",
      "Days 46-60: compare spend, adoption, and quality side by side before narrowing the shortlist.",
      "Days 61-75: document the winning workflow, permissions, and fallback process.",
      "Days 76-90: expand usage only after the selected tool holds up against cost and quality targets.",
    ],
    comparisonQuestions: [
      {
        question: `${firstSlug} vs ${secondSlug}: which is better for operator launch speed?`,
        answer:
          "Choose the option with lower setup friction and clearer handoff controls for your current team skill profile.",
      },
      {
        question: `${secondSlug} vs ${thirdSlug}: what matters more before scaling?`,
        answer:
          "Compare reliability under production load, ownership model, and long-term cost profile before making the final pick.",
      },
      {
        question: `${firstSlug} vs ${thirdSlug}: how should teams validate fit quickly?`,
        answer:
          "Run a scoped pilot with fixed success metrics and only expand once conversion and quality targets are consistently met.",
      },
    ],
    recommendations: [
      {
        slug: firstSlug,
        score: 9.1,
        bestFor: "Primary shortlist candidate with strong commercial intent fit",
        tradeoff: "May require deeper evaluation for edge-case workflows",
        evidence:
          "Evidence basis: public documentation review, deployment assumptions, and operator-oriented evaluation criteria.",
      },
      {
        slug: secondSlug,
        score: 8.9,
        bestFor: "Alternative candidate with balanced setup and control",
        tradeoff: "Pricing or feature depth may vary by use case maturity",
        evidence:
          "Evidence basis: public feature scope, setup characteristics, and operational maintainability factors.",
      },
      {
        slug: thirdSlug,
        score: 8.7,
        bestFor: "Secondary option for teams optimizing long-term flexibility",
        tradeoff: "Can require more process rigor before scale deployment",
        evidence:
          "Evidence basis: implementation complexity, governance requirements, and scenario-level workflow fit.",
      },
    ],
    faqItems: buildCommercialFaqItems(seed),
    continueLinks: [
      { label: "Compare AI tools side by side", href: "/compare" },
      { label: "Browse all AI tools", href: "/tools" },
      { label: "Best AI Automation Tools for Ops Teams", href: "/best-ai-automation-tools" },
      { label: "Best AI Agents for Sales Teams", href: "/best-ai-agents-for-sales" },
      { label: "Affiliate disclosure rules", href: "/affiliate-disclosure" },
    ],
    experiment: {
      variantB: {
        heroSubtitle: `Buyer-first shortlist for ${seed.title} with stronger emphasis on pricing transparency, rollout speed, and switching risk before commitment.`,
        topPickOrder: [secondSlug, firstSlug, thirdSlug],
        ctaPrimaryLabel: "Start trial",
        ctaSecondaryLabel: "View profile",
        tableCtaLabel: "Open pricing",
      },
    },
  };
}

const commercialPageSeeds: CommercialPageSeed[] = [
  {
    path: "/best-ai-automation-tools-for-small-business",
    title: "Best AI Automation Tools for Small Business",
    metadataDescription:
      "Commercial-intent shortlist of AI automation tools for small businesses focused on speed, cost control, and reliability.",
    heroSubtitle:
      "Small teams need rapid deployment without operational debt. This shortlist ranks practical options for immediate automation impact.",
    recommendationSlugs: ["make", "zapier-ai", "n8n"],
  },
  {
    path: "/best-ai-sales-agents-for-smb",
    title: "Best AI Sales Agents for SMB Teams",
    metadataDescription:
      "Compare practical AI sales agent options for SMB teams prioritizing enrichment quality, outreach speed, and pipeline consistency.",
    heroSubtitle:
      "SMB sales teams need clean handoffs and measurable conversion gains. This page prioritizes operationally realistic agent choices.",
    recommendationSlugs: ["clay", "relevance-ai", "lindy"],
  },
  {
    path: "/best-ai-tools-for-marketing-under-100",
    title: "Best AI Tools for Marketing Teams Under $100/mo",
    metadataDescription:
      "Budget-constrained marketing shortlist focused on campaign execution speed, workflow clarity, and sustainable monthly cost.",
    heroSubtitle:
      "For teams with strict spend caps, this shortlist emphasizes practical ROI over feature noise.",
    recommendationSlugs: ["make", "zapier-ai", "clay"],
  },
  {
    path: "/best-ai-tools-for-support-ticket-triage",
    title: "Best AI Tools for Support Ticket Triage",
    metadataDescription:
      "Operator-focused support triage shortlist covering routing quality, escalation control, and response-time improvements.",
    heroSubtitle:
      "Support leaders need faster triage without quality regression. These tools are ranked for predictable execution.",
    recommendationSlugs: ["lindy", "zapier-ai", "relevance-ai"],
  },
  {
    path: "/make-alternatives",
    title: "Make Alternatives",
    metadataDescription:
      "Decision-oriented alternatives to Make for teams comparing automation depth, maintenance overhead, and deployment speed.",
    heroSubtitle:
      "If Make is on your shortlist, use this page to benchmark practical alternatives before procurement.",
    recommendationSlugs: ["zapier-ai", "n8n", "relevance-ai"],
  },
  {
    path: "/semrush-alternatives",
    title: "Semrush Alternatives",
    metadataDescription:
      "Commercial-intent alternatives framework for teams evaluating SEO and growth tooling options with operational tradeoffs.",
    heroSubtitle:
      "For growth operators comparing SEO stacks, this page focuses on deployment practicality and measurable outcomes.",
    recommendationSlugs: ["make", "clay", "zapier-ai"],
  },
  {
    path: "/hubspot-alternatives-for-startups",
    title: "HubSpot Alternatives for Startups",
    metadataDescription:
      "Startup-focused alternatives analysis for teams balancing CRM automation capabilities, speed, and budget sensitivity.",
    heroSubtitle:
      "Early-stage teams need less operational overhead and faster onboarding. This shortlist emphasizes startup execution realities.",
    recommendationSlugs: ["make", "zapier-ai", "n8n"],
  },
  {
    path: "/monday-vs-clickup-for-ops",
    title: "monday vs ClickUp for Ops Teams",
    metadataDescription:
      "Side-by-side operational comparison framework for teams deciding between monday and ClickUp style execution models.",
    heroSubtitle:
      "Ops teams need clear ownership and process reliability. This comparison highlights practical selection criteria.",
    recommendationSlugs: ["make", "zapier-ai", "n8n"],
  },
  {
    path: "/synthesia-alternatives",
    title: "Synthesia Alternatives",
    metadataDescription:
      "AI video tooling alternatives for teams optimizing production speed, editing workflow, and commercial content output.",
    heroSubtitle:
      "Content operations teams can use this page to compare realistic alternatives before scaling video workflows.",
    recommendationSlugs: ["lindy", "relevance-ai", "make"],
  },
  {
    path: "/descript-alternatives",
    title: "Descript Alternatives",
    metadataDescription:
      "Decision-focused alternatives to Descript for teams evaluating creator workflow speed, quality controls, and collaboration fit.",
    heroSubtitle:
      "If your content team needs higher throughput with editorial control, compare these alternatives before committing.",
    recommendationSlugs: ["make", "zapier-ai", "n8n"],
  },
  {
    path: "/ai-sales-automation-tools-for-lead-enrichment",
    title: "AI Sales Automation Tools for Lead Enrichment",
    metadataDescription:
      "Use-case page for GTM teams selecting enrichment-focused AI automation tools with clear handoff and conversion metrics.",
    heroSubtitle:
      "Lead enrichment only works when data quality and downstream execution are tightly connected. This shortlist reflects that constraint.",
    recommendationSlugs: ["clay", "make", "relevance-ai"],
  },
  {
    path: "/ai-workflow-tools-for-internal-operations",
    title: "AI Workflow Tools for Internal Operations",
    metadataDescription:
      "Internal ops shortlist for finance, onboarding, and recurring process automation with reliability-first decision criteria.",
    heroSubtitle:
      "Back-office teams need stable automation and auditability. This page prioritizes control and rollout reliability.",
    recommendationSlugs: ["zapier-ai", "make", "n8n"],
  },
];

export const commercialPages: EditorialHubConfig[] = commercialPageSeeds.map(
  buildCommercialPageConfig,
);

