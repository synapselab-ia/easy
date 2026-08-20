# Easy V2 — P10 Controlled Beta / Migration / Cutover Plan

**Status:** `P10-S1 DONE / ACCEPTED; P10-S2 CONTRACT DONE / ACCEPTED; P10-S2-I1 NOT_STARTED`  
**Date:** 2026-08-20  
**Scope:** controlled progression from validated V2 candidate toward copied-data beta and eventual cutover; every data/publication boundary remains explicit and fail-closed

## 1. Purpose

P10 moves the completed V2 from integration state toward controlled store use without treating a deploy, branch merge, synthetic rehearsal or copied-data experiment as automatic production approval.

Completed:

- P10-S1-I1 aligned backup validation with D-026 while preserving D-025/reference/audit integrity;
- P10-S1-I2 proved stable-v1→V2 migration/recovery on a deployed candidate using synthetic data only;
- P10-S2 defined and accepted D-028, the copied-live-data beta contract.

Current next action:

- **P10-S2-I1 — execute one bounded copied-live-data beta under `docs/V2/P10_S2_BETA_GATE.md`.**

This plan still does **not** authorize production cutover, publication from `main`, canonical URL switching, persistence-topology change or concurrent operation across origins.

## 2. Stable repository and persistence baseline

### Stable repository state

- stable `main`: **`9574e3a4097ddd78ab1f75a13b9ea065287946e9`**;
- `develop` entering the P10-S2 contract branch: **`816794694d0a9b6c92da273a81ee745c2f53ecdc`**;
- both branches remain unprotected, so D-019/PR discipline remains a process requirement.

### Stable publication path

Current `main` publishes the historical application to GitHub Pages on push. Its historical workflow does not contain the V2 D-019 quality stage.

The V2 `develop` workflow already defines the eventual stronger stable path:

```text
push main
  -> quality / npm run qa:critical
  -> build
  -> deploy
```

That path remains inactive on stable `main` until a later accepted publication gate.

### Persistence and transfer boundary

Stable `main` uses `ResellerManagerDB` Dexie V1 with `items`, `resellers`, `transactions` and exports backup version 1.

V2 uses Dexie V5 with `categories`, `items`, `resellers`, `transactions` and `easy-backup` v2/schema5.

IndexedDB is browser-origin-local. Publishing another origin never migrates the stable database implicitly. The accepted transfer route is explicit backup → preflight → restore.

Accepted stable-v1 normalization:

- missing item/reseller lifecycle state → active;
- missing transaction `occurredAt` → historical `createdAt`;
- no categories or category assignments fabricated;
- migrated legacy items initially unclassified;
- new orders blocked for unclassified active items until classification.

### Recovery boundary

D-018/D-024 remain authoritative on any V2 origin:

- restore requires checkpoint + verified atomic replacement;
- restore/backup remains reachable when recovery health is absent;
- normal writes are blocked while recovery health is unknown/due/overdue;
- a fresh validated backup + explicit synchronized-copy verification is required before normal writes proceed.

## 3. P10-S1 — completed compatibility/rehearsal gate

### P10-S1-I1 — backup/correction compatibility

**Status:** `DONE / INTEGRATED`.

Current correction-pair backup rules permit supported D-026 type/date/item changes while keeping:

- bidirectional non-self correction/reversal linkage;
- referenced-ID validity;
- registration chronology;
- target-type shape/reference validity;
- same-item D-025 historical category snapshot preservation;
- changed-item valid replacement-time category snapshot.

Authoritative proof: PR #60 D-019 `32292888925` / `96197514379`; integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`.

### P10-S1-I2 — synthetic deployed rehearsal

**Status:** `DONE / REHEARSED`.

Rehearsed candidate:

