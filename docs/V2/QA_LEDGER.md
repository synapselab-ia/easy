# Easy V2 — QA Ledger

**Updated:** 2026-08-18

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

**PASS / DONE.** Final P7-S6 validation `32145620210` passed with 43 Vitest files / 176 tests, 15/15 Playwright and build PASS. QG-011 through QG-015 are resolved.

## P8 — Real-store requirements discovery

**PASS / DONE.**

- P8-S1 persistent Critical QA `32149199373`, job `95750510692`; D-021 accepted.
- P8-S2 persistent Critical QA `32158395391`, job `95781056589`; D-022 accepted.

## P9 — Prioritized evidence-backed improvements

### P9-S1 — Evidence-backed prioritization

**PASS / DONE.**

Persistent Critical QA run `32166330198`, job `95806665221` passed on PR #31. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

### P9-S2 — Recovery durability

#### Historical blocked evidence attempt

**PASS / historical blocked state closed.**

Run `32168368086`, job `95813314347` passed on PR #33. PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; validated merge ref and integration share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

#### Direct recovery-target evidence intake

**PASS / DONE as evidence intake.**

Persistent Critical QA run **`32175718073`**, job **`95837062983`** — PASS on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`; validated merge ref and integration share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

#### Recovery mechanism comparison/decision

**PASS / DONE as decision work.** D-024 accepted; P9-S2 runtime implementation remains pending.

Persistent Critical QA run **`32177687434`**, job **`95843265579`** — **PASS** on PR #37 merge ref `79552f7912307db88272e075b2320cade02f6f17`:

- ESLint: 0 errors / 80 warnings;
- Vitest: 43 files / 176 tests PASS;
- Playwright Chromium: 15/15 PASS;
- production build: PASS.

PR #37 was squash-merged into `develop` as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`. The validated merge ref and integrated commit share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

Accepted decision scope was documentation only:

- select synchronized recovery-copy folder + 24-hour freshness guard;
- keep D-016;
- preserve D-017/D-018;
- no Google Drive API/OAuth, backend/auth/cloud/live synchronization, File System Access baseline, Dexie migration or backup-format change;
- authorize only bounded P9-S2-I1 after canonical closure.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy while P9-S2-I1 is active

P9-S2-I1 must preserve P1–P9-S1 and D-016/D-017/D-018/D-019/D-024. It must run full `npm run qa:critical` before integration. Recovery health tests must include first-run/unknown state, the 24-hour boundary, export refresh and guaranteed Backup/Restore access when health is unknown/overdue.