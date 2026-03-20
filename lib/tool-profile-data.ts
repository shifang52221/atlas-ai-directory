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
  placementId?: string;
};

export const COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS = {
  HERO_CTA: "editorial_hub_hero_cta",
  TABLE_CTA: "editorial_hub_table_cta",
  ALTERNATIVE_CTA: "editorial_hub_alternative_cta",
} as const;

export type CommercialEditorialHubPlacementId =
  (typeof COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS)[keyof typeof COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS];

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
      "Fast trigger-action setup for non-technical teams launching cross-app workflows",
      "Strong integration catalog across CRM, support, and internal operations stacks",
      "Reliable fit for recurring operational handoffs with light engineering involvement",
      "Useful default choice when rollout speed matters more than deep custom infrastructure control",
    ],
    comparisonNotes: [
      "Best when you need broad app coverage and a production pilot running in days, not weeks",
      "Compare against Make when branching depth, visual debugging, and scenario transparency matter more than launch speed",
      "Compare against n8n when self-hosting, ownership, and code-level extensibility are strategic requirements",
      "Model task-volume growth early because pricing pressure usually appears after the first successful automation rollout",
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
      "Advanced scenario logic and branching for multi-step operational workflows",
      "Good fit for GTM ops and marketing teams that need visible routing control",
      "Useful when workflow transparency and module-level debugging are required",
      "Stronger than lighter automation tools when process owners can maintain larger scenario graphs",
    ],
    comparisonNotes: [
      "Best for visual process control when operators need to inspect and tune branching logic directly",
      "Can require more setup than Zapier AI for simple automations that do not need complex routing",
      "Often the right middle ground before moving to fully custom orchestration or internal tooling",
      "Ownership discipline matters because scenario sprawl can make maintenance noticeably heavier over time",
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
      "Agent-first experience designed for operators who want fast task delegation",
      "Useful for support, inbox, and communication-heavy coordination workflows",
      "Strong practical templates for quick launch without extensive technical setup",
      "Works best when SMB teams want autonomous assistance before adopting a broader automation stack",
    ],
    comparisonNotes: [
      "Good when your team wants autonomous assistant behavior more than detailed workflow builder control",
      "Evaluate model quality, escalation handling, and approval rules for each customer-facing workflow",
      "Compare with Relevance AI when you need broader workforce orchestration across multiple team roles",
      "Plan human-review checkpoints early because trust can drop fast if the first agent workflows overreach",
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
      "Role-based AI workforce framing that maps well to multi-team operating models",
      "Template library supports faster deployment for teams testing agent-led operations",
      "Useful for cross-team workflows where handoffs and governance matter as much as automation",
      "Better fit than lighter agent tools when leadership wants clear role boundaries and orchestration rules",
    ],
    comparisonNotes: [
      "Strong option for multi-agent operational setups where role separation and workflow governance are central",
      "Compare with Lindy when SMB simplicity and faster launch matter more than orchestration depth",
      "Compare with a custom stack when strict infrastructure control or proprietary workflow logic is mandatory",
      "Scope the first pilot carefully because broad agent ambitions can create unnecessary setup weight for small teams",
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
      "Open-source and self-hosting friendly for teams that want platform ownership",
      "Good for organizations needing infrastructure control, auditability, and deployment flexibility",
      "Extensible with custom logic, internal APIs, and community-maintained nodes",
      "Often the most durable choice when technical teams expect automation complexity to grow over time",
    ],
    comparisonNotes: [
      "Best for technical teams prioritizing ownership, extensibility, and operational control over convenience",
      "Compare with Zapier AI and Make when managed convenience may outweigh infrastructure responsibility",
      "Great fit for cost-sensitive scaling if your team can absorb the maintenance and upgrade burden",
      "Decide hosted versus self-hosted early because support model and operational overhead change significantly",
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
      "Strong enrichment and outbound support for teams running high-signal prospecting motions",
      "Good for signal-based workflows where targeting quality drives sequence performance",
      "Useful for SDR and RevOps alignment around data quality, prioritization, and routing",
      "Especially effective when GTM teams need fast movement from research signals into outbound execution",
    ],
    comparisonNotes: [
      "Best for growth and outbound execution teams where enrichment quality directly affects conversion outcomes",
      "Compare with broader automation tools when your use case extends well beyond GTM and outbound operations",
      "Pricing can scale quickly with high enrichment volume, so weekly usage review is usually necessary",
      "Validate handoff from data enrichment to sequencing early because weak field governance can erase Clay's advantage",
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
  placementId,
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
  if (placementId) {
    params.set("placementId", placementId);
  }

  const signature = buildOutboundSignature({
    toolSlug,
    target: trackedTarget,
    linkKind,
    sourcePath,
    affiliateLinkId,
    placementId,
  });
  if (signature) {
    params.set("sig", signature);
  }

  return `/api/outbound?${params.toString()}`;
}

export function buildCommercialEditorialHubOutboundHrefs(
  input: Omit<BuildOutboundHrefInput, "placementId">,
): {
  heroOutboundHref: string;
  tableOutboundHref: string;
  alternativeOutboundHref: string;
} {
  return {
    heroOutboundHref: buildOutboundHref({
      ...input,
      placementId: COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS.HERO_CTA,
    }),
    tableOutboundHref: buildOutboundHref({
      ...input,
      placementId: COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS.TABLE_CTA,
    }),
    alternativeOutboundHref: buildOutboundHref({
      ...input,
      placementId: COMMERCIAL_EDITORIAL_HUB_PLACEMENT_IDS.ALTERNATIVE_CTA,
    }),
  };
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
      placementId: "tool_profile_primary",
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
        "Operator-focused profile with practical setup notes, pricing context, and decision guidance.",
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
        placementId: "tool_profile_primary",
      }),
      outboundDisclosure: getOutboundDisclosure(linkKind),
    };
  } catch {
    return fallbackProfiles.find((item) => item.slug === slug) ?? null;
  }
}
