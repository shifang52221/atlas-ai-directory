# Prisma Migrations Runbook

## Purpose

This runbook defines the standard Prisma migration workflow for Atlas AI Directory.

Use it for:

- initializing a new local or deployed database from committed migrations
- adopting Prisma Migrate for an existing populated database
- making future schema changes without drifting away from version-controlled history

## Standard Rules

- Treat `prisma/migrations` as the canonical database history after the baseline lands.
- Use `npm run db:migrate` only for local development when creating a new migration.
- Use `npm run db:deploy` for staging and production environments.
- Do not use `db push` as the standard deploy path.
- Do not mark a migration as applied before checking drift.
- Do not mix baseline adoption with unrelated schema refactors or a Prisma major-version upgrade.

## Local Docker Database Defaults

The checked-in Docker setup exposes PostgreSQL with:

```bash
DATABASE_URL=postgresql://ai_nav:ai_nav_password@localhost:5432/ai_nav
```

`npm run db:validate` falls back to this URL when `DATABASE_URL` is not set so schema validation still works in a fresh checkout. That fallback is for local validation only, not for production runtime configuration.

## New Database Setup

Use this path for a new local, staging, or production database that does not already contain application data.

```bash
npm run db:up
npm run db:migrate
npm run db:generate
```

For staging or production, replace `db:migrate` with:

```bash
npm run db:deploy
npm run db:generate
```

## Existing Database Baseline Adoption

Use this path when the database already contains data and must be preserved.

### 1. Back up the database

Do not baseline an existing database without a backup.

### 2. Check schema drift before resolving the baseline

```powershell
npx prisma migrate diff `
  --from-url "$env:DATABASE_URL" `
  --to-schema-datamodel prisma/schema.prisma `
  --exit-code
```

Interpretation:

- exit code `0`: the database structure matches the Prisma schema closely enough to continue
- exit code `2`: drift exists and must be resolved before baseline adoption
- exit code `1`: command failure; fix the environment or command first

If drift exists, stop here. Do not mark the baseline as applied until the live database and `prisma/schema.prisma` are aligned.

### 3. Mark the baseline migration as already applied

```powershell
npx prisma migrate resolve --applied 20260330_baseline
```

This records the baseline in Prisma's migration metadata without replaying the full baseline SQL against an already-populated aligned database.

### 4. Verify migration state

```bash
npm run db:status
npm run db:generate
```

If Prisma reports migration errors here, stop and investigate before making additional schema changes.

## Future Schema Change Workflow

After the baseline is adopted, every schema change should follow this sequence:

```bash
npm run db:migrate -- --name <change-name>
npm run db:generate
npm run db:validate
```

Then run the normal application verification pack:

```bash
npm run lint
npm test
npm run build
```

## Staging And Production Deploys

Use only committed migrations in non-local environments.

```bash
npm run db:deploy
npm run db:generate
npm run db:status
```

Do not use `prisma migrate dev` in staging or production.

## Failure Handling

- If `migrate diff` reports drift, stop and fix the schema mismatch before `migrate resolve`.
- If `db:deploy` fails, do not stack ad-hoc fixes on top of the failed state. Inspect the failing migration first.
- If `schema.prisma` changes without a matching migration file, treat the work as incomplete.

## Related Files

- `prisma/schema.prisma`
- `prisma/migrations/20260330_baseline/migration.sql`
- `prisma/migrations/migration_lock.toml`
- `docs/plans/2026-03-30-prisma-migration-baseline-design.md`
