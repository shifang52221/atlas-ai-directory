import {
  getEditorialHubConfigOrThrow,
  getEditorialHubPaths,
} from "./editorial-hubs";
import { getCanonicalToolVsHref } from "./tool-vs-pages";
import {
  buildToolCompareSectionHref,
  getToolDetailSeoContent,
} from "./tool-detail-seo-content";
import { getFallbackToolProfiles } from "./tool-profile-data";
import { getFallbackUseCaseProfiles } from "./use-case-data";

export type CompareHeadToHeadComparison = {
  title: string;
  href: string;
  description: string;
  signalCount: number;
};

export type CompareUseCaseComparison = {
  title: string;
  href: string;
  description: string;
  toolNames: string[];
};

export type CompareBuyingGuideShortcut = {
  title: string;
  href: string;
  description: string;
  guideType: "best_of" | "alternatives" | "vs";
};

export type ComparePageData = {
  headToHeadComparisons: CompareHeadToHeadComparison[];
  useCaseComparisons: CompareUseCaseComparison[];
  buyingGuideShortcuts: CompareBuyingGuideShortcut[];
};

type PairRecord = {
  slugs: [string, string];
  signalCount: number;
  bestDescription: string;
  orientationVotes: Map<string, number>;
};

const HEAD_TO_HEAD_LIMIT = 6;
const BUYING_GUIDE_LIMIT = 6;

const FLAGSHIP_EDITORIAL_PATHS = new Set([
  "/best-ai-automation-tools",
  "/best-ai-agents-for-sales",
  "/best-ai-tools-for-support",
  "/best-ai-tools-for-marketing",
]);

const USE_CASE_PRIORITY = new Map(
  [
    "ai-sales",
    "support-automation",
    "internal-ops",
    "lead-enrichment",
    "content-workflows",
    "research-agents",
  ].map((slug, index) => [slug, index]),
);

const BUYING_GUIDE_PRIORITY = [
  "/best-ai-automation-tools",
  "/best-ai-agents-for-sales",
  "/best-ai-tools-for-support",
  "/best-ai-tools-for-marketing-under-100",
  "/make-alternatives",
  "/monday-vs-clickup-for-ops",
] as const;

const TOOL_COMPARE_PRIORITY = new Map(
  [
    "zapier-ai",
    "make",
    "relevance-ai",
    "clay",
    "n8n",
    "lindy",
  ].map((slug, index) => [slug, index]),
);

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getPairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

function getGuideType(path: string): "best_of" | "alternatives" | "vs" {
  if (path.includes("-alternatives")) {
    return "alternatives";
  }

  if (path.includes("-vs-")) {
    return "vs";
  }

  return "best_of";
}

function sortPairByPriority(a: string, b: string): [string, string] {
  const aPriority = TOOL_COMPARE_PRIORITY.get(a) ?? Number.MAX_SAFE_INTEGER;
  const bPriority = TOOL_COMPARE_PRIORITY.get(b) ?? Number.MAX_SAFE_INTEGER;

  if (aPriority !== bPriority) {
    return aPriority < bPriority ? [a, b] : [b, a];
  }

  return a.localeCompare(b) <= 0 ? [a, b] : [b, a];
}

function getQuestionWeight(path: string): number {
  if (FLAGSHIP_EDITORIAL_PATHS.has(path)) {
    return 4;
  }

  if (path.includes("-alternatives")) {
    return 3;
  }

  if (path.includes("-vs-")) {
    return 2;
  }

  return 1;
}

function buildToolLookup() {
  const tools = getFallbackToolProfiles();

  return {
    tools,
    bySlug: new Map(tools.map((tool) => [tool.slug, tool])),
    searchable: tools.map((tool) => ({
      slug: tool.slug,
      normalizedName: normalizeText(tool.name),
      normalizedSlug: normalizeText(tool.slug),
    })),
  };
}

function extractOrderedPairFromQuestion(
  question: string,
  searchableTools: Array<{
    slug: string;
    normalizedName: string;
    normalizedSlug: string;
  }>,
): [string, string] | null {
  const normalizedQuestion = normalizeText(question);
  const matches = searchableTools
    .map((tool) => {
      const nameIndex = normalizedQuestion.indexOf(tool.normalizedName);
      const slugIndex = normalizedQuestion.indexOf(tool.normalizedSlug);
      const firstIndex =
        nameIndex === -1
          ? slugIndex
          : slugIndex === -1
            ? nameIndex
            : Math.min(nameIndex, slugIndex);

      return {
        slug: tool.slug,
        firstIndex,
      };
    })
    .filter((item) => item.firstIndex >= 0)
    .sort((a, b) => a.firstIndex - b.firstIndex);

  const uniqueMatches = Array.from(new Set(matches.map((item) => item.slug)));
  if (uniqueMatches.length < 2) {
    return null;
  }

  return [uniqueMatches[0]!, uniqueMatches[1]!];
}

