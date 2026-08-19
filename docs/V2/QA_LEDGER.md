# Easy V2 — QA Ledger

**Updated:** 2026-08-18

This ledger records accepted phase validation and the repository-wide D-019 Critical QA state. Detailed rationale remains in `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md` and phase-specific documents.

## Critical QA contract

D-019 defines the mandatory integration/publication gate:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block integration. Known warning/test-harness/dependency debt remains visible and does not redefine a passing gate.

## P1 — Referential integrity and safe lifecycle

**PASS / DONE.**

- P1-S1 reseller lifecycle: `32037965651`.
- P1-S2 item lifecycle: `32038951903`.
- P1-S3 reference validation/migration: `32039763539`.

## P2 — Correction/reversal

**PASS / DONE.**

- P2-S1 audited reversal: `32041280504`.
- P2-S2 linked/guided replacement: `32042373332`.

## P3 — Dates, statements and aging

**PASS / DONE.**

- P3-S1 occurrence-date model: `32052076684`.
- P3-S2 formal statements/FIFO debt aging: `32053837309`.

## P4 — Persistence architecture

**PASS / DONE as decision work.** D-016 accepts local-first/single-user browser-local persistence until an explicit direct requirement proves a reopen trigger.

## P5 — Backup, restore and migration

**PASS / DONE.**

- P5-S1 versioned backup/preflight: `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof: `32060729538`.

## P6 — Tests, CI and deployment safety

**PASS / DONE.**

- functional Critical QA `32064801009` — PASS;
- final canonical-docs head `32065331102` — PASS;
- post-merge `develop` `32065713920` — PASS.

## P7 — Operational UX refinement

**PASS / DONE.** Final P7-S6 validation `32145620210` passed with 43 Vitest files / 176 tests, 15/15 Playwright and build PASS.

## P8 — Real-store requirements discovery

**PASS / DONE.**

- P8-S1 Critical QA `32149199373`, job `95750510692`;
- P8-S2 Critical QA `32158395391`, job `95781056589`.

## P9 — Prioritized evidence-backed improvements

### P9-S1 — Evidence-backed prioritization

**PASS / DONE.** Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**PASS / DONE.**

- direct recovery target `32175718073`, job `95837062983`;
- D-024 mechanism decision `32177687434`, job `95843265579`;
- accepted P9-S2-I1 runtime gate `32180250834`, job `95851336506` — 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright, build PASS.

PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 contract — Category data/reporting contract

**PASS / DONE as contract work. D-025 accepted.**

Authoritative final contract validation:

- run `32185226251`, job `95867186002` — PASS;
- PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312`;
- ESLint 0 errors / 80 warnings;
- Vitest 44/183 PASS;
- Playwright 17/17 PASS;
- build PASS.

PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`; validated/integrated tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

### P9-S3-I1 — Category persistence + migration + backup compatibility

**PASS / DONE.**

Targeted proof covers real V4→V5 non-inventive migration, schema5 category graph validation, v1/v2-schema4 compatibility, schema5 round-trip, correction snapshot preservation and four-table D-018 rollback/read-back equivalence.

Gate history:

- `32190349921` / `95883095871` — FAIL: obsolete historical assertion still expected current Dexie V4;
- `32190552190` / `95883712396` — FAIL at build only: explicit TypeScript narrowing required;
- functional `32191018791` / `95885134808` — PASS;
- final documentation-complete gate `32191707306` / `95887236403` — PASS on merge ref `a2696dfac0d0dc2d5bc4fb2e89e0f0c0c9677c69`: 0 errors / 81 warnings, 47/195 Vitest, 17/17 Playwright, build PASS.

PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`; validated merge ref and integrated squash share tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

### P9-S3-I2 — Category lifecycle + item assignment + new-order snapshot enforcement

**PASS / DONE / INTEGRATED.**

Targeted proof covers:

- category stable identity across rename and case-insensitive name uniqueness across active/archived identities;
- archive blocked by active item while inactive item may retain archived reference;
- hard deletion blocked by any item or historical order category snapshot and allowed only when unused;
- active-category-only item assignment/reassignment;
- active category requirement on new active item and reactivation;
- migrated active unclassified item remains editable without invented category;
- unclassified legacy item is rejected from a new order;
- new order writes canonical item snapshot plus transaction-time `categoryId + categoryName`;
- later category rename/item reassignment leaves historical snapshot unchanged;
- guided replacement preserves original category snapshot after rename/reassignment;
- payment/signal rows remain category-free;
- D-024 recovery guard remains applied to category/item/transaction writes.

#### Gate and integration history

1. Run `32202062045`, job `95917767742` — **FAIL at Vitest**:
   - 199/205 tests passed;
   - failures exposed pre-I2 success fixtures that created unclassified items/orders, ItemForm fixture/setup mismatches after classification enforcement, and a Dexie `PrematureCommitError` caused by a native async category lookup inside the transaction;
   - the category requirement was not weakened;
   - success fixtures were classified explicitly and the active-category lookup was kept in the Dexie promise/transaction zone.

2. Functional accepted run `32202440100`, job `95918871077` — **PASS** on PR #46 merge ref `c166ad76f62dd892bcdbc547f54acaf1a2afc5c3`:
   - ESLint: 0 errors / 81 warnings;
   - Vitest: 49 files / 205 tests PASS;
   - Playwright Chromium: 17/17 PASS;
   - production build: PASS.

3. Final canonical-documentation run **`32202876262`**, job **`95920142630`** — **PASS** on merge ref `7a8115489aafccf86408a50591fe474dbfb97f5f`, combining head `4591e103fb713f70ba34467a0beae1cb349deb5f` with base `d55b13bf5efedb12da937e70afe1e9501d83446b`:
   - ESLint: **0 errors / 81 warnings**;
   - Vitest: **49 files / 205 tests PASS**;
   - Playwright Chromium: **17/17 PASS**;
   - production build: **PASS**.

PR #46 was squash-integrated into `develop` as **`aafb3e4821e345d320cf3b8f5cc10028e82ad66b`**. Validated merge ref `7a8115489aafccf86408a50591fe474dbfb97f5f` and integrated squash share exact tree **`ddbb14dcc6f66239b5e973f7da8eabb295c2cb49`**.

## Current known non-blocking debt

Existing React `act(...)` warnings, mocked-select DOM/hydration warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy entering P9-S3-I3

P9-S3-I3 must preserve P1–P9-S3-I2 plus D-016/D-017/D-018/D-019/D-024/D-025.

Required reporting proof includes:

- only effective non-reversed `order` transactions contribute;
- `occurredAt` is the time basis;
- grouping uses stored historical `transaction.categoryId`, not current item assignment;
- no-category historical rows remain in `Sem categoria — histórico legado`;
- order count, summed quantity and gross value are correct;
- linked corrections count only effective replacement;
- archived category identity remains reportable;
- payments/signals/balances/FIFO debt are not allocated to categories;
- no historical backfill/recategorization occurs.

Full `npm run qa:critical` remains mandatory before integration.