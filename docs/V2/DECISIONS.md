# Easy V2 — Decision Ledger

**Updated:** 2026-08-17

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work; do not develop V2 in `viniciuscasarin/easy`.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, and `feature/*` contains isolated work derived from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED  
P0 does not change runtime, finance, schema or UI behavior.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED  
Canonical status comes from V2 documents, merged code and QA evidence.

## D-005 — No full rewrite by default
**Status:** ACCEPTED  
Evolve working Easy incrementally; rewrite requires later evidence-backed decision.

## D-006 — Dexie/IndexedDB remains baseline until P4
**Status:** ACCEPTED / SUPERSEDED BY D-016  
No backend, Supabase or authentication before P4 decides persistence architecture.

## D-007 — Preserve financial history over destructive deletion
**Status:** DIRECTION ACCEPTED  
P1 preserves entity history and P2 preserves financial correction history.

## D-008 — Centralize financial domain rules over time
**Status:** DIRECTION ACCEPTED  
Balance, reversal, statement and aging semantics belong in shared domain rules rather than screen-specific calculations.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED  
Inactive identities stay historical; new activity is blocked and unsafe hard deletion is guarded.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED  
Inactive items remain traceable but unavailable for new orders; historical snapshots are preserved.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED  
New activity requires valid active references; historical rows are not destructively repaired.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Preserve original row, require reversal reason/timestamp, keep reversed rows visible with zero financial effect.

## D-013 — Replacement correction is atomic, linked and actor-neutral until P4
**Status:** ACCEPTED  
Wrong-value/wrong-reseller correction performs replacement creation and original reversal atomically with bidirectional linkage. No fabricated actor identity before P4.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

- `occurredAt` = financial/business occurrence;
- `createdAt` = registration/audit timestamp;
- `reversal.reversedAt` = P2 reversal/correction audit timestamp;
- Dexie V4 indexes `occurredAt` and migrates missing legacy occurrence as `occurredAt = createdAt`;
- linked correction preserves original financial occurrence while creating new registration/reversal audit timestamps;
- history/filter/PDF/dashboard temporal consumers use occurrence time.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

P3-S2 defines one shared period statement: opening is effective signed balance before the start, movements are all audit-visible rows inside the inclusive occurrence range, period movement uses shared financial effect, and closing = opening + movement. Zero-movement periods are valid.

Dashboard total debt is the sum of positive per-reseller balances. Debt aging is derived from effective open order lots; payments/signals consume oldest debt first (FIFO), excess credit carries forward, reversed rows have zero effect, and no persistent payment↔order link is invented. Debt age uses open-order occurrence: 0–6d recent, 7–30d attention, >30d critical. Dexie remains V4.

## D-016 — V2 remains local-first/single-user on Dexie V4 until an explicit cloud trigger is proven
**Status:** ACCEPTED  
**Date:** 2026-08-17

### Evidence reviewed

P4 reviewed the canonical V2 state and repository operating evidence:

- `tasks/prd-gestao-revendedores/prd.md` defines the product persona as one administrator/business owner, specifies Dexie/IndexedDB without backend, calls the application single-user local, and explicitly excludes authentication and cloud synchronization;
- `prompts/prompt1.md` requires local browser persistence and JSON export/import for backup and moving to another computer;
- `README.md` describes a 100% client-side, portable application with user-controlled data migration;
- `src/db/database.ts` contains the authoritative Dexie V4 model;
- `src/services/backupService.ts` makes JSON export/import the current recovery/portability mechanism;
- `src/hooks/useSearch.ts` also uses browser-local `localStorage` for recent state;
- `package.json` contains no authentication/cloud persistence client;
- `.github/workflows/deploy.yml` deploys only static assets to GitHub Pages.

There is no evidenced requirement for simultaneous multi-user writes, live shared state across locations/devices, centralized roles/access control, person-level authorship, trusted server integrations or a remote recovery SLA.

### Decision