function recordPairSignal(
  pairs: Map<string, PairRecord>,
  input: {
    slugs: [string, string];
    description: string;
    signalCount: number;
    orientationWeight?: number;
  },
) {
  const key = getPairKey(input.slugs[0], input.slugs[1]);
  const existing = pairs.get(key);

  if (!existing) {
    const orientationVotes = new Map<string, number>();
    orientationVotes.set(input.slugs.join("::"), input.orientationWeight ?? 0);
    pairs.set(key, {
      slugs: input.slugs,
      signalCount: input.signalCount,
      bestDescription: input.description,
      orientationVotes,
    });
    return;
  }

  existing.signalCount += input.signalCount;
  const orientationKey = input.slugs.join("::");
  const currentVote = existing.orientationVotes.get(orientationKey) ?? 0;
  existing.orientationVotes.set(
    orientationKey,
    currentVote + (input.orientationWeight ?? 0),
  );

  if (input.description.length > existing.bestDescription.length) {
    existing.bestDescription = input.description;
  }
}

function buildHeadToHeadComparisons(): CompareHeadToHeadComparison[] {
  const { tools, bySlug, searchable } = buildToolLookup();
  const pairs = new Map<string, PairRecord>();

  for (const tool of tools) {
    const seoContent = getToolDetailSeoContent({
      slug: tool.slug,
      name: tool.name,
      categories: tool.categories,
      highlights: tool.highlights,
      comparisonNotes: tool.comparisonNotes,
      setupLabel: tool.setupLabel,
      pricingLabel: tool.pricingLabel,
    });

    for (const alternativeSlug of seoContent.alternativeSlugs) {
      if (!bySlug.has(alternativeSlug) || alternativeSlug === tool.slug) {
        continue;
      }

      recordPairSignal(pairs, {
        slugs: [tool.slug, alternativeSlug],
        description:
          tool.comparisonNotes[0] ||
          `Compare ${tool.name} against adjacent alternatives before choosing.`,
        signalCount: 1,
      });
    }
  }

  for (const path of getEditorialHubPaths()) {
    const config = getEditorialHubConfigOrThrow(path);
    const questionWeight = getQuestionWeight(path);

    for (const item of config.comparisonQuestions) {
      const slugs = extractOrderedPairFromQuestion(item.question, searchable);
      if (!slugs) {
        continue;
      }

      recordPairSignal(pairs, {
        slugs,
        description: item.answer,
        signalCount: 1,
        orientationWeight: questionWeight,
      });
    }
  }

  return Array.from(pairs.values())
    .map((pair) => {
      const [firstSlug, secondSlug] = sortPairByPriority(
        pair.slugs[0],
        pair.slugs[1],
      );
      const firstTool = bySlug.get(firstSlug);
      const secondTool = bySlug.get(secondSlug);

      if (!firstTool || !secondTool) {
        return null;
      }

      return {
        title: `${firstTool.name} vs ${secondTool.name}`,
        href:
          getCanonicalToolVsHref(firstSlug, secondSlug) ||
          buildToolCompareSectionHref(firstSlug),
        description: pair.bestDescription,
        signalCount: pair.signalCount,
      };
    })
    .filter((item): item is CompareHeadToHeadComparison => Boolean(item))
    .sort((a, b) => b.signalCount - a.signalCount || a.title.localeCompare(b.title))
    .slice(0, HEAD_TO_HEAD_LIMIT);
}

function buildUseCaseComparisons(): CompareUseCaseComparison[] {
  return getFallbackUseCaseProfiles()
    .map((profile) => ({
      title: `Compare tools for ${profile.name}`,
      href: `/use-cases/${profile.slug}`,
      description: `${profile.summary} Compare ${profile.tools
        .slice(0, 3)
        .map((tool) => tool.name)
        .join(", ")} before you shortlist a final stack.`,
      toolNames: profile.tools.slice(0, 3).map((tool) => tool.name),
      priority: USE_CASE_PRIORITY.get(profile.slug) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    .map((item) => ({
      title: item.title,
      href: item.href,
      description: item.description,
      toolNames: item.toolNames,
    }));
}

function buildBuyingGuideShortcuts(): CompareBuyingGuideShortcut[] {
  const configs = new Map(
    getEditorialHubPaths().map((path) => [path, getEditorialHubConfigOrThrow(path)]),
  );

  return BUYING_GUIDE_PRIORITY.map((path) => {
    const config = configs.get(path);
    if (!config) {
      return null;
    }

    return {
      title: config.title,
      href: config.path,
      description: config.metadataDescription,
      guideType: getGuideType(config.path),
    };
  })
    .filter((item): item is CompareBuyingGuideShortcut => Boolean(item))
    .slice(0, BUYING_GUIDE_LIMIT);
}

export function getComparePageData(): ComparePageData {
  return {
    headToHeadComparisons: buildHeadToHeadComparisons(),
    useCaseComparisons: buildUseCaseComparisons(),
    buyingGuideShortcuts: buildBuyingGuideShortcuts(),
  };
}
