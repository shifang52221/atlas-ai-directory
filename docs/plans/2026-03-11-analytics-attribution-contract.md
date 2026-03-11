# Analytics Attribution Contract

- Date: 2026-03-11
- Scope: outbound redirects + editorial hub impression tracking
- Objective: keep attribution dimensions consistent across ingestion and dashboard.

## Canonical Event Fields

All monetization events must keep the following fields consistent:

1. Top-level columns in `ClickEvent`
- `eventType`
- `pagePath`
- `toolId` (nullable for hub impressions)
- `affiliateLinkId` (nullable)
- `sessionId` (privacy-safe hash fragment)
- `visitorHash` (privacy-safe daily hash)
- `countryCode` (2-letter ISO when available)

2. `metadata` JSON contract
- `schemaVersion`
- `kind` (`OUTBOUND_REDIRECT` or `HUB_IMPRESSION`)
- `pagePath`
- `sourcePath` (outbound only)
- `toolSlug` (outbound)
- `linkKind` (outbound)
- `variant` (`A`/`B` when present)
- `placementId` (module/placement dimension)
- `sessionHash`
- `countryCode`
- `targetUrl` (outbound)

## Privacy-Safe Context Strategy

- No raw IP is persisted.
- Session identity is derived from:
  - `x-forwarded-for` (first hop),
  - `user-agent`,
  - `accept-language`,
  - daily key (`YYYY-MM-DD`),
  - server salt (`ANALYTICS_SESSION_SALT`).
- This yields:
  - `visitorHash`: SHA-256 hash
  - `sessionId`: first 24 chars of hash

## Placement Taxonomy (Current)

- `tool_profile_default`
- `tool_profile_primary`
- `tools_directory_list`
- `use_case_recommendation`
- `editorial_hub_recommendation`
- `hub_hero` (hub impression default)

## Dashboard Slices Enabled

- By period: `7d / 30d / 90d`
- By tool: trend tool filter
- By hub: hub filter + hub CTR rows
- By variant: hub A/B summary + experiment table
- By country: top outbound country rows
- By placement: top outbound placement rows
- By link kind: direct/affiliate/sponsored rows
