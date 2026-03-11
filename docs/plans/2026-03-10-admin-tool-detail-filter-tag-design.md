# Admin Tool Detail Filter Tag Design

## Goal
Show the currently active status filter on the tool detail page, next to the "Back to Tool List" link, so admins always know the list context they came from.

## Context
The tools list page supports `status` filters (ACTIVE/INACTIVE). The detail page already preserves this filter in the back link. This change adds a visible indicator of that context.

## Requirements
- If `status` query param is `ACTIVE` or `INACTIVE`, show a small pill next to the back link.
- Pill text: `Filter: ACTIVE` or `Filter: INACTIVE`.
- If no valid `status` filter is present, hide the pill.
- Use existing admin visual language (rounded pill, subtle background).
- Do not change navigation behavior.

## Non-Goals
- No new filtering controls on the detail page.
- No new admin routes or APIs.
- No dependency on DB state.

## UI Placement
- Inline after "Back to Tool List" within the existing paragraph.
- Example: `Back to Tool List  Filter: INACTIVE`

## Data Flow
- Read `status` from `searchParams`.
- Parse with existing status filter helper.
- Format a label only when status is valid.
- Render pill when label is non-null.

## Accessibility
- Render as text (not a button).
- Maintain readable contrast and spacing.

## Testing
- Add/extend unit tests for helper that returns the pill label.
- Run lint, unit tests, and build.
