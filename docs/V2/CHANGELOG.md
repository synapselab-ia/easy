# Easy V2 — Changelog

This changelog records material V2 project-state changes rather than every code-line edit. Detailed implementation history remains available in Git/PR history, `STATUS.md`, `QA_LEDGER.md`, `DECISIONS.md` and phase-specific documents.

---

## 2026-08-18 — P9-S2 direct recovery-target evidence accepted and integrated

The direct recovery-target evidence intake is canonically accepted.

Store/operator evidence establishes:

- loss of up to **24 hours** of work is considered a solvable/acceptable recovery case;
- manual restoration on **any computer** is acceptable;
- Easy has **daily demand** and multi-day recovery is incompatible with current operation, but no numeric hour-based RTO was supplied and none is invented;
- **Google Drive** is an acceptable durable destination;
- a **local PC file** is acceptable for day-to-day speed/convenience;
- provider-operated remote recovery is not mandatory because operator-run recovery on another computer is acceptable.

The Google account connected to ChatGPT is not an Easy credential or Drive API authorization. Drive being an acceptable destination does not itself authorize direct Google API/OAuth integration. A local PC file is a convenience copy and is not automatically treated as off-device durability.

Persistent Critical QA **`32175718073`**, job **`95837062983`** — PASS on PR #35 merge ref `68d8252c83ebab927e3953c7a6380f8b0473e9f7`: 0 lint errors / 80 warnings, 43 Vitest files / 176 tests, 15/15 Playwright and production build PASS.

PR #35 was squash-merged into `develop` as `5bf83b6cc8b078858dcd26e5144285a7dd389d73`. The validated merge ref and integrated commit share tree `e1c32464b8260ae3b45094f20464ff3e5745687e`, proving exact content equivalence.

The evidence-availability blocker is closed. P9-S2 remains `IN_PROGRESS` because the mechanism decision is not yet executed. No mechanism was compared, ranked, selected or implemented; D-016 was not reopened; D-017/D-018 remain unchanged; no runtime/schema/backend/auth/cloud/live-sync or later P9 work occurred.

`NEXT_ACTION` advances only to the P9-S2 mechanism comparison/decision gate: compare the smallest mechanisms against the <=24-hour off-device recovery-copy target, manual-any-computer recovery procedure, daily-use continuity constraint and acceptable Drive/local destinations; explicitly keep/reopen D-016; select/record a mechanism and define a bounded implementation slice if needed. The comparison slice must not implement the mechanism.

---

## 2026-08-18 — P9-S2 recovery decision gate blocked on missing measurable store target

The first P9-S2 attempt executed evidence intake only. Existing direct evidence proved severe operating-PC-loss/manual-backup exposure but did not yet define acceptable copy age, recovery procedure, interruption expectation or destination/process constraints.

Missing evidence was treated as a blocker rather than permission to invent SLA/RPO/RTO or cloud requirements. Blocked-state Critical QA **`32168368086`**, job **`95813314347`** passed on PR #33. PR #33 integrated as `0017538b93c438f4374b1b2427222f27b9ef357d`; validated merge ref and integration share tree `bf7165121ec08cd91f38db05d887a505dba3dbee`.

---

## 2026-08-18 — P9-S1 evidence-backed prioritization completed

P9-S1 executed documentation/decision work only. D-023 accepted ranking: recovery durability 94/100, categories/reporting 83/100, exact correction microflows 70/100 and occurrence-date usability 69/100.

Persistent Critical QA **`32166330198`**, job **`95806665221`** passed on PR #31. PR #31 integrated as `3d99814c0f97dce640a91721fc68d33e79575cc3`; validated merge ref and integration share tree `15854ffa8b19395db3b255e056af6df4ce66f6ed`.

---

## 2026-08-18 — P8-S2 direct real-store validation completed; P8 closed

Direct stakeholder evidence established current non-concurrent PC-based operation, PDF/extract reseller sharing, manual JSON backup/portability, no mandatory trusted server integration and modest scale. It also confirmed severe device-loss/manual-backup exposure, item categories/category reporting needs and edit/correction friction. Delayed financial entry is already supported by `occurredAt`.

D-022 keeps D-016. Persistent Critical QA `32158395391`, job `95781056589` passed on PR #27. PR #27 integrated as `e05d5cb1b4b4c4d143afbad3677bb9a472088cfe`; canonical P8 closure integrated as `5bf1e44fed38909c2d5a5cf49b6ef985a1a45442`.

---

## 2026-08-18 — Initial P8-S2 validation blocked on missing evidence

The first P8-S2 attempt found no direct operator/interview/observation/SLA/security evidence. Missing evidence was treated as a blocker, not negative proof. `P8_EVIDENCE_REQUEST.md` was added; Critical QA `32152466007` passed.

---

## 2026-08-18 — P8-S1 repository-evidence discovery

P8-S1 inspected canonical documents, original prompts, historical PRDs, README and repository issues. Repository evidence did not prove a D-016 reopen trigger. D-021 was accepted. Critical QA `32149199373` and canonical closure `32150004427` passed.

---

## 2026-08-18 — P7 completed operational UX refinement

P7 resolved QG-011 through QG-015 under D-020. Final P7-S6 functional validation `32145620210` passed with 43/176 Vitest and 15/15 Playwright.

---

## 2026-08-17 — P6 repository-wide QA/deployment gate

P6 established `npm run qa:critical`, persistent CI and `quality -> build -> deploy` before GitHub Pages publication from `main`. D-019 accepted; functional validation `32064801009` and post-merge `32065713920` passed.

---

## 2026-08-17 — P5 backup/recovery foundation completed

P5-S1 established canonical logical `easy-backup` v2 with deep preflight and v1 normalization (`32058028793`). P5-S2 added validated checkpoint download plus verified atomic Dexie restore with rollback and migration/financial round-trip proof (`32060729538`). D-017/D-018 accepted.

---

## 2026-08-17 — P4 persistence architecture decision

D-016 accepted: keep V2 local-first/single-user on Dexie V4 unless direct requirements later prove a reopen trigger.

---

## 2026-08-17 — P3 financial dates/statements/aging completed

P3-S1 separated financial occurrence (`occurredAt`) from registration/audit time (`createdAt`) and migrated Dexie to V4 (`32052076684`). P3-S2 formalized opening → movements → closing statements, positive-reseller total debt and FIFO outstanding-debt aging (`32053837309`). D-014/D-015 accepted.

---

## 2026-08-17 — P2 audited correction/reversal completed

P2 preserved original financial history through audited reversal and atomic linked replacement correction. D-012/D-013 accepted; validations `32041280504` and `32042373332` passed.

---

## 2026-08-17 — P1 referential integrity and safe lifecycle completed

P1 introduced reversible reseller/item archival, strict active references for new activity and guarded destructive deletion while preserving historical rows. Validations `32037965651`, `32038951903` and `32039763539` passed.

---

## 2026-08-17 — P0 canonical V2 governance established

The V2 laboratory repository, branch roles, canonical document precedence and incremental/no-default-rewrite discipline were established. `main` is the stable reference; `develop` is the V2 integration branch.