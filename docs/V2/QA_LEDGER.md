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

Source reinspection for this gate:

- `TransactionForm.tsx`: current `Data da ocorrência` defaults to today's local date and remains an explicit editable creation field;
- `TransactionCorrectionDialog.tsx`: current guided editor exposes reason, reseller and value/quantity fields only;
- `useTransactions.ts`: current replacement forcibly preserves original type/`occurredAt`, enforces original order item, preserves observation and original order category snapshot;
- `pdfService.ts`: statements use transaction occurrence dates rather than a single print date for movement rows.

Decision result:

- D-026 accepted: effective transaction business fields are correctable through audited linked replacement, never destructive historical overwrite;
- the smallest coherent implementation is one full-field replacement editor rather than independent partial field slices;
- D-025 snapshot semantics and D-024 write guard remain mandatory;
- current active-reference lifecycle rules remain intact; archive-specific exception is not authorized by this gate;
- today's-date default/discoverability signal is deferred to P9-S5.

**Runtime:** unchanged in this decision slice.

### Accepted validation/integration proof

- D-019 run **`32277770945`**, job **`96149101495`**, merge ref **`6a57fbe6b8674aca8723538f756b04f4a5af3f13`**.
- Validated head `50cdab7bfc60d31bd3525ed0d4b66d0c3f8d7070` over base `1221f71de460c266c165b92de0536f443c71fa08`.
- Result: **0 lint errors / 81 warnings; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; production build PASS**.
- PR #52 squash-integrated as **`51f7ffae46432e0b82a696c1ebc07c275d733ed4`**.
- Validated merge ref and integrated squash share exact tree **`c37ea55f83b15415678f5b2be2747fb5f06c6a27`**.
- Earlier runners were delayed in Playwright system-dependency installation before `qa:critical`; the successful run executed the full D-019 and no gate was bypassed.

## Current known non-blocking debt

React `act(...)` warnings, mocked-select DOM/hydration warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible. No accepted gate is weakened.

## QA boundary entering P9-S4-I1

Do not implement destructive transaction editing. I1 must prove original-row immutability, mandatory reason/reversal linkage, target-shape validation, occurrence-date/item/type/observation correction, D-025 category snapshot behavior, D-024 enforcement and rejection of invalid/inactive newly selected references. Full D-019 is mandatory before integration.
