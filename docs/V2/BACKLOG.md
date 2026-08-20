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

P10 is fail-closed. Completion of a prior slice never authorizes the next data/publication boundary implicitly.

Canonical plan: `docs/V2/P10_CUTOVER_PLAN.md`.

### P10-S1 — Pre-cutover compatibility and rehearsal gate

**Status:** `DONE / ACCEPTED` — 2026-08-19.

D-027 kept this slice non-production:

- `main` stayed untouched;
- Vercel `easy-v2` remained candidate/beta hosting only;
- stable→V2 transfer was treated as explicit backup/preflight/restore, never implicit IndexedDB continuity;
- no live-store backup was exported/imported;
- D-016 remained local-first/single-user;
- copied-live-data beta, final freeze, stable publication and production cutover remained later explicit gates.

P10-S1 closed only after both I1 compatibility hardening and I2 deployed synthetic rehearsal succeeded.

#### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED` — 2026-08-19.

Result:

- backup correction validation accepts D-026 type and `occurredAt` changes;
- an order correction may change to another item and carry that replacement item's valid category snapshot;
- an order correction keeping the same `itemId` must preserve the original D-025 category snapshot;
- bidirectional correction/reversal linkage, referenced-ID existence, replacement registration chronology and each transaction's own target shape/reference validity remain enforced;
- backup-v1 and v2/schema4 compatibility remain passing;
- no schema or backup-envelope version changed.

Validation history:

- initial D-019 `32292405631` / `96196002726` correctly blocked an over-broad implementation because one existing P9-S3 same-item snapshot regression failed;
- authoritative D-019 `32292888925` / `96197514379` passed on merge ref `d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; production build PASS;
- PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`;
- validated/integrated tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.

#### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `DONE / REHEARSED` — 2026-08-19.

Candidate identity:

- Vercel deployment **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`** — READY;
- exact candidate Git SHA **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**;
- candidate tree **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**;
- immutable deployment URL required Vercel SSO for `/backup`;
- public alias `easy-v2-tau.vercel.app`, attached by Vercel to the same exact deployment, was used only as the browser-access route while deployment ID/SHA remained the identity proof.

Evidence-only PR #62 was deliberately closed without merge after the rehearsal. Its authoritative run was **`32298906351`**, job **`96216688953`**, exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**, harness head `5e5eaea8fbc51bf52c3e5bfc927b6da178082bda` over candidate base `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`.

The ordinary D-019 gate passed first:

- ESLint: 0 errors / 82 warnings;
- Vitest: 53 files / 222 tests PASS;
- repository Playwright: 17/17 PASS;
- production build: PASS.

The remote P10-S1-I2 rehearsal then passed **1/1** and proved, using only a synthetic backup-v1 fixture:

- v1→v2 preflight/restore and checkpoint creation;
- 2 items / 2 resellers / 3 legacy transactions retained with expected normalization;
- no category history fabricated;
- D-024 blocked normal writes before recovery setup;
- fresh V2 export + explicit synchronized-copy verification established current recovery health;
- migrated unclassified items remained blocked from new orders;
- representative category creation/classification succeeded;
- a supported order and audited D-026 changed-item/date correction succeeded;
- final V2 backup exported successfully;
- a disposable fresh browser context restored that backup and re-exported identical business data.

Diagnostic, non-authoritative attempts are retained for transparency:

- `32297959050` / `96213645569`: D-019 passed, but immutable deployment URL SSO blocked app access before upload/restore;
- `32298286885` / `96214717360`: D-019 passed and v1 preflight was reached, but Playwright viewport actionability blocked the restore click before restore dispatch.

Neither diagnostic attempt was treated as product acceptance evidence.

**P10-S1 result:** GO only for defining the next bounded copied-live-data beta gate. No live-store data was moved.

### P10-S2 — Copied-live-data beta acceptance gate

**Status:** `NOT_STARTED` — **CURRENT**.

The next action is **contract definition only**. Before any real store backup is exported or imported, P10-S2 must define and accept the minimum criteria for a non-production beta using a copy of the live-store dataset, including:

- data-handling and access boundary;
- reconciliation evidence and tolerances;
- D-024/recovery requirements on the beta origin;
- rollback/no-go behavior;
- disposal of copied data and temporary artifacts;
- explicit go/no-go evidence required before any copied-live-data beta may actually occur.

During this contract-definition action, it is **not authorized** to export/import the live-store dataset, modify/publish `main`, publish stable V2, switch the canonical URL, perform production cutover or change D-016.

### Later P10 work

**Status:** `NOT_AUTHORIZED`.

Actual copied-live-data beta execution, real-data reconciliation, final write freeze, `main` publication, canonical URL switch, rollback after production V2 writes and decommissioning of the original stable app remain outside the current action and require later canonical acceptance.
