# Easy V2 — P10 Controlled Beta / Migration / Cutover Plan

**Status:** `P10-S1 DONE / ACCEPTED; I1 DONE / INTEGRATED; I2 DONE / REHEARSED; P10-S2 NOT_STARTED`  
**Date:** 2026-08-19  
**Scope:** controlled progression from validated V2 candidate toward beta/cutover; every data/publication boundary remains explicit and fail-closed

## 1. Purpose

P10 moves the completed V2 from integration state toward controlled store use without treating a deploy, branch merge or synthetic rehearsal as proof that actual production-data migration and cutover are safe.

P10-S1 is now complete. It established backup/correction compatibility and proved the stable-v1→V2 migration/recovery mechanism on a deployed candidate using synthetic data only.

This document still does **not** authorize production cutover, publication of V2 from `main`, canonical URL switching, a persistence-architecture change, or concurrent operation across origins.

The next bounded action is to define and accept the P10-S2 copied-live-data beta gate **before** any real store backup is exported or imported.

## 2. Stable repository and persistence baseline

### Stable repository state

- `main` remains the stable/original application at commit **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**.
- P10-S1-I2 rehearsed candidate `develop` SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**.
- Candidate integrated tree: **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.
- Both `main` and `develop` remain unprotected in GitHub, so branch protection cannot be assumed to enforce the cutover gate automatically.

### Stable publication path

Current `main` publishes the historical application to GitHub Pages on push. Its present historical workflow builds/deploys without the V2 D-019 quality job.

The V2 version of `.github/workflows/deploy.yml` on `develop` already defines the stronger eventual stable path:

```text
push main
  -> quality / npm run qa:critical
  -> build
  -> deploy
```

That workflow remains inactive on stable `main` until a future explicitly accepted stable-publication step.

### Persistence and transfer boundary

Stable `main` uses `ResellerManagerDB` Dexie V1 with `items`, `resellers`, `transactions` and exports backup version 1.

V2 uses Dexie V5 with `categories`, `items`, `resellers`, `transactions` and canonical `easy-backup` v2/schema5.

IndexedDB is browser-origin-local. Publishing V2 at another origin does not migrate stable data. The accepted transfer mechanism is explicit backup/preflight/restore.

V2 backup preflight accepts the stable backup-v1 envelope and normalizes it without inventing history:

- legacy items/resellers without lifecycle state become active;
- legacy transactions without `occurredAt` use historical `createdAt` as occurrence time;
- no categories or historical category assignments are fabricated;
- migrated legacy items remain unclassified until operator classification;
- new orders remain blocked for unclassified active items under D-025/P1.

### Recovery boundary

D-024 remains authoritative on any V2 origin:

- restore/backup remains reachable when recovery-health metadata is absent;
- normal writes are blocked while recovery state is unknown/due/overdue;
- after restore on a fresh origin, a fresh validated backup must be created and the synchronized-copy location explicitly verified before normal writes may continue.

No provider-side sync acknowledgment is implied.

## 3. P10-S1-I1 — backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED` — 2026-08-19.

P10-S1-I1 resolved the pre-cutover blocker where backup validation still imposed pre-D-026 equality across correction pairs.

Current correction-pair backup rules:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
- an order replacement may select another valid item and carry that item's valid replacement-time category snapshot;
- if an order replacement keeps the same `itemId`, D-025 requires the original historical category snapshot to remain unchanged;
- replacement/original IDs must exist;
- correction/reversal linkage remains bidirectional and non-self-referential;
- replacement registration cannot predate original registration;
- every row must satisfy its own reseller/item/category references and target-type shape.

Because `exportData()` self-preflights the generated envelope, ordinary supported D-026 corrections remain recoverable/exportable.

Backup-v1 and v2/schema4 compatibility remain passing; no schema or backup-envelope version changed.

### I1 validation history

Initial D-019 `32292405631` / `96196002726` correctly blocked integration because the first implementation over-relaxed D-025 same-item snapshot preservation.

Authoritative proof after narrowing:

- PR #60 D-019 **`32292888925`**, job **`96197514379`**;
- merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**;
- 0 lint errors / 82 warnings;
- 53 files / 222 Vitest PASS;
- 17/17 Playwright PASS;
- production build PASS;
- PR #60 integrated as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated/integrated tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

## 4. P10-S1-I2 — non-production migration/recovery rehearsal

**Status:** `DONE / REHEARSED` — 2026-08-19.

### Candidate identity

P10-S1-I2 used the current validated V2 candidate:

