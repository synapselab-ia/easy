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
**Status:** `IN_PROGRESS`.

### P9-S1 — Evidence-backed prioritization

**Status:** `DONE` — 2026-08-18. D-023 order: recovery durability 94/100; categories/reporting 83/100; correction microflows 70/100; occurrence-date usability 69/100.

### P9-S2 — Recovery durability

**Status:** `DONE` — 2026-08-18. D-024 implemented synchronized recovery-copy folder + exact 24-hour freshness guard while keeping D-016.

### P9-S3 — Categories, classification and category reporting

**Status:** `DONE / INTEGRATED` — 2026-08-19.

D-025 is fully implemented through I1 persistence/migration/backup, I2 lifecycle/classification/order snapshots and I3 read-only category order-performance reporting.

### P9-S4 — Confirmed correction microflows

**Status:** `DONE / INTEGRATED` — 2026-08-19.

#### Evidence/source mapping gate

**Status:** `DONE / INTEGRATED`.

PR #50 proved current correction support and source constraints, then direct operator evidence resolved the remaining requirement blocker.

#### Direct evidence + D-026 decision

**Status:** `DONE / INTEGRATED`.

Direct operator evidence confirmed that operator-entered transaction business data must remain correctable after entry without destructive overwrite of prior history. D-026 selected one coherent full-field audited replacement editor and retained D-012/D-013, D-024, D-025 and P1/D-011 boundaries.

Decision proof: D-019 `32277770945` / `96149101495`, merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13`, PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`; validated/integrated tree `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

#### P9-S4-I1 — Full-field audited transaction replacement editor

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Implemented scope:

- replacement may define reseller, target type, `occurredAt`, observation;
- target order may define item, quantity and unit price/derived total;
- target payment/signal may define movement value and carries no order-shape fields;
- original row remains immutable and is auditedly reversed with mandatory reason;
- replacement remains linked and atomic under D-012/D-013;
- D-024 write guard remains mandatory;
- unchanged order item preserves original D-025 item/category snapshot;
- changed/new order item must be active/classified and captures the target current snapshot;
- type changes enforce target-shape validity;
- unavailable historical order items cannot be silently reused, but the editor can select another valid item or another target type without weakening lifecycle rules;
- focused tests prove D-026 behavior and the repository-wide D-019 gate passed.

Validation/integration proof:

- D-019 run `32285620846`, job `96174326588`, merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`;
- result: 0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #54 squash-integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`;
- validated merge ref and integrated squash tree: `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

Explicitly not introduced: destructive in-place history mutation, editable audit metadata, lifecycle weakening, schema/backup changes, P9-S5/P10 work, backend/auth/cloud/live synchronization.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Direct operator evidence specifically recalls the system presenting today's date by default in routine contexts. Current transaction creation initializes `Data da ocorrência` to today. Verify that the field remains clearly discoverable/editable and persists as financial occurrence independently from registration time. If a real usability gap is found, make only the smallest evidence-backed adjustment; do not add another date model or change D-014/P3 semantics.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
