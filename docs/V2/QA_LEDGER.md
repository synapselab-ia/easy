# Easy V2 — QA Ledger

**Updated:** 2026-08-18

This ledger records accepted phase validation and the repository-wide D-019 Critical QA state. Detailed historical rationale remains in `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md` and phase-specific discovery/prioritization documents.

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

**PASS / DONE as decision work.** D-016 accepts local-first/single-user Dexie V4 until an explicit direct requirement proves a reopen trigger.

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

**PASS / DONE.**

- P7-S1 evidence/prioritization: `32066802100` — PASS; D-020 accepted.
- P7-S2 transaction-entry intent/feedback: `32069261401` — PASS.
- P7-S3 invalid statement range: `32133559376` — PASS; final docs `32133891691` — PASS.
- P7-S4 Backup recovery copy: `32136964241` — PASS.
- P7-S5 item/reseller save feedback: `32141425740` — PASS.
- P7-S6 reseller-context transaction launch: `32145620210` — PASS; 43 Vitest files / 176 tests, 15/15 Playwright, build PASS.

QG-011 through QG-015 are resolved and P7 is closed.

## P8 — Real-store requirements discovery

**PASS / DONE.**

### P8-S1 — Repository evidence

- persistent Critical QA `32149199373`, job `95750510692` — PASS;
- PR #23 integrated as `65ada02848ad7ca792889b16815c74d0ac9e6da1`;
- canonical closure run `32150004427`, job `95753223139`.

D-021 accepted: repository evidence alone does not reopen D-016.

### P8-S2 — Direct real-store validation

The first evidence attempt correctly remained PASS / BLOCKED until direct store evidence existed (`32152466007`, job `95761457231`). After stakeholder evidence was supplied, P8-S2 resumed and completed.

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; validated merge ref and integration share tree `2f14efe36e7d59c12a59cfa88066961b99416cf4`. Canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

D-022 keeps D-016 for current operation. Recovery durability and category reporting are evidence-backed P9 inputs; exact correction cases still require bounded confirmation.

## P9 — Prioritized evidence-backed improvements

### P9-S1 — Evidence-backed prioritization

**PASS / DONE.**

Scope was documentation/decision only. `docs/V2/P9_PRIORITIZATION.md` records:

- weighted ranking: recovery durability 94, categories/reporting 83, exact correction microflows 70, occurrence-date usability 69;
- current-source proof that items/resellers already have edit flows;
- current-source proof that guided transaction correction cannot change `occurredAt`, order item, transaction type or observation and is blocked when the original order item is inactive;
- current-source proof that delayed-entry creation already exposes/persists `Data da ocorrência` / `occurredAt`;
- D-023 ordering and strict no-runtime/no-schema/no-backend/no-cloud P9-S1 boundary.

Persistent Critical QA run **`32166330198`**, job **`95806665221`** — **PASS** on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`. The validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`, so the integrated content is exactly the content accepted by D-019.

P9-S1 is closed. P9-S2 remains `NOT_STARTED` until its own decision/evidence slice begins.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy entering P9-S2

Every P9 slice must preserve P1–P9-S1 contracts, keep D-016 authoritative unless later direct evidence proves a reopen trigger, and run full `npm run qa:critical` before integration. Documentation-only decision slices are not exempt.