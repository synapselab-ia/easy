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

**Status:** `CONTRACT ACCEPTED / INTEGRATED` — 2026-08-19.

Accepted D-027 boundary:

- keep `main` untouched during this slice;
- treat Vercel `easy-v2` as candidate/beta hosting only;
- pin any candidate deploy to an exact D-019-passing `develop` SHA;
- use explicit backup/restore as the stable→V2 transfer route; do not assume IndexedDB moves across origins;
- no live-store backup export/import in P10-S1;
- preserve D-016 local-first/single-user architecture;
- copied-live-data beta, final freeze, stable publication and cutover require a later explicit go/no-go.

Reconstructed baseline:

- `main`: `9574e3a4097ddd78ab1f75a13b9ea065287946e9`;
- P9-closed `develop`: `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`;
- `develop` was 55 commits ahead of `main` when the contract was established;
- latest observed `easy-v2` candidate remains the historical READY deployment at `1221f71de460c266c165b92de0536f443c71fa08` until an explicit I2 refresh;
- Vercel Git deployment is disabled by `vercel.json`, so candidate deployment remains manual;
- stable `main` exports backup v1; V2 preflight accepts that envelope and normalizes lifecycle/occurrence fields without inventing categories/history;
- D-024 recovery readiness must be re-established on a fresh candidate origin before normal writes.

Contract validation/integration proof:

- D-019 `32290159119` / `96188851730` on merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`;
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`;
- validated/integrated tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

#### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Result:

- backup correction validation now accepts D-026 type changes and `occurredAt` changes;
- an order correction may change to another item and carry that replacement item's valid category snapshot;
- an order correction that keeps the same `itemId` must still preserve the original D-025 category snapshot;
- bidirectional correction/reversal linkage, referenced-ID existence, replacement registration chronology and each transaction's own target shape/reference validity remain enforced;
- backup-v1 and v2/schema4 compatibility remain passing;
- no schema or backup-envelope version changed.

Focused P10-S1-I1 regression coverage proves valid type/date/item-changing linked corrections preflight/export successfully and broken linkage/invalid target shape remain rejected. Existing D-025 and legacy migration suites remain green.

Validation history:

- initial D-019 `32292405631` / `96196002726` blocked integration because the first implementation over-relaxed same-item category-snapshot preservation; five new P10 tests passed, but one existing P9-S3 regression correctly failed;
- the runtime change was narrowed to preserve same-item D-025 history;
- authoritative D-019 `32292888925` / `96197514379` passed on merge ref `d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`;
- validated/integrated tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.

Exit criteria are satisfied. No Vercel, live-data, `main`, schema/envelope or D-016 change occurred.

#### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `NOT_STARTED` — **CURRENT**.

Authorized next scope under D-027:

- manually deploy an exact D-019-passing `develop` SHA to `easy-v2`;
- verify the deployed SHA rather than relying on an alias;
- use only synthetic/non-production backup-v1 fixture data;
- preflight and restore that fixture into the candidate;
- verify entity/transaction counts and expected legacy normalization;
- establish D-024 recovery health on the candidate origin before normal writes;
- classify representative migrated items and verify new-order gating;
- exercise supported transaction/correction flows;
- export a V2 backup and prove disposable restore round-trip;
- record a go/no-go result for a later copied-live-data beta.

It may not use the live store dataset, modify or publish `main`, publish stable V2, perform final cutover or change D-016.

### Later P10 work

**Status:** `NOT_AUTHORIZED`.

Copied-live-data beta, real-data reconciliation, final write freeze, `main` publication, canonical URL switch, rollback after production V2 writes and decommissioning of the original stable app remain outside the current slice and require later canonical acceptance.
