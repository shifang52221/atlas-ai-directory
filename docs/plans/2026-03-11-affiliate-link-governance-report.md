# Affiliate Link Governance Report

- Generated at: 2026-03-11 07:58:35Z
- Scope: fallback profile primary outbound links (global English launch set)
- Total links checked: 6
- Passing links: 6
- Failing links: 0

## Inventory + Validation

| Tool Slug | Region | Link Kind | Website URL | Status | Result | Latency(ms) | Note |
|---|---|---|---|---:|---|---:|---|
| zapier-ai | global | DIRECT | https://zapier.com | 200 | PASS | 1533 | ok |
| make | global | DIRECT | https://www.make.com | 301 | PASS | 912 | location: /en |
| lindy | global | DIRECT | https://www.lindy.ai | 200 | PASS | 1378 | ok |
| relevance-ai | global | DIRECT | https://relevanceai.com | 200 | PASS | 414 | ok |
| n8n | global | DIRECT | https://n8n.io | 200 | PASS | 2627 | ok |
| clay | global | DIRECT | https://www.clay.com | 200 | PASS | 1427 | ok |

## Governance Controls

- Outbound allowlist enforcement: PASS
- Outbound signature enforcement: PASS
- Admin publish gate for primary link completeness: PASS
- Admin URL validation before save/publish: PASS

## Follow-up Actions

- No broken links detected in launch fallback set.
- Re-run `npm run audit:affiliate` before each release candidate.
- Keep affiliate disclosure and editorial policy links visible on every monetized template.
