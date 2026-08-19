# Easy V2 — P10 Controlled Beta / Migration / Cutover Plan

**Status:** `P10-S1 CONTRACT ACCEPTED / INTEGRATED; I1 DONE / INTEGRATED; I2 NOT_STARTED`  
**Date:** 2026-08-19  
**Scope:** first bounded P10 acceptance/cutover sequence only; no live-store data movement and no stable publication

## 1. Purpose

P10 must move the completed V2 from integration state toward controlled store use without treating a deploy or branch merge as proof that data migration, recovery and rollback are safe.

This document governs the accepted P10-S1 pre-cutover gate. It does **not** authorize production cutover, migration of the live store dataset, publication of V2 from `main`, a persistence-architecture change, or concurrent operation across origins.

## 2. Reconstructed baseline

### Stable repository state

- `main` remains the stable/original application at commit `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.
- `develop` was at completed-P9 commit `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a` when the P10-S1 contract was established.
- `develop` was 55 commits ahead of `main`; `main` was not partially migrated.
- Both branches are currently unprotected in GitHub, so branch protection cannot be assumed to enforce the cutover gate automatically.

### Stable publication path

The current `main` workflow publishes to GitHub Pages on every push to `main`. The stable branch's present workflow builds and deploys but does not itself run D-019.

The V2 version of `.github/workflows/deploy.yml` already upgrades the eventual `main` publication path to `quality -> build -> deploy`, with `npm run qa:critical` required before deployment. That stronger workflow becomes relevant only if/when V2 is explicitly accepted for stable publication.

### V2 candidate hosting

The connected Vercel project `easy-v2` exists as the V2 candidate environment.

Observed state when this plan was established:

- project: `easy-v2` (`prj_9h6n9SgN9F4nmiQQoX4hR4P92M2d`);
- framework: Vite;
- Git-triggered deployment is disabled by repository `vercel.json` (`git.deploymentEnabled = false`);
- deployments are therefore intentionally manual/bounded;
- latest observed READY deployment targets commit `1221f71de460c266c165b92de0536f443c71fa08` on `develop`;
- that deployment predates final P9 and P10-S1-I1 and cannot serve as current rehearsal evidence.

Vercel's `target: production` label for that project is a hosting-environment label only. It is **not** authorization to treat `easy-v2` as the store's stable production system.

### Persistence and transfer boundary

`main` uses `ResellerManagerDB` Dexie V1 with `items`, `resellers`, `transactions`. Its current export is backup version 1.

V2 uses Dexie V5 with `categories`, `items`, `resellers`, `transactions` and canonical `easy-backup` v2/schema5.

Because IndexedDB is browser-origin-local, publishing V2 at another origin does not migrate the stable dataset. The accepted transfer route for a future cutover is explicit backup/restore, not implicit IndexedDB continuity.

V2 preflight accepts the `main` backup-v1 envelope and normalizes it losslessly:

- legacy items/resellers without lifecycle state become active;
- legacy transactions without `occurredAt` use historical `createdAt` as occurrence time;
- no categories or historical category assignments are invented;
- migrated legacy items remain unclassified until the operator classifies them;
- normal new orders remain blocked for unclassified active items under D-025/P1 rules.

### Recovery boundary

D-024 remains authoritative on the V2 origin:

- restore/backup remains reachable when local recovery-health metadata is absent;
- normal data-changing writes are blocked while recovery state is unknown/due/overdue;
- after a restore on a fresh candidate origin, the operator must configure/verify the synchronized recovery-copy destination and create a fresh validated backup before normal writes may continue.

No provider-side sync acknowledgment is implied.

## 3. Pre-cutover blocker — RESOLVED BY P10-S1-I1

The P10-S1 reconstruction found that `backupService.validateReferences()` still carried pre-D-026 equality assumptions across linked correction pairs. It required replacement type, order item/category snapshot and `occurredAt` to equal the original even though D-026 permits those effective business fields to change.

P10-S1-I1 resolved that blocker without changing schema or backup envelope.

Current correction-pair backup rules are:

- replacement type may differ from the original;
- replacement `occurredAt` may differ from the original;
- an order replacement may select another valid item and carry that replacement item's valid category snapshot;
- if an order replacement keeps the same `itemId`, D-025 requires the original historical category snapshot to remain unchanged;
- replacement/original IDs must exist;
- correction/reversal linkage must remain bidirectional and non-self-referential;
- replacement registration cannot predate original registration;
- every row must satisfy its own reseller/item/category references and target-type shape.

Because `exportData()` self-preflights the generated envelope, the same rules now allow ordinary supported D-026 corrections to remain recoverable/exportable.

Backup-v1 and v2/schema4 compatibility remain passing; no migration history was invented or rewritten.

## 4. D-027 acceptance model

P10 adopts a fail-closed, rehearsal-before-live model:

1. `main` remains untouched during P10-S1.
2. No live-store backup is exported/imported as part of P10-S1.
3. No stable publication or cutover occurs in P10-S1.
4. The Vercel `easy-v2` project is candidate/beta hosting only.
5. Every candidate must be pinned to an exact `develop` SHA and have passing D-019 evidence.
6. The D-026 backup-validation blocker had to be fixed before rehearsal; P10-S1-I1 has now satisfied that gate.
7. The stable→V2 transfer contract is backup-v1 preflight/restore, not direct browser database reuse.
8. First migration rehearsal uses synthetic/non-production backup-v1 data representative of the stable format.
9. D-024 recovery readiness must be established on the candidate origin before any normal post-restore write is accepted.
10. Legacy classification behavior must be rehearsed: no fabricated categories, and active legacy items must be classified before new order entry.
11. Stable publication from `main`, copied-live-data beta, final write freeze and production cutover require a later explicit go/no-go gate.
12. D-016 remains unchanged; P10 does not introduce backend/auth/cloud database/live synchronization.

## 5. First bounded slice — P10-S1

### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Implemented result:

- backup validation accepts valid D-026 linked replacements that change type, financial occurrence date or order item;
- bidirectional correction/reversal linkage, existence checks, registration chronology and per-target transaction-shape/reference validity remain enforced;
- D-025 semantics remain exact: same-item order replacement **must preserve** the original historical category snapshot; changed/new order item may carry the replacement target's valid snapshot;
- backup-v1 and v2/schema4 migration compatibility remain passing;
- no schema or backup-envelope version changed.

Focused regression coverage proves:

- type-changing + occurrence-date-changing replacement preflights;
- changed-order-item/category snapshot preflights;
- broken bidirectional linkage remains rejected;
- invalid replacement target shape remains rejected;
- `exportData()` can self-preflight/export a persisted D-026 changed-item/date replacement.

#### I1 validation history

The first D-019 candidate, run `32292405631` / job `96196002726`, correctly failed one existing P9-S3 Vitest after category-snapshot equality had initially been removed unconditionally. All five new P10 tests passed, but the legacy test `rejects a linked order correction that rewrites the historical category snapshot` proved the same-item D-025 rule still had to remain. Integration was blocked.

The implementation was narrowed accordingly. Authoritative proof:

- PR #60 D-019 run **`32292888925`**, job **`96197514379`**;
- exact validated merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**, head `666e4c86df7c6328289d489db7c8eebcb714aad1`, base `a549ce79925aad0cae9e964babd28879e8ad1c15`;
- ESLint: **0 errors / 82 warnings**;
- Vitest: **53 files / 222 tests PASS**;
- Playwright: **17/17 PASS**;
- production build: **PASS**;
- PR #60 squash-integrated into `develop` as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**;
- validated merge ref and integrated squash share exact tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

I1 exit criteria are satisfied. No Vercel deployment, live data, `main`, D-016, schema or envelope change occurred.

### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `NOT_STARTED` — **CURRENT**.

This is now the next bounded action authorized by the accepted D-027 contract.

I2 may:

- manually deploy an exact D-019-passing `develop` SHA to `easy-v2`;
- verify the deployment SHA rather than relying on an alias;
- use only synthetic/non-production backup-v1 fixture data representative of stable format;
- preflight and restore that fixture into the candidate;
- verify entity/transaction counts and expected legacy normalization;
- establish D-024 recovery health on the candidate origin before normal writes;
- classify representative migrated items and verify new-order gating;
- create supported transactions/corrections;
- export a V2 backup and prove restore round-trip on disposable candidate data;
- record a go/no-go result for a later copied-live-data beta.

It may **not** use the live store backup, write to or publish `main`, publish stable V2, perform final cutover, or change D-016.

## 6. Later P10 work explicitly not authorized yet

The following remain outside the current P10-S1 rehearsal and require later canonical authorization:

- exporting/importing the actual live store dataset;
- operator acceptance beta using copied production data;
- reconciling actual production totals/counts;
- defining and executing a final write-freeze window;
- selecting the exact final cutover timestamp;
- merging/publishing V2 from `main`;
- switching the store's canonical URL;
- rollback after V2 has accepted new production writes;
- decommissioning the original stable application;
- changing D-016 topology.

## 7. Contract validation and integration

The P10-S1 contract itself was validated before integration:

- PR #58 D-019 run `32290159119`, job `96188851730`;
- validated merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`;
- result: 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`;
- validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

The contract integration was documentation-only. I1 later changed only backup validation plus focused tests and introduced no deployment/data movement.

## 8. Immediate next action

Execute only **P10-S1-I2 — Non-production migration/recovery rehearsal**.

Manually deploy an exact D-019-passing `develop` SHA to `easy-v2`, verify that deployed SHA explicitly, and rehearse stable-v1→V2 migration/recovery using synthetic/non-production fixture data only. Verify counts/normalization, D-024 recovery setup before normal writes, representative legacy classification/new-order gating, supported transaction/correction flows, V2 export and disposable restore round-trip; then record a go/no-go result for a later copied-live-data beta.

Do not use live-store data, do not modify or publish `main`, do not perform production cutover or stable publication, and do not change D-016.
