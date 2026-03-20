# README Brand Alignment Design

## Goal

Align the repository's public-facing README branding with the site's current launch brand hierarchy so the codebase introduction matches the live product story.

## Scope

This design is intentionally narrow and limited to the README opening section:

- `README.md`

Primary content in scope:

- top-level README title
- opening descriptive paragraph

This design does not include:

- code changes
- other docs updates
- route or metadata changes
- setup command changes
- environment variable changes
- launch process rewrites

## Problem

The site has already shifted to `Atlas AI Directory` as the primary brand, with `AI Agents Decision Hub` now acting as secondary positioning. The README still leads with the older primary label, which creates an unnecessary mismatch between:

- the site homepage
- site metadata
- repository landing copy

That inconsistency creates small but real launch friction:

- the project looks less polished to collaborators or partners
- the public product story feels split across code and site surfaces
- the README no longer reflects the current homepage hierarchy

## Recommended Approach

Update only the README's top title and opening paragraph so they mirror the current brand hierarchy and product positioning.

The change should stay intentionally conservative:

- use `Atlas AI Directory` as the primary README name
- keep `AI Agents Decision Hub` as secondary positioning if it still helps clarify the site's role
- preserve all technical and operational sections exactly as they are unless a wording change is necessary for consistency

## Alternatives Considered

### Option 1: Update only the README title and opening paragraph

Pros:

- lowest-risk change
- fixes the main public inconsistency immediately
- avoids accidental drift in operational docs

Cons:

- does not standardize all terminology across the entire repo

### Option 2: Refresh the README title, intro, and several supporting sections

Pros:

- stronger internal wording consistency

Cons:

- broader review surface
- easier to turn a small polish task into open-ended doc cleanup

### Option 3: Run a full repo-wide documentation brand pass

Pros:

- most comprehensive cleanup

Cons:

- too broad for the current launch polish phase
- risks distracting from higher-value release work

## Chosen Design

Adopt Option 1.

We will update the README so the repo opens with:

- `Atlas AI Directory` as the primary project label
- a short intro describing the product as an English AI tool directory and decision hub for operators

The rest of the README remains unchanged unless a tiny wording adjustment is needed to avoid contradicting the new intro.

## Content Rules

Updated README copy should:

- match the current homepage and metadata hierarchy
- stay concise and factual
- describe the site as launch-ready product infrastructure, not a vague prototype
- preserve the existing operational usefulness of the README

## Testing Strategy

No automated test suite is required because this work only changes documentation.

Verification should consist of:

- reviewing the updated README title
- reviewing the opening paragraph for consistency with the site brand
- confirming no unrelated README sections were changed

## Success Criteria

This work is complete when:

- the README title uses `Atlas AI Directory` as the primary brand
- the opening paragraph aligns with the site's current positioning
- the remainder of the README stays operationally intact
