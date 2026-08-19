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

- Contract / D-025: `32185226251` / `95867186002`; PR #44.
- I1 persistence/migration/backup: final `32191707306` / `95887236403`; PR #45.
- I2 lifecycle/classification/order snapshots: final `32202876262` / `95920142630`; PR #46; closure #47.
- I3 category reporting: authoritative final `32262877105` / `96100129962`; 51 files / 210 Vitest, 17/17 Playwright, build PASS; PR #48.

## P9-S4 accepted validation

Initial evidence/source gate: D-019 `32265612927` / `96109244644`; PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`.

D-026 decision gate: D-019 `32277770945` / `96149101495`; PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.

P9-S4-I1 full-field audited replacement:

- PR #54 D-019 run `32285620846`, job `96174326588`.
- Validated merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`.
- ESLint: 0 errors / 82 warnings.
- Vitest: 52 files / 216 tests PASS.
- Playwright: 17/17 PASS.
- Production build: PASS.
- PR #54 squash-integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`.
- Validated/integrated tree: `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## P9-S5 occurrence-date usability verification — PASS / DONE / INTEGRATED

Source verification established that the normal `TransactionForm` already defaults `Data da ocorrência` to today's browser-local date, displays it in the primary transaction-entry block, permits direct pre-save editing, distinguishes financial occurrence from automatic registration time, and persists selected `occurredAt` independently from generated `createdAt` under D-014/P3.

No evidence-backed runtime gap was found and no production source file was changed.

Authoritative proof:

- PR #56 D-019 run `32287018048`, job `96178850066`.
- Validated PR merge ref `9459285920cfbd784a652e9db97cf40741977edf`.
- ESLint: 0 errors / 82 warnings.
- Vitest: 52 files / 217 tests PASS.
- Playwright: 17/17 PASS.
- Production build: PASS.
- PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`.
- Validated/integrated tree: `97a78d3e4d78a54ad117440c160920343513ba9f`.

P9 canonical closure integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

## P10-S1 pre-cutover contract — evidence reconstruction

P10-S1 reconstructed the actual stable/integration/deployment/recovery boundary before authorizing any data movement:

- stable `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- completed-P9 `develop`: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- `develop` was 55 commits ahead of `main` when the contract was established;
- both branches are currently unprotected;
- current `main` GitHub Pages workflow builds/deploys on push without the V2 D-019 quality stage;
- V2 `develop` deploy workflow contains `quality -> build -> deploy` for eventual stable publication;
- Vercel `easy-v2` Git deployment is disabled and the latest observed READY candidate points to `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind completed P9;
- stable `main` emits backup v1; V2 preflight explicitly accepts v1 and normalizes lifecycle/occurrence data without inventing category history;
- D-024 permits restore on a fresh origin but blocks normal writes until recovery readiness is established.

## P10-S1 contract validation — PASS / INTEGRATED

Authoritative contract proof:

- PR #58 D-019 run **`32290159119`**, job **`96188851730`**.
- Validated PR merge ref **`dbacda8893c6d1073ba130440ef5bcc6ab11af75`**, combining head `f29de41c6fa668bebfd7a839c2b693eb9d971c55` with base `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 217 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #58 squash-integrated as **`5c7a5dc23af435711059deff75cf7862972662a1`**.
- Validated merge ref and integrated squash share exact tree **`6afb4e77eecb97d2092d209b12c054ce2b1952db`**.
- Contract integration was documentation-only; no Vercel candidate, runtime, live data or `main` change occurred.

## P10-S1-I1 — backup/correction compatibility hardening

### Source-proven blocker

Before I1, `backupService.validateReferences()` still imposed pre-D-026 equality across correction pairs for replacement type, order item/category snapshot and `occurredAt`. D-026 permits those effective business fields to change, so a valid corrected V2 dataset could conflict with backup self-preflight/export.

The authorized QA required:

1. valid D-026 type-changing linked correction passes backup preflight/export;
2. valid D-026 occurrence-date change passes;
3. valid changed-order-item/category snapshot passes when each row is internally valid;
4. broken bidirectional linkage remains rejected;
5. invalid target references/shapes remain rejected;
6. backup-v1 migration behavior remains passing;
7. v2/schema4 compatibility remains passing;
8. full D-019 passes on the exact integration candidate.

### Initial D-019 — FAIL / BLOCKING

- Run `32292405631`, job `96196002726`.
- The five new P10-S1-I1 focused tests passed.
- Full Vitest failed one existing P9-S3 regression: `rejects a linked order correction that rewrites the historical category snapshot`.
- Cause: the first implementation removed category-snapshot equality unconditionally, which over-relaxed D-025 for an order correction keeping the same item.
- Because `npm run qa:critical` is chained, this objective Vitest failure blocked integration; Playwright/build were not accepted from this candidate.

The failure was resolved by narrowing the validator: type, `occurredAt` and item changes remain allowed under D-026, but order→order correction keeping the same `itemId` must preserve the original D-025 category snapshot. Changed-item order replacements may carry the new target item's valid snapshot.

### Authoritative D-019 — PASS / DONE / INTEGRATED

- PR #60 D-019 run **`32292888925`**, job **`96197514379`**.
- Validated PR merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**.
- Validated head `666e4c86df7c6328289d489db7c8eebcb714aad1` over base `a549ce79925aad0cae9e964babd28879e8ad1c15`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **53 files / 222 tests PASS**.
- Focused `backupService.p10s1.test.ts`: **5/5 PASS**.
- Existing `categoryBackupService.test.ts`: **8/8 PASS**, including same-item historical snapshot rejection.
- Existing backup-v1 and v2/schema4 migration compatibility coverage remained passing in the full suite.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #60 squash-integrated into `develop` as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**.
- Validated merge ref and integrated squash share exact tree **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

The unusually long pre-QA duration in the authoritative run came from external Playwright/Ubuntu font-package installation. No validation requirement was bypassed.

P10-S1-I1 therefore satisfies all exit criteria. No schema, backup-envelope, Vercel, live-store-data, `main` or D-016 change occurred.

## Boundary entering P10-S1-I2

P10-S1-I2 is now `NOT_STARTED` and is the current bounded action. It must use an exact D-019-passing candidate and synthetic/non-production backup-v1 fixture data only. It may exercise deployment, migration/recovery rehearsal, D-024 recovery setup, classification gating, supported transaction/correction flows, V2 export and disposable restore round-trip.

Live-store data, stable `main` publication, production cutover and D-016 changes remain unauthorized.

## Known non-blocking debt

Existing mocked-select hydration warnings, React `act(...)` warnings, `set-state-in-effect` warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible and non-blocking only when the accepted D-019 objective commands pass.
