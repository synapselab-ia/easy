# Easy V2 — Decision Ledger

**Updated:** 2026-08-18

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work; do not develop V2 in `viniciuscasarin/easy`.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, and isolated work branches derive from `develop`.

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
Wrong-value/wrong-reseller correction creates a replacement and reverses the original atomically with bidirectional linkage. Under D-016, any future local `actorRef` identifies an installation rather than a verified person.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
**Date:** 2026-08-17

`occurredAt` is the business/financial date, `createdAt` is registration time, and `reversal.reversedAt` is audit time. Dexie indexes `occurredAt`; missing legacy occurrence migrates as `occurredAt = createdAt`. Linked correction preserves original financial occurrence unless a later accepted correction contract explicitly changes that rule.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

Period statements use opening balance before start, inclusive-range effective movements and closing = opening + movement. Zero-movement periods remain valid. Dashboard total debt sums only positive reseller balances. Debt aging derives effective open order lots with payments/signals consuming oldest debt first; reversed rows have zero effect.

## D-016 — V2 remains local-first/single-user on browser-local Dexie until an explicit cloud trigger is proven
**Status:** ACCEPTED  
**Date:** 2026-08-17  
**Clarified:** 2026-08-18 by D-025 implementation

No backend, authentication, cloud database or synchronization layer is introduced under currently evidenced requirements. Reconsider D-016 only if direct requirements mandate concurrent operators, automatic live multi-device sharing, person-level authorship/access control, remote recovery SLA, trusted server integrations or a security policy incompatible with browser-local storage.

D-016 constrains **persistence topology**, not the internal Dexie schema number. Local additive schema migrations such as V4→V5 under D-025 do not reopen D-016.

## D-017 — Backup v2 is the canonical logical recovery contract; destructive restore requires successful preflight
**Status:** ACCEPTED / EXTENDED BY D-025  
**Date:** 2026-08-17

`easy-backup` version 2 is the logical interchange/recovery contract independent from Dexie schema version. Legacy v1 remains supported through in-memory normalization. Destructive restore is ineligible until preflight validates envelope/source/version, required fields, duplicates/IDs/dates/positive values, references, lifecycle, correction links and occurrence chronology.

D-025 implementation preserves logical version 2 while current exports use `source.schemaVersion = 5`, include `data.categories[]` and optional category references/snapshots. Existing v2/schema4 inputs remain supported through lossless normalization without fabricated categories.

## D-018 — Restore requires a downloaded validated checkpoint and one verified atomic Dexie transaction
**Status:** ACCEPTED / EXTENDED BY D-025  
**Date:** 2026-08-17

Before destructive restore, Easy downloads a validated canonical v2 checkpoint. The verified atomic replacement boundary now covers `categories`, `items`, `resellers` and `transactions` in one Dexie `rw` transaction with post-write revalidation/canonical comparison. Any write/verification divergence throws and rolls back the complete four-table replacement.

## D-019 — Critical QA is mandatory for V2 integration and publication from main
**Status:** ACCEPTED  
**Date:** 2026-08-17

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

CI runs on PRs to `develop`/`main`, pushes to `develop` and manual dispatch. Publication from `main` requires `quality -> build -> deploy`. Objective failures block integration; recorded warning/harness debt does not weaken the gate. Functional run `32064801009` and post-merge `32065713920` passed.

## D-020 — P7 prioritizes operator-intent/error risks before convenience or cosmetic refinement
**Status:** ACCEPTED  
**Date:** 2026-08-17

P7 ranked demonstrated operator impact/error risk ahead of visual preference. QG-011 through QG-015 were resolved without broad redesign.

## D-021 — Repository evidence alone does not reopen D-016; ambiguous reseller mobile use requires direct store validation
**Status:** ACCEPTED  
**Date:** 2026-08-18

Repository evidence confirmed administrator desktop/mobile operation, PDF sharing and manual JSON portability but did not establish shared live state, accounts/permissions, concurrency, remote recovery SLA, trusted server integration or local-storage-incompatible security policy.

## D-022 — Direct store validation keeps D-016 for current operation; recovery durability and category reporting become evidence-backed roadmap inputs
**Status:** ACCEPTED  
**Date:** 2026-08-18

