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
Wrong-value/wrong-reseller correction performs replacement creation and original reversal atomically with bidirectional linkage. Under D-016, any future local `actorRef` identifies an installation rather than a verified person.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

- `occurredAt` = financial/business occurrence;
- `createdAt` = registration/audit timestamp;
- `reversal.reversedAt` = reversal/correction audit timestamp;
- Dexie V4 indexes `occurredAt` and migrates missing legacy occurrence as `occurredAt = createdAt`;
- linked correction preserves original financial occurrence while creating new registration/reversal audit timestamps.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

P3-S2 defines one shared period statement: opening is effective signed balance before the start, movements are audit-visible rows inside the inclusive occurrence range, period movement uses shared financial effect, and closing = opening + movement. Zero-movement periods are valid.

Dashboard total debt is the sum of positive per-reseller balances. Debt aging is derived from effective open order lots; payments/signals consume oldest debt first (FIFO), excess credit carries forward, reversed rows have zero effect, and no persistent payment↔order link is invented.

## D-016 — V2 remains local-first/single-user on Dexie V4 until an explicit cloud trigger is proven
**Status:** ACCEPTED  
**Date:** 2026-08-17

Easy V2 keeps local-first, single-user persistence on Dexie V4 under the requirements currently evidenced. No backend, authentication, cloud database or synchronization layer is introduced. A future local `actorRef`, if materialized, is an opaque installation identity and must not be presented as verified human authorship.

D-016 must be explicitly reconsidered if real requirements mandate concurrent operators, automatic live multi-device sharing, person-level authorship/access control, remote recovery SLA, trusted server integrations, or a security policy incompatible with browser-local storage.

## D-017 — Backup v2 is the canonical logical recovery contract; destructive restore requires successful preflight
**Status:** ACCEPTED  
**Date:** 2026-08-17

P5-S1 defines `easy-backup` version 2 as a logical interchange/recovery format independent from physical IndexedDB layout. Backup version and Dexie schema version remain separate; the live database remains Dexie V4.

The historical `version: 1` JSON remains supported through in-memory normalization before validation: missing lifecycle state becomes active and missing `occurredAt` becomes `createdAt`. Unsupported versions are rejected.

A backup is not eligible for destructive restore until preflight validates envelope/source/version, required fields, IDs/duplicates, dates, positive values, table references, P1 lifecycle state, P2 reversal/correction linkage and P3 occurrence/correction chronology. Successful preflight returns normalized `Date`-backed rows and a preview without mutation.

## D-018 — Restore requires a downloaded validated checkpoint and one verified atomic Dexie transaction
**Status:** ACCEPTED  
**Date:** 2026-08-17

Before any destructive restore write, Easy creates a recoverable logical checkpoint of all live Dexie V4 tables, serializes it as the canonical `easy-backup` v2 envelope, validates it with the P5-S1 contract and downloads it as `easy-checkpoint-v2-<timestamp>.json`.

Restore consumes only the successful P5-S1 normalized result, revalidates it immediately before recovery, and replaces all three tables inside one Dexie `rw` transaction. Restored rows are read back, revalidated and compared against the expected canonical projection before commit. Any write/verification error throws inside the transaction and Dexie rollback preserves the complete prior database.

Targeted run `32060729538` satisfies the P5-S2 recovery gate.

## D-019 — Critical QA is mandatory for V2 integration and publication from main
**Status:** ACCEPTED  
**Date:** 2026-08-17

### One canonical critical command

Repository-wide critical validation is defined by one reproducible command:

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

CI/deploy uses Node 22, `npm ci` and explicit Playwright Chromium installation. A local or CI pass must execute the same ordered gate rather than substituting a smaller phase-specific matrix.

### Integration gate

`.github/workflows/ci.yml` runs Critical QA on pull requests targeting `develop` or `main`, on pushes to `develop`, and by manual dispatch. This is the persistent repository-wide V2 integration signal.

### Publication gate

A push to `main` may publish GitHub Pages only through:

```text
quality -> build -> deploy
```

The `quality` job executes `npm run qa:critical`; `build` depends on `quality`; `deploy` depends on `build`. Publication must therefore stop when critical validation fails.

### Baseline reconciliation policy

P6 established that failing QA output must be classified before product code is changed. Stale test/tooling expectations may be reconciled to already accepted behavior; real regressions must be fixed without violating P1–P5 semantics.

The P6 baseline contained both categories. Provider/router/mock/jsdom gaps, obsolete selectors/copy and the old zero-movement PDF expectation were stale QA assumptions. One real defect was found in global search: Dexie `useSearch` already owns result filtering while `cmdk` also applied its default internal filter. `CommandDialog` now disables the second filter (`shouldFilter={false}`), making the external result set authoritative.

### Lint debt policy

A green critical gate does not mean all warnings are erased. Objective ESLint errors remain blocking. Existing `no-explicit-any`, `react-hooks/set-state-in-effect` and `react-refresh/only-export-components` debt remains visible as warnings until intentionally refactored; P6 does not authorize behavior-changing refactors solely to reach zero warnings.

Persistent functional run `32064801009` passes the reconciled gate.

---

# Open decisions

- operational UX refinements after P7 evidence/prioritization;
- new modules after real requirements discovery (P8/P9);
- local vs cloud only if a D-016 reopen trigger is proven;
- controlled beta/migration/cutover policy in P10.
