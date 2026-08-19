# Easy V2 — QA Ledger

**Updated:** 2026-08-19

D-019 remains the mandatory V2 integration/publication gate:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block integration. Existing warning/harness/dependency debt remains visible and does not redefine a passing gate.

## Accepted baseline through P9-S2

- P1 validations: `32037965651`, `32038951903`, `32039763539`.
- P2: `32041280504`, `32042373332`.
- P3: `32052076684`, `32053837309`.
- P5: `32058028793`, `32060729538`.
- P6: `32064801009`, `32065331102`, `32065713920`.
- P7 final: `32145620210`.
- P8-S1/S2: `32149199373` / `95750510692`; `32158395391` / `95781056589`.
- P9-S1: `32166330198` / `95806665221`.
- P9-S2 accepted runtime: `32180250834` / `95851336506`.

## P9-S3 accepted validation

### Contract / D-025

**PASS / DONE.** `32185226251` / `95867186002`; PR #44 integrated as `ede644b88ad00c11b566d82a21758cc82b7a8126`.

### I1 — persistence/migration/backup

**PASS / DONE / INTEGRATED.** Final `32191707306` / `95887236403`; 47 files / 195 Vitest, 17/17 Playwright, build PASS. PR #45 `d55b13bf5efedb12da937e70afe1e9501d83446b`.

### I2 — lifecycle/classification/order snapshots

**PASS / DONE / INTEGRATED.** Final `32202876262` / `95920142630`; 49 files / 205 Vitest, 17/17 Playwright, build PASS. PR #46 `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 `4191df77db83258f1125bffd445a6ec1f5b46bf9`.

### I3 — category order-performance reporting

**PASS / DONE / INTEGRATED.**

Targeted proof covers:

- effective non-reversed orders only;
- `occurredAt` financial time basis;
- grouping by stored historical `transaction.categoryId`, not current item category;
- immutable transaction snapshots across rename/reassignment;
- explicit `Sem categoria — histórico legado` bucket;
- order count, summed quantity and gross value;
- reversed original zero/effective linked replacement once;
- payments/signals excluded;
- archived categories reportable;
- read-only all-time/inclusive-period UI.

Functional gate `32261923163` / `96096954271` — PASS.

**Authoritative final documentation-complete gate:** run **`32262877105`**, job **`96100129962`**, merge ref `e9cb929b0eb8a109a44eba3408e1675249b11fd7`, head `b7e76e56c8049a002243fc693891880ba6bf0a50` over base `4191df77db83258f1125bffd445a6ec1f5b46bf9`:

- ESLint: **0 errors / 81 warnings**;
- Vitest: **51 files / 210 tests PASS**;
- Playwright Chromium: **17/17 PASS**;
- production build: **PASS**.

PR #48 integrated into `develop` as **`08ad2973f387035301901f9f46b0c78039796c2d`**. Validated merge ref and integrated squash share exact tree **`af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`**.

## Current known non-blocking debt

React `act(...)` warnings, mocked-select DOM/hydration warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible. No accepted gate is weakened.

## QA boundary entering P9-S4

Before runtime correction expansion, the first P9-S4 slice must map direct-evidence correction friction to concrete missing operator cases, prove what current reversal/replacement already covers, preserve D-012/D-013 audited history and pass D-019 before integration. P9-S5/P10 and backend/auth/cloud/live-sync remain out of scope.
