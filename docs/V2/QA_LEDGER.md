# Easy V2 — QA Ledger

**Updated:** 2026-08-18

This ledger records accepted phase validation and the repository-wide D-019 Critical QA state. Detailed historical rationale remains in `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md` and phase-specific discovery documents.

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

- initial repository baseline captured red QA before reconciliation;
- functional Critical QA `32064801009` — PASS;
- final canonical-docs head `32065331102` — PASS;
- post-merge `develop` `32065713920` — PASS.

D-019 remains authoritative.

## P7 — Operational UX refinement

**PASS / DONE.**

- P7-S1 evidence/prioritization: `32066802100` — PASS; D-020 accepted.
- P7-S2 transaction-entry intent/feedback: `32069261401` — PASS, 0 lint errors / 78 warnings, 39 Vitest files / 163 tests, 14/14 Playwright, build PASS.
- P7-S3 invalid statement range: `32133559376` — PASS; final docs `32133891691` — PASS.
- P7-S4 Backup recovery copy: `32136964241` — PASS.
- P7-S5 item/reseller save feedback: `32141425740` — PASS.
- P7-S6 reseller-context transaction launch: `32145620210` — PASS; 43 Vitest files / 176 tests, 15/15 Playwright, build PASS.

QG-011 through QG-015 are resolved and P7 is closed.

## P8 — Real-store requirements discovery

### P8-S1 — Repository evidence

**PASS / DONE.**

- persistent Critical QA `32149199373`, job `95750510692` — PASS;
- ESLint 0 errors / 80 warnings;
- Vitest 43 files / 176 tests PASS;
- Playwright Chromium 15/15 PASS;
- production build PASS;
- PR #23 validated merge ref `ad6745a95c274fcedfb3cc999f5fb924099f9d53`, integrated as `65ada02848ad7ca792889b16815c74d0ac9e6da1`, tree `6bef84c07f236c8df3dea4ce24b4e9028b7bb509`;
- canonical closure run `32150004427`, job `95753223139`, integrated as `2c5f5e92dd66224499ffc55f828d3e220a2afd63`.

D-021 accepted: repository evidence alone does not reopen D-016.

### P8-S2 — Direct real-store validation

The first evidence attempt correctly remained **PASS / BLOCKED** because no direct store evidence existed. Run `32152466007`, job `95761457231`, passed with 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and build PASS. PR #25 integrated as `c8eda199b0a605306619b73f8d3b175f8c673e2f`; blocked-state closure integrated as `5e1b45bef63b8e91c692d35cae9da5c66a905740`.

After direct stakeholder evidence was supplied, P8-S2 resumed and is now **PASS / DONE**.

Accepted direct-validation conclusions:

- current operation does not prove concurrent operators, automatic live multi-device sharing, person-level access/authorship, formal remote recovery SLA or trusted server integrations;
- security-policy incompatibility with browser-local storage remains unresolved/not proven;
- severe device-loss/manual-backup exposure is confirmed as a high-priority operational risk;
- item categories/category reporting are confirmed needs;
- edit/correction friction is confirmed but exact unsupported cases remain to be inventoried;
- delayed financial entry already uses the accepted `occurredAt` capability and is not a missing date model;
- D-022 keeps D-016 for the current operating mode.

Persistent Critical QA run **`32158395391`**, job **`95781056589`** — **PASS** on PR #27 merge ref `b07b6be57c777bbbc0678fa5b7c8d1b7afdfdb83`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **43 files / 176 tests PASS**;
- Playwright Chromium: **15/15 PASS**;
- production build: **PASS**.

PR #27 was squash-merged as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`. The validated merge ref and integration share tree **`2f14efe36e7d59c12a59cfa88066961b99416cf4`**, proving the integrated P8-S2 decision is byte-for-byte the validated content.

Existing non-blocking debt remains visible: React `act(...)` warnings, legacy mocked-select DOM warnings, 17 dependency-audit findings (2 low, 4 moderate, 11 high), Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning. No gate was weakened.

**P8 result: PASS / DONE.**

## Resolved baseline gaps

QG-001 through QG-015 are resolved by P1–P7. P8 is a requirements/architecture evidence gate rather than a new QG runtime remediation phase.

## QA policy entering P9

P9-S1 is prioritization-only. It must preserve P1–P8 contracts, keep D-016 authoritative unless later direct evidence proves a reopen trigger, and must not implement recovery architecture, category schema/runtime changes, backend/auth/cloud/live synchronization or broader business modules. Full `npm run qa:critical` remains mandatory before every integration.