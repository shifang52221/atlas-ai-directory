# Internal Link Graph Validation

- Date: 2026-03-11
- Goal: keep revenue and SEO-priority pages within <=3 clicks from home and avoid orphan critical pages.

## Priority Link Graph

1. `/` -> `/best-ai-automation-tools`, `/best-ai-agents-for-sales`, `/best-ai-tools-for-support`, `/best-ai-tools-for-marketing`
2. `/` -> `/tools`, `/use-cases`, `/compare`, `/workflows`
3. Hub pages (`/best-ai-*`) -> `/tools/[slug]`, `/compare`, `/use-cases`, `/workflows`, policy pages
4. Tool detail pages (`/tools/[slug]`) -> alternatives + compare + use-cases + all four hub pages
5. Footer (global) -> all hub pages + core navigation + policy pages

## Depth Check (Home As Root)

- Home -> Hub page: 1 click
- Home -> Tool detail via hub: 2 clicks
- Home -> Compare/Use-cases/Workflows: 1 click
- Home -> Policy pages via footer: 1 click
- Home -> Use-case detail via use-cases listing: 2 clicks

All launch-critical pages are currently <=3 clicks.

## Non-Orphan Validation

- Hubs are linked from home and global footer.
- Tool detail pages are linked from home featured cards, hub tables/cards, and tools directory.
- Policy pages are linked from footer and commercial templates.

## Automated Coverage

- `tests/e2e/homepage-navigation.spec.ts` checks visibility of all four hub links on home.
- `tests/e2e/editorial-hub.spec.ts` checks each hub links to other hubs.
