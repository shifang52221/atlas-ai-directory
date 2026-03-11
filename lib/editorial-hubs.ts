import { LinkKind } from "@prisma/client";
import { buildOutboundHref, getFallbackToolProfiles } from "./tool-profile-data";

type HubRecommendation = {
  slug: string;
  score: number;
  bestFor: string;
  tradeoff: string;
  evidence: string;
};

type HubFaqItem = {
  question: string;
  answer: string;
};

type HubComparisonQuestion = {
  question: string;
  answer: string;
};

type ContinueLink = {
  label: string;
  href: string;
};

export type EditorialHubVariant = "A" | "B";

type EditorialHubVariantBConfig = {
  heroSubtitle: string;
  topPickOrder: string[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  tableCtaLabel: string;
};

export type EditorialHubConfig = {
  path: string;
  title: string;
  metadataDescription: string;
  heroSubtitle: string;
  heroMeta: [string, string, string];
  whoFits: string[];
  avoidIf: string[];
  implementationPlan: string[];
  kpiScorecard: string[];
  comparisonQuestions: HubComparisonQuestion[];
  recommendations: HubRecommendation[];
  faqItems: HubFaqItem[];
  continueLinks: ContinueLink[];
  experiment?: {
    variantB: EditorialHubVariantBConfig;
  };
};

export type EditorialHubRankedTool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  setupLabel: string;
  pricingLabel: string;
  score: number;
  bestFor: string;
  tradeoff: string;
  evidence: string;
  outboundHref: string;
};

