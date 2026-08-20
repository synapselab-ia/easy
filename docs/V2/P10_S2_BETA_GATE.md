# Easy V2 — P10-S2 Copied-Live-Data Beta Gate

**Status:** `ACCEPTED CONTRACT — EXECUTION NOT_STARTED`  
**Date:** 2026-08-20  
**Scope:** define the fail-closed contract for a non-production beta using a point-in-time copy of the live-store dataset; this document does not itself authorize moving real data

## 1. Purpose and authority boundary

P10-S2 exists to prove that the already-rehearsed stable-v1→V2 transfer mechanism behaves correctly on a **copy** of the actual store dataset and that the operator can use the copied dataset safely enough to justify proposing a later production-cutover gate.

This contract separates two actions:

1. **contract acceptance** — this document and the canonical ledgers define the rules; no live-store data moves;
2. **P10-S2-I1 execution** — a later explicitly authorized action may export one point-in-time stable backup and run the copied-live-data beta under this contract.

Contract acceptance does **not** authorize production cutover, stable publication, canonical URL switching, `main` modification, concurrent multi-user operation, backend/auth/cloud-database introduction or D-016 change.

Throughout P10-S2-I1, the historical stable application and its live browser origin remain the **only authoritative production system**. The V2 beta copy is disposable and must never be treated as production truth or automatically synchronized back to stable.

## 2. Candidate identity gate before any real-data export

Before the live-store backup may be exported for P10-S2-I1, the execution record must identify one exact V2 candidate and prove all of the following:

- exact Git SHA and tree are recorded;
- the candidate has a passing D-019 `npm run qa:critical` result;
- the exact browser deployment used for beta is READY and traceable to that Git SHA;
- if a mutable public alias is used for browser access, current deployment metadata proves that the alias still resolves to the recorded deployment ID;
- no runtime-bearing commit has been introduced after the candidate's accepted D-019 evidence without a new D-019 pass and deployment-identity proof.

The previously rehearsed deployment may be reused only if its identity is reverified at execution time. A mutable alias alone is never sufficient identity evidence.

Failure to prove exact candidate identity is **NO-GO before export**.

## 3. Data-handling contract

### 3.1 Permitted purpose

The copied dataset may be used only to:

- preflight and restore the stable-v1 backup into the non-production V2 beta origin;
- reconcile migrated business data against the source snapshot;
- establish D-024 recovery readiness on the beta origin;
- perform the bounded operator acceptance checks in this contract;
- create the minimum checkpoint/backup evidence required for rollback and recovery proof.

The copied data may not be used for unrelated analysis, external sharing, demonstrations, training data, issue reproduction outside this gate or any other secondary purpose.

### 3.2 Permitted locations

During P10-S2-I1, real copied data may exist only in the following controlled locations:

1. the authoritative stable origin where it already exists;
2. the single exported stable-v1 JSON source artifact on the trusted operator machine;
3. the V2 beta browser profile/origin IndexedDB used for the exercise;
4. D-018 checkpoint downloads and V2 backup artifacts required by the exercise;
5. the already-approved D-024 synchronized recovery-copy folder/provider boundary used by the operator.

A browser download directory may be used only transiently while an artifact is being moved into the approved working/recovery location or deleted.

Real copied data must **not** be committed to Git, uploaded to GitHub issues/PRs/Actions artifacts, pasted into chat, attached to project documentation, placed in Vercel project files, sent by email/message for evidence, or stored in an unrelated cloud folder.

### 3.3 Access and isolation

P10-S2-I1 is single-operator and single-beta-origin under D-016.

Required isolation:

- one designated store operator conducts the exercise on a trusted machine;
- use a dedicated browser profile or equivalently isolated browser context for the beta origin;
- no reseller, employee, public-terminal or concurrent multi-device access is introduced;
- the stable origin and beta origin must be visually/distinctly identified before any beta mutation;
- beta-created transactions, classifications, corrections, PDFs and other outputs are disposable test state and must not be manually copied back into stable;
- screenshots/logs retained as evidence must be sanitized so they contain no reseller names, phone numbers, emails, notes or transaction payloads.

