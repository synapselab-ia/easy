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

D-019 remains authoritative.

## P7 — Operational UX refinement

**PASS / DONE.** Final P7-S6 validation `32145620210` passed with 43 Vitest files / 176 tests, 15/15 Playwright and build PASS. QG-011 through QG-015 are resolved.

## P8 — Real-store requirements discovery

**PASS / DONE.**

- P8-S1 Critical QA `32149199373`, job `95750510692`; D-021 accepted.
- P8-S2 Critical QA `32158395391`, job `95781056589`; D-022 accepted.

## P9 — Prioritized evidence-backed improvements

### P9-S1 — Evidence-backed prioritization

**PASS / DONE.** Critical QA `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**PASS / DONE.**

- historical blocked evidence attempt `32168368086`, job `95813314347` — PASS;
- direct recovery-target evidence `32175718073`, job `95837062983` — PASS;
- D-024 mechanism decision `32177687434`, job `95843265579` — PASS;
- accepted P9-S2-I1 runtime gate `32180250834`, job `95851336506` — PASS with 0 lint errors / 80 warnings, 44/183 Vitest, 17/17 Playwright and build PASS.

PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`; validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

### P9-S3 contract — Category data/reporting contract

**PASS / DONE as contract work. D-025 accepted.**

An early contract-only run `32184499171`, job `95864903309`, passed before canonical closure. The authoritative final contract validation is:

- run **`32185226251`**, job **`95867186002`** — PASS;
- PR #44 merge ref `ab910d1fbfbe2a007bc35e7bd8784e7697283312`;
- ESLint: 0 errors / 80 warnings;
- Vitest: 44 files / 183 tests PASS;
- Playwright Chromium: 17/17 PASS;
- production build: PASS.

PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`. Validated merge ref and integrated squash share exact tree `676f70baa62a46cc353d756a2ff5624295d699c8`.

No runtime/schema/UI/reporting change was part of the contract gate.

### P9-S3-I1 — Category persistence + migration + backup compatibility

**FUNCTIONAL PASS / canonical closure in progress.**

Implemented targeted coverage proves:

- real Dexie V4 -> V5 upgrade creates an empty category table without inventing item/order classification;
- V4 IDs, dates, item snapshots and P1/P2/P3 fields survive migration;
- schema5 category IDs/names/references/lifecycle constraints are validated;
- active item -> inactive category is rejected while inactive item -> archived category remains valid;
- order category snapshot fields must appear together;
- payment/signal category fields are rejected;
- linked order correction cannot rewrite the original category snapshot;
- existing v2/schema4 backup normalizes to V5 with `categories = []` and absent category fields;
- schema5 backup/restore round-trip preserves categories/references/snapshots;
- D-018 checkpoint contains all four tables;
- simulated restore write failure rolls back categories together with items/resellers/transactions;
- normal order creation remains category-neutral in I1 while guided correction preserves already-present snapshots.

#### Gate history

1. Run `32190349921`, job `95883095871` — **FAIL** after lint and Vitest:
   - lint passed;
   - 194/195 Vitest passed;
   - sole failure was the historical P3 migration test still asserting final `db.verno === 4`; migration behavior itself passed;
   - only the obsolete expected current schema number was changed to 5.

2. Run `32190552190`, job `95883712396` — **FAIL at build only**:
   - ESLint: 0 errors / 81 warnings;
   - Vitest: 47 files / 195 tests PASS;
   - Playwright: 17/17 PASS;
   - TypeScript build rejected insufficient static narrowing of `rawCategories: unknown`;
   - only explicit type narrowing was added; validation/runtime semantics were unchanged.

3. Functional accepted run **`32191018791`**, job **`95885134808`** — **PASS** on PR #45 merge ref `c6891b5f7e01c6d36ea71fdfb52571e805d7655d`, merging head `8bbbf145937eef37cea73a7fbb7280e2af599d55` into base `ede644b88ad00c11b566d82a21758cc82b7a8126`:
   - ESLint: **0 errors / 81 warnings**;
   - Vitest: **47 files / 195 tests PASS**;
   - Playwright Chromium: **17/17 PASS**;
   - production build: **PASS**.

The extra lint warning versus the previous 80-warning baseline is a test-only `no-explicit-any` warning in the adapted `backupService.test.ts` mock. It is visible non-blocking debt under D-019; there are zero lint errors.

The final head after canonical documentation updates must pass a fresh full D-019 against the current `develop` base before integration. That final merge ref, not the functional pre-documentation merge ref, is the integration authority.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings, the added test-mock `any` warning and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy entering P9-S3-I2

P9-S3-I2 must preserve P1–P9-S3-I1 plus D-016/D-017/D-018/D-019/D-024/D-025.

Required targeted proof includes:

- category lifecycle identity/name/archive/reactivation/delete guards;
- active-category-only item assignment/reassignment;
- classification requirement for new/reactivated business-use items;
- migrated unclassified legacy items remain readable and are blocked only from new-order participation until classified;
- new order resolves active item/category and writes immutable `categoryId + categoryName` snapshot;
- reassignment/rename does not rewrite old transactions;
- correction keeps original category snapshot;
- D-017/D-018 schema5 and D-024 recovery guard do not regress.

Category reporting remains outside I2. Full `npm run qa:critical` remains mandatory before integration.