# Database Backup and Restore Runbook

Date: 2026-03-11
System: Atlas AI Directory (PostgreSQL + Prisma)
Environment: staging/production

## 1. Objectives

- Ensure reliable point-in-time recovery for launch-critical data.
- Verify restore procedures before public launch.
- Define clear RTO/RPO with owners.

## 2. Data Priority

Tier-1 tables (highest priority):
- `Tool`
- `AffiliateLink`
- `ClickEvent`
- `User`
- `Submission`

Tier-2 tables:
- `Category`, `ToolCategory`, `AffiliateProgram`, `ToolPrice`, `Comparison`, `Workflow`.

## 3. Backup Policy

Frequency:
- Full backup: daily at low-traffic window.
- Optional WAL/PITR: continuous if provider supports it.

Retention:
- Daily backups: 7 days.
- Weekly backups: 30 days.

Storage:
- Encrypted backup storage.
- Separate region/bucket from primary DB when possible.

Ownership:
- Primary: DevOps/Infra owner.
- Secondary: Engineering on-call backup owner.

## 4. Pre-Flight Validation

Run before backup/restore drills:

```bash
npm run db:generate
```

Expected:
- Prisma client generation succeeds without schema errors.

## 5. Backup Procedure (Provider-agnostic)

1. Confirm DB health (connections, replication, disk).
2. Create backup snapshot/dump.
3. Record backup metadata:
   - timestamp
   - DB instance
   - size
   - checksum/hash
4. Store backup in encrypted backup location.
5. Verify backup artifact readability.

## 6. Restore Drill Procedure (Staging)

1. Provision clean staging DB instance.
2. Restore from latest backup.
3. Run post-restore checks:
   - table existence for Tier-1 tables
   - row count sanity against expected range
   - random record spot checks for `Tool`, `AffiliateLink`, `ClickEvent`
4. Start app against restored DB and run smoke commands:

```bash
npm run build
npm test
```

5. Validate key app flows manually:
- `/tools`
- `/best-ai-automation-tools`
- `/admin/affiliate`
- outbound redirect path

## 7. Recovery Targets

RTO target:
- <= 60 minutes for production recovery.

RPO target:
- <= 24 hours without PITR.
- <= 15 minutes with PITR enabled.

## 8. Incident Recovery Checklist

1. Declare DB incident and incident owner.
2. Stop write-heavy operations if needed.
3. Select restore point and approve restore.
4. Restore database.
5. Run integrity checks and smoke tests.
6. Re-enable application traffic.
7. Monitor error rate and analytics writes for 2 hours.
8. Publish incident summary and corrective actions.

## 9. Drill Log Template

- Drill date:
- Backup source timestamp:
- Restore start/end time:
- Actual RTO:
- Actual RPO:
- Validation results:
- Issues found:
- Follow-up owner and ETA:

## 10. Launch Requirement

Public launch is blocked unless:
1. At least one successful restore drill is documented.
2. RTO/RPO are measured and accepted.
3. Backup ownership and on-call responsibility are assigned.
