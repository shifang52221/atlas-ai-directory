import { LinkKind } from "@prisma/client";
import { getDb } from "./db";
import {
  buildOutboundHref,
  getFallbackToolProfiles,
} from "./tool-profile-data";

export type DirectoryTool = {
  slug: string;
  name: string;
  tag: string;
  blurb: string;
  href: string;
  outboundHref: string;
  filters: string[];
  popularity: number;
  updatedAt: string;
  pricingLabel: string;
  setupLabel: string;
};

export type ToolsDirectoryData = {
  mainNav: Array<{ label: string; href: string }>;
  quickFilters: string[];
  tools: DirectoryTool[];
};

const fallbackToolOrder = [
  "zapier-ai",
  "make",
  "lindy",
  "relevance-ai",
  "n8n",
  "clay",
];

const mainNav: Array<{ label: string; href: string }> = [
  { label: "Categories", href: "/use-cases" },
  { label: "Popular", href: "/tools" },
  { label: "New", href: "/tools" },
  { label: "Compare", href: "/compare" },
  { label: "Workflows", href: "/workflows" },
];

const fallbackTools: DirectoryTool[] = fallbackToolOrder
  .map((slug, index) => {
    const tool = getFallbackToolProfiles().find((item) => item.slug === slug);
    if (!tool) {
      return null;
    }

    return {
      slug: tool.slug,
      name: tool.name,
      tag: tool.tagline,
      blurb: tool.description,
      href: `/tools/${tool.slug}`,
      outboundHref: buildOutboundHref({
        toolSlug: tool.slug,
        targetUrl: tool.websiteUrl,
        linkKind: LinkKind.DIRECT,
        sourcePath: "/tools",
      }),
      filters: tool.categories,
      popularity: 100 - index * 4,
      updatedAt: tool.updatedAt,
      pricingLabel: "Pricing on vendor page",
      setupLabel: "Setup varies by team workflow",
    };
  })
  .filter((tool): tool is DirectoryTool => Boolean(tool));

const fallbackQuickFilters = Array.from(
  new Set(fallbackTools.flatMap((tool) => tool.filters)),
).slice(0, 10);

const fallbackData: ToolsDirectoryData = {
  mainNav,
  quickFilters: fallbackQuickFilters,
  tools: fallbackTools,
};

export async function getToolsDirectoryData(): Promise<ToolsDirectoryData> {
  try {
    const db = getDb();
    const tools = await db.tool.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ updatedAt: "desc" }],
      take: 120,
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        websiteUrl: true,
        updatedAt: true,
        setupMinutes: true,
        pricingFrom: true,
        currency: true,
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
        _count: {
          select: {
            clickEvents: true,
          },
        },
      },
    });

    if (tools.length === 0) {
      return fallbackData;
    }

    const mappedTools: DirectoryTool[] = tools.map((tool) => {
      const primaryLink = tool.affiliateLinks[0];
      const linkKind = primaryLink?.linkKind ?? LinkKind.DIRECT;
      const targetUrl = primaryLink?.trackingUrl ?? tool.websiteUrl;
      const filters = tool.categories.map((item) => item.category.name);
      const pricingLabel =
        tool.pricingFrom !== null
          ? `From ${tool.currency} ${tool.pricingFrom.toString()}`
          : "Pricing on vendor page";
      const setupLabel = tool.setupMinutes
        ? `~${tool.setupMinutes} min setup`
        : "Setup varies by team workflow";

      return {
        slug: tool.slug,
        name: tool.name,
        tag: tool.tagline || "AI Tool",
        blurb:
          tool.description?.slice(0, 200) ||
          "Profile details are being expanded with benchmark data.",
        href: `/tools/${tool.slug}`,
        outboundHref: buildOutboundHref({
          toolSlug: tool.slug,
          targetUrl,
          linkKind,
          sourcePath: "/tools",
          affiliateLinkId: primaryLink?.id,
        }),
        filters: filters.length > 0 ? filters : ["Automation"],
        popularity:
          tool._count.clickEvents > 0 ? tool._count.clickEvents : 1,
        updatedAt: tool.updatedAt.toISOString().slice(0, 10),
        pricingLabel,
        setupLabel,
      };
    });

    const quickFilters = Array.from(
      new Set(mappedTools.flatMap((tool) => tool.filters)),
    ).slice(0, 12);

    return {
      mainNav,
      quickFilters: quickFilters.length > 0 ? quickFilters : fallbackQuickFilters,
      tools: mappedTools,
    };
  } catch {
    return fallbackData;
  }
}
