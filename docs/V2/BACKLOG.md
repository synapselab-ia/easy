# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-18

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

**Status:** `DONE` — 2026-08-17.

- P5-S1 versioned backup/preflight — `DONE`; validation `32058028793`.
- P5-S2 checkpointed atomic restore/migration proof — `DONE`; validation `32060729538`.

## P6 — Tests, CI and deployment safety

**Status:** `DONE` — 2026-08-17.

D-019 established `npm run qa:critical` as the persistent integration/publication gate. Functional validation `32064801009`; post-merge validation `32065713920`.

---

## P7 — Complete incomplete UX flows / operational refinement

**Priority:** High  
**Status:** `IN_PROGRESS`

Goal: complete evidenced operator-facing flows that are incomplete, misleading or materially high-friction without broad visual redesign or speculative feature expansion.

### P7-S1 — Operational UX gap inventory and prioritization

**Status:** `DONE` — 2026-08-17.

D-020 ranks operator-intent/error risk ahead of convenience/cosmetic refinement. Accepted evidence-backed order:

1. transaction-entry intent and feedback;
2. invalid reseller statement range silently falling back to all-time/current view;
3. stale Backup page recovery copy;
4. console-only item/reseller save failures;
5. reseller-context transaction launch friction.

### P7-S2 — Reliable transaction-entry intent and feedback

**Status:** `DONE` — 2026-08-17.

Completed behavior:

- standalone transaction **Cancelar** clears the in-progress form and returns type to the requested `initialType`;
- transaction-create failures are operator-visible and preserve entered data for correction/retry;
- command center has distinct Payment and Signal shortcuts preserving `type=payment` / `type=signal` intent;
- standalone page no longer supplies the inert no-op cancel handler;
- P1/P2/P3 financial/reference/audit semantics remain unchanged.

Coverage added:

- component reset + initial-type preservation;
- real rejected create mutation + visible error + retry-data preservation;
- page integration for `?type=signal`;
- command-center payment/signal routing;
- bounded Playwright Signal shortcut → entered value → Cancel → cleared value / preserved Signal intent.

Validation history:

- `32068747287` — FAIL in the new Cancel test assertion; no product regression established;
- `32069051473` — FAIL in the same new assertion; root cause classified as invalid controlled-Select test harness HTML;
- harness corrected without weakening runtime behavior;
- **`32069261401` — PASS**: 0 lint errors / 78 warnings, 39 Vitest files / 163 tests, 14/14 Playwright, build PASS.

P7-S2 gate: **PASS / DONE**.

### P7-S3 — Explicit invalid reseller statement-range state

**Status:** `DONE` — 2026-08-18.

Completed behavior:

- a complete inverted period becomes visibly invalid immediately;
- invalid dates no longer fall back to current balance or all-time transaction history;
- both date fields expose invalid accessibility state and visible operator guidance;
- PDF generation is disabled while invalid and retains a defensive handler guard;
- correcting the range restores the formal D-015 period statement;
- clearing the range restores the normal current-balance/all-history view;
- valid statement/PDF financial calculations remain unchanged.

Coverage added:

- focused page test for invalid state, suppressed fallback and invalid→corrected recovery;
- focused page test for invalid→cleared recovery;
- bounded Playwright invalid→corrected proof;
- existing D-015 statement tests remain green.

Validation history:

- `32133265871` — FAIL only in a newly added assertion whose fixture was outside the corrected valid period; classified as test-fixture error under D-019;
- fixture aligned with the intended corrected range without runtime changes;
- **`32133559376` — PASS**, job `95699734548`: 0 lint errors / 80 warnings, 39 Vitest files / 164 tests, 14/14 Playwright, build PASS;
- final canonical documentation-head **`32133891691` — PASS**, job `95700749081`;
- PR #15 squash-merged to `develop` as `337de0b6cf18da7cf27c54648839624df46e66ef`; validated PR merge ref and integration commit share tree `3f56eca7cfee1b99cb211a03e8070b956994f027`.

P7-S3 gate: **PASS / DONE**.

### P7-S4 — Align Backup recovery copy with implemented restore

**Status:** `NOT_STARTED` — current next slice.

Bounded scope:

- correct stale Backup page-level wording that still describes restore as future/preflight-only;
- accurately describe the already implemented P5-S2 validated selection, preview, checkpoint download and atomic restore/recovery path;
- change operator-facing copy only; do not alter backup/restore behavior or contracts;
- add the smallest focused regression coverage for the corrected copy;
- run full `npm run qa:critical`.

Out of scope:

- backup format/version changes;
- validation, checkpoint, restore, migration or persistence mechanics;
- item/reseller save error feedback;
- reseller-context launch shortcut;
- financial/correction semantics;
- schema/persistence architecture changes;
- P8/P9 work.

### Later P7 slices

After P7-S4, continue only through the remaining ranked P7-S1 gaps in order unless new repository evidence materially changes their operational priority.

---

## P8 — Real store requirements discovery

**Status:** `NOT_STARTED`.

If discovery proves a D-016 cloud-reopen trigger, persistence architecture must be explicitly reconsidered before multi-user/cloud implementation.

## P9 — Prioritized new modules

**Status:** `NOT_STARTED`.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
