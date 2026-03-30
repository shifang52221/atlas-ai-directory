# Prisma Migration Baseline Design

## Goal

Establish a first-class Prisma migration baseline so the project can safely keep existing database data, standardize schema evolution across local and deployed environments, and stop relying on implicit schema-only changes.

## Scope

This design covers:

- creating the first committed Prisma migration baseline
- safely onboarding an existing populated database into Prisma Migrate history
- defining the standard workflow for local development, staging, and production
- updating repo documentation and scripts so the workflow is repeatable

This design does not cover:

- upgrading Prisma from `6.16.2` to `7.x`
- changing the database provider
- adding seed data or fixture management
- introducing CI enforcement beyond documented commands and scripts

## Problem

The repository has a valid Prisma schema and Prisma scripts, but it does not have a committed `prisma/migrations` history.

That creates three concrete risks:

1. schema changes are not durably versioned at the database layer
2. new environments do not have a canonical way to reach the expected schema state
3. future content-quality and monetization features can drift between code and database structure

For this product, silent schema drift is especially risky because many SEO and editorial features degrade quietly instead of failing loudly.

## Constraints

- existing database data must be preserved
- future local, staging, and production environments need one standard migration path
- the solution should not assume the current database can be dropped and recreated
- this change should not bundle a Prisma major-version upgrade

## Alternatives Considered

### Option 1: Documentation-only workflow

Keep using `schema.prisma` as the source of truth and document manual synchronization.

Pros:

- smallest immediate change

Cons:

- does not create real migration history
- keeps environment drift risk high
- weak fit for a long-lived content platform

### Option 2: Prisma migration baseline with existing-db adoption

Generate a baseline migration from the current schema, keep it in version control, verify existing database alignment, and mark the baseline as already applied on existing databases.

Pros:

- preserves current data
- creates a durable migration history
- supports standard `migrate deploy` in future environments
- minimal long-term operational ambiguity

Cons:

- requires careful drift verification before adoption
- introduces a one-time baseline procedure

### Option 3: Fresh database rebuild and data re-import

Create a clean database from migrations and move existing data into it.

Pros:

- cleanest database-history story

Cons:

- too operationally heavy for the current stage
- unnecessary risk given the current product scope

## Chosen Design

Adopt Option 2.

We will create a first Prisma migration baseline from the current schema, then separate the workflow into two safe paths:

- existing databases: verify structural alignment, then record the baseline as already applied
- new databases: apply the baseline through Prisma Migrate as the canonical initialization path

This gives the project a proper migration history without forcing a destructive database rebuild.

## Baseline Architecture

### Baseline artifact

The repository will gain:

- `prisma/migrations/<timestamp>_baseline/migration.sql`
- `prisma/migrations/migration_lock.toml`

The baseline migration will represent the current `prisma/schema.prisma` from an empty database to the full current schema.

### Existing-database adoption

For a database that already contains data:

1. back it up first
2. compare the live database structure with the current Prisma schema
3. if drift exists, stop and resolve drift before baseline adoption
4. if aligned, mark the baseline migration as applied using Prisma Migrate metadata

The baseline SQL is not executed against an already-populated aligned database.

### New-environment initialization

For new local, staging, or production databases:

1. provision the database
2. run Prisma migrations from the committed `prisma/migrations` directory
3. generate Prisma Client

From that point on, the migration directory is the canonical database history.

## Workflow Policy

### Development workflow

After this baseline lands:

- schema changes must be created through `prisma migrate dev`
- Prisma Client refresh remains required through `prisma generate`
- changes to `schema.prisma` without a matching migration are incomplete work

### Deployment workflow

For staging and production:

- use `prisma migrate deploy`
- do not use `prisma migrate dev`
- do not rely on `db push` as a deployment tool

### Version policy

Prisma stays on the current `6.16.2` line for this work. Baseline creation and migration-process standardization should be isolated from any major-version upgrade.

## Scripts And Documentation

### Scripts

Add explicit package scripts so the migration workflow is discoverable:

- `db:status`
- `db:validate`
- `db:deploy`

### Documentation changes

Update:

- `README.md` for daily-use migration commands

Add:

- `docs/runbooks/prisma-migrations.md` for baseline adoption, new-environment setup, and operational safety rules

The README should stay short and practical. The runbook should hold the one-time baseline and operational detail.

## Verification Strategy

The baseline rollout should prove:

- Prisma schema is valid
- Prisma Client can still be generated
- migration status is readable through Prisma
- the app still passes lint, tests, and production build

If the local environment allows DB access, baseline adoption should also verify that the live database and schema have no unexpected drift before `resolve --applied`.

## Operational Guardrails

- never mark a baseline as applied before comparing live DB structure to the Prisma schema
- never execute baseline SQL against a populated aligned database just to “be safe”
- never mix baseline work with a Prisma major-version upgrade
- never treat `schema.prisma` edits alone as a complete database change after this baseline lands

## Success Criteria

This work is complete when:

- the repository has a committed Prisma migration baseline
- the project has documented instructions for existing-db adoption and new-db initialization
- package scripts expose status, validation, and deploy commands
- local verification passes after the change
- future schema changes have a clear, enforced migration path
