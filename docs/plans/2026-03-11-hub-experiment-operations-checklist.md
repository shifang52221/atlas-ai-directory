# Hub Experiment Operations Checklist

- Date: 2026-03-11
- Scope: editorial hub A/B experimentation and weekly decision cycle

## 1) Window Consistency

- [x] Admin dashboard uses one selected window (`7d/30d/90d`) across:
  - experiment table
  - decision cards
  - hub trend chart
  - action recommendation queue

## 2) Threshold Configuration

- [x] Min impressions per variant configurable:
  - `AFFILIATE_HUB_MIN_IMPRESSIONS_PER_VARIANT`
- [x] Min absolute lift configurable:
  - `AFFILIATE_HUB_MIN_ABSOLUTE_LIFT`
- [x] Defaults:
  - impressions per variant: `20`
  - absolute lift: `10%`

## 3) Decision Export Trail

- [x] CSV export route:
  - `/api/admin/affiliate/experiments/export`
- [x] Access control:
  - admin-authenticated only
- [x] Export columns:
  - generated time
  - window
  - hub path/title
  - decision/reason
  - lift/p-value/confidence
  - A/B impression counts

## 4) Review Cadence

- Weekly runbook:
1. Select window (`30d` preferred for launch month).
2. Review variant totals + significant signals.
3. Export decision CSV and store as weekly artifact.
4. Apply action status changes (`TODO/TESTING/VERIFIED/DISMISSED`).
5. Re-check low-CTR hubs with recommendation queue.
