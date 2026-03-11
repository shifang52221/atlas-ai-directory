export type RateLimitWindowKey = "24h" | "7d" | "30d";

type RateLimitWindowOption = {
  key: RateLimitWindowKey;
  label: string;
  days: number;
};

const DEFAULT_WINDOW: RateLimitWindowKey = "7d";

const WINDOW_OPTIONS: RateLimitWindowOption[] = [
  { key: "24h", label: "Last 24h", days: 1 },
  { key: "7d", label: "Last 7d", days: 7 },
  { key: "30d", label: "Last 30d", days: 30 },
];

export function getRateLimitWindowOptions(): RateLimitWindowOption[] {
  return WINDOW_OPTIONS;
}

export function parseRateLimitWindow(value: string | undefined): RateLimitWindowKey {
  if (value === "24h" || value === "7d" || value === "30d") {
    return value;
  }

  return DEFAULT_WINDOW;
}

export function getRateLimitWindowDays(windowKey: RateLimitWindowKey): number {
  const option = WINDOW_OPTIONS.find((item) => item.key === windowKey);
  return option ? option.days : 7;
}

export function isDefaultRateLimitWindow(windowKey: RateLimitWindowKey): boolean {
  return windowKey === DEFAULT_WINDOW;
}
