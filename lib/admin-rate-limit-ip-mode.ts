export type RateLimitIpMatchMode = "contains" | "exact";

type RateLimitIpMatchModeOption = {
  key: RateLimitIpMatchMode;
  label: string;
};

const DEFAULT_IP_MATCH_MODE: RateLimitIpMatchMode = "contains";

const IP_MATCH_MODE_OPTIONS: RateLimitIpMatchModeOption[] = [
  { key: "contains", label: "Contains" },
  { key: "exact", label: "Exact" },
];

export function getRateLimitIpMatchModeOptions(): RateLimitIpMatchModeOption[] {
  return IP_MATCH_MODE_OPTIONS;
}

export function parseRateLimitIpMatchMode(
  value: string | undefined,
): RateLimitIpMatchMode {
  if (value === "contains" || value === "exact") {
    return value;
  }

  return DEFAULT_IP_MATCH_MODE;
}

export function isDefaultRateLimitIpMatchMode(
  mode: RateLimitIpMatchMode,
): boolean {
  return mode === DEFAULT_IP_MATCH_MODE;
}