export type EditorialHubExperimentView = {
  variant: EditorialHubVariant;
  heroSubtitle: string;
  rankedTools: EditorialHubRankedTool[];
  primaryTools: EditorialHubRankedTool[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  tableCtaLabel: string;
};

const editorialHubs: EditorialHubConfig[] = [
  {
    path: "/best-ai-automation-tools",
    title: "Best AI Automation Tools for Ops Teams",
    metadataDescription:
      "Commercial-intent editorial shortlist of the best AI automation tools for operators, with side-by-side tradeoffs and practical buying guidance.",
    heroSubtitle:
      "Editorial shortlist for teams choosing automation platforms this quarter. We rank tools by deployment speed, operational control, and real-world workflow fit.",
    heroMeta: ["Updated monthly", "Global English market", "Affiliate-supported with disclosure"],
    whoFits: [
      "Ops teams running repeated cross-app workflows with clear process ownership",
      "Organizations that need fast time-to-value with measurable reliability improvements",
      "Leaders comparing managed automation vs technical-control tradeoffs this quarter",
    ],
    avoidIf: [
      "Your workflow definitions are unstable and owners are not yet assigned",
      "You need a purely engineering benchmark with no operator-centric priorities",
    ],
    implementationPlan: [
      "Week 1: baseline workflow volume, failure rate, and current turnaround time",
      "Week 2: pilot top 2 automations and track setup effort by owner role",
      "Week 3: add alerting, fallback handling, and naming governance for production",
      "Week 4: scale only proven workflows and freeze scorecard review cadence",
    ],
    kpiScorecard: [
      "Workflow success rate by category after first 14 days",
      "Mean setup time to first production-ready automation",
      "Monthly automation cost per completed workflow run",
    ],
    comparisonQuestions: [
      {
        question: "Zapier AI vs Make: which is better for mixed operator teams?",
        answer:
          "Zapier AI is usually better for faster launch and simpler handoffs, while Make is stronger when branching depth and visual scenario control are critical.",
      },
      {
        question: "Make vs n8n: what should teams compare first before scaling?",
        answer:
          "Compare maintenance ownership, debugging workflow, and long-term control requirements before choosing based only on UI preferences.",
      },
      {
        question: "n8n vs Relevance AI: when does agent orchestration beat workflow builders?",
        answer:
          "Choose n8n when custom infrastructure control is central, and choose Relevance AI when role-based agent workflows and governance are the main objective.",
      },
    ],
    recommendations: [
      {
        slug: "zapier-ai",
        score: 9.4,
        bestFor: "Fast cross-app launch with low ops overhead",
        tradeoff: "Advanced logic depth is more limited than n8n or Make",
        evidence:
          "Evidence basis: integration catalog depth, onboarding docs, and workflow template coverage reviewed in March 2026.",
      },
      {
        slug: "make",
        score: 9.2,
        bestFor: "Visual multi-step orchestration and branching control",
        tradeoff: "Scenario design can be heavy for simple one-step automations",
        evidence:
          "Evidence basis: branching editor capability, error-handler controls, and scenario monitoring visibility in current vendor docs.",
      },
      {
        slug: "n8n",
        score: 9.0,
        bestFor: "Technical teams requiring open-source flexibility",
        tradeoff: "Self-hosting and maintenance need stronger technical ownership",
        evidence:
          "Evidence basis: self-hosting options, node extensibility, and infrastructure ownership requirements from setup documentation.",
      },
      {
        slug: "relevance-ai",
        score: 8.8,
        bestFor: "Role-based AI workforce deployment at team level",
        tradeoff: "Agent orchestration setup can be overkill for small teams",
        evidence:
          "Evidence basis: role-based agent templates, orchestration workflow surface, and operational governance controls documented publicly.",
      },
      {
        slug: "lindy",
        score: 8.7,
        bestFor: "SMB operators automating inbox and support handoffs",
        tradeoff: "Complex multi-system logic can require supplemental tooling",
        evidence:
          "Evidence basis: prebuilt assistant flows, inbox handoff coverage, and setup effort signals from user onboarding materials.",
      },
    ],
    faqItems: [
      {
        question: "Which AI automation tool is best for non-technical teams?",
        answer:
          "Zapier AI is usually the easiest starting point for non-technical teams because setup friction is low and app coverage is broad.",
      },
      {
        question: "Should operators choose Make or n8n in 2026?",
        answer:
          "Choose Make when you want visual orchestration without infrastructure overhead. Choose n8n when control, customization, and self-hosting matter more.",
      },
      {
        question: "How should teams evaluate AI automation pricing?",
        answer:
          "Compare by total monthly workflow volume, seat count, and execution limits. Avoid choosing only on starter plan price.",
      },
      {
        question: "Are outbound links on this page affiliate-tracked?",
        answer:
          "Some outbound links may include affiliate tracking and we always label disclosure pages clearly before monetized recommendations.",
      },
    ],
    continueLinks: [
      { label: "Compare tools side by side", href: "/compare" },
      { label: "Browse use-case clusters", href: "/use-cases" },
      { label: "Review workflow templates", href: "/workflows" },
      { label: "Best AI Agents for Sales Teams", href: "/best-ai-agents-for-sales" },
      { label: "Best AI Tools for Customer Support", href: "/best-ai-tools-for-support" },
      { label: "Best AI Tools for Marketing Teams", href: "/best-ai-tools-for-marketing" },
      { label: "Affiliate disclosure rules", href: "/affiliate-disclosure" },
    ],
    experiment: {
      variantB: {
        heroSubtitle:
          "Hands-on shortlist for operators who need faster rollout and clearer ROI proof. This variant prioritizes workflow depth and execution control.",
        topPickOrder: ["make", "zapier-ai", "n8n", "relevance-ai", "lindy"],
        ctaPrimaryLabel: "Start Free Trial",
        ctaSecondaryLabel: "Full review",
        tableCtaLabel: "Open site",
      },
    },
  },
  {
    path: "/best-ai-agents-for-sales",
    title: "Best AI Agents for Sales Teams",
    metadataDescription:
      "Find the best AI agents for sales outreach, enrichment, and follow-up workflows with practical tradeoffs and operator-focused scoring.",
    heroSubtitle:
      "Sales teams need faster pipeline velocity, cleaner enrichment, and reliable handoffs. This shortlist ranks agent tools by GTM impact and operational reliability.",
    heroMeta: ["Quarterly refreshed", "B2B GTM focus", "Affiliate-supported with disclosure"],
    whoFits: [
      "Revenue teams that run weekly outbound programs and enforce CRM hygiene",
      "RevOps leaders needing enrichment precision and reliable rep handoff",
      "Sales orgs measuring reply quality and meeting conversion by segment",
    ],
    avoidIf: [
      "Your outbound motion is still ad-hoc and lacks ICP discipline",
      "No team can own enrichment quality and routing governance end-to-end",
    ],
    implementationPlan: [
      "Week 1: lock ICP tiers, required enrichment fields, and lead routing logic",
      "Week 2: launch one outbound pilot sequence with strict QA on data accuracy",
      "Week 3: instrument meeting-quality and reply-rate reporting by segment",
      "Week 4: scale winning plays and retire low-performing workflow branches",
    ],
    kpiScorecard: [
      "Positive reply rate by ICP segment",
      "Meeting-booked conversion from first-touch sequences",
      "Lead-to-opportunity conversion within 30 days",
    ],
    comparisonQuestions: [
      {
        question: "Clay vs Relevance AI: which is stronger for sales execution?",
        answer:
          "Clay is typically stronger for enrichment-first targeting and outbound precision, while Relevance AI is stronger for multi-agent workflow orchestration.",
      },
      {
        question: "Clay vs Zapier AI: what should RevOps benchmark first?",
        answer:
          "Benchmark enrichment depth and signal freshness against cross-app automation speed and operational reliability to align with your GTM bottleneck.",
      },
      {
        question: "Relevance AI vs Lindy: which fits SMB sales teams better?",
        answer:
          "SMB teams often launch faster with Lindy, while Relevance AI is the better fit once role-based coordination and governance become priorities.",
      },
    ],
    recommendations: [
      {
        slug: "clay",
        score: 9.35,
        bestFor: "Signal-based enrichment and outbound execution",
        tradeoff: "Credit-based pricing can scale quickly with high volume",
        evidence:
          "Evidence basis: enrichment source coverage, list-building workflow controls, and outbound sequencing features reviewed this quarter.",
      },
      {
        slug: "relevance-ai",
        score: 9.18,
        bestFor: "Role-based multi-agent workflows for SDR and RevOps",
        tradeoff: "Initial orchestration setup is heavier than template-first tools",
        evidence:
          "Evidence basis: multi-agent orchestration templates, handoff checkpoints, and team-role workflow support in current product docs.",
      },
      {
        slug: "zapier-ai",
        score: 8.98,
        bestFor: "Fast lead-routing automations across CRM and support tools",
        tradeoff: "Less flexible than engineering-centric automation stacks",
        evidence:
          "Evidence basis: CRM integration surface, trigger-action reliability, and low-friction setup path for sales operations teams.",
      },
      {
        slug: "make",
        score: 8.9,
        bestFor: "Visual pipeline automations and attribution branching",
        tradeoff: "Complex scenarios can become hard to maintain without guardrails",
        evidence:
          "Evidence basis: visual branching depth, routing logic controls, and attribution workflow support validated in template library.",
      },
      {
        slug: "lindy",
        score: 8.72,
        bestFor: "SMB sales teams automating email follow-up loops",
        tradeoff: "Advanced enrichment depth is narrower than dedicated GTM tools",
        evidence:
          "Evidence basis: inbox-focused automation templates and follow-up assistant workflows aligned to SMB sales operations usage.",
      },
    ],
    faqItems: [
      {
        question: "Which AI sales agent is best for outbound prospecting?",
        answer:
          "Clay is typically strongest for data enrichment and outbound orchestration when teams need high-signal prospecting workflows.",
      },
      {
        question: "Can AI agents replace SDR workflows fully?",
        answer:
          "They can automate research, enrichment, and first-touch operations, but top teams still keep human review for messaging quality and deal strategy.",
      },
      {
        question: "What should RevOps teams compare first?",
        answer:
          "Compare enrichment coverage, CRM sync quality, and failure-retry behavior before ranking UI preferences.",
      },
      {
        question: "How do affiliate links affect these rankings?",
        answer:
          "Monetization never overrides editorial scoring. Sponsored and affiliate relationships are disclosed separately from ranking logic.",
      },
    ],
    continueLinks: [
      { label: "See AI sales use cases", href: "/use-cases/ai-sales" },
      { label: "Compare shortlisted tools", href: "/compare" },
      { label: "Browse all tools", href: "/tools" },
      { label: "Best AI Automation Tools for Ops Teams", href: "/best-ai-automation-tools" },
      { label: "Best AI Tools for Customer Support", href: "/best-ai-tools-for-support" },
      { label: "Best AI Tools for Marketing Teams", href: "/best-ai-tools-for-marketing" },
      { label: "Affiliate disclosure rules", href: "/affiliate-disclosure" },
    ],
    experiment: {
      variantB: {
        heroSubtitle:
          "Pipeline-first variant focused on meeting velocity targets this quarter. Ranking emphasizes enrichment precision and handoff reliability.",
        topPickOrder: ["relevance-ai", "clay", "zapier-ai", "make", "lindy"],
        ctaPrimaryLabel: "See pricing",
        ctaSecondaryLabel: "Sales fit details",
        tableCtaLabel: "Visit vendor",
      },
    },
  },
  {
    path: "/best-ai-tools-for-support",
    title: "Best AI Tools for Customer Support",
    metadataDescription:
      "Editorial shortlist of AI tools for support teams covering triage, response drafting, and escalation workflows with clear tradeoffs.",
    heroSubtitle:
      "Support operators need faster response times without breaking quality. This page ranks tools by implementation speed, handoff quality, and control depth.",
    heroMeta: ["Monthly maintained", "Support ops focus", "Affiliate-supported with disclosure"],
    whoFits: [
      "Support teams with high ticket volume and measurable SLA pressure",
      "Operators needing reliable triage, escalation paths, and QA controls",
      "Leaders balancing faster responses with consistent support quality",
    ],
    avoidIf: [
      "Knowledge base and escalation ownership are still unclear",
      "Support workflows change daily without stable process baselines",
    ],
    implementationPlan: [
      "Week 1: map top ticket intents and define escalation confidence thresholds",
      "Week 2: automate low-risk triage queues with mandatory human fallback",
      "Week 3: add response-quality review and reopen-rate monitoring",
      "Week 4: expand to adjacent queues only after SLA and quality targets stabilize",
    ],
    kpiScorecard: [
      "First response time by queue priority",
      "Resolution time and reopened-ticket rate",
      "Escalation accuracy for AI-assisted routing",
    ],
    comparisonQuestions: [
      {
        question: "Lindy vs Zapier AI: which is better for support-first teams?",
        answer:
          "Lindy is often stronger for agent-led inbox workflows, while Zapier AI is stronger for deterministic routing across multiple support systems.",
      },
      {
        question: "Zapier AI vs n8n: how should support ops choose?",
        answer:
          "Choose Zapier AI for managed speed and broad app coverage; choose n8n when compliance, self-hosting, and custom control are non-negotiable.",
      },
      {
        question: "Relevance AI vs Make: when does each support model win?",
        answer:
          "Relevance AI wins for role-based agent orchestration, while Make wins when teams prioritize visual branching and transparent workflow debugging.",
      },
    ],
    recommendations: [
      {
        slug: "lindy",
        score: 9.32,
        bestFor: "Inbox automation and practical SMB support handoffs",
        tradeoff: "Deep custom workflow logic may require pairing with automation builders",
        evidence:
          "Evidence basis: support inbox automation patterns, escalation handoff coverage, and setup path for small support teams.",
      },
      {
        slug: "zapier-ai",
        score: 9.1,
        bestFor: "Ticket routing and multi-app support automations",
        tradeoff: "Advanced conditional workflow depth is less technical than n8n",
        evidence:
          "Evidence basis: ticket-routing integrations, trigger reliability, and cross-app support workflow templates in public docs.",
      },
      {
        slug: "relevance-ai",
        score: 8.96,
        bestFor: "Multi-agent support orchestration for larger teams",
        tradeoff: "Setup can feel heavier for small support organizations",
        evidence:
          "Evidence basis: multi-agent response orchestration, team handoff controls, and deployment workflow complexity assessment.",
      },
      {
        slug: "n8n",
        score: 8.84,
        bestFor: "Self-hosted support workflows requiring strict control",
        tradeoff: "Infrastructure ownership increases ongoing maintenance",
        evidence:
          "Evidence basis: self-hosted deployment options, custom node flexibility, and reliability ownership requirements for support ops.",
      },
      {
        slug: "make",
        score: 8.72,
        bestFor: "Visual escalation and routing logic for support operations",
        tradeoff: "Scenario complexity can grow quickly without governance",
        evidence:
          "Evidence basis: escalation logic expressiveness, branch-level debugging tools, and support workflow observability capabilities.",
      },
    ],
    faqItems: [
      {
        question: "Which AI support tool is best for fast deployment?",
        answer:
          "Zapier AI and Lindy are often fastest for support teams that need immediate automation wins with low technical overhead.",
      },
      {
        question: "Should support teams prioritize AI agents or workflow builders?",
        answer:
          "Start with workflow builders for predictable routing, then add agents where response drafting or autonomous handling creates measurable value.",
      },
      {
        question: "What KPI should teams use to evaluate tool fit?",
        answer:
          "Track first response time, resolution time, and escalation accuracy during pilot periods before expanding automation scope.",
      },
      {
        question: "Are recommendations biased by monetization?",
        answer:
          "No. Ranking criteria and disclosure policy are separated and publicly documented for every commercial page.",
      },
    ],
    continueLinks: [
      { label: "See support automation use cases", href: "/use-cases/support-automation" },
      { label: "Read workflow templates", href: "/workflows" },
      { label: "Compare alternatives", href: "/compare" },
      { label: "Best AI Automation Tools for Ops Teams", href: "/best-ai-automation-tools" },
      { label: "Best AI Agents for Sales Teams", href: "/best-ai-agents-for-sales" },
      { label: "Best AI Tools for Marketing Teams", href: "/best-ai-tools-for-marketing" },
      { label: "Affiliate disclosure rules", href: "/affiliate-disclosure" },
    ],
    experiment: {
      variantB: {
        heroSubtitle:
          "Support-leader variant prioritizing response-time reduction and escalation quality. This sequence highlights predictable rollout under lean teams.",
        topPickOrder: ["zapier-ai", "lindy", "relevance-ai", "n8n", "make"],
        ctaPrimaryLabel: "Try this tool",
        ctaSecondaryLabel: "Support profile",
        tableCtaLabel: "Check offer",
      },
    },
  },
  {
    path: "/best-ai-tools-for-marketing",
    title: "Best AI Tools for Marketing Teams",
    metadataDescription:
      "Compare the best AI tools for marketing workflows including campaign automation, enrichment, and content operations.",
    heroSubtitle:
      "Marketing teams need AI stacks that move from ideation to execution without workflow breaks. This shortlist emphasizes deployment speed and measurable campaign ops impact.",
    heroMeta: ["Monthly maintained", "GTM + content focus", "Affiliate-supported with disclosure"],
    whoFits: [
      "Marketing ops teams running multi-channel campaigns on recurring cadence",
      "Teams needing faster campaign execution with measurable attribution quality",
      "Organizations combining enrichment, orchestration, and content operations",
    ],
    avoidIf: [
      "Campaign processes are not standardized and ownership is fragmented",
      "There is no KPI framework connecting automation to pipeline outcomes",
    ],
    implementationPlan: [
      "Week 1: baseline campaign cycle times and attribution data reliability",
      "Week 2: pilot one campaign workflow from trigger to reporting handoff",
      "Week 3: instrument spend, error rate, and conversion-quality checkpoints",
      "Week 4: templatize winning workflows and enforce launch governance",
    ],
    kpiScorecard: [
      "Campaign launch cycle time from brief to execution",
      "Attribution data completeness across core channels",
      "Cost per qualified engagement after automation rollout",
    ],
    comparisonQuestions: [
      {
        question: "Make vs Clay: which is better for growth marketing workflows?",
        answer:
          "Make is stronger for cross-channel orchestration and branching control, while Clay is stronger for enrichment-heavy personalization and outbound precision.",
      },
      {
        question: "Zapier AI vs Make: what should marketing ops evaluate first?",
        answer:
          "Benchmark setup speed and connector coverage against long-term scenario complexity and maintenance overhead.",
      },
      {
        question: "Clay vs n8n: when should teams switch from GTM tooling to custom stacks?",
        answer:
          "Use Clay when enrichment-led execution drives outcomes, and shift to n8n when infrastructure control and custom logic become strategic requirements.",
      },
    ],
    recommendations: [
      {
        slug: "make",
        score: 9.28,
        bestFor: "Visual campaign orchestration and attribution routing",
        tradeoff: "Complex scenario governance is required at scale",
        evidence:
          "Evidence basis: campaign automation templates, attribution workflow depth, and branch governance controls checked this month.",
      },
      {
        slug: "clay",
        score: 9.12,
        bestFor: "Enrichment-led growth workflows and outbound personalization",
        tradeoff: "Credit consumption should be monitored weekly to control costs",
        evidence:
          "Evidence basis: enrichment coverage breadth, personalization workflow support, and credit-consumption monitoring needs.",
      },
      {
        slug: "zapier-ai",
        score: 8.98,
        bestFor: "Fast launch for marketing automations across common SaaS tools",
        tradeoff: "Less customizable than technical automation frameworks",
        evidence:
          "Evidence basis: broad app connectors, low-friction campaign automation setup, and operator adoption speed indicators.",
      },
      {
        slug: "n8n",
        score: 8.76,
        bestFor: "Custom, cost-conscious marketing pipelines with full control",
        tradeoff: "Technical ownership requirements are higher than managed platforms",
        evidence:
          "Evidence basis: custom workflow extensibility, self-hosting cost leverage, and ongoing technical maintenance burden.",
      },
      {
        slug: "relevance-ai",
        score: 8.68,
        bestFor: "AI workforce workflows across campaign and ops functions",
        tradeoff: "Agent orchestration setup may exceed needs for small teams",
        evidence:
          "Evidence basis: workforce-style agent workflows, cross-functional campaign handoffs, and orchestration setup complexity.",
      },
    ],
    faqItems: [
      {
        question: "What is the best AI marketing automation platform in 2026?",
        answer:
          "For most teams, Make and Zapier AI are strong starting points because they balance speed, integrations, and operational clarity.",
      },
      {
        question: "How should marketing teams compare AI tool pricing?",
        answer:
          "Model expected workflow volume, enrichment usage, and seat requirements. Pricing pages alone rarely show real monthly cost.",
      },
      {
        question: "Which tools are best for content operations and campaign workflows?",
        answer:
          "Teams often combine Make for orchestration and specialized enrichment layers like Clay for signal quality and audience targeting.",
      },
      {
        question: "Does this list include affiliate relationships?",
        answer:
          "Yes, some links may include affiliate tracking, and disclosure is clearly shown in-line and on policy pages.",
      },
    ],
    continueLinks: [
      { label: "See content workflow use cases", href: "/use-cases/content-workflows" },
      { label: "Explore all tool profiles", href: "/tools" },
      { label: "Compare before purchase", href: "/compare" },
      { label: "Best AI Automation Tools for Ops Teams", href: "/best-ai-automation-tools" },
      { label: "Best AI Agents for Sales Teams", href: "/best-ai-agents-for-sales" },
      { label: "Best AI Tools for Customer Support", href: "/best-ai-tools-for-support" },
      { label: "Affiliate disclosure rules", href: "/affiliate-disclosure" },
    ],
    experiment: {
      variantB: {
        heroSubtitle:
          "Growth-ops variant for teams optimizing campaign velocity and attribution clarity. Ranking favors faster experimentation with controllable spend.",
        topPickOrder: ["clay", "make", "zapier-ai", "n8n", "relevance-ai"],
        ctaPrimaryLabel: "Launch trial",
        ctaSecondaryLabel: "Marketing fit",
        tableCtaLabel: "Open tool",
      },
    },
  },
];

export function getEditorialHubConfig(path: string): EditorialHubConfig | null {
  return editorialHubs.find((hub) => hub.path === path) ?? null;
}

export function getEditorialHubConfigOrThrow(path: string): EditorialHubConfig {
  const hub = getEditorialHubConfig(path);
  if (!hub) {
    throw new Error(`Missing editorial hub config: ${path}`);
  }

  return hub;
}

export function getEditorialHubPaths(): string[] {
  return editorialHubs.map((hub) => hub.path);
}

export function parseEditorialHubVariant(input?: string | null): EditorialHubVariant {
  if (input && input.trim().toUpperCase() === "B") {
    return "B";
  }
  return "A";
}

function applyRecommendationOrder(
  tools: EditorialHubRankedTool[],
  orderedSlugs: string[],
): EditorialHubRankedTool[] {
  if (orderedSlugs.length === 0) {
    return tools;
  }

  const indexBySlug = new Map(orderedSlugs.map((slug, index) => [slug, index]));
  return tools.slice().sort((a, b) => {
    const aIndex = indexBySlug.get(a.slug);
    const bIndex = indexBySlug.get(b.slug);
    if (aIndex !== undefined && bIndex !== undefined) {
      return aIndex - bIndex;
    }
    if (aIndex !== undefined) {
      return -1;
    }
    if (bIndex !== undefined) {
      return 1;
    }
    return 0;
  });
}

export function buildEditorialHubRankedTools(
  config: EditorialHubConfig,
  options?: {
    variant?: EditorialHubVariant;
    topPickOrder?: string[];
  },
): EditorialHubRankedTool[] {
  const variant = options?.variant || "A";
  const fallbackMap = new Map(getFallbackToolProfiles().map((tool) => [tool.slug, tool]));

  const ranked = config.recommendations
    .map((recommendation) => {
      const tool = fallbackMap.get(recommendation.slug);
      if (!tool) {
        return null;
      }

      return {
        slug: tool.slug,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        categories: tool.categories,
        setupLabel: tool.setupLabel,
        pricingLabel: tool.pricingLabel,
        score: recommendation.score,
        bestFor: recommendation.bestFor,
        tradeoff: recommendation.tradeoff,
        evidence: recommendation.evidence,
        outboundHref: buildOutboundHref({
          toolSlug: tool.slug,
          targetUrl: tool.websiteUrl,
          linkKind: LinkKind.DIRECT,
          sourcePath: config.path,
          experimentVariant: variant,
          placementId: "editorial_hub_recommendation",
        }),
      };
    })
    .filter((tool): tool is EditorialHubRankedTool => Boolean(tool));

  return applyRecommendationOrder(ranked, options?.topPickOrder || []);
}

export function buildEditorialHubExperimentView(input: {
  config: EditorialHubConfig;
  variant: EditorialHubVariant;
}): EditorialHubExperimentView {
  const variantB = input.config.experiment?.variantB;
  const isVariantB = input.variant === "B" && Boolean(variantB);
  const rankedTools = buildEditorialHubRankedTools(input.config, {
    variant: input.variant,
    topPickOrder: isVariantB ? variantB?.topPickOrder || [] : [],
  });

  return {
    variant: input.variant,
    heroSubtitle: isVariantB ? variantB?.heroSubtitle || input.config.heroSubtitle : input.config.heroSubtitle,
    rankedTools,
    primaryTools: rankedTools.slice(0, 3),
    ctaPrimaryLabel: isVariantB ? variantB?.ctaPrimaryLabel || "Visit" : "Visit",
    ctaSecondaryLabel: isVariantB ? variantB?.ctaSecondaryLabel || "Read profile" : "Read profile",
    tableCtaLabel: isVariantB ? variantB?.tableCtaLabel || "Visit" : "Visit",
  };
}
