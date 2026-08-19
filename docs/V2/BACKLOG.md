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

D-026 is fully implemented through the audited full-field replacement editor while preserving D-012/D-013, D-024, D-025 and P1/D-011 boundaries.

Final runtime proof: D-019 `32285620846` / `96174326588`, merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`, PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`, tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

### P9-S5 — Occurrence-date usability verification

**Status:** `DONE / INTEGRATED` — 2026-08-19.

No runtime usability gap was found. Transaction entry already defaults `Data da ocorrência` to today's browser-local date, exposes it in the primary block, allows editing before save, distinguishes financial date from registration time, and persists `occurredAt` independently from `createdAt`.

Validation/integration proof: D-019 `32287018048` / `96178850066`; PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`; tree `97a78d3e4d78a54ad117440c160920343513ba9f`.

Detailed verification record: `docs/V2/P9_DATE_USABILITY.md`.

---

## P10 — Controlled beta, migration and cutover

**Status:** `IN_PROGRESS` — 2026-08-19.

P10 starts with a fail-closed pre-cutover gate. Completion of P9 does not authorize live-store data movement or stable publication.

Canonical plan: `docs/V2/P10_CUTOVER_PLAN.md`.

### P10-S1 — Pre-cutover compatibility and rehearsal gate

**Status:** `CONTRACT ACCEPTED / IMPLEMENTATION NOT_STARTED`.

Accepted D-027 boundary:

- keep `main` untouched during this slice;
- treat Vercel `easy-v2` as candidate/beta hosting only;
- pin any future candidate deploy to an exact D-019-passing `develop` SHA;
- use explicit backup/restore as the stable→V2 transfer route; do not assume IndexedDB moves across origins;
- no live-store backup export/import in P10-S1;
- preserve D-016 local-first/single-user architecture;
- copied-live-data beta, final freeze, stable publication and cutover require a later explicit go/no-go.

Reconstructed baseline:

- `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- P9-closed `develop`: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- `develop` is 55 commits ahead of `main`;
- current `easy-v2` Vercel deployment is stale at `1221f71de460c266c165b92de0536f443c71fa08`, six commits behind completed P9;
- Vercel Git deployment is disabled by `vercel.json`, so candidate deployment remains manual;
- stable `main` exports backup v1; V2 preflight accepts that envelope and normalizes lifecycle/occurrence fields without inventing categories/history;
- D-024 recovery readiness must be re-established on a fresh candidate origin before normal writes.

#### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `NOT_STARTED` — **CURRENT**.

Problem proven by source reconstruction: current backup `validateReferences()` still requires correction replacements to preserve type, item/category snapshot and `occurredAt`, while D-026 permits those effective business fields to change. This can make a valid D-026-corrected V2 dataset conflict with backup self-preflight/export.

Authorized scope:

- align backup validation with D-026;
- retain bidirectional correction/reversal linkage checks, referenced-ID existence, chronology and target-shape/reference validity;
- retain D-025 snapshot semantics for same-item vs changed/new-item replacements;
- retain backup-v1 and v2/schema4 compatibility;
- add focused positive/negative regression coverage;
- run full D-019;
- no schema/envelope/Vercel/live-data/`main`/D-016 change.

Exit criteria:

1. valid D-026 type/date/item replacement datasets export/self-preflight;
2. broken linkage and invalid target shapes/references remain rejected;
3. legacy backup migration tests remain passing;
4. full D-019 passes on the exact integration candidate.

#### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `BLOCKED BY P10-S1-I1`.

Defined for sequencing only; not the current action. After I1 is integrated it may use an exact validated `develop` SHA and synthetic/non-production backup-v1 fixture data to rehearse Vercel candidate deployment, v1→V2 preflight/restore, D-024 setup, legacy classification gating, supported transaction/correction flows, backup export and disposable restore round-trip.

It may not use the live store dataset, modify `main`, publish stable V2 or perform final cutover.

### Later P10 work

**Status:** `NOT_AUTHORIZED`.

Copied-live-data beta, real-data reconciliation, final write freeze, `main` publication, canonical URL switch, rollback after production V2 writes and decommissioning of the original stable app remain outside P10-S1 and require later canonical acceptance.
