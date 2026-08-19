# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-19

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0–P8

**Status:** `DONE`.

P0 governance, P1 referential lifecycle, P2 audited correction/reversal, P3 financial dates/statements/aging, P4 D-016 architecture decision, P5 backup/restore, P6 D-019 QA/deployment, P7 operational UX and P8 direct-store discovery are complete.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `DONE / INTEGRATED` — 2026-08-19.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — 2026-08-18. D-023 order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18. D-024 implemented synchronized recovery-copy folder + exact 24-hour freshness guard while keeping D-016.

### P9-S3 — Categories, classification and category reporting

**Status:** `DONE / INTEGRATED` — 2026-08-19.

D-025 is fully implemented through I1 persistence/migration/backup, I2 lifecycle/classification/order snapshots and I3 read-only category order-performance reporting.

### P9-S4 — Confirmed correction microflows

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Direct operator evidence confirmed that transaction business data must remain correctable after entry without destructive overwrite of history. D-026 was accepted and P9-S4-I1 implemented the complete audited replacement-state editor while preserving D-012/D-013, D-024, D-025 and P1/D-011 boundaries.

Final runtime proof: D-019 `32285620846` / `96174326588`, merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`, PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`, tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

### P9-S5 — Occurrence-date usability verification

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Direct evidence was narrow: routine transaction entry presented today's date by default and the operator was unsure whether that behavior still existed.

Verification result: **no runtime usability gap found**.

Current transaction entry already:

- defaults `Data da ocorrência` to today's browser-local date;
- shows the field in the primary entry block beside reseller/type;
- allows direct editing before save;
- explains that it is the financial date and that registration time is saved automatically;
- persists selected `occurredAt` independently from generated `createdAt` under D-014/P3.

A focused regression test was added for today-default, discoverability/helper and pre-save editability. No production source file changed.

Validation/integration proof:

- D-019 run `32287018048`, job `96178850066`, merge ref `9459285920cfbd784a652e9db97cf40741977edf`;
- result: 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #56 squash-integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`;
- validated/integrated tree: `97a78d3e4d78a54ad117440c160920343513ba9f`.

Detailed verification record: `docs/V2/P9_DATE_USABILITY.md`.

Because P9-S1 through P9-S5 are complete, P9 is complete.

---

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.

P10 is the next phase. It was not started by P9-S5. `STATUS.md` defines the exact next action and remains authoritative.