If the operator cannot reliably distinguish stable from beta, execution is **NO-GO** until isolation is corrected.

### 3.4 Snapshot identity

The source snapshot must be treated as immutable after export.

The execution evidence records, without exposing the payload:

- export timestamp from the source artifact;
- filename or neutral artifact label;
- file size;
- SHA-256 digest of the exact exported JSON file.

All reconciliation is against this frozen source snapshot, not against the live stable UI after the export timestamp. Stable may continue receiving production writes after the snapshot because the beta is point-in-time and non-authoritative.

## 4. Preflight and migration acceptance

Before restore, V2 preflight must return PASS with no validation errors.

For the current stable-v1 source, accepted normalization is limited to the already-rehearsed compatibility behavior:

- missing item/reseller lifecycle state → `isActive = true`;
- missing transaction `occurredAt` → historical `createdAt`;
- no category entities are fabricated;
- no item category assignment is fabricated;
- no historical order category snapshot is fabricated.

Every warning must be captured by type/count and explained by this accepted v1 normalization. Any warning that cannot be mapped to an already accepted compatibility rule is **NO-GO** pending diagnosis.

The preflight preview must record at minimum:

- categories / active / inactive;
- items / active / inactive / unclassified;
- resellers / active / inactive;
- transactions total and order/payment/signal breakdown;
- legacy orders without category;
- reversed transactions;
- correction transactions.

## 5. Exact reconciliation contract

Reconciliation occurs **after restore and before any beta business mutation or classification**.

The accepted tolerance is zero. No unexplained count difference, entity loss, duplicate, reference change or financial difference is permitted.

### 5.1 Structural reconciliation

The restored/normalized V2 baseline must satisfy all of the following against the immutable source backup:

- item count exactly equals source item count;
- reseller count exactly equals source reseller count;
- transaction count exactly equals source transaction count;
- order/payment/signal counts exactly equal the corresponding source counts;
- item IDs and reseller IDs are preserved;
- transaction IDs, reseller references, transaction types, stored monetary values and `createdAt` values are preserved;
- every source order preserves its item reference, item-name snapshot, quantity, unit price and total value;
- every source payment/signal preserves its type, reseller reference, total value and observation state;
- normalized `occurredAt` equals source `createdAt` exactly where the v1 source omitted occurrence time;
- restored categories are exactly zero before operator-created beta classification;
- all migrated stable-v1 items are initially unclassified and active;
- all migrated stable-v1 resellers are initially active;
- historical stable-v1 orders remain without fabricated category snapshots.

A semantic normalized-data diff must be empty after excluding only the explicitly expected v1→V2 additions above and envelope/export timestamps.

### 5.2 Financial reconciliation

Financial comparison uses the accepted sign convention that effective orders add debt and payments/signals subtract debt. Reversed rows contribute zero; the stable-v1 snapshot is expected to contain no V2 correction/reversal state.

The evidence must prove exact equality for:

- gross order value across the full snapshot;
- total payment value;
- total signal value;
- net movement across all transactions;
- balance for **every reseller ID** represented in the source snapshot;
- aggregate positive reseller debt computed from those balances.

Stored numeric values must be identical. User-facing currency comparisons must match to the displayed cent; any difference of R$ 0,01 or more is **NO-GO**. There is no accepted non-zero reconciliation tolerance.

### 5.3 Representative human spot checks

Objective reconciliation is mandatory and cannot be replaced by visual inspection. In addition, the operator performs a small human check for usability/recognizability:

- one known reseller with non-empty history;
- at least one historical order;
- at least one payment or signal when such a transaction exists in the source snapshot;
- oldest and newest visible historical movement dates for the checked reseller or equivalent edge records.

The evidence records only sanitized PASS/FAIL notes, never the real names or payload values.

Any objective mismatch overrides a visually plausible result.

## 6. Recovery gate on the copied-data origin