Direct store evidence confirms current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON portability/backup, no mandatory trusted server integration and modest scale. It also confirms severe device-loss/manual-backup exposure, category/classification/category-reporting needs and edit/correction friction. No D-016 trigger is proven.

## D-023 — P9 starts with recovery durability, then category contract, bounded correction gaps and occurrence-date usability verification
**Status:** ACCEPTED  
**Date:** 2026-08-18

Accepted order:

1. recovery durability / off-device protection — **94/100**;
2. item categories + classification + category-level reporting — **83/100**;
3. exact transaction edit/correction microflows — **70/100**;
4. occurrence-date discoverability/usability — **69/100**.

Detailed scoring remains in `docs/V2/P9_PRIORITIZATION.md`.

## D-024 — Recovery durability uses a synchronized recovery-copy folder plus a 24-hour freshness guard; D-016 remains local-first
**Status:** ACCEPTED / IMPLEMENTED  
**Date:** 2026-08-18

The accepted target is a newest usable off-device copy no more than **24 hours** old, with manual operator-run restoration on any computer acceptable and daily-use continuity without inventing numeric RTO.

Selected mechanism:

- preserve canonical `easy-backup` v2 and D-018 restore semantics;
- backup downloads use a local folder covered by OS/provider synchronization; Google Drive for desktop is the accepted current-store instance;
- require one setup verification that an exported backup is visible off the local-PC-only context;
- track local recovery-copy export freshness fail-safe;
- at 24 hours, block normal data-changing work until a new export while keeping Backup/Restore reachable;
- Easy confirms generation/download initiation, not provider-side synchronization completion.

D-016 is **KEPT**. No Drive API/OAuth, backend/auth/cloud database/live sync, required File System Access API or provider-side acknowledgment is introduced.

Accepted P9-S2-I1 run `32180250834`, job `95851336506` passed; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

## D-025 — Category classification is snapshot-based; legacy history is not retroactively invented
**Status:** ACCEPTED / I1 IMPLEMENTED  
**Date:** 2026-08-18

Accepted semantics:

- category is a stable-ID entity with reversible archive/reactivation lifecycle; rename preserves identity;
- active-item assignment targets active categories and reassignment affects future orders only;
- category-aware future orders preserve both `categoryId` and `categoryName` as transaction-time snapshot;
- legacy V4 items/orders migrate without fabricated category assignments or historical snapshots;
- legacy orders without snapshot remain valid as `Sem categoria — histórico legado`;
- category analysis uses only effective orders and `occurredAt`, with order count, quantity and gross value minimums;
- reseller payments/signals, balances and FIFO debt are not allocated to categories;
- persistence target is Dexie V5 with `categories` and optional category fields during legacy compatibility;
- D-017 stays logical `easy-backup` v2; schema5 adds category data while v1 and v2/schema4 remain supported;
- D-018 atomic restore includes categories/items/resellers/transactions.

### Contract proof

Final PR #44 closure D-019: run `32185226251`, job `95867186002`, merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312` — 0 errors / 80 warnings, 44/183 Vitest, 17/17 Playwright, build PASS. PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`; validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

### P9-S3-I1 implementation proof

I1 implements only the persistence/recovery substrate:

- Dexie V5 categories and optional item/transaction category fields;
- additive V4→V5 migration with no category/history backfill;
- v2/schema5 category export/preflight plus v1/v2-schema4 normalization;
- D-018 four-table checkpoint/restore/read-back verification;
- category/unclassified/legacy counts in backup preview;
- correction preservation of already-existing category snapshots;
- no category management/classification flow, no new-order category snapshot generation and no category reporting yet.

Accepted functional D-019: run **`32191018791`**, job **`95885134808`**, PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d` — **0 errors / 81 warnings, 47/195 Vitest, 17/17 Playwright, build PASS**. The final canonical-documents head still requires D-019 before integration.

No new decision number is required for I1 because it implements the already accepted D-025 contract.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- which source-proven correction gaps are real high-value store cases in P9-S4;
- controlled beta/migration/cutover policy in P10.