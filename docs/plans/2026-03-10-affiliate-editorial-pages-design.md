# Affiliate Disclosure + Editorial Policy Design

## Goal
Launch trust and compliance pages that support an affiliate-first monetization model while strengthening SEO quality signals.

## Scope
- Add `/affiliate-disclosure` page.
- Add `/editorial-policy` page.
- Link both pages from global footer.
- Surface both pages near affiliate CTA/disclosure on tool detail pages.
- Keep existing UI language and navigation structure.

## Why This Matters
- Clear affiliate disclosure improves trust and policy alignment for future ad monetization.
- Editorial policy clarifies evaluation methodology, helping establish quality and credibility for review-style SEO content.
- These pages provide internal-link targets that support content trust architecture.

## Requirements
- Content must be English and written for global users.
- Pages should include strong, specific statements on:
  - how affiliate relationships work,
  - how rankings and recommendations are decided,
  - update cadence and correction policy.
- Footer links must point to real policy routes, not placeholder pages.
- Tool detail page should expose links to both policy pages close to outbound affiliate context.

## Non-Goals
- No backend schema changes.
- No monetization logic changes in outbound API.
- No admin CMS for policy editing in this phase.

## UX Notes
- Preserve existing visual system (glass-like cards, rounded surfaces, existing fonts).
- Keep policy pages readable with sectioned content and concise paragraphs.
- Ensure mobile readability with single-column layout.

## Verification
- Lint passes.
- Unit tests pass.
- Build passes.
- Route smoke tests include new policy routes.
