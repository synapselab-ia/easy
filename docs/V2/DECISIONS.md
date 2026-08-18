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

`occurredAt` is the business/financial date, `createdAt` is registration time, and `reversal.reversedAt` is audit time. Dexie V4 indexes `occurredAt`; missing legacy occurrence migrates as `occurredAt = createdAt`. Linked correction preserves the original financial occurrence unless a later accepted correction contract explicitly changes that rule.

## D-015 — Statements use opening → movements → closing; debt aging uses FIFO open-order allocation
**Status:** ACCEPTED  
**Date:** 2026-08-17

Period statements use opening balance before the start, inclusive-range effective movements and closing = opening + movement. Zero-movement periods remain valid. Dashboard total debt sums only positive reseller balances. Debt aging derives from effective open order lots with payments/signals consuming oldest debt first; reversed rows have zero effect.

## D-016 — V2 remains local-first/single-user on Dexie V4 until an explicit cloud trigger is proven
**Status:** ACCEPTED  
**Date:** 2026-08-17

No backend, authentication, cloud database or synchronization layer is introduced under currently evidenced requirements. Reconsider D-016 only if direct requirements mandate concurrent operators, automatic live multi-device sharing, person-level authorship/access control, remote recovery SLA, trusted server integrations or a security policy incompatible with browser-local storage.

## D-017 — Backup v2 is the canonical logical recovery contract; destructive restore requires successful preflight
**Status:** ACCEPTED  
**Date:** 2026-08-17

`easy-backup` version 2 is the logical interchange/recovery contract independent from Dexie schema version. Legacy v1 remains supported through in-memory normalization. Destructive restore is ineligible until preflight validates envelope/source/version, required fields, duplicates/IDs/dates/positive values, references, lifecycle, correction links and occurrence chronology.

## D-018 — Restore requires a downloaded validated checkpoint and one verified atomic Dexie transaction
**Status:** ACCEPTED  
**Date:** 2026-08-17

Before destructive restore, Easy downloads a validated canonical v2 checkpoint of the current database. Replacement of items/resellers/transactions then occurs in one Dexie `rw` transaction with read-back validation/canonical comparison; any write/verification error throws and rolls back the complete replacement. Targeted validation `32060729538` passed.

## D-019 — Critical QA is mandatory for V2 integration and publication from main
**Status:** ACCEPTED  
**Date:** 2026-08-17

Repository-wide critical validation is:

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

CI runs it on PRs to `develop`/`main`, pushes to `develop` and manual dispatch. Publication from `main` requires `quality -> build -> deploy`. Objective failures block integration; recorded warning/harness debt does not weaken the gate. Functional run `32064801009` and post-merge `32065713920` passed.

## D-020 — P7 prioritizes operator-intent/error risks before convenience or cosmetic refinement
**Status:** ACCEPTED  
**Date:** 2026-08-17

P7 ranked demonstrated operator impact/error risk ahead of visual preference. The accepted order was transaction-entry intent/feedback, invalid statement range, stale recovery copy, item/reseller save feedback and reseller-context transaction launch. QG-011 through QG-015 were resolved without broad redesign.

## D-021 — Repository evidence alone does not reopen D-016; ambiguous reseller mobile use requires direct store validation
**Status:** ACCEPTED  
**Date:** 2026-08-18

Repository evidence confirmed administrator desktop/mobile operation, PDF sharing and manual JSON portability but did not establish shared live state, accounts/permissions, concurrency, remote recovery SLA, trusted server integration or local-storage-incompatible security policy. Therefore no D-016 reopen trigger was proven by repository evidence alone.

## D-022 — Direct store validation keeps D-016 for current operation; recovery durability and category reporting become evidence-backed roadmap inputs
**Status:** ACCEPTED  
**Date:** 2026-08-18

Direct store evidence confirms current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON portability/backup, no mandatory trusted server integration and modest scale. No D-016 trigger is proven; security-policy incompatibility remains unresolved/not proven.

The same evidence confirms a severe device-loss/manual-backup continuity risk, category/classification/category-reporting needs, and edit/correction friction whose exact cases require inventory. Delayed entry already uses editable `occurredAt` and is not a missing date model. D-016 remains accepted for the current operating mode.

