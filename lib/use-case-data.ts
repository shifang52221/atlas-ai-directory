import { LinkKind } from "@prisma/client";
import { getDb } from "./db";
import {
  buildOutboundHref,
  getFallbackToolProfiles,
} from "./tool-profile-data";

export type UseCaseToolCard = {
  name: string;
  slug: string;
  tag: string;
  blurb: string;
  profileHref: string;
  outboundHref: string;
};

export type UseCaseFaqItem = {
  question: string;
  answer: string;
};

export type UseCaseProfile = {
  slug: string;
  name: string;
  description: string;
  summary: string;
  fitSignals: string[];
  avoidSignals: string[];
  kpis: string[];
  rolloutPlan: string[];
  checklist: string[];
  faqItems: UseCaseFaqItem[];
  tools: UseCaseToolCard[];
  relatedUseCases: Array<{ name: string; href: string }>;
};

type FallbackUseCaseSeed = Omit<UseCaseProfile, "tools"> & {
  tools: string[];
};

const fallbackUseCasesSeed: FallbackUseCaseSeed[] = [
  {
    slug: "ai-sales",
    name: "AI Sales",
    description:
      "Find AI tools for prospecting, enrichment, outreach, and pipeline acceleration across modern revenue teams.",
    summary:
      "Best when teams need higher outbound velocity with better targeting quality and faster rep handoff.",
    fitSignals: [
      "You run weekly outbound campaigns and need tighter enrichment-to-sequencing handoffs",
      "RevOps owns automation quality and can enforce CRM field hygiene",
      "Sales leadership measures reply rate and meeting quality by segment",
    ],
    avoidSignals: [
      "Outbound volume is low and manual prospecting is still manageable",
      "Your CRM data model is unstable and ownership is unclear",
    ],
    kpis: [
      "Positive reply rate by ICP segment",
      "Meeting-booked rate from first-touch sequences",
      "Lead-to-opportunity conversion within 30 days",
    ],
    rolloutPlan: [
      "Week 1: map ICP segments and required enrichment fields",
      "Week 2: pilot two outbound sequences with strict QA review",
      "Week 3: add routing automation and failure alerts in CRM",
      "Week 4: scale winning sequence templates and freeze naming conventions",
    ],
    checklist: [
      "Validate enrichment coverage by target segment",
      "Compare outbound workflow depth and guardrails",
      "Check CRM sync quality before full rollout",
    ],
    faqItems: [
      {
        question: "What is the fastest way to validate AI sales workflow quality?",
        answer:
          "Run a 2-week pilot with one ICP and compare reply quality, meeting-booked rate, and CRM data completeness before broad rollout.",
      },
      {
        question: "Which metric matters more first: volume or conversion?",
        answer:
          "Start with conversion quality. Higher volume without reply quality often amplifies list fatigue and harms domain health.",
      },
      {
        question: "How many tools should a sales ops pilot include?",
        answer:
          "Keep it to 2-3 tools at first: enrichment, orchestration, and CRM sync. More tools early usually slows diagnosis.",
      },
      {
        question: "How should teams control cost during AI sales pilots?",
        answer:
          "Set weekly spend caps, audit credit consumption by workflow, and pause low-performing segments quickly.",
      },
    ],
    tools: ["clay", "zapier-ai", "relevance-ai"],
    relatedUseCases: [
      { name: "Lead Enrichment", href: "/use-cases/lead-enrichment" },
      { name: "Internal Ops", href: "/use-cases/internal-ops" },
    ],
  },
  {
    slug: "support-automation",
    name: "Support Automation",
    description:
      "Explore tools that reduce response time, triage tickets, and automate repetitive support workflows.",
    summary:
      "Useful for teams aiming to improve SLA performance while keeping support quality consistent.",
    fitSignals: [
      "Ticket volume is high enough that manual triage creates SLA risk",
      "Support leads can define escalation policies and exception routes",
      "You already track first response and resolution quality by queue",
    ],
    avoidSignals: [
      "Knowledge base coverage is weak and macros are inconsistent",
      "Escalation ownership is unclear across support and product teams",
    ],
    kpis: [
      "First response time (FRT) by priority queue",
      "Resolution time with and without escalation",
      "Escalation accuracy and reopened-ticket rate",
    ],
    rolloutPlan: [
      "Week 1: audit top 30 ticket intents and build routing taxonomy",
      "Week 2: deploy triage automation on low-risk queues",
      "Week 3: enable draft-response support with human approval gates",
      "Week 4: expand coverage and monitor escalation drift daily",
    ],
    checklist: [
      "Evaluate ticket triage quality on real conversations",
      "Check escalation and human-handoff controls",
      "Verify integration depth with helpdesk systems",
    ],
    faqItems: [
      {
        question: "What support workflow should be automated first?",
        answer:
          "Start with repetitive low-risk intents like status checks and account updates, then expand after SLA and QA metrics stabilize.",
      },
      {
        question: "How can support teams avoid poor AI responses?",
        answer:
          "Use intent-based routing, confidence thresholds, and mandatory human review for high-impact ticket categories.",
      },
      {
        question: "How long should a support automation pilot run?",
        answer:
          "A 3-4 week pilot is usually enough to compare FRT, escalation quality, and customer sentiment outcomes.",
      },
      {
        question: "What is the key risk during rollout?",
        answer:
          "Unclear escalation policies. If handoff rules are weak, automation can increase reopen rates and customer frustration.",
      },
    ],
    tools: ["lindy", "zapier-ai", "relevance-ai"],
    relatedUseCases: [
      { name: "Research Agents", href: "/use-cases/research-agents" },
      { name: "Internal Ops", href: "/use-cases/internal-ops" },
    ],
  },
  {
    slug: "lead-enrichment",
    name: "Lead Enrichment",
    description:
      "Compare enrichment-first stacks that append firmographic and contact data before outbound execution.",
    summary:
      "Strong fit for GTM teams prioritizing data accuracy, segmentation depth, and fast targeting cycles.",
    fitSignals: [
      "Your outbound team depends on firmographic precision by ICP tier",
      "Lead scoring and routing depend on fresh enrichment fields",
      "You need repeatable enrichment pipelines before campaign launch",
    ],
    avoidSignals: [
      "Your target segments are too broad to benefit from deeper enrichment",
      "No owner is accountable for field mapping and data QA",
    ],
    kpis: [
      "Verified contact match rate by source",
      "Enrichment completion rate for required fields",
      "Downstream meeting conversion after enriched targeting",
    ],
    rolloutPlan: [
      "Week 1: define required enrichment schema and fallback rules",
      "Week 2: benchmark providers on a fixed sample list",
      "Week 3: automate enrichment + dedupe before sequence entry",
      "Week 4: monitor match-rate drift and refine provider mix",
    ],
    checklist: [
      "Measure data freshness and match rate",
      "Compare provider coverage by region and ICP",
      "Validate outbound triggers from enriched fields",
    ],
    faqItems: [
      {
        question: "Which enrichment benchmark matters most first?",
        answer:
          "Start with match rate on your real ICP list, then compare data freshness and confidence consistency.",
      },
      {
        question: "Should teams enrich every lead automatically?",
        answer:
          "Usually no. Prioritize high-intent segments first and gate enrichment spend with qualification rules.",
      },
      {
        question: "How often should enrichment workflows be audited?",
        answer:
          "At least weekly for active outbound motions to catch provider drift and schema breaks early.",
      },
      {
        question: "What causes enrichment projects to fail most often?",
        answer:
          "Unclear field ownership and missing fallback logic when provider coverage is inconsistent by region.",
      },
    ],
    tools: ["clay", "make", "n8n"],
    relatedUseCases: [
      { name: "AI Sales", href: "/use-cases/ai-sales" },
      { name: "Content Workflows", href: "/use-cases/content-workflows" },
    ],
  },
  {
    slug: "content-workflows",
    name: "Content Workflows",
    description:
      "Find automation and agent tools that speed up drafting, distribution, repurposing, and editorial operations.",
    summary:
      "Best for lean teams that need repeatable publishing systems without heavy custom engineering.",
    fitSignals: [
      "Publishing cadence is high and manual handoffs create delays",
      "The team distributes across multiple channels with repeated formatting work",
      "Editors can define quality gates before publish",
    ],
    avoidSignals: [
      "Content strategy is still unstable and workflows change daily",
      "No clear quality owner for pre-publish review",
    ],
    kpis: [
      "Draft-to-publish cycle time",
      "Editor revision minutes per asset",
      "On-time publishing rate by channel",
    ],
    rolloutPlan: [
      "Week 1: map current content pipeline and bottlenecks",
      "Week 2: automate repurposing for 1-2 channels only",
      "Week 3: add editorial QA checkpoints and approval routing",
      "Week 4: scale templates and enforce naming/metadata standards",
    ],
    checklist: [
      "Benchmark output quality and edit effort",
      "Compare workflow orchestration across channels",
      "Check governance and approval controls",
    ],
    faqItems: [
      {
        question: "What should content teams automate first?",
        answer:
          "Start with repetitive repurposing and distribution steps, not core brand messaging decisions.",
      },
      {
        question: "How do you keep AI-assisted content quality high?",
        answer:
          "Use strict editorial checklists, required human approval, and channel-specific style constraints.",
      },
      {
        question: "How long before productivity gains are visible?",
        answer:
          "Most teams see measurable cycle-time gains within 2-4 weeks when workflow scope is focused.",
      },
      {
        question: "What common mistake hurts rollout speed?",
        answer:
          "Automating too many channels at once. Start narrow, prove quality, then expand.",
      },
    ],
    tools: ["make", "n8n", "zapier-ai"],
    relatedUseCases: [
      { name: "Internal Ops", href: "/use-cases/internal-ops" },
      { name: "Support Automation", href: "/use-cases/support-automation" },
    ],
  },
  {
    slug: "internal-ops",
    name: "Internal Ops",
    description:
      "Curated stack options for finance, HR, onboarding, and recurring back-office operations automation.",
    summary:
      "Ideal for organizations focused on reducing manual work and improving cross-system process reliability.",
    fitSignals: [
      "Back-office tasks repeat weekly and consume specialist time",
      "Process failures are hard to trace across systems",
      "Ops leaders can enforce standard operating procedures",
    ],
    avoidSignals: [
      "Core process definitions are not yet standardized",
      "Data access and approval permissions are unresolved",
    ],
    kpis: [
      "Manual hours saved per recurring process",
      "Process completion SLA adherence",
      "Failure/retry rate across automated steps",
    ],
    rolloutPlan: [
      "Week 1: select two high-volume workflows and baseline manual effort",
      "Week 2: automate deterministic steps with rollback safeguards",
      "Week 3: add alerting, audit trail, and ownership mapping",
      "Week 4: expand to adjacent workflows with shared controls",
    ],
    checklist: [
      "Score setup friction across non-technical teams",
      "Assess auditability and process visibility",
      "Model cost at expected task volume",
    ],
    faqItems: [
      {
        question: "Which internal ops workflow should be automated first?",
        answer:
          "Choose predictable high-volume workflows like onboarding notifications or approval routing before complex exceptions.",
      },
      {
        question: "How do teams reduce automation failure risk?",
        answer:
          "Use idempotent steps, explicit retries, and clear fallback playbooks for every critical workflow.",
      },
      {
        question: "How should ROI be measured for internal automation?",
        answer:
          "Track hours saved, SLA improvement, and reduction in process exceptions over a fixed monthly window.",
      },
      {
        question: "What governance control is most important?",
        answer:
          "An auditable owner per workflow. Without ownership, errors persist and optimization stalls.",
      },
    ],
    tools: ["zapier-ai", "make", "n8n"],
    relatedUseCases: [
      { name: "Support Automation", href: "/use-cases/support-automation" },
      { name: "AI Sales", href: "/use-cases/ai-sales" },
    ],
  },
  {
    slug: "research-agents",
    name: "Research Agents",
    description:
      "Compare agent tools designed for market research, synthesis, monitoring, and decision support workflows.",
    summary:
      "Helpful for teams that need repeatable intelligence generation with faster time-to-insight.",
    fitSignals: [
      "Analyst teams spend significant time on repetitive source review",
      "Decision stakeholders need consistent weekly intelligence briefs",
      "You can define acceptable source quality and citation standards",
    ],
    avoidSignals: [
      "Research questions are too ad-hoc for repeatable workflows",
      "No clear review owner validates model-generated conclusions",
    ],
    kpis: [
      "Time-to-insight from request to decision-ready brief",
      "Citation coverage per insight block",
      "Analyst rework rate on AI-generated outputs",
    ],
    rolloutPlan: [
      "Week 1: define source tiers and citation requirements",
      "Week 2: pilot one repeatable research brief template",
      "Week 3: add QA review checkpoints and escalation paths",
      "Week 4: automate monitoring cadence and stakeholder delivery",
    ],
    checklist: [
      "Measure relevance and citation reliability",
      "Check retrieval depth across sources",
      "Validate review and escalation workflows",
    ],
    faqItems: [
      {
        question: "What is the best first use case for research agents?",
        answer:
          "Start with recurring competitive monitoring where source scope and output format are predictable.",
      },
      {
        question: "How can teams trust AI-generated research summaries?",
        answer:
          "Require citations per key claim and enforce human validation for high-impact recommendations.",
      },
      {
        question: "How often should prompt and retrieval settings be tuned?",
        answer:
          "Review weekly during rollout, then biweekly once citation quality and relevance stabilize.",
      },
      {
        question: "What is the common failure mode in research-agent rollouts?",
        answer:
          "Teams optimize for speed only and under-invest in citation QA, which hurts stakeholder trust.",
      },
    ],
    tools: ["lindy", "relevance-ai", "n8n"],
    relatedUseCases: [
      { name: "Support Automation", href: "/use-cases/support-automation" },
      { name: "Content Workflows", href: "/use-cases/content-workflows" },
    ],
  },
];

