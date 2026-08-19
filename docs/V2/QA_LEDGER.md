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

## P9-S4 initial evidence/source gate — ACCEPTED / INTEGRATED

PR #50 mapped current correction support and five source-proven constraints, but correctly kept runtime blocked because direct store evidence had not identified exact post-save correction cases.

D-019 `32265612927` / `96109244644`: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**. PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`; validated/integrated tree `5789c7863c0a62904b9d18692543f2b288290867`.

Canonical closure #51 was validated on retry `32269262365` / `96121383857` and integrated as `1221f71de460c266c165b92de0536f443c71fa08`; merge-ref/integrated tree `7a7551f2815f9338d8b906a2bb6bf1e1d66c8ff2`.

## P9-S4 direct evidence + D-026 decision gate — PASS / DONE / INTEGRATED

Direct operator clarification received 2026-08-19 resolved the blocker:

- the operator could not quantify individual wrong-item/type/observation/archive frequencies from memory;
- the operator specifically recalled today's-date default behavior as the practical date concern;
- the operator then confirmed the actual product requirement: business information entered into the system needs to remain editable after entry, without requiring prior history to be overwritten.

Decision result:

- D-026 accepted: effective transaction business fields are correctable through audited linked replacement, never destructive historical overwrite;
- the smallest coherent implementation is one full-field replacement editor rather than independent partial field slices;
- D-025 snapshot semantics and D-024 write guard remain mandatory;
- current active-reference lifecycle rules remain intact; archive-specific exception is not authorized by this gate;
- today's-date default/discoverability signal is deferred to P9-S5.

### Accepted decision validation/integration proof

- D-019 run `32277770945`, job `96149101495`, merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13`.
- Result: 0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS.
- PR #52 squash-integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.
- Validated merge ref and integrated squash tree: `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

## P9-S4-I1 full-field audited replacement — PASS / DONE / INTEGRATED

Implementation under D-026 was intentionally bounded to the transaction replacement domain/UI and tests. No schema, migration, backup, P9-S5/P10, backend/auth/cloud/live-sync or destructive-history change was introduced.

Focused proof added for:

- changing target type, `occurredAt`, observation and reseller/value state;
- changing order item with current active/classified validation;
- preserving historical D-025 item/category snapshot when the same item is kept;
- recapturing current D-025 item/category snapshot when the item changes;
- stripping/rejecting order-shape fields for payment/signal targets;
- original business-row immutability and reversal/replacement linkage;
- atomic rollback on invalid targets;
- inactive newly selected item rejection;
- D-024 freshness guard blocking replacement writes.

### Authoritative implementation validation/integration proof

- PR #54 D-019 run **`32285620846`**, job **`96174326588`**.
- Validated PR merge ref **`4b51a5f35c2104d636903ce89eecbc995a0f3ce3`**, combining head `a4f0b026e14fc85bd02eee56db262b5271507b3c` with base `0f3ec562717c75981802f330d64410ee612a034d`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 216 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #54 squash-integrated into `develop` as **`f1cfd126c18691da1256a1d3f918158d7aa9495a`**.
- Validated merge ref and integrated squash share exact tree **`5679693b5f588f58404050cfca8ffd17a9a49fb3`**.

The warning delta includes the new correction editor's same non-blocking `set-state-in-effect` lint class plus existing test/harness/dependency/runtime warnings; there were no lint errors and the complete gate passed.

## Current known non-blocking debt

React `act(...)` warnings, `set-state-in-effect` warnings, mocked-select DOM/hydration warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible. No accepted gate is weakened.

## QA boundary entering P9-S5

P9-S5 must verify the current `Data da ocorrência` today-default/discoverability/editability workflow and preserve D-014/P3 separation between financial occurrence and registration/audit time. If no evidence-backed usability gap exists, no runtime change is required. Any runtime change still requires full D-019 before integration.
