type ToolAdsEligibilityInput = {
  description: string;
  highlights: string[];
  comparisonNotes: string[];
  faqCount: number;
};

type UseCaseAdsEligibilityInput = {
  description: string;
  summary: string;
  checklist: string[];
  toolsCount: number;
};

const disallowedPathPrefixes = ["/admin", "/api", "/_next"];

const thinContentPhrases = [
  "being expanded",
  "available shortly",
  "profile details are being expanded",
  "curated tools and benchmarks",
];

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  return trimmed;
}

function hasThinContentSignal(value: string): boolean {
  const normalized = value.toLowerCase();
  return thinContentPhrases.some((phrase) => normalized.includes(phrase));
}

export function isAdsPathAllowed(path: string): boolean {
  const normalizedPath = normalizePath(path);
  return !disallowedPathPrefixes.some((prefix) =>
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}

export function isToolDetailAdsEligible(
  input: ToolAdsEligibilityInput,
): boolean {
  const description = input.description.trim();
  if (
    description.length < 90 ||
    hasThinContentSignal(description) ||
    input.highlights.length < 3 ||
    input.comparisonNotes.length < 3 ||
    input.faqCount < 3
  ) {
    return false;
  }

  return true;
}

export function isUseCaseDetailAdsEligible(
  input: UseCaseAdsEligibilityInput,
): boolean {
  const description = input.description.trim();
  const summary = input.summary.trim();
  if (
    description.length < 90 ||
    summary.length < 90 ||
    hasThinContentSignal(description) ||
    hasThinContentSignal(summary) ||
    input.checklist.length < 3 ||
    input.toolsCount < 3
  ) {
    return false;
  }

  return true;
}
