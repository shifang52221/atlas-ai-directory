import type { MetadataRoute } from "next";
import { ToolStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { getFallbackToolProfiles } from "@/lib/tool-profile-data";
import { getFallbackUseCaseSlugs } from "@/lib/use-case-data";

function getBaseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

function withLanguageAlternates(url: string) {
  return {
    languages: {
      en: url,
      "x-default": url,
    },
  } as const;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  let toolSlugs: string[] = [];
  let useCaseSlugs: string[] = [];

  try {
    const db = getDb();
    const [tools, categories] = await Promise.all([
      db.tool.findMany({
        where: { status: ToolStatus.ACTIVE },
        orderBy: { updatedAt: "desc" },
        take: 5000,
        select: { slug: true },
      }),
      db.category.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5000,
        select: { slug: true },
      }),
    ]);

    toolSlugs = tools.map((tool) => tool.slug).filter(Boolean);
    useCaseSlugs = categories.map((category) => category.slug).filter(Boolean);
  } catch {
    // Fallback handled below when DB is unavailable.
  }

  if (toolSlugs.length === 0) {
    toolSlugs = getFallbackToolProfiles().map((tool) => tool.slug);
  }

  if (useCaseSlugs.length === 0) {
    useCaseSlugs = getFallbackUseCaseSlugs();
  }

  const staticPaths = [
    "/",
    "/tools",
    "/use-cases",
    "/compare",
    "/workflows",
    "/best-ai-automation-tools",
    "/best-ai-agents-for-sales",
    "/best-ai-tools-for-support",
    "/best-ai-tools-for-marketing",
    "/submit",
    "/affiliate-disclosure",
    "/editorial-policy",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => {
    const url = new URL(path, baseUrl).toString();

    return {
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.8,
      alternates: withLanguageAlternates(url),
    };
  });

  const toolEntries: MetadataRoute.Sitemap = toolSlugs.map((slug) => {
    const url = new URL(`/tools/${slug}`, baseUrl).toString();

    return {
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: withLanguageAlternates(url),
    };
  });

  const useCaseEntries: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => {
    const url = new URL(`/use-cases/${slug}`, baseUrl).toString();

    return {
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: withLanguageAlternates(url),
    };
  });

  return [...staticEntries, ...toolEntries, ...useCaseEntries];
}
