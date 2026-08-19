# Easy V2 — Decision Ledger

**Updated:** 2026-08-19

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

D-016 constrains persistence topology, not the internal Dexie schema number. Local additive schema migrations such as V4→V5 under D-025 do not reopen D-016.

## D-017 — Backup v2 is the canonical logical recovery contract; destructive restore requires successful preflight
**Status:** ACCEPTED / EXTENDED BY D-025  
**Date:** 2026-08-17

`easy-backup` version 2 is the logical interchange/recovery contract independent from Dexie schema version. Legacy v1 remains supported through in-memory normalization. D-025 preserves logical version 2 while current exports use `source.schemaVersion = 5`, include `data.categories[]` and optional category references/snapshots. Existing v2/schema4 inputs remain supported without fabricated categories.

## D-018 — Restore requires a downloaded validated checkpoint and one verified atomic Dexie transaction
**Status:** ACCEPTED / EXTENDED BY D-025  
**Date:** 2026-08-17

Before destructive restore, Easy downloads a validated canonical v2 checkpoint. The verified atomic replacement boundary covers `categories`, `items`, `resellers` and `transactions` in one Dexie `rw` transaction with post-write revalidation/canonical comparison. Any write/verification divergence rolls back the complete replacement.

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

Objective failures block integration; warning/harness debt does not redefine a passing gate.

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

Selected mechanism preserves canonical `easy-backup` v2/D-018, uses a local folder covered by OS/provider synchronization, keeps Backup/Restore reachable at the 24-hour write boundary and does not introduce Drive API/OAuth, backend/auth/cloud DB/live sync or provider-side synchronization attestation.

Accepted P9-S2-I1 run `32180250834`, job `95851336506` passed; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

## D-025 — Category classification is snapshot-based; legacy history is not retroactively invented
**Status:** ACCEPTED / I1 + I2 INTEGRATED; I3 IMPLEMENTED + FUNCTIONALLY VALIDATED, FINAL INTEGRATION PENDING  
**Date:** 2026-08-18  
**Implementation update:** 2026-08-19

Accepted semantics:

- category is a stable-ID entity with reversible archive/reactivation lifecycle; rename preserves identity;
- active-item assignment targets active categories and reassignment affects future orders only;
- category-aware future orders preserve both `categoryId` and `categoryName` as transaction-time snapshot;
- legacy V4 items/orders migrate without fabricated category assignments or historical snapshots;
- legacy orders without snapshot remain valid as `Sem categoria — histórico legado`;
- category analysis uses only effective orders and `occurredAt`, with order count, quantity and gross value minimums;
- reseller payments/signals, balances and FIFO debt are not allocated to categories;
- persistence is Dexie V5 with `categories` and optional category fields for legacy compatibility;
- D-017 remains logical `easy-backup` v2 with schema5 category data and v1/v2-schema4 compatibility;
- D-018 atomic restore includes categories/items/resellers/transactions.

### Contract / I1 / I2 proof

- Contract: D-019 `32185226251`, job `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.
- I1: final D-019 `32191707306`, job `95887236403`; PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`.
- I2: final D-019 `32202876262`, job `95920142630`; PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; canonical post-merge closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

### P9-S3-I3 implementation proof — pending final integration

I3 implements D-025 without changing the decision:

- pure category order-performance aggregation over effective non-reversed orders;
- `transactionOccurredAt()` / `occurredAt` as the reporting time basis;
- grouping by historical `transaction.categoryId`, never current item category;
- explicit `Sem categoria — histórico legado` group for missing historical snapshots;
- order count, summed quantity and gross value;
- linked corrections count only the effective replacement;
- archived categories remain reportable;
- current category name may label the existing stable identity while `transaction.categoryName` remains immutable history;
- read-only `/category-report` operator flow;
- no payment/signal/balance/debt allocation, historical recategorization, profitability inference or persistence/backup change.

Functional D-019 `32261923163`, job `96096954271`, passed on PR #48 merge ref `02d656ea771e334622a6248139b508e20a98caf1`, head `01fcd986ed86fbe465592af3c5600a2570380ee8` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.

No new decision number is required for I3. D-025 status becomes fully implemented only after the documentation-complete head passes D-019 and the exact validated content is integrated into `develop`.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- which source-proven correction gaps are real high-value store cases in P9-S4;
- controlled beta/migration/cutover policy in P10.
