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

## P10-S1 source-proven blocker

Inspection of current `backupService.validateReferences()` found pre-D-026 equality checks across correction pairs:

- replacement type must equal original type;
- replacement order item must equal original item;
- replacement category snapshot must equal original snapshot;
- replacement `occurredAt` must equal original `occurredAt`.

Current D-026 intentionally permits those effective replacement business fields to change. Existing backup tests cover a P2 correction pair that preserves those fields, but there is no positive regression proving a D-026 type/date/item-changing correction can export/self-preflight.

This mismatch is classified as a pre-cutover recovery blocker, not accepted warning debt.

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

## P10-S1-I1 required QA

The current authorized implementation must add focused coverage proving:

1. valid D-026 type-changing linked correction passes backup preflight/export;
2. valid D-026 occurrence-date change passes;
3. valid changed-order-item/category snapshot passes when each row is internally valid;
4. broken bidirectional linkage remains rejected;
5. invalid target references/shapes remain rejected;
6. backup-v1 migration behavior remains passing;
7. v2/schema4 compatibility remains passing;
8. full D-019 passes on the exact integration candidate.

No schema/backup-envelope/Vercel/live-data/`main`/D-016 change is authorized by that QA scope.

## Known non-blocking debt

Existing mocked-select hydration warnings, React `act(...)` warnings, `set-state-in-effect` warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible and non-blocking only when the accepted D-019 objective commands pass.
