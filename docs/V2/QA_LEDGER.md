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

- PR #54 D-019 run **`32285620846`**, job **`96174326588`**.
- Validated merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 216 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #54 squash-integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`.
- Validated/integrated tree: `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## P9-S5 occurrence-date usability verification — PASS / DONE / INTEGRATED

Direct evidence reconstructed from the canonical P9 correction evidence record: the operator recalled today's-date default behavior in routine entry and was unsure whether it still existed.

Source verification established that the normal `TransactionForm` already:

- defaults `Data da ocorrência` to today's browser-local date;
- displays the field in the primary transaction-entry block;
- permits direct pre-save editing;
- shows helper text distinguishing financial occurrence from automatic registration time;
- persists selected `occurredAt` independently from generated `createdAt` under D-014/P3.

No evidence-backed runtime gap was found and no production source file was changed.

Focused proof added in `TransactionForm.occurrence.test.tsx` for:

- current-local-date default;
- discoverable financial-vs-registration helper;
- pre-save date editability;
- existing selected-date persistence independence.

### Authoritative P9-S5 validation/integration proof

- PR #56 D-019 run **`32287018048`**, job **`96178850066`**.
- Validated PR merge ref **`9459285920cfbd784a652e9db97cf40741977edf`**, combining head `fef66eb8da6602f0804d0c78eb3d6c30feaf2cac` with base `716fc3b9ec77bada5ca44d992a6760a276e38cfa`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 217 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #56 squash-integrated into `develop` as **`88c70a20071bd97ef3a08285128756e2ce484a74`**.
- Validated merge ref and integrated squash share exact tree **`97a78d3e4d78a54ad117440c160920343513ba9f`**.

The new focused test itself passed. Existing mocked-select hydration warnings, React `act(...)` warnings, `set-state-in-effect` warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible and non-blocking under the accepted D-019 policy.

## P9 QA result

P9-S1 through P9-S5 have accepted validation/integration evidence. P9 is complete.

## QA boundary entering P10

P10 remains `NOT_STARTED`. Any controlled-beta, migration, cutover or publication change must preserve D-019 as an objective integration/publication gate and may not treat completion of P9 as implicit authorization for production data movement or `main` publication.
