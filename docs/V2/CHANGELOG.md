# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-20 — P10-S2 copied-live-data beta contract defined; D-028 accepted

The next fail-closed P10 boundary was defined without moving any live-store data and without changing runtime, schema, backup envelope, deployment configuration, `main` or D-016.

New authoritative contract: `docs/V2/P10_S2_BETA_GATE.md`.

D-028 establishes the copied-live-data beta as a **point-in-time, single-operator, isolated and disposable** non-production exercise. Stable remains the only authoritative production system throughout; beta state may never be synchronized or manually promoted back to stable.

Before any future real-data export, P10-S2-I1 must prove one exact D-019-passing Git SHA/tree, READY deployment identity, alias→deployment mapping when a mutable alias is used, trusted operator/browser isolation and an approved D-024 working/recovery location.

The source snapshot is identified through non-sensitive timestamp/file-size/SHA-256 metadata. Raw backups, identifiable screenshots/PDFs and transaction payloads are prohibited from Git/GitHub, CI artifacts, chat and canonical docs.

Reconciliation is exact and fail-closed. Before any beta business mutation, entity/type counts, IDs, references and stored business values must survive accepted v1→V2 normalization without unexplained differences. Gross orders, payments, signals, net movement, every reseller balance and aggregate positive debt must reconcile exactly; any displayed difference of R$ 0,01 is NO-GO.

D-018 checkpoint and D-024 blocking/setup/current-state proof are mandatory before beta writes. A post-reconciliation V2 backup becomes the rollback baseline. Minimum copied-data operator acceptance then requires unclassified-item gating, representative classification, one beta-only order, one D-026 correction, final V2 export and disposable fresh-context restore/re-export with identical business data.

Any mismatch, unexpected warning, isolation/data-boundary breach, D-024 bypass or stable-origin write is NO-GO. Beta-specific copied real data must be removed from operator-controlled locations within 24 hours after the gate is accepted, rejected or abandoned. Only sanitized metadata/hashes/counts/PASS-FAIL evidence remains canonical.

**Result:** P10-S2 contract is `DONE / ACCEPTED`; P10-S2-I1 copied-live-data execution is `NOT_STARTED`. No real store backup has been exported/imported yet. A future P10-S2-I1 PASS may authorize only defining the production-cutover gate, not cutover itself.

---

## 2026-08-19 / 2026-08-20 — P10-S1-I2 synthetic migration/recovery rehearsal passed; P10-S1 closed

P10-S1-I2 executed the bounded non-production rehearsal required by D-027 using synthetic data only.

Verified candidate: Vercel deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`, exact Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`, tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`.

Evidence-only PR #62 authoritative run `32298906351` / `96216688953` first passed ordinary D-019 and then the remote candidate rehearsal 1/1. It proved v1→v2 preflight/restore, checkpoint creation, expected normalization, no fabricated categories/history, D-024 blocking/setup, unclassified-item gating, representative classification/order/D-026 correction, V2 export and fresh-context restore/re-export with identical business data.

PR #62 was closed without merge. Canonical P10-S1 closure PR #63 then integrated docs-only state as `816794694d0a9b6c92da273a81ee745c2f53ecdc`, tree `417dd4097144d9f69124161b34747b3e81244ae7`.

**Result:** P10-S1 `DONE / ACCEPTED`; no live-store data moved.

---

## 2026-08-19 — P10-S1-I1 backup/correction compatibility hardened and integrated

P10-S1-I1 resolved the pre-cutover recovery blocker identified while defining D-027. Backup validation now accepts supported D-026 type/date/item-changing corrections while preserving D-025 same-item category snapshot semantics, bidirectional audit linkage, referenced-ID existence, chronology and target-shape validity.

The first D-019 `32292405631` / `96196002726` correctly blocked an over-broad implementation. Authoritative D-019 `32292888925` / `96197514379` then passed; PR #60 integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`, tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.

---

## 2026-08-19 — P10-S1 pre-cutover contract defined/integrated; D-027 accepted

D-027 established fail-closed P10 sequencing: no live-store movement or stable publication before backup/correction compatibility and a deployed synthetic rehearsal were proven.

Contract D-019 `32290159119` / `96188851730` passed; PR #58 integrated as `5c7a5dc23af435711059deff75cf7862972662a1`, tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

---

## 2026-08-19 — P9 closed

P9-S3 categories/reporting, P9-S4 D-026 correction and P9-S5 occurrence-date usability were completed/integrated. Final P9 closure PR #57 integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

Key proof:

- P9-S3-I3 category reporting: D-019 `32262877105` / `96100129962`, PR #48;
- P9-S4-I1 full-field audited correction: D-019 `32285620846` / `96174326588`, PR #54 integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`;
- P9-S5 occurrence-date usability: D-019 `32287018048` / `96178850066`, PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`.

---

## 2026-08-18 — P9-S1/P9-S2 and P8 completed

P8 direct-store evidence kept D-016 and confirmed recovery/category/correction needs. D-023 then ranked P9 work: recovery durability 94/100, categories/reporting 83/100, correction microflows 70/100, occurrence-date usability 69/100.

P9-S2 implemented D-024 synchronized recovery-copy folder + exact 24-hour freshness guard. Accepted D-019 `32180250834` / `95851336506`; PR #39 integrated as `7e20d50be357d0179adf0afe4894ddfebbeb2eb9`.

---

## 2026-08-17 — P0–P7 foundation completed

- P0 established canonical V2 governance, branch roles and document precedence.
- P1 introduced reversible reseller/item lifecycle and referential guards.
- P2 introduced audited reversal and atomic linked replacement correction.
- P3 separated `occurredAt`, formalized statements and FIFO aging.
- P4 accepted D-016 local-first/single-user topology pending direct reopen evidence.
- P5 accepted D-017/D-018 backup/restore foundation.
- P6 accepted D-019 `npm run qa:critical` and stronger eventual stable deployment sequencing.
- P7 completed evidence-backed operator UX refinement.