const fallbackToolsBySlug = new Map(
  getFallbackToolProfiles().map((tool) => [tool.slug, tool]),
);

function toToolCard(toolSlug: string, useCaseSlug: string): UseCaseToolCard | null {
  const tool = fallbackToolsBySlug.get(toolSlug);
  if (!tool) {
    return null;
  }

  return {
    name: tool.name,
    slug: tool.slug,
    tag: tool.tagline,
    blurb: tool.description,
    profileHref: `/tools/${tool.slug}`,
    outboundHref: buildOutboundHref({
      toolSlug: tool.slug,
      targetUrl: tool.websiteUrl,
      linkKind: LinkKind.DIRECT,
      sourcePath: `/use-cases/${useCaseSlug}`,
      placementId: "use_case_recommendation",
    }),
  };
}

function mapFallbackUseCase(seed: FallbackUseCaseSeed): UseCaseProfile {
  return {
    ...seed,
    tools: seed.tools
      .map((toolSlug) => toToolCard(toolSlug, seed.slug))
      .filter((tool): tool is UseCaseToolCard => Boolean(tool)),
  };
}

const fallbackUseCases = fallbackUseCasesSeed.map(mapFallbackUseCase);
const fallbackUseCaseMap = new Map(
  fallbackUseCases.map((item) => [item.slug, item]),
);