Restore must preserve the accepted D-018/D-024 sequence.

Required evidence before normal beta writes:

1. restore completes and produces the D-018 checkpoint artifact;
2. the checkpoint artifact receives a neutral label and SHA-256 digest;
3. D-024 is observed blocking a normal write while recovery health is unknown/due/overdue;
4. a fresh validated V2 backup is exported from the restored baseline;
5. that backup is placed in the approved synchronized recovery-copy location;
6. synchronized-copy verification is explicitly confirmed through the existing D-024 flow;
7. recovery health is then observed as current before any beta business mutation.

The fresh post-restore V2 backup becomes the **beta rollback baseline** and its SHA-256 digest is recorded.

If the beta lasts long enough for D-024 to become due/overdue, normal writes must remain blocked until a new validated backup and synchronized-copy verification re-establish current recovery health. Bypassing the 24-hour guard is prohibited.

Failure to produce a checkpoint, export a valid V2 backup or establish D-024 current state is **NO-GO**.

## 7. Minimum operator acceptance on the copy

Only after structural/financial reconciliation and D-024 readiness pass may disposable beta mutations begin.

Minimum checks:

1. confirm a migrated active-but-unclassified real item is blocked from new-order creation;
2. create at least one beta category and classify at least one migrated real item in the copied dataset;
3. record one clearly identified beta-only order for a real copied reseller using a classified item;
4. correct that beta-only transaction through the D-026 audited replacement flow, changing at least one effective business field supported by D-026;
5. confirm the original/replacement audit linkage remains visible and financial effect reflects only the effective replacement;
6. export a fresh V2 backup after the beta mutation/correction flow;
7. restore that final beta backup into a disposable fresh browser context and re-export it;
8. prove identical business data between the final beta export and fresh-context re-export.

No production-like test transaction created in the copied beta may be manually re-entered into stable as part of this gate.

PDF generation or additional browsing/search/report checks may be performed when useful, but any real-data output becomes a beta artifact subject to the same disposal contract.

## 8. Rollback and NO-GO behavior

P10-S2-I1 is fail-closed. Any of the following causes **NO-GO**:

- exact candidate/deployment identity cannot be proven;
- source backup preflight fails;
- an unexpected migration warning appears;
- any structural reconciliation mismatch occurs;
- any financial reconciliation differs by at least R$ 0,01 or stored numeric data differs;
- a required source reference/entity is missing or duplicated;
- D-018 checkpoint creation fails;
- D-024 cannot establish current recovery health;
- a normal write can bypass the expected D-024 block;
- operator isolation between stable and beta is ambiguous;
- copied data leaves the permitted locations/access boundary;
- a beta action is accidentally written to the stable production origin;
- the exercise appears to require backend/auth/live sync or another D-016 reopen trigger merely to succeed;
- final V2 backup restore/re-export does not preserve identical business data.

On NO-GO:

1. stop beta mutations immediately;
2. do not modify `main`, stable deployment configuration or canonical URL;
3. do not alter the live stable dataset to force reconciliation;
4. preserve only the minimum copied artifact needed for diagnosis while access remains controlled;
5. classify the failure as product defect, source-data issue, harness/operator issue or contract violation;
6. either fix/rehearse under a later explicitly accepted action or reject the beta;
7. dispose copied data under Section 9 when diagnosis no longer requires it.

The default rollback for the beta origin is to restore the recorded post-reconciliation beta rollback baseline or clear/dispose the beta origin entirely. Rollback never writes beta state back to stable.

If an unintended write occurs on the stable origin, that is a production incident and the beta stops. The write must be handled according to the stable application's existing operational/audit capabilities; it must not be hidden by deleting or overwriting evidence merely to continue the beta.

## 9. Disposal and retention

### 9.1 Retention during the active gate

Keep only the minimum live-data artifacts needed for the active exercise and rollback:

- immutable source v1 snapshot;
- D-018 checkpoint;
- post-reconciliation rollback-baseline V2 export;
- final beta V2 export/re-export only while round-trip evidence is being completed;
- any generated PDF/screenshot containing real data only while the relevant check is active.

