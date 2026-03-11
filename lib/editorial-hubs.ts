import { LinkKind } from "@prisma/client";
import { buildOutboundHref, getFallbackToolProfiles } from "./tool-profile-data";

type HubRecommendation = {
  slug: string;
  score: number;
  bestFor: string;
  tradeoff: string;
};

type HubFaqItem = {
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
    recommendations: [
      {
        slug: "zapier-ai",
        score: 9.4,
        bestFor: "Fast cross-app launch with low ops overhead",
        tradeoff: "Advanced logic depth is more limited than n8n or Make",
      },
      {
        slug: "make",
        score: 9.2,
        bestFor: "Visual multi-step orchestration and branching control",
        tradeoff: "Scenario design can be heavy for simple one-step automations",
      },
      {
        slug: "n8n",
        score: 9.0,
        bestFor: "Technical teams requiring open-source flexibility",
        tradeoff: "Self-hosting and maintenance need stronger technical ownership",
      },
      {
        slug: "relevance-ai",
        score: 8.8,
        bestFor: "Role-based AI workforce deployment at team level",
        tradeoff: "Agent orchestration setup can be overkill for small teams",
      },
      {
        slug: "lindy",
        score: 8.7,
        bestFor: "SMB operators automating inbox and support handoffs",
        tradeoff: "Complex multi-system logic can require supplemental tooling",
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
    recommendations: [
      {
        slug: "clay",
        score: 9.35,
        bestFor: "Signal-based enrichment and outbound execution",
        tradeoff: "Credit-based pricing can scale quickly with high volume",
      },
      {
        slug: "relevance-ai",
        score: 9.18,
        bestFor: "Role-based multi-agent workflows for SDR and RevOps",
        tradeoff: "Initial orchestration setup is heavier than template-first tools",
      },
      {
        slug: "zapier-ai",
        score: 8.98,
        bestFor: "Fast lead-routing automations across CRM and support tools",
        tradeoff: "Less flexible than engineering-centric automation stacks",
      },
      {
        slug: "make",
        score: 8.9,
        bestFor: "Visual pipeline automations and attribution branching",
        tradeoff: "Complex scenarios can become hard to maintain without guardrails",
      },
      {
        slug: "lindy",
        score: 8.72,
        bestFor: "SMB sales teams automating email follow-up loops",
        tradeoff: "Advanced enrichment depth is narrower than dedicated GTM tools",
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
    recommendations: [
      {
        slug: "lindy",
        score: 9.32,
        bestFor: "Inbox automation and practical SMB support handoffs",
        tradeoff: "Deep custom workflow logic may require pairing with automation builders",
      },
      {
        slug: "zapier-ai",
        score: 9.1,
        bestFor: "Ticket routing and multi-app support automations",
        tradeoff: "Advanced conditional workflow depth is less technical than n8n",
      },
      {
        slug: "relevance-ai",
        score: 8.96,
        bestFor: "Multi-agent support orchestration for larger teams",
        tradeoff: "Setup can feel heavier for small support organizations",
      },
      {
        slug: "n8n",
        score: 8.84,
        bestFor: "Self-hosted support workflows requiring strict control",
        tradeoff: "Infrastructure ownership increases ongoing maintenance",
      },
      {
        slug: "make",
        score: 8.72,
        bestFor: "Visual escalation and routing logic for support operations",
        tradeoff: "Scenario complexity can grow quickly without governance",
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
    recommendations: [
      {
        slug: "make",
        score: 9.28,
        bestFor: "Visual campaign orchestration and attribution routing",
        tradeoff: "Complex scenario governance is required at scale",
      },
      {
        slug: "clay",
        score: 9.12,
        bestFor: "Enrichment-led growth workflows and outbound personalization",
        tradeoff: "Credit consumption should be monitored weekly to control costs",
      },
      {
        slug: "zapier-ai",
        score: 8.98,
        bestFor: "Fast launch for marketing automations across common SaaS tools",
        tradeoff: "Less customizable than technical automation frameworks",
      },
      {
        slug: "n8n",
        score: 8.76,
        bestFor: "Custom, cost-conscious marketing pipelines with full control",
        tradeoff: "Technical ownership requirements are higher than managed platforms",
      },
      {
        slug: "relevance-ai",
        score: 8.68,
        bestFor: "AI workforce workflows across campaign and ops functions",
        tradeoff: "Agent orchestration setup may exceed needs for small teams",
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
        outboundHref: buildOutboundHref({
          toolSlug: tool.slug,
          targetUrl: tool.websiteUrl,
          linkKind: LinkKind.DIRECT,
          sourcePath: config.path,
          experimentVariant: variant,
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