Easy V2 keeps **local-first, single-user persistence on Dexie V4** as the accepted architecture.

- one authoritative dataset exists per browser profile/origin at a time;
- moving data between machines is an explicit backup/export → import operation, not synchronization;
- business data remains browser-local unless the operator explicitly exports it;
- static hosting is application delivery, not the business-data system of record;
- no backend, authentication, cloud database or synchronization layer is introduced by P4;
- no schema V5 is required by this decision.

### Users, devices and concurrency

The only evidenced operator is the administrator/business owner. Desktop/tablet responsiveness does not imply a shared multi-device dataset. No concurrent writer or conflict-resolution requirement exists in the evidence, so adding remote synchronization now would solve an unproven problem.

### Actor attribution

D-013's provider-neutral actor strategy is resolved for the accepted local architecture: if actor attribution is later materialized, `actorRef` should use a stable opaque **local installation identity** generated/stored client-side. It identifies the Easy installation, not a verified person.

Historical rows without `actorRef` remain valid. If the business later needs to distinguish multiple human operators, D-016 must be revisited; an installation ID must never be presented as person-level authorship.

### Security and privacy

Local-first avoids adding credentials, server secrets, remote authorization policy and a network data service. Reseller contact/financial data remains on the device/browser unless exported.

This does not eliminate risk: device compromise, browser/profile deletion, IndexedDB loss or mishandled plaintext backup files can expose or destroy data. P5 owns recovery/backup hardening; P6 owns deployment/QA controls.

### Offline behavior

Data reads/writes do not require a backend once the static app is loaded. P4 does **not** claim guaranteed offline startup because the project has no accepted service-worker/PWA cache contract.

### Local vs cloud tradeoff

**Local/Dexie advantages under current evidence:** minimal architecture, no recurring backend operations/cost, no auth/account-recovery surface, strong data locality, existing V4 compatibility, and no sync/conflict complexity.

**Local/Dexie risks:** device/browser-bound source of truth, manual backup responsibility, no automatic cross-device sync, no centralized access control or remote recovery.

**Cloud/auth advantages if later required:** shared live dataset, centralized recovery/access control, verified person-level identity, server integrations.

**Cloud/auth costs/risks:** backend/API/schema ownership, authentication/account recovery, authorization/RLS, secrets, monitoring, recurring service cost, network availability, offline/sync conflict semantics, migration and significantly larger QA/security scope.

Given current requirements, those costs are not justified.

### Reopen triggers

D-016 must be explicitly superseded before cloud/auth work if any of these becomes mandatory:

1. simultaneous writes by multiple operators;
2. automatic live sharing of one dataset across multiple devices/locations;
3. person-level authorship or centralized access control;
4. automatic remote backup/recovery with a defined availability/recovery expectation;
5. integrations requiring trusted server credentials/webhooks/execution;
6. organizational security policy incompatible with browser-local storage.

### Migration implications

Dexie V4 remains the canonical persisted dataset through P5. The backup format should become a versioned logical interchange contract rather than exposing physical IndexedDB assumptions.

Any later cloud migration must preserve:

- stable entity/transaction identity or provide deterministic ID mapping;
- P1 lifecycle/reference history;
- P2 reversal/correction links and audit metadata;
- P3 occurrence/statement/financial semantics;
- legacy rows without actor attribution.

Numeric auto-increment IDs are safe for the accepted single-authoritative-dataset model; they are **not** sufficient by themselves for independent multi-device writers. A future cloud decision must solve globally safe identity and conflict/cutover semantics before multi-writer operation.

### Phase consequence

P4 is complete. P5 may harden backup/restore on the accepted local-first architecture without introducing auth/cloud. Real store discovery in P8 may reopen D-016 only if it produces one of the explicit triggers above.

---

# Open decisions

- backup version/migration/restore-hardening details (P5);
- repository-wide QA and deployment gating (P6);
- operational UX refinements (P7);
- new modules after real requirements discovery (P8/P9);
- local vs cloud only if a D-016 reopen trigger is proven.
