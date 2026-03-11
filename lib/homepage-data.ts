import { getDb } from "@/lib/db";

export type HomepageTool = {
  name: string;
  tag: string;
  blurb: string;
  href: string;
  filters: string[];
  popularity: number;
  updatedAt: string;
};

export type HomepageCategory = {
  name: string;
  count: number;
  href: string;
};

export type HomepageData = {
  quickFilters: string[];
  mainNav: Array<{ label: string; href: string }>;
  featuredTools: HomepageTool[];
  categories: HomepageCategory[];
  updates: string[];
  topThisWeek: string[];
  marketSignals: string[];
};

const fallbackData: HomepageData = {
  quickFilters: [
    "AI Agents",
    "Automation",
    "Customer Support",
    "Sales Ops",
    "Marketing",
    "No-Code",
  ],
  mainNav: [
    { label: "Categories", href: "/use-cases" },
    { label: "Popular", href: "/tools" },
    { label: "New", href: "/tools" },
    { label: "Compare", href: "/compare" },
    { label: "Workflows", href: "/workflows" },
  ],
  featuredTools: [
    {
      name: "Zapier AI",
      tag: "Workflow Automation",
      blurb: "Best for multi-app automations with low setup friction.",
      href: "/tools/zapier-ai",
      filters: ["Automation", "No-Code", "Sales Ops"],
      popularity: 98,
      updatedAt: "2026-02-18",
    },
    {
      name: "Make",
      tag: "Visual Builder",
      blurb: "Strong visual scenario builder for complex routing logic.",
      href: "/tools/make",
      filters: ["Automation", "No-Code", "Marketing"],
      popularity: 92,
      updatedAt: "2026-02-12",
    },
    {
      name: "Lindy",
      tag: "AI Agent",
      blurb: "Operator-style agents for SMB tasks and inbox workflows.",
      href: "/tools/lindy",
      filters: ["AI Agents", "Customer Support"],
      popularity: 89,
      updatedAt: "2026-02-22",
    },
    {
      name: "Relevance AI",
      tag: "AI Workforce",
      blurb: "Build and deploy role-based agents with useful templates.",
      href: "/tools/relevance-ai",
      filters: ["AI Agents", "Automation", "Sales Ops"],
      popularity: 86,
      updatedAt: "2026-02-10",
    },
    {
      name: "n8n",
      tag: "Open Source",
      blurb: "Flexible automation engine with strong self-hosting options.",
      href: "/tools/n8n",
      filters: ["Automation", "No-Code"],
      popularity: 84,
      updatedAt: "2026-03-06",
    },
    {
      name: "Clay",
      tag: "Go-To-Market",
      blurb: "Data enrichment and outbound workflows for growth teams.",
      href: "/tools/clay",
      filters: ["Sales Ops", "Marketing"],
      popularity: 82,
      updatedAt: "2026-02-01",
    },
  ],
  categories: [
    { name: "AI Sales", count: 72, href: "/use-cases/ai-sales" },
    { name: "Support Automation", count: 54, href: "/use-cases/support-automation" },
    { name: "Lead Enrichment", count: 39, href: "/use-cases/lead-enrichment" },
    { name: "Content Workflows", count: 61, href: "/use-cases/content-workflows" },
    { name: "Internal Ops", count: 47, href: "/use-cases/internal-ops" },
    { name: "Research Agents", count: 35, href: "/use-cases/research-agents" },
  ],
  updates: [
    "Make launched new AI module templates for CRM sync.",
    "Zapier AI updated task pricing for starter tier.",
    "Relevance AI released new support agent workflow pack.",
    "n8n published a new hosted plan and usage limits.",
  ],
  topThisWeek: [
    "Best AI agent for support ticket triage",
    "Top no-code automation stack under $100/mo",
    "AI SDR workflow with enrichment + outreach",
    "5 tools replacing manual CRM updates",
  ],
  marketSignals: [
    "Agent automation spend up 24% QoQ in SMB segment.",
    "Support + sales workflows are highest-converting intent pages.",
    "Free-trial comparison pages outperform generic tool lists.",
  ],
};

const knownFilters = new Set(fallbackData.quickFilters);

export async function getHomepageData(): Promise<HomepageData> {
  try {
    const db = getDb();

    const [tools, categories] = await Promise.all([
      db.tool.findMany({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          slug: true,
          name: true,
          tagline: true,
          description: true,
          updatedAt: true,
          categories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              clickEvents: true,
            },
          },
        },
      }),
      db.category.findMany({
        take: 12,
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          _count: {
            select: {
              tools: true,
            },
          },
        },
      }),
    ]);

    if (tools.length === 0) {
      return fallbackData;
    }

    const mappedTools: HomepageTool[] = tools.map((tool, index) => {
      const detectedFilters = tool.categories
        .map((entry) => entry.category.name)
        .filter((value) => knownFilters.has(value));

      return {
        name: tool.name,
        tag: tool.tagline || "AI Tool",
        blurb:
          tool.description?.slice(0, 120) ||
          "Profile details will be available shortly.",
        href: `/tools/${tool.slug}`,
        filters:
          detectedFilters.length > 0 ? detectedFilters : ["Automation", "No-Code"],
        popularity:
          tool._count.clickEvents > 0 ? tool._count.clickEvents : 70 - index,
        updatedAt: tool.updatedAt.toISOString().slice(0, 10),
      };
    });

    const mappedCategories: HomepageCategory[] =
      categories.length > 0
        ? categories.map((category) => ({
            name: category.name,
            count: category._count.tools,
            href: `/use-cases/${category.slug}`,
          }))
        : fallbackData.categories;

    return {
      ...fallbackData,
      featuredTools: mappedTools,
      categories: mappedCategories,
    };
  } catch {
    return fallbackData;
  }
}
