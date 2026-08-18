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
**Status:** `DONE` — 2026-08-18.

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

**Status:** `DONE` — 2026-08-18.

Completed behavior:

- stale top-level Backup wording no longer describes restore as future/preflight-only;
- page guidance now accurately describes validated selection/preflight, preview gating, automatic recoverable v2 checkpoint download and atomic restore;
- the copy explicitly states rollback-safe preservation of the prior database when write/verification fails;
- P5-S1/P5-S2 backup, validation, checkpoint, restore and migration behavior remain unchanged.

Coverage added:

- `BackupPage.test.tsx` proves the implemented recovery sequence is described and the obsolete “futura restauração” wording is absent.

Validation history:

- **`32136964241` — PASS**, job `95710456305`: 0 lint errors / 80 warnings, 40 Vitest files / 165 tests, 14/14 Playwright, build PASS.

P7-S4 gate: **PASS / DONE**.

### P7-S5 — Operator-visible item/reseller save failures

**Status:** `DONE` — 2026-08-18.

Completed behavior:

- rejected item create mutations surface their domain/persistence error through `toast.error`;
- rejected item edit mutations surface their domain/persistence error through `toast.error`;
- rejected reseller create mutations surface their domain/persistence error through `toast.error`;
- rejected reseller edit mutations surface their domain/persistence error through `toast.error`;
- failed saves do not call the success close/reset path, so current form values remain available for correction/retry;
- P1 lifecycle/reference rules and existing `useItems` / `useResellers` persistence semantics remain unchanged.

Coverage added:

- `ItemForm.test.tsx`: rejected create + retained name/price; rejected edit + retained edited name/price;
- new `ResellerForm.test.tsx`: rejected create + retained name/phone/email/notes; rejected edit + retained edited values;
- existing page-level create/edit/lifecycle integrations remain green.

Validation history:

- **`32141425740` — PASS**, job `95724735659`: 0 lint errors / 80 warnings, 41 Vitest files / 169 tests, 14/14 Playwright, build PASS.

P7-S5 gate: **PASS / DONE**.

### P7-S6 — Reseller-context transaction launch without redundant reselection

**Status:** `DONE` — 2026-08-18.

Completed behavior:

- active reseller detail exposes `Novo lançamento` and carries `resellerId` into the existing transaction page;
- `TransactionsPage` accepts only positive integer reseller context and initializes the form with it;
- `TransactionForm` preselects that reseller and preserves the same context across Cancel/success reset;
- standalone transaction entry remains unselected without valid reseller context;
- contextual initialization does not bypass P1 validation: inactive and missing IDs remain invalid and cannot create transactions;
- inactive reseller detail keeps new contextual launch disabled;
- command-center shortcuts, P2/P3 financial/audit/occurrence semantics, hooks, Dexie schema/persistence and backup/restore remain unchanged.

Coverage added:

- reseller-detail active navigation + inactive launch block;
- transaction-page valid context + malformed standalone fallback;
- transaction-form active context preservation + inactive/missing rejection;
- one bounded Playwright reseller-detail → transaction-entry → Cancel/context-preserved flow.

Validation history:

- **`32145620210` — PASS**, job `95738535732`: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests, 15/15 Playwright, build PASS.

P7-S6 gate: **PASS / DONE**.

### P7 closure

QG-011 through QG-015 from the accepted P7-S1 inventory are all resolved. P7-S6 did not evidence an additional material in-scope P7 gap and the repository-wide critical gate remains green. **P7 is closed as `DONE`.**

---

## P8 — Real store requirements discovery

**Status:** `DONE` as evidence/decision work — 2026-08-18; canonical D-019/integration closure pending.

### P8-S1 — Evidence-based repository discovery and D-016 reopen assessment

**Status:** `DONE` — 2026-08-18.

Completed discovery:

- inspected canonical V2 documents, original repository prompts, historical PRDs, README and repository issues;
- recorded the evidence matrix in `docs/V2/P8_DISCOVERY.md`;
- confirmed project intent for administrator workflows, desktop/mobile use, PDF sharing, JSON backup/portability and current reporting/analytics;
- identified reseller direct mobile use as a material but under-specified historical intent that conflicts with the earlier explicit single-user/no-auth model;
- separated repository-backed product intent from direct real-store validation;
- assessed every D-016 reopen trigger and found none proven by currently available repository evidence;
- accepted D-021: D-016 remains authoritative until direct store evidence resolves operator/device/sharing/access/recovery constraints.

No runtime, backend/auth/cloud/synchronization, Dexie migration or P9 module work was performed.

