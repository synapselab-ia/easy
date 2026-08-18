# Easy V2 — Decision Ledger

**Updated:** 2026-08-18

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

Repository-wide critical validation is one reproducible command:

```text
npm run qa:critical
  -> npm run lint
  -> npm run test:run
  -> npm run test:e2e
  -> npm run build
```

CI/deploy uses Node 22, `npm ci` and explicit Playwright Chromium installation. `.github/workflows/ci.yml` runs Critical QA on pull requests targeting `develop` or `main`, on pushes to `develop`, and by manual dispatch. A push to `main` may publish GitHub Pages only through `quality -> build -> deploy`.

P6 also established that failing QA output must be classified before product behavior is changed. Stale expectations may be reconciled to already accepted behavior; real regressions must be fixed without violating P1–P5 semantics. Objective ESLint errors remain blocking; explicitly recorded legacy warning debt does not redefine a passing gate.

Persistent functional run `32064801009` and post-merge `develop` run `32065713920` pass the accepted gate.

## D-020 — P7 prioritizes operator-intent/error risks before convenience or cosmetic refinement
**Status:** ACCEPTED  
**Date:** 2026-08-17

P7-S1 inspected current operator-facing flows, tests and the Project Spec usability objective. P7 work is prioritized by demonstrated operational impact, error risk and routine frequency, not by visual preference.

Accepted ranking:

1. **Transaction-entry intent and feedback** — highest priority. The standalone Cancel action is inert; transaction mutation failures are console-only; and the command-center `Pagamento/Sinal` shortcut always initializes `payment`, risking loss of the operator’s intended audit classification.
2. **Invalid reseller statement range UX** — a complete inverted period silently falls back to all-time/current view until PDF generation surfaces the error.
3. **Stale recovery page copy** — top-level Backup page text still describes restore as future/preflight-only even though P5-S2 restore exists.
4. **Item/reseller save error feedback** — mutation failures are console-only.
5. **Reseller-context launch friction** — transaction creation requires redundant reseller reselection from a reseller detail context.

Broad redesign, dashboard rearrangement, theme/branding changes, table-density preferences and convenience features without demonstrated operational impact are not P7 priorities merely because they could improve polish.

### First implementation slice

P7-S2 is limited to the transaction-entry cluster:

- Cancel must actually reset/clear the in-progress standalone transaction form while preserving the requested initial type;
- transaction mutation failure must be visible to the operator and must not erase entered data needed for correction/retry;
- payment and signal command-center shortcuts must be separate and preserve the intended transaction type.

This decision does **not** change P1–P6 financial, persistence, recovery or QA semantics and does not authorize bundling the lower-ranked P7 gaps into P7-S2.

## D-021 — Repository evidence alone does not reopen D-016; ambiguous reseller mobile use requires direct store validation
**Status:** ACCEPTED  
**Date:** 2026-08-18

P8-S1 reviewed the original prompts, historical PRDs, current canonical baseline, README and repository issues. The evidence confirms administrator desktop/mobile operation, local browser persistence, PDF sharing and manual JSON backup/portability. A later responsiveness requirement also describes a reseller consulting their own statement on mobile.

That later role wording is material, but it does not specify concurrent operators, a shared live dataset, accounts/permissions, person-level authorship or automatic synchronization. No inspected artifact establishes a remote recovery SLA, trusted server integration or security policy incompatible with browser-local storage. No separate real-store interview/observation artifact was found in the repository.

Therefore **none of the explicit D-016 reopen triggers is proven by P8-S1**. D-016 remains authoritative and no backend/auth/cloud/synchronization or persistence migration is authorized.

Before any architecture reconsideration, direct real-store evidence must resolve who operates the system, which devices share a dataset, whether shared state must be live/automatic, whether permissions or verified authorship are required, acceptable recovery loss/time, required server integrations and any security/privacy constraints. Detailed P8-S1 evidence is recorded in `docs/V2/P8_DISCOVERY.md`.

## D-022 — Direct store validation keeps D-016 for current operation; recovery durability and category reporting become evidence-backed roadmap inputs
**Status:** ACCEPTED  
**Date:** 2026-08-18

P8-S2 resumed after a direct stakeholder supplied the real-store evidence packet in the project conversation.

### Current operating model

Direct evidence confirms:

- Duda and store owners use Easy, without a current need for concurrent access to the same dataset;
- the current operating device is a PC, without a current requirement for the same live dataset on multiple devices simultaneously;
- resellers receive PDF/extracts and do not currently need interactive application access;
- JSON/manual off-device handling remains the current portability/recovery mechanism;
- no trusted server integration is currently mandatory;
- scale is modest, around 100 resellers maximum and about 50 active, with limited daily entry volume.

### D-016 trigger decision

No D-016 reopen trigger is proven by the direct evidence:

- **concurrent operators:** not required currently;
- **automatic live multi-device sharing:** not required currently;
- **person-level authorship/access control:** accounts/permissions are a conditional future preference, not a present mandatory requirement;
- **remote recovery SLA:** severe data-loss consequences are confirmed, but no numeric RPO/RTO or provider-operated recovery obligation is specified;
- **trusted server integrations:** none are currently required;
- **security policy incompatible with browser-local storage:** no competent policy evidence was supplied, so this remains unresolved rather than assumed false.

Therefore **D-016 remains accepted for the current operating mode**. P8-S2 does not authorize backend, authentication, cloud database, live synchronization or Dexie migration.

### Confirmed recovery risk

The current manual backup practice has a catastrophic failure mode: if the operating PC fails before the current JSON has been copied to Drive, the store may have to reconstruct tens of thousands of reais in sales. This establishes recovery durability/off-device protection as a high-severity product requirement for prioritization.

It does **not** establish a formal remote-recovery SLA. P9 may compare bounded recovery improvements, but any option that later proves a D-016 trigger must explicitly reopen the architecture decision before implementation.

### Confirmed product inputs

P8-S2 also confirms:

- items need categories;
- items need assignment to a category;
- reporting/analysis needs category-level filtering or aggregation;
- multiple edit/correction microflows are missing or difficult in real operation, but exact unsupported record/action pairs must be inventoried before implementation.

The stakeholder also described delayed entry of sales. Current V2 already supports an editable financial occurrence date (`occurredAt`), so P9 must treat this as discoverability/usability verification rather than inventing a second date model.

Broader accounts/permissions, automatic synchronization, inventory, order management and full store-system expansion remain future directions, not present mandatory requirements.

### Phase consequence

P8 can close after D-019 validation/integration of this evidence decision. The next slice is P9-S1 prioritization only; it must not implement a feature or architecture change.

---

# Open decisions

- D-016 local vs cloud only if later direct evidence proves a reopen trigger;
- P9 implementation order after P9-S1 scores the confirmed recovery/category/edit-flow inputs;
- controlled beta/migration/cutover policy in P10.