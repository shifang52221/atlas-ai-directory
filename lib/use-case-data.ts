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

export type UseCaseProfile = {
  slug: string;
  name: string;
  description: string;
  summary: string;
  checklist: string[];
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
    checklist: [
      "Validate enrichment coverage by target segment",
      "Compare outbound workflow depth and guardrails",
      "Check CRM sync quality before full rollout",
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
    checklist: [
      "Evaluate ticket triage quality on real conversations",
      "Check escalation and human-handoff controls",
      "Verify integration depth with helpdesk systems",
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
    checklist: [
      "Measure data freshness and match rate",
      "Compare provider coverage by region and ICP",
      "Validate outbound triggers from enriched fields",
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
    checklist: [
      "Benchmark output quality and edit effort",
      "Compare workflow orchestration across channels",
      "Check governance and approval controls",
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
    checklist: [
      "Score setup friction across non-technical teams",
      "Assess auditability and process visibility",
      "Model cost at expected task volume",
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
    checklist: [
      "Measure relevance and citation reliability",
      "Check retrieval depth across sources",
      "Validate review and escalation workflows",
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
      checklist: fallbackMatch?.checklist || [
        "Compare setup speed and implementation overhead",
        "Validate pricing fit at your expected usage level",
        "Score integration depth against your core stack",
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
