# Easy V2 — Decision Ledger

**Updated:** 2026-08-19

Only accepted decisions belong here. Open questions remain in `STATUS.md`/`BACKLOG.md`.

---

## D-001 — V2 laboratory repository
**Status:** ACCEPTED  
Use `synapselab-ia/easy` for V2 work.

## D-002 — Branch roles
**Status:** ACCEPTED  
`main` is stable reference, `develop` is V2 integration, isolated work branches derive from `develop`.

## D-003 — P0 is governance-only
**Status:** ACCEPTED.

## D-004 — Legacy task checkboxes are historical
**Status:** ACCEPTED.

## D-005 — No full rewrite by default
**Status:** ACCEPTED.

## D-006 — Dexie/IndexedDB remains baseline until P4
**Status:** ACCEPTED / SUPERSEDED BY D-016.

## D-007 — Preserve financial history over destructive deletion
**Status:** DIRECTION ACCEPTED.

## D-008 — Centralize financial domain rules over time
**Status:** DIRECTION ACCEPTED.

## D-009 — Reseller lifecycle is reversible archive
**Status:** ACCEPTED.

## D-010 — Item lifecycle is reversible archive
**Status:** ACCEPTED.

## D-011 — New references are strict; historical rows are preserved
**Status:** ACCEPTED.

## D-012 — Financial correction uses audited reversal
**Status:** ACCEPTED  
Preserve original row, require reversal reason/timestamp, keep reversed rows visible with zero financial effect.

## D-013 — Replacement correction is atomic, linked and actor-neutral under D-016
**Status:** ACCEPTED  
Wrong-value/wrong-reseller correction creates a linked replacement and reverses the original atomically. Historical rows are not destructively rewritten.

## D-014 — Financial occurrence is distinct from registration/audit time
**Status:** ACCEPTED  
`occurredAt` is business time, `createdAt` registration time, `reversal.reversedAt` audit time.

## D-015 — Statements and FIFO debt aging
**Status:** ACCEPTED  
Statements use opening → movements → closing. Debt aging consumes effective order debt FIFO; reversed rows have zero effect.

## D-016 — V2 remains local-first/single-user until an explicit cloud trigger is proven
**Status:** ACCEPTED  
No backend/auth/cloud DB/live sync is introduced without direct evidence proving a reopen trigger. Local Dexie schema evolution does not itself reopen D-016.

## D-017 — Backup v2 is the canonical logical recovery contract
**Status:** ACCEPTED / EXTENDED BY D-025  
Logical `easy-backup` version 2 remains independent of Dexie schema version; current exports are schema5 and legacy inputs remain losslessly supported.

## D-018 — Restore requires validated checkpoint + verified atomic Dexie replacement
**Status:** ACCEPTED / EXTENDED BY D-025  
Atomic recovery covers categories/items/resellers/transactions with post-write verification.

## D-019 — Critical QA is mandatory
**Status:** ACCEPTED

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

Objective failures block integration.

## D-020 — P7 prioritizes operator-intent/error risks
**Status:** ACCEPTED.

## D-021 — Repository evidence alone does not reopen D-016
**Status:** ACCEPTED.

## D-022 — Direct store validation keeps D-016 and confirms recovery/category/correction needs
**Status:** ACCEPTED.

## D-023 — P9 evidence-backed ordering
**Status:** ACCEPTED  
Order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

## D-024 — Synchronized recovery-copy folder + 24-hour freshness guard
**Status:** ACCEPTED / IMPLEMENTED  
Keeps D-016, canonical backup/restore and operator-run recovery; no Drive API/OAuth/backend/cloud/live sync introduced.

## D-025 — Category classification is snapshot-based; legacy history is not retroactively invented
**Status:** ACCEPTED / FULLY IMPLEMENTED AND INTEGRATED  
**Date:** 2026-08-18  
**Implementation completed:** 2026-08-19

Accepted and implemented semantics:

- stable category identity with reversible lifecycle;
- active-category item classification and future-only reassignment effect;
- new-order `categoryId + categoryName` transaction-time snapshots;
- lossless legacy migration with no fabricated category history;
- legacy no-snapshot orders remain valid as `Sem categoria — histórico legado` in reports;
- order-only category analysis uses `occurredAt`, historical `transaction.categoryId`, order count, quantity and gross value;
- effective linked correction contributes only through the non-reversed replacement;
- archived categories remain reportable;
- payments/signals/balances/FIFO debt are not allocated to categories;
- Dexie V5 + logical backup v2/schema5 + four-table D-018 restore remain authoritative.

### Implementation proof

- Contract: D-019 `32185226251` / `95867186002`; PR #44 `ede644b88ad00c11b566d82a21758cc82b7a8126`.
- I1: final D-019 `32191707306` / `95887236403`; PR #45 `d55b13bf5efedb12da937e70afe1e9501d83446b`.
- I2: final D-019 `32202876262` / `95920142630`; PR #46 `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 `4191df77db83258f1125bffd445a6ec1f5b46bf9`.
- I3 functional: `32261923163` / `96096954271` — PASS.
- I3 final documentation-complete: **`32262877105` / `96100129962`**, merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, head `b7e76e56c8049a002243fc693891880ba6bf0a50` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9` — **0 errors / 81 warnings; 51 files / 210 Vitest; 17/17 Playwright; build PASS**.
- PR #48 integrated as **`08ad2973f387035301901f9f46b0c78039796c2d`**.
- Validated merge ref and integrated squash share exact tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

No new decision number was required for I3 because it implemented D-025 without changing its contract.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- which source-proven correction gaps are genuinely missing high-value store cases in P9-S4;
- controlled beta/migration/cutover policy in P10.
