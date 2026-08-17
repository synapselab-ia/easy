# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-17

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0 — State and governance

**Status:** `DONE` — 2026-08-17.

## P1 — Referential integrity and safe entity lifecycle

**Status:** `DONE` — 2026-08-17.

- P1-S1 safe reseller lifecycle — `DONE`.
- P1-S2 safe item lifecycle — `DONE`.
- P1-S3 referential validation/migration — `DONE`.

## P2 — Correction, reversal and audit trail

**Status:** `DONE` — 2026-08-17.

- P2-S1 audited reversal — `DONE`.
- P2-S2 linked/guided replacement — `DONE`.

## P3 — Dates, balances and financial statements

**Status:** `DONE` — 2026-08-17.

- P3-S1 occurrence-date model/backward migration — `DONE`.
- P3-S2 formal statements/total debt/FIFO aging — `DONE`.

## P4 — Persistence architecture decision: local vs cloud

**Status:** `DONE` — 2026-08-17.

D-016 keeps V2 local-first/single-user on Dexie V4 until an explicit cloud/auth reopen trigger is proven.

## P5 — Backup, restore and migration

**Priority:** High  
**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

P5 gate: versioned export -> validated preview -> downloaded checkpoint -> verified atomic restore reproduces the canonical dataset/invariants.

---

## P6 — Tests, CI and deployment safety

**Priority:** High  
**Status:** `DONE`  
**Completed:** 2026-08-17

Goal achieved: the repository-wide critical suite is reconciled and publication from `main` is gated on the same accepted QA command used during integration.

### P6-S1 — Reconcile repository-wide QA baseline and deployment safety

**Status:** `DONE`

Baseline captured before expectation changes:

- lint: 81 errors;
- Vitest: 10 failed / 149 passed;
- Playwright: 10 failed / 3 passed;
- production build: pass.

Classification and remediation:

- stale provider/router/mocking/jsdom harness expectations were corrected;
- ambiguous/obsolete UI selectors were updated to current accessible UI contracts;
- the PDF zero-movement E2E was updated to D-015 statement semantics rather than changing product behavior;
- a real command-center integration bug was fixed by disabling `cmdk` internal filtering where Dexie `useSearch` already owns the result set;
- existing lint debt that would require broad behavior-changing refactors remains visible as warnings, while objective errors remain blocking.

Persistent gate:

```text
npm run qa:critical
= lint + full Vitest + Playwright Chromium + production build
```

Infrastructure:

- `.github/workflows/ci.yml` runs Critical QA on PRs to `develop`/`main`, pushes to `develop` and manual dispatch;
- `.github/workflows/deploy.yml` requires `quality -> build -> deploy` on pushes to `main`;
- CI/deploy use Node 22, `npm ci` and explicit Playwright Chromium installation.

Acceptance gate:

- [x] scripts/lint/Vitest/Playwright/deployment workflow inventoried first;
- [x] initial full baseline captured before edits;
- [x] every failure classified as regression vs stale test/tooling expectation;
- [x] stale Vitest harness/expectations reconciled;
- [x] stale E2E selectors/expectations reconciled;
- [x] real command-center double-filter regression fixed;
- [x] ESLint has 0 blocking errors; known debt remains visible as warnings;
- [x] full Vitest passes — 39 files / 159 tests;
- [x] full Playwright Chromium passes — 13 tests;
- [x] production build passes;
- [x] one reproducible `qa:critical` command exists;
- [x] V2 integration has a persistent Critical QA workflow;
- [x] `main` Pages publication cannot proceed before Critical QA passes;
- [x] persistent functional run `32064801009` passes.

P6 gate: **PASS / DONE**.

---

## P7 — Complete incomplete UX flows / operational refinement

**Status:** `NOT_STARTED`.

Goal: complete evidenced operator-facing flows that are incomplete, misleading or materially high-friction without turning P7 into a visual redesign or speculative feature phase.

### P7-S1 — Operational UX gap inventory and prioritization

**Status:** `NOT_STARTED`

Expected work:

- inspect existing operator-facing flows against P1–P6 contracts and current tests/UI;
- identify incomplete, misleading or materially high-friction interactions;
- separate genuine workflow gaps from cosmetic preferences;
- rank evidenced gaps by operational impact, error risk and frequency;
- record one bounded first implementation slice for the next action;
- do not implement new business modules or begin P8 discovery in this inventory slice.

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