### P8-S2 — Direct real-store validation and D-016 keep/reopen decision

**Status:** `DONE` as evidence/decision work — 2026-08-18; integration QA/closure evidence pending.

The first P8-S2 attempt was correctly closed as `BLOCKED` because no direct real-store evidence had been supplied. It passed D-019 (`32152466007`) and its canonical blocked-state closure integrated as `5e1b45bef63b8e91c692d35cae9da5c66a905740`.

P8-S2 then resumed after a direct stakeholder supplied the evidence packet in the project conversation.

#### Current operation confirmed

- Easy is operated by Duda and store owners;
- concurrent operation on one dataset is not currently required;
- current use is on a PC;
- the same live dataset is not currently required automatically on multiple devices at the same time;
- resellers do not need interactive access; PDF/extract sharing is sufficient;
- JSON/manual off-device handling is the current backup/portability mechanism;
- no trusted server integration is currently mandatory;
- approximate scale is at most ~100 resellers, around ~50 active, with modest daily entry volume.

#### Recovery risk confirmed

If the operating PC fails before the current JSON has been copied to Drive, the store can lose the working dataset and may have to reconstruct tens of thousands of reais in sales. Human-memory-dependent off-device backup is therefore a confirmed critical business-continuity risk.

Numeric RPO/RTO, provider-operated recovery and a formal remote-recovery SLA were not supplied. Recovery durability becomes a high-priority product input, but the explicit D-016 remote-recovery-SLA trigger is not proven.

#### Confirmed unmet product needs

- create/manage item categories;
- assign items to categories such as bronze or porcelain;
- analyze/filter/report financial activity by category;
- identify and resolve several small edit/correction microflow gaps after exact unsupported record/action cases are inventoried.

The stakeholder also reported needing to register sales using an earlier financial date because Duda commonly records them later. Current V2 already exposes `Data da ocorrência` and persists `occurredAt`, so this is a discoverability/usability verification item, not a missing date-model capability.

#### Future preferences, not mandatory current requirements

- eventually reduce/eliminate dependence on manual JSON handling;
- consider accounts/permissions later for security if Easy becomes broader/networked;
- potentially expand into orders, inventory and broader store organization.

#### D-016 direct-evidence disposition

| D-016 trigger | P8-S2 result |
| --- | --- |
| Concurrent operators | **NOT PROVEN** — no current concurrency requirement. |
| Automatic live multi-device sharing | **NOT PROVEN** — no current simultaneous shared-live-state requirement. |
| Person-level authorship/access control | **NOT PROVEN** — future conditional preference only. |
| Remote recovery SLA | **NOT PROVEN** — severe recovery risk confirmed; formal SLA/RPO/RTO unresolved. |
| Trusted server integrations | **NOT PROVEN** — none currently required. |
| Security policy incompatible with browser-local storage | **UNRESOLVED / NOT PROVEN** — no competent policy evidence supplied. |

**Architecture outcome: KEEP D-016.** D-022 records that direct store evidence does not prove a present reopen trigger. No backend, authentication, cloud database, live synchronization or Dexie migration is authorized by P8-S2.

### P8 closure outcome

P8 now has sufficient direct evidence to close the current store-requirements/architecture gate. Recovery durability, category modeling/reporting and exact edit/correction friction become evidence-backed P9 prioritization inputs. Broader systemization remains future direction.

No runtime/schema/persistence/backend/auth/cloud/synchronization or P9 implementation is included in P8-S2. Full D-019 `npm run qa:critical` remains mandatory before integration.

---

## P9 — Prioritized evidence-backed improvements

**Status:** `NOT_STARTED`.

### P9-S1 — Evidence-backed prioritization only

**Status:** `NOT_STARTED`.

Required prioritization inputs from P8, without implementation:

1. **Recovery durability / off-device protection** — highest known operational consequence because manual JSON/Drive handling has a catastrophic human-dependent failure mode.
2. **Item categories and category reporting** — category creation, item classification and category-level financial analysis/reporting.
3. **Exact edit/correction microflows** — direct evidence confirms friction, but exact record/action pairs must be inventoried first.
4. **Occurrence-date discoverability** — verify whether the existing `Data da ocorrência` capability is visible/usable enough; do not rebuild the already implemented P3 model.

Lower-confidence/later candidates unless new evidence makes them mandatory:

- accounts/permissions;
- automatic live synchronization;
- broader order/inventory/store-management modules;
- external integrations.

P9-S1 is prioritization only. Do not change runtime, schema, persistence architecture, backend/auth/cloud or implement a business module in that slice. Full `npm run qa:critical` remains mandatory before integration.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.