- Vercel project `easy-v2`;
- READY deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`**;
- exact Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**;
- tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**.

Evidence-only PR #62 authoritative run **`32298906351`**, job **`96216688953`**, first passed D-019 and then the remote rehearsal 1/1.

Using synthetic stable-v1 data only, it proved:

1. v1 preflight and expected in-memory normalization;
2. restore + D-018 checkpoint;
3. no fabricated category history;
4. D-024 blocking before setup;
5. fresh backup + synchronized-copy verification;
6. migrated unclassified-item order blocking;
7. representative category/classification;
8. supported order + D-026 changed-item/date correction;
9. final V2 export;
10. disposable fresh-context restore/re-export with identical business data.

Canonical P10-S1 closure PR #63 integrated as `816794694d0a9b6c92da273a81ee745c2f53ecdc`.

P10-S1 proved mechanism compatibility only. No real store data moved.

## 4. P10-S2 — copied-live-data beta contract

**Status:** `DONE / ACCEPTED` — D-028.

Authoritative detailed contract: `docs/V2/P10_S2_BETA_GATE.md`.

D-028 defines the copied-data beta as:

- point-in-time;
- single-operator;
- isolated from stable;
- disposable;
- exact-reconciliation;
- D-018/D-024 recoverable;
- fail-closed;
- sanitized-evidence only.

Stable remains authoritative. Beta state never synchronizes/promotes back to stable.

### Candidate gate before export

Before any real-data export, the execution must prove:

- exact Git SHA/tree;
- passing D-019 evidence;
- exact READY deployment traceable to that SHA;
- current alias → deployment identity when a mutable alias is used;
- no unvalidated runtime-bearing commit after the accepted candidate.

No identity proof = NO-GO before export.

### Data-handling gate

Copied real data may exist only in:

- the authoritative stable origin;
- one exported source JSON on the trusted operator machine;
- the isolated V2 beta browser origin;
- required D-018 checkpoint/V2 backup artifacts;
- the existing approved D-024 synchronized recovery-copy boundary.

It may not be placed in Git/GitHub, CI artifacts, chat, project docs, unrelated cloud folders or Vercel project files.

Evidence records only sanitized metadata such as timestamp, file size and SHA-256 digest.

### Exact reconciliation gate

Before any beta mutation/classification:

- preflight must PASS;
- only already accepted v1 normalization warnings are allowed;
- item/reseller/transaction/type counts must match exactly;
- IDs, references, stored monetary/business values and source dates must be preserved under accepted normalization;
- semantic normalized-data diff must be empty except documented v1→V2 additions/envelope timestamps;
- gross order value, payments, signals, net movement, every reseller balance and aggregate positive debt must match exactly;
- any R$ 0,01 displayed financial difference is NO-GO.

Human spot checks are supplementary, sanitized and never replace objective reconciliation.

### Recovery gate

Before beta writes:

1. D-018 checkpoint PASS;
2. D-024 normal-write block observed before setup;
3. fresh V2 backup exported;
4. synchronized-copy verification explicitly confirmed;
5. recovery health observed current;
6. post-reconciliation V2 export captured as rollback baseline.

### Minimum operator beta checks

After reconciliation/recovery PASS:

- confirm unclassified-item order block;
- create representative beta category/classification;
- create one beta-only order;
- perform one D-026 audited correction of that beta-only transaction;
- verify effective financial/linkage behavior;
- export final V2 backup;
- restore into disposable fresh context and re-export identical business data.

### Fail-closed / rollback

Any unexpected warning, mismatch, reference loss, D-018/D-024 failure, isolation breach, copied-data boundary breach, D-024 bypass, stable-origin write or failed final round-trip is NO-GO.

Default beta rollback is restore of the recorded post-reconciliation baseline or complete disposal/clearing of the beta origin. Beta state is never written to stable.

### Disposal

Within 24 hours after P10-S2-I1 acceptance/rejection/abandonment, beta-specific copied real data must be removed from operator-controlled locations, including source-copy artifact, checkpoint/exports/PDFs, beta origin IndexedDB/recovery state and synchronized-folder beta artifacts. Trash/provider recovery areas are emptied when directly available.

Only sanitized metadata/hashes/counts/PASS-FAIL evidence remains canonical.

## 5. P10-S2-I1 — execution sequence

**Status:** `NOT_STARTED` — CURRENT.

Execute exactly in this order:

1. re-verify candidate identity and D-019;
2. verify trusted operator/browser isolation and approved D-024 working location;
3. record pre-export GO evidence;
4. export one immutable point-in-time stable-v1 source snapshot;
5. record neutral identity metadata/hash;
6. preflight;
7. restore and capture D-018 checkpoint;
8. perform exact structural/financial reconciliation before mutation;
9. prove D-024 blocking/setup/current state;
10. capture rollback-baseline V2 export;
11. perform minimum disposable operator beta checks;
12. export final V2 backup and prove fresh-context identical round-trip;
13. dispose beta-specific real-data artifacts within 24 hours;
14. record only sanitized evidence and PASS/NO-GO result.

A PASS authorizes only defining the next production-cutover gate.

## 6. Production-cutover boundary remains closed

Even after a successful P10-S2-I1, the following require a later explicit contract/decision:

- final stable write freeze;
- final production backup identity;
- V2 publication/merge from `main`;
- stable/canonical URL switch;
- production restore/migration;
- first V2 production write;
- rollback rules after V2 production writes;
- stable decommissioning;
- any D-016 topology change.

## 7. Immediate next action

Execute only **P10-S2-I1 — copied-live-data beta under D-028**.

Start with the pre-export candidate/access/isolation/recovery-location GO checklist. Do not export live-store data unless every pre-export criterion passes. Any mismatch or contract breach is NO-GO.

Do not modify/publish `main`, switch the canonical URL, perform production cutover or change D-016.
