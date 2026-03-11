export type RateLimitExportStatus = "all" | "blocked";

type RateLimitExportStatusOption = {
  key: RateLimitExportStatus;
  label: string;
};

const DEFAULT_STATUS: RateLimitExportStatus = "all";

const STATUS_OPTIONS: RateLimitExportStatusOption[] = [
  { key: "all", label: "All events" },
  { key: "blocked", label: "Blocked only" },
];

export function getRateLimitExportStatusOptions(): RateLimitExportStatusOption[] {
  return STATUS_OPTIONS;
}

export function parseRateLimitExportStatus(
  value: string | undefined,
): RateLimitExportStatus {
  if (value === "blocked" || value === "all") {
    return value;
  }

  return DEFAULT_STATUS;
}

export function isDefaultRateLimitExportStatus(
  status: RateLimitExportStatus,
): boolean {
  return status === DEFAULT_STATUS;
}
