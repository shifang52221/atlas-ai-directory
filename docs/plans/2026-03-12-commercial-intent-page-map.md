# Commercial Intent Page Map (12-Page Sprint)

- Date: 2026-03-12
- Scope: English AI navigation monetization pages
- Owner: Content + Monetization + Engineering

## Coverage Rule

Every commercial page in this sprint must include:

1. Primary keyword intent
2. Primary affiliate program
3. At least 2 supporting alternatives
4. Money CTA placement IDs
5. Required internal links
6. Publish priority

If any item is missing, mark page as `BLOCKED`.

## 12-Page Matrix

| Page Slug | Intent Type | Primary Program | Supporting Programs | Money CTA Placement IDs | Required Internal Links | Publish Priority |
|---|---|---|---|---|---|---|
| `/best-ai-automation-tools-for-small-business` | best | Make | monday.com, ClickUp | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/tools`, `/compare`, `/best-ai-automation-tools`, `/affiliate-disclosure` | P0 |
| `/best-ai-sales-agents-for-smb` | best | HubSpot | Make, monday.com | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/use-cases/ai-sales`, `/compare`, `/best-ai-agents-for-sales` | P0 |
| `/best-ai-tools-for-marketing-under-100` | best | Semrush | HubSpot, Descript | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/best-ai-tools-for-marketing`, `/compare`, `/tools` | P0 |
| `/best-ai-tools-for-support-ticket-triage` | best | Make | HubSpot, Synthesia | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/best-ai-tools-for-support`, `/use-cases/support-automation`, `/compare` | P0 |
| `/make-alternatives` | alternatives | Make | n8n, Zapier AI | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/tools/make`, `/compare`, `/best-ai-automation-tools` | P0 |
| `/semrush-alternatives` | alternatives | Semrush | HubSpot, Frase | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/tools`, `/compare`, `/best-ai-tools-for-marketing` | P0 |
| `/hubspot-alternatives-for-startups` | alternatives | HubSpot | monday.com, ClickUp | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/best-ai-agents-for-sales`, `/compare`, `/use-cases/ai-sales` | P1 |
| `/monday-vs-clickup-for-ops` | vs | monday.com | ClickUp, Make | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/compare`, `/use-cases/internal-ops`, `/best-ai-automation-tools` | P0 |
| `/synthesia-alternatives` | alternatives | Synthesia | Descript, HeyGen | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/tools`, `/compare`, `/workflows` | P1 |
| `/descript-alternatives` | alternatives | Descript | Synthesia, Murf | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/tools`, `/compare`, `/best-ai-tools-for-marketing` | P1 |
| `/ai-sales-automation-tools-for-lead-enrichment` | use-case | HubSpot | Make, Semrush | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/use-cases/lead-enrichment`, `/best-ai-agents-for-sales`, `/tools` | P0 |
| `/ai-workflow-tools-for-internal-operations` | use-case | Make | monday.com, ClickUp | `editorial_hub_hero_cta`, `editorial_hub_table_cta`, `editorial_hub_alternative_cta` | `/use-cases/internal-ops`, `/best-ai-automation-tools`, `/workflows` | P0 |

## CTA Placement Taxonomy (Sprint)

1. `editorial_hub_hero_cta`
2. `editorial_hub_table_cta`
3. `editorial_hub_alternative_cta`
4. `editorial_hub_recommendation` (legacy alias -> `editorial_hub_hero_cta`)
5. `hub_hero` (hub impression default)

## Publish Sequence

1. Wave 1 (P0): 4 pages
2. Wave 2 (P0/P1 mixed): 4 pages
3. Wave 3 (remaining): 4 pages

## Definition of Ready

Before publish, each page must have:

1. Canonical URL + metadata title/description
2. JSON-LD block
3. Affiliate disclosure link
4. At least 3 outbound candidate links
5. At least 3 internal links to commercial cluster
