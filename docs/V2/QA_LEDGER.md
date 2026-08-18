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

Persistent Critical QA run `32175718073`, job `95837062983` passed on PR #35: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and production build PASS. PR #35 integrated as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`; validated merge ref and integration share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`.

#### Recovery mechanism comparison/decision

**PASS / DONE as decision work. D-024 accepted.**

Persistent Critical QA run `32177687434`, job `95843265579` passed on PR #37: 0 lint errors / 80 warnings, 43/176 Vitest, 15/15 Playwright and production build PASS. PR #37 integrated as `cb873b7ee4456ed8e5c00ace90f3926337c42bf4`; validated merge ref and integration share exact tree `6e7f6431c3dbdac8c58654d20873149efea2786c`.

#### P9-S2-I1 — Recovery-copy freshness guard and synchronized-folder workflow

**PASS / DONE. P9-S2 is closed.**

Implemented coverage includes:

- local fail-safe recovery-health state;
- first-run/unknown and corrupt-metadata behavior;
- setup verification requirement;
- non-contractual 20-hour warning and exact 24-hour hard boundary;
- export refresh after overdue state;
- centralized normal-write blocking;
- Backup/Restore escape path while writes are blocked;
- exact generated backup filename/export timestamp display;
- preservation of D-017/D-018 behavior.

The first PR #39 Critical QA run **`32179815390`**, job **`95849949295`**, failed in one newly added Playwright scenario after lint and all Vitest tests passed. The application correctly kept the rejected reseller-create dialog open after the recovery guard blocked the write; the E2E then attempted to click the global banner through that modal overlay. This was classified as a new-test harness interaction, not a runtime regression. Only the E2E was changed to dismiss the dialog before testing the Backup/Restore escape route.

Accepted persistent Critical QA run **`32180250834`**, job **`95851336506`** — **PASS** on PR #39 merge ref `2455d5528e42d58dee43fb4b0f100741a705fe6a`:

- ESLint: **0 errors / 80 warnings**;
- Vitest: **44 files / 183 tests PASS**;
- Playwright Chromium: **17/17 PASS**;
- production build: **PASS**.

PR #39 was squash-merged into `develop` as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`. The validated merge ref and integrated commit share exact tree `72b26596b44f2425f9b8b2d833eee0027ea8405e`, proving exact accepted-content equivalence.

No Dexie V5, backup-envelope change, Drive API/OAuth, backend/auth/cloud/live synchronization or provider-side sync verification was introduced.

## Current known non-blocking debt

Existing React `act(...)` warnings, legacy mocked-select DOM warnings, dependency-audit findings, Actions/runtime deprecation notices, existing lint warnings and the Vite large-chunk warning remain visible under D-019. No accepted gate is weakened.

## QA policy entering P9-S3

P9-S3 is a category contract slice and must preserve P1–P9-S2 plus D-016/D-017/D-018/D-019/D-024. It must not implement category schema/runtime behavior before the contract is accepted. The full `npm run qa:critical` gate remains mandatory even for documentation-only contract work.