Do not create convenience duplicates.

### 9.2 Disposal deadline

Within **24 hours after P10-S2-I1 is accepted, rejected or abandoned**, remove beta-specific copied real data from all operator-controlled locations:

- delete the exported source-copy artifact created specifically for the beta;
- delete D-018 checkpoints created by the beta;
- delete beta V2 exports/re-exports and generated PDFs containing real data;
- clear the V2 beta origin/site data, including IndexedDB and recovery-health control state;
- remove beta artifacts from the synchronized recovery folder;
- empty local/browser/provider trash or recovery areas when directly available to the operator.

The ordinary stable production dataset and any pre-existing operational backup policy are outside this beta-disposal action and must not be deleted.

The synchronized-folder provider's unavoidable platform retention/versioning remains governed by the already accepted D-024 provider boundary; no stronger physical-erasure claim is made than the operator can verify.

### 9.3 Evidence retained after disposal

Canonical/repository evidence may retain only non-sensitive metadata:

- candidate Git SHA/tree and deployment ID;
- CI run/job IDs;
- source and artifact SHA-256 digests;
- file sizes and timestamps;
- counts and aggregate financial PASS/FAIL results without reseller-identifying breakdowns;
- warning classifications;
- sanitized operator PASS/FAIL notes;
- disposal completion timestamp/status.

No real names, contact details, notes, transaction payloads, raw backups, PDFs or identifiable screenshots belong in GitHub/project documentation.

## 10. Evidence package and GO states

### 10.1 GO to start actual copied-live-data execution

A future P10-S2-I1 action may export the real stable backup only when it records:

- this D-028/P10-S2 contract as integrated/current;
- exact candidate Git SHA/tree;
- passing D-019 evidence for that candidate;
- exact READY deployment identity and alias-to-deployment verification when an alias is used;
- designated trusted operator/browser isolation context;
- approved working/recovery location under the D-024 boundary;
- explicit acknowledgment that stable remains authoritative and beta writes are disposable.

If any item is absent: **NO-GO before export**.

### 10.2 PASS for P10-S2-I1 copied-live-data beta

The actual copied-data beta is PASS only if the evidence package proves all of the following:

- source snapshot identity/digest captured;
- preflight PASS with only expected v1 normalization warnings;
- exact structural reconciliation PASS;
- exact financial reconciliation PASS with zero cent-level difference;
- D-018 checkpoint PASS;
- D-024 block/setup/current-state PASS;
- rollback-baseline backup captured;
- minimum operator acceptance checks PASS;
- final V2 backup fresh-context round-trip PASS with identical business data;
- no stable-origin write, `main` change, canonical URL switch or D-016 change occurred;
- disposal completed within the 24-hour deadline;
- repository evidence contains only sanitized metadata.

Any failed item means P10-S2-I1 is not accepted.

### 10.3 What a P10-S2-I1 PASS authorizes

A PASS authorizes **only** proposing/defining the next bounded production-cutover gate.

It does not itself authorize:

- final write freeze;
- publication/merge of V2 to `main`;
- stable deployment switch;
- canonical URL change;
- production restore/migration;
- V2 production writes;
- rollback rules after V2 has accepted production writes;
- decommissioning stable;
- D-016 change.

## 11. Decision summary

This contract establishes D-028:

> A copied-live-data beta is a point-in-time, single-operator, isolated, disposable acceptance exercise. Stable remains authoritative; the candidate is pinned by exact Git/deployment identity; reconciliation is exact with zero cent-level financial tolerance; D-018/D-024 recovery readiness is mandatory before beta writes; failures are fail-closed; copied data is disposed within 24 hours of gate closure; only sanitized metadata may enter canonical repository evidence.

**Current result:** contract accepted; no real store data moved.  
**Next bounded action after canonical integration:** execute only P10-S2-I1 under this contract, beginning with candidate re-verification and the pre-export GO checklist.