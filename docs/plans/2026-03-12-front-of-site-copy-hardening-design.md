# Front-of-Site Copy Hardening Design

## Goal

Remove launch-weak placeholder language from publicly visible high-intent surfaces without expanding feature scope or touching admin and email-only copy.

## Scope

This design covers only front-of-site data and content sources that can surface directly on user-facing pages:

- `lib/homepage-data.ts`
- `lib/tools-directory-data.ts`
- `lib/tool-profile-data.ts`
- `lib/use-case-data.ts`

This design does not include:

- admin interface copy
- email template copy
- new pages
- new features
- schema changes

## Problem

The site already has strong structure and commercial intent, but several fallback paths still expose placeholder-style phrases such as:

- "Profile details will be available shortly."
- "Profile details are being expanded with benchmark data."
- "This profile is being expanded with deeper benchmarks and setup guidance."
- "Setup varies by team workflow."

These phrases reduce trust on launch-priority pages, especially when traffic lands on fallback-driven tool, directory, or use-case content.

## Recommended Approach

Use a narrow content-hardening pass that replaces placeholder-style copy with launch-grade operator-facing language while keeping the existing data flow intact.

Key principles:

- prefer concrete phrasing over vague placeholders
- keep current structure and types unchanged
- improve fallback quality rather than expanding scope
- preserve current ranking, routing, and monetization behavior

## Alternatives Considered

### Option 1: Front-of-site copy only

This option improves the surfaces users actually see before and during launch.

Pros:

- highest launch impact
- low regression risk
- small test surface

Cons:

- admin and email copy may remain less polished for now

### Option 2: Front-of-site plus admin

Pros:

- broader consistency

Cons:

- increases scope late in the cycle
- lower impact than improving public pages first

### Option 3: Front-of-site plus admin plus email

Pros:

- most complete polish pass

Cons:

- too broad for the current launch window
- spreads effort across lower-priority surfaces

## Chosen Design

Adopt Option 1.

We will tighten only user-visible copy on the homepage, tools directory, tool profiles, and use-case pages. The implementation will reuse the existing fallback structures and only replace weak wording with stronger operator-facing summaries.

## Content Rules

The revised copy should follow these rules:

- avoid "coming soon", "available shortly", or "being expanded"
- avoid generic setup wording if a stronger practical default is possible
- keep pricing copy honest when exact pricing is unknown
- keep language aligned with operators, buyers, and implementation teams
- avoid introducing claims that require fresh external validation

## Testing Strategy

Add or tighten targeted tests to verify:

- homepage/tool/use-case fallback text does not include placeholder phrases
- tools directory renders stronger setup/pricing defaults
- tool profile fallback descriptions remain intentional and non-placeholder

Use the existing unit and e2e coverage as the base, and only add assertions where the copy quality is part of launch readiness.

## Success Criteria

This work is complete when:

- priority fallback paths no longer expose placeholder-style language
- targeted tests pass
- homepage, tools, tool detail, and use-case surfaces still render correctly
- no admin or email-only work is introduced into the scope
