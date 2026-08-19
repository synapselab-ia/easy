# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-19

`STATUS.md` determines active work. Legacy `tasks/` checkboxes are historical only.

Status vocabulary: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`.

---

## P0–P8

**Status:** `DONE`.

P0 governance, P1 referential lifecycle, P2 audited correction/reversal, P3 financial dates/statements/aging, P4 D-016 architecture decision, P5 backup/restore, P6 D-019 QA/deployment, P7 operational UX and P8 direct-store discovery are complete. Detailed validation remains in `QA_LEDGER.md` and `CHANGELOG.md`.

---

## P9 — Prioritized evidence-backed improvements

**Priority:** High  
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — 2026-08-18.

D-023 order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18.

D-024 selected synchronized recovery-copy folder + exact 24-hour freshness guard while keeping D-016. PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

### P9-S3 — Categories, classification and category reporting

**Status:** `DONE / INTEGRATED` — 2026-08-19.

- Contract / D-025 — `DONE`; PR #44 `ede644b88ad00c11b566d82a21758cc82b7a8126`.
- I1 persistence/migration/backup — `DONE`; PR #45 `d55b13bf5efedb12da937e70afe1e9501d83446b`.
- I2 lifecycle/classification/order snapshots — `DONE`; PR #46 `aafb3e4821e345d320cf3b8f5cc10028e82ad66b`; closure #47 `4191df77db83258f1125bffd445a6ec1f5b46bf9`.
- I3 category order-performance reporting — `DONE`; PR #48 `08ad2973f387035301901f9f46b0c78039796c2d`.

Final I3 D-019 `32262877105` / `96100129962` passed; validated/integrated tree `af7c7e1eaa540f0a2d36e8dbc11d3c547e332e32`.

### P9-S4 — Confirmed correction microflows

**Status:** `BLOCKED — evidence gate accepted/integrated; direct operator confirmation required`.

The evidence/contract gate is complete as far as existing evidence allows:

#### Already supported by current audited correction/reversal

- change reseller on an effective transaction;
- change order quantity;
- change order unit price / total;
- change payment/signal amount;
- pure reversal/cancellation with mandatory reason.

#### Source-proven gaps/constraints requiring direct confirmation

- change `occurredAt` after save;
- change order item after save;
- change transaction type after save;
- change/add observation after save;
- guided-correct an older order after its original item was archived.

P8 confirmed generic real-store edit/correction friction but did not enumerate any of those exact record/action pairs. P9-S1 explicitly recorded that source gaps must not be represented as direct store reports. Therefore there is **no confirmed implementation subset yet**.

The direct intake required to resolve this blocker is in `docs/V2/P9_CORRECTION_EVIDENCE_REQUEST.md`. For each candidate, record whether it actually occurs, approximate frequency, current workaround and business consequence, plus any exact missing case outside the matrix.

Evidence gate proof: D-019 `32265612927` / `96109244644` passed with 0 errors / 81 warnings, 51 files / 210 Vitest, 17/17 Playwright and build PASS. PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`; validated/integrated tree `5789c7863c0a62904b9d18692543f2b288290867`.

No correction runtime, destructive historical editing or new D-number is authorized until direct evidence is received and the bounded mapping/decision gate is rerun.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Verify the existing delayed-entry workflow. Do not add a second date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
