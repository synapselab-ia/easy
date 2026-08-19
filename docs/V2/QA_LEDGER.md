# Easy V2 — QA Ledger

**Updated:** 2026-08-19

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

## P1–P8 accepted baseline

- P1-S1 `32037965651`; P1-S2 `32038951903`; P1-S3 `32039763539`.
- P2-S1 `32041280504`; P2-S2 `32042373332`.
- P3-S1 `32052076684`; P3-S2 `32053837309`.
- P4 D-016 decision work — PASS/DONE.
- P5-S1 `32058028793`; P5-S2 `32060729538`.
- P6 functional `32064801009`, canonical-docs `32065331102`, post-merge `32065713920`.
- P7 final `32145620210` — 43 files / 176 Vitest, 15/15 Playwright, build PASS.
- P8-S1 `32149199373` / `95750510692`; P8-S2 `32158395391` / `95781056589`.

## P9 accepted baseline

### P9-S1 — prioritization

**PASS / DONE.** `32166330198`, job `95806665221`; PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — recovery durability

**PASS / DONE.** Direct target `32175718073` / `95837062983`; D-024 decision `32177687434` / `95843265579`; accepted runtime `32180250834` / `95851336506`. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 contract — D-025

**PASS / DONE.** Final contract `32185226251` / `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

### P9-S3-I1 — persistence/migration/backup

**PASS / DONE / INTEGRATED.** Final documentation-complete gate `32191707306` / `95887236403`: 0 errors / 81 warnings, 47 files / 195 Vitest PASS, 17/17 Playwright PASS, build PASS. PR #45 integrated as `d55b13bf5efedb12da937e70afe1e9501d83446b`; validated/integrated tree `7ae465da19e2716caace781c9dbdcf073226af5a`.

### P9-S3-I2 — lifecycle/classification/order snapshots

**PASS / DONE / INTEGRATED.** First run `32202062045` / `95917767742` correctly failed at Vitest and exposed stale pre-I2 fixtures plus a Dexie transaction-zone issue; contract was not weakened. Functional accepted `32202440100` / `95918871077` passed. Final documentation-complete `32202876262` / `95920142630` passed with 0 errors / 81 warnings, 49 files / 205 Vitest PASS, 17/17 Playwright PASS, build PASS. PR #46 integrated as `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; canonical closure #47 integrated as `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

### P9-S3-I3 — category order-performance reporting

**FUNCTIONAL PASS / IN_REVIEW.** Documentation-complete D-019 and integration remain required.

Targeted proof in PR #48 covers:

- only effective non-reversed `order` rows contribute;
- period filtering uses `transactionOccurredAt()` / `occurredAt`, not registration time;
- grouping uses immutable historical `transaction.categoryId`, never current item classification;
- category rename affects only current display label for the stable ID and does not rewrite transaction snapshots;
- missing historical snapshot is grouped as `Sem categoria — histórico legado`;
- minimum metrics are order count, summed quantity and gross order value;
- reversed original contributes zero and effective linked replacement contributes once;
- payments/signals do not enter reporting;
- archived categories remain reportable;
- UI exposes read-only all-time or inclusive occurrence-period analysis.

#### Functional gate

Run **`32261923163`**, job **`96096954271`** — **PASS** on PR #48 merge ref `02d656ea771e334622a6248139b508e20a98caf1`, combining head `01fcd986ed86fbe465592af3c5600a2570380ee8` with base `4191df77db83258f1125bffd445a6ec1f5b46bf9`:

- ESLint: **0 errors / 81 warnings**;
- Vitest: **51 files / 210 tests PASS**;
- Playwright Chromium: **17/17 PASS**;
- production build: **PASS**.

The functional gate validates the runtime/test head before canonical documentation updates. It is not the authority for final integration after documentation commits.

#### Required final gate

The complete PR #48 head containing runtime, targeted tests and canonical documentation must pass a fresh D-019. Only that exact validated head may be integrated. After merge, canonical closure must record integrated commit and tree equivalence before P9-S3 is declared DONE.

## Current known non-blocking debt

Existing React `act(...)` warnings, mocked-select DOM/hydration warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA boundary while closing P9-S3-I3

Preserve P1–P9-S3-I2 plus D-016/D-017/D-018/D-019/D-024/D-025. Do not start P9-S4/P9-S5/P10, allocate payments/debt to categories, backfill/recategorize history, or introduce backend/auth/cloud/live synchronization before I3 integration is canonically closed.
