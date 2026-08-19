# Easy V2 — P10 Controlled Beta / Migration / Cutover Plan

**Status:** `P10-S1 CONTRACT ACCEPTED / INTEGRATED; IMPLEMENTATION NOT_STARTED`  
**Date:** 2026-08-19  
**Scope:** first bounded P10 acceptance/cutover slice only; no live-store data movement and no stable publication

## 1. Purpose

P10 must move the completed V2 from integration state toward controlled store use without treating a deploy or a branch merge as proof that data migration, recovery and rollback are safe.

This document defines only the first bounded gate. It does **not** authorize production cutover, migration of the live store dataset, publication of V2 from `main`, a persistence-architecture change, or concurrent operation across origins.

## 2. Reconstructed baseline

### Stable repository state

- `main` remains the stable/original application at commit `9574e3a4097ddd78ab1f75a13b9ea065287946e9`.
- `develop` was the V2 integration branch at the P9 closure commit `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a` when this plan was established.
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
- that deployed commit is six commits behind the P9-closed `develop` baseline and therefore does not contain the final D-026/P9-S5 state.

Vercel's `target: production` label for that project is a hosting-environment label only. It is **not** authorization to treat `easy-v2` as the store's stable production system.

### Persistence and transfer boundary

`main` uses `ResellerManagerDB` Dexie V1 with `items`, `resellers`, `transactions`. Its current export is backup version 1.

V2 uses Dexie V5 with `categories`, `items`, `resellers`, `transactions` and canonical `easy-backup` v2/schema5.

Because IndexedDB is browser-origin-local, publishing V2 at another origin does not migrate the stable dataset. The accepted transfer route for a future cutover is therefore explicit backup/restore, not implicit IndexedDB continuity.

V2 preflight already accepts the `main` backup-v1 envelope and normalizes it losslessly:

- legacy items/resellers without lifecycle state become active;
- legacy transactions without `occurredAt` use their historical `createdAt` as occurrence time;
- no categories or historical category assignments are invented;
- migrated legacy items remain unclassified until the operator classifies them;
- normal new orders remain blocked for unclassified active items under D-025/P1 rules.

### Recovery boundary

D-024 remains authoritative on the V2 origin:

- restore/backup remains reachable when local recovery-health metadata is absent;
- normal data-changing writes are blocked while recovery state is unknown/due/overdue;
- after a restore on a fresh candidate origin, the operator must configure/verify the synchronized recovery-copy destination and create a fresh validated backup before normal writes may continue.

No provider-side sync acknowledgment is implied.

## 3. Pre-cutover blocker found during reconstruction

The current V2 backup validator still contains pre-D-026 correction assumptions in `validateReferences()`:

- replacement type must equal original type;
- replacement order item must equal original item;
- replacement category snapshot must equal original snapshot;
- replacement `occurredAt` must equal original `occurredAt`.

D-026 intentionally permits the effective replacement to change transaction type, order item/category snapshot when selecting a new active/classified item, and financial occurrence date.

Therefore a valid current V2 dataset containing one of those D-026 corrections can conflict with backup self-preflight/export. This is a **cutover/recovery blocker**, because P10 cannot accept a candidate that may be unable to produce a valid recovery artifact after ordinary supported corrections.

The backlink/forward-link requirements themselves remain valid and must not be weakened: replacement/original IDs must exist, the correction/reversal relationship must be bidirectional, chronology must be sane, and each transaction's own target shape/snapshots must remain valid.

## 4. D-027 acceptance model

P10 adopts a fail-closed, rehearsal-before-live model:

1. `main` remains untouched during P10-S1.
2. No live-store backup is exported/imported as part of P10-S1.
3. No stable publication or cutover occurs in P10-S1.
4. The Vercel `easy-v2` project is candidate/beta hosting only.
5. Every candidate must be pinned to an exact `develop` SHA and have passing D-019 evidence.
6. The D-026 backup-validation blocker must be fixed before any migration rehearsal is accepted.
7. The stable→V2 transfer contract is backup-v1 preflight/restore, not direct browser database reuse.
8. First migration rehearsal uses synthetic/non-production backup-v1 data representative of the stable format.
9. D-024 recovery readiness must be established on the candidate origin before any normal post-restore write is accepted.
10. Legacy classification behavior must be rehearsed: no fabricated categories, and active legacy items must be classified before new order entry.
11. Stable publication from `main`, copied-live-data beta, final write freeze and production cutover require a later explicit go/no-go gate.
12. D-016 remains unchanged; P10 does not introduce backend/auth/cloud database/live synchronization.

## 5. First bounded slice — P10-S1

### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `NOT_STARTED`.

Authorized implementation scope:

- update backup validation so valid D-026 linked replacements may change the business fields D-026 explicitly permits;
- preserve bidirectional correction/reversal linkage validation, existence checks, system metadata validity and per-target transaction-shape validity;
- preserve D-025 semantics: same-item replacement may retain historical snapshot; changed/new order item may carry the replacement's valid current snapshot;
- preserve backup-v1 and v2/schema4 migration compatibility;
- add focused regression coverage proving export/preflight accepts valid D-026 type/date/item changes and still rejects broken linkage/invalid shapes;
- run full D-019 before integration;
- no schema, backup-envelope version, Vercel deployment, live data, `main`, D-016 or unrelated runtime change.

Exit criteria:

1. a valid D-026-corrected current dataset exports/self-preflights successfully;
2. import/preflight still rejects broken correction linkage and invalid references/shapes;
3. legacy backup-v1 compatibility remains passing;
4. D-019 passes on the exact integration candidate.

### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `BLOCKED BY P10-S1-I1`.

This is defined but not authorized as the current action.

After I1 is integrated, the next bounded rehearsal may:

- manually deploy an exact D-019-passing `develop` SHA to `easy-v2`;
- verify the deployment SHA rather than relying on an alias;
- use only synthetic/non-production backup-v1 fixture data;
- preflight and restore that fixture into the candidate;
- verify entity/transaction counts and expected legacy normalization;
- establish D-024 recovery health on the candidate origin before normal writes;
- classify representative migrated items and verify new-order gating;
- create supported transactions/corrections, export a V2 backup and prove restore round-trip on disposable candidate data;
- record a go/no-go result for a later copied-live-data beta.

It may not use the live store backup, write to `main`, publish stable V2, or perform final cutover.

## 6. Later P10 work explicitly not authorized yet

The following remain outside P10-S1 and require later canonical authorization:

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

- PR #58 D-019 run **`32290159119`**, job **`96188851730`**;
- validated merge ref **`dbacda8893c6d1073ba130440ef5bcc6ab11af75`**, head `f29de41c6fa668bebfd7a839c2b693eb9d971c55`, base `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- result: **0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS**;
- PR #58 squash-integrated into `develop` as **`5c7a5dc23af435711059deff75cf7862972662a1`**;
- validated merge ref and integrated squash share exact tree **`6afb4e77eecb97d2092d209b12c054ce2b1952db`**.

The integration was documentation-only. No runtime, schema, backup envelope, Vercel deployment, live-store data or `main` change occurred.

## 8. Immediate next action after this contract

Execute only **P10-S1-I1 — Backup/correction compatibility hardening**.

Do not deploy a new Vercel candidate, do not use live-store data, do not modify `main`, and do not start P10-S1-I2 until I1 is integrated with full D-019 evidence.
