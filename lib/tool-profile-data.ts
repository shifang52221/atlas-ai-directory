import { LinkKind } from "@prisma/client";
import { getDb } from "./db";
import { withAffiliateTracking } from "./monetization-config";
import { buildOutboundSignature } from "./outbound-signature";

export type ToolProfile = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  categories: string[];
  highlights: string[];
  comparisonNotes: string[];
  setupLabel: string;
  pricingLabel: string;
  updatedAt: string;
  outboundHref: string;
  outboundDisclosure: string;
};

type BuildOutboundHrefInput = {
  toolSlug: string;
  targetUrl: string;
  linkKind: LinkKind;
  sourcePath: string;
  affiliateLinkId?: string;
  experimentVariant?: "A" | "B";
};

type FallbackToolProfileSeed = Omit<
  ToolProfile,
  "outboundHref" | "outboundDisclosure"
> & {
  linkKind?: LinkKind;
};

const fallbackProfilesSeed: FallbackToolProfileSeed[] = [
  {
    slug: "zapier-ai",
    name: "Zapier AI",
    tagline: "Workflow Automation",
    description:
      "Best for multi-app automations with low setup friction and dependable operational handoffs.",
    websiteUrl: "https://zapier.com",
    categories: ["Automation", "No-Code", "Sales Ops"],
    highlights: [
      "Fast trigger-action setup for non-technical teams",
      "Strong integration catalog across CRM and support stacks",
      "Reliable for recurring internal operations workflows",
    ],
    comparisonNotes: [
      "Best when you need broad app support quickly",
      "Compare against Make for visual routing complexity",
      "Compare against n8n for self-hosting control",
    ],
    setupLabel: "~45 min to first workflow",
    pricingLabel: "Starter plans from ~$20/mo",
    updatedAt: "2026-02-18",
    linkKind: LinkKind.DIRECT,
  },
  {
    slug: "make",
    name: "Make",
    tagline: "Visual Builder",
    description:
      "Powerful visual scenario builder for teams that need complex routing, branches, and data transforms.",
    websiteUrl: "https://www.make.com",
    categories: ["Automation", "No-Code", "Marketing"],
    highlights: [
      "Advanced scenario logic and branching",
      "Good fit for GTM ops and marketing automation",
      "Useful when workflow transparency is required",
    ],
    comparisonNotes: [
      "Best for visual process control",
      "Can require more setup than Zapier for simple automations",
      "Great middle ground before fully custom systems",
    ],
    setupLabel: "~60 min to first production scenario",
    pricingLabel: "Entry plans from ~$9/mo",
    updatedAt: "2026-02-12",
    linkKind: LinkKind.DIRECT,
  },
  {
    slug: "lindy",
    name: "Lindy",
    tagline: "AI Agent",
    description:
      "Operator-style AI agents for inbox workflows, internal handoffs, and practical SMB automation tasks.",
    websiteUrl: "https://www.lindy.ai",
    categories: ["AI Agents", "Customer Support"],
    highlights: [
      "Agent-first experience built for operators",
      "Useful for support and communication workflows",
      "Strong practical templates for quick launch",
    ],
    comparisonNotes: [
      "Good when your team wants autonomous assistant behavior",
      "Evaluate model quality and control depth per workflow",
      "Compare with Relevance AI for broader workforce orchestration",
    ],
    setupLabel: "~40 min to first usable agent",
    pricingLabel: "Public pricing varies by usage",
    updatedAt: "2026-02-22",
    linkKind: LinkKind.DIRECT,
  },
  {
    slug: "relevance-ai",
    name: "Relevance AI",
    tagline: "AI Workforce",
    description:
      "Build and deploy role-based AI agents with reusable templates for sales, support, and internal teams.",
    websiteUrl: "https://relevanceai.com",
    categories: ["AI Agents", "Automation", "Sales Ops"],
    highlights: [
      "Role-based AI workforce framing",
      "Template library for rapid deployment",
      "Useful for cross-team operational workflows",
    ],
    comparisonNotes: [
      "Strong option for multi-agent operational setups",
      "Compare with Lindy for SMB simplicity",
      "Compare with custom stack for strict control requirements",
    ],
    setupLabel: "~70 min to first team-ready workflow",
    pricingLabel: "Plans vary by seats and usage",
    updatedAt: "2026-02-10",
    linkKind: LinkKind.DIRECT,
  },
  {
    slug: "n8n",
    name: "n8n",
    tagline: "Open Source",
    description:
      "Flexible automation engine with strong self-hosting options and developer-friendly extensibility.",
    websiteUrl: "https://n8n.io",
    categories: ["Automation", "No-Code"],
    highlights: [
      "Open-source and self-hosting friendly",
      "Good for teams needing infrastructure control",
      "Extensible with custom logic and community nodes",
    ],
    comparisonNotes: [
      "Best for technical teams prioritizing ownership",
      "Compare with Zapier/Make for managed convenience",
      "Great fit for cost-sensitive scaling",
    ],
    setupLabel: "~75 min for hosted, ~120 min for self-hosted",
    pricingLabel: "Cloud starts low; self-hosting can reduce spend",
    updatedAt: "2026-03-06",
    linkKind: LinkKind.DIRECT,
  },
  {
    slug: "clay",
    name: "Clay",
    tagline: "Go-To-Market",
    description:
      "Data enrichment and outbound workflow layer for modern GTM teams working across multiple data sources.",
    websiteUrl: "https://www.clay.com",
    categories: ["Sales Ops", "Marketing"],
    highlights: [
      "Strong enrichment and outbound support",
      "Good for signal-based prospect workflows",
      "Useful for SDR and revops alignment",
    ],
    comparisonNotes: [
      "Best for growth and outbound execution teams",
      "Compare with broader automation tools for non-GTM use cases",
      "Pricing can scale with high enrichment volume",
    ],
    setupLabel: "~50 min to first outbound flow",
    pricingLabel: "Starter plans vary by credits and team size",
    updatedAt: "2026-02-01",
    linkKind: LinkKind.DIRECT,
  },
];

