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

**Status:** `IN_PROGRESS`.

#### Evidence/source mapping gate

**Status:** `DONE / INTEGRATED`.

PR #50 proved current support and source constraints. The prior blocker required direct operator evidence.

#### Direct evidence + D-026 decision

**Status:** `DONE / INTEGRATED`.

Direct operator evidence received 2026-08-19 confirms the actual requirement: operator-entered transaction business data must remain correctable after entry, while prior history does not need to be overwritten.

Frequency/workaround/consequence for individual fields were not known and are not inferred. The date-default concern is retained for P9-S5.

D-026 selects one coherent implementation instead of partial field slices. Decision proof: D-019 `32277770945` / `96149101495`, merge ref `6a57fbe6b8674aca8723538f756b04f4a5af3f13`, PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`; validated/integrated tree `c37ea55f83b15415678f5b2be2747fb5f06c6a27`.

#### P9-S4-I1 — Full-field audited transaction replacement editor

**Status:** `NOT_STARTED`.

Authorized scope:

- replacement may define reseller, target type, `occurredAt`, observation;
- target order may define item, quantity and unit price/derived total;
- target payment/signal may define movement value;
- original row remains immutable and is auditedly reversed with mandatory reason;
- replacement remains linked and atomic under D-012/D-013;
- D-024 write guard remains mandatory;
- unchanged order item preserves original D-025 item/category snapshot;
- changed/new order item must be active/classified and captures the target current snapshot;
- type changes enforce target-shape validity;
- targeted tests + full D-019 required.

Out of scope:

- destructive in-place history mutation;
- editing IDs/`createdAt`/reversal or correction metadata;
- weakening P1/D-011 lifecycle rules for inactive entities;
- schema or backup changes;
- P9-S5/P10;
- backend/auth/cloud/live synchronization.

The archive-specific correction case was not confirmed as a recurring store incident; it remains an explicit lifecycle edge rather than a reason to weaken active-reference rules in I1.

### P9-S5 — Occurrence-date usability verification

**Status:** `NOT_STARTED`.

Direct operator evidence specifically recalls the system presenting today's date by default in routine contexts. Current transaction creation still initializes `Data da ocorrência` to today. Verify that workflow after P9-S4; do not add another date model.

## P10 — Controlled beta, migration and cutover

**Status:** `NOT_STARTED`.
