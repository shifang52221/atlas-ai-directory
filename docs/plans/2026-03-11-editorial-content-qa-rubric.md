# Editorial Content QA Rubric

- Date: 2026-03-11
- Scope: launch money pages (`/best-ai-*` hubs + `/tools/[slug]` detail pages)
- Goal: keep commercial pages evidence-led, non-generic, and disclosure-compliant.

## Rubric (Pass/Fail)

1. Evidence-backed claims
- Every ranked recommendation includes a concrete evidence note.
- Evidence note references a real review basis (docs, pricing pages, workflow templates, onboarding surface).

2. Decision utility
- Each recommendation has both `bestFor` and `tradeoff`.
- Language avoids generic hype and states operational tradeoffs clearly.

3. Disclosure consistency
- Every monetized template exposes affiliate disclosure link.
- Editorial policy link is present where ranking logic is described.

4. Internal decision flow
- Hubs include links to compare/use-cases/workflows plus at least one other commercial hub.
- Tool detail pages include links to alternatives and best-of hubs.

5. Readability quality
- No repetitive boilerplate across hubs for primary recommendation rationale.
- FAQ answers remain short, direct, and aligned with user buying intent.

## Validation Notes

- Implemented in code:
  - `lib/editorial-hubs.ts` now includes per-tool `evidence`.
  - `components/editorial-hub-page.tsx` renders an `Evidence and review basis` section.
  - `app/tools/[slug]/page.tsx` adds `Best-of Buying Guides` links.
- Automated checks:
  - `tests/unit/editorial-hubs.test.ts` enforces evidence notes + cross-hub/disclosure links.
  - `tests/e2e/editorial-hub.spec.ts` validates evidence section and cross-hub link visibility.
