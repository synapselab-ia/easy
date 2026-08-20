# Easy V2 — P10 Controlled Beta / Migration / Cutover Plan

**Status:** `P10-S1 DONE / ACCEPTED; I1 DONE / INTEGRATED; I2 DONE / REHEARSED; P10-S2 CONTRACT DONE / ACCEPTED; P10-S2-I1 NOT_STARTED`  
**Date:** 2026-08-20  
**Scope:** controlled progression from validated V2 candidate toward beta/cutover; every data/publication boundary remains explicit and fail-closed

## 1. Purpose

P10 moves the completed V2 from integration state toward controlled store use without treating a deploy, branch merge or synthetic rehearsal as proof that actual production-data migration and cutover are safe.

P10-S1 is complete. It established backup/correction compatibility and proved the stable-v1→V2 migration/recovery mechanism on a deployed candidate using synthetic data only.

P10-S2 contract definition is also complete. D-028 now defines the exact fail-closed conditions for a non-production beta using one point-in-time copy of the actual store dataset. No real store data moved while defining the contract.

This document still does **not** authorize production cutover, publication of V2 from `main`, canonical URL switching, a persistence-architecture change, or concurrent operation across origins.

The next bounded action is P10-S2-I1 copied-live-data beta execution under `docs/V2/P10_S2_BETA_GATE.md`.

## 2. Stable repository and persistence baseline

### Stable repository state

- `main` remains the stable/original application at commit **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**.
- P10-S1-I2 rehearsed candidate `develop` SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**.
- Candidate integrated tree: **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.
- Canonical P10-S1 closure integrated `develop` as **`816794694d0a9b6c92da273a81ee745c2f53ecdc`** without runtime-bearing changes.
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

**Status:** `DONE / ACCEPTED` — 2026-08-20.  
**Decision:** D-028.  
**Detailed contract:** `docs/V2/P10_S2_BETA_GATE.md`.

P10-S2 contract definition reconstructed and canonically accepted the minimum non-production beta boundary **without moving live-store data**.

### Data handling

- stable remains the only authoritative production system during beta;
- the beta copy is point-in-time and disposable;
- real copied data may exist only on the trusted operator machine/browser origin, required D-018 checkpoint/V2 backup artifacts and the existing D-024 synchronized recovery-copy boundary;
- no raw backup, identifiable screenshot/PDF or transaction payload may enter Git/GitHub, CI artifacts, chat or canonical docs;
- source identity is recorded through non-sensitive export timestamp, file size and SHA-256 digest;
- beta-specific copied real data is disposed from operator-controlled locations within 24 hours after gate acceptance/rejection/abandonment.

### Candidate / operator access and isolation

Before any real-data export, P10-S2-I1 must prove:

- exact candidate Git SHA/tree;
- passing D-019 evidence;
- exact READY browser deployment traceable to that SHA;
- current alias → deployment identity when a mutable alias is used;
- one designated operator on a trusted isolated browser context;
- clear stable-vs-beta origin separation;
- approved D-024 working/recovery location.

Any missing pre-export proof is NO-GO before export.

### Reconciliation

Before any beta classification/business mutation:

- preflight must PASS;
- only already accepted v1 normalization warnings are allowed;
- item/reseller/transaction and order/payment/signal counts must match exactly;
- IDs, references, stored monetary/business values and source dates must be preserved under accepted normalization;
- no category/history may be fabricated;
- semantic normalized-data diff must be empty apart from documented v1→V2 additions/envelope timestamps;
- gross order value, payments, signals, net movement, every reseller balance and aggregate positive reseller debt must match exactly;
- stored numeric values must be identical; any displayed R$ 0,01 difference is NO-GO.

Objective reconciliation is mandatory. Sanitized human spot checks are supplementary only.

### Recovery

Before normal beta writes:

1. D-018 restore/checkpoint must pass;
2. D-024 blocking must be observed before setup;
3. a fresh validated V2 backup must be exported;
4. synchronized-copy verification must be explicitly confirmed;
5. recovery health must be observed current;
6. the post-reconciliation V2 backup becomes the beta rollback baseline.

D-024's exact 24-hour guard remains mandatory for the duration of the beta.

### Minimum operator beta acceptance

After reconciliation/recovery PASS:

1. confirm a migrated unclassified real item is blocked from a new order;
2. create representative beta category/classification;
3. record one beta-only order;
4. correct that beta-only transaction through D-026;
5. verify original/replacement linkage and effective financial behavior;
6. export final V2 backup;
7. restore into a disposable fresh context and re-export identical business data.

### Rollback / NO-GO

Any unexpected warning, structural/financial mismatch, reference loss/duplication, D-018/D-024 failure, isolation/data-boundary breach, D-024 bypass, stable-origin write or failed final round-trip is fail-closed NO-GO.

Default beta rollback is restoration of the recorded post-reconciliation baseline or full clearing/disposal of the beta origin. Beta state is never written back to stable.

### Disposal / evidence

Within 24 hours after P10-S2-I1 closes, beta-specific source-copy/checkpoint/V2 export/PDF/browser-origin/synchronized-folder data must be removed from operator-controlled locations. Trash/provider recovery areas are emptied when directly available.

Canonical evidence may retain only sanitized metadata: candidate/deployment/CI IDs, hashes, file size/timestamps, counts/aggregate PASS-FAIL, warning classification, sanitized operator notes and disposal status.

### Explicit go/no-go consequence

A P10-S2-I1 PASS authorizes **only** proposing/defining the later production-cutover gate.

It does not authorize final write freeze, `main` publication, canonical URL switch, production restore/writes, rollback after V2 production writes, stable decommissioning or D-016 change.

## 7. What remains explicitly unauthorized

During contract definition no real data moved. Until P10-S2-I1 itself executes and passes, the following remain unauthorized:

- production-data use in V2 beyond the single bounded beta copy permitted by D-028;
- final real-data/cutover reconciliation;
- final write freeze;
- merging/publishing V2 from `main`;
- switching the store's canonical URL;
- production cutover;
- rollback after V2 has accepted production writes;
- decommissioning the original stable application;
- changing D-016 topology.

## 8. Immediate next action

Execute only **P10-S2-I1 — copied-live-data beta under D-028 / `docs/V2/P10_S2_BETA_GATE.md`**.

Begin by re-verifying one exact D-019-passing candidate and READY deployment/alias identity, operator/browser isolation and approved D-024 working/recovery location. Only after every pre-export GO criterion passes may one point-in-time stable-v1 backup be exported.

Then perform preflight/restore, exact structural and financial reconciliation, D-018/D-024 recovery readiness, minimum disposable beta-only operator checks, final V2 fresh-context round-trip, 24-hour disposal and sanitized evidence capture.

Any mismatch or contract breach is NO-GO. Do not modify/publish `main`, perform stable publication, production cutover or canonical URL switch, and do not change D-016.
