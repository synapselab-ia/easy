# Easy V2 — Canonical Backlog

**Status:** canonical ordered backlog  
**Updated:** 2026-08-20

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

- P9-S1 evidence-backed prioritization: `DONE`; D-023 order recovery 94, categories 83, correction 70, occurrence-date usability 69.
- P9-S2 recovery durability: `DONE`; D-024 synchronized recovery-copy folder + exact 24-hour freshness guard.
- P9-S3 categories/classification/reporting: `DONE / INTEGRATED`; D-025 fully implemented.
- P9-S4 correction microflows: `DONE / INTEGRATED`; D-026 full-field audited replacement integrated.
- P9-S5 occurrence-date usability: `DONE / INTEGRATED`; no runtime gap found.

Final P9 integration evidence remains canonical in `QA_LEDGER.md` and `CHANGELOG.md`.

---

## P10 — Controlled beta, migration and cutover

**Status:** `IN_PROGRESS`.

P10 is fail-closed. Completion of a prior slice never authorizes the next data/publication boundary implicitly.

Canonical sequencing: `docs/V2/P10_CUTOVER_PLAN.md`.  
Current copied-data contract: `docs/V2/P10_S2_BETA_GATE.md`.

### P10-S1 — Pre-cutover compatibility and rehearsal gate

**Status:** `DONE / ACCEPTED` — 2026-08-19.

D-027 kept this slice non-production. `main` stayed untouched, no live-store backup moved, Vercel remained candidate/beta only and D-016 stayed local-first/single-user.

#### P10-S1-I1 — Backup/correction compatibility hardening

**Status:** `DONE / INTEGRATED`.

Backup correction validation now accepts supported D-026 type/date/item changes while preserving D-025 same-item snapshot rules, linkage/reference integrity and compatibility. Authoritative D-019 `32292888925` / `96197514379`; PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`.

#### P10-S1-I2 — Non-production migration/recovery rehearsal

**Status:** `DONE / REHEARSED`.

Exact rehearsed candidate: Vercel deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`, Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`, tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`.

Evidence-only PR #62 authoritative run `32298906351` / `96216688953` first passed D-019 and then the remote synthetic rehearsal 1/1. It proved v1→v2 preflight/restore, checkpoint creation, expected normalization, no fabricated categories, D-024 blocking/setup, unclassified-item gating, representative classification/order/D-026 correction, V2 export and fresh-context restore/re-export with identical business data.

Canonical P10-S1 closure PR #63 integrated as `816794694d0a9b6c92da273a81ee745c2f53ecdc`, tree `417dd4097144d9f69124161b34747b3e81244ae7`.

**P10-S1 result:** GO only to define the copied-live-data beta contract. No live-store data moved.

### P10-S2 — Copied-live-data beta acceptance contract

**Status:** `DONE / ACCEPTED` — 2026-08-20.  
**Decision:** D-028.  
**Runtime/data movement in this slice:** none.

The accepted contract is `docs/V2/P10_S2_BETA_GATE.md`.

D-028 establishes:

- stable remains the only authoritative production system throughout copied-data beta;
- one exact D-019-passing Git SHA/tree and READY deployment must be proven before export;
- beta is single-operator, isolated and point-in-time under D-016;
- copied real data may exist only on the trusted operator machine/browser origin and existing D-024 synchronized-recovery boundary;
- raw/identifiable real data is prohibited from GitHub, CI artifacts, chat and canonical docs;
- source artifact identity uses timestamp/file-size/SHA-256 metadata without payload disclosure;
- only accepted v1 lifecycle/`occurredAt` normalization warnings are allowed;
- structural reconciliation must be exact across entity/type counts, IDs, references and stored business values;
- financial reconciliation must be exact for orders, payments, signals, net movement, every reseller balance and aggregate positive debt; any R$ 0,01 displayed difference is NO-GO;
- D-018 checkpoint and D-024 blocking/setup/current-state proof are required before beta writes;
- a post-reconciliation V2 export is the beta rollback baseline;
- minimum disposable classification/order/D-026 correction and final fresh-context round-trip checks are required;
- any mismatch, unexpected warning, isolation breach or stable-origin write is fail-closed;
- beta-specific copied data must be disposed from operator-controlled locations within 24 hours after acceptance/rejection/abandonment;
- only sanitized metadata/hashes/counts/PASS-FAIL evidence remains in the repository.

Contract acceptance itself does **not** authorize production cutover, `main` publication, canonical URL switch or D-016 change.

### P10-S2-I1 — Copied-live-data beta execution

**Status:** `NOT_STARTED` — **CURRENT**.

Execution sequence is fixed by D-028:

1. re-verify exact candidate Git SHA/tree, D-019 and READY deployment identity;
2. verify operator/browser isolation and approved D-024 working/recovery location;
3. only then export one point-in-time stable-v1 backup and record non-sensitive identity metadata;
4. preflight and restore;
5. reconcile exact structure and finance before any classification/business mutation;
6. prove D-018 checkpoint and D-024 write-block/setup/current recovery health;
7. capture rollback-baseline V2 backup;
8. perform minimum beta-only operator acceptance checks;
9. prove final V2 backup fresh-context round-trip with identical business data;
10. dispose beta-specific copied data within 24 hours and record sanitized evidence.

Any objective mismatch or contract violation is `NO-GO` and blocks acceptance.

A P10-S2-I1 PASS authorizes only defining the later production-cutover gate. It does not authorize cutover itself.

### Later P10 work

**Status:** `NOT_AUTHORIZED`.

Final write freeze, V2 publication from `main`, canonical URL switch, production restore/migration, V2 production writes, post-production rollback policy and decommissioning of stable remain outside the current action and require later canonical acceptance.