- Vercel project: `easy-v2`;
- READY deployment: **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`**;
- exact Git SHA: **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**;
- candidate tree: **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.

The immutable deployment URL `easy-v2-lvbggu5ji-synapselabia-8285s-projects.vercel.app` requires Vercel SSO for `/backup`. Vercel metadata attaches public alias `easy-v2-tau.vercel.app` to the same exact deployment. The alias was therefore used only as a browser-access route; deployment ID and Git SHA remained the identity proof.

### Rehearsal data boundary

Only synthetic/non-production backup-v1 data was used:

- 2 fabricated legacy items;
- 2 fabricated resellers;
- 3 fabricated legacy transactions (order, payment and signal);
- intentionally missing lifecycle/category/`occurredAt` fields representative of the stable-v1 migration boundary.

No actual store backup was exported, uploaded, restored, inspected or reconciled.

### Authoritative evidence

Evidence-only PR #62 ran a temporary branch-local remote Playwright harness after ordinary D-019. It was closed **without merge** after evidence capture.

Authoritative run:

- **`32298906351`**, job **`96216688953`**;
- exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**;
- harness head `5e5eaea8fbc51bf52c3e5bfc927b6da178082bda` over candidate base `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`.

D-019 passed first:

- ESLint: 0 errors / 82 warnings;
- Vitest: 53 files / 222 tests PASS;
- repository Playwright: 17/17 PASS;
- production build: PASS.

Remote rehearsal then passed **1/1**.

### Rehearsal assertions proven

1. Candidate `/backup` loaded through the verified deployment's public alias.
2. Initial D-024 state was unknown.
3. Synthetic backup-v1 preflight identified v1→v2 in-memory migration.
4. Legacy counts normalized to 2 items / 2 resellers / 3 transactions with no categories invented.
5. Missing lifecycle normalized active; missing `occurredAt` normalized to historical `createdAt`; legacy order category history stayed absent.
6. Restore completed with checkpoint download.
7. A normal write before recovery setup was blocked by D-024.
8. Fresh V2 export plus explicit synchronized-copy verification established current recovery health.
9. A migrated active but unclassified item remained blocked from new-order entry.
10. A representative category was created and both migrated items classified.
11. A supported new order was recorded.
12. D-026 audited correction changed the order item and occurrence date while preserving original/replacement linkage.
13. Final V2 backup contained 1 category / 2 items / 2 resellers / 5 transactions and valid correction/reversal state.
14. A disposable fresh browser context preflighted/restored that final V2 backup and re-exported identical business data.

### Diagnostic attempts retained but not accepted

- `32297959050` / `96213645569`: D-019 passed; immutable URL SSO stopped app access before upload/restore.
- `32298286885` / `96214717360`: D-019 passed; app/v1 preflight was reached, but Playwright viewport actionability blocked restore dispatch.

Neither diagnostic attempt is product acceptance evidence.

### I2 result

**GO only for defining the next bounded copied-live-data beta gate.**

P10-S1-I2 does not authorize copying real store data, production-data reconciliation, stable publication, canonical URL switching, production cutover or D-016 change.

## 5. D-027 / P10-S1 acceptance result

P10-S1 is now `DONE / ACCEPTED` as a non-production pre-cutover gate.

It proved:

1. backup/recovery accepts supported D-026 correction state;
2. stable-v1→V2 normalization/restore works on an exact deployed candidate;
3. D-024 recovery gating works on a fresh restored origin;
4. legacy classification gating behaves as designed;
5. supported transaction/correction state remains exportable and restorable;
6. a fresh-context V2 round-trip preserves business data.

It did **not** prove actual production-data reconciliation or operator acceptance on a copy of the real store dataset.

## 6. P10-S2 — copied-live-data beta acceptance gate

**Status:** `NOT_STARTED` — **NEXT CONTRACT ACTION ONLY**.

Before any real store backup is exported or imported, P10-S2 must define and canonically accept the minimum non-production beta contract.

The contract-definition action must reconstruct and specify at least the following dimensions without moving data yet:

### Data handling

- exact purpose and permitted use of the copied store dataset;
- where the copy may exist during beta;
- who/operator contexts may access it;
- whether any local/downloaded checkpoint or exported artifact is retained and for how long;
- explicit prohibition on external sharing or unrelated use.

### Reconciliation

Define objective evidence required after a future copy-based restore, such as:

- item/reseller/transaction counts;
- effective financial totals/balances;
- migration warnings/unclassified-item counts;
- representative historical spot checks where needed;
- accepted tolerance, which should normally be exact unless the contract documents a justified non-zero tolerance.

These exact criteria are **not yet accepted**; defining them is the next action.

### Recovery

Define how D-024 recovery readiness must be established on the copied-data beta origin before normal beta writes, and what recovery artifacts/evidence must be retained.

### Operator access and isolation

Define how the beta remains non-production and how operator actions are prevented from being mistaken for stable-store writes. The stable application remains authoritative during this beta gate unless a later cutover decision says otherwise.

### Rollback / no-go

Define the response if restore, reconciliation, recovery setup or operator checks fail. At minimum, failure must not require modifying `main` or the live stable dataset.

### Disposal

Define how copied real data and temporary beta artifacts are removed when the beta ends or is rejected, consistent with the approved data-handling boundary.

### Explicit go/no-go

Define the evidence package needed before the actual copied-live-data beta may start, and separately the evidence needed before any later production cutover gate may be proposed.

## 7. What remains explicitly unauthorized

Until the P10-S2 contract is accepted, the following are not authorized:

- exporting/importing the actual live-store dataset;
- executing an operator beta using copied production data;
- reconciling actual production data in V2;
- final write freeze;
- merging/publishing V2 from `main`;
- switching the store's canonical URL;
- production cutover;
- rollback after V2 has accepted production writes;
- decommissioning the original stable application;
- changing D-016 topology.

## 8. Immediate next action

Define and accept only **P10-S2 — copied-live-data beta acceptance gate** before any real store backup is exported or imported.

Reconstruct the minimum data-handling, operator-access, reconciliation, recovery, rollback and disposal criteria for a non-production beta using a copy of live-store data and specify explicit go/no-go evidence.

Do not move live-store data while defining the gate. Do not modify or publish `main`, do not perform stable publication, production cutover or canonical URL switch, and do not change D-016.