## D-023 — P9 starts with recovery durability, then category contract, bounded correction gaps and occurrence-date usability verification
**Status:** ACCEPTED  
**Date:** 2026-08-18

P9-S1 applies a weighted evidence-first score using operational consequence (35%), evidence confidence (30%), exposure/frequency (20%) and delivery confidence under accepted contracts (15%). Detailed scoring and source inventory are canonical in `docs/V2/P9_PRIORITIZATION.md`.

Accepted ranked inputs:

1. **Recovery durability / off-device protection — 94/100.** Device-loss consequence is catastrophic and directly confirmed. Current backup generation remains operator-initiated; the problem is dependence on a person remembering to create/move a fresh durable copy. P9-S2 must first establish a measurable operating recovery target and compare the smallest D-016-compatible mechanisms. A remote SLA/cloud requirement must not be invented.
2. **Item categories + classification + category-level reporting — 83/100.** Direct confirmed need. Because the current Dexie V4 `Item` model and canonical backup contract have no category dimension, P9-S3 must define lifecycle, assignment, historical/report semantics, migration and backup compatibility before implementation.
3. **Exact transaction edit/correction microflows — 70/100.** Direct evidence confirms friction but not exact store cases. Current source proves guided correction cannot change `occurredAt`, order item, transaction type or observation and cannot guided-correct an order whose original item is inactive. Items/resellers already have edit flows; transaction reversal plus reseller/value correction already exist. Source-proven absence must not be falsely attributed to Duda as a reported case. P9-S4 must first directly map these gaps to real operator work/error risk and then preserve D-012/D-013 audit semantics.
4. **Occurrence-date discoverability/usability — 69/100.** The creation form already exposes `Data da ocorrência` with explanatory text and persists `occurredAt`. P9-S5 may verify usability but must not rebuild P3 or invent a second date model.

Accounts/permissions, automatic live synchronization, inventory/orders/store-management and external integrations remain later candidates unless new direct evidence makes them mandatory. P9-S1 itself authorizes no runtime/schema/backend/cloud implementation.

## D-024 — Recovery durability uses a synchronized recovery-copy folder plus a 24-hour freshness guard; D-016 remains local-first
**Status:** ACCEPTED  
**Date:** 2026-08-18

The accepted direct recovery target is a newest usable off-device copy no more than **24 hours** old, with manual operator-run restoration on any computer acceptable and daily-use continuity required qualitatively without inventing a numeric RTO.

The selected smallest fit-for-purpose mechanism is **Synchronized recovery-copy folder + 24-hour freshness guard**:

- preserve canonical `easy-backup` v2 and D-018 restore semantics;
- configure backup downloads to a local folder covered by OS/provider synchronization; Google Drive for desktop is the accepted current-store instance;
- require one setup verification that an exported backup is visible in Drive outside the local-PC-only context;
- track local recovery-copy export freshness and treat missing metadata fail-safe as `unknown/due`;
- at 24 hours, require a new backup export before normal data-changing operation can continue while keeping Backup/Restore reachable;
- Easy confirms backup generation/download initiation, not provider-side synchronization completion.

D-016 is **KEPT**. No concurrent-operation, live multi-device, person-level access, provider-operated remote recovery, trusted-server integration or incompatible-security-policy trigger was proven. Direct Google Drive API/OAuth, backend/auth/cloud database/live synchronization and a required browser-specific File System Access path are not part of the baseline mechanism. D-017/D-018 remain unchanged; no Dexie V5 or backup-format change is authorized for freshness tracking.

Persistent Critical QA `32177687434`, job `95843265579`, passed on PR #37 merge ref `79552f7912307db88272e075b2320cade02f6f17`. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; validated merge ref and integration share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

The next bounded implementation slice is P9-S2-I1 and must stay within `docs/V2/P9_RECOVERY_DECISION.md`.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- category lifecycle/history/reporting contract in P9-S3;
- which source-proven correction gaps are real high-value store cases in P9-S4;
- controlled beta/migration/cutover policy in P10.