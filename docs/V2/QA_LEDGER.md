# Easy V2 — QA Ledger

**Updated:** 2026-08-18

This ledger records accepted phase validation and the repository-wide D-019 Critical QA state. Detailed historical rationale remains in `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md` and phase-specific documents.

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

P7-S1 through P7-S6 passed their accepted gates; final P7-S6 validation `32145620210` passed with 43 Vitest files / 176 tests, 15/15 Playwright and build PASS. QG-011 through QG-015 are resolved.

## P8 — Real-store requirements discovery

**PASS / DONE.**

- P8-S1 persistent Critical QA `32149199373`, job `95750510692`; D-021 accepted.
- P8-S2 persistent Critical QA `32158395391`, job `95781056589`; PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; D-022 accepted.

## P9 — Prioritized evidence-backed improvements

### P9-S1 — Evidence-backed prioritization

**PASS / DONE.**

Persistent Critical QA run **`32166330198`**, job **`95806665221`** — PASS on PR #31 merge ref `85ffa8430de4c4b8a6ffedd84cc27b8049bf63d4`: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and production build PASS.

PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

### P9-S2 — Recovery durability decision gate

#### Historical blocked evidence attempt

**PASS / BLOCKED ON DIRECT EVIDENCE — closed historical state.**

Persistent Critical QA run **`32168368086`**, job **`95813314347`** — PASS on PR #33 merge ref `cbc96eefb315c29c266b1df978bda605c2907352`: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and build PASS.

PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; validated merge ref and integration share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

#### Direct recovery-target evidence intake — 2026-08-18

**PASS / DONE as evidence intake. P9-S2 itself remains IN_PROGRESS.**

Accepted direct evidence:

- newest usable off-device recovery copy no more than **24 hours** old;
- manual restore on **any computer** acceptable;
- daily demand / multi-day recovery incompatible, with no invented numeric hour-based RTO;
- Google Drive acceptable as durable destination;
- local PC file acceptable as convenience copy;
- provider-operated remote recovery not mandatory;
- ChatGPT Google-account connectivity is not Easy Drive authorization.

Persistent Critical QA run **`32175718073`**, job **`95837062983`** — **PASS** on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #35 was squash-merged into `develop` as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`. The validated merge ref and integrated commit share exact tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

The integrated content is therefore exactly the evidence content accepted by D-019. No mechanism comparison, selection or implementation occurred; no runtime/schema/backup-contract/backend/auth/cloud/live-sync change occurred; D-016 remains authoritative entering the mechanism decision gate.

The next P9-S2 slice is decision-only and must itself pass D-019 before integration.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy while P9-S2 is active

Every P9 slice must preserve P1–P9-S1 contracts, keep D-016 authoritative unless a later accepted decision proves a reopen trigger, and run full `npm run qa:critical` before integration. Documentation-only evidence and decision slices are not exempt.