function getOutboundDisclosure(linkKind: LinkKind): string {
  if (linkKind === LinkKind.AFFILIATE || linkKind === LinkKind.SPONSORED) {
    return "This outbound link may include affiliate tracking. Sponsored placements are clearly labeled.";
  }

  return "This is a direct outbound link. No sponsored boost is applied on this profile.";
}

export function buildOutboundHref({
  toolSlug,
  targetUrl,
  linkKind,
  sourcePath,
  affiliateLinkId,
  experimentVariant,
}: BuildOutboundHrefInput): string {
  const trackedTarget = withAffiliateTracking(targetUrl);
  const params = new URLSearchParams({
    toolSlug,
    target: trackedTarget,
    linkKind,
    sourcePath,
  });

  if (affiliateLinkId) {
    params.set("affiliateLinkId", affiliateLinkId);
  }
  if (experimentVariant) {
    params.set("variant", experimentVariant);
  }

  const signature = buildOutboundSignature({
    toolSlug,
    target: trackedTarget,
    linkKind,
    sourcePath,
    affiliateLinkId,
  });
  if (signature) {
    params.set("sig", signature);
  }

  return `/api/outbound?${params.toString()}`;
}

function mapFallbackProfile(seed: FallbackToolProfileSeed): ToolProfile {
  const linkKind = seed.linkKind ?? LinkKind.DIRECT;

  return {
    ...seed,
    outboundHref: buildOutboundHref({
      toolSlug: seed.slug,
      targetUrl: seed.websiteUrl,
      linkKind,
      sourcePath: `/tools/${seed.slug}`,
    }),
    outboundDisclosure: getOutboundDisclosure(linkKind),
  };
}

const fallbackProfiles: ToolProfile[] = fallbackProfilesSeed.map(mapFallbackProfile);

export function getFallbackToolProfiles(): ToolProfile[] {
  return fallbackProfiles;
}

export async function getToolProfileBySlug(
  slug: string,
): Promise<ToolProfile | null> {
  try {
    const db = getDb();
    const tool = await db.tool.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        tagline: true,
        description: true,
        websiteUrl: true,
        setupMinutes: true,
        pricingFrom: true,
        currency: true,
        updatedAt: true,
        status: true,
        categories: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
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
    });

    if (!tool || tool.status !== "ACTIVE") {
      return (
        fallbackProfiles.find((item) => item.slug === slug) ??
        null
      );
    }

    const primaryLink = tool.affiliateLinks[0];
    const linkKind = primaryLink?.linkKind ?? LinkKind.DIRECT;
    const targetUrl = primaryLink?.trackingUrl ?? tool.websiteUrl;
    const categoryNames = tool.categories.map((item) => item.category.name);

    const setupLabel = tool.setupMinutes
      ? `~${tool.setupMinutes} min to first setup`
      : "Setup time depends on workflow complexity";
    const pricingLabel = tool.pricingFrom
      ? `From ${tool.currency} ${tool.pricingFrom.toString()}`
      : "Pricing details available on vendor site";

    return {
      slug: tool.slug,
      name: tool.name,
      tagline: tool.tagline || "AI Tool",
      description:
        tool.description ||
        "This profile is being expanded with deeper benchmarks and setup guidance.",
      websiteUrl: tool.websiteUrl,
      categories: categoryNames.length > 0 ? categoryNames : ["Automation"],
      highlights: [
        "Profile includes practical setup and adoption context",
        "Evaluated with operator-focused decision criteria",
        "Updated regularly with pricing and feature changes",
      ],
      comparisonNotes: [
        "Compare setup friction and deployment speed",
        "Evaluate fit by team skill and workflow depth",
        "Shortlist 2-3 tools before final selection",
      ],
      setupLabel,
      pricingLabel,
      updatedAt: tool.updatedAt.toISOString().slice(0, 10),
      outboundHref: buildOutboundHref({
        toolSlug: tool.slug,
        targetUrl,
        linkKind,
        sourcePath: `/tools/${tool.slug}`,
        affiliateLinkId: primaryLink?.id,
      }),
      outboundDisclosure: getOutboundDisclosure(linkKind),
    };
  } catch {
    return fallbackProfiles.find((item) => item.slug === slug) ?? null;
  }
}
