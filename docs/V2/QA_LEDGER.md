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

**PASS / DONE as decision work.** D-016 accepts local-first/single-user persistence until an explicit direct requirement proves a reopen trigger.

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

The first P9-S2-I1 run `32179815390`, job `95849949295`, exposed only a new E2E harness interaction after a correctly rejected mutation left its dialog open; no runtime behavior change was required.

PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`; validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`.

### P9-S3 — Category data/reporting contract

**PASS / DONE as contract work. D-025 accepted; implementation not started.**

Contract-only PR #44 was validated on merge ref `31a4adca45f74e6907cfce079a98c95b2c580738`, merging head `92302c1cfff7c0d0856cd2c124fc4bc5cff1c767` into base `565a5a4b3ed9d52134b276f910669968d2cb2e67`.

Persistent Critical QA run **`32184499171`**, job **`95864903309`** — **PASS**:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **44 files / 183 tests PASS**;
- Playwright Chromium: **17/17 PASS**;
- production build: **PASS**.

Validated contract coverage is documentation/decision-only:

- stable category identity/lifecycle;
- item assignment/reassignment semantics;
- future order category snapshot and non-inventive legacy history;
- order-only category reporting semantics;
- explicit exclusion of category debt/payment allocation;
- lossless Dexie V4 -> V5 target migration;
- `easy-backup` v2/schema5 target while preserving v1 and v2/schema4 imports;
- D-018 future four-table checkpoint/atomic restore extension.

No Dexie V5, category table/field, category UI, category report, backend/auth/cloud/live sync or recovery-guard change was introduced by the contract gate.

The final canonical-document head of PR #44 must also pass D-019 before integration. The validated merge ref for that final head is the integration authority; a stale-base validation is not acceptable.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy entering P9-S3-I1

P9-S3-I1 must preserve P1–P9-S3 contract semantics plus D-016/D-017/D-018/D-019/D-024/D-025.

Required targeted proof includes:

- lossless V4 -> V5 migration with zero invented categories/history;
- category identity/reference/lifecycle validation in schema5 backup preflight;
- continued v1 and v2/schema4 import normalization;
- schema5 export round-trip including categories and optional historical fields;
- D-018 four-table checkpoint/atomic restore rollback and read-back equivalence;
- no regression to recovery-health guard/control metadata separation.

The full `npm run qa:critical` gate remains mandatory before integration.