export function getFallbackUseCaseSlugs(): string[] {
  return fallbackUseCases.map((item) => item.slug);
}

export async function getUseCaseProfileBySlug(
  slug: string,
): Promise<UseCaseProfile | null> {
  try {
    const db = getDb();
    const category = await db.category.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        description: true,
        _count: {
          select: { tools: true },
        },
        tools: {
          orderBy: {
            tool: {
              updatedAt: "desc",
            },
          },
          take: 12,
          select: {
            tool: {
              select: {
                id: true,
                slug: true,
                name: true,
                tagline: true,
                description: true,
                websiteUrl: true,
                affiliateLinks: {
                  orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
                  take: 1,
                  select: {
                    id: true,
                    linkKind: true,
                    trackingUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return fallbackUseCaseMap.get(slug) ?? null;
    }

    const tools: UseCaseToolCard[] = category.tools.map(({ tool }) => {
      const primaryLink = tool.affiliateLinks[0];
      const linkKind = primaryLink?.linkKind ?? LinkKind.DIRECT;

      return {
        name: tool.name,
        slug: tool.slug,
        tag: tool.tagline || "AI Tool",
        blurb:
          tool.description?.slice(0, 180) ||
          "Profile details are being expanded with richer benchmark data.",
        profileHref: `/tools/${tool.slug}`,
        outboundHref: buildOutboundHref({
          toolSlug: tool.slug,
          targetUrl: primaryLink?.trackingUrl ?? tool.websiteUrl,
          linkKind,
          sourcePath: `/use-cases/${category.slug}`,
          affiliateLinkId: primaryLink?.id,
          placementId: "use_case_recommendation",
        }),
      };
    });

    const fallbackMatch = fallbackUseCaseMap.get(slug);

    return {
      slug: category.slug,
      name: category.name,
      description:
        category.description ||
        fallbackMatch?.description ||
        `Curated tools and benchmarks for ${category.name}.`,
      summary:
        fallbackMatch?.summary ||
        `Explore ${category._count.tools} tools mapped to this use case and shortlist by setup friction, pricing, and workflow fit.`,
      fitSignals: fallbackMatch?.fitSignals || [
        "You have repeated workflows with measurable operational outcomes",
        "A clear owner can enforce rollout standards across teams",
        "Current manual process causes avoidable delays or errors",
      ],
      avoidSignals: fallbackMatch?.avoidSignals || [
        "Process ownership is unclear between teams",
        "Workflow definitions are changing daily without baseline metrics",
      ],
      kpis: fallbackMatch?.kpis || [
        "Cycle time reduction for the target workflow",
        "Error or escalation rate across automated steps",
        "Adoption rate by the target operator team",
      ],
      rolloutPlan: fallbackMatch?.rolloutPlan || [
        "Week 1: baseline workflow performance and define ownership",
        "Week 2: pilot one workflow path with explicit QA gates",
        "Week 3: add monitoring and retry/fallback handling",
        "Week 4: scale to adjacent workflows with the same controls",
      ],
      checklist: fallbackMatch?.checklist || [
        "Compare setup speed and implementation overhead",
        "Validate pricing fit at your expected usage level",
        "Score integration depth against your core stack",
      ],
      faqItems: fallbackMatch?.faqItems || [
        {
          question: `Who should prioritize ${category.name}?`,
          answer:
            "Teams with repeatable operator workflows and clear ownership usually benefit first.",
        },
        {
          question: `How should teams pilot ${category.name} workflows?`,
          answer:
            "Run a scoped 2-4 week pilot with clear KPI baselines, then scale only after quality and reliability are proven.",
        },
        {
          question: "What is the most common rollout risk?",
          answer:
            "Skipping governance and QA checkpoints. Speed without controls usually increases rework.",
        },
        {
          question: "How should success be measured after launch?",
          answer:
            "Track cycle-time, quality, and reliability metrics together to avoid optimizing one metric at the expense of outcomes.",
        },
      ],
      tools: tools.length > 0 ? tools : fallbackMatch?.tools || [],
      relatedUseCases:
        fallbackMatch?.relatedUseCases || [
          { name: "Tools", href: "/tools" },
          { name: "Compare", href: "/compare" },
        ],
    };
  } catch {
    return fallbackUseCaseMap.get(slug) ?? null;
  }
}
